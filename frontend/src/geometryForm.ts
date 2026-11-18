import {bedDisplayName} from './projectView';
import type {SpatialBed} from './projectView';
import type {BedDraft,GeometryChanges} from './editingGeometry';

export type GeometryFields={width:string;length:string;angle:string;x:string;y:string;name?:string};
export function geometryFields(bed:SpatialBed):GeometryFields {
  return {width:String(bed.width_m),length:String(bed.length_m),angle:String(bed.rotation_deg),x:String(bed.center.x),y:String(bed.center.y)};
}
export function numericDraft(bed:SpatialBed,fields:GeometryFields):{draft:BedDraft|null;error:string} {
  if([fields.width,fields.length,fields.angle,fields.x,fields.y].some(v=>v.trim()===''||!Number.isFinite(Number(v))))return {draft:null,error:'Bitte alle Werte als endliche Zahlen eingeben.'};
  const width=Number(fields.width),length=Number(fields.length),angle=Number(fields.angle),x=Number(fields.x),y=Number(fields.y);
  if(width<=0||length<=0)return {draft:null,error:'Breite und Länge müssen größer als null sein.'};
  if(angle<0||angle>=360)return {draft:null,error:'Winkel bitte im Bereich 0° bis kleiner als 360° eingeben.'};
  const changes:GeometryChanges={};
  const name=fields.name?.trim();
  if(name!==undefined&&name!==bedDisplayName(bed.name)) {
    if(!name)return {draft:null,error:'Bitte einen Beetnamen eingeben.'};
    changes.name=name;
  }
  if(width!==bed.width_m)changes.width_m=width;
  if(length!==bed.length_m)changes.length_m=length;
  if(angle!==bed.rotation_deg)changes.rotation_deg=angle;
  if(x!==bed.center.x||y!==bed.center.y)changes.center={x,y};
  return {draft:Object.keys(changes).length?{kind:'edit',bed:{...bed,...changes},changes,anchor:'center'}:null,error:''};
}

/** Ignore Delete while editing text/numbers, including contenteditable widgets. */
export function deleteShortcut(event:{key:string;defaultPrevented:boolean;repeat:boolean;isComposing:boolean;altKey:boolean;ctrlKey:boolean;metaKey:boolean},inputActive:boolean):boolean {
  return event.key==='Delete'&&!inputActive&&!event.defaultPrevented&&!event.repeat&&!event.isComposing&&!event.altKey&&!event.ctrlKey&&!event.metaKey;
}
