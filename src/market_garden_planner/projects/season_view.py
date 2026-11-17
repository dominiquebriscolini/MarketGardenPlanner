"""Read-only ISO-week projection of user intentions, not a second scheduler."""
from datetime import date, timedelta

from ..harvest import monday
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
    grouped = {b.object_id: tuple(e for e in entries if e.bed_id == b.object_id) for b in project.geometry.beds}
    relations = {bid: analyze_cultivations(group)["relations"] for bid, group in grouped.items()}
    weeks = [{"iso_year": year, "iso_week": i + 1, "start_date": w.start.isoformat(),
              "end_date": (w.end - DAY).isoformat(),
              "beds": {bid: bed_week(group, w, relations[bid]) for bid, group in grouped.items()}}
             for i, w in enumerate(windows)]
    reference = today if today.isocalendar().year == year else next(
        (calendar_date(e.start_date) for e in entries if calendar_date(e.start_date).isocalendar().year == year), windows[0].start)
    return {"schema_version": 1, "project_id": project.project_id, "revision_id": project.revision_id,
            "cultivation_revision_id": project.cultivation_plan.revision_id,
            "geometry_token": geometry_token(project.geometry), "iso_year": year,
            "years": sorted(y for y in years | {year - 1, year, year + 1} if 1 <= y <= 9998),
            "initial_week": reference.isocalendar().week, "week_count": len(windows),
            "cultivations": project.cultivation_plan.to_dict()["entries"],
            "names": {e.profile_id: names.get(e.profile_id, e.profile_id) for e in entries}, "weeks": weeks}
