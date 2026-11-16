import json
import tempfile
import unittest
from dataclasses import asdict
from pathlib import Path

from market_garden_planner import AgronomicFact, ProductionTarget, calculate, load_database

ROOT = Path(__file__).resolve().parents[1]


class CatalogueTests(unittest.TestCase):
    def test_ten_agreed_cultures_and_distinct_profiles(self):
        db = load_database(ROOT / "data/cultures.json")
        self.assertEqual({s.name for s in db.species}, {
            "Karotten", "Kopfsalat", "Radieschen", "Kohlrabi", "Rote Bete", "Spinat",
            "Buschbohnen", "Zucchini", "Tomaten", "Zwiebeln",
        })
        self.assertEqual(len(db.profiles), 15)
        self.assertEqual({p.species_id for p in db.profiles}, {s.id for s in db.species})
        self.assertEqual(db.profile("kohlrabi-superschmelz-transplant").variety_id, "kohlrabi-superschmelz")
        self.assertNotEqual(db.profile("onions-seed-direct").establishment,
                            db.profile("onions-seed-transplant").establishment)
        for profile in db.profiles:
            for key in ("sowing_window", "succession_interval", "yield_model", "nursery_success_rate",
                        "field_survival_rate", "time_based_yield_profile", "luxembourg_validation"):
                self.assertIn(key, profile.facts)
            for key in ("yield_per_plant", "germination_rate", "establishment_rate", "seeds_per_gram"):
                self.assertIsNone(getattr(profile, key).value)

    def test_layout_examples_match_core_convention(self):
        db = load_database(ROOT / "data/cultures.json")
        for profile in db.profiles:
            with self.subTest(profile=profile.id):
                facts = profile.facts
                width = facts["example_bed_width"].value
                result = calculate(profile, ProductionTarget(profile.id, 1, "plants", width))
                rows = facts["example_rows_per_bed"].value
                self.assertEqual(result.rows_per_bed, rows)
                self.assertAlmostEqual(facts["required_width_for_example_rows"].value,
                                       rows * profile.row_spacing.value)
                self.assertEqual(facts["example_rows_per_bed"].status, "planning_assumption")

    def test_fact_validation_and_json_roundtrip(self):
        for value, status, source in [([2, 1], "source_value", "source"),
                                      (1, "source_value", None),
                                      (None, "planning_assumption", "source"),
                                      ([1, float("inf")], "source_value", "source")]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                AgronomicFact(value, "d", source, status, "test")
        raw = json.loads((ROOT / "data/cultures.json").read_text(encoding="utf-8"))
        db = load_database(ROOT / "data/cultures.json")
        self.assertEqual(asdict(db.profiles[0]), raw["profiles"][0])
        raw["profiles"][0]["facts"]["sowing_window"]["unexpected"] = True
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "bad.json"
            path.write_text(json.dumps(raw), encoding="utf-8")
            with self.assertRaises(TypeError):
                load_database(path)

    def test_required_outputs_reject_typo(self):
        profile = load_database(ROOT / "data/cultures.json").profile("lettuce-butterhead-transplant")
        target = ProductionTarget(profile.id, 150, "plants", 1.2)
        with self.assertRaisesRegex(ValueError, "Unknown required output"):
            calculate(profile, target, required_outputs=("plantz",))
