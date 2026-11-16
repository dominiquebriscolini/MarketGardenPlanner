import {useEffect,useRef,useState} from 'react';
import type {SavedProject,SpatialBed} from './projectView';
import type {BedDraft,Tool} from './editingGeometry';
import {commitDraft,validateDraft} from './editingClient';
import {ProjectAPIError} from './projectClient';

export type EditPhase='idle'|'checking'|'valid'|'invalid'|'saving'|'error';
export function useBedEditor(project:SavedProject|null,onSaved:(project:SavedProject,bedId:string|null)=>void) {
  const [tool,setTool]=useState<Tool>('select'),[width,setWidth]=useState('0.75');
  const [draft,setDraft]=useState<BedDraft|null>(null),[phase,setPhase]=useState<EditPhase>('idle');
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const [cancelVersion,setCancelVersion]=useState(0);
  const [inputVersion,setInputVersion]=useState(0),[deleteTarget,setDeleteTarget]=useState<SpatialBed|null>(null);
  const sequence=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const pending=useRef<AbortController|null>(null),working=useRef(false);
  const stop=()=>{sequence.current++;if(timer.current)clearTimeout(timer.current);timer.current=null;pending.current?.abort();pending.current=null;};
  const cancel=()=>{if(working.current)return;stop();setCancelVersion(v=>v+1);setDraft(null);setPhase('idle');setMessage('');};
  useEffect(()=>{
    stop();working.current=false;setBusy(false);setTool('select');setDraft(null);setPhase('idle');setMessage('');setDeleteTarget(null);
    return ()=>stop();
  },[project?.project_id]);
  useEffect(()=>{
    const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented&&!working.current){cancel();setTool('select');}};
    window.addEventListener('keydown',escape);return ()=>window.removeEventListener('keydown',escape);
  },[]);
  const preview=(next:BedDraft)=>{
    if(!project||working.current)return;
    stop();setDraft(next);setPhase('checking');setMessage('Vorschau · noch nicht gespeichert');
    const generation=sequence.current,controller=new AbortController();pending.current=controller;
    timer.current=setTimeout(()=>{
      validateDraft(project,next,controller.signal).then(()=>{
        if(generation===sequence.current){setPhase('valid');setMessage(next.kind==='edit'?'Gültige Vorschau · im Detailpanel speichern':'Gültige Vorschau · zum Speichern loslassen');}
      }).catch(error=>{
        if(generation===sequence.current&&!controller.signal.aborted){setPhase('invalid');setMessage(error.message);}
      });
    },120);
  };
  const finish=async(next:BedDraft)=>{
    if(!project||working.current)return;
    stop();working.current=true;setBusy(true);setDraft(next);setPhase('checking');setMessage('Geometrie wird geprüft …');
    const generation=sequence.current,controller=new AbortController();pending.current=controller;
    let writing=false;
    try {
      const saved=await commitDraft(project,next,crypto.randomUUID(),controller.signal,fetch,()=>{
        writing=true;setPhase('saving');setMessage('Speicherung wird bestätigt …');
      });
      if(generation!==sequence.current)return;
      setDraft(null);setDeleteTarget(null);setPhase('idle');setMessage(next.kind==='delete'?'Beet gelöscht.':'Gespeichert.');onSaved(saved,next.kind==='delete'?null:next.bed.object_id);
    } catch(error) {
      if(generation!==sequence.current)return;
      const text=error instanceof Error?error.message:String(error);
      setPhase(error instanceof ProjectAPIError&&error.status===422?'invalid':'error');
      setMessage(writing?`Speicherung nicht bestätigt. ${text} Bitte den gespeicherten Stand mit ↻ neu laden.`:`Nicht gespeichert. ${text}`);
    } finally {
      if(generation===sequence.current){working.current=false;setBusy(false);}
    }
  };
  const blocked=()=>{if(!working.current){cancel();setMessage('Dieses Beet ist gesperrt und kann nicht verändert oder gelöscht werden.');}};
  return {tool,width,setWidth,busy,draft,phase,message,preview,finish,cancel,cancelVersion,inputVersion,deleteTarget,
    beginGesture:()=>{if(!working.current){stop();setInputVersion(v=>v+1);setDraft(null);setPhase('idle');setMessage('');}},
    clearPreview:(error='')=>{if(!working.current){stop();setDraft(null);setPhase(error?'invalid':'idle');setMessage(error);}},
    requestDelete:(bed:SpatialBed)=>{if(!project||working.current)return;if(bed.geometry_locked){blocked();return;}cancel();setDeleteTarget(bed);},
    dismissDelete:()=>{if(!working.current){setDeleteTarget(null);cancel();}},
    confirmDelete:()=>{if(deleteTarget)void finish({kind:'delete',bed:deleteTarget});},
    setTool:(next:Tool)=>{if(!working.current){cancel();setTool(next);}},
    blocked,
    widthM:Number(width),project};
}
export type BedEditor=ReturnType<typeof useBedEditor>;
