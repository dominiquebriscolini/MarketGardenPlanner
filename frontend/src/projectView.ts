import type { Bed, Demo } from './types';

export type WorldPoint = {x:number;y:number};
type ObjectMeta = {object_id:string;revision_id:string;name:string;origin:string;geometry_locked:boolean;generation_protected:boolean;source_reference:string|null};
export type SpatialBed = ObjectMeta & {parcel_id:string;center:WorldPoint;width_m:number;length_m:number;rotation_deg:number};
export type SavedProject = {
  project_id:string;name:string;revision_id:string;geometry_token:string;created_at:string;updated_at:string;
  geometry:{format:string;schema_version:number;revision_id:string;frame:{unit:string;x_axis:string;y_axis:string;angle:string};
    parcel:ObjectMeta & {outer:WorldPoint[];holes:WorldPoint[][]};beds:SpatialBed[]};
};
export type ProjectSummary = Pick<SavedProject,'project_id'|'name'|'revision_id'|'geometry_token'|'created_at'|'updated_at'>;
export type DisplayBed = Bed & {label:string;centered:boolean;source?:SpatialBed};
export type MapGeometry = {boundary:number[][];holes:number[][][];beds:DisplayBed[]};

function object(value:unknown):asserts value is Record<string,any> {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Ungültige Projektantwort der API.');
}
function uuid(value:unknown) {
  if(typeof value!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value))throw Error('Ungültige UUID in der Projektantwort.');
}
function text(value:unknown) {if(typeof value!=='string')throw Error('Unvollständige Projektantwort.');}
function point(value:unknown) {
  object(value);
  if(!Number.isFinite(value.x)||!Number.isFinite(value.y))throw Error('Ungültige Meterkoordinaten.');
}
function metadata(value:unknown) {
  object(value);uuid(value.object_id);uuid(value.revision_id);text(value.name);
  if(!['existing','manual','generated'].includes(value.origin)||typeof value.geometry_locked!=='boolean'||typeof value.generation_protected!=='boolean'||!(value.source_reference===null||typeof value.source_reference==='string'))throw Error('Ungültige Objektmetadaten.');
}
function summary(value:unknown) {
  object(value);uuid(value.project_id);uuid(value.revision_id);text(value.name);text(value.created_at);text(value.updated_at);
  if(typeof value.geometry_token!=='string'||!/^[0-9a-f]{64}$/.test(value.geometry_token))throw Error('Ungültiger Geometrie-Token.');
}
export function decodeProjectList(value:unknown):ProjectSummary[] {
  object(value);
  if(value.api_version!==1||!Array.isArray(value.projects))throw Error('Projekt-API ist nicht kompatibel.');
  value.projects.forEach(summary);
  if(new Set(value.projects.map(p=>p.project_id)).size!==value.projects.length)throw Error('Doppelte Projekt-IDs.');
  return value.projects;
}
function ring(value:unknown) {
  if(!Array.isArray(value)||value.length<4)throw Error('Ungültiger Polygonring.');
  value.forEach(point);
  if(value[0].x!==value.at(-1).x||value[0].y!==value.at(-1).y)throw Error('Polygonring ist nicht geschlossen.');
}
export function decodeProject(value:unknown, expectedId:string):SavedProject {
  object(value);
  if(value.api_version!==1)throw Error('Projekt-API ist nicht kompatibel.');
  const p=value.project;summary(p);object(p);
  if(p.project_id!==expectedId)throw Error('API lieferte ein anderes Projekt.');
  const g=p.geometry;object(g);uuid(g.revision_id);object(g.frame);
  if(g.format!=='market-garden-spatial'||g.schema_version!==1||g.frame.unit!=='m'||g.frame.x_axis!=='east'||g.frame.y_axis!=='north'||g.frame.angle!=='ccw_degrees')throw Error('Nicht unterstütztes Geometrieformat oder Koordinatensystem.');
  metadata(g.parcel);ring(g.parcel.outer);
  if(!Array.isArray(g.parcel.holes)||!Array.isArray(g.beds))throw Error('Unvollständige Grundstücksgeometrie.');
  g.parcel.holes.forEach(ring);
  for(const b of g.beds) {
    metadata(b);point(b.center);
    if(b.parcel_id!==g.parcel.object_id||!Number.isFinite(b.width_m)||b.width_m<=0||!Number.isFinite(b.length_m)||b.length_m<=0||!Number.isFinite(b.rotation_deg)||b.rotation_deg<0||b.rotation_deg>=360)throw Error('Ungültige Beetgeometrie.');
  }
  if(new Set([g.parcel.object_id,...g.beds.map((b:SpatialBed)=>b.object_id)]).size!==g.beds.length+1)throw Error('Doppelte Objekt-IDs.');
  return p as SavedProject;
}

/** Reflection of world north-up to SVG down-up, with no rounding or unit scaling. */
export function worldToSvg(p:WorldPoint):number[] {return [p.x,-p.y];}
export function projectToMap(project:SavedProject):MapGeometry {
  const g=project.geometry;
  return {boundary:g.parcel.outer.map(worldToSvg),holes:g.parcel.holes.map(r=>r.map(worldToSvg)),
    beds:g.beds.map((b,index)=>({id:b.object_id,label:b.name||`Beet ${index+1}`,x:b.center.x,y:-b.center.y,
      width:b.width_m,length:b.length_m,angle:-b.rotation_deg,centered:true,source:b}))};
}
export function demoToMap(demo:Demo):MapGeometry {
  return {boundary:demo.geometry.boundary,holes:[],beds:demo.geometry.beds.map(b=>({...b,label:b.id,centered:false}))};
}
export function parcelPath(geometry:MapGeometry):string {
  return [geometry.boundary,...geometry.holes].map(r=>`M ${r.map(p=>p.join(',')).join(' L ')} Z`).join(' ');
}
