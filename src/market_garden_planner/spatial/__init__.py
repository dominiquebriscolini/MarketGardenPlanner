"""Optional spatial core. Install market-garden-planner[geometry] to use it."""
from .models import BedGeometry, CoordinateFrame, GeometryState, Parcel, Point, new_id
from .geometry import corners
from .validation import GeometryIssue, GeometryValidationError, require_valid, validate
from .changes import resize_bed_width
from .serialization import dumps, loads, geometry_token
from .adapters import scheduler_beds

__all__ = ["BedGeometry", "CoordinateFrame", "GeometryState", "Parcel", "Point", "new_id",
           "corners", "GeometryIssue", "GeometryValidationError", "require_valid", "validate",
           "resize_bed_width", "dumps", "loads", "geometry_token", "scheduler_beds"]
