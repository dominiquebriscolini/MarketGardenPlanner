"""SQLite stores the existing validated spatial JSON, never parallel geometry tables."""
from contextlib import contextmanager
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import sqlite3

from ..spatial import GeometryState, dumps, loads, geometry_token, new_id
from ..spatial.models import require_uuid
from ..spatial.serialization import unique_keys, reject_constant
from .errors import ProjectError
from .geometry_updates import append_bed, reconcile, patch_bed, remove_bed
from .cultivation import CultivationPlan, change_plan
from .catalogue import load_catalogue
from .schema import APPLICATION_ID, SCHEMA_VERSION, ensure_schema



@dataclass(frozen=True)
class Project:
    project_id: str
    name: str
    revision_id: str
    geometry: GeometryState
    created_at: str
    updated_at: str
    cultivation_plan: CultivationPlan

    def to_dict(self):
        return {"project_id": self.project_id, "name": self.name, "revision_id": self.revision_id,
                "geometry": json.loads(dumps(self.geometry)), "geometry_token": geometry_token(self.geometry),
                "created_at": self.created_at, "updated_at": self.updated_at,
                "cultivation_plan": self.cultivation_plan.to_dict()}


def project_name(name):
    if not isinstance(name, str) or not name.strip() or len(name) > 200:
        raise ProjectError("invalid_name", "Project name must contain 1–200 characters")


class ProjectRepository:
    def __init__(self, path: str | Path):
        self.path = Path(path).resolve()
        # No implicit directory creation or in-memory connection ambiguity.
        if str(path) == ":memory:":
            raise ProjectError("database_path", "Use a local file database")
        with self._connection(write=True) as db:
            ensure_schema(db)

    @contextmanager
    def _connection(self, write=False):
        db = None
        try:
            db = sqlite3.connect(self.path, timeout=5, isolation_level=None)
            db.row_factory = sqlite3.Row
            db.execute("PRAGMA foreign_keys=ON")
            db.execute("PRAGMA synchronous=FULL")
            db.execute("BEGIN IMMEDIATE" if write else "BEGIN")
            yield db
            db.commit()
        except sqlite3.Error as error:
            if db is not None:
                db.rollback()
            busy = getattr(error, "sqlite_errorcode", None) in (sqlite3.SQLITE_BUSY, sqlite3.SQLITE_LOCKED)
            raise ProjectError("database_busy" if busy else "database_error",
                               "Database is busy; retry after reloading" if busy else "Database operation failed; no change committed",
                               503 if busy else 500) from error
        except BaseException:
            if db is not None:
                db.rollback()
            raise
        finally:
            if db is not None:
                db.close()

    @staticmethod
    def _decode(row):
        try:
            require_uuid(row["project_id"])
            require_uuid(row["revision_id"])
            project_name(row["name"])
            geometry = loads(row["geometry_json"])
            if geometry_token(geometry) != row["geometry_token"]:
                raise ValueError("Geometry checksum mismatch")
            if "plan_json" in row:
                plan = CultivationPlan.from_dict(json.loads(row["plan_json"], object_pairs_hook=unique_keys, parse_constant=reject_constant))
            elif "cultivation_plan" in row:
                plan = CultivationPlan.from_dict(row["cultivation_plan"])
            else:
                plan = CultivationPlan.empty(row["project_id"])
            plan.validate_beds(geometry)
            return Project(row["project_id"], row["name"], row["revision_id"], geometry,
                           row["created_at"], row["updated_at"], plan)
        except (ValueError, TypeError, KeyError) as error:
            raise ProjectError("corrupt_project", "Stored project failed validation/integrity check", 500) from error

    def _get(self, db, project_id):
        require_uuid(project_id)
        row = db.execute("SELECT * FROM projects WHERE project_id=?", (project_id,)).fetchone()
        if row is None:
            raise ProjectError("project_not_found", "Project not found", 404)
        plan_row = db.execute("SELECT plan_json FROM cultivation_plans WHERE project_id=?", (project_id,)).fetchone()
        if plan_row is None:
            raise ProjectError("corrupt_project", "Cultivation plan is missing", 500)
        return self._decode({**dict(row), "plan_json": plan_row[0]})

    def get(self, project_id) -> Project:
        with self._connection() as db:
            return self._get(db, project_id)

    def list(self):
        with self._connection() as db:
            summaries = []
            for row in db.execute("SELECT * FROM projects ORDER BY created_at, project_id"):
                item = self._get(db, row["project_id"]).to_dict()
                item.pop("geometry")
                item.pop("cultivation_plan")
                summaries.append(item)
            return summaries

    def create(self, name: str, geometry: GeometryState) -> Project:
        project_name(name)
        serialized = dumps(geometry)
        now = datetime.now(timezone.utc).isoformat()
        project_id = new_id()
        project = Project(project_id, name, new_id(), geometry, now, now, CultivationPlan.empty(project_id))
        with self._connection(write=True) as db:
            db.execute("INSERT INTO projects VALUES (?,?,?,?,?,?,?)",
                       (project.project_id, name, project.revision_id, serialized, geometry_token(geometry), now, now))
            db.execute("INSERT INTO cultivation_plans VALUES (?,?)", (project_id, json.dumps(project.cultivation_plan.to_dict())))
        return project

    def _change(self, project_id, expected_revision, transform, request, command_id, *, allow_add=False, allow_remove=False, cultivation_transform=None):
        require_uuid(expected_revision)
        if command_id is not None:
            require_uuid(command_id)
        request_hash = sha256(json.dumps(request, sort_keys=True, allow_nan=False).encode()).hexdigest()
        with self._connection(write=True) as db:
            before = self._get(db, project_id)
            if command_id:
                receipt = db.execute("SELECT * FROM commands WHERE project_id=? AND command_id=?", (project_id, command_id)).fetchone()
                if receipt:
                    if receipt["request_hash"] != request_hash:
                        raise ProjectError("command_conflict", "Command ID was already used with different input", 409)
                    try:
                        data = json.loads(receipt["response_json"])
                        return self._decode({**data, "geometry_json": json.dumps(data["geometry"])})
                    except (ValueError, TypeError, KeyError) as error:
                        raise ProjectError("corrupt_command", "Stored command receipt is invalid", 500) from error
            if expected_revision != before.revision_id:
                raise ProjectError("revision_conflict", "Project has a newer revision; reload before saving", 409,
                                   expected_revision=expected_revision, current_revision=before.revision_id)
            name, candidate = transform(before)
            if allow_add:
                added_id = next(b.object_id for b in candidate.beds if all(b.object_id != old.object_id for old in before.geometry.beds))
                for receipt in db.execute("SELECT response_json FROM commands WHERE project_id=?", (project_id,)):
                    try:
                        retired_id = json.loads(receipt["response_json"]).get("_deleted_bed_id")
                    except (ValueError, TypeError, AttributeError) as error:
                        raise ProjectError("corrupt_command", "Stored command receipt is invalid", 500) from error
                    if retired_id == added_id:
                        raise ProjectError("retired_id", "Deleted bed IDs cannot be reused in this project")
            project_name(name)
            geometry = reconcile(before.geometry, candidate, allow_add=allow_add, allow_remove=allow_remove)
            plan = cultivation_transform(before) if cultivation_transform else before.cultivation_plan
            plan.validate_beds(geometry)
            if geometry == before.geometry and name == before.name and plan == before.cultivation_plan:
                result = before
            else:
                result = Project(project_id, name, new_id(), geometry, before.created_at,
                                 datetime.now(timezone.utc).isoformat(), plan)
                if geometry == before.geometry:
                    updated = db.execute("UPDATE projects SET name=?,revision_id=?,updated_at=? WHERE project_id=? AND revision_id=?",
                                         (name, result.revision_id, result.updated_at, project_id, expected_revision))
                else:
                    updated = db.execute("UPDATE projects SET name=?,revision_id=?,geometry_json=?,geometry_token=?,updated_at=? WHERE project_id=? AND revision_id=?",
                                         (name, result.revision_id, dumps(geometry), geometry_token(geometry), result.updated_at, project_id, expected_revision))
                if updated.rowcount != 1:
                    raise ProjectError("revision_conflict", "Concurrent project modification", 409)
                if plan != before.cultivation_plan:
                    db.execute("UPDATE cultivation_plans SET plan_json=? WHERE project_id=?",
                               (json.dumps(plan.to_dict(), allow_nan=False), project_id))
            if command_id:
                receipt_data = result.to_dict()
                if allow_remove:
                    receipt_data["_deleted_bed_id"] = request["bed_id"]
                db.execute("INSERT INTO commands VALUES (?,?,?,?)",
                           (project_id, command_id, request_hash, json.dumps(receipt_data, allow_nan=False)))
            return result

    def save(self, project_id, expected_revision, name, geometry, *, command_id=None):
        request = {"operation": "save", "expected_revision": expected_revision, "name": name, "geometry": json.loads(dumps(geometry))}
        return self._change(project_id, expected_revision, lambda before: (name, geometry), request, command_id)

    def update_bed(self, project_id, expected_revision, bed_id, changes, *, command_id=None):
        require_uuid(bed_id)
        request = {"operation": "update_bed", "expected_revision": expected_revision, "bed_id": bed_id, "changes": changes}
        return self._change(project_id, expected_revision,
                            lambda before: (before.name, patch_bed(before.geometry, bed_id, changes)), request, command_id)

    def add_bed(self, project_id, expected_revision, bed, *, command_id=None):
        request = {"operation": "add_bed", "expected_revision": expected_revision, "bed": bed}
        return self._change(project_id, expected_revision,
                            lambda before: (before.name, append_bed(before.geometry, bed)),
                            request, command_id, allow_add=True)

    def delete_bed(self, project_id, expected_revision, bed_id, *, command_id=None):
        require_uuid(bed_id)
        request = {"operation": "delete_bed", "expected_revision": expected_revision, "bed_id": bed_id}
        # Even callers without an id receive a durable retirement receipt.
        return self._change(project_id, expected_revision,
                            lambda before: (before.name, remove_bed(before.geometry, bed_id)),
                            request, command_id if command_id is not None else new_id(), allow_remove=True)

    def change_cultivation(self, project_id, expected_revision, bed_id, operation, values=None, cultivation_id=None, *, command_id=None):
        if operation not in ("add", "update", "delete"):
            raise ProjectError("invalid_operation", "Unknown cultivation operation")
        if cultivation_id is not None:
            require_uuid(cultivation_id)
        catalogue = load_catalogue()
        request = {"operation": "cultivation_" + operation, "expected_revision": expected_revision,
                   "bed_id": bed_id, "cultivation_id": cultivation_id, "values": values}
        return self._change(project_id, expected_revision, lambda before: (before.name, before.geometry),
                            request, command_id,
                            cultivation_transform=lambda before: change_plan(before.cultivation_plan, before.geometry,
                                catalogue, operation, bed_id, values, cultivation_id))
