"""Original acceptance cases 1, 2 and 7; test-only values are synthetic."""

import unittest
from dataclasses import replace
from pathlib import Path

from market_garden_planner import (
    AgronomicParameter, MissingAgronomicData, ProductionTarget, calculate, load_database,
)

DATABASE = Path(__file__).resolve().parents[1] / "data" / "cultures.json"


def synthetic(value, unit):
    return AgronomicParameter(value, unit, "Synthetic acceptance fixture, not agronomic evidence", "synthetic")


class OriginalAcceptanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = load_database(DATABASE)

    def test_case_1_150_lettuce_heads_with_losses(self):
        original = self.db.profile("lettuce-butterhead-transplant")
        profile = replace(original, germination_rate=synthetic(.8, "fraction"),
                          establishment_rate=synthetic(.9, "fraction"))
        target = ProductionTarget(profile.id, 150, "plants", 1.2)
        result = calculate(profile, target, required_outputs=("plants", "seeds", "row_metres"))
        self.assertEqual(result.plants, 150)  # productive plants, one head each
        self.assertEqual(result.seeds, 209)  # ceil(150 / (.8 * .9))
        self.assertAlmostEqual(result.row_metres, 45)
        self.assertEqual(result.rows_per_bed, 4)
        self.assertAlmostEqual(result.bed_area_m2, 13.5)
        self.assertIsNone(result.seed_mass_g)
        self.assertTrue(any("synthetic" in warning for warning in result.warnings))
        no_losses = replace(profile, germination_rate=synthetic(1, "fraction"),
                            establishment_rate=synthetic(1, "fraction"))
        self.assertEqual(calculate(no_losses, target).seeds, 150)
        self.assertIsNone(original.germination_rate.value)  # catalogue never mutated
        with self.assertRaises(MissingAgronomicData) as raised:
            calculate(original, target, required_outputs=("seeds",))
        self.assertIn("germination_rate", raised.exception.parameters)
        self.assertIn("establishment_rate", raised.exception.parameters)

    def test_case_2_100_kg_carrots_positions_rows_seeds(self):
        original = self.db.profile("carrots-standard-bzl")
        profile = replace(original, yield_per_plant=synthetic(.1, "kg/plant"),
                          germination_rate=synthetic(.8, "fraction"),
                          establishment_rate=synthetic(.9, "fraction"))
        target = ProductionTarget(profile.id, 100, "kg", 1.2, 10)
        result = calculate(profile, target, required_outputs=("plants", "row_metres", "seeds"))
        self.assertEqual(result.plants, 1000)
        self.assertAlmostEqual(result.row_metres, 40)
        self.assertEqual(result.seeds, 1389)
        self.assertEqual(result.rows_per_bed, 4)
        self.assertAlmostEqual(result.bed_area_m2, 12)
        self.assertEqual(result.beds, 1)
        self.assertEqual(result.allocated_bed_area_m2, 12)
        self.assertTrue(any("planning_assumption" in warning for warning in result.warnings))
        self.assertIsNone(original.yield_per_plant.value)
        # US yield per row is preserved as evidence, never used as kg per plant.
        self.assertEqual(original.facts["reference_yield"].unit, "lb/100ft_row")
        self.assertIsNone(calculate(original, target).plants)

    def test_case_7_missing_yield_is_explicit_error(self):
        for profile in self.db.profiles:
            with self.subTest(profile=profile.id):
                target = ProductionTarget(profile.id, 100, "kg", 1.2)
                result = calculate(profile, target)
                self.assertIsNone(result.plants)
                self.assertIsNone(result.seeds)
                self.assertIsNone(result.row_metres)
                self.assertEqual(result.missing, ("yield_per_plant",))
                with self.assertRaisesRegex(MissingAgronomicData, "yield_per_plant.*Keine Ersatzwerte") as raised:
                    calculate(profile, target, required_outputs=("plants", "seeds", "row_metres"))
                self.assertEqual(raised.exception.profile_id, profile.id)
                self.assertEqual(raised.exception.parameters, ("yield_per_plant",))
        profile = self.db.profile("carrots-standard-bzl")
        # A zero production target needs no yield; plant-count targets bypass mass conversion.
        self.assertEqual(calculate(profile, ProductionTarget(profile.id, 0, "kg", 1.2),
                                   required_outputs=("plants",)).plants, 0)
        self.assertEqual(calculate(profile, ProductionTarget(profile.id, 10, "plants", 1.2),
                                   required_outputs=("plants",)).plants, 10)


if __name__ == "__main__":
    unittest.main()
