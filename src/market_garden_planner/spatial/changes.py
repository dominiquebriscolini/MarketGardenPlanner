"""Atomic immutable local width changes; no scheduler invocation."""
from dataclasses import replace
from math import cos, sin, radians
from .models import GeometryState, Point, new_id, number
from .validation import GeometryIssue, GeometryValidationError, require_valid


def resize_bed_width(state: GeometryState, object_id: str, width_m: float, *,
                     anchor: str = "center", expected_revision_id: str | None = None) -> GeometryState:
    require_valid(state)
    if expected_revision_id is not None and expected_revision_id != state.revision_id:
        raise GeometryValidationError((GeometryIssue("revision_conflict", (object_id,), "Stale geometry revision"),))
    number(width_m, "width_m", positive=True)
    if anchor not in ("center", "negative_edge", "positive_edge"):
        raise ValueError("Unknown width anchor")
    bed = next((b for b in state.beds if b.object_id == object_id), None)
    if bed is None:
        raise GeometryValidationError((GeometryIssue("unknown_bed", (object_id,), "Bed not found"),))
    if bed.geometry_locked:
        raise GeometryValidationError((GeometryIssue("geometry_locked", (object_id,), "Explicit unlock required"),))
    if width_m == bed.width_m:
        return state
    offset = (width_m - bed.width_m) / 2 * {"center": 0, "negative_edge": 1, "positive_edge": -1}[anchor]
    angle = radians(bed.rotation_deg)
    center = Point(bed.center.x + offset * cos(angle), bed.center.y + offset * sin(angle))
    changed = replace(bed, width_m=width_m, center=center, revision_id=new_id())
    candidate = replace(state, beds=tuple(changed if b.object_id == object_id else b for b in state.beds),
                        revision_id=new_id())
    require_valid(candidate)
    return candidate
