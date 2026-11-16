"""Original acceptance cases 3–6 using explicit synthetic agronomic data."""

import unittest
from dataclasses import replace
from datetime import date, timedelta

from market_garden_planner import Bed, DateWindow, SeasonalTarget, plan_season
from market_garden_planner.occupancy import BedReservation, find_overlaps
from seasonal_fixtures import p, period, profile

START = date(2026, 1, 1)


class SeasonalAcceptanceTests(unittest.TestCase):
    def test_case_3_50kg_tomatoes_uses_only_yield_in_target_period(self):
        tomatoes = profile("tomatoes", "tomatoes", mode="continuous", unit="kg", field_days=60,
                           nursery_days=21, cleanup_days=2,
                           periods=(period(0, 7, 1), period(7, 7, 2), period(14, 7, 3)))
        tomatoes = replace(tomatoes, crop=replace(tomatoes.crop, plant_spacing=p(.5, "m"), row_spacing=p(.6, "m")))
        window = DateWindow(date(2026, 7, 6), date(2026, 7, 20))
        target = SeasonalTarget("50kg", "tomatoes", 50, "kg", window, 100, 1.2, 10)
        result = plan_season((target,), {"tomatoes": tomatoes}, (Bed("A", 1.2, 10),), planning_start=START)
        batch = result.batches[0]
        self.assertEqual(batch.plan.plants, 17)  # ceil(50 / (1 + 2)), not ceil(50 / 6)
        self.assertEqual(batch.plants, 17)
        self.assertEqual(batch.plan.transplant_date, date(2026, 5, 7))
        self.assertEqual(batch.plan.sowing_date, date(2026, 4, 16))
        self.assertEqual(batch.plan.occupancy.end, date(2026, 7, 29))
        self.assertEqual([r.quantity for r in result.forecasts], [17, 34, 51])
        self.assertEqual([r.credited_quantity for r in result.forecasts], [17, 34, 0])
        self.assertEqual(result.outcomes[0].achieved, 51)
        self.assertEqual(result.outcomes[0].deficit, 0)
        self.assertEqual(result.outcomes[0].surplus, 1)
        self.assertTrue(any("synthetic" in w for w in result.warnings))
        doubled = replace(tomatoes, yield_periods=tuple(period(i * 7, 7, amount) for i, amount in enumerate((2, 4, 6))))
        other = plan_season((target,), {"tomatoes": doubled}, (Bed("A", 1.2, 10),), planning_start=START)
        self.assertEqual(other.batches[0].plan.plants, 9)

    def test_case_4_lettuce_batches_14_days_apart(self):
        lettuce = profile()
        target = SeasonalTarget("staggered", "lettuce", 80, "pieces",
                                DateWindow(date(2026, 6, 1), date(2026, 7, 14)), 14, 1.2, 10)
        result = plan_season((target,), {"lettuce": lettuce}, tuple(Bed(str(i), 1.2, 10) for i in range(4)),
                             planning_start=START)
        batches = result.batches
        self.assertEqual(len(batches), 4)
        self.assertEqual([b.plants for b in batches], [20, 20, 20, 20])
        for first, second in zip(batches, batches[1:]):
            for attribute in ("first_harvest", "transplant_date", "sowing_date"):
                self.assertEqual(getattr(second.plan, attribute) - getattr(first.plan, attribute), timedelta(days=14))
        self.assertEqual(sum(r.quantity for r in result.crop_forecasts), 80)
        self.assertEqual(result.outcomes[0].deficit, 0)
        self.assertFalse(find_overlaps(result.reservations))

    def test_case_5_radishes_then_lettuce_reuses_released_bed(self):
        radishes = profile("radishes", "radishes", method="direct", field_days=20)
        lettuce = profile()
        targets = (
            SeasonalTarget("radish", "radishes", 10, "pieces", DateWindow(date(2026, 5, 31), date(2026, 6, 1)), 14, 1.2, 10),
            SeasonalTarget("salad", "lettuce", 10, "pieces", DateWindow(date(2026, 7, 1), date(2026, 7, 2)), 14, 1.2, 10),
        )
        result = plan_season(targets, {"radishes": radishes, "lettuce": lettuce}, (Bed("A", 1.2, 10),), planning_start=START)
        self.assertEqual([b.plants for b in result.batches], [10, 10])
        first, second = result.reservations
        self.assertEqual(first.bed_id, second.bed_id)
        self.assertEqual(first.window.end, second.window.start)
        self.assertLess(result.batches[1].plan.sowing_date, second.window.start)  # nursery is elsewhere
        self.assertIsNone(result.batches[0].plan.transplant_date)
        self.assertFalse(find_overlaps(result.reservations))
        overlapping = replace(second, window=DateWindow(second.window.start - timedelta(days=1), second.window.end))
        self.assertEqual(len(find_overlaps((first, overlapping))), 1)
        # Explicit cleanup delays release; no silent double booking.
        result = plan_season(targets, {"radishes": replace(radishes, cleanup_days=p(1, "d")), "lettuce": lettuce},
                             (Bed("A", 1.2, 10),), planning_start=START)
        self.assertEqual(result.outcomes[1].deficit, 10)
        self.assertFalse(find_overlaps(result.reservations))

    def test_case_6_insufficient_area_reports_achievable_kg_and_deficit(self):
        crop = profile(unit="kg", amount=.5)
        target = SeasonalTarget("limited", "lettuce", 10, "kg", DateWindow(date(2026, 6, 1), date(2026, 6, 2)), 14, 1.2, 1)
        result = plan_season((target,), {"lettuce": crop}, (Bed("A", 1.2, 1),), planning_start=START)
        self.assertEqual(result.batches[0].plan.plants, 20)
        self.assertEqual(result.batches[0].plants, 12)  # 4 rows * floor(1 / .3)
        self.assertEqual(result.outcomes[0].achieved, 6)
        self.assertEqual(result.outcomes[0].deficit, 4)
        self.assertIn("area:insufficient_available_bed_capacity", result.outcomes[0].reasons)
        self.assertAlmostEqual(result.batches[0].plan.required_area_m2, 2.4)
        self.assertAlmostEqual(result.batches[0].allocated_area_m2, 1.2)
        self.assertAlmostEqual(result.batches[0].unused_area_m2, .12)  # unusable length remainder
        self.assertAlmostEqual(max(r.required_peak_m2 for r in result.area_weeks), 2.4)
        self.assertAlmostEqual(max(r.reserved_peak_m2 for r in result.area_weeks), 1.2)


if __name__ == "__main__":
    unittest.main()
