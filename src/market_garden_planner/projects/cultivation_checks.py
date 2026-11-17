"""Read-only comparison of known planning dates; harvest never means clearance."""
from datetime import date, timedelta
from itertools import combinations

from ..seasonal_models import DateWindow
from .cultivation import CultivationIntent, calendar_date
from .errors import ProjectError


def _known_overlap(first, second):
    start_a, end_a = first
    start_b, end_b = second
    # Inclusive user calendar days -> existing half-open scheduler contract.
    if end_a < date.max and end_b < date.max:
        return DateWindow(start_a, end_a + timedelta(days=1)).overlaps(
            DateWindow(start_b, end_b + timedelta(days=1)))
    # date.max has no representable following day. Same predicate without overflow.
    return max(start_a, start_b) <= min(end_a, end_b)


def analyze_cultivations(entries):
    """Missing harvest establishes only the known start day, not an open reservation."""
    if not isinstance(entries, tuple) or any(not isinstance(e, CultivationIntent) for e in entries):
        raise ValueError("Expected cultivation intentions")
    if len({e.cultivation_id for e in entries}) != len(entries):
        raise ProjectError("invalid_cultivation", "Anbauvorgangs-IDs müssen eindeutig sein.")
    ordered = sorted(entries, key=lambda e: (e.start_date, e.cultivation_id))
    relations = []
    for first, second in combinations(ordered, 2):
        if first.bed_id != second.bed_id:
            continue
        start_a, start_b = calendar_date(first.start_date), calendar_date(second.start_date)
        end_a = calendar_date(first.planned_harvest_date) if first.planned_harvest_date else start_a
        end_b = calendar_date(second.planned_harvest_date) if second.planned_harvest_date else start_b
        ids = [first.cultivation_id, second.cultivation_id]
        if _known_overlap((start_a, end_a), (start_b, end_b)):
            relations.append({"kind": "overlap", "cultivation_ids": ids,
                              "start_date": max(start_a, start_b).isoformat(),
                              "end_date": min(end_a, end_b).isoformat(),
                              "complete": first.planned_harvest_date is not None and second.planned_harvest_date is not None})
        elif first.planned_harvest_date is None:
            relations.append({"kind": "unknown", "cultivation_ids": ids})
    return {"schema_version": 1, "relations": relations,
            "incomplete_ids": [e.cultivation_id for e in ordered if e.planned_harvest_date is None]}


def analyze_input(raw):
    if not isinstance(raw, list) or len(raw) > 500:
        raise ProjectError("invalid_cultivation", "Maximal 500 Vorgänge je Datumsprüfung.")
    required = set(CultivationIntent.__dataclass_fields__)
    if any(not isinstance(entry, dict) or set(entry) != required for entry in raw):
        raise ProjectError("invalid_fields", "Vollständige Anbauvorgänge für die Datumsprüfung erforderlich.")
    return analyze_cultivations(tuple(CultivationIntent(**entry) for entry in raw))
