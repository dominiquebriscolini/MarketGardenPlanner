"""Immutable metric geometry values. No SVG, Shapely or agronomy imports."""
from dataclasses import dataclass, field
from math import isfinite
from uuid import UUID, uuid4


def new_id() -> str:
    return str(uuid4())


def require_uuid(value: str) -> None:
    if not isinstance(value, str) or str(UUID(value)) != value:
        raise ValueError("Canonical UUID string required")


def number(value: float, name: str, *, positive: bool = False) -> None:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value):
        raise ValueError(f"{name}: finite number required")
    if positive and value <= 0:
        raise ValueError(f"{name}: positive value required")


def metadata(value) -> None:
    require_uuid(value.object_id)
    require_uuid(value.revision_id)
    if value.origin not in ("existing", "manual", "generated"):
        raise ValueError("Unknown geometry origin")
    if not isinstance(value.name, str):
        raise ValueError("Name must be a string")
    if type(value.geometry_locked) is not bool or type(value.generation_protected) is not bool:
        raise ValueError("Locks must be booleans")
    if value.source_reference is not None and not isinstance(value.source_reference, str):
        raise ValueError("Source reference must be a string or null")


@dataclass(frozen=True, slots=True)
class Point:
    x: float
    y: float

    def __post_init__(self):
        number(self.x, "x")
        number(self.y, "y")


@dataclass(frozen=True, slots=True)
class CoordinateFrame:
    unit: str = "m"
    x_axis: str = "east"
    y_axis: str = "north"
    angle: str = "ccw_degrees"

    def __post_init__(self):
        if (self.unit, self.x_axis, self.y_axis, self.angle) != ("m", "east", "north", "ccw_degrees"):
            raise ValueError("Only the local metric east/north frame is supported")


def ring(value) -> None:
    if not isinstance(value, tuple) or len(value) < 4 or any(not isinstance(p, Point) for p in value):
        raise ValueError("Ring requires an immutable tuple of at least four Points")
    if value[0] != value[-1] or len(set(value[:-1])) < 3:
        raise ValueError("Ring must be explicitly closed with at least three distinct vertices")


@dataclass(frozen=True, slots=True)
class Parcel:
    object_id: str
    outer: tuple[Point, ...]
    holes: tuple[tuple[Point, ...], ...] = ()
    revision_id: str = field(default_factory=new_id)
    name: str = ""
    origin: str = "manual"
    geometry_locked: bool = False
    generation_protected: bool = False
    source_reference: str | None = None

    def __post_init__(self):
        metadata(self)
        ring(self.outer)
        if not isinstance(self.holes, tuple):
            raise ValueError("Holes must be an immutable tuple")
        for hole in self.holes:
            ring(hole)


@dataclass(frozen=True, slots=True)
class BedGeometry:
    object_id: str
    parcel_id: str
    center: Point
    width_m: float
    length_m: float
    rotation_deg: float = 0
    revision_id: str = field(default_factory=new_id)
    name: str = ""
    origin: str = "manual"
    geometry_locked: bool = False
    generation_protected: bool = False
    source_reference: str | None = None

    def __post_init__(self):
        metadata(self)
        require_uuid(self.parcel_id)
        if not isinstance(self.center, Point):
            raise ValueError("Center must be a Point")
        number(self.width_m, "width_m", positive=True)
        number(self.length_m, "length_m", positive=True)
        number(self.width_m * self.length_m, "bed area", positive=True)
        number(self.rotation_deg, "rotation_deg")
        if not 0 <= self.rotation_deg < 360:
            raise ValueError("Rotation must already be in [0, 360); no implicit normalization")

    @property
    def area_m2(self) -> float:
        return self.width_m * self.length_m


@dataclass(frozen=True, slots=True)
class GeometryState:
    parcel: Parcel
    beds: tuple[BedGeometry, ...]
    frame: CoordinateFrame = field(default_factory=CoordinateFrame)
    revision_id: str = field(default_factory=new_id)

    def __post_init__(self):
        require_uuid(self.revision_id)
        if not isinstance(self.parcel, Parcel) or not isinstance(self.frame, CoordinateFrame):
            raise ValueError("Parcel and CoordinateFrame required")
        if not isinstance(self.beds, tuple) or any(not isinstance(b, BedGeometry) for b in self.beds):
            raise ValueError("Beds must be an immutable tuple of BedGeometry")
        ids = [self.parcel.object_id] + [b.object_id for b in self.beds]
        if len(set(ids)) != len(ids):
            raise ValueError("Duplicate spatial object IDs")
        if any(b.parcel_id != self.parcel.object_id for b in self.beds):
            raise ValueError("Bed references unknown parcel")
