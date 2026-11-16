"""Synthetic data ONLY. Never a source for the production culture database."""

from market_garden_planner import AgronomicParameter, CropProfile, SeasonalProfile, YieldPeriod


def p(value, unit):
    return AgronomicParameter(value, unit, "Synthetic phase-2 test fixture" if value is not None else None,
                              "synthetic" if value is not None else "missing")


def period(offset, duration, amount, unit="kg"):
    return YieldPeriod(p(offset, "d"), p(duration, "d"), p(amount, f"{unit}/plant"))


def profile(id="lettuce", species="lettuce", method="transplant", mode="single", unit="pieces",
            amount=1, field_days=30, nursery_days=14, cleanup_days=0, periods=None):
    crop = CropProfile(id, species, None, method, p(.5, "kg/plant"), p(1, "fraction"),
                       p(1, "fraction"), p(.3, "m"), p(.3, "m"), p(100, "seeds/g"))
    return SeasonalProfile(crop, mode, p(field_days, "d"), p(nursery_days if method == "transplant" else 0, "d"),
                           p(cleanup_days, "d"), periods if periods is not None else (period(0, 0, amount, unit),))
