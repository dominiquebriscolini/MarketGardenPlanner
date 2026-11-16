"""Explicit read-only conversion of the synthetic SVG demo, never called by its API."""
from math import cos, sin, radians
import json
from uuid import UUID, uuid5
from .models import BedGeometry, GeometryState, Parcel, Point
from .validation import require_valid

DEMO_NAMESPACE = UUID("df3ebd38-b878-4c5e-afbf-f5ca97494860")


def demo_identity(legacy_id: str) -> str:
    return str(uuid5(DEMO_NAMESPACE, legacy_id))


def migrate_svg_demo(geometry: dict) -> GeometryState:
    if geometry["unit"] != "m":
        raise ValueError("Demo coordinates must be in metres")
    parcel_id = demo_identity("parcel")
    def initial_revision(kind, data):
        return demo_identity("revision:" + kind + ":" + json.dumps(data, sort_keys=True, allow_nan=False))
    outer = tuple(Point(x, -y) for x, y in geometry["boundary"])
    # Old SVG polygon syntax has implicit closure; conversion makes it explicit.
    if outer and outer[0] != outer[-1]:
        outer += (outer[0],)
    parcel = Parcel(parcel_id, outer, name="SYNTHETIC demo parcel", origin="existing",
                    revision_id=initial_revision("parcel", geometry["boundary"]),
                    generation_protected=True, source_reference="SYNTHETIC prototype/demo.py")
    beds = []
    for old in geometry["beds"]:
        angle = radians(old["angle"])
        # Transform the actual SVG rectangle center about its top-left pivot first.
        cx = old["x"] + cos(angle) * old["width"] / 2 - sin(angle) * old["length"] / 2
        cy = old["y"] + sin(angle) * old["width"] / 2 + cos(angle) * old["length"] / 2
        beds.append(BedGeometry(demo_identity(old["id"]), parcel_id, Point(cx, -cy),
                                old["width"], old["length"], (-old["angle"]) % 360,
                                revision_id=initial_revision("bed", old),
                                name=old["id"], origin="existing", generation_protected=True,
                                source_reference="SYNTHETIC prototype/demo.py"))
    state = GeometryState(parcel, tuple(beds), revision_id=initial_revision("state", geometry))
    require_valid(state)
    return state
