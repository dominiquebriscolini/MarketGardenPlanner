import type {Point,View} from './interactions';
import type {SavedProject,SpatialBed} from './projectView';

export type BedDraft={kind:'create'|'move';bed:SpatialBed};
export type Tool='select'|'draw';
export type ScreenBounds={left:number;top:number;width:number;height:number};

/** Invert SVG xMidYMid/meet and north reflection, with no snapping or rounding. */
export function screenToWorld(pointer:Point,bounds:ScreenBounds,view:View):Point {
  const scale=Math.min(bounds.width/view.width,bounds.height/view.height);
  return {x:view.x+(pointer.x-bounds.left-(bounds.width-view.width*scale)/2)/scale,
    y:-(view.y+(pointer.y-bounds.top-(bounds.height-view.height*scale)/2)/scale)};
}

/** Two axis endpoints plus an explicit width determine a freely rotated rectangle. */
export function drawnBed(start:Point,end:Point,width:number,seed:SpatialBed):SpatialBed|null {
  const dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy);
  if(!Number.isFinite(width)||width<=0||!Number.isFinite(length)||length===0)return null;
  const angle=(Math.atan2(dy,dx)*180/Math.PI-90+360)%360;
  return {...seed,center:{x:(start.x+end.x)/2,y:(start.y+end.y)/2},width_m:width,length_m:length,rotation_deg:angle};
}

export function translatedBed(bed:SpatialBed,start:Point,end:Point):SpatialBed {
  if(bed.geometry_locked)throw Error('Dieses Beet ist gesperrt.');
  return {...bed,center:{x:bed.center.x+end.x-start.x,y:bed.center.y+end.y-start.y}};
}

export function candidateGeometry(project:SavedProject,draft:BedDraft):SavedProject['geometry'] {
  if(draft.kind==='create')return {...project.geometry,beds:[...project.geometry.beds,draft.bed]};
  const before=project.geometry.beds.find(b=>b.object_id===draft.bed.object_id);
  if(!before||before.geometry_locked)throw Error('Das Beet ist nicht vorhanden oder gesperrt.');
  // A move can only change the center, regardless of any other draft properties.
  return {...project.geometry,beds:project.geometry.beds.map(b=>b===before?{...b,center:draft.bed.center}:b)};
}
