"""Separate spatial JSON v1, not a replacement for catalogue or demo formats."""
import json
from dataclasses import asdict
from hashlib import sha256
from .models import BedGeometry, CoordinateFrame, GeometryState, Parcel, Point
from .validation import require_valid


def dumps(state: GeometryState) -> str:
    require_valid(state)
    return json.dumps({"format": "market-garden-spatial", "schema_version": 1,
                       **asdict(state)}, ensure_ascii=False, allow_nan=False, sort_keys=True,
                      separators=(",", ":"))


def unique_keys(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError(f"Non-finite JSON number: {value}")


def loads(text: str) -> GeometryState:
    raw = json.loads(text, object_pairs_hook=unique_keys, parse_constant=reject_constant)
    if not isinstance(raw, dict) or set(raw) != {"format", "schema_version", "parcel", "beds", "frame", "revision_id"}:
        raise ValueError("Expected spatial JSON document")
    if raw["format"] != "market-garden-spatial" or type(raw["schema_version"]) is not int or raw["schema_version"] != 1:
        raise ValueError("Unsupported spatial format/version; explicit migration required")
    try:
        def read_ring(points):
            if not isinstance(points, list):
                raise ValueError("Ring must be a JSON array")
            return tuple(Point(**point) for point in points)

        data = dict(raw["parcel"])
        # Require all fields emitted by v1, avoiding invented IDs/revisions on load.
        if set(data) != set(Parcel.__dataclass_fields__):
            raise ValueError("Unexpected/missing parcel fields")
        data["outer"] = read_ring(data["outer"])
        if not isinstance(data["holes"], list) or not isinstance(raw["beds"], list):
            raise ValueError("Holes and beds must be JSON arrays")
        data["holes"] = tuple(read_ring(hole) for hole in data["holes"])
        beds = []
        for entry in raw["beds"]:
            if set(entry) != set(BedGeometry.__dataclass_fields__):
                raise ValueError("Unexpected/missing bed fields")
            bed = dict(entry)
            bed["center"] = Point(**bed["center"])
            beds.append(BedGeometry(**bed))
        if set(raw["frame"]) != set(CoordinateFrame.__dataclass_fields__):
            raise ValueError("Unexpected/missing coordinate frame fields")
        state = GeometryState(Parcel(**data), tuple(beds), CoordinateFrame(**raw["frame"]), raw["revision_id"])
    except (TypeError, KeyError, AttributeError) as error:
        raise ValueError("Malformed spatial JSON data") from error
    require_valid(state)
    return state


def geometry_token(state: GeometryState) -> str:
    """Future forecasts can retain this token and detect changed inputs/revisions."""
    return sha256(dumps(state).encode("utf-8")).hexdigest()
