"""SYNTHETIC display fixture from the real geometry model and repository."""
import json
from pathlib import Path
import tempfile
from market_garden_planner.spatial import BedGeometry, GeometryState, Parcel, Point, new_id
from market_garden_planner.projects.repository import ProjectRepository


def points(values):
    return tuple(Point(*p) for p in values)


def fixture():
    parcel = Parcel(new_id(), points([(0, 0), (28, 0), (26, 20), (20, 24), (0, 20), (0, 0)]),
                    holes=(points([(16, 10), (20, 10), (20, 14), (16, 14), (16, 10)]),),
                    name="Schräges Testgrundstück", source_reference="SYNTHETIC DISPLAY TEST")
    beds = (BedGeometry(new_id(), parcel.object_id, Point(5, 9), .65, 8, 17,
                        name="Beet 17°", source_reference="SYNTHETIC DISPLAY TEST", generation_protected=True),
            BedGeometry(new_id(), parcel.object_id, Point(11, 9), 1.2, 6, 329,
                        name="Bestandsbeet", source_reference="SYNTHETIC DISPLAY TEST", geometry_locked=True))
    with tempfile.TemporaryDirectory() as directory:
        project = ProjectRepository(Path(directory) / "fixture.sqlite3").create("SYNTHETIC · Schräger Garten", GeometryState(parcel, beds))
        return {"api_version": 1, "project": project.to_dict()}


if __name__ == "__main__":
    Path(".test-build/project.json").write_text(json.dumps(fixture(), ensure_ascii=False), encoding="utf-8")
