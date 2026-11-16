import { Demo, fmt, stages } from './types';
export function Details({ data, index, selected }: {
    data: Demo;
    index: number;
    selected: string;
}) {
    const bed = data.geometry.beds.find(b => b.id === selected)!;
    const state = data.days[index].beds[selected];
    const reservations = data.schedule.reservations.filter(r => r.bed_id === selected).sort((a, b) => a.window.start.localeCompare(b.window.start));
    return <aside className="details"><span className="eyebrow">02 / BEETDETAIL</span><div className="detail-title"><h2>{selected}</h2><span className={`badge ${state.stage}`}>{stages[state.stage]}</span></div><p className="muted">{bed.width.toLocaleString('de-DE')} × {bed.length} m · {(bed.width * bed.length).toLocaleString('de-DE')} m²</p>
 <h3>Kulturfolge im Saisonverlauf</h3>{reservations.map(r => { const b = data.schedule.batches.find(b => b.plan.id === r.batch_id)!; const p = b.plan; return <article key={r.batch_id} className={`crop-card ${state.batch_id === r.batch_id ? 'active' : ''}`}><div className="crop-title"><strong>{data.names[p.profile_id]}</strong><span>{r.plants} Pflanzen</span></div><small>Satz {p.id}</small><dl><dt>Aussaat</dt><dd>{fmt(p.sowing_date)}</dd><dt>Pflanzung</dt><dd>{p.transplant_date ? fmt(p.transplant_date) : 'Direktsaat'}</dd><dt>Erntebeginn</dt><dd>{fmt(p.first_harvest)}</dd><dt>Ernteende*</dt><dd>{fmt(p.harvest_end)}</dd><dt>Beet wieder frei*</dt><dd>{fmt(r.window.end)}</dd></dl>{data.harvest_modes[p.profile_id] === 'multicut' && <small>Mehrfachschnitt: Beet bleibt zwischen Schnitten belegt.</small>}</article>; })}
 {!reservations.length && <p>Dieses Beet ist in der gesamten Demo frei.</p>}
 <p className="footnote">* Exklusive Grenze: Ab diesem Tag ist die vorherige Phase beendet. Anzucht erfolgt außerhalb des Beetes. Entwicklungsstadien sind schematische Planphasen.</p>
 </aside>;
}
