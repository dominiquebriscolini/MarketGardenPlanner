"""User planning intentions, not scheduler results or agronomic estimates."""
from dataclasses import asdict, dataclass, replace
from datetime import date
from uuid import UUID, uuid5

from ..database import CultureDatabase
from ..seasonal_models import require_date
from ..spatial.models import new_id, require_uuid
from .errors import ProjectError


def calendar_date(value):
    if not isinstance(value, str):
        raise ProjectError("invalid_date", "Datum muss YYYY-MM-DD sein.")
    try:
        result = date.fromisoformat(value)
        require_date(result)
        if result.isoformat() != value:
            raise ValueError()
        return result
    except ValueError as error:
        raise ProjectError("invalid_date", "Ungültiges Kalenderdatum; YYYY-MM-DD erforderlich.") from error


@dataclass(frozen=True)
class CultivationIntent:
    cultivation_id: str
    revision_id: str
    bed_id: str
    profile_id: str
    establishment: str
    start_date: str
    planned_harvest_date: str | None = None
    input_status: str = "user_input"

    def __post_init__(self):
        for value in (self.cultivation_id, self.revision_id, self.bed_id):
            require_uuid(value)
        if not isinstance(self.profile_id, str) or not self.profile_id.strip():
            raise ProjectError("invalid_culture", "Katalogprofil erforderlich.")
        if self.establishment not in ("direct", "transplant") or self.input_status != "user_input":
            raise ProjectError("invalid_cultivation", "Anbauart oder Eingabeherkunft ungültig.")
        start = calendar_date(self.start_date)
        if self.planned_harvest_date is not None and calendar_date(self.planned_harvest_date) < start:
            raise ProjectError("invalid_date", "Geplante Ernte darf nicht vor Aussaat/Pflanzung liegen.")


@dataclass(frozen=True)
class CultivationPlan:
    revision_id: str
    entries: tuple[CultivationIntent, ...] = ()

    def __post_init__(self):
        require_uuid(self.revision_id)
        if not isinstance(self.entries, tuple) or any(not isinstance(e, CultivationIntent) for e in self.entries):
            raise ValueError("Cultivation entries must be a tuple of intentions")
        if len({e.cultivation_id for e in self.entries}) != len(self.entries):
            raise ValueError("Duplicate cultivation IDs")

    @classmethod
    def empty(cls, project_id):
        # Deterministic migration also decodes historical schema-1 command receipts.
        return cls(str(uuid5(UUID(project_id), "initial-cultivation-plan-v1")))

    def to_dict(self):
        return {"schema_version": 1, "revision_id": self.revision_id,
                "entries": [asdict(e) for e in self.entries]}

    @classmethod
    def from_dict(cls, value):
        if not isinstance(value, dict) or set(value) != {"schema_version", "revision_id", "entries"} or type(value["schema_version"]) is not int or value["schema_version"] != 1 or not isinstance(value["entries"], list):
            raise ValueError("Unsupported cultivation plan format")
        required = set(CultivationIntent.__dataclass_fields__)
        if any(not isinstance(e, dict) or set(e) != required for e in value["entries"]):
            raise ValueError("Incomplete cultivation entry")
        return cls(value["revision_id"], tuple(CultivationIntent(**entry) for entry in value["entries"]))

    def validate_beds(self, geometry):
        ids = {b.object_id for b in geometry.beds}
        if any(e.bed_id not in ids for e in self.entries):
            raise ProjectError("bed_has_cultivations", "Beet besitzt Anbauvorgänge. Diese zuerst ausdrücklich entfernen.", 409)


def change_plan(plan, geometry, catalogue: CultureDatabase, operation, bed_id, values=None, cultivation_id=None):
    require_uuid(bed_id)
    if not any(b.object_id == bed_id for b in geometry.beds):
        raise ProjectError("bed_not_found", "Beet nicht gefunden.", 404)
    before = next((e for e in plan.entries if e.cultivation_id == cultivation_id and e.bed_id == bed_id), None)
    if operation != "add" and before is None:
        raise ProjectError("cultivation_not_found", "Anbauvorgang nicht in diesem Beet gefunden.", 404)
    if operation == "delete":
        entries = tuple(e for e in plan.entries if e != before)
    else:
        allowed = {"profile_id", "establishment", "start_date", "planned_harvest_date"}
        if not isinstance(values, dict) or set(values) - allowed or not {"profile_id", "establishment", "start_date"} <= set(values):
            raise ProjectError("invalid_fields", "Katalogprofil, Anbauart und Startdatum erforderlich; nur geplantes Erntedatum optional.")
        entry = CultivationIntent(before.cultivation_id if before else new_id(),
                                  before.revision_id if before else new_id(), bed_id, **values)
        profile = next((p for p in catalogue.profiles if p.id == entry.profile_id), None)
        if profile is None:
            raise ProjectError("unknown_profile", "Kulturprofil nicht im Python-Katalog gefunden.")
        if profile.establishment != entry.establishment:
            raise ProjectError("establishment_mismatch", "Anbauart muss zum gewählten Katalogprofil passen.")
        if entry == before:
            return plan
        if before:
            entry = replace(entry, revision_id=new_id())
        entries = tuple(entry if e == before else e for e in plan.entries) if before else plan.entries + (entry,)
    return CultivationPlan(new_id(), entries)
