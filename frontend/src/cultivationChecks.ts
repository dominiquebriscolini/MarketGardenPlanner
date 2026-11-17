import {getJSON} from './projectClient';
import {validCalendarDate} from './cultivationModel';
import type {Cultivation,CultureProfile} from './cultivationModel';
import {fmt} from './types';

export type CultivationRelation={kind:'overlap'|'unknown';cultivation_ids:[string,string];start_date?:string;end_date?:string;complete?:boolean};
export type CultivationAnalysis={schema_version:1;relations:CultivationRelation[];incomplete_ids:string[]};
export async function checkCultivations(entries:Cultivation[],signal?:AbortSignal,transport:typeof fetch=fetch):Promise<CultivationAnalysis> {
  const raw:any=await getJSON('/api/v1/cultivations/analyze',signal,transport,8000,{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({entries})});
  const result=raw?.analysis,ids=new Set(entries.map(e=>e.cultivation_id));
  if(raw?.api_version!==1||result?.schema_version!==1||!Array.isArray(result.relations)||!Array.isArray(result.incomplete_ids)||result.incomplete_ids.some((id:unknown)=>typeof id!=='string'||!ids.has(id)))throw Error('Datumsprüfung nicht kompatibel.');
  for(const r of result.relations) {
    if(!r||!['overlap','unknown'].includes(r.kind)||!Array.isArray(r.cultivation_ids)||r.cultivation_ids.length!==2||r.cultivation_ids[0]===r.cultivation_ids[1]||r.cultivation_ids.some((id:string)=>!ids.has(id)))throw Error('Ungültige Datumsprüfung.');
    const [a,b]=r.cultivation_ids.map((id:string)=>entries.find(e=>e.cultivation_id===id)!);
    if(a.bed_id!==b.bed_id||(r.kind==='overlap'&&(!validCalendarDate(r.start_date)||!validCalendarDate(r.end_date)||r.end_date<r.start_date||typeof r.complete!=='boolean')))throw Error('Ungültige Datumsprüfung.');
  }
  return result;
}
export function cultivationName(entry:Cultivation,profiles:CultureProfile[]) {
  const p=profiles.find(p=>p.profile_id===entry.profile_id);
  return p?`${p.name}${p.variety_name?` · ${p.variety_name}`:''}`:entry.profile_id;
}
export function relationDescription(relation:CultivationRelation,entries:Cultivation[],profiles:CultureProfile[]) {
  const labels=relation.cultivation_ids.map(id=>{
    const e=entries.find(e=>e.cultivation_id===id)!;
    return `${cultivationName(e,profiles)} (${e.establishment==='direct'?'Aussaat':'Pflanzung'} ${fmt(e.start_date)})`;
  }).join(' und ');
  if(relation.kind==='unknown')return `${labels}: Überschneidung unklar, weil beim früheren Vorgang die geplante Ernte fehlt.`;
  const days=relation.start_date===relation.end_date?`am ${fmt(relation.start_date!)}`:`vom ${fmt(relation.start_date!)} bis ${fmt(relation.end_date!)}`;
  return `${labels}: Überschneidung der bekannten Planungstage ${days}.${relation.complete?'':' Weitere Dauer bleibt offen.'}`;
}
