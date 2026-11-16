"""Pure calculations; no file access, Rhino, Grasshopper or scheduling."""

from dataclasses import dataclass
from math import ceil, floor, ulp

from .models import CropProfile, ProductionTarget


@dataclass(frozen=True)
class CalculationResult:
    plants: int | None
    seeds: int | None
    seed_mass_g: float | None
    row_metres: float | None
    rows_per_bed: int | None
    bed_area_m2: float | None
    beds: int | None
    allocated_bed_area_m2: float | None
    missing: tuple[str, ...]
    warnings: tuple[str, ...]


def _ceil(value: float) -> int:
    """Avoid a spurious extra unit from floating point round-off."""
    nearest = round(value)
    return nearest if nearest > 0 and abs(value - nearest) <= 4 * ulp(value) else ceil(value)


def _floor(value: float) -> int:
    nearest = round(value)
    return nearest if nearest > 0 and abs(value - nearest) <= 4 * ulp(value) else floor(value)


class MissingAgronomicData(ValueError):
    """A requested output cannot be calculated without explicit input data."""

    def __init__(self, profile_id: str, outputs: tuple[str, ...], parameters: tuple[str, ...]):
        self.profile_id = profile_id
        self.outputs = outputs
        self.parameters = parameters
        super().__init__(f"Fehlende agronomische Daten für {profile_id}: {', '.join(parameters)}; "
                         f"nicht berechenbar: {', '.join(outputs)}. Keine Ersatzwerte verwendet.")


def calculate(profile: CropProfile, target: ProductionTarget, *,
              required_outputs: tuple[str, ...] = ()) -> CalculationResult:
    """Return partial results, or raise explicitly for requested missing outputs."""
    allowed = {"plants", "seeds", "seed_mass_g", "row_metres", "rows_per_bed", "bed_area_m2",
               "beds", "allocated_bed_area_m2"}
    if any(name not in allowed for name in required_outputs):
        raise ValueError("Unknown required output")
    result = _calculate(profile, target)
    unavailable = tuple(name for name in required_outputs if getattr(result, name) is None)
    if unavailable:
        parameters = result.missing
        if not parameters:
            parameters = ("bed_length_m or applicable layout",)
        raise MissingAgronomicData(profile.id, unavailable, parameters)
    return result


def _calculate(profile: CropProfile, target: ProductionTarget) -> CalculationResult:
    if profile.id != target.profile_id:
        raise ValueError("Target/profile mismatch")
    missing: set[str] = set()
    warnings: set[str] = set()

    def get(name: str) -> float | None:
        p = getattr(profile, name)
        if p.value is None:
            missing.add(name)
        elif p.status != "verified":
            warnings.add(f"{name}: {p.status} ({p.source})")
        return p.value

    if target.quantity == 0:
        return CalculationResult(0, 0, 0.0, 0.0, None, 0.0, 0 if target.bed_length_m else None,
                                 0.0 if target.bed_length_m else None, (), ())

    y = get("yield_per_plant") if target.unit == "kg" else None
    plants = _ceil(target.quantity / y) if y is not None else (
        _ceil(target.quantity) if target.unit == "plants" else None)
    seeds = None
    seed_mass = None
    row_metres = None
    rows = None
    area = None
    beds = None
    allocated_area = None
    if plants is not None:
        germination = get("germination_rate")
        establishment = get("establishment_rate")
        if germination is not None and establishment is not None:
            seeds = _ceil(plants / (germination * establishment))
            seeds_per_gram = get("seeds_per_gram")
            if seeds_per_gram is not None:
                seed_mass = seeds / seeds_per_gram
        spacing = get("plant_spacing")
        row_spacing = get("row_spacing")
        if spacing is not None:
            row_metres = plants * spacing
        if row_spacing is not None:
            # Half a row spacing is reserved at each lateral bed edge.
            ratio = target.bed_width_m / row_spacing
            rows = _floor(ratio)
            if rows < 1:
                raise ValueError("Bed width cannot accommodate a row")
            if row_metres is not None:
                area = row_metres / rows * target.bed_width_m
                if target.bed_length_m is not None:
                    # Fixed beds use whole plant positions per row.
                    positions = _floor(target.bed_length_m / spacing)
                    if positions < 1:
                        raise ValueError("Bed length cannot accommodate a plant position")
                    beds = _ceil(plants / (positions * rows))
                    allocated_area = beds * target.bed_length_m * target.bed_width_m
    return CalculationResult(plants, seeds, seed_mass, row_metres, rows, area, beds,
                             allocated_area, tuple(sorted(missing)), tuple(sorted(warnings)))
