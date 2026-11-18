import type {BedEditor} from './useBedEditor';
import {PrecisionNumberInput} from './PrecisionNumberInput';
import {formatGeometry} from './geometryDisplay';

export function EditorControls({editor:e}:{editor:BedEditor}) {
  const validWidth=Number.isFinite(e.widthM)&&e.widthM>0;
  return <section className="editor-controls floating" aria-label="Beetwerkzeuge">
    <div className="editor-tools" role="group" aria-label="Bearbeitungsmodus">
      <button aria-pressed={e.tool==='select'} disabled={e.busy} onClick={()=>e.setTool('select')}>Auswählen</button>
      <button aria-pressed={e.tool==='draw'} disabled={e.busy} onClick={()=>e.setTool('draw')}>Beet zeichnen</button>
    </div>
    {e.tool==='draw'?<>
      <label className="bed-width">Beetbreite (m)<PrecisionNumberInput aria-label="Breite neuer Beete in Metern" min="0" value={e.width} disabled={e.busy} onValueChange={e.setWidth}/></label>
      <p>{validWidth?'Längsachse ziehen. Shift halten für 15°-Schritte.':'Bitte eine positive Breite in Metern eingeben.'}</p>
    </>:<p>Beet auswählen oder ziehen. Freie Kartenfläche verschiebt die Ansicht.</p>}
    {e.draft&&<p className="draft-dimensions">{e.draft.kind==='delete'?'Löschung angefragt':'Vorschau'}: {formatGeometry(e.draft.bed.width_m)} × {formatGeometry(e.draft.bed.length_m)} m</p>}
    {e.message&&<p role={e.phase==='invalid'||e.phase==='error'?'alert':'status'} className={`edit-status ${e.phase}`}>{e.message}</p>}
    {e.draft&&!e.busy&&<button className="cancel-draft" onClick={e.cancel}>Vorschau verwerfen</button>}
  </section>;
}
