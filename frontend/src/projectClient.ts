import {decodeProject,decodeProjectList} from './projectView';

export type ValidationIssue={code:string;object_ids:string[];message:string};
const messages:Record<string,string>={
  revision_conflict:'Das Projekt wurde inzwischen geändert. Bitte neu laden, bevor Sie weiter bearbeiten.',
  geometry_locked:'Dieses Beet ist gesperrt und kann nicht verschoben werden.',
  bed_overlap:'Das Beet überschneidet ein anderes Beet.',
  outside_parcel:'Das Beet liegt außerhalb der Grundstücksgrenze oder in einem Polygonloch.',
  invalid_bed:'Die Beetgeometrie ist ungültig.',
  invalid_polygon:'Das Grundstückspolygon ist ungültig.',
};
export class ProjectAPIError extends Error {
  constructor(public status:number,public code:string,public issues:ValidationIssue[]=[]) {
    super([...new Set(issues.map(i=>messages[i.code]||i.message))].join(' ')||messages[code]||`API meldet HTTP ${status} (${code}).`);
  }
}
export async function getJSON(path:string, signal?:AbortSignal, transport:typeof fetch=fetch, timeoutMs=8000, request:RequestInit={}):Promise<unknown> {
  const controller=new AbortController();
  const abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  try {
    const response=await transport(path,{...request,signal:controller.signal});
    if(!response.ok) {
      if(response.status===404)throw Error('Projekt-API nicht verfügbar oder Projekt nicht gefunden. Bitte den API-Server auf Port 8766 verwenden.');
      const body=await response.json().catch(()=>null);
      const issues=Array.isArray(body?.error?.issues)?body.error.issues.filter((i:any)=>typeof i?.code==='string'&&typeof i.message==='string'&&Array.isArray(i.object_ids)):[];
      throw new ProjectAPIError(response.status,typeof body?.error?.code==='string'?body.error.code:'request_failed',issues);
    }
    try {return await response.json();}
    catch {throw Error('Die API hat keine lesbaren JSON-Daten geliefert.');}
  } catch(error) {
    if(signal?.aborted)throw new DOMException('Abgebrochen','AbortError');
    if(timedOut)throw Error('Die API antwortet nicht rechtzeitig. Server prüfen und erneut laden.');
    if(error instanceof TypeError)throw Error('Keine Verbindung zur lokalen API. Bitte den Python-Server starten und erneut laden.');
    throw error;
  } finally {clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
export async function listProjects(signal?:AbortSignal,transport:typeof fetch=fetch) {
  return decodeProjectList(await getJSON('/api/v1/projects',signal,transport));
}
export async function loadProject(id:string,signal?:AbortSignal,transport:typeof fetch=fetch) {
  return decodeProject(await getJSON(`/api/v1/projects/${encodeURIComponent(id)}`,signal,transport),id);
}
