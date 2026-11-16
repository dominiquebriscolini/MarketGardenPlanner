"""Immutable domain objects. All agronomic numbers carry provenance."""

from dataclasses import dataclass, field
from math import isfinite
from typing import Literal

Status = Literal["missing", "unverified", "verified", "synthetic", "source_value", "planning_assumption"]


def finite_number(value: object, name: str, *, positive: bool = False) -> None:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not isfinite(value):
        raise ValueError(f"{name}: finite number required")
    if value < 0 or (positive and value == 0):
        raise ValueError(f"{name}: {'positive' if positive else 'non-negative'} value required")


@dataclass(frozen=True)
class AgronomicParameter:
    value: float | None
    unit: str
    source: str | None
    status: Status

    def __post_init__(self) -> None:
        if not isinstance(self.unit, str) or not self.unit.strip():
            raise ValueError("Parameter unit is required")
        if self.status not in {"missing", "unverified", "verified", "synthetic", "source_value", "planning_assumption"}:
            raise ValueError("Unknown parameter status")
        if self.value is None:
            if self.status != "missing":
                raise ValueError("Null values require status 'missing'")
        else:
            finite_number(self.value, "parameter")
            if self.status == "missing":
                raise ValueError("Missing parameters must have value null")
            if not isinstance(self.source, str) or not self.source.strip():
                raise ValueError("Known parameters require a source")
        if self.source is not None and (not isinstance(self.source, str) or not self.source.strip()):
            raise ValueError("Source must be a non-empty string or null")


@dataclass(frozen=True)
class AgronomicFact:
    """Source information kept separate from scalar calculation inputs.

    Ranges retain both endpoints; calendar windows retain source precision.
    No implicit selection, averaging or conversion into a core parameter.
    """

    value: str | float | list[float] | None
    unit: str
    source: str | None
    status: Status
    scope: str
    note: str = ""

    def __post_init__(self) -> None:
        # Reuse the provenance contract without forcing textual facts to numbers.
        AgronomicParameter(None if self.value is None else 1, self.unit, self.source, self.status)
        if not isinstance(self.scope, str) or not self.scope.strip():
            raise ValueError("Fact scope is required")
        if not isinstance(self.note, str):
            raise ValueError("Fact note must be a string")
        if isinstance(self.value, str):
            if not self.value.strip():
                raise ValueError("Empty fact text")
        elif isinstance(self.value, list):
            if len(self.value) != 2:
                raise ValueError("Numeric ranges require two endpoints")
            for v in self.value:
                finite_number(v, "fact range")
            if self.value[0] > self.value[1]:
                raise ValueError("Reversed fact range")
        elif self.value is not None:
            finite_number(self.value, "fact value")


@dataclass(frozen=True)
class PlantSpecies:
    id: str
    name: str
    scientific_name: str | None = None


@dataclass(frozen=True)
class Variety:
    id: str
    species_id: str
    name: str


@dataclass(frozen=True)
class CropProfile:
    id: str
    species_id: str
    variety_id: str | None
    establishment: Literal["direct", "transplant"]
    yield_per_plant: AgronomicParameter
    germination_rate: AgronomicParameter
    establishment_rate: AgronomicParameter
    plant_spacing: AgronomicParameter
    row_spacing: AgronomicParameter
    seeds_per_gram: AgronomicParameter
    facts: dict[str, AgronomicFact] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.establishment not in {"direct", "transplant"}:
            raise ValueError("Unknown establishment method")
        if not isinstance(self.facts, dict) or any(
            not isinstance(k, str) or not k.strip() or not isinstance(v, AgronomicFact)
            for k, v in self.facts.items()
        ):
            raise ValueError("Profile facts must map names to AgronomicFact")
        units = {
            "yield_per_plant": "kg/plant", "germination_rate": "fraction",
            "establishment_rate": "fraction", "plant_spacing": "m",
            "row_spacing": "m", "seeds_per_gram": "seeds/g",
        }
        for name, unit in units.items():
            parameter = getattr(self, name)
            if parameter.unit != unit:
                raise ValueError(f"{name}: expected unit {unit}")
            if parameter.value is not None:
                finite_number(parameter.value, name, positive=True)
                if unit == "fraction" and parameter.value > 1:
                    raise ValueError(f"{name}: fraction must be in (0, 1]")


@dataclass(frozen=True)
class ProductionTarget:
    profile_id: str
    quantity: float
    unit: Literal["kg", "plants"]
    bed_width_m: float
    bed_length_m: float | None = None

    def __post_init__(self) -> None:
        finite_number(self.quantity, "quantity")
        if self.unit not in {"kg", "plants"}:
            raise ValueError("Target unit must be kg or plants")
        finite_number(self.bed_width_m, "bed_width_m", positive=True)
        if self.bed_length_m is not None:
            finite_number(self.bed_length_m, "bed_length_m", positive=True)
