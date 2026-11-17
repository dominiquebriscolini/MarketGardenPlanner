import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Demo, stages } from './types';
import { cameraView, fittedView, Point } from './interactions';
import { BedTooltip, Hover } from './BedTooltip';
import { ProjectTooltip } from './ProjectTooltip';
import { MapGeometry, SpatialBed, parcelPath } from './projectView';
import {drawnBed,rotatedBed,screenToWorld,translatedBed} from './editingGeometry';
import {RotationHandle} from './RotationHandle';
import {RotationReadout,RotationFeedback} from './RotationReadout';
import type {BedDraft,ScreenBounds} from './editingGeometry';
import type {View} from './interactions';
import type {BedEditor} from './useBedEditor';
import {projectStages,weekCrops} from './projectSeason';
import type {SeasonFrame} from './projectSeason';

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

export function Plot({geometry,data,index,selected,onSelect,editor:editorProp,season:seasonProp,seasonMessage}: {
  geometry:MapGeometry; data?:Demo; index:number; selected:string|null; onSelect:(id:string|null)=>void;editor?:BedEditor;season?:SeasonFrame;seasonMessage?:string;
}) {
  // A demo never gets an editing path, even if a caller accidentally supplies controls.
  const editor=data?undefined:editorProp;
  const season=data?undefined:seasonProp;
  const svg=useRef<SVGSVGElement>(null);
  const [viewport,setViewport]=useState({width:window.innerWidth,height:window.innerHeight});
  const [zoom,setZoom]=useState(1), [pan,setPan]=useState<Point>({x:0,y:0});
  const [hover,setHover]=useState<Hover|null>(null), [dragging,setDragging]=useState(false);
  const [rotationFeedback,setRotationFeedback]=useState<RotationFeedback|null>(null);
  const drag=useRef<{pointerId:number;start:Point;pan:Point;moved:boolean}|null>(null);
  const suppressClick=useRef(false);
  const editDrag=useRef<{pointerId:number;kind:'create'|'move'|'rotate';start:Point;end:Point;screen:Point;lastScreen:Point;bed:SpatialBed;width:number;view:View;bounds:ScreenBounds;draft:BedDraft|null;moved:boolean}|null>(null);
  const shiftPressed=useRef(false);
  const editorRef=useRef(editor);editorRef.current=editor;
  useEffect(()=>{
    // Recompute from the original gesture at the last pointer position, without rebasing on a snapped angle.
    const update=(shift:boolean)=>{
      shiftPressed.current=shift;
      const edit=editDrag.current;
      if(edit?.kind!=='rotate'||!edit.moved)return;
      const bed=rotatedBed(edit.bed,edit.start,edit.end,shift);
      if(bed){edit.draft={kind:'rotate',bed};editorRef.current?.preview(edit.draft);
        setRotationFeedback({...edit.lastScreen,angle:bed.rotation_deg,shift});}
    };
    const modifier=(event:KeyboardEvent)=>{if(event.key==='Shift'&&!event.repeat)update(event.type==='keydown');};
    const blur=()=>update(false);
    window.addEventListener('keydown',modifier);window.addEventListener('keyup',modifier);
    window.addEventListener('blur',blur);
    return ()=>{window.removeEventListener('keydown',modifier);window.removeEventListener('keyup',modifier);window.removeEventListener('blur',blur);};
  },[]);
  useEffect(()=>{
    const editing=editDrag.current!==null;
    const pointerId=editDrag.current?.pointerId??drag.current?.pointerId;
    editDrag.current=null;
    setRotationFeedback(null);
    if(svg.current&&pointerId!==undefined&&svg.current.hasPointerCapture(pointerId))svg.current.releasePointerCapture(pointerId);
    drag.current=null;setDragging(false);
    if(editing)editor?.cancel();
  },[editor?.tool,editor?.cancelVersion,viewport.width,viewport.height]);
  useEffect(()=>{
    if(!svg.current)return;
    const observer=new ResizeObserver(([entry])=>setViewport({width:entry.contentRect.width,height:entry.contentRect.height}));
    observer.observe(svg.current);
    return ()=>observer.disconnect();
  },[]);
  const fit=useMemo(()=>fittedView(geometry.boundary,viewport.width,viewport.height),[geometry,viewport.width,viewport.height]);
  const view=useMemo(()=>cameraView(fit,zoom,pan),[fit,zoom,pan]);
  const day=data?.days[index], metresPerPixel=view.width/viewport.width;
  const selectedBed=geometry.beds.find(b=>b.id===selected)?.source;
  const handleBed=editor?.draft&&editor.draft.kind!=='delete'&&editor.draft.bed.object_id===selected?editor.draft.bed:selectedBed;
  const scaleMetres=metresPerPixel*110<5?2:metresPerPixel*110<10?5:10;
  const updateZoom=(factor:number)=>{setZoom(z=>Math.max(.65,Math.min(6,z*factor)));setHover(null);};
  const shift=(x:number,y:number)=>{setPan(p=>({x:p.x+x*view.width,y:p.y+y*view.height}));setHover(null);};
  return <>
    <svg ref={svg} className={`plot ${dragging?'dragging':''} ${editor?.tool==='draw'?'drawing-mode':''}`} viewBox={`${view.x} ${view.y} ${view.width} ${view.height}`}
      style={{'--label-size':`${Math.max(.43,10*metresPerPixel)}px`,'--note-size':`${Math.max(.28,8*metresPerPixel)}px`} as CSSProperties}
      aria-label="Maßstäbliche Grundstücksansicht"
      onClick={e=>{
        if(suppressClick.current){suppressClick.current=false;return;}
        if(!(e.target as Element).closest('.bed,.rotation-handle')){onSelect(null);setHover(null);}
      }}
      onWheel={e=>{if(!editDrag.current&&!editor?.busy)updateZoom(e.deltaY<0?1.12:1/1.12);}}
      onPointerDown={e=>{
        if(editDrag.current||drag.current)return;
        suppressClick.current=false;
        if(e.button!==0||editor?.busy)return;
        if(editor) {
          const handleId=(e.target as Element).closest('[data-rotation-handle]')?.getAttribute('data-rotation-handle');
          const bedId=handleId||(e.target as Element).closest('[data-bed-id]')?.getAttribute('data-bed-id');
          const source=geometry.beds.find(b=>b.id===bedId)?.source;
          if(editor.tool==='draw'||source) {
            if(editor.tool==='draw')onSelect(null);
            if(editor.tool==='select'&&source){onSelect(source.object_id);if(source.geometry_locked){editor.blocked();return;}}
            if(editor.tool==='draw'&&(!Number.isFinite(editor.widthM)||editor.widthM<=0))return;
            editor.beginGesture();
            const bounds=e.currentTarget.getBoundingClientRect();
            const screen={x:e.clientX,y:e.clientY},start=screenToWorld(screen,bounds,view);
            const kind=editor.tool==='draw'?'create':handleId?'rotate':'move';
            const bed=kind!=='create'?source!:{object_id:crypto.randomUUID(),revision_id:crypto.randomUUID(),
              parcel_id:editor.project!.geometry.parcel.object_id,name:`Beet ${geometry.beds.length+1}`,origin:'manual',
              geometry_locked:false,generation_protected:true,source_reference:'Manuell gezeichnet',
              center:start,width_m:editor.widthM,length_m:1,rotation_deg:0};
            editDrag.current={pointerId:e.pointerId,kind,start,end:start,screen,lastScreen:screen,bed,width:editor.widthM,view,bounds,draft:null,moved:false};
            e.preventDefault();setHover(null);e.currentTarget.setPointerCapture(e.pointerId);return;
          }
        }
        if(e.button!==0||(e.target as Element).closest('.bed'))return;
        e.preventDefault();
        drag.current={pointerId:e.pointerId,start:{x:e.clientX,y:e.clientY},pan,moved:false};
        suppressClick.current=false;e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e=>{
        const edit=editDrag.current;
        if(edit&&editor&&edit.pointerId===e.pointerId) {
          if(Math.hypot(e.clientX-edit.screen.x,e.clientY-edit.screen.y)>4)edit.moved=true;
          if(!edit.moved)return;
          const end=screenToWorld({x:e.clientX,y:e.clientY},edit.bounds,edit.view);
          edit.end=end;edit.lastScreen={x:e.clientX,y:e.clientY};
          const snap=e.shiftKey||shiftPressed.current;
          const bed=edit.kind==='create'?drawnBed(edit.start,end,edit.width,edit.bed):edit.kind==='rotate'?rotatedBed(edit.bed,edit.start,end,snap):translatedBed(edit.bed,edit.start,end);
          if(bed){edit.draft={kind:edit.kind,bed};setHover(null);editor.preview(edit.draft);}
          else {edit.draft=null;editor.cancel();}
          if(edit.kind==='rotate'&&bed)setRotationFeedback({...edit.lastScreen,angle:bed.rotation_deg,shift:snap});
          return;
        }
        const d=drag.current;if(!d||d.pointerId!==e.pointerId)return;
        const dx=e.clientX-d.start.x,dy=e.clientY-d.start.y;
        if(Math.hypot(dx,dy)>4)d.moved=true;
        if(!d.moved)return;
        setDragging(true);setHover(null);
        setPan({x:d.pan.x-dx*metresPerPixel,y:d.pan.y-dy*metresPerPixel});
      }}
      onPointerUp={e=>{
        const edit=editDrag.current;
        if(edit&&editor&&edit.pointerId===e.pointerId){
          editDrag.current=null;setRotationFeedback(null);suppressClick.current=true;
          if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
          if(edit.moved){
            const end=screenToWorld({x:e.clientX,y:e.clientY},edit.bounds,edit.view);
            const bed=edit.kind==='create'?drawnBed(edit.start,end,edit.width,edit.bed):edit.kind==='rotate'?rotatedBed(edit.bed,edit.start,end,e.shiftKey||shiftPressed.current):translatedBed(edit.bed,edit.start,end);
            if(bed)void editor.finish({kind:edit.kind,bed});else editor.cancel();
          }
          return;
        }
        if(!drag.current)return;
        suppressClick.current=drag.current.moved;drag.current=null;setDragging(false);
        if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={()=>{if(editDrag.current)editor?.cancel();editDrag.current=null;drag.current=null;setDragging(false);setRotationFeedback(null);suppressClick.current=false;}}
      onLostPointerCapture={()=>{if(editDrag.current){editDrag.current=null;editor?.cancel();}drag.current=null;setDragging(false);setRotationFeedback(null);}}
      onPointerLeave={()=>setHover(null)}>
      <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#d9ded1" strokeWidth=".018"/></pattern>
        <pattern id="hatch" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V.3" stroke="#ad8767" strokeWidth=".045"/></pattern>
        <pattern id="week-overlap" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V.3" stroke="#697668" strokeWidth=".04"/></pattern>
        <pattern id="week-open" width=".35" height=".35" patternUnits="userSpaceOnUse"><circle cx=".17" cy=".17" r=".025" fill="#7e887b"/></pattern></defs>
      <rect x={view.x} y={view.y} width={view.width} height={view.height} fill="url(#grid)"/>
      <Geometry geometry={geometry} demo={!!data}/>
      {geometry.beds.map(b=>{
        const state=day?.beds[b.id],batch=data?.schedule.batches.find(v=>v.plan.id===state?.batch_id);
        const x=b.centered?-b.width/2:0,y=b.centered?-b.length/2:0;
        const weekly=season?.week.beds[b.id],crops=season?weekCrops(season,b.id):[];
        const stage=state?.stage??(weekly?`project-${weekly.stage}`:seasonMessage?'project-unavailable':'unplanned');
        const status=state?stages[state.stage]:weekly?projectStages[weekly.stage]:seasonMessage??'Keine Saisonplanung';
        const cropLabel=crops.slice(0,2).map(name=>name.replace(' (Ende offen)',' ?')).join(' / ')+(crops.length>2?` +${crops.length-2}`:'');
        return <g key={b.id} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`}
          data-bed-id={b.id} className={`bed ${selected===b.id?'selected':''} ${hover?.id===b.id?'hovered':''} ${editor?.draft&&editor.draft.kind!=='create'&&editor.draft.bed.object_id===b.id?'move-origin':''}`}
          role="button" tabIndex={0} aria-pressed={selected===b.id}
          aria-label={`${b.label}: ${status}${batch?', '+data!.names[batch.plan.profile_id]:crops.length?', '+crops.join(', '):''}`}
          aria-describedby={hover?.id===b.id?'bed-tooltip':undefined}
          onPointerEnter={e=>{if(e.pointerType!=='touch'&&!editDrag.current&&editor?.tool!=='draw'&&!editor?.busy)setHover({id:b.id,x:e.clientX,y:e.clientY});}}
          onPointerMove={e=>{if(e.pointerType!=='touch'&&!editDrag.current&&editor?.tool!=='draw'&&!editor?.busy)setHover({id:b.id,x:e.clientX,y:e.clientY});}}
          onPointerLeave={()=>setHover(null)}
          onFocus={e=>{const r=e.currentTarget.getBoundingClientRect();setHover({id:b.id,x:r.right,y:r.top});}}
          onBlur={()=>setHover(null)}
          onClick={e=>{e.stopPropagation();if(suppressClick.current){suppressClick.current=false;return;}if(editor?.tool==='draw')return;setHover(null);onSelect(b.id);}}
          onKeyDown={e=>{
            if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(b.id);setHover(null);}
            if(e.key==='Escape')setHover(null);
          }}>
          <rect className="selection-outline" x={x-.18} y={y-.18} width={b.width+.36} height={b.length+.36} rx=".03"/>
          <rect x={x} y={y} width={b.width} height={b.length} className={`bed-fill ${stage}`} stroke="#829078" strokeWidth=".04"/>
          {stage==='cleanup'&&<rect x={x} y={y} width={b.width} height={b.length} fill="url(#hatch)"/>}
          {weekly&&(weekly.stage==='overlap'||weekly.uncertain)&&<rect x={x} y={y} width={b.width} height={b.length} fill={`url(#${weekly.stage==='overlap'?'week-overlap':'week-open'})`} pointerEvents="none"/>}
          {/* Cancel only the label's inherited rotation; keep its anchor and bed geometry. */}
          <text x={x+b.width/2} y={y-.5} transform={`rotate(${-b.angle} ${x+b.width/2} ${y-.5})`} textAnchor="middle" className="bed-number">{b.label}</text>
          {season&&cropLabel&&<text transform={`translate(${x+b.width/2} ${y-.5}) rotate(${-b.angle}) translate(0 ${-12*metresPerPixel})`} textAnchor="middle" className="project-crop-label"><title>{crops.join(' / ')}</title>{cropLabel.length>42?cropLabel.slice(0,39)+'…':cropLabel}</text>}
          {data&&<text transform={`translate(${x+b.width/2} ${y+b.length/2}) rotate(-90)`} textAnchor="middle" className="plant-label">{batch?data.names[batch.plan.profile_id]:'Frei'}</text>}
        </g>;
      })}
      {editor?.draft&&editor.draft.kind!=='delete'&&<g className={`bed-draft ${editor.phase}`} data-testid="bed-draft" pointerEvents="none"
        transform={`translate(${editor.draft.bed.center.x} ${-editor.draft.bed.center.y}) rotate(${-editor.draft.bed.rotation_deg})`}>
        <rect x={-editor.draft.bed.width_m/2} y={-editor.draft.bed.length_m/2} width={editor.draft.bed.width_m} height={editor.draft.bed.length_m}/>
      </g>}
      {editor?.tool==='select'&&!editor.busy&&(!editor.draft||editDrag.current?.kind==='rotate')&&handleBed&&!handleBed.geometry_locked&&<RotationHandle bed={handleBed} metresPerPixel={metresPerPixel}/>}
    </svg>
    {rotationFeedback&&<RotationReadout value={rotationFeedback} viewport={viewport}/>}
    <nav className="map-tools floating" aria-label="Kartenwerkzeuge">
      <div className="zoom-tools"><button aria-label="Verkleinern" disabled={editor?.busy} onClick={()=>updateZoom(1/1.25)}>−</button>
        <output aria-label="Zoom">{Math.round(zoom*100)} %</output><button aria-label="Vergrößern" disabled={editor?.busy} onClick={()=>updateZoom(1.25)}>+</button>
        <button disabled={editor?.busy} onClick={()=>{setZoom(1);setPan({x:0,y:0});setHover(null);}}>Einpassen</button></div>
      <div className="pan-tools"><span>VERSCHIEBEN</span>
        <button aria-label="Nach links" onClick={()=>shift(-.12,0)}>←</button><button aria-label="Nach rechts" onClick={()=>shift(.12,0)}>→</button>
        <button aria-label="Nach oben" onClick={()=>shift(0,-.12)}>↑</button><button aria-label="Nach unten" onClick={()=>shift(0,.12)}>↓</button></div>
    </nav>
    <div className="map-scale" aria-label={`Maßstab ${scaleMetres} Meter`}><div style={{width:scaleMetres/metresPerPixel}}/><span>{scaleMetres} m</span><small>Lokale Geometrie · m</small></div>
    {!data&&<div className="map-north" aria-label="Norden">N ↑</div>}
    {hover&&data&&<BedTooltip data={data} index={index} hover={hover} viewport={viewport}/>}
    {hover&&!data&&geometry.beds.find(b=>b.id===hover.id)?.source&&<ProjectTooltip bed={geometry.beds.find(b=>b.id===hover.id)!.source!} hover={hover} viewport={viewport} season={season} seasonMessage={seasonMessage}/>}
  </>;
}
