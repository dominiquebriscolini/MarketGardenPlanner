import type {SavedProject} from './projectView';
export function ProjectDetails({project,selected,onClose}:{project:SavedProject;selected:string;onClose:()=>void}) {
  const bed=project.geometry.beds.find(b=>b.object_id===selected);
  if(!bed)return null;
  const format=(v:number)=>v.toLocaleString('de-DE',{maximumFractionDigits:8});
  return <aside className="details floating geometry-details" aria-label={`Geometrie ${bed.name||bed.object_id}`}>
    <div className="detail-header"><div><span className="eyebrow">BEET / GEOMETRIE</span><h2>{bed.name||'Beet'}</h2></div>
      <button className="close-button" aria-label="Beetdetails schließen" onClick={onClose}>×</button></div>
    <div className="detail-body"><span className="badge">Nur Anzeige</span>
      <dl><dt>Breite</dt><dd>{format(bed.width_m)} m</dd><dt>Länge</dt><dd>{format(bed.length_m)} m</dd>
        <dt>Fläche</dt><dd>{format(bed.width_m*bed.length_m)} m²</dd><dt>Rotation (Welt, CCW)</dt><dd>{format(bed.rotation_deg)}°</dd>
        <dt>Mittelpunkt X / Ost</dt><dd>{format(bed.center.x)} m</dd><dt>Mittelpunkt Y / Nord</dt><dd>{format(bed.center.y)} m</dd>
        <dt>Geometriesperre</dt><dd>{bed.geometry_locked?'Gesperrt':'Nicht gesperrt'}</dd>
        <dt>Generatorschutz</dt><dd>{bed.generation_protected?'Geschützt':'Nicht geschützt'}</dd></dl>
      <h3>Identität und Herkunft</h3><p className="id-label">Beet-ID</p><code>{bed.object_id}</code>
      <p className="id-label">Objektrevision</p><code>{bed.revision_id}</code>
      <p className="id-label">Projekt-ID</p><code>{project.project_id}</code>
      <p className="muted">Herkunft: {bed.origin}<br/>Quelle: {bed.source_reference||'Keine Quellenreferenz hinterlegt'}</p>
      <p className="footnote">Keine Saisonplanung für dieses Projekt hinterlegt. Kultur-, Pflanzen- und Erntedaten sind nicht verfügbar.</p>
    </div>
  </aside>;
}
