import type {Point,View} from './interactions';
import type {SavedProject,SpatialBed} from './projectView';

export type GeometryChanges=Partial<Pick<SpatialBed,'center'|'width_m'|'length_m'|'rotation_deg'>>;
export type ResizeAnchor='center';
export type BedDraft={kind:'create'|'move'|'rotate'|'delete';bed:SpatialBed}|{kind:'edit';bed:SpatialBed;changes:GeometryChanges;anchor:ResizeAnchor};
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

export function snapRotation(angle:number,shift:boolean):number {
  return shift?(Math.round(angle/15)*15)%360:angle;
}
export function rotatedBed(bed:SpatialBed,start:Point,end:Point,shift=false):SpatialBed|null {
  if(bed.geometry_locked)throw Error('Dieses Beet ist gesperrt.');
  const a={x:start.x-bed.center.x,y:start.y-bed.center.y},b={x:end.x-bed.center.x,y:end.y-bed.center.y};
  if(Math.hypot(a.x,a.y)<1e-9||Math.hypot(b.x,b.y)<1e-9)return null;
  const delta=(Math.atan2(b.y,b.x)-Math.atan2(a.y,a.x))*180/Math.PI;
  const free=((bed.rotation_deg+delta)%360+360)%360;
  return {...bed,rotation_deg:snapRotation(free,shift)};
}

/** Explicit anchor contract: extend here when fixed-edge scaling is introduced. */
export function resizedBed(bed:SpatialBed,width:number,length:number,anchor:ResizeAnchor='center'):SpatialBed {
  if(anchor!=='center')throw Error('Die gewählte Bezugskante ist noch nicht unterstützt.');
  if(bed.geometry_locked)throw Error('Dieses Beet ist gesperrt.');
  if(!Number.isFinite(width)||width<=0||!Number.isFinite(length)||length<=0)throw Error('Breite und Länge müssen positiv und endlich sein.');
  return {...bed,width_m:width,length_m:length};
}

export function rotationHandle(bed:SpatialBed,metresPerPixel:number) {
  const angle=bed.rotation_deg*Math.PI/180,axis={x:-Math.sin(angle),y:Math.cos(angle)};
  const point=(distance:number)=>({x:bed.center.x+axis.x*distance,y:bed.center.y+axis.y*distance});
  return {base:point(bed.length_m/2),tip:point(bed.length_m/2+26*metresPerPixel),radius:6*metresPerPixel};
}

export function draftChanges(draft:BedDraft):GeometryChanges {
  if(draft.kind==='move')return {center:draft.bed.center};
  if(draft.kind==='rotate')return {rotation_deg:draft.bed.rotation_deg};
  return draft.kind==='edit'?draft.changes:{};
}

export function candidateGeometry(project:SavedProject,draft:BedDraft):SavedProject['geometry'] {
  if(draft.kind==='create')return {...project.geometry,beds:[...project.geometry.beds,draft.bed]};
  const before=project.geometry.beds.find(b=>b.object_id===draft.bed.object_id);
  if(!before||before.geometry_locked)throw Error('Das Beet ist nicht vorhanden oder gesperrt.');
  if(draft.kind==='delete')return {...project.geometry,beds:project.geometry.beds.filter(b=>b!==before)};
  // Only explicit geometric changes can enter a candidate; never copy metadata or IDs.
  const changes=draftChanges(draft);
  const dimensions=resizedBed(before,changes.width_m??before.width_m,changes.length_m??before.length_m,draft.kind==='edit'?draft.anchor:'center');
  const changed={...dimensions,center:changes.center??before.center,rotation_deg:changes.rotation_deg??before.rotation_deg};
  return {...project.geometry,beds:project.geometry.beds.map(b=>b===before?changed:b)};
}
