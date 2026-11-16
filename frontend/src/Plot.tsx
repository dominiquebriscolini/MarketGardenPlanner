import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Demo, stages } from './types';
import { cameraView, fittedView, Point } from './interactions';
import { BedTooltip, Hover } from './BedTooltip';
import { ProjectTooltip } from './ProjectTooltip';
import { MapGeometry, parcelPath } from './projectView';

const Geometry = memo(function Geometry({geometry,demo}: {geometry:MapGeometry;demo:boolean}) {
  const path=useMemo(()=>parcelPath(geometry),[geometry]);
  return <g className="static-geometry">
    <path data-testid="parcel" d={path} fillRule="evenodd" fill="#f8f8f0" stroke="#758170" strokeWidth=".055"/>
    {demo && <>
    <path d="M2 14 H26" stroke="#e4e5d8" strokeWidth="1.1"/>
    <text x="3" y="17" className="world-note">ERSCHLIESSUNGSWEG</text>
    <text x="3" y="18" className="world-note">Synthetischer Lageplan / lokale Koordinaten in Metern</text>
    <path d="M26 4 V1.7 M25.7 2.2 L26 1.7 L26.3 2.2" fill="none" stroke="#52644e" strokeWidth=".055"/>
    <text x="26" y="1.2" textAnchor="middle" className="bed-number">N</text></>}
  </g>;
});

export function Plot({geometry,data,index,selected,onSelect}: {
  geometry:MapGeometry; data?:Demo; index:number; selected:string|null; onSelect:(id:string|null)=>void;
}) {
  const svg=useRef<SVGSVGElement>(null);
  const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight});
  const [zoom,setZoom]=useState(1), [pan,setPan]=useState<Point>({x:0,y:0});
  const [hover,setHover]=useState<Hover|null>(null), [dragging,setDragging]=useState(false);
  const drag=useRef<{pointerId:number;start:Point;pan:Point;moved:boolean}|null>(null);
  const suppressClick=useRef(false);
  useEffect(()=>{
    if(!svg.current)return;
    const observer=new ResizeObserver(([entry])=>setViewport({width:entry.contentRect.width,height:entry.contentRect.height}));
    observer.observe(svg.current);
    return ()=>observer.disconnect();
  },[]);
  const fit=useMemo(()=>fittedView(geometry.boundary,viewport.width,viewport.height),[geometry,viewport.width,viewport.height]);
  const view=useMemo(()=>cameraView(fit,zoom,pan),[fit,zoom,pan]);
  const day=data?.days[index], metresPerPixel=view.width/viewport.width;
  const scaleMetres=metresPerPixel*110<5?2:metresPerPixel*110<10?5:10;
  const updateZoom=(factor:number)=>{setZoom(z=>Math.max(.65,Math.min(6,z*factor)));setHover(null);};
  const shift=(x:number,y:number)=>{setPan(p=>({x:p.x+x*view.width,y:p.y+y*view.height}));setHover(null);};
  return <>
    <svg ref={svg} className={`plot ${dragging?'dragging':''}`} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      style={{'--label-size':`${Math.max(.43,10*metresPerPixel)}px`,'--note-size':`${Math.max(.28,8*metresPerPixel)}px`} as CSSProperties}
      aria-label="Maßstäbliche Grundstücksansicht"
      onClick={e=>{
        if(suppressClick.current){suppressClick.current=false;return;}
        if(!(e.target as Element).closest('.bed')){onSelect(null);setHover(null);}
      }}
      onWheel={e=>updateZoom(e.deltaY<0?1.12:1/1.12)}
      onPointerDown={e=>{
        if(e.button!==0||(e.target as Element).closest('.bed'))return;
        e.preventDefault();
        drag.current={pointerId:e.pointerId,start:{x:e.clientX,y:e.clientY},pan,moved:false};
        suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e=>{
        const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;
        const dx=e.clientX-d.start.x,dy=e.clientY-d.start.y;
        if(Math.hypot(dx,dy)>4)d.moved=true;
        if(!d.moved)return;
        setDragging(true);setHover(null);
        setPan({x:d.pan.x-dx*metresPerPixel,y:d.pan.y-dy*metresPerPixel});
      }}
      onPointerUp={e=>{
        if(!drag.current)return;
        suppressClick.current=drag.current.moved;drag.current=null;setDragging(false);
        if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={()=>{drag.current=null;setDragging(false);suppressClick.current=false;}}
      onPointerLeave={()=>setHover(null)}>
      <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#d9ded1" strokeWidth=".018"/></pattern>
        <pattern id="hatch" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V.3" stroke="#ad8767" strokeWidth=".045"/></pattern></defs>
      <rect x={view.x} y={view.y} width={view.width} height={view.height} fill="url(#grid)"/>
      <Geometry geometry={geometry} demo={!!data}/>
      {geometry.beds.map(b=>{
        const state=day?.beds[b.id],batch=data?.schedule.batches.find(v=>v.plan.id===state?.batch_id);
        const x=b.centered?-b.width/2:0,y=b.centered?-b.length/2:0;
        const stage=state?.stage??'unplanned';
        const status=state?stages[state.stage]:'Keine Saisonplanung';
        return <g key={b.id} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}
          data-bed-id={b.id} className={`bed ${selected===b.id?'selected':''} ${hover?.id===b.id?'hovered':''}`}
          role="button" tabIndex={0} aria-pressed={selected===b.id}
          aria-label={`${b.label}: ${status}${batch?', '+data!.names[batch.plan.profile_id]:''}`}
          aria-describedby={hover?.id===b.id?'bed-tooltip':undefined}
          onPointerEnter={e=>{if(e.pointerType!=='touch')setHover({id:b.id,x:e.clientX,y:e.clientY});}}
          onPointerMove={e=>{if(e.pointerType!=='touch')setHover({id:b.id,x:e.clientX,y:e.clientY});}}
          onPointerLeave={()=>setHover(null)}
          onFocus={e=>{const r=e.currentTarget.getBoundingClientRect();setHover({id:b.id,x:r.right,y:r.top});}}
          onBlur={()=>setHover(null)}
          onClick={e=>{e.stopPropagation();setHover(null);onSelect(b.id);}}
          onKeyDown={e=>{
            if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(b.id);setHover(null);}
            if(e.key==='Escape')setHover(null);
          }}>
          <rect className="selection-outline" x={x-.18} y={y-.18} width={b.width+.36} height={b.length+.36} rx=".03"/>
          <rect x={x} y={y} width={b.width} height={b.length} className={`bed-fill ${stage}`} stroke="#829078" strokeWidth=".04"/>
          {stage==='cleanup'&&<rect x={x} y={y} width={b.width} height={b.length} fill="url(#hatch)"/>}
          {/* Cancel only the label's inherited rotation; keep its anchor and bed geometry. */}
          <text x={x+b.width/2} y={y-.5} transform={`rotate(${-b.angle} ${x+b.width/2} ${y-.5})`} textAnchor="middle" className="bed-number">{b.label}</text>
          {data&&<text transform={`translate(${x+b.width/2} ${y+b.length/2}) rotate(-90)`} textAnchor="middle" className="plant-label">{batch?data.names[batch.plan.profile_id]:'Frei'}</text>}
        </g>;
      })}
    </svg>
    <nav className="map-tools floating" aria-label="Kartenwerkzeuge">
      <div className="zoom-tools"><button aria-label="Verkleinern" onClick={()=>updateZoom(1/1.25)}>−</button>
        <output aria-label="Zoom">{Math.round(zoom*100)} %</output><button aria-label="Vergrößern" onClick={()=>updateZoom(1.25)}>+</button>
        <button onClick={()=>{setZoom(1);setPan({x:0,y:0});setHover(null);}}>Einpassen</button></div>
      <div className="pan-tools"><span>VERSCHIEBEN</span>
        <button aria-label="Nach links" onClick={()=>shift(-.12,0)}>←</button><button aria-label="Nach rechts" onClick={()=>shift(.12,0)}>→</button>
        <button aria-label="Nach oben" onClick={()=>shift(0,-.12)}>↑</button><button aria-label="Nach unten" onClick={()=>shift(0,.12)}>↓</button></div>
    </nav>
    <div className="map-scale" aria-label={`Maßstab ${scaleMetres} Meter`}><div style={{width:scaleMetres/metresPerPixel}}/><span>{scaleMetres} m</span><small>Lokale Geometrie · m</small></div>
    {!data&&<div className="map-north" aria-label="Norden">N ↑</div>}
    {hover&&data&&<BedTooltip data={data} index={index} hover={hover} viewport={viewport}/>}
    {hover&&!data&&geometry.beds.find(b=>b.id===hover.id)?.source&&<ProjectTooltip bed={geometry.beds.find(b=>b.id===hover.id)!.source!} hover={hover} viewport={viewport}/>}
  </>;
}
