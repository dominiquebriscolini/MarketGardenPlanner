import type {SavedProject} from './projectView';
import type {BedEditor} from './useBedEditor';
import {BedGeometryForm} from './BedGeometryForm';
import {CultivationPanel} from './CultivationPanel';
import {formatGeometry} from './geometryDisplay';
export function ProjectDetails({project,selected,onClose,editor,cultivationBusy=false,onCultivationBusy,onSaved}:{project:SavedProject;selected:string;onClose:()=>void;editor?:BedEditor;cultivationBusy?:boolean;onCultivationBusy?:(value:boolean)=>void;onSaved?:(project:SavedProject,bedId:string)=>void}) {
  const bed=project.geometry.beds.find(b=>b.object_id===selected);
  if(!bed)return null;
  const format=formatGeometry;
  return <aside className="details floating geometry-details" aria-label={`Geometrie ${bed.name||bed.object_id}`}>
    <div className="detail-header"><div><span className="eyebrow">BEET / PLANUNG</span><h2>{bed.name||'Beet'}</h2></div>
      <button className="close-button" aria-label="Beetdetails schließen" disabled={cultivationBusy} onClick={onClose}>×</button></div>
    <div className="detail-body">
      {onSaved&&onCultivationBusy&&<CultivationPanel key={bed.object_id} project={project} bedId={bed.object_id} disabled={!!editor?.draft||!!editor?.deleteTarget||!!editor?.busy&&!cultivationBusy} busy={cultivationBusy} onBusy={onCultivationBusy} onSaved={onSaved}/>}
      <details className="geometry-section" open={!onSaved}><summary>Geometrie <span>{format(bed.width_m)} × {format(bed.length_m)} m · {format(bed.rotation_deg)}°</span></summary>
      {editor&&<BedGeometryForm key={`${bed.object_id}:${bed.revision_id}:${editor.cancelVersion}:${editor.inputVersion}`} bed={bed} editor={editor}/>}
      {editor&&<h3>Gespeicherte Geometrie</h3>}
      <dl><dt>Breite</dt><dd>{format(bed.width_m)} m</dd><dt>Länge</dt><dd>{format(bed.length_m)} m</dd>
        <dt>Fläche</dt><dd>{format(bed.width_m*bed.length_m)} m²</dd><dt>Rotation (Welt, CCW)</dt><dd>{format(bed.rotation_deg)}°</dd>
        <dt>Mittelpunkt X / Ost</dt><dd>{format(bed.center.x)} m</dd><dt>Mittelpunkt Y / Nord</dt><dd>{format(bed.center.y)} m</dd>
        <dt>Geometriesperre</dt><dd>{bed.geometry_locked?'Gesperrt':'Nicht gesperrt'}</dd>
        <dt>Generatorschutz</dt><dd>{bed.generation_protected?'Geschützt':'Nicht geschützt'}</dd></dl></details>
      <details className="identity-section"><summary>Identität und Herkunft</summary><p className="id-label">Beet-ID</p><code>{bed.object_id}</code>
      <p className="id-label">Objektrevision</p><code>{bed.revision_id}</code>
      <p className="id-label">Projekt-ID</p><code>{project.project_id}</code>
      <p className="muted">Herkunft: {bed.origin}<br/>Quelle: {bed.source_reference||'Keine Quellenreferenz hinterlegt'}</p>
      <p className="footnote">Kein Scheduler-Lauf für dieses Projekt. Pflanzenzahlen und Ernteprognosen sind nicht verfügbar.</p></details>
    </div>
  </aside>;
}
