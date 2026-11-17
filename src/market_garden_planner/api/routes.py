import json
import re
from ..projects.errors import ProjectError
from ..spatial import loads, geometry_token
from ..projects.catalogue import load_catalogue, catalogue_payload
from ..projects.cultivation_checks import analyze_input


def fields(body, required, optional=()):
    if not isinstance(body, dict) or set(body) - (set(required) | set(optional)) or set(required) - set(body):
        raise ProjectError("invalid_fields", f"Required fields: {', '.join(required)}; optional: {', '.join(optional)}")


def spatial_input(body):
    return loads(json.dumps(body["geometry"], allow_nan=False))


class ProjectAPI:
    def __init__(self, repository):
        self.repository = repository

    def dispatch(self, method, path, body=None):
        if path == "/api/v1/cultivations/analyze":
            if method != "POST":
                raise ProjectError("method_not_allowed", "Use POST", 405)
            fields(body, ("entries",))
            return 200, {"analysis": analyze_input(body["entries"])}
        if path == "/api/v1/cultures":
            if method != "GET":
                raise ProjectError("method_not_allowed", "Use GET", 405)
            return 200, catalogue_payload(load_catalogue())
        cultivation = re.fullmatch(r"/api/v1/projects/([^/]+)/beds/([^/]+)/cultivations(?:/([^/]+))?", path)
        if cultivation:
            project_id, bed_id, cultivation_id = cultivation.groups()
            if method == "GET" and cultivation_id is None:
                project = self.repository.get(project_id)
                if not any(b.object_id == bed_id for b in project.geometry.beds):
                    raise ProjectError("bed_not_found", "Beet nicht gefunden.", 404)
                return 200, {"revision_id": project.revision_id,
                             "cultivations": [e for e in project.cultivation_plan.to_dict()["entries"] if e["bed_id"] == bed_id]}
            operation = "add" if method == "POST" and cultivation_id is None else "update" if method == "PUT" and cultivation_id else "delete" if method == "DELETE" and cultivation_id else None
            if operation is None:
                raise ProjectError("method_not_allowed", "Use GET/POST on collection, PUT/DELETE on an entry", 405)
            if body is None or isinstance(body, dict) and "expected_revision" not in body:
                raise ProjectError("revision_required", "expected_revision is required", 428)
            fields(body, ("expected_revision",) if operation == "delete" else ("expected_revision", "cultivation"), ("command_id",))
            project = self.repository.change_cultivation(project_id, body["expected_revision"], bed_id,
                operation, body.get("cultivation"), cultivation_id, command_id=body.get("command_id"))
            return 201 if operation == "add" else 200, {"project": project.to_dict()}
        if path == "/api/v1/projects":
            if method == "GET":
                return 200, {"projects": self.repository.list()}
            if method == "POST":
                fields(body, ("name", "geometry"))
                return 201, {"project": self.repository.create(body["name"], spatial_input(body)).to_dict()}
            raise ProjectError("method_not_allowed", "Use GET or POST", 405)
        if path == "/api/v1/geometry/validate":
            if method != "POST":
                raise ProjectError("method_not_allowed", "Use POST", 405)
            fields(body, ("geometry",))
            state = spatial_input(body)
            return 200, {"valid": True, "issues": [], "geometry_token": geometry_token(state)}
        match = re.fullmatch(r"/api/v1/projects/([^/]+)(?:/(validation|beds|beds/([^/]+)))?", path)
        if not match:
            raise ProjectError("not_found", "Unknown API endpoint", 404)
        project_id, suffix, bed_id = match.groups()
        if method == "POST" and suffix == "beds":
            if isinstance(body, dict) and "expected_revision" not in body:
                raise ProjectError("revision_required", "expected_revision is required", 428)
            fields(body, ("expected_revision", "bed"), ("command_id",))
            project = self.repository.add_bed(project_id, body["expected_revision"], body["bed"],
                                              command_id=body.get("command_id"))
            return 201, {"project": project.to_dict()}
        if method == "GET" and suffix in (None, "validation"):
            project = self.repository.get(project_id)
            if suffix:
                return 200, {"valid": True, "issues": [], "revision_id": project.revision_id,
                             "geometry_token": geometry_token(project.geometry)}
            return 200, {"project": project.to_dict()}
        if method == "DELETE" and bed_id:
            if body is None or isinstance(body, dict) and "expected_revision" not in body:
                raise ProjectError("revision_required", "expected_revision is required", 428)
            fields(body, ("expected_revision",), ("command_id",))
            project = self.repository.delete_bed(project_id, body["expected_revision"], bed_id,
                                                command_id=body.get("command_id"))
            return 200, {"project": project.to_dict()}
        if (method == "PUT" and suffix is None) or (method == "PATCH" and bed_id):
            if isinstance(body, dict) and "expected_revision" not in body:
                raise ProjectError("revision_required", "expected_revision is required", 428)
            if method == "PUT":
                fields(body, ("expected_revision", "name", "geometry"), ("command_id",))
                project = self.repository.save(project_id, body["expected_revision"], body["name"],
                                               spatial_input(body), command_id=body.get("command_id"))
            else:
                fields(body, ("expected_revision", "changes"), ("command_id",))
                project = self.repository.update_bed(project_id, body["expected_revision"], bed_id,
                                                     body["changes"], command_id=body.get("command_id"))
            return 200, {"project": project.to_dict()}
        raise ProjectError("method_not_allowed", "Method is not supported for this resource", 405)
