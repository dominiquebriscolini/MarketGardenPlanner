"""Real SQLite/HTTP tests. Dates and spatial fixtures are synthetic test inputs."""
from contextlib import closing
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

import test_projects as legacy
from test_spatial import parcel_with_hole, bed
from market_garden_planner.projects.repository import ProjectRepository
from market_garden_planner.projects.errors import ProjectError
from market_garden_planner.projects.catalogue import load_catalogue, catalogue_payload
from market_garden_planner.spatial import GeometryState, dumps, new_id

DIRECT = dict(profile_id="radishes-spring", establishment="direct", start_date="2027-03-15", planned_harvest_date="2027-04-30")
TRANSPLANT = dict(profile_id="lettuce-butterhead-transplant", establishment="transplant", start_date="2027-05-10", planned_harvest_date=None)


class CultivationRepositoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "test.sqlite3"
        self.repo = ProjectRepository(self.path)
        parcel = parcel_with_hole()
        self.geometry = GeometryState(parcel, (bed(parcel, rotation_deg=17), bed(parcel, x=13, geometry_locked=True)))
        self.project = self.repo.create("SYNTHETIC Kulturplanung", self.geometry)
        self.bed_id = self.geometry.beds[0].object_id

    def add(self, project=None, values=None, **kwargs):
        p = project or self.project
        return self.repo.change_cultivation(p.project_id, p.revision_id, self.bed_id, "add", values or DIRECT, **kwargs)

    def test_sequence_edit_remove_and_reopen_preserve_ids_geometry_and_token(self):
        first = self.add()
        second = self.add(first, TRANSPLANT)
        self.assertEqual([e.start_date for e in second.cultivation_plan.entries], ["2027-03-15", "2027-05-10"])
        entry = second.cultivation_plan.entries[0]
        changed = self.repo.change_cultivation(second.project_id, second.revision_id, self.bed_id, "update",
            {**DIRECT, "start_date": "2027-03-17"}, entry.cultivation_id)
        self.assertEqual(changed.cultivation_plan.entries[0].cultivation_id, entry.cultivation_id)
        self.assertNotEqual(changed.cultivation_plan.entries[0].revision_id, entry.revision_id)
        self.assertEqual(changed.cultivation_plan.entries[1], second.cultivation_plan.entries[1])
        self.assertNotEqual(changed.revision_id, second.revision_id)
        self.assertNotEqual(changed.cultivation_plan.revision_id, second.cultivation_plan.revision_id)
        self.assertEqual(changed.geometry, self.geometry)
        self.assertEqual(changed.to_dict()["geometry_token"], self.project.to_dict()["geometry_token"])
        self.assertEqual(ProjectRepository(self.path).get(changed.project_id), changed)
        removed = self.repo.change_cultivation(changed.project_id, changed.revision_id, self.bed_id, "delete", cultivation_id=entry.cultivation_id)
        self.assertEqual(removed.cultivation_plan.entries, (changed.cultivation_plan.entries[1],))
        self.assertEqual(ProjectRepository(self.path).get(removed.project_id), removed)

    def test_invalid_dates_fields_profiles_methods_never_write(self):
        for values in [{**DIRECT, "start_date": value} for value in ("2027-02-29", "2028-02-30", "20270315", "2027-3-15", "2027-03-15T00:00:00", None, True)] + [
            {**DIRECT, "planned_harvest_date": "2027-03-14"}, {**DIRECT, "planned_harvest_date": ""},
            {**DIRECT, "profile_id": "lettuce"}, {**DIRECT, "establishment": "transplant"},
            {**DIRECT, "input_status": "synthetic"}, {**DIRECT, "bed_id": new_id()},
        ]:
            with self.subTest(values=values), self.assertRaises((ValueError, ProjectError)):
                self.add(values=values)
            self.assertEqual(self.repo.get(self.project.project_id), self.project)
        leap = self.add(values={**DIRECT, "start_date": "2028-02-29", "planned_harvest_date": None})
        self.assertEqual(leap.cultivation_plan.entries[0].start_date, "2028-02-29")

    def test_geometry_lock_allows_cultivation_but_delete_is_guarded(self):
        locked = self.geometry.beds[1].object_id
        p = self.repo.change_cultivation(self.project.project_id, self.project.revision_id, locked, "add", DIRECT)
        self.assertEqual(p.geometry, self.geometry)
        p = self.add(p)
        with self.assertRaises(ProjectError) as raised:
            self.repo.delete_bed(p.project_id, p.revision_id, self.bed_id)
        self.assertEqual(raised.exception.code, "bed_has_cultivations")
        self.assertEqual(self.repo.get(p.project_id), p)
        entry = next(e for e in p.cultivation_plan.entries if e.bed_id == self.bed_id)
        p = self.repo.change_cultivation(p.project_id, p.revision_id, self.bed_id, "delete", cultivation_id=entry.cultivation_id)
        p = self.repo.delete_bed(p.project_id, p.revision_id, self.bed_id)
        with self.assertRaises(ProjectError) as raised:
            self.add(p)
        self.assertEqual(raised.exception.status, 404)
        self.assertEqual(self.repo.get(p.project_id), p)

    def test_cross_project_cross_bed_and_stale_geometry_revision(self):
        p = self.add()
        entry = p.cultivation_plan.entries[0]
        with self.assertRaises(ProjectError) as raised:
            self.repo.change_cultivation(p.project_id, p.revision_id, self.geometry.beds[1].object_id, "delete", cultivation_id=entry.cultivation_id)
        self.assertEqual(raised.exception.status, 404)
        other = self.repo.create("Independent", self.geometry)
        with self.assertRaises(ProjectError):
            self.repo.change_cultivation(other.project_id, other.revision_id, self.bed_id, "delete", cultivation_id=entry.cultivation_id)
        with self.assertRaises(ProjectError) as raised:
            self.repo.update_bed(p.project_id, self.project.revision_id, self.bed_id, {"width_m": .75})
        self.assertEqual(raised.exception.status, 409)
        updated = self.repo.update_bed(p.project_id, p.revision_id, self.bed_id, {"width_m": .75})
        self.assertEqual(updated.cultivation_plan, p.cultivation_plan)
        with self.assertRaises(ProjectError) as raised:
            self.add(p)
        self.assertEqual(raised.exception.status, 409)
        self.assertEqual(self.repo.get(other.project_id), other)

    def test_idempotency_noop_and_rollback_after_plan_update(self):
        command_id = new_id()
        first = self.add(command_id=command_id)
        self.assertEqual(self.add(command_id=command_id), first)
        with self.assertRaises(ProjectError):
            self.add(values=TRANSPLANT, command_id=command_id)
        entry = first.cultivation_plan.entries[0]
        self.assertEqual(self.repo.change_cultivation(first.project_id, first.revision_id, self.bed_id, "update", DIRECT, entry.cultivation_id), first)
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("CREATE TRIGGER fail_receipt BEFORE INSERT ON commands BEGIN SELECT RAISE(ABORT,'disk failure'); END")
        with self.assertRaises(ProjectError):
            self.add(first, TRANSPLANT, command_id=new_id())
        self.assertEqual(ProjectRepository(self.path).get(first.project_id), first)

    def test_culture_changes_do_not_even_write_geometry_columns(self):
        with closing(sqlite3.connect(self.path)) as db, db:
            db.execute("CREATE TRIGGER no_geometry BEFORE UPDATE OF geometry_json,geometry_token ON projects BEGIN SELECT RAISE(ABORT,'geometry must stay untouched'); END")
        self.assertEqual(self.add().geometry, self.geometry)

    def test_schema_one_migration_preserves_rows_and_historical_receipts(self):
        command = new_id()
        p = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.bed_id, {"width_m": .75}, command_id=command)
        with closing(sqlite3.connect(self.path)) as db, db:
            data = json.loads(db.execute("SELECT response_json FROM commands").fetchone()[0])
            data.pop("cultivation_plan")
            db.execute("UPDATE commands SET response_json=?", (json.dumps(data),))
            db.execute("DROP TABLE cultivation_plans")
            db.execute("PRAGMA user_version=1")
            before = db.execute("SELECT * FROM projects").fetchall()
            receipts = db.execute("SELECT * FROM commands").fetchall()
        migrated = ProjectRepository(self.path)
        with closing(sqlite3.connect(self.path)) as db, db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 2)
            self.assertEqual(db.execute("SELECT * FROM projects").fetchall(), before)
            self.assertEqual(db.execute("SELECT * FROM commands").fetchall(), receipts)
        self.assertEqual(migrated.get(p.project_id), p)
        self.assertEqual(migrated.update_bed(p.project_id, self.project.revision_id, self.bed_id, {"width_m": .75}, command_id=command), p)
        with patch("market_garden_planner.projects.schema.CultivationPlan.empty", side_effect=ValueError("migration failure")):
            with closing(sqlite3.connect(self.path)) as db, db:
                db.execute("DROP TABLE cultivation_plans")
                db.execute("PRAGMA user_version=1")
            with self.assertRaises(ValueError):
                ProjectRepository(self.path)
        with closing(sqlite3.connect(self.path)) as db, db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 1)
            self.assertNotIn("cultivation_plans", {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")})
            self.assertEqual(db.execute("SELECT * FROM projects").fetchall(), before)

    def test_corrupt_plan_is_not_silently_repaired(self):
        p = self.add()
        with closing(sqlite3.connect(self.path)) as db, db:
            raw = p.cultivation_plan.to_dict()
            raw["entries"][0]["bed_id"] = new_id()
            db.execute("UPDATE cultivation_plans SET plan_json=?", (json.dumps(raw),))
        with self.assertRaises(ProjectError) as raised:
            self.repo.get(p.project_id)
        self.assertEqual(raised.exception.code, "corrupt_project")


class CultivationAPITests(unittest.TestCase):
    setUp = legacy.APITests.setUp
    stop = legacy.APITests.stop
    request = legacy.APITests.request
    create = legacy.APITests.create

    def test_catalogue_uses_python_profiles_not_demo_and_has_no_yields(self):
        status, data = self.request("GET", "/api/v1/cultures")
        self.assertEqual(status, 200)
        self.assertEqual(data, {"api_version": 1, **catalogue_payload(load_catalogue())})
        self.assertEqual(len(data["profiles"]), 15)
        self.assertNotIn("yield", json.dumps(data))
        self.assertNotIn("lettuce", {p["profile_id"] for p in data["profiles"]})

    def test_crud_reload_and_geometry_unchanged_over_http(self):
        p = self.create()
        target = f'/api/v1/projects/{p["project_id"]}/beds/{self.state.beds[0].object_id}/cultivations'
        status, data = self.request("POST", target, {"expected_revision": p["revision_id"], "cultivation": DIRECT})
        self.assertEqual(status, 201, data)
        saved = data["project"]
        entry = saved["cultivation_plan"]["entries"][0]
        self.assertEqual(saved["geometry"], p["geometry"])
        self.assertEqual(self.request("GET", target)[1]["cultivations"], [entry])
        status, data = self.request("PUT", target + "/" + entry["cultivation_id"], {"expected_revision": saved["revision_id"], "cultivation": TRANSPLANT})
        self.assertEqual(status, 200, data)
        saved = data["project"]
        self.assertEqual(saved["cultivation_plan"]["entries"][0]["cultivation_id"], entry["cultivation_id"])
        status, data = self.request("DELETE", target + "/" + entry["cultivation_id"], {"expected_revision": saved["revision_id"]})
        self.assertEqual(status, 200, data)
        self.assertEqual(data["project"]["cultivation_plan"]["entries"], [])
        self.assertEqual(self.request("GET", f'/api/v1/projects/{p["project_id"]}')[1]["project"], data["project"])

    def test_validation_conflict_and_deleted_bed_http_errors(self):
        p = self.create()
        base = f'/api/v1/projects/{p["project_id"]}'
        target = base + f'/beds/{self.state.beds[0].object_id}/cultivations'
        self.assertEqual(self.request("POST", target, {"cultivation": DIRECT})[0], 428)
        self.assertEqual(self.request("POST", target, {"expected_revision": p["revision_id"], "cultivation": {**DIRECT, "start_date": "2027-02-29"}})[0], 422)
        status, data = self.request("POST", target, {"expected_revision": p["revision_id"], "cultivation": DIRECT})
        self.assertEqual(status, 201)
        self.assertEqual(self.request("POST", target, {"expected_revision": p["revision_id"], "cultivation": TRANSPLANT})[0], 409)
        status, data = self.request("DELETE", base + f'/beds/{self.state.beds[0].object_id}', {"expected_revision": data["project"]["revision_id"]})
        self.assertEqual(status, 409)
        self.assertEqual(data["error"]["code"], "bed_has_cultivations")
        self.assertEqual(self.request("GET", base + f'/beds/{new_id()}/cultivations')[0], 404)
