"""Planning-day comparisons are informative and never change stored intentions."""
from dataclasses import asdict, replace
import unittest

import test_projects as legacy
from market_garden_planner.projects.cultivation import CultivationIntent
from market_garden_planner.projects.cultivation_checks import analyze_cultivations, analyze_input
from market_garden_planner.spatial import new_id


class CultivationChecksTests(unittest.TestCase):
    def setUp(self):
        self.bed_id = new_id()

    def entry(self, start, end=None, bed_id=None):
        return CultivationIntent(new_id(), new_id(), bed_id or self.bed_id,
                                 "radishes-spring", "direct", start, end)

    def check(self, *entries):
        return analyze_cultivations(tuple(entries))

    def test_known_overlaps_inclusive_harvest_day_and_single_day(self):
        a = self.entry("2027-03-01", "2027-04-30")
        for start, end, common_end in [("2027-04-10", "2027-05-10", "2027-04-30"),
                                        ("2027-04-30", "2027-05-10", "2027-04-30"),
                                        ("2027-04-30", "2027-04-30", "2027-04-30")]:
            b = self.entry(start, end)
            r = self.check(a, b)["relations"]
            self.assertEqual(r, [{"kind": "overlap", "cultivation_ids": [a.cultivation_id, b.cultivation_id],
                                  "start_date": start, "end_date": common_end, "complete": True}])

    def test_next_day_successions_and_different_beds_have_no_overlap(self):
        a = self.entry("2027-03-01", "2027-04-30")
        b = self.entry("2027-05-01", "2027-06-10")
        self.assertEqual(self.check(a, b)["relations"], [])
        self.assertEqual(self.check(a, replace(a, cultivation_id=new_id(), bed_id=new_id()))["relations"], [])

    def test_missing_earlier_harvest_is_unknown_not_an_infinite_reservation(self):
        a = self.entry("2027-03-01")
        b = self.entry("2027-04-10", "2027-05-10")
        self.assertEqual(self.check(a, b)["relations"], [{"kind": "unknown", "cultivation_ids": [a.cultivation_id, b.cultivation_id]}])
        self.assertEqual(self.check(a, b)["incomplete_ids"], [a.cultivation_id])

    def test_missing_later_harvest_can_still_have_a_known_common_start_day(self):
        a = self.entry("2027-03-01", "2027-04-30")
        b = self.entry("2027-04-10")
        relation = self.check(a, b)["relations"][0]
        self.assertEqual((relation["kind"], relation["start_date"], relation["end_date"], relation["complete"]),
                         ("overlap", "2027-04-10", "2027-04-10", False))
        self.assertEqual(self.check(a, replace(b, start_date="2027-05-01"))["relations"], [])

    def test_both_open_are_unknown_except_for_the_known_same_start_day(self):
        a = self.entry("2027-03-01")
        b = self.entry("2027-04-10")
        self.assertEqual(self.check(a, b)["relations"][0]["kind"], "unknown")
        same = replace(b, start_date=a.start_date)
        relation = self.check(a, same)["relations"][0]
        self.assertEqual(relation["kind"], "overlap")
        self.assertEqual(relation["start_date"], relation["end_date"])
        self.assertFalse(relation["complete"])
        self.assertEqual(self.check(a)["relations"], [])

    def test_order_invariance_identity_preservation_and_removal(self):
        a = self.entry("2027-03-01", "2027-04-30")
        b = self.entry("2027-04-10", "2027-05-10")
        before = [asdict(a), asdict(b)]
        self.assertEqual(self.check(a, b), self.check(b, a))
        self.assertEqual([asdict(a), asdict(b)], before)
        self.assertEqual(self.check(a)["relations"], [])

    def test_leap_day_and_maximum_date_do_not_round_or_overflow(self):
        a = self.entry("2028-02-29", "2028-03-01")
        b = self.entry("2028-03-01", "2028-03-02")
        self.assertEqual(self.check(a, b)["relations"][0]["start_date"], "2028-03-01")
        maximum = self.entry("9999-12-31", "9999-12-31")
        self.assertEqual(self.check(maximum, replace(maximum, cultivation_id=new_id()))["relations"][0]["end_date"], "9999-12-31")

    def test_invalid_incomplete_raw_input_and_duplicate_ids_are_rejected(self):
        a = asdict(self.entry("2027-03-01"))
        for raw in [None, [a, a], [{**a, "start_date": "2027-02-29"}],
                    [{**a, "planned_harvest_date": "2027-02-28"}], [{"start_date": a["start_date"]}], [a] * 501]:
            with self.subTest(raw=raw if raw is None or len(raw) < 3 else "large"), self.assertRaises(ValueError):
                analyze_input(raw)


class CultivationCheckAPITests(unittest.TestCase):
    setUp = legacy.APITests.setUp
    stop = legacy.APITests.stop
    request = legacy.APITests.request
    create = legacy.APITests.create

    def test_analysis_is_read_only_and_does_not_block_storing_overlapping_cultures(self):
        project = self.create()
        base = f'/api/v1/projects/{project["project_id"]}'
        path = base + f'/beds/{self.state.beds[0].object_id}/cultivations'
        for start in ("2027-03-01", "2027-04-10"):
            status, data = self.request("POST", path, {"expected_revision": project["revision_id"], "cultivation": {
                "profile_id": "radishes-spring", "establishment": "direct", "start_date": start, "planned_harvest_date": "2027-04-30"}})
            self.assertEqual(status, 201, data)
            project = data["project"]
        entries = project["cultivation_plan"]["entries"]
        status, data = self.request("POST", "/api/v1/cultivations/analyze", {"entries": entries})
        self.assertEqual(status, 200, data)
        self.assertEqual(data["analysis"]["relations"][0]["kind"], "overlap")
        self.assertEqual(self.request("GET", base)[1]["project"], project)
        # An unpersisted input is also checkable without inventing geometry or saving it.
        draft = {**entries[1], "start_date": "2027-05-01", "planned_harvest_date": None}
        result = self.request("POST", "/api/v1/cultivations/analyze", {"entries": [entries[0], draft]})[1]
        self.assertEqual(result["analysis"]["relations"], [])
        self.assertEqual(self.request("GET", base)[1]["project"], project)
        self.assertEqual(self.request("POST", "/api/v1/cultivations/analyze", {"entries": [{**draft, "start_date": "bad"}]})[0], 422)
        self.assertEqual(self.request("GET", "/api/v1/cultivations/analyze")[0], 405)
