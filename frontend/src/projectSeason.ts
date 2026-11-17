import {getJSON,ProjectAPIError} from './projectClient';
import type {SavedProject} from './projectView';
import type {Cultivation} from './cultivationModel';
import {validCalendarDate} from './cultivationModel';

export const projectStages={unplanned:'Unbelegt · keine Kultur geplant',future:'Noch nicht belegt',planned:'Geplante Belegung',
  overlap:'Zeitliche Überlagerung / Mischkultur',uncertain:'Belegung unklar · Ende offen',gap:'Planungspause',completed:'Nach Plan abgeschlossen'} as const;
export type ProjectStage=keyof typeof projectStages;
export type WeeklyBed={stage:ProjectStage;active_ids:string[];open_ids:string[];upcoming_ids:string[];completed_ids:string[];shown_ids:string[];uncertain:boolean;succession:boolean;possible_overlap:boolean};
export type ProjectWeek={iso_year:number;iso_week:number;start_date:string;end_date:string;beds:Record<string,WeeklyBed>};
export type ProjectSeasonData={schema_version:1;project_id:string;revision_id:string;cultivation_revision_id:string;geometry_token:string;
  iso_year:number;years:number[];initial_week:number;week_count:number;cultivations:Cultivation[];names:Record<string,string>;weeks:ProjectWeek[]};
export type SeasonFrame={season:ProjectSeasonData;week:ProjectWeek};

export function decodeSeason(raw:any,project:SavedProject,year:number|null):ProjectSeasonData {
  const s=raw?.season;
  if(raw?.api_version!==1||s?.schema_version!==1||s.project_id!==project.project_id)throw Error('Saisonansicht nicht kompatibel.');
  if(s.revision_id!==project.revision_id||s.cultivation_revision_id!==project.cultivation_plan?.revision_id||s.geometry_token!==project.geometry_token)throw new ProjectAPIError(409,'revision_conflict');
  if(!Number.isInteger(s.iso_year)||s.iso_year<1||s.iso_year>9998||(year!==null&&year!==s.iso_year)||!Array.isArray(s.years)||!s.years.includes(s.iso_year)||s.years.some((y:unknown)=>!Number.isInteger(y)||Number(y)<1||Number(y)>9998)||!Array.isArray(s.weeks)||![52,53].includes(s.week_count)||s.weeks.length!==s.week_count||!Number.isInteger(s.initial_week)||s.initial_week<1||s.initial_week>s.weeks.length)throw Error('Ungültiger ISO-Wochenkalender.');
  if(JSON.stringify(s.cultivations)!==JSON.stringify(project.cultivation_plan?.entries)||!s.names||typeof s.names!=='object'||Array.isArray(s.names)||s.cultivations.some((e:Cultivation)=>typeof s.names[e.profile_id]!=='string'))throw Error('Saisonansicht passt nicht zu den Kulturvorgängen.');
  const bedIds=project.geometry.beds.map(b=>b.object_id).sort();
  const entries=new Map<string,Cultivation>(s.cultivations.map((e:Cultivation)=>[e.cultivation_id,e]));
  for(const [index,w] of s.weeks.entries()) {
    if(!w||w.iso_year!==s.iso_year||w.iso_week!==index+1||!validCalendarDate(w.start_date)||!validCalendarDate(w.end_date)||w.end_date<w.start_date||!w.beds||Object.keys(w.beds).sort().join(',')!==bedIds.join(','))throw Error('Ungültige Saisonwoche.');
    for(const [bedId,unknownBed] of Object.entries(w.beds)) {
      const b=unknownBed as WeeklyBed;
      if(!b||!Object.hasOwn(projectStages,b.stage)||['uncertain','succession','possible_overlap'].some(k=>typeof (b as any)[k]!=='boolean'))throw Error('Ungültiger Wochenstatus.');
      for(const key of ['active_ids','open_ids','upcoming_ids','completed_ids','shown_ids'] as const) {
        if(!Array.isArray(b[key])||new Set(b[key]).size!==b[key].length||b[key].some(id=>entries.get(id)?.bed_id!==bedId))throw Error('Ungültige Wochenzuordnung.');
      }
      if(b.shown_ids.some(id=>!b.active_ids.includes(id)&&!b.open_ids.includes(id)))throw Error('Ungültige sichtbare Kulturzuordnung.');
    }
  }
  return s;
}
export async function loadProjectSeason(project:SavedProject,year:number|null,signal?:AbortSignal,transport:typeof fetch=fetch) {
  return decodeSeason(await getJSON(`/api/v1/projects/${encodeURIComponent(project.project_id)}/season${year===null?'':`/${year}`}`,signal,transport),project,year);
}
export function weekBed(frame:SeasonFrame|undefined,bedId:string) {return frame?.week.beds[bedId];}
export function weekCrops(frame:SeasonFrame,bedId:string):string[] {
  return frame.week.beds[bedId].shown_ids.map(id=>{
    const e=frame.season.cultivations.find(e=>e.cultivation_id===id)!;
    return `${frame.season.names[e.profile_id]}${frame.week.beds[bedId].open_ids.includes(id)?' (Ende offen)':''}`;
  });
}
export type SeasonPreference={year:number;week:number};
export function readSeasonPreference(id:string,storage?:Pick<Storage,'getItem'>):SeasonPreference|null {
  try {
    const value=JSON.parse((storage??window.sessionStorage).getItem(`mgp.season.v1:${id}`)??'null');
    return value&&Number.isInteger(value.year)&&value.year>=1&&value.year<=9998&&Number.isInteger(value.week)&&value.week>=1&&value.week<=53?value:null;
  } catch {return null;}
}
export function writeSeasonPreference(id:string,value:SeasonPreference,storage?:Pick<Storage,'setItem'>) {
  try {(storage??window.sessionStorage).setItem(`mgp.season.v1:${id}`,JSON.stringify(value));}catch {/* View preferences must never block planning. */}
}
