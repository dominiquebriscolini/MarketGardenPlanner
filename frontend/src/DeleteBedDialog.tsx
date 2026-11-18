import {useEffect,useRef} from 'react';
import {bedDisplayName} from './projectView';
import type {BedEditor} from './useBedEditor';

export function DeleteBedDialog({editor:e}:{editor:BedEditor}) {
  const ref=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null);
  useEffect(()=>{ref.current?.showModal();cancel.current?.focus();return ()=>ref.current?.close();},[]);
  return <dialog ref={ref} className="delete-dialog" aria-labelledby="delete-bed-title"
    onCancel={event=>{event.preventDefault();e.dismissDelete();}}
    onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();e.dismissDelete();}}}>
    <span className="eyebrow">BEET ENTFERNEN</span><h2 id="delete-bed-title">Beet wirklich löschen?</h2>
    <p>„{bedDisplayName(e.deleteTarget?.name??'')||'Beet'}“ wird aus diesem Projekt entfernt. Diese Aktion hat noch keine Rückgängig-Funktion.</p>
    <p className="dialog-id">{e.deleteTarget?.object_id}</p>
    {(e.phase==='error'||e.phase==='invalid')&&<p className="form-error" role="alert">{e.message}</p>}
    {e.busy&&<p role="status">Löschung wird geprüft und bestätigt …</p>}
    <div className="geometry-actions"><button ref={cancel} disabled={e.busy} onClick={e.dismissDelete}>Abbrechen</button>
      <button className="delete-bed" disabled={e.busy} onClick={e.confirmDelete}>Endgültig löschen</button></div>
  </dialog>;
}
