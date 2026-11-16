"""Derived metre coordinates; width axis u, length axis v = rotate(u, +90°)."""
from math import cos, sin, radians
from .models import BedGeometry, Point


def corners(bed: BedGeometry) -> tuple[Point, ...]:
    theta = radians(bed.rotation_deg)
    ux, uy = cos(theta), sin(theta)
    return tuple(Point(bed.center.x + a * bed.width_m / 2 * ux - b * bed.length_m / 2 * uy,
                       bed.center.y + a * bed.width_m / 2 * uy + b * bed.length_m / 2 * ux)
                 for a, b in ((-1, -1), (1, -1), (1, 1), (-1, 1)))
