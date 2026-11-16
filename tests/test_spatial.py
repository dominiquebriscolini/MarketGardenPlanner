"""Phase 3B.1 contract tests. Geometry and crop test values are SYNTHETIC."""
import copy
import json
import math
import unittest
from dataclasses import FrozenInstanceError, asdict, replace
from unittest.mock import patch

from market_garden_planner import plan_season
from market_garden_planner.occupancy import bed_capacity
from market_garden_planner.prototype import demo
from market_garden_planner.spatial import (
    BedGeometry, CoordinateFrame, GeometryState, GeometryValidationError, Parcel, Point,
    corners, dumps, geometry_token, loads, new_id, require_valid, resize_bed_width,
    scheduler_beds, validate,
)
from market_garden_planner.spatial.migration import migrate_svg_demo
from market_garden_planner.spatial.validation import bed_polygon, parcel_polygon
from seasonal_fixtures import p, profile


def ring(*points):
    return tuple(Point(*point) for point in points)


def parcel_with_hole():
    return Parcel(new_id(), ring((0, 0), (30, 0), (29, 20), (23, 26), (15, 20),
                                 (0, 25), (0, 0)),
                  holes=(ring((23, 3), (26, 3), (26, 6), (23, 6), (23, 3)),))


def bed(parcel, x=6, y=9, **kwargs):
    return BedGeometry(new_id(), parcel.object_id, Point(x, y),
                       kwargs.pop("width_m", .65), kwargs.pop("length_m", 8), **kwargs)


class SpatialTests(unittest.TestCase):
    def setUp(self):
        self.parcel = parcel_with_hole()
        self.first = bed(self.parcel, rotation_deg=17)
        self.neighbor = bed(self.parcel, x=13, rotation_deg=29)
        self.state = GeometryState(self.parcel, (self.first, self.neighbor))

    def test_irregular_concave_parcel_with_slopes_and_hole(self):
        require_valid(self.state)
        self.assertEqual(len(parcel_polygon(self.parcel).interiors), 1)
        self.assertGreater(parcel_polygon(self.parcel).area, 0)

    def test_rotated_17_degree_rectangle_has_metric_edges_and_area(self):
        points = corners(self.first)
        self.assertAlmostEqual(self.first.area_m2, 5.2)
        self.assertAlmostEqual(bed_polygon(self.first).area, 5.2)
        self.assertAlmostEqual(math.dist(asdict(points[0]).values(), asdict(points[1]).values()), .65)
        self.assertAlmostEqual(math.dist(asdict(points[1]).values(), asdict(points[2]).values()), 8)
        self.assertAlmostEqual(math.degrees(math.atan2(points[1].y-points[0].y, points[1].x-points[0].x)), 17)

    def test_symmetric_resize_updates_only_target_and_revision(self):
        token = geometry_token(self.state)
        result = resize_bed_width(self.state, self.first.object_id, .75,
                                  expected_revision_id=self.state.revision_id)
        changed = result.beds[0]
        self.assertEqual(changed.object_id, self.first.object_id)
        self.assertEqual(changed.center, self.first.center)
        self.assertEqual(changed.rotation_deg, 17)
        self.assertEqual(changed.length_m, 8)
        self.assertAlmostEqual(changed.area_m2, 6)
        self.assertNotEqual(changed.revision_id, self.first.revision_id)
        self.assertNotEqual(result.revision_id, self.state.revision_id)
        self.assertIs(result.beds[1], self.neighbor)
        self.assertIs(result.parcel, self.parcel)
        self.assertNotEqual(token, geometry_token(result))
        self.assertEqual(token, geometry_token(self.state))
        self.assertEqual(self.first.width_m, .65)

    def test_one_sided_resize_keeps_selected_edge_at_17_degrees(self):
        old = corners(self.first)
        for anchor, indices in (("negative_edge", (0, 3)), ("positive_edge", (1, 2))):
            with self.subTest(anchor=anchor):
                changed = corners(resize_bed_width(self.state, self.first.object_id, .75, anchor=anchor).beds[0])
                for i in indices:
                    self.assertAlmostEqual(changed[i].x, old[i].x, places=12)
                    self.assertAlmostEqual(changed[i].y, old[i].y, places=12)

    def test_collision_detected_with_both_ids(self):
        collided = replace(self.neighbor, center=self.first.center)
        issues = validate(replace(self.state, beds=(self.first, collided)))
        self.assertEqual(issues[0].code, "bed_overlap")
        self.assertEqual(issues[0].object_ids, (self.first.object_id, self.neighbor.object_id))
        self.assertIsNotNone(issues[0].geometry_wkt)

    def test_contained_duplicate_bed_is_a_collision_too(self):
        inside = bed(self.parcel, x=6, y=9, width_m=.1, length_m=1, rotation_deg=17)
        self.assertIn("bed_overlap", [i.code for i in validate(replace(self.state, beds=(self.first, inside)))])

    def test_beet_outside_slanted_boundary(self):
        outside = bed(self.parcel, x=29.7, y=10)
        issues = validate(replace(self.state, beds=(outside,)))
        self.assertEqual(issues[0].code, "outside_parcel")
        with self.assertRaises(GeometryValidationError):
            scheduler_beds(replace(self.state, beds=(outside,)))

    def test_hole_excludes_bed_even_when_all_within_outer_ring(self):
        inside_hole = bed(self.parcel, x=24.5, y=4.5, length_m=1)
        self.assertEqual(validate(replace(self.state, beds=(inside_hole,)))[0].code, "outside_parcel")

    def test_invalid_self_crossing_polygon_not_repaired(self):
        parcel = replace(self.parcel, outer=ring((0, 0), (10, 10), (0, 10), (10, 0), (0, 0)), holes=())
        invalid = GeometryState(parcel, ())
        before = parcel.outer
        self.assertEqual(validate(invalid)[0].code, "invalid_polygon")
        with self.assertRaises(GeometryValidationError):
            dumps(invalid)
        self.assertIs(parcel.outer, before)

    def test_invalid_hole_and_zero_area_rejected(self):
        for parcel in (replace(self.parcel, holes=(ring((40, 0), (41, 0), (41, 1), (40, 0)),)),
                       replace(self.parcel, outer=ring((0, 0), (1, 0), (2, 0), (0, 0)), holes=())):
            self.assertEqual(validate(GeometryState(parcel, ()))[0].code, "invalid_polygon")

    def test_axis_aligned_edge_touching_is_allowed(self):
        first = bed(self.parcel, width_m=1)
        second = bed(self.parcel, x=7, width_m=1)
        require_valid(GeometryState(self.parcel, (first, second)))

    def test_rotated_touching_edges_and_small_positive_overlap(self):
        angle = math.radians(17)
        touching = bed(self.parcel, x=6 + .65 * math.cos(angle),
                       y=9 + .65 * math.sin(angle), rotation_deg=17)
        require_valid(GeometryState(self.parcel, (self.first, touching)))
        overlap = replace(touching, center=Point(touching.center.x - 1e-5 * math.cos(angle),
                                                touching.center.y - 1e-5 * math.sin(angle)))
        self.assertEqual(validate(GeometryState(self.parcel, (self.first, overlap)))[0].code, "bed_overlap")

    def test_invalid_resize_rolls_back_entire_state(self):
        neighbor = bed(self.parcel, x=6.7, width_m=.65)
        first = replace(self.first, rotation_deg=0)
        state = GeometryState(self.parcel, (first, neighbor))
        before = dumps(state)
        with self.assertRaises(GeometryValidationError) as failure:
            resize_bed_width(state, first.object_id, 1)
        self.assertEqual(failure.exception.issues[0].code, "bed_overlap")
        self.assertEqual(dumps(state), before)

    def test_lock_revision_guard_and_noop(self):
        locked = replace(self.first, geometry_locked=True)
        with self.assertRaisesRegex(GeometryValidationError, "geometry_locked"):
            resize_bed_width(replace(self.state, beds=(locked,)), locked.object_id, .75)
        with self.assertRaisesRegex(GeometryValidationError, "revision_conflict"):
            resize_bed_width(self.state, self.first.object_id, .75, expected_revision_id=new_id())
        with self.assertRaisesRegex(GeometryValidationError, "unknown_bed"):
            resize_bed_width(self.state, new_id(), .75)
        self.assertIs(resize_bed_width(self.state, self.first.object_id, .65), self.state)

    def test_generator_protection_does_not_forbid_explicit_manual_resize(self):
        protected = replace(self.first, generation_protected=True)
        result = resize_bed_width(replace(self.state, beds=(protected,)), protected.object_id, .75)
        self.assertTrue(result.beds[0].generation_protected)

    def test_roundtrip_preserves_all_identity_precision_and_metadata(self):
        first = replace(self.first, center=Point(6.123456789123, 9.0123456789), generation_protected=True,
                        source_reference="SYNTHETIC", name="Testbeet ä")
        state = replace(self.state, beds=(first, self.neighbor))
        exported = dumps(state)
        self.assertEqual(loads(exported), state)
        self.assertEqual(dumps(loads(exported)), exported)
        self.assertEqual(geometry_token(loads(exported)), geometry_token(state))
        changed_without_revision = replace(state, beds=(replace(first, width_m=.75), self.neighbor))
        self.assertNotEqual(geometry_token(state), geometry_token(changed_without_revision))

    def test_json_rejects_unknown_missing_and_invalid_data(self):
        raw = json.loads(dumps(self.state))
        for key, value in (("schema_version", 2), ("schema_version", True), ("format", "other")):
            with self.subTest(key=key, value=value), self.assertRaises(ValueError):
                loads(json.dumps({**raw, key: value}))
        for mutate in (lambda r: r["beds"][0].pop("revision_id"),
                       lambda r: r["beds"][0].update(extra=2),
                       lambda r: r["frame"].update(unit="cm"),
                       lambda r: r["parcel"].update(outer=r["parcel"]["outer"][:-1])):
            data = copy.deepcopy(raw)
            mutate(data)
            with self.assertRaises(ValueError):
                loads(json.dumps(data))
        for text in ('{"format":1,"format":2}', '{"x":NaN}', '[]'):
            with self.assertRaises(ValueError):
                loads(text)

    def test_json_topology_is_validated_not_just_field_types(self):
        raw = json.loads(dumps(self.state))
        raw["beds"][1]["center"] = raw["beds"][0]["center"]
        with self.assertRaisesRegex(GeometryValidationError, "bed_overlap"):
            loads(json.dumps(raw))
        raw = json.loads(dumps(self.state))
        raw["parcel"]["outer"] = [asdict(p) for p in ring((0, 0), (10, 10), (0, 10), (10, 0), (0, 0))]
        raw["parcel"]["holes"] = []
        with self.assertRaisesRegex(GeometryValidationError, "invalid_polygon"):
            loads(json.dumps(raw))

    def test_primitives_are_strict_and_deeply_immutable(self):
        for value in (0, -1, True, float("nan"), float("inf")):
            with self.subTest(value=value), self.assertRaises(ValueError):
                replace(self.first, width_m=value)
        for angle in (-17, 360, True, float("nan")):
            with self.assertRaises(ValueError):
                replace(self.first, rotation_deg=angle)
        with self.assertRaises(ValueError):
            CoordinateFrame(unit="cm")
        with self.assertRaises(ValueError):
            replace(self.state, beds=(self.first, self.first))
        with self.assertRaises(ValueError):
            GeometryState(self.parcel, (replace(self.first, parcel_id=new_id()),))
        with self.assertRaises(ValueError):
            replace(self.first, object_id="B01")
        with self.assertRaises(FrozenInstanceError):
            self.first.center.x = 999
        with self.assertRaises(ValueError):
            replace(self.parcel, outer=list(self.parcel.outer))

    def test_scheduler_adapter_ids_order_capacity_and_width_change(self):
        converted = scheduler_beds(self.state)
        self.assertEqual([b.id for b in converted], [self.first.object_id, self.neighbor.object_id])
        self.assertEqual((converted[0].width_m, converted[0].length_m), (.65, 8))
        synthetic = profile()
        synthetic = replace(synthetic, crop=replace(synthetic.crop, row_spacing=p(.25, "m"), plant_spacing=p(.3, "m")))
        self.assertEqual(bed_capacity(synthetic, converted[0]), 52)
        changed = resize_bed_width(self.state, self.first.object_id, .75)
        self.assertEqual(bed_capacity(synthetic, scheduler_beds(changed)[0]), 78)

    def test_demo_migration_preserves_visible_corners_and_inputs(self):
        old = copy.deepcopy(demo.GEOMETRY)
        for angle in (0, 17):
            geometry = copy.deepcopy(old)
            geometry["beds"][0]["angle"] = angle
            state = migrate_svg_demo(geometry)
            modern = state.beds[0]
            legacy = geometry["beds"][0]
            c, s = math.cos(math.radians(angle)), math.sin(math.radians(angle))
            expected = [(legacy["x"]+c*x-s*y, legacy["y"]+s*x+c*y)
                        for x, y in ((0, 0), (legacy["width"], 0), (legacy["width"], legacy["length"]), (0, legacy["length"]))]
            actual = [(point.x, -point.y) for point in corners(modern)]
            for point in actual:
                self.assertLess(min(math.dist(point, e) for e in expected), 1e-12)
            self.assertTrue(modern.generation_protected)
            self.assertEqual(modern.name, "B01")
        self.assertEqual(old, demo.GEOMETRY)
        self.assertEqual(migrate_svg_demo(old), migrate_svg_demo(old))

    def test_adapter_preserves_complete_scheduler_result_after_legacy_id_mapping(self):
        with patch.object(demo, "plan_season", wraps=plan_season) as engine:
            original, _, _ = demo.build_demo()
            targets, profiles, legacy_beds = engine.call_args.args
            keywords = engine.call_args.kwargs
        state = migrate_svg_demo(demo.GEOMETRY)
        result = plan_season(targets, profiles, scheduler_beds(state), **keywords)
        mapping = {old.id: modern.object_id for old, modern in zip(legacy_beds, state.beds)}
        def translate(value):
            if isinstance(value, dict):
                return {key: mapping.get(v, v) if key == "bed_id" else translate(v) for key, v in value.items()}
            if isinstance(value, tuple):
                return tuple(translate(v) for v in value)
            return value
        self.assertEqual(translate(asdict(original)), asdict(result))
