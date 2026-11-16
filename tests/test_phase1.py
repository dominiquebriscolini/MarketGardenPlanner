"""Provisional phase-1 acceptance groups; all numeric fixtures are synthetic."""

import json
import tempfile
import unittest
from dataclasses import asdict, replace
from pathlib import Path

from market_garden_planner import (
    AgronomicParameter as Parameter, CropProfile, ProductionTarget, calculate, load_database,
)

ROOT = Path(__file__).resolve().parents[1]


def p(value, unit):
    return Parameter(value, unit, "Synthetic acceptance fixture" if value is not None else None,
                     "synthetic" if value is not None else "missing")


def profile():
    return CropProfile("test", "test-species", None, "transplant",
                       p(0.5, "kg/plant"), p(0.8, "fraction"), p(0.9, "fraction"),
                       p(0.3, "m"), p(0.3, "m"), p(100, "seeds/g"))


def target(quantity=50, unit="kg", width=1.2, length=10):
    return ProductionTarget("test", quantity, unit, width, length)


class Phase1AcceptanceTests(unittest.TestCase):
    def test_a01_model_and_provenance(self):
        self.assertEqual(asdict(profile())["yield_per_plant"]["source"], "Synthetic acceptance fixture")
        for args in [(1, "m", None, "verified"), (None, "m", None, "verified"),
                     (1, "m", "source", "missing"), (float("nan"), "m", "source", "verified"),
                     (True, "m", "source", "verified"), (-1, "m", "source", "verified")]:
            with self.subTest(args=args), self.assertRaises(ValueError):
                Parameter(*args)
        with self.assertRaises(ValueError):
            replace(profile(), plant_spacing=p(30, "cm"))

    def test_a02_external_database_and_references(self):
        # Production catalogue plus a separate synthetic reference-validation fixture.
        load_database(ROOT / "data" / "cultures.json")
        document = {"schema_version": 1,
                    "species": [{"id": "test-species", "name": "Synthetic species"}],
                    "varieties": [{"id": "v", "species_id": "test-species", "name": "Synthetic variety"}],
                    "profiles": [asdict(replace(profile(), variety_id="v"))]}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "cultures.json"
            path.write_text(json.dumps(document), encoding="utf-8")
            self.assertEqual(load_database(path).profile("test").variety_id, "v")
            document["profiles"][0]["variety_id"] = "unknown"
            path.write_text(json.dumps(document), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_database(path)
            document["profiles"][0]["variety_id"] = "v"
            document["species"] *= 2
            path.write_text(json.dumps(document), encoding="utf-8")
            with self.assertRaises(ValueError):
                load_database(path)
            for malformed in ['{"schema_version":1,"schema_version":1}', '{"x":NaN}']:
                path.write_text(malformed, encoding="utf-8")
                with self.assertRaises(ValueError):
                    load_database(path)

    def test_a03_plant_demand_and_rounding(self):
        self.assertEqual(calculate(profile(), target()).plants, 100)
        self.assertEqual(calculate(profile(), target(50.1)).plants, 101)
        self.assertEqual(calculate(profile(), target(5.2, "plants")).plants, 6)
        result = calculate(replace(profile(), yield_per_plant=p(0.1, "kg/plant")), target(0.3))
        self.assertEqual(result.plants, 3)
        self.assertEqual(calculate(profile(), target(1e-12, "plants")).plants, 1)
        self.assertEqual(calculate(profile(), target(1.0000000001, "plants")).plants, 2)

    def test_a04_seed_demand_and_mass(self):
        result = calculate(profile(), target())
        self.assertEqual(result.seeds, 139)
        self.assertAlmostEqual(result.seed_mass_g, 1.39)
        for method in ("direct", "transplant"):
            self.assertEqual(calculate(replace(profile(), establishment=method), target()).seeds, 139)
        self.assertTrue(any("synthetic" in warning for warning in result.warnings))

    def test_a05_row_metres_and_bed_area(self):
        result = calculate(profile(), target())
        self.assertAlmostEqual(result.row_metres, 30)
        self.assertEqual(result.rows_per_bed, 4)
        self.assertAlmostEqual(result.bed_area_m2, 9)
        self.assertEqual(result.beds, 1)
        self.assertAlmostEqual(result.allocated_bed_area_m2, 12)
        # 4 rows x floor(1 / 0.3) = 12 plant positions per fixed bed.
        self.assertEqual(calculate(profile(), target(13, "plants", length=1)).beds, 2)
        continuous = calculate(profile(), target(length=None))
        self.assertIsNone(continuous.beds)
        self.assertAlmostEqual(continuous.bed_area_m2, 9)

    def test_a06_missing_values_never_invented(self):
        result = calculate(replace(profile(), yield_per_plant=p(None, "kg/plant")), target())
        self.assertIsNone(result.plants)
        self.assertIsNone(result.bed_area_m2)
        self.assertEqual(result.missing, ("yield_per_plant",))
        result = calculate(replace(profile(), germination_rate=p(None, "fraction")), target())
        self.assertIsNone(result.seeds)
        self.assertEqual(result.plants, 100)
        self.assertAlmostEqual(result.bed_area_m2, 9)
        result = calculate(replace(profile(), seeds_per_gram=p(None, "seeds/g")), target())
        self.assertEqual(result.seeds, 139)
        self.assertIsNone(result.seed_mass_g)
        self.assertEqual(result.missing, ("seeds_per_gram",))

    def test_a07_validation_zero_and_integration_boundary(self):
        for quantity in (-1, float("inf"), True):
            with self.subTest(quantity=quantity), self.assertRaises(ValueError):
                target(quantity)
        for rate in (0, 1.1):
            with self.subTest(rate=rate), self.assertRaises(ValueError):
                replace(profile(), germination_rate=p(rate, "fraction"))
        with self.assertRaises(ValueError):
            calculate(profile(), replace(target(), profile_id="other"))
        with self.assertRaises(ValueError):
            calculate(profile(), target(width=0.1))
        with self.assertRaises(ValueError):
            calculate(profile(), target(length=0.1))
        empty_profile = replace(profile(), yield_per_plant=p(None, "kg/plant"))
        self.assertEqual(calculate(empty_profile, target(0)).plants, 0)
        result = calculate(profile(), target())
        self.assertEqual(json.loads(json.dumps(asdict(result)))["plants"], 100)
        self.assertEqual(result, calculate(profile(), target()))


if __name__ == "__main__":
    unittest.main()
