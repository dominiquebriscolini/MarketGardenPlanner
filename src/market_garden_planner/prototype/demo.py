"""Explicit synthetic fixtures, separate from the production catalogue."""
from datetime import date
from .. import (AgronomicParameter, CropProfile, SeasonalProfile, YieldPeriod,
                SeasonalTarget, DateWindow, Bed, plan_season)

NOTICE = "SYNTHETISCHE DEMODATEN · Keine agronomische Produktionsprognose"
START, END = date(2026, 3, 1), date(2026, 11, 1)
GEOMETRY = {
    "unit": "m", "boundary": [[0, 0], [29, 0], [29, 15], [24, 21], [6, 21], [0, 16]],
    "beds": [dict(id=f"B{i+1:02}", x=x, y=y, width=1.2, length=8, angle=0)
             for i, (x, y) in enumerate([(4, 4), (7, 4), (10, 4), (13, 4), (16, 4), (19, 4)])],
}


def p(value, unit):
    return AgronomicParameter(value, unit, "Synthetic phase 3A.1 demonstration", "synthetic")


def profile(id, method, days, unit, mode="single", amounts=(1,)):
    crop = CropProfile(id, id, None, method, p(.2, "kg/plant"), p(.9, "fraction"),
                       p(.9, "fraction"), p(.3, "m"), p(.3, "m"), p(100, "seeds/g"))
    periods = tuple(YieldPeriod(p(i * 7, "d"), p(7 if mode == "continuous" else 0, "d"),
                               p(amount, f"{unit}/plant")) for i, amount in enumerate(amounts))
    return SeasonalProfile(crop, mode, p(days, "d"), p(14 if method == "transplant" else 0, "d"),
                           p(4, "d"), periods)


def build_demo():
    profiles = {s.crop.id: s for s in (
        profile("radishes", "direct", 28, "pieces"),
        profile("lettuce", "transplant", 35, "pieces"),
        profile("tomatoes", "transplant", 45, "kg", "continuous", (.25, .4, .5, .4)),
        profile("spinach", "direct", 32, "kg", "multicut", (.08, .06)),
    )}
    names = dict(radishes="Radieschen", lettuce="Kopfsalat", tomatoes="Tomaten", spinach="Spinat")
    specs = [
        ("spring", "radishes", 600, "pieces", date(2026, 4, 20), date(2026, 4, 21), 100),
        ("summer", "lettuce", 600, "pieces", date(2026, 6, 15), date(2026, 6, 16), 100),
        ("fruit", "tomatoes", 150, "kg", date(2026, 8, 10), date(2026, 9, 7), 100),
        ("autumn", "spinach", 48, "kg", date(2026, 10, 19), date(2026, 10, 20), 100),
    ]
    targets = tuple(SeasonalTarget(id, crop, qty, unit, DateWindow(a, b), interval, 1.2, 8)
                    for id, crop, qty, unit, a, b, interval in specs)
    beds = tuple(Bed(b["id"], b["width"], b["length"]) for b in GEOMETRY["beds"])
    result = plan_season(targets, profiles, beds, planning_start=START)
    return result, profiles, names
