import {getJSON,ProjectAPIError} from './projectClient';
import type {SavedProject} from './projectView';
import type {Cultivation} from './cultivationModel';
import {validCalendarDate} from './cultivationModel';

export const projectStages={unplanned:'Noch keine Kultur geplant',future:'Anbau beginnt später',planned:'Geplante Belegung',
  overlap:'Zeitliche Überlagerung / Mischkultur',uncertain:'Belegung unklar · geplantes Erntedatum fehlt',gap:'Zwischen zwei geplanten Kulturen',completed:'Nach Plan abgeschlossen'} as const;
export type ProjectStage=keyof typeof projectStages;
export const rowLayoutIssues={
  duplicate:'Eine Reihennummer ist gleichzeitig mehreren Kulturen zugeordnet.',
  unassigned:'Bitte allen gleichzeitigen Kulturen Reihennummern zuordnen.',
  width:'Die zugeordneten Reihen benötigen mehr als die verfügbare Beetbreite.',
  spacing:'Für mindestens eine Kultur fehlen Pflanzabstände.',
  uncertain:'Die Reihen lassen sich wegen ungeklärter Belegungsdauer noch nicht eindeutig darstellen.',
} as const;
export type WeeklyBed={row_layout_day?:string;row_layout_issue?:keyof typeof rowLayoutIssues;
  row_positions_m?:Record<string,number[]>;stage:ProjectStage;active_ids:string[];open_ids:string[];upcoming_ids:string[];completed_ids:string[];shown_ids:string[];uncertain:boolean;succession:boolean;possible_overlap:boolean};
export type ProjectWeek={iso_year:number;iso_week:number;start_date:string;end_date:string;beds:Record<string,WeeklyBed>};
export type ReferenceYield={min_kg:number;max_kg:number;basis:'plant_positions'|'occupied_row_length';
  source:string;scope:string;multiple_cuts:boolean};
export type PlantingLayout={rows:number;positions_per_row:number;capacity:number;
  row_spacing_m:number;plant_spacing_m:number;row_spacing_source:string;plant_spacing_source:string;
  row_spacing_status:string;plant_spacing_status:string;reference_yield?:ReferenceYield|null};
export type ProjectSeasonData={schema_version:1;project_id:string;revision_id:string;cultivation_revision_id:string;geometry_token:string;
  iso_year:number;years:number[];initial_week:number;week_count:number;cultivations:Cultivation[];names:Record<string,string>;planting_layouts?:Record<string,PlantingLayout|null>;weeks:ProjectWeek[]};
export type SeasonFrame={season:ProjectSeasonData;week:ProjectWeek};

export function decodeSeason(raw:any,project:SavedProject,year:number|null):ProjectSeasonData {
  const s=raw?.season;
  if(raw?.api_version!==1||s?.schema_version!==1||s.project_id!==project.project_id)throw Error('Saisonansicht nicht kompatibel.');
  if(s.revision_id!==project.revision_id||s.cultivation_revision_id!==project.cultivation_plan?.revision_id||s.geometry_token!==project.geometry_token)throw new ProjectAPIError(409,'revision_conflict');
  if(!Number.isInteger(s.iso_year)||s.iso_year<1||s.iso_year>9998||(year!==null&&year!==s.iso_year)||!Array.isArray(s.years)||!s.years.includes(s.iso_year)||s.years.some((y:unknown)=>!Number.isInteger(y)||Number(y)<1||Number(y)>9998)||!Array.isArray(s.weeks)||![52,53].includes(s.week_count)||s.weeks.length!==s.week_count||!Number.isInteger(s.initial_week)||s.initial_week<1||s.initial_week>s.weeks.length)throw Error('Ungültiger ISO-Wochenkalender.');
  if(JSON.stringify(s.cultivations)!==JSON.stringify(project.cultivation_plan?.entries)||!s.names||typeof s.names!=='object'||Array.isArray(s.names)||s.cultivations.some((e:Cultivation)=>typeof s.names[e.profile_id]!=='string'))throw Error('Saisonansicht passt nicht zu den Kulturvorgängen.');
  const bedIds=project.geometry.beds.map(b=>b.object_id).sort();
  const entries=new Map<string,Cultivation>(s.cultivations.map((e:Cultivation)=>[e.cultivation_id,e]));
  if(s.planting_layouts!==undefined) {
    const layouts=s.planting_layouts;
    if(!layouts||typeof layouts!=='object'||Array.isArray(layouts)||Object.keys(layouts).length!==entries.size)
      throw Error('Ungültige Pflanzraster.');
    for(const [id,layout] of Object.entries(layouts) as [string,PlantingLayout|null][]) {
      if(!entries.has(id)||layout!==null&&(
        ![layout.rows,layout.positions_per_row,layout.capacity].every(n=>Number.isSafeInteger(n)&&n>=0)||
        layout.capacity!==layout.rows*layout.positions_per_row||
        ![layout.row_spacing_m,layout.plant_spacing_m].every(n=>Number.isFinite(n)&&n>0)||
        ![layout.row_spacing_source,layout.plant_spacing_source,layout.row_spacing_status,layout.plant_spacing_status].every(value=>typeof value==='string')
      ))throw Error('Pflanzraster passt nicht zu den Kulturvorgängen.');
      const yieldRange=layout?.reference_yield;
      if(yieldRange!=null&&(
        !Number.isFinite(yieldRange.min_kg)||yieldRange.min_kg<0||
        !Number.isFinite(yieldRange.max_kg)||yieldRange.max_kg<yieldRange.min_kg||
        !['plant_positions','occupied_row_length'].includes(yieldRange.basis)||
        typeof yieldRange.source!=='string'||!/^https?:\/\//i.test(yieldRange.source)||
        typeof yieldRange.scope!=='string'||typeof yieldRange.multiple_cuts!=='boolean'
      ))throw Error('Ungültige Ertragsreferenz.');
    }
  }
  for(const [index,w] of s.weeks.entries()) {
    if(!w||w.iso_year!==s.iso_year||w.iso_week!==index+1||!validCalendarDate(w.start_date)||!validCalendarDate(w.end_date)||w.end_date<w.start_date||!w.beds||Object.keys(w.beds).sort().join(',')!==bedIds.join(','))throw Error('Ungültige Saisonwoche.');
    for(const [bedId,unknownBed] of Object.entries(w.beds)) {
      const b=unknownBed as WeeklyBed;
      if(!b||!Object.hasOwn(projectStages,b.stage)||['uncertain','succession','possible_overlap'].some(k=>typeof (b as any)[k]!=='boolean'))throw Error('Ungültiger Wochenstatus.');
      for(const key of ['active_ids','open_ids','upcoming_ids','completed_ids','shown_ids'] as const) {
        if(!Array.isArray(b[key])||new Set(b[key]).size!==b[key].length||b[key].some(id=>entries.get(id)?.bed_id!==bedId))throw Error('Ungültige Wochenzuordnung.');
      }
      if(b.row_layout_day!==undefined&&(!validCalendarDate(b.row_layout_day)||b.row_layout_day<w.start_date||b.row_layout_day>w.end_date))
        throw Error('Ungültiger Datumspunkt für die Reihenplanung.');
      if(b.row_layout_issue!==undefined&&!Object.hasOwn(rowLayoutIssues,b.row_layout_issue))
        throw Error('Ungültiger Status der Reihenplanung.');
      if(b.row_positions_m!==undefined) {
        const bed=project.geometry.beds.find(item=>item.object_id===bedId)!;
        const positions=b.row_positions_m;
        if(!positions||typeof positions!=='object'||Array.isArray(positions)||b.row_layout_issue)throw Error('Ungültige Reihenpositionen.');
        for(const [id,centres] of Object.entries(positions)) {
          const layout=s.planting_layouts?.[id] as PlantingLayout|undefined;
          if(!b.active_ids.includes(id)||!layout||!Array.isArray(centres)||centres.length!==layout.rows||
            centres.some((p,i)=>!Number.isFinite(p)||p<0||p>bed.width_m||(i>0&&p<=centres[i-1])))
            throw Error('Ungültige Reihenpositionen.');
        }
      }
      if(b.shown_ids.some(id=>!b.active_ids.includes(id)&&!b.open_ids.includes(id)))throw Error('Ungültige sichtbare Kulturzuordnung.');
    }
  }
  return s;
}
export async function loadProjectSeason(project:SavedProject,year:number|null,signal?:AbortSignal,transport:typeof fetch=fetch) {
  return decodeSeason(await getJSON(`/api/v1/projects/${encodeURIComponent(project.project_id)}/season${year===null?'':`/${year}`}`,signal,transport),project,year);
}
export function weeklyVisualCultures(frame:SeasonFrame|undefined,bedId:string) {
  const state=frame?.week.beds[bedId];
  if(!frame||!state||state.row_layout_issue)return [];
  if(!state.row_positions_m&&(state.active_ids.length!==1||state.stage==='overlap'||state.possible_overlap))return [];
  const ids=state.row_positions_m?Object.keys(state.row_positions_m):state.active_ids;
  return ids.flatMap(id=>{
    const layout=frame.season.planting_layouts?.[id];
    const entry=frame.season.cultivations.find(cultivation=>cultivation.cultivation_id===id);
    return entry?[{layout,entry,centres:state.row_positions_m?.[id]}]:[];
  });
}

export function weeklyPlantings(frame:SeasonFrame|undefined,bedId:string) {
  return weeklyVisualCultures(frame,bedId).flatMap(planting=>
    planting.layout&&planting.layout.capacity>0?[{...planting,layout:planting.layout}]:[]);
}
export const growthPhases=['sprout','juvenile','developing','mature'] as const;
export type GrowthPhase=typeof growthPhases[number];
export const growthLabels:Record<GrowthPhase,string>={
  sprout:'Start',juvenile:'Jungpflanze',developing:'Herangewachsen',mature:'Ausgewachsen',
};
/** Presentation only: use the midpoint of the known part of the selected week. */
export function schematicGrowth(entry:Pick<Cultivation,'start_date'|'planned_harvest_date'>,week:Pick<ProjectWeek,'start_date'|'end_date'>,layoutDay?:string):GrowthPhase {
  if(!entry.planned_harvest_date)return 'sprout';
  const time=(date:string)=>Date.parse(date+'T00:00:00Z');
  const start=time(entry.start_date),end=time(entry.planned_harvest_date);
  if(start===end)return 'mature';
  const from=Math.max(start,time(week.start_date)),to=Math.min(end,time(week.end_date));
  const observation=layoutDay?time(layoutDay):(from+to)/2;
  const progress=(observation-start)/(end-start);
  return growthPhases[Math.max(0,Math.min(3,Math.floor(progress*4)))];
}
export function weekBed(frame:SeasonFrame|undefined,bedId:string) {return frame?.week.beds[bedId];}
export const missingHarvestSuffix=' (Erntedatum fehlt)';
export function weekCrops(frame:SeasonFrame,bedId:string):string[] {
  return frame.week.beds[bedId].shown_ids.map(id=>{
    const e=frame.season.cultivations.find(e=>e.cultivation_id===id)!;
    return `${frame.season.names[e.profile_id]}${frame.week.beds[bedId].open_ids.includes(id)?missingHarvestSuffix:''}`;
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
