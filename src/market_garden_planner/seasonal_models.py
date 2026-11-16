"""Explicit seasonal inputs. Date intervals are always [start, end)."""

from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal

from .models import AgronomicFact, AgronomicParameter, CropProfile, Status, finite_number


def whole_days(parameter: AgronomicParameter, name: str) -> None:
    if parameter.unit != "d":
        raise ValueError(f"{name}: unit d required")
    if parameter.value is not None and int(parameter.value) != parameter.value:
        raise ValueError(f"{name}: whole days required")


def require_date(value: date) -> None:
    if not isinstance(value, date) or isinstance(value, datetime):
        raise ValueError("A calendar date without time is required")


@dataclass(frozen=True)
class DateWindow:
    start: date
    end: date

    def __post_init__(self):
        require_date(self.start)
        require_date(self.end)
        if self.end <= self.start:
            raise ValueError("Date window end must be after start")

    def contains(self, day: date) -> bool:
        return self.start <= day < self.end

    def overlaps(self, other: "DateWindow") -> bool:
        return self.start < other.end and other.start < self.end


@dataclass(frozen=True)
class SeasonWindow:
    window: DateWindow
    source: str
    status: Status

    def __post_init__(self):
        AgronomicFact(f"{self.window.start}/{self.window.end}", "date_interval", self.source,
                      self.status, "Explicit seasonal window")


@dataclass(frozen=True)
class YieldPeriod:
    """Offset from first harvest; duration 0 is a point harvest.

    For duration > 0, amount is a TOTAL per plant across the period, distributed
    uniformly by calendar day. A weekly bin therefore has duration 7, not a rate.
    """

    offset_days: AgronomicParameter
    duration_days: AgronomicParameter
    amount_per_plant: AgronomicParameter

    def __post_init__(self):
        whole_days(self.offset_days, "offset_days")
        whole_days(self.duration_days, "duration_days")
        if self.amount_per_plant.unit not in {"kg/plant", "pieces/plant"}:
            raise ValueError("Yield amount unit must be kg/plant or pieces/plant")


@dataclass(frozen=True)
class SeasonalProfile:
    crop: CropProfile
    harvest_mode: Literal["single", "continuous", "multicut", "storage"]
    field_days_to_first_harvest: AgronomicParameter
    nursery_days: AgronomicParameter
    cleanup_days: AgronomicParameter
    yield_periods: tuple[YieldPeriod, ...]
    sowing_windows: tuple[SeasonWindow, ...] | None = None
    planting_windows: tuple[SeasonWindow, ...] | None = None

    def __post_init__(self):
        if self.harvest_mode not in {"single", "continuous", "multicut", "storage"}:
            raise ValueError("Unknown harvest mode")
        for name in ("field_days_to_first_harvest", "nursery_days", "cleanup_days"):
            whole_days(getattr(self, name), name)
        if self.crop.establishment == "direct" and self.nursery_days.value not in (None, 0):
            raise ValueError("Direct sowing cannot have nursery days")
        if not isinstance(self.yield_periods, tuple) or any(not isinstance(p, YieldPeriod) for p in self.yield_periods):
            raise ValueError("Yield periods must be a tuple of YieldPeriod")
        for windows in (self.sowing_windows, self.planting_windows):
            if windows is not None and (not isinstance(windows, tuple) or any(not isinstance(w, SeasonWindow) for w in windows)):
                raise ValueError("Season windows must be tuples or None")


@dataclass(frozen=True)
class SeasonalTarget:
    id: str
    profile_id: str
    quantity: float
    unit: Literal["kg", "pieces"]
    harvest_window: DateWindow
    succession_days: int
    bed_width_m: float
    bed_length_m: float
    first_harvest_on: date | None = None

    def __post_init__(self):
        if not self.id or not self.profile_id:
            raise ValueError("Target and profile IDs required")
        finite_number(self.quantity, "quantity")
        if self.unit not in {"kg", "pieces"}:
            raise ValueError("Seasonal target unit must be kg or pieces")
        if self.unit == "pieces" and self.quantity != int(self.quantity):
            raise ValueError("Piece targets require whole pieces")
        if type(self.succession_days) is not int or self.succession_days <= 0:
            raise ValueError("Positive whole-day succession interval required")
        finite_number(self.bed_width_m, "bed_width_m", positive=True)
        finite_number(self.bed_length_m, "bed_length_m", positive=True)
        if self.first_harvest_on is not None:
            require_date(self.first_harvest_on)
            if self.first_harvest_on >= self.harvest_window.end:
                raise ValueError("First harvest must precede target window end")


@dataclass(frozen=True)
class Bed:
    id: str
    width_m: float
    length_m: float

    def __post_init__(self):
        if not self.id:
            raise ValueError("Bed ID required")
        finite_number(self.width_m, "width_m", positive=True)
        finite_number(self.length_m, "length_m", positive=True)

    @property
    def area_m2(self) -> float:
        return self.width_m * self.length_m
