import {getJSON} from './projectClient';
import {decodeProject} from './projectView';
import type {SavedProject} from './projectView';

import {validateCultivation} from './cultivationModel';
import type {CultureProfile,CultivationValues,Cultivation} from './cultivationModel';
export * from './cultivationModel';
export async function loadCultures(signal?:AbortSignal,transport:typeof fetch=fetch):Promise<CultureProfile[]> {
  const raw:any=await getJSON('/api/v1/cultures',signal,transport);
  if(raw?.api_version!==1||raw.source!=='data/cultures.json'||!Array.isArray(raw.profiles))throw Error('Kulturkatalog nicht kompatibel.');
  const ids=new Set();
  for(const p of raw.profiles) {
    if(!p||typeof p.profile_id!=='string'||!p.profile_id||ids.has(p.profile_id)||typeof p.species_id!=='string'||typeof p.name!=='string'||!['direct','transplant'].includes(p.establishment)||!(p.variety_id===null||typeof p.variety_id==='string')||!(p.variety_name===null||typeof p.variety_name==='string'))throw Error('Ungültiger Kulturkatalog.');
    ids.add(p.profile_id);
  }
  return raw.profiles;
}
export async function commitCultivation(project:SavedProject,bedId:string,operation:'add'|'update'|'delete',
  values:CultivationValues|null,cultivationId:string|null,commandId:string,transport:typeof fetch=fetch) {
  if(!project.cultivation_plan)throw Error('Projekt-API bitte neu starten; Kulturplanung fehlt.');
  if(operation!=='delete') {const error=values?validateCultivation(values):'Kulturangaben fehlen.';if(error)throw Error(error);}
  const path=`/api/v1/projects/${encodeURIComponent(project.project_id)}/beds/${encodeURIComponent(bedId)}/cultivations`;
  const raw=await getJSON(operation==='add'?path:`${path}/${encodeURIComponent(cultivationId!)}`,undefined,transport,8000,{
    method:operation==='add'?'POST':operation==='update'?'PUT':'DELETE',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({expected_revision:project.revision_id,command_id:commandId,...(operation==='delete'?{}:{cultivation:values})})});
  const saved=decodeProject(raw,project.project_id);
  if(JSON.stringify(saved.geometry)!==JSON.stringify(project.geometry)||saved.geometry_token!==project.geometry_token||!saved.cultivation_plan)throw Error('API hat die unveränderte Geometrie und den Kulturplan nicht bestätigt. Bitte neu laden.');
  const before=project.cultivation_plan.entries,after=saved.cultivation_plan.entries;
  const untouched=before.filter(e=>e.cultivation_id!==cultivationId);
  if(untouched.some(e=>JSON.stringify(after.find(a=>a.cultivation_id===e.cultivation_id))!==JSON.stringify(e)))throw Error('API hat andere Anbauvorgänge verändert. Bitte neu laden.');
  const affected=operation==='add'?after.filter(e=>!before.some(b=>b.cultivation_id===e.cultivation_id)):after.filter(e=>e.cultivation_id===cultivationId);
  if(after.length!==before.length+(operation==='add'?1:operation==='delete'?-1:0)||affected.length!==(operation==='delete'?0:1)||affected.some(e=>e.bed_id!==bedId||!values||Object.entries(values).some(([key,value])=>e[key as keyof Cultivation]!==value)))throw Error('API hat die Kulturänderung nicht vollständig bestätigt. Bitte neu laden.');
  return saved;
}
