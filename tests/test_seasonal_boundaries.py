"""Scheduling boundary and harvest-model tests, with synthetic fixtures only."""

import json
import unittest
from dataclasses import asdict, replace
from datetime import date, timedelta

from market_garden_planner import Bed, DateWindow, MissingAgronomicData, SeasonalTarget, SeasonWindow, plan_season
from market_garden_planner.batches import plan_batches
from market_garden_planner.harvest import forecast_batch, validate_yield, yield_per_plant
from market_garden_planner.occupancy import BedReservation, find_overlaps, weekly_area
from seasonal_fixtures import p, period, profile

START = date(2026, 1, 1)
FIRST = date(2026, 6, 1)


def target(quantity=10, unit="pieces", start=FIRST, end=None, interval=100, id="t"):
    return SeasonalTarget(id, "lettuce", quantity, unit, DateWindow(start, end or start + timedelta(days=1)), interval, 1.2, 10)


def run(crop, goal=None, beds=(Bed("A", 1.2, 10),), **kwargs):
    return plan_season((goal or target(),), {"lettuce": crop}, beds, planning_start=kwargs.pop("planning_start", START), **kwargs)


class SeasonalBoundaryTests(unittest.TestCase):
    def test_multicut_forecast_and_occupancy_continue_through_last_cut(self):
        crop = profile(mode="multicut", unit="kg", periods=(period(0, 0, .2), period(10, 0, .3), period(24, 0, .5)))
        result = run(crop, target(10, "kg", end=FIRST + timedelta(days=25)))
        self.assertEqual(result.batches[0].plants, 10)
        self.assertEqual(sum(r.quantity for r in result.forecasts), 10)
        self.assertEqual([r.quantity for r in result.forecasts], [2, 3, 0, 5])
        self.assertEqual(result.reservations[0].window.end, FIRST + timedelta(days=25))

    def test_storage_is_one_bulk_harvest_and_releases_field(self):
        crop = profile(mode="storage", unit="kg", amount=2, cleanup_days=2)
        result = run(crop, target(10, "kg"))
        self.assertEqual(result.batches[0].plants, 5)
        self.assertEqual(sum(r.quantity for r in result.forecasts), 10)
        self.assertEqual(result.reservations[0].window.end, FIRST + timedelta(days=3))

    def test_continuous_yield_prorates_partial_weeks_and_never_extrapolates(self):
        crop = profile(mode="continuous", unit="kg", periods=(period(0, 7, 7), period(7, 7, 14)))
        first = date(2026, 6, 7)  # Sunday, first profile bin crosses calendar week
        window = DateWindow(date(2026, 6, 8), date(2026, 6, 15))
        rows = forecast_batch(crop, "b", "t", 2, first, window, "kg")
        self.assertEqual([r.quantity for r in rows], [2, 16, 24])
        self.assertEqual(sum(r.credited_quantity for r in rows), 16)
        self.assertEqual(yield_per_plant(crop, first, DateWindow(date(2026, 7, 1), date(2026, 7, 8))), 0)
        self.assertEqual(yield_per_plant(crop, first, DateWindow(first, first + timedelta(days=1))), 1)

    def test_missing_duration_or_yield_never_creates_production(self):
        for crop, parameter in [
            (replace(profile(), field_days_to_first_harvest=p(None, "d")), "field_days_to_first_harvest"),
            (replace(profile(), nursery_days=p(None, "d")), "nursery_days"),
            (replace(profile(), cleanup_days=p(None, "d")), "cleanup_days"),
            (replace(profile(), yield_periods=()), "yield_periods"),
            (profile(periods=(period(0, 0, None, "pieces"),)), "amount_per_plant"),
        ]:
            with self.subTest(parameter=parameter), self.assertRaisesRegex(MissingAgronomicData, parameter):
                run(crop)
        direct = replace(profile(method="direct"), nursery_days=p(None, "d"))
        self.assertEqual(run(direct).outcomes[0].deficit, 0)  # nursery is not applicable

    def test_incomplete_or_overlapping_yield_horizons_are_rejected(self):
        for periods in [(period(0, 7, 1), period(8, 7, 1)),
                        (period(0, 7, 1), period(6, 7, 1)), (period(1, 7, 1),)]:
            with self.subTest(periods=periods), self.assertRaisesRegex(ValueError, "contiguous"):
                validate_yield(profile(mode="continuous", unit="kg", periods=periods), "kg")
        with self.assertRaisesRegex(ValueError, "unique ordered"):
            validate_yield(profile(mode="multicut", periods=(period(0, 0, 1, "pieces"), period(0, 0, 1, "pieces"))), "pieces")
        with self.assertRaisesRegex(ValueError, "units differ"):
            run(profile(), target(10, "kg"))

    def test_time_shortage_reports_partial_achievable_production(self):
        goal = target(20, start=FIRST, end=FIRST + timedelta(days=15), interval=14)
        # First sowing is Apr 18, second May 2. Only the second remains feasible.
        result = run(profile(), goal, planning_start=date(2026, 5, 1))
        self.assertEqual([b.plants for b in result.batches], [0, 10])
        self.assertEqual(result.outcomes[0].achieved, 10)
        self.assertEqual(result.outcomes[0].deficit, 10)
        self.assertIn("time:sowing_before_planning_start", result.outcomes[0].reasons)

    def test_explicit_sowing_and_planting_windows_reject_dates(self):
        allowed = SeasonWindow(DateWindow(date(2026, 5, 1), date(2026, 6, 1)),
                               "Synthetic phase-2 calendar fixture", "synthetic")
        crop = replace(profile(), sowing_windows=(allowed,), planting_windows=(allowed,))
        result = run(crop)
        self.assertIn("time:outside_sowing_window", result.outcomes[0].reasons)
        self.assertEqual(result.outcomes[0].deficit, 10)
        result = run(replace(profile(), sowing_windows=()))  # explicitly no valid dates
        self.assertEqual(result.outcomes[0].achieved, 0)

    def test_existing_reservations_block_capacity_and_invalid_booking_is_rejected(self):
        booking = BedReservation("A", "external", DateWindow(date(2026, 5, 1), date(2026, 7, 1)), 1)
        result = run(profile(), existing_reservations=(booking,))
        self.assertEqual(result.outcomes[0].deficit, 10)
        self.assertEqual(result.reservations, (booking,))
        self.assertFalse(find_overlaps(result.reservations))
        with self.assertRaisesRegex(ValueError, "overlap"):
            run(profile(), existing_reservations=(booking, replace(booking, batch_id="other")))
        with self.assertRaisesRegex(ValueError, "unknown bed"):
            run(profile(), existing_reservations=(replace(booking, bed_id="unknown"),))
        with self.assertRaisesRegex(ValueError, "colliding"):
            run(profile(), existing_reservations=(replace(booking, batch_id="t:1"),))

    def test_empty_and_undersized_beds_and_whole_bed_remainder(self):
        for beds in [(), (Bed("tiny", .1, .1),)]:
            with self.subTest(beds=beds):
                result = run(profile(), beds=beds)
                self.assertEqual(result.outcomes[0].deficit, 10)
        result = run(profile(), target(5), beds=(Bed("A", 1.2, 1),))
        self.assertAlmostEqual(result.batches[0].unused_area_m2, .75)
        self.assertAlmostEqual(result.batches[0].allocated_area_m2, 1.2)

    def test_weekly_area_is_simultaneous_peak_not_sum_of_adjacent_uses(self):
        plan = plan_batches(target(), profile(), planning_start=START)[0]
        first_window = DateWindow(date(2026, 6, 1), date(2026, 6, 3))
        second_window = DateWindow(date(2026, 6, 3), date(2026, 6, 8))
        plans = (replace(plan, id="a", occupancy=first_window), replace(plan, id="b", occupancy=second_window))
        booked = (BedReservation("A", "a", first_window, 10), BedReservation("A", "b", second_window, 10))
        result = weekly_area(plans, booked, (Bed("A", 1.2, 10),))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].required_peak_m2, 12)
        self.assertEqual(result[0].reserved_peak_m2, 12)

    def test_piece_shares_sum_exactly_and_zero_targets_need_no_yield(self):
        goal = target(5, end=FIRST + timedelta(days=29), interval=14)
        plans = plan_batches(goal, profile(), planning_start=START)
        self.assertEqual([p.requested_quantity for p in plans], [2, 2, 1])
        self.assertEqual(sum(p.plants for p in plans), 5)
        zero = run(replace(profile(), yield_periods=()), target(0))
        self.assertEqual(zero.batches, ())
        self.assertEqual(zero.area_weeks, ())
        self.assertEqual(zero.outcomes[0].deficit, 0)

    def test_input_validation_and_deterministic_json_export(self):
        for interval in (0, -1, True, 1.5):
            with self.subTest(interval=interval), self.assertRaises(ValueError):
                target(interval=interval)
        with self.assertRaises(ValueError):
            target(1.5)
        with self.assertRaises(ValueError):
            DateWindow(FIRST, FIRST)
        with self.assertRaises(ValueError):
            replace(profile(), field_days_to_first_harvest=p(1.5, "d"))
        with self.assertRaisesRegex(ValueError, "Duplicate bed"):
            run(profile(), beds=(Bed("A", 1.2, 10), Bed("A", 1.2, 10)))
        result = run(profile())
        self.assertEqual(result, run(profile()))
        exported = json.loads(json.dumps(asdict(result), default=lambda d: d.isoformat()))
        self.assertEqual(exported["forecasts"][0]["week_start"], "2026-06-01")


if __name__ == "__main__":
    unittest.main()
