import {getJSON} from './projectClient';
import {decodeProject} from './projectView';
import type {SavedProject} from './projectView';
import {candidateGeometry,draftChanges} from './editingGeometry';
import type {BedDraft} from './editingGeometry';

export async function validateDraft(project:SavedProject,draft:BedDraft,signal?:AbortSignal,transport:typeof fetch=fetch) {
  const response:any=await getJSON('/api/v1/geometry/validate',signal,transport,8000,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({geometry:candidateGeometry(project,draft)})});
  if(response?.api_version!==1||response.valid!==true)throw Error('Die API hat die Vorschau nicht als gültig bestätigt.');
}

/** Only a decoded, successful write response is eligible to replace the saved map. */
export async function commitDraft(project:SavedProject,draft:BedDraft,commandId:string,signal?:AbortSignal,
  transport:typeof fetch=fetch,onWriting:()=>void=()=>{}) {
  await validateDraft(project,draft,signal,transport);
  if(signal?.aborted)throw new DOMException('Abgebrochen','AbortError');
  onWriting();
  const path=`/api/v1/projects/${encodeURIComponent(project.project_id)}/beds`;
  const request=draft.kind==='create'?{method:'POST',path,fields:{bed:draft.bed}}:
    draft.kind==='delete'?{method:'DELETE',path:`${path}/${encodeURIComponent(draft.bed.object_id)}`,fields:{}}:
    {method:'PATCH',path:`${path}/${encodeURIComponent(draft.bed.object_id)}`,fields:{changes:draftChanges(draft)}};
  const raw=await getJSON(request.path,signal,transport,8000,{method:request.method,headers:{'Content-Type':'application/json'},
    body:JSON.stringify({expected_revision:project.revision_id,command_id:commandId,...request.fields})});
  const saved=decodeProject(raw,project.project_id);
  const expectedGeometry=candidateGeometry(project,draft);
  const expectedIds=expectedGeometry.beds.map(b=>b.object_id).sort().join(',');
  if(saved.geometry.beds.map(b=>b.object_id).sort().join(',')!==expectedIds)throw Error('Die API hat den geänderten Beetbestand nicht bestätigt. Bitte neu laden.');
  if(draft.kind==='delete'){
    if(saved.geometry.beds.some(b=>b.object_id===draft.bed.object_id))throw Error('Die API hat das Löschen nicht bestätigt. Bitte neu laden.');
    return saved;
  }
  const bed=saved.geometry.beds.find(b=>b.object_id===draft.bed.object_id);
  const expected=expectedGeometry.beds.find(b=>b.object_id===draft.bed.object_id)!;
  if(!bed||bed.center.x!==expected.center.x||bed.center.y!==expected.center.y||bed.width_m!==expected.width_m||
    bed.length_m!==expected.length_m||bed.rotation_deg!==expected.rotation_deg)throw Error('Die API hat die Änderung nicht vollständig bestätigt. Bitte neu laden.');
  return saved;
}
