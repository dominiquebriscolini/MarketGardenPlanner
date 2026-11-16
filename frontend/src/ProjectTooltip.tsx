import {useLayoutEffect,useRef,useState} from 'react';
import type {SpatialBed} from './projectView';
import type {Hover} from './BedTooltip';
import {tooltipPosition} from './interactions';
export function ProjectTooltip({bed,hover,viewport}:{bed:SpatialBed;hover:Hover;viewport:{width:number;height:number}}) {
  const ref=useRef<HTMLDivElement>(null),[size,setSize]=useState({width:256,height:180});
  useLayoutEffect(()=>{
    if(!ref.current)return;
    const observer=new ResizeObserver(([entry])=>{const r=entry.target.getBoundingClientRect();setSize(p=>p.width===r.width&&p.height===r.height?p:{width:r.width,height:r.height});});
    observer.observe(ref.current);return ()=>observer.disconnect();
  },[]);
  const p=tooltipPosition(hover,size,viewport);
  return <div ref={ref} id="bed-tooltip" role="tooltip" className="bed-tooltip" style={{left:p.x,top:p.y}}>
    <div className="tooltip-heading"><strong>{bed.name||'Beet'}</strong><span>{(bed.width_m*bed.length_m).toLocaleString('de-DE')} m²</span></div>
    <p className="muted">{bed.width_m.toLocaleString('de-DE')} × {bed.length_m.toLocaleString('de-DE')} m · {bed.rotation_deg}°</p>
    <small>Keine Saisonplanung hinterlegt</small><p className="tooltip-id">{bed.object_id}</p>
  </div>;
}
