"""Read-only ISO-week projection of user intentions, not a second scheduler."""
from dataclasses import replace
from datetime import date, timedelta
from math import fsum, ulp

from ..harvest import monday
from ..calculator import MissingAgronomicData
from ..occupancy import planting_grid
from ..seasonal_models import DateWindow
from ..spatial import geometry_token
from .catalogue import load_catalogue
from .cultivation import calendar_date
from .cultivation_checks import analyze_cultivations, _known_overlap
from .errors import ProjectError

DAY = timedelta(days=1)


def iso_weeks(year):
    # A complete ISO year needs dates in the following calendar year as well.
    if type(year) is not int or not 1 <= year <= 9998:
        raise ProjectError("invalid_season_year", "ISO-Jahr muss zwischen 1 und 9998 liegen.")
    count = date(year, 12, 28).isocalendar().week
    first = monday(date(year, 1, 4))
    return tuple(DateWindow(first + i * 7 * DAY, first + (i + 1) * 7 * DAY) for i in range(count))


def bed_week(entries, window, relations):
    active, opened, upcoming, completed = [], [], [], []
    for entry in entries:
        start = calendar_date(entry.start_date)
        end = calendar_date(entry.planned_harvest_date) if entry.planned_harvest_date else None
        cid = entry.cultivation_id
        if start >= window.end:
            upcoming.append(cid)
        elif end is not None and end < window.start:
            completed.append(cid)
        else:
            if end is None:
                opened.append(cid)
            if _known_overlap((start, end or start), (window.start, window.end - DAY)):
                active.append(cid)
    shown = [e.cultivation_id for e in entries if e.cultivation_id in set(active + opened)]
    simultaneous = any(r["kind"] == "overlap" and _known_overlap(
        (calendar_date(r["start_date"]), calendar_date(r["end_date"])),
        (window.start, window.end - DAY)) for r in relations)
    possible_overlap = any(r["kind"] == "unknown" and set(r["cultivation_ids"]) <= set(shown) for r in relations)
    stage = ("overlap" if simultaneous else "planned" if active else "uncertain" if opened
             else "unplanned" if not entries else "gap" if upcoming and completed
             else "future" if upcoming else "completed")
    return {"stage": stage, "active_ids": active, "open_ids": opened, "upcoming_ids": upcoming,
            "completed_ids": completed, "shown_ids": shown, "uncertain": bool(opened),
            "succession": len(active) > 1 and not simultaneous and not possible_overlap, "possible_overlap": possible_overlap}


def reference_yield(profile, grid):
    """Scale comparable catalogue reference units without changing operational yields."""
    if grid.capacity == 0:
        return None
    if profile.id == "tomatoes-field-transplant":
        cherry = profile.facts.get("reference_yield_cherry_field")
        slicer = profile.facts.get("reference_yield_slicer_roma_field")
        fact = cherry if cherry and slicer and all(
            getattr(cherry, field) == getattr(slicer, field) for field in ("value", "unit", "source", "scope")
        ) else None
    else:
        fact = profile.facts.get("reference_yield")
    if fact is None or fact.source is None:
        return None
    if fact.unit == "lb/plant":
        basis = grid.capacity
    elif fact.unit in {"lb/100ft_row", "lb/100ft_row_multiple_cuts"}:
        basis = grid.capacity * grid.plant_spacing_m / 30.48
    else:
        return None
    values = fact.value if isinstance(fact.value, list) else [fact.value, fact.value]
    if len(values) != 2 or not all(type(v) in (int, float) and v > 0 for v in values):
        return None
    low, high = sorted(values)
    return {
        "min_kg": low * basis * 0.45359237,
        "max_kg": high * basis * 0.45359237,
        "basis": "plant_positions" if fact.unit == "lb/plant" else "occupied_row_length",
        "source": fact.source,
        "scope": fact.scope,
        "multiple_cuts": fact.unit == "lb/100ft_row_multiple_cuts",
    }


def cultivation_layout(bed, profile, row_numbers=None):
    if profile is None:
        return None
    try:
        grid = planting_grid(profile, bed.width_m, bed.length_m)
    except MissingAgronomicData:
        return None
    if row_numbers is not None:
        grid = replace(grid, rows=len(row_numbers) if len(row_numbers) <= grid.rows else 0)
    return {
        "rows": grid.rows,
        "positions_per_row": grid.positions_per_row,
        "capacity": grid.capacity,
        "row_spacing_m": grid.row_spacing_m,
        "plant_spacing_m": grid.plant_spacing_m,
        "row_spacing_source": profile.row_spacing.source,
        "plant_spacing_source": profile.plant_spacing.source,
        "row_spacing_status": profile.row_spacing.status,
        "plant_spacing_status": profile.plant_spacing.status,
        "reference_yield": reference_yield(profile, grid),
    }


def assign_week_rows(state, entries, window, layouts, width):
    active = set(state["active_ids"])
    known = [(entry, calendar_date(entry.start_date),
              calendar_date(entry.planned_harvest_date or entry.start_date))
             for entry in entries if entry.cultivation_id in active]
    if not known:
        return state
    if not any(entry.row_numbers for entry, _, _ in known):
        return {**state, "row_layout_issue": "unassigned"} if state["stage"] == "overlap" else state
    # Use the latest known occupied day in the selected week. This keeps
    # successive groups apart even when both fall in the same ISO week.
    day = max(min(end, window.end - DAY) for _, _, end in known)
    chosen = [entry for entry, start, end in known if start <= day <= end]
    state["row_layout_day"] = day.isoformat()
    if state["possible_overlap"]:
        return {**state, "row_layout_issue": "uncertain"}
    if any(entry.row_numbers is None for entry in chosen):
        return {**state, "row_layout_issue": "unassigned"}
    ordered = sorted((row, entry.cultivation_id) for entry in chosen for row in entry.row_numbers)
    if len({row for row, _ in ordered}) != len(ordered):
        return {**state, "row_layout_issue": "duplicate"}
    if any(layouts[key] is None for _, key in ordered):
        return {**state, "row_layout_issue": "spacing"}
    total = fsum(layouts[key]["row_spacing_m"] for _, key in ordered)
    if total > width + ulp(width) * 4:
        return {**state, "row_layout_issue": "width"}
    edge = max(0.0, (width - total) / 2)
    row_positions = {}
    for _, key in ordered:
        spacing = layouts[key]["row_spacing_m"]
        row_positions.setdefault(key, []).append(edge + spacing / 2)
        edge += spacing
    state["row_positions_m"] = row_positions
    return state


def project_season(project, year=None, *, today=None, catalogue=None):
    today = today or date.today()
    entries = tuple(sorted(project.cultivation_plan.entries, key=lambda e: (e.start_date, e.cultivation_id)))
    years = {today.isocalendar().year}
    for e in entries:
        years.add(calendar_date(e.start_date).isocalendar().year)
        if e.planned_harvest_date:
            years.add(calendar_date(e.planned_harvest_date).isocalendar().year)
    if year is None:
        year = today.isocalendar().year if today.isocalendar().year in {
            calendar_date(e.start_date).isocalendar().year for e in entries} or not entries else calendar_date(entries[0].start_date).isocalendar().year
    windows = iso_weeks(year)
    catalogue = catalogue or load_catalogue()
    species = {s.id: s.name for s in catalogue.species}
    varieties = {v.id: v.name for v in catalogue.varieties}
    names = {p.id: species[p.species_id] + (" · " + varieties[p.variety_id] if p.variety_id else "") for p in catalogue.profiles}
    profiles = {p.id: p for p in catalogue.profiles}
    beds = {b.object_id: b for b in project.geometry.beds}
    layouts = {e.cultivation_id: cultivation_layout(beds[e.bed_id], profiles.get(e.profile_id), e.row_numbers)
               for e in entries}
    grouped = {b.object_id: tuple(e for e in entries if e.bed_id == b.object_id) for b in project.geometry.beds}
    relations = {bid: analyze_cultivations(group)["relations"] for bid, group in grouped.items()}
    weeks = [{"iso_year": year, "iso_week": i + 1, "start_date": w.start.isoformat(),
              "end_date": (w.end - DAY).isoformat(),
              "beds": {bid: assign_week_rows(bed_week(group, w, relations[bid]), group, w,
                                             layouts, beds[bid].width_m)
                       for bid, group in grouped.items()}}
             for i, w in enumerate(windows)]
    reference = today if today.isocalendar().year == year else next(
        (calendar_date(e.start_date) for e in entries if calendar_date(e.start_date).isocalendar().year == year), windows[0].start)
    return {"schema_version": 1, "project_id": project.project_id, "revision_id": project.revision_id,
            "cultivation_revision_id": project.cultivation_plan.revision_id,
            "geometry_token": geometry_token(project.geometry), "iso_year": year,
            "years": sorted(y for y in years | {year - 1, year, year + 1} if 1 <= y <= 9998),
            "initial_week": reference.isocalendar().week, "week_count": len(windows),
            "cultivations": project.cultivation_plan.to_dict()["entries"], "planting_layouts": layouts,
            "names": {e.profile_id: names.get(e.profile_id, e.profile_id) for e in entries}, "weeks": weeks}
