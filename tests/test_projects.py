"""Real SQLite and HTTP integration tests. All geometry/crop fixtures synthetic."""
from contextlib import closing
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, replace
import http.client
import json
from pathlib import Path
import sqlite3
import tempfile
from threading import Barrier, Thread
from functools import partial
from http.server import ThreadingHTTPServer
import unittest
from unittest.mock import patch

from market_garden_planner.api.server import Handler as APIHandler, create_server, MAX_BODY_BYTES
from market_garden_planner.projects.errors import ProjectError
from market_garden_planner.projects.repository import ProjectRepository
from market_garden_planner.prototype.presentation import payload
from market_garden_planner.spatial import GeometryState, GeometryValidationError, Point, dumps, geometry_token, loads, new_id
from test_spatial import parcel_with_hole, bed


class RepositoryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / "projects.sqlite3"
        self.repo = ProjectRepository(self.path)
        parcel = parcel_with_hole()
        self.first = bed(parcel, rotation_deg=17, generation_protected=True)
        self.neighbor = bed(parcel, x=13, rotation_deg=29, geometry_locked=True)
        self.state = GeometryState(parcel, (self.first, self.neighbor))
        self.project = self.repo.create("SYNTHETIC Test", self.state)

    def test_create_load_and_reopen_preserve_full_spatial_json(self):
        loaded = ProjectRepository(self.path).get(self.project.project_id)
        self.assertEqual(loaded, self.project)
        self.assertEqual(dumps(loaded.geometry), dumps(self.state))
        self.assertEqual(loaded.to_dict()["geometry_token"], geometry_token(self.state))
        self.assertEqual(loaded.geometry.beds[0].rotation_deg, 17)
        self.assertEqual(loaded.geometry.parcel.holes, self.state.parcel.holes)

    def test_save_json_roundtrip_retains_uuid_locks_and_revisions(self):
        state = loads(dumps(self.repo.get(self.project.project_id).geometry))
        saved = self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, state)
        self.assertEqual(saved, self.project)  # No-op doesn't invent revisions.
        self.assertTrue(saved.geometry.beds[0].generation_protected)
        self.assertTrue(saved.geometry.beds[1].geometry_locked)

    def test_width_update_changes_only_target_and_revision(self):
        result = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id, {"width_m": .75})
        self.assertEqual(result.geometry.beds[0].width_m, .75)
        self.assertEqual(result.geometry.beds[0].object_id, self.first.object_id)
        self.assertNotEqual(result.geometry.beds[0].revision_id, self.first.revision_id)
        self.assertNotEqual(result.geometry.revision_id, self.state.revision_id)
        self.assertNotEqual(result.revision_id, self.project.revision_id)
        self.assertEqual(result.geometry.beds[1], self.neighbor)
        self.assertEqual(result.geometry.parcel, self.state.parcel)
        self.assertEqual(self.repo.get(result.project_id), result)
        self.assertNotEqual(geometry_token(result.geometry), geometry_token(self.state))

    def test_general_bed_update_preserves_ids(self):
        updated = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id,
                                       {"center": {"x": 7, "y": 10}, "length_m": 7, "rotation_deg": 23})
        self.assertEqual(updated.geometry.beds[0].center, Point(7, 10))
        self.assertEqual(updated.geometry.beds[0].rotation_deg, 23)
        self.assertEqual(updated.geometry.beds[1], self.neighbor)

    def test_full_save_revisions_are_server_owned_and_neighbors_preserved(self):
        edited = replace(self.first, width_m=.75)  # Caller left revision unchanged.
        candidate = replace(self.state, beds=(edited, replace(self.neighbor, revision_id=new_id())))
        saved = self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, candidate)
        self.assertNotEqual(saved.geometry.beds[0].revision_id, self.first.revision_id)
        self.assertEqual(saved.geometry.beds[1], self.neighbor)

    def test_name_change_does_not_invalidate_geometry_token(self):
        result = self.repo.save(self.project.project_id, self.project.revision_id, "Renamed", self.state)
        self.assertNotEqual(result.revision_id, self.project.revision_id)
        self.assertEqual(result.geometry, self.state)

    def test_full_save_cannot_bypass_lock_by_unlocking_and_editing_at_once(self):
        candidate = replace(self.state, beds=(self.first, replace(self.neighbor, geometry_locked=False, width_m=.75)))
        with self.assertRaisesRegex(ProjectError, "locked"):
            self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, candidate)
        self.assertEqual(self.repo.get(self.project.project_id), self.project)
        unlocked = replace(self.state, beds=(self.first, replace(self.neighbor, geometry_locked=False)))
        saved = self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, unlocked)
        self.assertFalse(saved.geometry.beds[1].geometry_locked)

    def test_patch_locked_bed_and_parcel_lock(self):
        with self.assertRaises((ProjectError, GeometryValidationError)):
            self.repo.update_bed(self.project.project_id, self.project.revision_id, self.neighbor.object_id, {"width_m": .75})
        locked = self.repo.create("Locked parcel", replace(self.state, parcel=replace(self.state.parcel, geometry_locked=True)))
        outer = list(locked.geometry.parcel.outer)
        outer[1] = Point(31, 0)
        invalid_edit = replace(locked.geometry, parcel=replace(locked.geometry.parcel, outer=tuple(outer), geometry_locked=False))
        with self.assertRaisesRegex(ProjectError, "locked"):
            self.repo.save(locked.project_id, locked.revision_id, locked.name, invalid_edit)

    def test_invalid_geometry_cannot_create_or_update(self):
        candidate = replace(self.state, beds=(replace(self.first, center=Point(40, 40)), self.neighbor))
        with self.assertRaises(GeometryValidationError):
            self.repo.create("Invalid", candidate)
        with self.assertRaises(GeometryValidationError):
            self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, candidate)
        self.assertEqual(len(self.repo.list()), 1)
        self.assertEqual(self.repo.get(self.project.project_id), self.project)

    def test_identity_replacement_is_rejected(self):
        candidate = replace(self.state, beds=(replace(self.first, object_id=new_id()), self.neighbor))
        with self.assertRaisesRegex(ProjectError, "IDs"):
            self.repo.save(self.project.project_id, self.project.revision_id, self.project.name, candidate)

    def test_revision_conflict_never_overwrites_newer_change(self):
        current = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id, {"width_m": .75})
        with self.assertRaises(ProjectError) as failure:
            self.repo.save(self.project.project_id, self.project.revision_id, "stale", self.state)
        self.assertEqual(failure.exception.status, 409)
        self.assertEqual(failure.exception.details["current_revision"], current.revision_id)
        self.assertEqual(self.repo.get(current.project_id), current)

    def test_concurrent_connections_have_exactly_one_winner(self):
        other = ProjectRepository(self.path)
        barrier = Barrier(2)
        def update(repo, width):
            barrier.wait(timeout=5)
            try:
                return repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id, {"width_m": width})
            except ProjectError as error:
                return error
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(update, self.repo, .75), pool.submit(update, other, .8)]
            results = [f.result(timeout=10) for f in futures]
        self.assertEqual(sum(not isinstance(r, ProjectError) for r in results), 1)
        self.assertEqual([r.code for r in results if isinstance(r, ProjectError)], ["revision_conflict"])

    def test_two_independent_projects(self):
        second = self.repo.create("Independent", self.state)
        self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id, {"width_m": .75})
        self.assertNotEqual(second.project_id, self.project.project_id)
        self.assertEqual(self.repo.get(second.project_id), second)
        self.assertEqual(len(self.repo.list()), 2)

    def test_command_replay_and_mismatched_reuse(self):
        command_id = new_id()
        first = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id,
                                     {"width_m": .75}, command_id=command_id)
        again = self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id,
                                     {"width_m": .75}, command_id=command_id)
        self.assertEqual(first, again)
        with self.assertRaisesRegex(ProjectError, "Command ID"):
            self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id,
                                 {"width_m": .8}, command_id=command_id)

    def test_failed_receipt_write_rolls_back_already_executed_project_update(self):
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            db.execute("CREATE TRIGGER fail_receipt BEFORE INSERT ON commands BEGIN SELECT RAISE(ABORT,'simulated disk failure'); END")
        with self.assertRaises(ProjectError):
            self.repo.update_bed(self.project.project_id, self.project.revision_id, self.first.object_id,
                                 {"width_m": .75}, command_id=new_id())
        self.assertEqual(ProjectRepository(self.path).get(self.project.project_id), self.project)
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            self.assertEqual(db.execute("SELECT count(*) FROM commands").fetchone()[0], 0)

    def test_corrupted_storage_is_rejected(self):
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            db.execute("UPDATE projects SET geometry_token=?", ("0" * 64,))
        with self.assertRaisesRegex(ProjectError, "integrity"):
            self.repo.get(self.project.project_id)

    def test_unknown_or_foreign_database_not_migrated_silently(self):
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            db.execute("PRAGMA user_version=99")
        with self.assertRaisesRegex(ProjectError, "migration"):
            ProjectRepository(self.path)
        with closing(sqlite3.connect(self.path, isolation_level=None)) as db:
            self.assertEqual(db.execute("PRAGMA user_version").fetchone()[0], 99)
            self.assertEqual(db.execute("SELECT count(*) FROM projects").fetchone()[0], 1)


class APITests(unittest.TestCase):
    def setUp(self):
        logger = patch.object(APIHandler, "log_message", lambda *args: None)
        logger.start()
        self.addCleanup(logger.stop)
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.server = create_server(Path(self.temp.name) / "api.sqlite3", port=0)
        self.thread = Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.stop)
        parcel = parcel_with_hole()
        self.state = GeometryState(parcel, (bed(parcel, rotation_deg=17), bed(parcel, x=13)))

    def stop(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)

    def request(self, method, path, body=None, headers=None, raw=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        try:
            request_headers = {"Content-Type": "application/json"}
            request_headers.update(headers or {})
            encoded = raw if raw is not None else json.dumps(body) if body is not None else None
            connection.request(method, path, body=encoded, headers=request_headers)
            response = connection.getresponse()
            data = response.read()
            return response.status, json.loads(data) if data else None
        finally:
            connection.close()

    def create(self):
        status, data = self.request("POST", "/api/v1/projects", {"name": "SYNTHETIC API", "geometry": json.loads(dumps(self.state))})
        self.assertEqual(status, 201, data)
        return data["project"]

    def test_api_create_list_load_save_and_patch(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        self.assertEqual(self.request("GET", url)[1]["project"], project)
        self.assertEqual(len(self.request("GET", "/api/v1/projects")[1]["projects"]), 1)
        bed_id = self.state.beds[0].object_id
        status, data = self.request("PATCH", url + "/beds/" + bed_id,
                                    {"expected_revision": project["revision_id"], "changes": {"width_m": .75}})
        self.assertEqual(status, 200, data)
        saved = data["project"]
        self.assertEqual(saved["geometry"]["beds"][0]["width_m"], .75)
        self.assertEqual(saved["geometry"]["beds"][1], project["geometry"]["beds"][1])
        status, data = self.request("PUT", url, {"expected_revision": saved["revision_id"], "name": "Renamed", "geometry": saved["geometry"]})
        self.assertEqual(status, 200, data)
        self.assertEqual(data["project"]["name"], "Renamed")
        self.assertEqual(self.request("GET", url + "/validation")[1]["valid"], True)

    def test_api_add_bed_preserves_neighbors_and_survives_reload(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        drawn = bed(self.state.parcel, x=18, y=12, width_m=.83, length_m=5.17, rotation_deg=23.71)
        status, data = self.request("POST", url + "/beds", {
            "expected_revision": project["revision_id"], "command_id": new_id(), "bed": asdict(drawn)})
        self.assertEqual(status, 201, data)
        saved = data["project"]
        self.assertEqual(saved["geometry"]["beds"][:-1], project["geometry"]["beds"])
        self.assertEqual(saved["geometry"]["parcel"], project["geometry"]["parcel"])
        added = saved["geometry"]["beds"][-1]
        self.assertEqual(added, {**asdict(drawn), "revision_id": added["revision_id"]})
        self.assertNotEqual(added["revision_id"], drawn.revision_id)
        self.assertNotEqual(saved["revision_id"], project["revision_id"])
        self.assertNotEqual(saved["geometry_token"], project["geometry_token"])
        self.assertEqual(self.request("GET", url)[1]["project"], saved)
        reopened = ProjectRepository(Path(self.temp.name) / "api.sqlite3").get(project["project_id"])
        self.assertEqual(reopened.to_dict(), saved)

    def test_api_add_invalid_collision_boundary_hole_and_duplicate_never_writes(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        candidates = [bed(self.state.parcel), bed(self.state.parcel, x=-1),
                      bed(self.state.parcel, x=24.5, y=4.5, length_m=1), self.state.beds[0]]
        for candidate in candidates:
            with self.subTest(center=candidate.center):
                status, data = self.request("POST", url + "/beds", {
                    "expected_revision": project["revision_id"], "bed": asdict(candidate)})
                self.assertEqual(status, 422, data)
                self.assertEqual(self.request("GET", url)[1]["project"], project)

    def test_api_add_revision_idempotency_and_rollback(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        body = {"expected_revision": project["revision_id"], "command_id": new_id(),
                "bed": asdict(bed(self.state.parcel, x=18, y=12, length_m=4))}
        status, first = self.request("POST", url + "/beds", body)
        self.assertEqual(status, 201, first)
        self.assertEqual(self.request("POST", url + "/beds", body), (201, first))
        different = {**body, "command_id": new_id()}
        self.assertEqual(self.request("POST", url + "/beds", different)[0], 409)
        self.assertEqual(self.request("POST", url + "/beds", {"bed": body["bed"]})[0], 428)
        self.assertEqual(self.request("GET", url)[1]["project"], first["project"])
        current = first["project"]
        with closing(sqlite3.connect(Path(self.temp.name) / "api.sqlite3", isolation_level=None)) as db:
            db.execute("CREATE TRIGGER fail_add BEFORE INSERT ON commands BEGIN SELECT RAISE(ABORT,'disk failure'); END")
        status, _ = self.request("POST", url + "/beds", {
            "expected_revision": current["revision_id"], "command_id": new_id(),
            "bed": asdict(bed(self.state.parcel, x=21, y=12, length_m=4))})
        self.assertEqual(status, 500)
        self.assertEqual(self.request("GET", url)[1]["project"], current)

    def test_api_move_rotated_bed_preserves_dimensions_neighbors_and_reloads(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        status, data = self.request("PATCH", url + "/beds/" + self.state.beds[0].object_id, {
            "expected_revision": project["revision_id"], "changes": {"center": {"x": 7.12345, "y": 10.6789}}})
        self.assertEqual(status, 200, data)
        saved = data["project"]
        self.assertEqual(saved["geometry"]["beds"][1:], project["geometry"]["beds"][1:])
        before = project["geometry"]["beds"][0]
        moved = saved["geometry"]["beds"][0]
        self.assertEqual(moved, {**before, "center": {"x": 7.12345, "y": 10.6789}, "revision_id": moved["revision_id"]})
        self.assertEqual(moved["rotation_deg"], 17)
        self.assertEqual(self.request("GET", url)[1]["project"], saved)

    def test_api_move_invalid_positions_do_not_persist(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        for x, y in ((13, 9), (-1, 9), (24.5, 4.5)):
            with self.subTest(x=x, y=y):
                status, data = self.request("PATCH", url + "/beds/" + self.state.beds[0].object_id, {
                    "expected_revision": project["revision_id"], "changes": {"center": {"x": x, "y": y}}})
                self.assertEqual(status, 422, data)
                self.assertEqual(self.request("GET", url)[1]["project"], project)

    def test_full_save_still_rejects_added_beds(self):
        project = self.create()
        project["geometry"]["beds"].append(asdict(bed(self.state.parcel, x=18, y=12, length_m=4)))
        status, data = self.request("PUT", "/api/v1/projects/" + project["project_id"], {
            "expected_revision": project["revision_id"], "name": project["name"], "geometry": project["geometry"]})
        self.assertEqual(status, 422, data)
        self.assertEqual(data["error"]["code"], "identity_change")

    def test_api_conflict_and_required_revision(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        status, _ = self.request("PUT", url, {"expected_revision": project["revision_id"], "name": "new", "geometry": project["geometry"]})
        self.assertEqual(status, 200)
        status, data = self.request("PUT", url, {"expected_revision": project["revision_id"], "name": "stale", "geometry": project["geometry"]})
        self.assertEqual(status, 409)
        self.assertIn("current_revision", data["error"])
        self.assertEqual(self.request("PUT", url, {"name": "missing"})[0], 428)

    def test_api_invalid_geometry_has_structured_issues_and_no_write(self):
        raw = json.loads(dumps(self.state))
        raw["beds"][0]["center"] = {"x": 200, "y": 200}
        for path, body in (("/api/v1/projects", {"name": "invalid", "geometry": raw}),
                           ("/api/v1/geometry/validate", {"geometry": raw})):
            status, data = self.request("POST", path, body)
            self.assertEqual(status, 422)
            self.assertFalse(data["valid"])
            self.assertEqual(data["error"]["issues"][0]["code"], "outside_parcel")
        self.assertEqual(self.request("GET", "/api/v1/projects")[1]["projects"], [])

    def test_api_malformed_json_types_unknown_paths_and_media(self):
        self.assertEqual(self.request("POST", "/api/v1/projects", raw="{")[0], 400)
        self.assertEqual(self.request("POST", "/api/v1/projects", raw='{"a":1,"a":2}')[0], 400)
        self.assertEqual(self.request("POST", "/api/v1/projects", raw='{"a":NaN}')[0], 400)
        self.assertEqual(self.request("POST", "/api/v1/projects", {"name": "x"}, headers={"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.request("POST", "/api/v1/projects", {"name": "x"})[0], 422)
        self.assertEqual(self.request("GET", "/api/v1/missing")[0], 404)
        self.assertEqual(self.request("GET", "/api/v1/projects/" + new_id())[0], 404)
        self.assertEqual(self.request("GET", "/api/v1/projects/not-a-uuid")[0], 422)
        self.assertEqual(self.request("DELETE", "/api/v1/projects")[0], 405)

    def test_api_refuses_cross_origin_and_oversized_body(self):
        self.assertEqual(self.request("POST", "/api/v1/projects", {}, headers={"Origin": "https://example.org"})[0], 403)
        self.assertEqual(self.request("POST", "/api/v1/projects", {}, headers={"Host": "example.org"})[0], 403)
        self.assertEqual(self.request("POST", "/api/v1/projects", raw="", headers={"Content-Length": str(MAX_BODY_BYTES+1)})[0], 413)

    def test_api_validate_preview_does_not_persist(self):
        status, data = self.request("POST", "/api/v1/geometry/validate", {"geometry": json.loads(dumps(self.state))})
        self.assertEqual(status, 200)
        self.assertTrue(data["valid"])
        self.assertEqual(self.request("GET", "/api/v1/projects")[1]["projects"], [])

    def test_api_database_error_is_json_and_rolls_back(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        with closing(sqlite3.connect(Path(self.temp.name) / "api.sqlite3", isolation_level=None)) as db:
            db.execute("CREATE TRIGGER fail_save BEFORE UPDATE ON projects BEGIN SELECT RAISE(ABORT,'private SQL details'); END")
        status, data = self.request("PATCH", url + "/beds/" + self.state.beds[0].object_id,
                                    {"expected_revision": project["revision_id"], "changes": {"width_m": .75}})
        self.assertEqual(status, 500)
        self.assertEqual(data["error"]["code"], "database_error")
        self.assertNotIn("private SQL", json.dumps(data))
        self.assertEqual(self.request("GET", url)[1]["project"], project)

    def test_api_command_retry_and_locked_bed(self):
        project = self.create()
        url = "/api/v1/projects/" + project["project_id"]
        body = {"expected_revision": project["revision_id"], "command_id": new_id(), "changes": {"width_m": .75}}
        target = url + "/beds/" + self.state.beds[0].object_id
        status, first = self.request("PATCH", target, body)
        self.assertEqual(status, 200)
        self.assertEqual(self.request("PATCH", target, body), (200, first))
        edited = first["project"]
        edited["geometry"]["beds"][0]["geometry_locked"] = True
        status, data = self.request("PUT", url, {"expected_revision": edited["revision_id"], "name": edited["name"], "geometry": edited["geometry"]})
        self.assertEqual(status, 200)
        status, error = self.request("PATCH", target, {"expected_revision": data["project"]["revision_id"], "changes": {"width_m": .8}})
        self.assertEqual(status, 422)
        self.assertEqual(error["error"]["issues"][0]["code"], "geometry_locked")

    def test_demo_payload_remains_exactly_unchanged(self):
        expected = json.loads(json.dumps(payload(), default=lambda v: v.isoformat()))
        status, data = self.request("GET", "/api/demo")
        self.assertEqual(status, 200)
        self.assertEqual(data, expected)
        # Original demo handler remains available and does not import project API.
        from market_garden_planner.prototype.server import Handler
        self.assertNotIn("do_PATCH", Handler.__dict__)

    def test_original_server_still_serves_frontend_and_demo(self):
        from market_garden_planner.prototype.server import Handler
        # Test static serving without requiring a frontend build in Python-only CI.
        static = Path(self.temp.name) / "static"
        static.mkdir()
        (static / "index.html").write_text("<!doctype html><title>SYNTHETIC static fixture</title>", encoding="utf-8")
        original = ThreadingHTTPServer(("127.0.0.1", 0), partial(Handler, directory=str(static)))
        worker = Thread(target=original.serve_forever, daemon=True)
        worker.start()
        try:
            for path, expected_type in (("/", "text/html"), ("/api/demo", "application/json")):
                connection = http.client.HTTPConnection("127.0.0.1", original.server_port, timeout=5)
                try:
                    connection.request("GET", path)
                    response = connection.getresponse()
                    self.assertEqual(response.status, 200)
                    self.assertIn(expected_type, response.getheader("Content-Type"))
                    self.assertTrue(response.read())
                finally:
                    connection.close()
        finally:
            original.shutdown()
            original.server_close()
            worker.join(timeout=5)
