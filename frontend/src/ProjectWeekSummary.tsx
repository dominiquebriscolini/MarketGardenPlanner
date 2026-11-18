import {fmt} from './types';
import {growthLabels,projectStages,rowLayoutIssues,schematicGrowth,weeklyVisualCultures,weekCrops} from './projectSeason';
import type {SeasonFrame} from './projectSeason';

export function ProjectWeekSummary({frame,bedId,message,compact=false,showGrowth=false}:{frame?:SeasonFrame;bedId:string;message?:string;compact?:boolean;showGrowth?:boolean}) {
  if(!frame)return message?<p className="week-summary unavailable">{message}</p>:null;
  const state=frame.week.beds[bedId];
  const plantings=showGrowth?weeklyVisualCultures(frame,bedId):[];
  const names=weekCrops(frame,bedId),visible=compact?names.slice(0,3):names;
  return <section className={`week-summary ${state.stage}`} aria-label="Beetstatus der Kalenderwoche">
    <strong>KW {frame.week.iso_week} / {frame.week.iso_year} · {projectStages[state.stage]}</strong>
    {plantings.map(({entry})=><span key={entry.cultivation_id}>Wachstum (schematisch) · {plantings.length>1?frame.season.names[entry.profile_id]+' · ':''}{growthLabels[schematicGrowth(entry,frame.week,state.row_layout_day)]}</span>)}
    {state.row_layout_issue&&<span role="status">{rowLayoutIssues[state.row_layout_issue]}</span>}
    {state.row_positions_m&&state.row_layout_day&&<span>Reihenaufteilung · {fmt(state.row_layout_day)}</span>}
    {showGrowth&&state.row_positions_m&&plantings.length>0&&<small>Von links: {plantings.flatMap(({entry})=>
      (entry.row_numbers??[]).map(row=>({row,name:frame.season.names[entry.profile_id]})))
      .sort((a,b)=>a.row-b.row).map(({row,name})=>`${row} ${name}`).join(' · ')}</small>}
    {state.succession&&<span>Folgekulturen innerhalb dieser Woche</span>}
    {state.uncertain&&<span>Ohne geplantes Erntedatum bleibt unklar, wie lange die Kultur das Beet belegt.</span>}
    {state.possible_overlap&&<span>Mögliche Überlagerung · Zeitraum unvollständig</span>}
    {visible.length>0&&<ul>{visible.map((name,index)=><li key={index}>{name}</li>)}</ul>}
    {names.length>visible.length&&<small>+ {names.length-visible.length} weitere · im Beetdetail anzeigen</small>}
    {state.stage==='completed'&&<small>Nur nach Plan beendet; Räumung nicht bestätigt.</small>}
  </section>;
}
