"""Loopback-only local project API, reusing the unchanged demo/static handler."""
import argparse
from dataclasses import asdict
from functools import partial
from http.server import ThreadingHTTPServer
import json
import logging
from pathlib import Path
from urllib.parse import urlsplit

from ..prototype.server import Handler as DemoHandler, ROOT
from ..projects.errors import ProjectError
from ..projects.repository import ProjectRepository
from ..spatial import GeometryValidationError
from ..spatial.serialization import unique_keys, reject_constant
from .routes import ProjectAPI

MAX_BODY_BYTES = 2 * 1024 * 1024


class Handler(DemoHandler):
    def __init__(self, *args, repository, **kwargs):
        self.api = ProjectAPI(repository)
        super().__init__(*args, **kwargs)

    def _json(self, status, data):
        encoded = json.dumps({"api_version": 1, **data}, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(encoded)

    def _body(self):
        if self.headers.get("Transfer-Encoding"):
            raise ProjectError("invalid_request", "Chunked requests are not supported", 400)
        content_type = self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
        if content_type != "application/json":
            raise ProjectError("unsupported_media_type", "Content-Type must be application/json", 415)
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError as error:
            raise ProjectError("invalid_request", "Content-Length required", 400) from error
        if not 0 < length <= MAX_BODY_BYTES:
            raise ProjectError("body_too_large", "Body must contain 1 byte to 2 MiB", 413)
        data = self.rfile.read(length)
        if len(data) != length:
            raise ProjectError("invalid_request", "Incomplete request body", 400)
        try:
            return json.loads(data.decode("utf-8"), object_pairs_hook=unique_keys, parse_constant=reject_constant)
        except (ValueError, UnicodeError, RecursionError) as error:
            raise ProjectError("invalid_json", "Invalid UTF-8 JSON (duplicates/non-finite numbers forbidden)", 400) from error

    def _dispatch(self):
        try:
            port = self.server.server_port
            hosts = {f"127.0.0.1:{port}", f"localhost:{port}"}
            if self.headers.get("Host") not in hosts:
                raise ProjectError("invalid_host", "Only the local server host is accepted", 403)
            origin = self.headers.get("Origin")
            if origin is not None and origin not in {f"http://{host}" for host in hosts}:
                raise ProjectError("invalid_origin", "Cross-origin requests are not permitted", 403)
            parsed = urlsplit(self.path)
            if parsed.query:
                raise ProjectError("invalid_request", "API query parameters are not supported", 400)
            body = self._body() if self.command in ("POST", "PUT", "PATCH") else None
            status, data = self.api.dispatch(self.command, parsed.path, body)
            self._json(status, data)
        except GeometryValidationError as error:
            self._json(422, {"valid": False, "error": {"code": "geometry_invalid", "message": str(error),
                                                       "issues": [asdict(i) for i in error.issues]}})
        except ProjectError as error:
            self._json(error.status, {"error": {"code": error.code, "message": str(error), **error.details}})
        except (ValueError, TypeError, OverflowError, RecursionError) as error:
            self._json(422, {"error": {"code": "invalid_data", "message": str(error)}})
        except Exception:
            logging.exception("Unhandled project API failure")
            self._json(500, {"error": {"code": "internal_error", "message": "Unexpected server error"}})

    def do_GET(self):
        if self.path.startswith("/api/") and self.path != "/api/demo":
            self._dispatch()
        else:
            super().do_GET()

    def do_POST(self):
        self._dispatch()

    do_PUT = do_POST
    do_PATCH = do_POST
    do_DELETE = do_POST
    do_OPTIONS = do_POST


def create_server(database, *, port=8766, directory=None):
    repository = ProjectRepository(database)
    handler = partial(Handler, repository=repository, directory=str(directory or ROOT / "frontend" / "dist"))
    return ThreadingHTTPServer(("127.0.0.1", port), handler)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", type=Path, default=ROOT / ".local" / "projects.sqlite3")
    parser.add_argument("--port", type=int, default=8766)
    args = parser.parse_args()
    if args.database == ROOT / ".local" / "projects.sqlite3":
        args.database.parent.mkdir(exist_ok=True)
    try:
        server = create_server(args.database, port=args.port)
    except (ProjectError, OSError) as error:
        parser.error(str(error))
    with server:
        print(f"Project API: http://127.0.0.1:{server.server_port} | SQLite: {args.database.resolve()}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
