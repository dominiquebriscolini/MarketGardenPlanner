import { useEffect, useState } from 'react';
import { Demo, fmt } from './types';
import { Plot } from './Plot';
import { Details } from './Details';
import { Forecast } from './Forecast';
export function App() {
    const [data, setData] = useState<Demo | null>(null), [error, setError] = useState('');
    const [index, setIndex] = useState(101), [selected, setSelected] = useState('B01');
    useEffect(() => { const controller = new AbortController(); fetch('/api/demo', { signal: controller.signal }).then(r => { if (!r.ok)
        throw Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch(e => { if (e.name !== 'AbortError')
        setError(String(e)); }); return () => controller.abort(); }, []);
    if (error)
        return <main><h1>Plan konnte nicht geladen werden</h1><p>{error}</p><p>Python-Server prüfen und Seite neu laden.</p></main>;
    if (!data)
        return <main><h1>Saisonplan wird berechnet …</h1></main>;
    const day = data.days[index];
    const occupied = Object.values(day.beds).filter(b => b.stage !== 'free').length;
    const step = (n: number) => setIndex(i => Math.max(0, Math.min(data.days.length - 1, i + n)));
    return <main><header><div className="brand-mark">MG<span> / </span>26</div><div><span className="eyebrow">MARKET GARDEN PLANNER / PHASE 3A.1</span><h1>Saisonatlas</h1><p className="subtitle">Grundstück, Kulturfolge und Ernte im zeitlichen Zusammenhang.</p></div><div className="header-meta">LOKALER PROTOTYP<br /><strong>Saison 2026</strong></div></header>
 <div className="notice"><span className="notice-dot"/>{data.notice}</div>
 <section className="season"><div className="season-title"><div><span className="eyebrow">SAISONZEITPUNKT</span><h2>{fmt(day.date)}</h2></div><p>{occupied} / {data.geometry.beds.length} Beete belegt</p><div className="date-navigation"><button onClick={() => step(-7)} aria-label="Eine Woche zurück">− Woche</button><button onClick={() => step(7)} aria-label="Eine Woche vor">+ Woche</button><input aria-label="Datum wählen" type="date" min={data.days[0].date} max={data.days.at(-1)!.date} value={day.date} onChange={e => { const i = data.days.findIndex(d => d.date === e.target.value); if (i >= 0)
        setIndex(i); }}/></div></div>
 <input className="season-slider" aria-label="Saisontag" type="range" min="0" max={data.days.length - 1} value={index} onChange={e => setIndex(Number(e.target.value))}/><div className="months">{['MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV'].map(m => <span key={m}>{m}</span>)}</div></section>
 <div className="workspace"><Plot data={data} index={index} selected={selected} onSelect={setSelected}/><Details data={data} index={index} selected={selected}/></div>
 <Forecast data={data} day={day.date}/>
 <details className="diagnostics"><summary>Planungsbilanz und Datenhinweise</summary>{data.schedule.outcomes.map(o => <p key={o.target_id}>{o.target_id}: Ziel {o.requested} {o.unit === 'pieces' ? 'Stück' : o.unit} · Erreichbar {o.achieved.toLocaleString('de-DE')} · Fehlmenge {o.deficit.toLocaleString('de-DE')}</p>)}<ul>{data.schedule.warnings.map(w => <li key={w}>{w}</li>)}</ul></details>
 <footer><span>PRÄZISE GEOMETRIE / SCHEMATISCHE ENTWICKLUNG</span><span>Python 3.11 · Scheduler Phase 2 · Ansicht Phase 3A.1</span></footer></main>;
}
