import {bedDisplayName} from './projectView';
import type {SavedProject} from './projectView';
import type {BedEditor} from './useBedEditor';
import {useState} from 'react';
import type {SpatialBed} from './projectView';
import {geometryFields,numericDraft} from './geometryForm';
import {BedGeometryForm} from './BedGeometryForm';
import {CultivationPanel} from './CultivationPanel';
import {formatGeometry} from './geometryDisplay';
import {ProjectWeekSummary} from './ProjectWeekSummary';
import type {SeasonFrame} from './projectSeason';
function BedNameForm({bed,editor}:{bed:SpatialBed;editor:BedEditor}) {
  const [name,setName]=useState(()=>bedDisplayName(bed.name));
  const {draft}=numericDraft(bed,{...geometryFields(bed),name});
  const nameDraft=editor.draft?.kind==='edit'&&editor.draft.bed.object_id===bed.object_id&&
    Object.keys(editor.draft.changes).length===1&&editor.draft.changes.name!==undefined;
  const disabled=bed.geometry_locked||editor.busy||!!editor.deleteTarget||!!editor.draft&&!nameDraft;
  const error=nameDraft&&(editor.phase==='error'||editor.phase==='invalid');
  return <form className="bed-name-form geometry-form" onSubmit={event=>{
    event.preventDefault();
    if(!disabled&&draft)void editor.finish(draft);
  }}>
    <label>Beetname <input type="text" required value={name} disabled={disabled}
      onChange={event=>setName(event.target.value)}/></label>
    <button type="submit" disabled={disabled||!draft}>Name speichern</button>
    {error&&<><p role="alert" className="form-error">{editor.message}</p>
      <button type="button" disabled={editor.busy} onClick={editor.cancel}>Verwerfen</button></>}
  </form>;
}

export function ProjectDetails({project,selected,onClose,editor,cultivationBusy=false,onCultivationBusy,onSaved,season,seasonMessage,cultivationMode=false}:{project:SavedProject;selected:string;onClose:()=>void;editor?:BedEditor;cultivationBusy?:boolean;onCultivationBusy?:(value:boolean)=>void;onSaved?:(project:SavedProject,bedId:string)=>void;season?:SeasonFrame;seasonMessage?:string;cultivationMode?:boolean}) {
  const bed=project.geometry.beds.find(b=>b.object_id===selected);
  if(!bed)return null;
  const format=formatGeometry;
  const name=bedDisplayName(bed.name)||`Beet ${project.geometry.beds.indexOf(bed)+1}`;
  return <aside className="details floating geometry-details" aria-label={`${cultivationMode?'Kulturplanung':'Beetplanung'} ${name}`}>
    <div className="detail-header"><div><span className="eyebrow">{cultivationMode?'KULTURPLANUNG':'BEETPLANUNG'}</span><h2>{name}</h2></div>
      <button className="close-button" aria-label="Beetdetails schließen" disabled={cultivationBusy} onClick={onClose}>×</button></div>
    <div className="detail-body">
      {editor&&!cultivationMode&&<BedNameForm key={`${bed.object_id}:${bed.revision_id}:${editor.cancelVersion}`} bed={bed} editor={editor}/>}
      {!cultivationMode&&<details className="geometry-section" open={!onSaved}><summary>Geometrie <span>{format(bed.width_m)} × {format(bed.length_m)} m · {format(bed.rotation_deg)}°</span></summary>
      {editor&&<BedGeometryForm key={`${bed.object_id}:${bed.revision_id}:${editor.cancelVersion}:${editor.inputVersion}`} bed={bed} editor={editor}/>}
      {editor&&<h3>Gespeicherte Geometrie</h3>}
      <dl><dt>Breite</dt><dd>{format(bed.width_m)} m</dd><dt>Länge</dt><dd>{format(bed.length_m)} m</dd>
        <dt>Fläche</dt><dd>{format(bed.width_m*bed.length_m)} m²</dd><dt>Rotation (Welt, CCW)</dt><dd>{format(bed.rotation_deg)}°</dd>
        <dt>Mittelpunkt X / Ost</dt><dd>{format(bed.center.x)} m</dd><dt>Mittelpunkt Y / Nord</dt><dd>{format(bed.center.y)} m</dd>
        <dt>Geometriesperre</dt><dd>{bed.geometry_locked?'Gesperrt':'Nicht gesperrt'}</dd>
        <dt>Generatorschutz</dt><dd>{bed.generation_protected?'Geschützt':'Nicht geschützt'}</dd></dl></details>}
      <ProjectWeekSummary frame={season} bedId={bed.object_id} message={seasonMessage} showGrowth={cultivationMode}/>
      {onSaved&&onCultivationBusy&&<CultivationPanel key={bed.object_id} project={project} bedId={bed.object_id}
        layouts={season?.season.planting_layouts} weekState={season?.week.beds[bed.object_id]} readOnly={!cultivationMode} disabled={!!editor?.draft||!!editor?.deleteTarget||!!editor?.busy&&!cultivationBusy}
        busy={cultivationBusy} onBusy={onCultivationBusy} onSaved={onSaved}/>}
      {!cultivationMode&&<details className="identity-section"><summary>Identität und Herkunft</summary><p className="id-label">Beet-ID</p><code>{bed.object_id}</code>
      <p className="id-label">Objektrevision</p><code>{bed.revision_id}</code>
      <p className="id-label">Projekt-ID</p><code>{project.project_id}</code>
      <p className="muted">Herkunft: {bed.origin}<br/>Quelle: {bed.source_reference||'Keine Quellenreferenz hinterlegt'}</p>
      <p className="footnote">Kein Scheduler-Lauf für dieses Projekt. Pflanzenzahlen und Ernteprognosen sind nicht verfügbar.</p></details>}
    </div>
  </aside>;
}
