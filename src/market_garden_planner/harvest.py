"""Yield integration and weekly forecasts, independent of batch allocation."""

from dataclasses import dataclass
from datetime import date, timedelta
from math import fsum

from .calculator import MissingAgronomicData
from .seasonal_models import DateWindow, SeasonalProfile

DAY = timedelta(days=1)


def validate_yield(profile: SeasonalProfile, unit: str) -> None:
    missing = []
    if not profile.yield_periods:
        missing.append("yield_periods")
    for i, period in enumerate(profile.yield_periods):
        for name in ("offset_days", "duration_days", "amount_per_plant"):
            if getattr(period, name).value is None:
                missing.append(f"yield_periods[{i}].{name}")
        if period.amount_per_plant.unit != f"{unit}/plant":
            raise ValueError("Target and yield profile units differ")
    if missing:
        raise MissingAgronomicData(profile.crop.id, ("harvest_forecast",), tuple(missing))
    periods = profile.yield_periods
    if profile.harvest_mode in {"single", "storage"}:
        if len(periods) != 1 or periods[0].offset_days.value != 0 or periods[0].duration_days.value != 0:
            raise ValueError("Single/storage harvest requires one point at offset zero")
    elif profile.harvest_mode == "multicut":
        offsets = [p.offset_days.value for p in periods]
        if offsets[0] != 0 or offsets != sorted(set(offsets)) or any(p.duration_days.value != 0 for p in periods):
            raise ValueError("Cuts require unique ordered point offsets starting at zero")
    else:
        end = 0
        for period in periods:
            if period.offset_days.value != end or period.duration_days.value <= 0:
                raise ValueError("Continuous yield periods must cover a contiguous horizon from day zero")
            end += int(period.duration_days.value)


def yield_per_plant(profile: SeasonalProfile, first_harvest: date, window: DateWindow) -> float:
    """Integrate only explicitly supplied periods intersecting the window."""
    validate_yield(profile, profile.yield_periods[0].amount_per_plant.unit.split("/")[0]
                   if profile.yield_periods else "kg")
    parts = []
    for p in profile.yield_periods:
        start = first_harvest + int(p.offset_days.value) * DAY
        duration = int(p.duration_days.value)
        if duration == 0:
            parts.append(p.amount_per_plant.value if window.contains(start) else 0)
        else:
            days = max(0, (min(start + duration * DAY, window.end) - max(start, window.start)).days)
            parts.append(p.amount_per_plant.value * days / duration)
    return fsum(parts)


def harvest_end(profile: SeasonalProfile, first_harvest: date) -> date:
    """Exclusive end, including the day of the last point harvest."""
    return max(first_harvest + (int(p.offset_days.value) + max(1, int(p.duration_days.value))) * DAY
               for p in profile.yield_periods)


def monday(day: date) -> date:
    return day - timedelta(days=day.weekday())


@dataclass(frozen=True)
class HarvestWeek:
    week_start: date
    crop_id: str
    batch_id: str
    target_id: str
    unit: str
    quantity: float
    credited_quantity: float


@dataclass(frozen=True)
class CropWeek:
    week_start: date
    crop_id: str
    unit: str
    quantity: float
    credited_quantity: float


def forecast_batch(profile: SeasonalProfile, batch_id: str, target_id: str, plants: int,
                   first_harvest: date, target_window: DateWindow, unit: str) -> tuple[HarvestWeek, ...]:
    validate_yield(profile, unit)
    rows = []
    week = monday(first_harvest)
    end = harvest_end(profile, first_harvest)
    while week < end:
        window = DateWindow(week, week + 7 * DAY)
        quantity = plants * yield_per_plant(profile, first_harvest, window)
        a, b = max(week, target_window.start), min(window.end, target_window.end)
        credited = plants * yield_per_plant(profile, first_harvest, DateWindow(a, b)) if a < b else 0.0
        rows.append(HarvestWeek(week, profile.crop.species_id, batch_id, target_id, unit, quantity, credited))
        week += 7 * DAY
    return tuple(rows)


def aggregate_crops(rows: tuple[HarvestWeek, ...]) -> tuple[CropWeek, ...]:
    groups = {}
    for row in rows:
        groups.setdefault((row.week_start, row.crop_id, row.unit), []).append(row)
    return tuple(CropWeek(*key, fsum(r.quantity for r in values), fsum(r.credited_quantity for r in values))
                 for key, values in sorted(groups.items()))
