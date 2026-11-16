"""Read-only conversion to the existing agronomic scheduler's rectangular beds."""
from ..seasonal_models import Bed
from .models import GeometryState
from .validation import require_valid


def scheduler_beds(state: GeometryState) -> tuple[Bed, ...]:
    require_valid(state)
    return tuple(Bed(b.object_id, b.width_m, b.length_m) for b in state.beds)
