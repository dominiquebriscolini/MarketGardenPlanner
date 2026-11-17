"""SYNTHETIC project and week data from the actual repository/Python projection."""
from datetime import date
import json
from pathlib import Path
import tempfile
from market_garden_planner.spatial import BedGeometry, GeometryState, Parcel, Point, new_id
from market_garden_planner.projects.repository import ProjectRepository
from market_garden_planner.projects.season_view import project_season


def fixture():
    parcel = Parcel(new_id(), tuple(Point(*p) for p in [(0,0),(28,0),(26,20),(20,24),(0,20),(0,0)]),
                    holes=(tuple(Point(*p) for p in [(16,10),(20,10),(20,14),(16,14),(16,10)]),),
                    name="Synthetischer Saison-Testgarten", source_reference="SYNTHETIC SEASON TEST")
    beds = tuple(BedGeometry(new_id(), parcel.object_id, Point(x,6), 1,6,17 if i==0 else 0,
                            name=f"B{i+1:02}", source_reference="SYNTHETIC SEASON TEST") for i,x in enumerate([3,6,9,12,15,22]))
    specs = [(1,"radishes-spring","direct","2026-06-01","2026-07-01"),
             (3,"radishes-spring","direct","2020-12-31","2021-01-05"),
             (2,"lettuce-butterhead-transplant","transplant","2026-05-01","2026-06-01"),
             (3,"radishes-spring","direct","2026-03-01","2026-04-01"),
             (4,"spinach-spring-direct","direct","2026-05-01","2026-06-15"),
             (4,"radishes-spring","direct","2026-05-10","2026-05-20"),
             (5,"carrots-early-lwg","direct","2026-04-01",None)]
    with tempfile.TemporaryDirectory() as directory:
        repo=ProjectRepository(Path(directory)/"test.sqlite3")
        p=repo.create("SYNTHETISCH – Saisonplanung 3C.2",GeometryState(parcel,beds))
        for index,profile,method,start,end in specs:
            p=repo.change_cultivation(p.project_id,p.revision_id,beds[index].object_id,"add",dict(
                profile_id=profile,establishment=method,start_date=start,planned_harvest_date=end))
        return {"project":p.to_dict(),"seasons":{str(year):{"api_version":1,"season":project_season(p,year,today=date(2026,5,11))} for year in (2020,2021,2026)}}


if __name__=="__main__":
    Path(".test-build/season.json").write_text(json.dumps(fixture(),ensure_ascii=False),encoding="utf-8")
