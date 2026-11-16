"""Integration contract: presentation must reflect the real scheduler."""
import json
import unittest
from datetime import date
from market_garden_planner.occupancy import find_overlaps
from market_garden_planner.prototype.demo import build_demo, GEOMETRY
from market_garden_planner.prototype.presentation import payload


class PrototypeTests(unittest.TestCase):
    def test_daily_states_follow_allocated_intervals_and_boundaries(self):
        result, _, _ = build_demo()
        view = payload()
        plans = {b.plan.id: b.plan for b in result.batches}
        self.assertFalse(find_overlaps(result.reservations))
        self.assertTrue(all(o.deficit == 0 for o in result.outcomes))
        seen = set()
        for row in view["days"]:
            day = date.fromisoformat(row["date"])
            for id, state in row["beds"].items():
                active = [r for r in result.reservations if r.bed_id == id and r.window.contains(day)]
                self.assertEqual(state["batch_id"], active[0].batch_id if active else None)
                seen.add(state["stage"])
                if active:
                    p = plans[active[0].batch_id]
                    expected = "growth" if day < p.first_harvest else "harvest" if day < p.harvest_end else "cleanup"
                    self.assertEqual(state["stage"], expected)
                else:
                    self.assertEqual(state["stage"], "free")
        self.assertEqual(seen, {"free", "growth", "harvest", "cleanup"})
        for reservation in result.reservations:
            row = next(d for d in view["days"] if d["date"] == reservation.window.end.isoformat())
            self.assertNotEqual(row["beds"][reservation.bed_id]["batch_id"], reservation.batch_id)

    def test_geometry_and_json_contract_match_scheduler(self):
        view = payload()
        result, profiles, _ = build_demo()
        self.assertTrue(all(p.crop.plant_spacing.status == "synthetic" for p in profiles.values()))
        self.assertIn("SYNTHETISCHE", view["notice"])
        self.assertEqual({b["id"] for b in GEOMETRY["beds"]}, set(view["days"][0]["beds"]))
        for b in result.batches:
            area = sum(g["width"] * g["length"] for r in b.reservations
                       for g in GEOMETRY["beds"] if g["id"] == r.bed_id)
            self.assertAlmostEqual(area, b.allocated_area_m2)
        serialized = json.loads(json.dumps(view, default=lambda d: d.isoformat()))
        self.assertEqual(serialized["schedule"]["crop_forecasts"][0]["quantity"], result.crop_forecasts[0].quantity)
        self.assertGreater(len([r for r in result.reservations if r.bed_id == "B01"]), 1)
