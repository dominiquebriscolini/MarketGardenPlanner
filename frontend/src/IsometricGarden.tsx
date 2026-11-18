import {useEffect, useId, useMemo, useRef, useState} from 'react';
import type {PointerEvent} from 'react';
import type {Demo} from './types';
import {stages} from './types';
import type {DisplayBed, MapGeometry} from './projectView';
import type {GrowthPhase,SeasonFrame} from './projectSeason';
import {projectStages, schematicGrowth, weeklyVisualCultures, weekCrops} from './projectSeason';
import {grainradPlantForProfile,grainradPlantForSpecies} from './grainradPlants';
import {GrainradPlantLayer} from './GrainradPlantLayer';
import type {PlantingSpriteGrid} from './GrainradPlantLayer';
import {ProjectWeekPatterns,projectWeekPattern} from './ProjectWeekPatterns';
import {cameraView, fittedView} from './interactions';
import type {Point, View} from './interactions';

const initialCamera = {zoom:1, pan:{x:0,y:0}};
const minZoom = .65;
const maxZoom = 6;

const projectPoint = (x:number, y:number):[number,number] => [
  (x-y)*Math.sqrt(3)/2, (x+y)/2,
];

function bedPoint(bed:DisplayBed, x:number, y:number) {
  const angle = bed.angle*Math.PI/180;
  const dx = x-(bed.centered ? bed.width/2 : 0);
  const dy = y-(bed.centered ? bed.length/2 : 0);
  return projectPoint(
    bed.x+dx*Math.cos(angle)-dy*Math.sin(angle),
    bed.y+dx*Math.sin(angle)+dy*Math.cos(angle),
  );
}

const visualSpacing=.8;

function visualGrid(bed:DisplayBed,left:number,width:number,asset:PlantingSpriteGrid['asset'],phase:GrowthPhase):PlantingSpriteGrid {
  const columns=Math.max(1,Math.floor(width/visualSpacing+1e-9));
  const positions=Math.max(1,Math.floor(bed.length/visualSpacing+1e-9));
  const x=left+(width-(columns-1)*visualSpacing)/2;
  const y=(bed.length-(positions-1)*visualSpacing)/2;
  const [ox,oy]=bedPoint(bed,x,y);
  const [ax,ay]=bedPoint(bed,x+visualSpacing,y);
  const [lx,ly]=bedPoint(bed,x,y+visualSpacing);
  return {columns,positions,asset,phase,origin:{x:ox,y:oy},
    across:{x:ax-ox,y:ay-oy},along:{x:lx-ox,y:ly-oy}};
}

type LabelAnchor = {id:string; name:string; point:Point; bounds:View};
type LabelBox = LabelAnchor & {x:number;y:number;width:number};
const labelHeight = 22;

function placeLabels(anchors:LabelAnchor[], view:View, unitsPerPixel:number, selected:string|null) {
  const boxes:LabelBox[] = [];
  const width = view.width/unitsPerPixel;
  const height = view.height/unitsPerPixel;
  const ordered = anchors.slice().sort((a,b)=>Number(b.id===selected)-Number(a.id===selected));
  for(const anchor of ordered) {
    const x = (anchor.point.x-view.x)/unitsPerPixel;
    const y = (anchor.point.y-view.y)/unitsPerPixel;
    if(x<0||y<0||x>width||y>height)continue;
    const boxWidth = Math.min(160,Math.max(42,Array.from(anchor.name).length*7+16));
    if(boxWidth>width-12||labelHeight>height-12)continue;
    const bedLeft=(anchor.bounds.x-view.x)/unitsPerPixel;
    const bedTop=(anchor.bounds.y-view.y)/unitsPerPixel;
    const bedRight=bedLeft+anchor.bounds.width/unitsPerPixel;
    const bedBottom=bedTop+anchor.bounds.height/unitsPerPixel;
    const clearance=14;
    const candidates:Point[] = [];
    for(let step=1;step<=8;step++) {
      const gap=clearance+(step-1)*24;
      const left=bedLeft-boxWidth-gap, right=bedRight+gap;
      const top=bedTop-labelHeight-gap, bottom=bedBottom+gap;
      candidates.push({x:x-boxWidth/2,y:top},{x:right,y:y-labelHeight/2},
        {x:left,y:y-labelHeight/2},{x:x-boxWidth/2,y:bottom},
        {x:right,y:top},{x:left,y:top},{x:right,y:bottom},{x:left,y:bottom});
    }
    const position = candidates.map(p=>({
      x:Math.max(6,Math.min(width-boxWidth-6,p.x)),
      y:Math.max(6,Math.min(height-labelHeight-6,p.y)),
    })).find(p=>{
      if(p.x+boxWidth>bedLeft-clearance&&p.x<bedRight+clearance&&
        p.y+labelHeight>bedTop-clearance&&p.y<bedBottom+clearance)return false;
      return boxes.every(box=>p.x+boxWidth+4<=box.x||box.x+box.width+4<=p.x||
        p.y+labelHeight+4<=box.y||box.y+labelHeight+4<=p.y);
    });
    if(position)boxes.push({...anchor,...position,width:boxWidth});
  }
  return boxes;
}

type Props = {
  geometry:MapGeometry;
  data?:Demo;
  index:number;
  selected:string|null;
  onSelect:(id:string|null)=>void;
  season?:SeasonFrame;
  seasonMessage?:string;
  dark?:boolean;
};

export function IsometricGarden({geometry,data,index,selected,onSelect,season,seasonMessage,dark=false}:Props) {
  const id = useId();
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<{id:number; start:Point; pan:Point; unitsPerPixel:number; moved:boolean}|null>(null);
  const [dragging,setDragging] = useState(false);
  const suppressClick = useRef(false);
  const [camera,setCamera] = useState(initialCamera);
  const [size,setSize] = useState({width:1000,height:740});
  useEffect(()=>{
    if(!svg.current)return;
    const observer=new ResizeObserver(([entry])=>{
      const {width,height}=entry.contentRect;
      if(width>0&&height>0)setSize({width,height});
    });
    observer.observe(svg.current);
    return ()=>observer.disconnect();
  },[]);
  const layout = useMemo(()=>{
    const rings = [geometry.boundary,...geometry.holes].map(ring=>ring.map(([x,y])=>projectPoint(x,y)));
    const [outer] = rings;
    const view = fittedView(outer,1000,740);
    const beds = geometry.beds.map(bed=>{
      const {width,length} = bed;
      const corners = [bedPoint(bed,0,0),bedPoint(bed,width,0),bedPoint(bed,width,length),bedPoint(bed,0,length)];
      return {bed,corners};
    });
    const anchors = beds.map(({bed,corners})=>{
      const xs=corners.map(([x])=>x),ys=corners.map(([,y])=>y);
      const x=Math.min(...xs),y=Math.min(...ys);
      return {
        id:bed.id,name:bed.label,
        bounds:{x,y,width:Math.max(...xs)-x,height:Math.max(...ys)-y},
        point:{x:(corners[0][0]+corners[2][0])/2,y:(corners[0][1]+corners[2][1])/2},
      };
    });
    return {rings,view,beds,anchors};
  },[geometry]);

  const view = useMemo(()=>cameraView(layout.view,camera.zoom,camera.pan),[layout.view,camera]);
  const grids=useMemo(()=>{
    if(data) {
      const day=data.days[index];
      if(!day)return [];
      const batches=new Map(data.schedule.batches.map(batch=>[batch.plan.id,batch]));
      return layout.beds.flatMap(({bed})=>{
        const state=day.beds[bed.id];
        const batch=state?.batch_id?batches.get(state.batch_id):undefined;
        if(!batch||(state.stage!=='growth'&&state.stage!=='harvest'))return [];
        const asset=grainradPlantForSpecies(batch.plan.profile_id);
        if(!asset)return [];
        const reservation=data.schedule.reservations.find(item=>item.bed_id===bed.id&&item.batch_id===batch.plan.id);
        const phase=state.stage==='harvest'?'mature':schematicGrowth(
          {start_date:reservation?.window.start??batch.plan.transplant_date??batch.plan.sowing_date,
            planned_harvest_date:batch.plan.first_harvest},
          {start_date:day.date,end_date:day.date},
        );
        return [visualGrid(bed,0,bed.width,asset,phase)];
      });
    }
    if(!season)return [];
    return layout.beds.flatMap(({bed})=>weeklyVisualCultures(season,bed.id).flatMap(({layout:grid,entry,centres})=>{
      const asset=grainradPlantForProfile(entry.profile_id);
      if(!asset)return [];
      const phase=schematicGrowth(entry,season.week,season.week.beds[bed.id]?.row_layout_day);
      if(!centres||!grid)return [visualGrid(bed,0,bed.width,asset,phase)];
      // Culture bands follow the allocation. The symbols inside them use
      // only the band's geometry and the visual pitch.
      const spacing=grid.row_spacing_m;
      const bands:{left:number;right:number}[]=[];
      for(const centre of centres) {
        const left=centre-spacing/2,right=centre+spacing/2;
        const previous=bands.at(-1);
        if(previous&&Math.abs(previous.right-left)<=1e-8)previous.right=right;
        else bands.push({left,right});
      }
      return bands.map(({left,right})=>visualGrid(bed,left,right-left,asset,phase));
    }));
  },[data,index,layout.beds,season]);
  useEffect(()=>{
    const element = svg.current;
    if(!element)return;
    const wheel = (event:WheelEvent)=>{
      if(event.ctrlKey||event.metaKey||event.deltaY===0)return;
      event.preventDefault();
      if(drag.current)return;
      const matrix = element.getScreenCTM();
      if(!matrix)return;
      const point = new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      const box = element.viewBox.baseVal;
      const anchor = {x:(point.x-box.x)/box.width-.5,y:(point.y-box.y)/box.height-.5};
      const factor = event.deltaY<0 ? 1.12 : 1/1.12;
      setCamera(previous=>{
        const zoom = Math.max(minZoom,Math.min(maxZoom,previous.zoom*factor));
        const delta = 1/previous.zoom-1/zoom;
        return {zoom,pan:{
          x:previous.pan.x+anchor.x*layout.view.width*delta,
          y:previous.pan.y+anchor.y*layout.view.height*delta,
        }};
      });
    };
    element.addEventListener('wheel',wheel,{passive:false});
    return ()=>element.removeEventListener('wheel',wheel);
  },[layout.view]);

  function startPan(event:PointerEvent<SVGSVGElement>) {
    if(!event.isPrimary||event.button!==0||drag.current)return;
    suppressClick.current=false;
    const matrix = event.currentTarget.getScreenCTM();
    if(!matrix||matrix.a<=0)return;
    drag.current = {
      id:event.pointerId,start:{x:event.clientX,y:event.clientY},
      pan:camera.pan,unitsPerPixel:1/matrix.a,moved:false,
    };
  }

  function movePan(event:PointerEvent<SVGSVGElement>) {
    const active = drag.current;
    if(!active||active.id!==event.pointerId)return;
    const dx = event.clientX-active.start.x;
    const dy = event.clientY-active.start.y;
    if(!active.moved) {
      if(Math.hypot(dx,dy)<=4)return;
      active.moved=true;
      suppressClick.current=true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    setCamera(previous=>({...previous,pan:{
      x:active.pan.x-dx*active.unitsPerPixel,
      y:active.pan.y-dy*active.unitsPerPixel,
    }}));
  }

  function endPan(event:PointerEvent<SVGSVGElement>) {
    if(drag.current?.id!==event.pointerId)return;
    drag.current=null;
    setDragging(false);
  }

  function zoomBy(factor:number) {
    setCamera(previous=>({...previous,zoom:Math.max(minZoom,Math.min(maxZoom,previous.zoom*factor))}));
  }

  function shift(x:number,y:number) {
    setCamera(previous=>({...previous,pan:{
      x:previous.pan.x+x*view.width/5,
      y:previous.pan.y+y*view.height/5,
    }}));
  }

  const day = data?.days[index];
  const demoProfiles = new Map(data?.schedule.batches.map(batch=>[batch.plan.id,batch.plan.profile_id]));
  const beds = layout.beds.map(layoutBed=>{
    const {bed} = layoutBed;
    const state = day?.beds[bed.id];
    const profile = state?.batch_id ? demoProfiles.get(state.batch_id) : undefined;
    const weekly = data ? undefined : season?.week.beds[bed.id];
    const stage = state?.stage ?? (weekly ? 'project-'+weekly.stage : seasonMessage ? 'project-unavailable' : 'unplanned');
    const status = state ? stages[state.stage] : weekly ? projectStages[weekly.stage] : seasonMessage ?? 'Keine Saisonplanung';
    const crops = data ? profile ? [data.names[profile]] : [] : season ? weekCrops(season,bed.id) : [];
    return {...layoutBed,stage,status,crops,pattern:projectWeekPattern(weekly)};
  });

  const {x,y,width,height} = view;
  const unitsPerPixel = Math.max(width/size.width,height/size.height);
  // The centered SVG viewBox can show extra space along either viewport axis.
  const visibleWidth = size.width * unitsPerPixel;
  const visibleHeight = size.height * unitsPerPixel;
  const plantView = {
    x: x + (width - visibleWidth) / 2,
    y: y + (height - visibleHeight) / 2,
    width: visibleWidth,
    height: visibleHeight,
  };
  const labels = useMemo(()=>placeLabels(layout.anchors,view,unitsPerPixel,selected),
    [layout.anchors,x,y,width,height,unitsPerPixel,selected]);
  return <>
    <svg ref={svg} className={`iso-garden${dragging?' dragging':''}`} viewBox={`${x} ${y} ${width} ${height}`}
      aria-label="Isometrische Gartenansicht" onClick={()=>onSelect(null)}
      onClickCapture={event=>{
        if(!suppressClick.current||event.detail===0)return;
        suppressClick.current=false;
        event.stopPropagation();
      }}
      onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan}
      onPointerCancel={endPan} onLostPointerCapture={endPan}
      onPointerLeave={event=>{if(!drag.current?.moved)endPan(event);}}>
    {!data&&<defs><ProjectWeekPatterns prefix={id}/></defs>}
    <path className="map-parcel iso-parcel" fillRule="evenodd"
      d={layout.rings.map(ring=>'M '+ring.join(' L ')+' Z').join(' ')}/>
    {data&&<polyline className="map-path iso-path" points={[projectPoint(2,14),projectPoint(26,14)].join(' ')}/>}
    {beds.map(({bed,corners,stage,status,crops,pattern})=><g key={bed.id} className="iso-bed"
      role="button" tabIndex={0} data-bed-id={bed.id} aria-pressed={selected===bed.id}
      aria-label={[bed.label,status,...crops].join(', ')}
      onClick={event=>{event.stopPropagation();onSelect(bed.id);}}
      onKeyDown={event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();onSelect(bed.id);}
      }}>
      <title>{[bed.label,status,...crops].join(' · ')}</title>
      <polygon className={'bed-fill '+stage} points={corners.join(' ')}/>
      {pattern&&<polygon className="iso-week-pattern" fill={`url(#${id}-${pattern})`}
        points={corners.join(' ')} pointerEvents="none"/>}
    </g>)}
    </svg>
    {grids.length>0&&<GrainradPlantLayer grids={grids} view={plantView} unitsPerPixel={unitsPerPixel} dark={dark}/>}
    <svg className="iso-annotations" viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true">
    {beds.filter(({bed})=>bed.id===selected).map(({bed,corners,stage})=><polygon key={bed.id}
      className={`iso-selection${stage==='project-unplanned'?' project-unplanned':''}`} points={corners.join(' ')} pointerEvents="none"/>)}
    <g className="iso-labels" transform={`translate(${x} ${y}) scale(${unitsPerPixel})`} aria-hidden="true">
      {labels.map(box=>{
        const anchorX=(box.point.x-x)/unitsPerPixel;
        const anchorY=(box.point.y-y)/unitsPerPixel;
        return <line key={box.id} x1={anchorX} y1={anchorY}
          x2={Math.max(box.x,Math.min(box.x+box.width,anchorX))}
          y2={Math.max(box.y,Math.min(box.y+labelHeight,anchorY))}/>;
      })}
      {labels.map(box=><foreignObject key={box.id} data-label-bed-id={box.id} x={box.x} y={box.y} width={box.width} height={labelHeight}>
        <div className={`iso-label${box.id===selected?' selected':''}`} title={box.name}>{box.name}</div>
      </foreignObject>)}
    </g>
    </svg>
    <nav className="map-tools floating" aria-label="Isometrische Kartenwerkzeuge">
      <div className="zoom-tools">
        <button type="button" aria-label="Verkleinern" disabled={camera.zoom===minZoom} onClick={()=>zoomBy(1/1.25)}>−</button>
        <output aria-label="Vergrößerung">{Math.round(camera.zoom*100)} %</output>
        <button type="button" aria-label="Vergrößern" disabled={camera.zoom===maxZoom} onClick={()=>zoomBy(1.25)}>+</button>
        <button type="button" aria-label="Garten einpassen" title="Garten einpassen" onClick={()=>setCamera(initialCamera)}>↺</button>
      </div>
      <div className="pan-tools">
        <span>VERSCHIEBEN</span>
        <button type="button" aria-label="Ausschnitt nach links" onClick={()=>shift(-1,0)}>←</button>
        <button type="button" aria-label="Ausschnitt nach oben" onClick={()=>shift(0,-1)}>↑</button>
        <button type="button" aria-label="Ausschnitt nach unten" onClick={()=>shift(0,1)}>↓</button>
        <button type="button" aria-label="Ausschnitt nach rechts" onClick={()=>shift(1,0)}>→</button>
      </div>
    </nav>
  </>;
}
