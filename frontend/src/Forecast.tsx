import { Demo, fmt } from './types';
export function Forecast({ data, day }: {
    data: Demo;
    day: string;
}) {
    const rows = data.schedule.crop_forecasts;
    const maxByUnit = (unit: string) => Math.max(...rows.filter(r => r.unit === unit).map(r => r.quantity), 1);
    return <section className="forecast"><div className="panel-heading"><div><span className="eyebrow">03 / ERNTEPROGNOSE</span><h2>Wochenübersicht</h2></div><span className="muted">Gesamte Saison · kg und Stück getrennt</span></div>
 <div className="table-scroll"><table><thead><tr><th>Woche ab</th><th>Kultur</th><th>Prognose</th><th>Im Zielzeitraum</th><th>Relativer Verlauf je Einheit</th></tr></thead><tbody>{rows.map(r => { const current = day >= r.week_start && day < new Date(Date.parse(r.week_start + 'T00:00:00Z') + 7 * 86400000).toISOString().slice(0, 10); return <tr key={r.week_start + r.crop_id + r.unit} className={current ? 'current-week' : ''}><td>{fmt(r.week_start)} {current && <small>← Auswahl</small>}</td><td>{data.names[r.crop_id]}</td><td>{r.quantity.toLocaleString('de-DE', { maximumFractionDigits: 1 })} {r.unit === 'pieces' ? 'Stück' : 'kg'}</td><td>{r.credited_quantity.toLocaleString('de-DE', { maximumFractionDigits: 1 })} {r.unit === 'pieces' ? 'Stück' : 'kg'}</td><td><div className="bar-track"><div style={{ width: `${100 * r.quantity / maxByUnit(r.unit)}%` }}/></div></td></tr>; })}</tbody></table></div><p className="footnote">Geplante Erwartungsmengen aus dem Python-Scheduler. Ernten außerhalb des Zielzeitraums werden separat ausgewiesen; Balken je Einheit normiert.</p></section>;
}
