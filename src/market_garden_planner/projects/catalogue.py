"""Expose identities/methods from the real Python catalogue, never demo yields."""
from pathlib import Path
from ..database import load_database


def load_catalogue():
    return load_database(Path(__file__).resolve().parents[3] / "data" / "cultures.json")


def catalogue_payload(catalogue):
    names = {s.id: s.name for s in catalogue.species}
    varieties = {v.id: v.name for v in catalogue.varieties}
    return {"source": "data/cultures.json", "profiles": [
        {"profile_id": p.id, "species_id": p.species_id, "name": names[p.species_id],
         "variety_id": p.variety_id, "variety_name": varieties.get(p.variety_id),
         "establishment": p.establishment}
        for p in catalogue.profiles]}
