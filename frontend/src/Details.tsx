import { Demo, fmt, stages } from './types';

export function Details({data,index,selected,onClose}: {data:Demo;index:number;selected:string;onClose:()=>void;}) {
  const bed=data.geometry.beds.find(b=>b.id===selected)!,state=data.days[index].beds[selected];
  const reservations=data.schedule.reservations.filter(r=>r.bed_id===selected).sort((a,b)=>a.window.start.localeCompare(b.window.start));
  return <aside className="details floating" aria-label={`Details ${selected}`}>
    <div className="detail-header"><div><span className="eyebrow">BEET / KULTURFOLGE</span><h2>{selected}</h2></div>
      <button className="close-button" aria-label="Beetdetails schließen" onClick={onClose}>×</button></div>
    <div className="detail-body"><div className="detail-status"><span className={`badge ${state.stage}`}>{stages[state.stage]}</span><time>{fmt(data.days[index].date)}</time></div>
      <p className="muted">{bed.width.toLocaleString('de-DE')} × {bed.length} m · {(bed.width*bed.length).toLocaleString('de-DE')} m²</p>
      <h3>Kulturfolge im Saisonverlauf</h3>
      {reservations.map(r=>{const batch=data.schedule.batches.find(b=>b.plan.id===r.batch_id)!,p=batch.plan;
        return <article key={r.batch_id} className={`crop-card ${state.batch_id===r.batch_id?'active':''}`}>
          <div className="crop-title"><strong>{data.names[p.profile_id]}</strong><span>{r.plants} Pflanzen</span></div><small>Satz {p.id}</small>
          <dl><dt>Aussaat</dt><dd>{fmt(p.sowing_date)}</dd><dt>Pflanzung</dt><dd>{p.transplant_date?fmt(p.transplant_date):'Direktsaat'}</dd>
            <dt>Erntebeginn</dt><dd>{fmt(p.first_harvest)}</dd><dt>Ernteende / Räumung*</dt><dd>{fmt(p.harvest_end)}</dd>
            <dt>Beet wieder frei*</dt><dd>{fmt(r.window.end)}</dd></dl>
          {data.harvest_modes[p.profile_id]==='multicut'&&<small>Mehrfachschnitt: auch zwischen Schnitten belegt.</small>}
        </article>;})}
      {!reservations.length&&<p>Dieses Beet ist in der gesamten Demo frei.</p>}
      <p className="footnote">* Exklusive Grenze: Ab diesem Tag ist die vorherige Phase beendet. Anzucht erfolgt außerhalb des Beetes. Entwicklungsstadien sind schematische Planphasen.</p>
    </div>
  </aside>;
}
