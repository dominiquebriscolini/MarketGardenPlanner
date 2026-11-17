"""Explicit transactional schema-1 -> schema-2 migration; geometry is untouched."""
import json
from .cultivation import CultivationPlan
from .errors import ProjectError

APPLICATION_ID = 0x4D475031
SCHEMA_VERSION = 2
BASE_COLUMNS = {
    "projects": {"project_id", "name", "revision_id", "geometry_json", "geometry_token", "created_at", "updated_at"},
    "commands": {"project_id", "command_id", "request_hash", "response_json"},
}


def ensure_schema(db):
    version = db.execute("PRAGMA user_version").fetchone()[0]
    app = db.execute("PRAGMA application_id").fetchone()[0]
    tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    if version == 0 and app == 0 and not tables:
        db.execute("""CREATE TABLE projects (
            project_id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 200),
            revision_id TEXT NOT NULL, geometry_json TEXT NOT NULL,
            geometry_token TEXT NOT NULL CHECK(length(geometry_token)=64),
            created_at TEXT NOT NULL, updated_at TEXT NOT NULL)""")
        db.execute("""CREATE TABLE commands (
            project_id TEXT NOT NULL REFERENCES projects(project_id), command_id TEXT NOT NULL,
            request_hash TEXT NOT NULL, response_json TEXT NOT NULL, PRIMARY KEY(project_id, command_id))""")
        db.execute(f"PRAGMA application_id={APPLICATION_ID}")
        version = 1
    elif version not in (1, 2) or app != APPLICATION_ID:
        raise ProjectError("database_schema", "Unsupported/foreign database; explicit migration required", 500)
    for table, columns in BASE_COLUMNS.items():
        if {r[1] for r in db.execute(f"PRAGMA table_info({table})")} != columns:
            raise ProjectError("database_schema", "Database table schema mismatch", 500)
    if version == 1:
        db.execute("""CREATE TABLE cultivation_plans (
            project_id TEXT PRIMARY KEY NOT NULL REFERENCES projects(project_id), plan_json TEXT NOT NULL)""")
        for row in db.execute("SELECT project_id FROM projects").fetchall():
            plan = CultivationPlan.empty(row[0])
            db.execute("INSERT INTO cultivation_plans VALUES (?,?)", (row[0], json.dumps(plan.to_dict())))
        db.execute(f"PRAGMA user_version={SCHEMA_VERSION}")
    if {r[1] for r in db.execute("PRAGMA table_info(cultivation_plans)")} != {"project_id", "plan_json"}:
        raise ProjectError("database_schema", "Cultivation schema mismatch", 500)
