import {useLayoutEffect,useRef,useState} from 'react';
import type {SpatialBed} from './projectView';
import type {Hover} from './BedTooltip';
import {tooltipPosition} from './interactions';
import {formatGeometry} from './geometryDisplay';
import {ProjectWeekSummary} from './ProjectWeekSummary';
import type {SeasonFrame} from './projectSeason';
export function ProjectTooltip({bed,hover,viewport,season,seasonMessage}:{bed:SpatialBed;hover:Hover;viewport:{width:number;height:number};season?:SeasonFrame;seasonMessage?:string}) {
  const ref=useRef<HTMLDivElement>(null),[size,setSize]=useState({width:256,height:180});
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const observer=new ResizeObserver(([entry])=>{const r=entry.target.getBoundingClientRect();setSize(p=>p.width===r.width&&p.height===r.height?p:{width:r.width,height:r.height});});
    observer.observe(ref.current);return ()=>observer.disconnect();
  },[]);
  const p=tooltipPosition(hover,size,viewport);
  return <div ref={ref} id="bed-tooltip" role="tooltip" className="bed-tooltip" style={{left:p.x,top:p.y}}>
    <div className="tooltip-heading"><strong>{bed.name||'Beet'}</strong><span>{formatGeometry(bed.width_m*bed.length_m)} m²</span></div>
    <p className="muted">{formatGeometry(bed.width_m)} × {formatGeometry(bed.length_m)} m · {formatGeometry(bed.rotation_deg)}°</p>
    {season||seasonMessage?<ProjectWeekSummary frame={season} bedId={bed.object_id} message={seasonMessage} compact/>:<small>Keine Saisonplanung hinterlegt</small>}<p className="tooltip-id">{bed.object_id}</p>
  </div>;
}
