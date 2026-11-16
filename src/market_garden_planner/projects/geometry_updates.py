"""Server-owned revisions and lock policy around the central spatial model."""
from dataclasses import replace
import json
from ..spatial import GeometryState, Point, dumps, loads, new_id, require_valid, resize_bed_width
from .errors import ProjectError


def reconcile(previous: GeometryState, candidate: GeometryState, *, allow_add=False) -> GeometryState:
    require_valid(candidate)
    old_ids = {b.object_id for b in previous.beds}
    new_ids = {b.object_id for b in candidate.beds}
    identities_valid = (old_ids < new_ids and len(new_ids - old_ids) == 1) if allow_add else old_ids == new_ids
    if previous.parcel.object_id != candidate.parcel.object_id or not identities_valid:
        raise ProjectError("identity_change", "Existing parcel/bed IDs must be retained; use the dedicated bed creation endpoint to add a bed")
    parcel = replace(candidate.parcel, revision_id=previous.parcel.revision_id)
    if previous.parcel.geometry_locked and (parcel.outer, parcel.holes) != (previous.parcel.outer, previous.parcel.holes):
        raise ProjectError("geometry_locked", "Parcel is locked", object_ids=[parcel.object_id])
    if parcel != previous.parcel:
        parcel = replace(parcel, revision_id=new_id())
    old = {b.object_id: b for b in previous.beds}
    beds = []
    for incoming in candidate.beds:
        if incoming.object_id not in old:
            beds.append(replace(incoming, revision_id=new_id()))
            continue
        before = old[incoming.object_id]
        bed = replace(incoming, revision_id=before.revision_id)
        geometry_changed = (bed.center, bed.width_m, bed.length_m, bed.rotation_deg) != (before.center, before.width_m, before.length_m, before.rotation_deg)
        if before.geometry_locked and geometry_changed:
            raise ProjectError("geometry_locked", "Bed is locked; unlock in a separate save first", object_ids=[bed.object_id])
        beds.append(before if bed == before else replace(bed, revision_id=new_id()))
    result = GeometryState(parcel, tuple(beds), candidate.frame, previous.revision_id)
    return previous if result == previous else replace(result, revision_id=new_id())


def append_bed(state: GeometryState, bed: dict) -> GeometryState:
    """Use the strict existing JSON reader and Shapely validation, without repair."""
    raw = json.loads(dumps(state))
    raw["beds"].append(bed)
    return loads(json.dumps(raw, allow_nan=False))


def patch_bed(state: GeometryState, bed_id: str, changes: dict) -> GeometryState:
    allowed = {"center", "width_m", "length_m", "rotation_deg", "anchor"}
    if not isinstance(changes, dict) or not changes or set(changes) - allowed:
        raise ProjectError("invalid_fields", "Expected center, width_m, length_m or rotation_deg")
    bed = next((b for b in state.beds if b.object_id == bed_id), None)
    if bed is None:
        raise ProjectError("bed_not_found", "Bed not found in project", 404)
    if set(changes) <= {"width_m", "anchor"} and "width_m" in changes:
        return resize_bed_width(state, bed_id, changes["width_m"], anchor=changes.get("anchor", "center"))
    if "anchor" in changes:
        raise ProjectError("invalid_fields", "anchor is only valid for a width-only change")
    values = dict(changes)
    if "center" in values:
        center = values["center"]
        if not isinstance(center, dict) or set(center) != {"x", "y"}:
            raise ProjectError("invalid_fields", "center requires exactly x and y")
        values["center"] = Point(**center)
    changed = replace(bed, **values)
    return reconcile(state, replace(state, beds=tuple(changed if b.object_id == bed_id else b for b in state.beds)))
