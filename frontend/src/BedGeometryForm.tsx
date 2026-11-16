import {useState} from 'react';
import type {SpatialBed} from './projectView';
import type {BedEditor} from './useBedEditor';
import {geometryFields,numericDraft} from './geometryForm';
import type {GeometryFields} from './geometryForm';
import {PrecisionNumberInput} from './PrecisionNumberInput';

export function BedGeometryForm({bed,editor:e}:{bed:SpatialBed;editor:BedEditor}) {
  const [fields,setFields]=useState(()=>geometryFields(bed));
  const parsed=numericDraft(bed,fields),disabled=bed.geometry_locked||e.busy;
  const change=(field:keyof GeometryFields,value:string)=>{
    const next={...fields,[field]:value};setFields(next);
    const result=numericDraft(bed,next);
    if(result.draft)e.preview(result.draft);else e.clearPreview(result.error);
  };
  return <form className="geometry-form" aria-label="Beetgeometrie bearbeiten" onSubmit={event=>{
    event.preventDefault();if(!disabled&&parsed.draft)void e.finish(parsed.draft);
  }}>
    <fieldset disabled={disabled}><legend>Präzise Geometrie</legend>
      {([['width','Breite (m)'],['length','Länge (m)'],['angle','Winkel (°)'],['x','Mittelpunkt X / Ost (m)'],['y','Mittelpunkt Y / Nord (m)']] as const).map(([field,label])=>
        <label key={field}>{label}<PrecisionNumberInput aria-label={label} value={fields[field]}
          min={field==='width'||field==='length'||field==='angle'?0:undefined} onValueChange={value=>change(field,value)}/></label>)}
    </fieldset>
    <p className="geometry-hint">Vorschau bis zum Speichern · Bezug: Mittelpunkt · Winkel gegen den Uhrzeigersinn, 0° bis &lt; 360°.</p>
    {e.draft?.bed.object_id===bed.object_id&&<p className={`edit-status ${e.phase}`} role="status">{e.message}</p>}
    {parsed.error&&<p className="form-error" role="alert">{parsed.error}</p>}
    {bed.geometry_locked?<p className="form-error">Dieses Beet ist gesperrt.</p>:<div className="geometry-actions">
      <button type="submit" disabled={e.busy||!parsed.draft||!!parsed.error}>Änderungen speichern</button>
      <button type="button" disabled={e.busy} onClick={e.cancel}>Verwerfen</button>
    </div>}
    <button className="delete-bed" type="button" disabled={disabled} onClick={()=>e.requestDelete(bed)}>Beet löschen …</button>
  </form>;
}
