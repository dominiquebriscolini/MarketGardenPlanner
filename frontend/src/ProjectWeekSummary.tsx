import {projectStages,weekCrops} from './projectSeason';
import type {SeasonFrame} from './projectSeason';

export function ProjectWeekSummary({frame,bedId,message,compact=false}:{frame?:SeasonFrame;bedId:string;message?:string;compact?:boolean}) {
  if(!frame)return message?<p className="week-summary unavailable">{message}</p>:null;
  const state=frame.week.beds[bedId];
  const names=weekCrops(frame,bedId),visible=compact?names.slice(0,3):names;
  return <section className={`week-summary ${state.stage}`} aria-label="Beetstatus der Kalenderwoche">
    <strong>KW {frame.week.iso_week} / {frame.week.iso_year} · {projectStages[state.stage]}</strong>
    {state.succession&&<span>Folgekulturen innerhalb dieser Woche</span>}
    {state.uncertain&&<span>Fehlende Ernte: mögliche Fortdauer ist unklar.</span>}
    {state.possible_overlap&&<span>Mögliche Überlagerung · Zeitraum unvollständig</span>}
    {visible.length>0&&<ul>{visible.map((name,index)=><li key={index}>{name}</li>)}</ul>}
    {names.length>visible.length&&<small>+ {names.length-visible.length} weitere · im Beetdetail anzeigen</small>}
    {state.stage==='completed'&&<small>Nur nach Plan beendet; Räumung nicht bestätigt.</small>}
  </section>;
}
