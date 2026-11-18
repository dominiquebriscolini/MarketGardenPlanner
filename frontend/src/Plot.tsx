import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Demo, stages } from './types';
import { cameraView, fittedView, Point } from './interactions';
import { BedTooltip, Hover } from './BedTooltip';
import { ProjectTooltip } from './ProjectTooltip';
import { MapGeometry, SpatialBed, parcelPath } from './projectView';
import {drawnBed,rotatedBed,screenToWorld,translatedBed} from './editingGeometry';
import {RotationHandle} from './RotationHandle';
import type {BedDraft,ScreenBounds} from './editingGeometry';
import type {View} from './interactions';
import type {BedEditor} from './useBedEditor';
import {missingHarvestSuffix,projectStages,weeklyPlantings,weekCrops} from './projectSeason';
import type {SeasonFrame} from './projectSeason';
import {ProjectWeekPatterns,projectWeekPattern} from './ProjectWeekPatterns';

type EditGesture = {pointerId:number;kind:'create'|'move'|'rotate';start:Point;end:Point;screen:Point;
  bed:SpatialBed;width:number;view:View;bounds:ScreenBounds;moved:boolean};

function gestureDraft(gesture:EditGesture,end:Point,shift:boolean):BedDraft|null {
  const {kind,start,bed,width}=gesture;
  const changed=kind==='create'?drawnBed(start,end,width,bed,shift):
    kind==='rotate'?rotatedBed(bed,start,end,shift):translatedBed(bed,start,end);
  return changed?{kind,bed:changed}:null;
}

const Geometry = memo(function Geometry({geometry,demo}: {geometry:MapGeometry;demo:boolean}) {
  const path=useMemo(()=>parcelPath(geometry),[geometry]);
  return <g className="static-geometry">
    <path data-testid="parcel" d={path} fillRule="evenodd" className="map-parcel" strokeWidth=".055"/>
    {demo && <>
    <path d="M2 14 H26" className="map-path" strokeWidth="1.1"/>
    <text x="3" y="17" className="world-note">ERSCHLIESSUNGSWEG</text>
    <text x="3" y="18" className="world-note">Synthetischer Lageplan / lokale Koordinaten in Metern</text>
    <path d="M26 4 V1.7 M25.7 2.2 L26 1.7 L26.3 2.2" fill="none" stroke="currentColor" strokeWidth=".055"/>
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
  const drag=useRef<{pointerId:number;start:Point;pan:Point;moved:boolean}|null>(null);
  const suppressClick=useRef(false);
  const editDrag=useRef<EditGesture|null>(null);
  const shiftPressed=useRef(false);
  const editorRef=useRef(editor);editorRef.current=editor;
  useEffect(()=>{
    // Recompute from the original gesture at the last pointer position, without rebasing on a snapped angle.
    const update=(shift:boolean)=>{
      shiftPressed.current=shift;
      const edit=editDrag.current;
      if(!edit?.moved||edit.kind==='move')return;
      const draft=gestureDraft(edit,edit.end,shift);
      if(draft)editorRef.current?.preview(draft);
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
            editDrag.current={pointerId:e.pointerId,kind,start,end:start,screen,bed,width:editor.widthM,view,bounds,moved:false};
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
          edit.end=end;
          const draft=gestureDraft(edit,end,e.shiftKey||shiftPressed.current);
          if(draft){setHover(null);editor.preview(draft);}
          else editor.cancel();
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
          editDrag.current=null;suppressClick.current=true;
          if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
          if(edit.moved){
            const end=screenToWorld({x:e.clientX,y:e.clientY},edit.bounds,edit.view);
            const draft=gestureDraft(edit,end,e.shiftKey||shiftPressed.current);
            if(draft)void editor.finish(draft);else editor.cancel();
          }
          return;
        }
        if(!drag.current)return;
        suppressClick.current=drag.current.moved;drag.current=null;setDragging(false);
        if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={()=>{if(editDrag.current)editor?.cancel();editDrag.current=null;drag.current=null;setDragging(false);suppressClick.current=false;}}
      onLostPointerCapture={()=>{if(editDrag.current){editDrag.current=null;editor?.cancel();}drag.current=null;setDragging(false);}}
      onPointerLeave={()=>setHover(null)}>
      <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" className="map-grid" strokeWidth=".018"/></pattern>
        <pattern id="hatch" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V.3" stroke="#ad8767" strokeWidth=".045"/></pattern>
        <ProjectWeekPatterns prefix="week"/></defs>
      <rect x={view.x} y={view.y} width={view.width} height={view.height} fill="url(#grid)"/>
      <Geometry geometry={geometry} demo={!!data}/>
      {geometry.beds.map(b=>{
        const state=day?.beds[b.id],batch=data?.schedule.batches.find(v=>v.plan.id===state?.batch_id);
        const x=b.centered?-b.width/2:0,y=b.centered?-b.length/2:0;
        const weekly=season?.week.beds[b.id],crops=season?weekCrops(season,b.id):[];
        const stage=state?.stage??(weekly?`project-${weekly.stage}`:seasonMessage?'project-unavailable':'unplanned');
        const status=state?stages[state.stage]:weekly?projectStages[weekly.stage]:seasonMessage??'Keine Saisonplanung';
        const pattern=projectWeekPattern(weekly);
        const plantings=weeklyPlantings(season,b.id);
        const cropLabel=crops.slice(0,2).map(name=>name.replace(missingHarvestSuffix,' ?')).join(' / ')+(crops.length>2?` +${crops.length-2}`:'');
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
          <rect x={x} y={y} width={b.width} height={b.length} className={`bed-fill ${stage}`} stroke="var(--bed-edge)" strokeWidth=".04"/>
          {stage==='cleanup'&&<rect x={x} y={y} width={b.width} height={b.length} fill="url(#hatch)"/>}
          {pattern&&<rect x={x} y={y} width={b.width} height={b.length} fill={`url(#week-${pattern})`} pointerEvents="none"/>}
          {plantings.flatMap(({entry,layout,centres})=>{
            const dx=layout.row_spacing_m,dy=layout.plant_spacing_m;
            const gridLength=dy*layout.positions_per_row,top=y+(b.length-gridLength)/2;
            const areas=centres?centres.map(centre=>({left:x+centre-dx/2,width:dx})):
              [{left:x+(b.width-layout.rows*dx)/2,width:layout.rows*dx}];
            const size=Math.min(dx,dy)*.23;
            return areas.map(({left,width},index)=>{
              const patternId='planting-'+entry.cultivation_id+'-'+index;
              return <g key={patternId} className="planting-marks" data-planting-cultivation={entry.cultivation_id}
                pointerEvents="none" aria-hidden="true">
                <defs><pattern id={patternId} x={left} y={top} width={dx} height={dy} patternUnits="userSpaceOnUse">
                  <path className="planting-cross" d={`M${dx/2-size} ${dy/2-size}l${2*size} ${2*size}m${-2*size} 0l${2*size} ${-2*size}`}/>
                </pattern></defs>
                <rect x={left} y={top} width={width} height={gridLength} fill={`url(#${patternId})`}/>
              </g>;
            });
          })}
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
