import { useLayoutEffect, useRef, useState } from 'react';
import { Demo, fmt, stages } from './types';
import { nextBedEvent, tooltipPosition, Point } from './interactions';

export type Hover = Point & {id:string};
export function BedTooltip({data,index,hover,viewport}: {
  data:Demo; index:number; hover:Hover; viewport:{width:number;height:number};
}) {
  const ref=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState({width:256,height:170});
  const day=data.days[index], bed=data.geometry.beds.find(b=>b.id===hover.id)!;
  const state=day.beds[bed.id];
  const batch=data.schedule.batches.find(b=>b.plan.id===state.batch_id);
  const next=nextBedEvent(data,bed.id,day.date);
  useLayoutEffect(()=>{
    if (!ref.current) return;
    const observer=new ResizeObserver(([entry])=>{
      const r=entry.target.getBoundingClientRect();
      setSize(p=>p.width===r.width&&p.height===r.height?p:{width:r.width,height:r.height});
    });
    observer.observe(ref.current);
    return ()=>observer.disconnect();
  },[]);
  const position=tooltipPosition(hover,size,viewport);
  return <div ref={ref} role="tooltip" id="bed-tooltip" className="bed-tooltip" style={{left:position.x,top:position.y}}>
    <div className="tooltip-heading"><strong>{bed.id}</strong><span>{(bed.width*bed.length).toLocaleString('de-DE')} m²</span></div>
    <p className="tooltip-crop">{batch?data.names[batch.plan.profile_id]:'Frei'}</p>
    <span className={`state-line ${state.stage}`}>{stages[state.stage]}</span>
    <div className="next-event"><span>NÄCHSTER BEKANNTER TERMIN</span>
      {next?<><strong>{fmt(next.date)}</strong><p>{next.label}</p></>:<p>Kein weiterer Termin bekannt</p>}
    </div>
  </div>;
}
