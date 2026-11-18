"""Build-time scheduler export for the read-only synthetic preview garden."""

import argparse
from datetime import date, timedelta
import json
from pathlib import Path

from .. import Bed, DateWindow, SeasonalTarget, plan_season
from ..projects.catalogue import catalogue_payload, load_catalogue
from .demo import END, NOTICE, START, profile
from .presentation import season_payload

TITLE = "Testgarten am Feldweg"
GEOMETRY = {
    "unit": "m",
    "boundary": [[0, 0], [28, 0], [30, 8], [28, 19], [20, 22], [3, 20], [0, 15]],
    "beds": [
        dict(id=f"T{i:02}", x=3 + (i - 1) * 3, y=4, width=1.2, length=8,
             angle=angle)
        for i, angle in enumerate((0, 0, 0, 0, 0, 0, 0, -8), 1)
    ],
}

# Synthetic harvest dates and field durations exercise the whole season.
# The catalogue supplies identity and establishment method only.
FIXTURES = {
    "radishes-spring": (4, 2, 32),
    "spinach-spring-direct": (4, 20, 38),
    "lettuce-butterhead-transplant": (5, 16, 35),
    "kohlrabi-standard-transplant": (6, 5, 56),
    "carrots-early-lwg": (6, 21, 85),
    "onions-seed-transplant": (7, 12, 86),
    "zucchini-transplant-lwg": (7, 20, 55),
    "bush-beans-direct": (8, 2, 64),
    "tomatoes-field-transplant": (8, 17, 88),
    "onions-seed-direct": (8, 28, 116),
    "beetroot-root-direct": (9, 12, 87),
    "carrots-standard-bzl": (9, 27, 112),
    "kohlrabi-superschmelz-transplant": (10, 10, 83),
    "radishes-autumn": (10, 20, 33),
    "spinach-autumn-direct": (11, 1, 49),
}


def build_preview():
    catalogue = {item["profile_id"]: item for item in catalogue_payload(load_catalogue())["profiles"]}
    if catalogue.keys() != FIXTURES.keys():
        raise ValueError("Preview fixtures must cover every cultivation profile")

    profiles, names, targets = {}, {}, []
    beds = tuple(Bed(bed["id"], bed["width"], bed["length"]) for bed in GEOMETRY["beds"])
    for key, (month, day, duration) in FIXTURES.items():
        item = catalogue[key]
        names[key] = item["name"]
        if item["variety_name"]:
            names[key] += f" · {item['variety_name']}"
        profiles[key] = profile(key, item["establishment"], duration, "pieces",
                                source="Synthetic preview fixture")
        harvest = date(START.year, month, day)
        targets.append(SeasonalTarget(key, key, 24, "pieces",
                                     DateWindow(harvest, harvest + timedelta(days=1)),
                                     100, beds[0].width_m, beds[0].length_m))
    result = plan_season(tuple(targets), profiles, beds, planning_start=START)
    if any(outcome.deficit for outcome in result.outcomes):
        raise ValueError("Synthetic preview has unallocated cultivation targets")
    data = season_payload(result, profiles, names, GEOMETRY, START, END, NOTICE)
    return {**data, "title": TITLE}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    args.output.write_text(json.dumps(build_preview(), default=date.isoformat,
                                      ensure_ascii=False, allow_nan=False), encoding="utf-8")


if __name__ == "__main__":
    main()
