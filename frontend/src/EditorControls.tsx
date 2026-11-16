import type {BedEditor} from './useBedEditor';

export function EditorControls({editor:e}:{editor:BedEditor}) {
  const validWidth=Number.isFinite(e.widthM)&&e.widthM>0;
  return <section className="editor-controls floating" aria-label="Beetwerkzeuge">
    <div className="editor-tools" role="group" aria-label="Bearbeitungsmodus">
      <button aria-pressed={e.tool==='select'} disabled={e.busy} onClick={()=>e.setTool('select')}>Auswählen</button>
      <button aria-pressed={e.tool==='draw'} disabled={e.busy} onClick={()=>e.setTool('draw')}>Beet zeichnen</button>
    </div>
    {e.tool==='draw'?<>
      <label className="bed-width">Beetbreite (m)<input aria-label="Breite neuer Beete in Metern" type="number" min="0" step="any" value={e.width} disabled={e.busy} onChange={event=>e.setWidth(event.target.value)}/></label>
      <p>{validWidth?'Start und Ende der Längsachse ziehen. Freier Winkel, kein Raster.':'Bitte eine positive Breite in Metern eingeben.'}</p>
    </>:<p>Beet auswählen oder ziehen. Freie Kartenfläche verschiebt die Ansicht.</p>}
    {e.draft&&<p className="draft-dimensions">Vorschau: {e.draft.bed.width_m.toLocaleString('de-DE',{maximumFractionDigits:3})} × {e.draft.bed.length_m.toLocaleString('de-DE',{maximumFractionDigits:3})} m · {e.draft.bed.rotation_deg.toLocaleString('de-DE',{maximumFractionDigits:2})}°</p>}
    {e.message&&<p role={e.phase==='invalid'||e.phase==='error'?'alert':'status'} className={`edit-status ${e.phase}`}>{e.message}</p>}
    {e.draft&&!e.busy&&<button className="cancel-draft" onClick={e.cancel}>Vorschau verwerfen</button>}
  </section>;
}
