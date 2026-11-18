export type Stage = 'free' | 'growth' | 'harvest' | 'cleanup';
export type Bed = {
    id: string;
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
};
export type Reservation = {
    bed_id: string;
    batch_id: string;
    plants: number;
    window: {
        start: string;
        end: string;
    };
};
export type Batch = {
    plants: number;
    plan: {
        id: string;
        profile_id: string;
        sowing_date: string;
        transplant_date: string | null;
        first_harvest: string;
        harvest_end: string;
    };
    reasons: string[];
};
export type Demo = {
    notice: string;
    title?: string;
    geometry: {
        unit: string;
        boundary: number[][];
        beds: Bed[];
    };
    names: Record<string, string>;
    days: {
        date: string;
        beds: Record<string, {
            stage: Stage;
            batch_id: string | null;
        }>;
    }[];
    harvest_modes: Record<string, string>;
    schedule: {
        batches: Batch[];
        reservations: Reservation[];
        crop_forecasts: {
            week_start: string;
            crop_id: string;
            unit: string;
            quantity: number;
            credited_quantity: number;
        }[];
        warnings: string[];
        outcomes: {
            target_id: string;
            unit: string;
            requested: number;
            achieved: number;
            deficit: number;
        }[];
    };
};
export const stages: Record<Stage, string> = { free: 'Frei', growth: 'Feldwachstum', harvest: 'Erntephase', cleanup: 'Räumung' };
export const fmt = (day: string) => new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(day + 'T00:00:00Z'));
