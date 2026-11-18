"""Whole-bed first-fit allocation, overlap checks and weekly peak areas."""

from dataclasses import dataclass
from datetime import date
from math import fsum
from typing import Mapping

from .batches import BatchPlan
from .calculator import MissingAgronomicData, _floor, calculate
from .harvest import DAY, monday
from .models import CropProfile, ProductionTarget
from .seasonal_models import Bed, DateWindow, SeasonalProfile


@dataclass(frozen=True)
class BedReservation:
    bed_id: str
    batch_id: str
    window: DateWindow
    plants: int

    def __post_init__(self):
        if not self.bed_id or not self.batch_id or type(self.plants) is not int or self.plants <= 0:
            raise ValueError("Reservation requires IDs and positive whole plant count")


@dataclass(frozen=True)
class OccupancyConflict:
    bed_id: str
    first_batch_id: str
    second_batch_id: str
    window: DateWindow


def find_overlaps(reservations: tuple[BedReservation, ...]) -> tuple[OccupancyConflict, ...]:
    conflicts = []
    for index, first in enumerate(reservations):
        for second in reservations[index + 1:]:
            if first.bed_id == second.bed_id and first.window.overlaps(second.window):
                conflicts.append(OccupancyConflict(first.bed_id, first.batch_id, second.batch_id,
                    DateWindow(max(first.window.start, second.window.start), min(first.window.end, second.window.end))))
    return tuple(conflicts)


@dataclass(frozen=True)
class PlantingGrid:
    rows: int
    positions_per_row: int
    row_spacing_m: float
    plant_spacing_m: float

    @property
    def capacity(self) -> int:
        return self.rows * self.positions_per_row


def planting_grid(profile: CropProfile, width_m: float, length_m: float) -> PlantingGrid:
    row_spacing, plant_spacing = profile.row_spacing.value, profile.plant_spacing.value
    missing = tuple(name for name, value in (("plant_spacing", plant_spacing), ("row_spacing", row_spacing))
                    if value is None)
    if missing:
        raise MissingAgronomicData(profile.id, ("bed_capacity",), missing)
    rows = 0 if width_m < row_spacing else _floor(width_m / row_spacing)
    positions = 0 if length_m < plant_spacing else _floor(length_m / plant_spacing)
    return PlantingGrid(rows, positions, row_spacing, plant_spacing)


def bed_capacity(profile: SeasonalProfile, bed: Bed) -> int:
    return planting_grid(profile.crop, bed.width_m, bed.length_m).capacity


@dataclass(frozen=True)
class AllocatedBatch:
    plan: BatchPlan
    plants: int
    reservations: tuple[BedReservation, ...]
    allocated_area_m2: float
    unused_area_m2: float
    reasons: tuple[str, ...]


def allocate_batches(plans: tuple[BatchPlan, ...], profiles: Mapping[str, SeasonalProfile],
                     beds: tuple[Bed, ...], existing: tuple[BedReservation, ...] = ()) -> tuple[AllocatedBatch, ...]:
    bed_map = {bed.id: bed for bed in beds}
    if len(bed_map) != len(beds):
        raise ValueError("Duplicate bed IDs")
    ids = {p.id for p in plans}
    if len(ids) != len(plans) or any(r.batch_id in ids for r in existing):
        raise ValueError("Duplicate/colliding batch IDs")
    if any(r.bed_id not in bed_map for r in existing):
        raise ValueError("Reservation references unknown bed")
    if find_overlaps(existing):
        raise ValueError("Existing bed reservations overlap")
    booked = list(existing)
    result = []
    # Date order; caller order is the stable tie-breaker. No date shifting/retry.
    for plan in sorted(plans, key=lambda p: p.occupancy.start):
        reasons = list(plan.reasons)
        assigned = []
        allocated = 0
        unused = 0.0
        if plan.feasible:
            profile = profiles[plan.profile_id]
            for bed in beds:
                if allocated >= plan.plants:
                    break
                if any(r.bed_id == bed.id and r.window.overlaps(plan.occupancy) for r in booked):
                    continue
                capacity = bed_capacity(profile, bed)
                if capacity == 0:
                    continue
                count = min(capacity, plan.plants - allocated)
                reservation = BedReservation(bed.id, plan.id, plan.occupancy, count)
                assigned.append(reservation)
                booked.append(reservation)
                allocated += count
                core = calculate(profile.crop, ProductionTarget(profile.crop.id, count, "plants", bed.width_m,
                                 bed.length_m), required_outputs=("bed_area_m2",))
                unused += max(0.0, bed.area_m2 - core.bed_area_m2)
            if allocated < plan.plants:
                reasons.append("area:insufficient_available_bed_capacity")
        result.append(AllocatedBatch(plan, allocated, tuple(assigned),
                      fsum(bed_map[r.bed_id].area_m2 for r in assigned), unused, tuple(reasons)))
    return tuple(result)


@dataclass(frozen=True)
class AreaWeek:
    week_start: date
    required_peak_m2: float
    reserved_peak_m2: float


def weekly_area(plans: tuple[BatchPlan, ...], reservations: tuple[BedReservation, ...],
                beds: tuple[Bed, ...]) -> tuple[AreaWeek, ...]:
    """Maximum simultaneous area per calendar week, including cleanup days.

    Requirements include time-rejected plans, so infeasibility is visible.
    Pre-existing reservations count towards both demand and reserved area.
    """
    bed_map = {b.id: b for b in beds}
    if len(bed_map) != len(beds) or any(r.bed_id not in bed_map for r in reservations):
        raise ValueError("Invalid bed IDs")
    plan_ids = {p.id for p in plans}
    legacy = tuple(r for r in reservations if r.batch_id not in plan_ids)
    windows = [p.occupancy for p in plans] + [r.window for r in reservations]
    if not windows:
        return ()
    day = monday(min(w.start for w in windows))
    end = max(w.end for w in windows)
    groups = {}
    while day < end:
        demand = fsum(p.required_area_m2 for p in plans if p.occupancy.contains(day))
        demand += fsum(bed_map[r.bed_id].area_m2 for r in legacy if r.window.contains(day))
        reserved = fsum(bed_map[r.bed_id].area_m2 for r in reservations if r.window.contains(day))
        key = monday(day)
        old = groups.get(key, (0.0, 0.0))
        groups[key] = max(old[0], demand), max(old[1], reserved)
        day += DAY
    return tuple(AreaWeek(week, *values) for week, values in sorted(groups.items()))
