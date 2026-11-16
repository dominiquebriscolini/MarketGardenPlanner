"""Strict external JSON database loader with cross-reference validation."""

import json
from dataclasses import dataclass
from pathlib import Path

from .models import AgronomicFact, AgronomicParameter, CropProfile, PlantSpecies, Variety


@dataclass(frozen=True)
class CultureDatabase:
    species: tuple[PlantSpecies, ...]
    varieties: tuple[Variety, ...]
    profiles: tuple[CropProfile, ...]

    def profile(self, profile_id: str) -> CropProfile:
        return next(p for p in self.profiles if p.id == profile_id)


def load_database(path: str | Path) -> CultureDatabase:
    def reject_constant(value: str) -> None:
        raise ValueError(f"Invalid JSON number: {value}")

    def unique_keys(pairs: list) -> dict:
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Duplicate JSON key: {key}")
            result[key] = value
        return result

    raw = json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject_constant,
                     object_pairs_hook=unique_keys)
    if set(raw) != {"schema_version", "species", "varieties", "profiles"} or type(raw["schema_version"]) is not int or raw["schema_version"] not in (1, 2):
        raise ValueError("Expected schema version 1 or 2 and species/varieties/profiles")
    species = tuple(PlantSpecies(**entry) for entry in raw["species"])
    varieties = tuple(Variety(**entry) for entry in raw["varieties"])
    parameter_names = ("yield_per_plant", "germination_rate", "establishment_rate",
                       "plant_spacing", "row_spacing", "seeds_per_gram")
    profiles = []
    for entry in raw["profiles"]:
        converted = dict(entry)
        for name in parameter_names:
            converted[name] = AgronomicParameter(**entry[name])
        converted["facts"] = {name: AgronomicFact(**fact) for name, fact in entry.get("facts", {}).items()}
        profiles.append(CropProfile(**converted))
    for group in (species, varieties, profiles):
        ids = [item.id for item in group]
        if any(not isinstance(i, str) or not i.strip() for i in ids) or len(ids) != len(set(ids)):
            raise ValueError("IDs must be non-empty and unique within each entity type")
    species_ids = {s.id for s in species}
    variety_map = {v.id: v for v in varieties}
    for variety in varieties:
        if variety.species_id not in species_ids:
            raise ValueError("Unknown variety species")
    for profile in profiles:
        if profile.species_id not in species_ids:
            raise ValueError("Unknown profile species")
        if profile.variety_id is not None:
            variety = variety_map.get(profile.variety_id)
            if variety is None or variety.species_id != profile.species_id:
                raise ValueError("Profile variety/species mismatch")
    return CultureDatabase(species, varieties, tuple(profiles))
