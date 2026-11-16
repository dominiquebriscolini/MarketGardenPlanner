"""Loopback-only, read-only development server. No production deployment server."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from .presentation import payload

ROOT = Path(__file__).resolve().parents[3]


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/demo":
            data = json.dumps(payload(), default=lambda v: v.isoformat(), ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        elif self.path.startswith("/api/"):
            self.send_error(404)
        else:
            super().do_GET()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    dist = ROOT / "frontend" / "dist"
    if not (dist / "index.html").exists():
        parser.error("Frontend fehlt. Zuerst in frontend: npm ci und npm run build ausführen.")
    with ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(dist))) as server:
        print(f"Market Garden Planner: http://127.0.0.1:{server.server_port} — Strg+C beendet den Server", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
