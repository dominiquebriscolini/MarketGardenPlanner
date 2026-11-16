import {decodeProject,decodeProjectList} from './projectView';

export async function getJSON(path:string, signal?:AbortSignal, transport:typeof fetch=fetch, timeoutMs=8000):Promise<unknown> {
  const controller=new AbortController();
  const abort=()=>controller.abort();
  if(signal?.aborted)controller.abort();
  signal?.addEventListener('abort',abort,{once:true});
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
  try {
    const response=await transport(path,{signal:controller.signal});
    if(!response.ok) {
      if(response.status===404)throw Error('Projekt-API nicht verfügbar oder Projekt nicht gefunden. Bitte den API-Server auf Port 8766 verwenden.');
      throw Error(`API meldet HTTP ${response.status}. Bitte Verbindung und Server prüfen.`);
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
