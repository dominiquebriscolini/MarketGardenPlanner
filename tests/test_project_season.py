"""SYNTHETIC dates; weekly view is read-only and independent of real yields."""
from dataclasses import replace
from datetime import date
from pathlib import Path
import tempfile
import unittest

import test_projects as legacy
from test_spatial import bed, parcel_with_hole
from market_garden_planner.projects.repository import ProjectRepository
from market_garden_planner.projects.cultivation import CultivationIntent, CultivationPlan
from market_garden_planner.projects.season_view import project_season, iso_weeks
from market_garden_planner.spatial import GeometryState, new_id


class ProjectSeasonTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.repo=ProjectRepository(Path(self.temp.name)/"season.sqlite3")
        parcel=parcel_with_hole()
        self.bed=bed(parcel,rotation_deg=17)
        self.other=bed(parcel,x=13)
        self.project=self.repo.create("SYNTHETIC",GeometryState(parcel,(self.bed,self.other)))

    def entry(self,start,end=None,profile="radishes-spring"):
        return CultivationIntent(new_id(),new_id(),self.bed.object_id,profile,"direct",start,end)

    def view(self,*entries,year=2026):
        p=replace(self.project,cultivation_plan=CultivationPlan(new_id(),tuple(entries)))
        return project_season(p,year,today=date(2026,5,11))

    def state(self,data,week=20):
        return data["weeks"][week-1]["beds"][self.bed.object_id]

    def test_planting_grid_is_per_cultivation_and_has_provenance(self):
        radish = self.entry("2026-05-01", "2026-06-01")
        spinach = self.entry("2026-09-01", "2026-10-01", "spinach-autumn-direct")
        layouts = self.view(radish, spinach)["planting_layouts"]
        first, second = layouts[radish.cultivation_id], layouts[spinach.cultivation_id]
        self.assertGreater(first["capacity"], second["capacity"])
        self.assertEqual(first["capacity"], first["rows"] * first["positions_per_row"])
        self.assertEqual(first["row_spacing_m"], .15)
        self.assertEqual(second["plant_spacing_m"], .10)
        self.assertTrue(first["row_spacing_source"])
        self.assertEqual(second["plant_spacing_status"], "source_value")

    def test_reference_yield_preserves_source_unit_and_missing_values(self):
        beans = self.entry("2026-05-01", "2026-07-01", "bush-beans-direct")
        tomato = replace(self.entry("2026-05-01", "2026-09-01", "tomatoes-field-transplant"),
                         establishment="transplant")
        lettuce = replace(self.entry("2026-03-01", "2026-04-01", "lettuce-butterhead-transplant"),
                          establishment="transplant")
        layouts = self.view(beans, tomato, lettuce)["planting_layouts"]
        bean_layout = layouts[beans.cultivation_id]
        bean_yield = bean_layout["reference_yield"]
        self.assertEqual(bean_yield["basis"], "occupied_row_length")
        self.assertAlmostEqual(bean_yield["min_kg"], 80 * bean_layout["capacity"] * .06 / 30.48 * .45359237)
        tomato_layout = layouts[tomato.cultivation_id]
        tomato_yield = tomato_layout["reference_yield"]
        self.assertEqual(tomato_yield["basis"], "plant_positions")
        self.assertAlmostEqual(tomato_yield["max_kg"], 6 * tomato_layout["capacity"] * .45359237)
        self.assertIn("umn.edu", tomato_yield["source"])
        self.assertIsNone(layouts[lettuce.cultivation_id]["reference_yield"])

    def test_mixed_rows_use_profile_width_order_and_scale_reference_yield(self):
        self.bed = replace(self.bed, width_m=1.2, length_m=6)
        self.project = replace(self.project, geometry=replace(self.project.geometry, beds=(self.bed, self.other)))
        tomato = replace(self.entry("2026-05-01", "2026-06-01", "tomatoes-field-transplant"),
                         establishment="transplant", row_numbers=[1])
        radish = replace(self.entry("2026-05-01", "2026-06-01"), row_numbers=[5, 3, 2, 4])
        later = replace(self.entry("2026-06-02", "2026-07-01"), row_numbers=[1, 2])
        data = self.view(tomato, radish, later)
        state = self.state(data)
        self.assertAlmostEqual(state["row_positions_m"][tomato.cultivation_id][0], .3)
        self.assertEqual([round(x, 3) for x in state["row_positions_m"][radish.cultivation_id]],
                         [.675, .825, .975, 1.125])
        self.assertEqual(data["planting_layouts"][tomato.cultivation_id]["capacity"], 12)
        self.assertEqual(data["planting_layouts"][radish.cultivation_id]["capacity"], 600)
        estimate = data["planting_layouts"][tomato.cultivation_id]["reference_yield"]
        self.assertAlmostEqual(estimate["min_kg"], 12 * 2 * .45359237)
        following = self.state(data, week=23)
        self.assertEqual(set(following["row_positions_m"]), {later.cultivation_id})
        self.assertEqual(following["row_layout_day"], "2026-06-07")

    def test_incomplete_duplicate_and_too_wide_rows_are_not_projected(self):
        self.bed = replace(self.bed, width_m=1.2)
        self.project = replace(self.project, geometry=replace(self.project.geometry, beds=(self.bed, self.other)))
        a = replace(self.entry("2026-05-01", "2026-06-01", "tomatoes-field-transplant"), establishment="transplant", row_numbers=[1, 2])
        b = self.entry("2026-05-01", "2026-06-01")
        for rows, expected in [(None, "unassigned"), ([2], "duplicate"), ([3], "width")]:
            state = self.state(self.view(a, replace(b, row_numbers=rows)))
            self.assertEqual(state["row_layout_issue"], expected)
            self.assertNotIn("row_positions_m", state)

    def test_empty_future_current_completed_and_gap(self):
        self.assertEqual(self.state(self.view())["stage"],"unplanned")
        a=self.entry("2026-06-01","2026-07-01")
        self.assertEqual(self.state(self.view(a))["stage"],"future")
        b=self.entry("2026-05-01","2026-06-01")
        self.assertEqual(self.state(self.view(b))["stage"],"planned")
        c=self.entry("2026-03-01","2026-04-01")
        self.assertEqual(self.state(self.view(c))["stage"],"completed")
        self.assertEqual(self.state(self.view(a,c))["stage"],"gap")

    def test_week_has_any_known_day_and_harvest_sunday_is_included(self):
        # ISO week 20 is Monday May 11 through Sunday May 17.
        for day in ("2026-05-11","2026-05-17"):
            self.assertEqual(self.state(self.view(self.entry(day,day)))["stage"],"planned")
        self.assertEqual(self.state(self.view(self.entry("2026-05-18","2026-05-18")))["stage"],"future")
        self.assertEqual(self.state(self.view(self.entry("2026-05-10","2026-05-10")))["stage"],"completed")

    def test_successions_in_the_same_week_are_not_mixed_cultivation(self):
        first=self.entry("2026-05-11","2026-05-12")
        second=self.entry("2026-05-13","2026-05-17")
        s=self.state(self.view(first,second))
        self.assertEqual(s["stage"],"planned");self.assertTrue(s["succession"])
        self.assertEqual(len(s["active_ids"]),2)
        overlapping=replace(second,start_date="2026-05-12")
        s=self.state(self.view(first,overlapping))
        self.assertEqual(s["stage"],"overlap");self.assertFalse(s["succession"])

    def test_overlap_outside_selected_week_does_not_colour_the_week_as_mixed(self):
        a=self.entry("2026-05-01","2026-05-10")
        b=self.entry("2026-05-05","2026-05-15")
        self.assertEqual(self.state(self.view(a,b))["stage"],"planned")
        self.assertEqual(len(self.state(self.view(a,b))["active_ids"]),1)

    def test_missing_harvest_known_start_week_then_explicit_uncertainty(self):
        a=self.entry("2026-05-11")
        data=self.view(a)
        now=self.state(data)
        self.assertEqual(now["stage"],"planned");self.assertTrue(now["uncertain"])
        later=self.state(data,21)
        self.assertEqual(later["stage"],"uncertain");self.assertEqual(later["active_ids"],[])
        self.assertEqual(later["open_ids"],[a.cultivation_id])
        self.assertEqual(self.state(data,52)["stage"],"uncertain")

    def test_open_culture_plus_later_start_is_possible_not_definite_overlap(self):
        a=self.entry("2026-05-11")
        b=self.entry("2026-05-15","2026-05-17")
        s=self.state(self.view(a,b))
        self.assertEqual(s["stage"],"planned");self.assertTrue(s["possible_overlap"])
        self.assertFalse(s["succession"])
        same=replace(b,start_date="2026-05-11")
        self.assertEqual(self.state(self.view(a,same))["stage"],"overlap")

    def test_iso_year_week_1_52_53_and_cross_year_dates(self):
        self.assertEqual(len(iso_weeks(2020)),53);self.assertEqual(len(iso_weeks(2021)),52)
        data=self.view(self.entry("2020-12-31","2021-01-05"),year=2020)
        self.assertEqual(data["weeks"][52]["start_date"],"2020-12-28")
        self.assertEqual(data["weeks"][52]["end_date"],"2021-01-03")
        self.assertEqual(self.state(data,53)["stage"],"planned")
        following=self.view(self.entry("2020-12-31","2021-01-05"),year=2021)
        self.assertEqual(following["weeks"][0]["start_date"],"2021-01-04")
        self.assertEqual(self.state(following,1)["stage"],"planned")
        self.assertEqual(self.state(following,2)["stage"],"completed")
        first=self.view(self.entry("2019-12-30","2019-12-30"),year=2020)
        self.assertEqual(self.state(first,1)["stage"],"planned")
        self.assertEqual(first["weeks"][0]["iso_year"],2020)

    def test_missing_end_continues_as_unknown_across_iso_year_boundary(self):
        a=self.entry("2020-12-31")
        self.assertEqual(self.state(self.view(a,year=2021),1)["stage"],"uncertain")

    def test_projection_preserves_revision_geometry_and_other_beds(self):
        before=self.project.to_dict()
        data=project_season(self.project,2026,today=date(2026,5,11))
        self.assertEqual(data["revision_id"],self.project.revision_id)
        self.assertEqual(data["geometry_token"],before["geometry_token"])
        self.assertEqual(self.project.to_dict(),before)
        self.assertEqual(self.repo.get(self.project.project_id).to_dict(),before)
        self.assertEqual(data["weeks"][19]["beds"][self.other.object_id]["stage"],"unplanned")

    def test_year_validation_and_small_calendar_boundaries(self):
        for year in (0,9999,-1,True,"2026"):
            with self.assertRaises(ValueError):iso_weeks(year)
        self.assertEqual(iso_weeks(1)[0].start,date(1,1,1))
        self.assertIn(len(iso_weeks(9998)),(52,53))


class ProjectSeasonAPITests(unittest.TestCase):
    setUp=legacy.APITests.setUp
    stop=legacy.APITests.stop
    request=legacy.APITests.request
    create=legacy.APITests.create

    def test_get_readonly_projection_then_edit_in_same_week_and_reload(self):
        p=self.create();base=f'/api/v1/projects/{p["project_id"]}'
        bed_id=self.state.beds[0].object_id
        values=dict(profile_id="radishes-spring",establishment="direct",start_date="2026-05-11",planned_harvest_date="2026-05-17")
        status,data=self.request("POST",base+f'/beds/{bed_id}/cultivations',{"expected_revision":p["revision_id"],"cultivation":values})
        self.assertEqual(status,201);saved=data["project"]
        status,data=self.request("GET",base+"/season/2026")
        self.assertEqual(status,200)
        self.assertEqual(data["season"]["weeks"][19]["beds"][bed_id]["stage"],"planned")
        self.assertEqual(self.request("GET",base)[1]["project"],saved)
        cid=saved["cultivation_plan"]["entries"][0]["cultivation_id"]
        request={"expected_revision":saved["revision_id"],"cultivation":{**values,"start_date":"2026-06-01","planned_harvest_date":None}}
        status,edited=self.request("PUT",base+f'/beds/{bed_id}/cultivations/{cid}',request)
        self.assertEqual(status,200)
        self.assertEqual(edited["project"]["geometry"],p["geometry"])
        after=self.request("GET",base+"/season/2026")[1]["season"]
        self.assertEqual(after["weeks"][19]["beds"][bed_id]["stage"],"future")
        self.assertNotEqual(after["revision_id"],saved["revision_id"])
        self.assertEqual(after,self.request("GET",base+"/season/2026")[1]["season"])
        self.assertEqual(self.request("PUT",base+f'/beds/{bed_id}/cultivations/{cid}',request)[0],409)
        self.assertEqual(after,self.request("GET",base+"/season/2026")[1]["season"])
        self.assertEqual(self.request("GET",base+"/season/2020")[1]["season"]["weeks"][-1]["iso_week"],53)
        self.assertEqual(self.request("GET",base+"/season/0")[0],422)
        self.assertEqual(self.request("POST",base+"/season/2026",{})[0],405)
