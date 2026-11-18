import {useEffect,useRef,useState} from 'react';
import {createProject,ProjectAPIError} from './projectClient';
import type {SavedProject} from './projectView';

export function CreateProjectDialog({onClose,onCreated}:{onClose:()=>void;onCreated:(project:SavedProject)=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const working=useRef(false);
  const [ids]=useState(()=>({project:crypto.randomUUID(),parcel:crypto.randomUUID(),
    parcelRevision:crypto.randomUUID(),geometryRevision:crypto.randomUUID()}));
  const [name,setName]=useState(''),[width,setWidth]=useState(''),[length,setLength]=useState('');
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{
    const element=dialog.current;
    element?.showModal();
    return ()=>element?.close();
  },[]);
  const close=()=>{if(!working.current)onClose();};
  const submit=async()=>{
    if(working.current)return;
    const title=name.trim(),x=Number(width),y=Number(length);
    if(!title||Array.from(title).length>200||![x,y,x*y].every(value=>Number.isFinite(value)&&value>0)){
      setError('Bitte einen Projektnamen und zwei positive Grundstücksmaße eingeben.');
      return;
    }
    const geometry:SavedProject['geometry']={
      format:'market-garden-spatial',schema_version:1,revision_id:ids.geometryRevision,
      frame:{unit:'m',x_axis:'east',y_axis:'north',angle:'ccw_degrees'},
      parcel:{object_id:ids.parcel,revision_id:ids.parcelRevision,name:title,origin:'manual',
        geometry_locked:false,generation_protected:false,source_reference:null,holes:[],
        outer:[{x:0,y:0},{x,y:0},{x,y},{x:0,y},{x:0,y:0}]},
      beds:[],
    };
    working.current=true;setBusy(true);setError('');
    try {onCreated(await createProject(ids.project,title,geometry));}
    catch(error){
      const message=error instanceof Error?error.message:String(error);
      setError(error instanceof ProjectAPIError&&error.status<500
        ?message:`Anlage nicht bestätigt. ${message} Dieselben Angaben können erneut gesendet werden.`);
    } finally {working.current=false;setBusy(false);}
  };
  return <dialog ref={dialog} className="create-project-dialog" aria-labelledby="create-project-title"
    onCancel={event=>{event.preventDefault();close();}}
    onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}}}>
    <h2 id="create-project-title">Neues Projekt</h2>
    <form onSubmit={event=>{event.preventDefault();void submit();}}>
      <fieldset disabled={busy}>
        <label>Projektname <input autoFocus required maxLength={200} value={name} onChange={event=>setName(event.target.value)}/></label>
        <legend className="sr-only">Projekt und Grundstück</legend>
        <p>Das Projekt beginnt mit einem leeren rechteckigen Grundstück.</p>
        <div className="project-dimensions">
          <label>Breite (m) <input type="number" step="any" min="0" required value={width} onChange={event=>setWidth(event.target.value)}/></label>
          <label>Länge (m) <input type="number" step="any" min="0" required value={length} onChange={event=>setLength(event.target.value)}/></label>
        </div>
      </fieldset>
      {error&&<p role="alert" className="form-error">{error}</p>}
      {busy&&<p role="status">Projekt wird angelegt …</p>}
      <div className="geometry-actions">
        <button type="button" disabled={busy} onClick={close}>Abbrechen</button>
        <button type="submit" disabled={busy}>Projekt erstellen</button>
      </div>
    </form>
  </dialog>;
}
