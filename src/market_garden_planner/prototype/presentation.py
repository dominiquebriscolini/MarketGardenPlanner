"""Daily display states derived in Python from actual scheduler allocations."""
from dataclasses import asdict
from datetime import timedelta
from .demo import build_demo, GEOMETRY, NOTICE, START, END


def payload():
    result, profiles, names = build_demo()
    return season_payload(result, profiles, names, GEOMETRY, START, END, NOTICE)


def season_payload(result, profiles, names, geometry, start, end, notice):
    batches = {b.plan.id: b for b in result.batches}
    days = []
    day = start
    while day <= end:
        states = {}
        for bed in geometry["beds"]:
            active = next((r for r in result.reservations if r.bed_id == bed["id"] and r.window.contains(day)), None)
            stage = "free"
            if active:
                plan = batches[active.batch_id].plan
                stage = "growth" if day < plan.first_harvest else "harvest" if day < plan.harvest_end else "cleanup"
            states[bed["id"]] = {"stage": stage, "batch_id": active.batch_id if active else None}
        days.append({"date": day.isoformat(), "beds": states})
        day += timedelta(days=1)
    return {
        "schema_version": 1, "notice": notice, "geometry": geometry, "days": days,
        "names": names, "schedule": asdict(result),
        "harvest_modes": {id: p.harvest_mode for id, p in profiles.items()},
    }
