"""Small deterministic seasonal scheduler. No optimization or hidden defaults."""

from dataclasses import dataclass
from datetime import date
from math import fsum
from typing import Mapping

from .batches import plan_batches
from .harvest import CropWeek, HarvestWeek, aggregate_crops, forecast_batch
from .occupancy import AllocatedBatch, AreaWeek, BedReservation, allocate_batches, weekly_area
from .seasonal_models import Bed, SeasonalProfile, SeasonalTarget, require_date


@dataclass(frozen=True)
class TargetOutcome:
    target_id: str
    profile_id: str
    unit: str
    requested: float
    achieved: float
    deficit: float
    surplus: float
    reasons: tuple[str, ...]


@dataclass(frozen=True)
class ScheduleResult:
    batches: tuple[AllocatedBatch, ...]
    forecasts: tuple[HarvestWeek, ...]
    crop_forecasts: tuple[CropWeek, ...]
    reservations: tuple[BedReservation, ...]
    area_weeks: tuple[AreaWeek, ...]
    outcomes: tuple[TargetOutcome, ...]
    warnings: tuple[str, ...]


def plan_season(targets: tuple[SeasonalTarget, ...], profiles: Mapping[str, SeasonalProfile],
                beds: tuple[Bed, ...], *, planning_start: date,
                existing_reservations: tuple[BedReservation, ...] = ()) -> ScheduleResult:
    require_date(planning_start)
    if len({t.id for t in targets}) != len(targets):
        raise ValueError("Duplicate target IDs")
    if any(key != value.crop.id for key, value in profiles.items()):
        raise ValueError("Profile mapping key must equal crop profile ID")
    if any(t.profile_id not in profiles for t in targets):
        raise ValueError("Unknown target profile")
    plans = tuple(p for target in targets for p in plan_batches(target, profiles[target.profile_id],
                                                              planning_start=planning_start))
    allocated = allocate_batches(plans, profiles, beds, existing_reservations)
    target_map = {t.id: t for t in targets}
    forecasts = tuple(row for batch in allocated if batch.plants for row in forecast_batch(
        profiles[batch.plan.profile_id], batch.plan.id, batch.plan.target_id, batch.plants,
        batch.plan.first_harvest, target_map[batch.plan.target_id].harvest_window, batch.plan.unit))
    outcomes = []
    for target in targets:
        achieved = fsum(row.credited_quantity for row in forecasts if row.target_id == target.id)
        deficit = max(0.0, target.quantity - achieved)
        # Remove floating-point residue only, not substantive deficits.
        if deficit <= 1e-12 * max(1.0, target.quantity):
            deficit = 0.0
        reasons = sorted({r for b in allocated if b.plan.target_id == target.id for r in b.reasons})
        outcomes.append(TargetOutcome(target.id, target.profile_id, target.unit, target.quantity,
                        achieved, deficit, max(0.0, achieved - target.quantity), tuple(reasons)))
    reservations = existing_reservations + tuple(r for b in allocated for r in b.reservations)
    warnings = tuple(sorted({w for plan in plans for w in plan.warnings}))
    return ScheduleResult(allocated, forecasts, aggregate_crops(forecasts), reservations,
                          weekly_area(plans, reservations, beds), tuple(outcomes), warnings)
