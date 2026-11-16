"""Shapely boundary. No repair, buffering, snapping or mutation of input objects."""
from dataclasses import dataclass
from shapely.geometry import Polygon
from shapely.validation import explain_validity
from .geometry import corners
from .models import BedGeometry, GeometryState, Parcel

# Numerical intersection-area tolerance, NOT a spatial snapping grid or clearance.
AREA_TOLERANCE_M2 = 1e-12
LENGTH_TOLERANCE_M = 1e-6  # For coordinate comparisons, not permission to cross boundaries.


@dataclass(frozen=True, slots=True)
class GeometryIssue:
    code: str
    object_ids: tuple[str, ...]
    message: str
    geometry_wkt: str | None = None


class GeometryValidationError(ValueError):
    def __init__(self, issues: tuple[GeometryIssue, ...]):
        self.issues = issues
        super().__init__("; ".join(f"{i.code} [{', '.join(i.object_ids)}]: {i.message}" for i in issues))


def parcel_polygon(parcel: Parcel) -> Polygon:
    return Polygon([(p.x, p.y) for p in parcel.outer],
                   [[(p.x, p.y) for p in hole] for hole in parcel.holes])


def bed_polygon(bed: BedGeometry) -> Polygon:
    return Polygon([(p.x, p.y) for p in corners(bed)])


def validate(state: GeometryState) -> tuple[GeometryIssue, ...]:
    parcel = parcel_polygon(state.parcel)
    if not parcel.is_valid or parcel.area <= 0:
        return (GeometryIssue("invalid_polygon", (state.parcel.object_id,), explain_validity(parcel), parcel.wkt),)
    issues = []
    polygons = []
    for bed in state.beds:
        polygon = bed_polygon(bed)
        if not polygon.is_valid or polygon.area <= 0:
            issues.append(GeometryIssue("invalid_bed", (bed.object_id,), explain_validity(polygon), polygon.wkt))
            continue
        polygons.append((bed, polygon))
        # covers includes legal boundary contact and excludes holes.
        if not parcel.covers(polygon):
            outside = polygon.difference(parcel)
            if outside.area > AREA_TOLERANCE_M2:
                issues.append(GeometryIssue("outside_parcel", (bed.object_id, state.parcel.object_id),
                                            "Bed crosses parcel boundary or hole", outside.wkt))
    for index, (first, a) in enumerate(polygons):
        for second, b in polygons[index + 1:]:
            intersection = a.intersection(b)
            if intersection.area > AREA_TOLERANCE_M2:
                issues.append(GeometryIssue("bed_overlap", (first.object_id, second.object_id),
                                            "Positive-area bed intersection", intersection.wkt))
    return tuple(issues)


def require_valid(state: GeometryState) -> None:
    issues = validate(state)
    if issues:
        raise GeometryValidationError(issues)
