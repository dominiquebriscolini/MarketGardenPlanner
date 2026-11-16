"""Deterministic succession splitting and backward calculation of dates."""

from dataclasses import dataclass
from datetime import date

from .calculator import MissingAgronomicData, _ceil, calculate
from .harvest import DAY, harvest_end, validate_yield, yield_per_plant
from .models import ProductionTarget
from .seasonal_models import DateWindow, SeasonalProfile, SeasonalTarget, require_date


@dataclass(frozen=True)
class BatchPlan:
    id: str
    target_id: str
    profile_id: str
    requested_quantity: float
    unit: str
    plants: int
    sowing_date: date
    transplant_date: date | None
    first_harvest: date
    harvest_end: date
    occupancy: DateWindow
    required_area_m2: float
    feasible: bool
    reasons: tuple[str, ...]
    warnings: tuple[str, ...]


def plan_batches(target: SeasonalTarget, profile: SeasonalProfile, *, planning_start: date) -> tuple[BatchPlan, ...]:
    require_date(planning_start)
    if target.profile_id != profile.crop.id:
        raise ValueError("Target/profile mismatch")
    if target.quantity == 0:
        return ()
    validate_yield(profile, target.unit)
    names = ["field_days_to_first_harvest", "cleanup_days"]
    if profile.crop.establishment == "transplant":
        names.append("nursery_days")
    missing = tuple(name for name in names if getattr(profile, name).value is None)
    if missing:
        raise MissingAgronomicData(profile.crop.id, ("batch_dates",), missing)
    anchors = []
    anchor = target.first_harvest_on or target.harvest_window.start
    while anchor < target.harvest_window.end:
        anchors.append(anchor)
        anchor += target.succession_days * DAY
    if target.unit == "pieces":
        base, remainder = divmod(int(target.quantity), len(anchors))
        shares = [base + (i < remainder) for i in range(len(anchors))]
    else:
        shares = [target.quantity / len(anchors)] * len(anchors)
    plans = []
    parameters = [(name, getattr(profile, name)) for name in names]
    for i, p in enumerate(profile.yield_periods):
        parameters.extend((f"yield_periods[{i}].{name}", getattr(p, name))
                          for name in ("offset_days", "duration_days", "amount_per_plant"))
    warnings = [f"{name}: {p.status} ({p.source})" for name, p in parameters if p.status != "verified"]
    for name in ("sowing_windows", "planting_windows"):
        windows = getattr(profile, name)
        if windows is None:
            warnings.append(f"{name}: not supplied; seasonal suitability not checked")
        else:
            warnings.extend(f"{name}: {w.status} ({w.source})" for w in windows if w.status != "verified")
    for index, (anchor, share) in enumerate(zip(anchors, shares), 1):
        if share == 0:
            continue
        per_plant = yield_per_plant(profile, anchor, target.harvest_window)
        reasons = []
        plants = _ceil(share / per_plant) if per_plant > 0 else 0
        if per_plant <= 0:
            reasons.append("time:no_yield_in_target_window")
        field_start = anchor - int(profile.field_days_to_first_harvest.value) * DAY
        transplant = field_start if profile.crop.establishment == "transplant" else None
        sowing = field_start - int(profile.nursery_days.value) * DAY if transplant is not None else field_start
        if sowing < planning_start:
            reasons.append("time:sowing_before_planning_start")
        if profile.sowing_windows is not None and not any(w.window.contains(sowing) for w in profile.sowing_windows):
            reasons.append("time:outside_sowing_window")
        if profile.planting_windows is not None and not any(w.window.contains(field_start) for w in profile.planting_windows):
            reasons.append("time:outside_planting_window")
        end = harvest_end(profile, anchor)
        occupancy = DateWindow(field_start, end + int(profile.cleanup_days.value) * DAY)
        core = calculate(profile.crop, ProductionTarget(profile.crop.id, plants, "plants",
                         target.bed_width_m, target.bed_length_m), required_outputs=("allocated_bed_area_m2",))
        core_warnings = set(core.warnings) | {f"core_input_missing:{name}" for name in core.missing}
        plans.append(BatchPlan(f"{target.id}:{index}", target.id, profile.crop.id, share, target.unit,
                              plants, sowing, transplant, anchor, end, occupancy,
                              core.allocated_bed_area_m2, not reasons, tuple(reasons),
                              tuple(sorted(set(warnings) | core_warnings))))
    return tuple(plans)
