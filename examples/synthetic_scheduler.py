"""Runnable demonstration: ALL agronomic numbers are SYNTHETIC, not advice.

Run from the project root with PYTHONPATH=src and Python 3.11.
"""

import json
from dataclasses import asdict
from datetime import date

from market_garden_planner import (
    AgronomicParameter, Bed, CropProfile, DateWindow, SeasonalProfile, SeasonalTarget,
    YieldPeriod, plan_season,
)


def synthetic(value, unit):
    return AgronomicParameter(value, unit, "SYNTHETIC DEMO ONLY; not agronomic evidence", "synthetic")


def main():
    crop = CropProfile("demo-tomatoes", "tomatoes", None, "transplant",
                       AgronomicParameter(None, "kg/plant", None, "missing"),
                       AgronomicParameter(None, "fraction", None, "missing"),
                       AgronomicParameter(None, "fraction", None, "missing"),
                       synthetic(.5, "m"), synthetic(.6, "m"),
                       AgronomicParameter(None, "seeds/g", None, "missing"))
    seasonal = SeasonalProfile(crop, "continuous", synthetic(60, "d"), synthetic(21, "d"),
        synthetic(2, "d"), tuple(YieldPeriod(synthetic(i * 7, "d"), synthetic(7, "d"),
                                           synthetic(amount, "kg/plant")) for i, amount in enumerate((1, 2, 3))))
    target = SeasonalTarget("demo-50kg", crop.id, 50, "kg",
                            DateWindow(date(2026, 7, 6), date(2026, 7, 20)), 100, 1.2, 10)
    result = plan_season((target,), {crop.id: seasonal}, (Bed("A", 1.2, 10),),
                         planning_start=date(2026, 1, 1))
    print(json.dumps({"data_status": "SYNTHETIC DEMO ONLY", "schedule": asdict(result)},
                     default=lambda value: value.isoformat(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
