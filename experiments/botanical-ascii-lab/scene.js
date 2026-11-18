// VIS-001 fixtures only: no agronomy, new plant model or rendering algorithm.
import {project} from './projection.js?v=light03';
import {groundProjection} from './lighting.js?v=light03';
import {deform} from './wind.js?v=light03';

export const BED=Object.freeze({width:2.75,length:6,height:0});
export const VARIANTS=Object.freeze({A:1,B:2,C:3});
export const BED_OUTLINE=Object.freeze([
 [-1.375,-3,0],[1.375,-3,0],[1.375,3,0],[-1.375,3,0],[-1.375,-3,0]
].map(Object.freeze));

export function plantPositions(variant){
 const rows=VARIANTS[variant];if(!rows)throw new RangeError('Unknown VIS-001 variant');
 return Array.from({length:rows*10},(_,index)=>{
  const row=Math.floor(index/10),slot=index%10;
  return Object.freeze({key:`${variant}:${row}:${slot}`,row,slot,
   origin:Object.freeze([-BED.width/2+(row+.5)*BED.width/rows,-BED.length/2+(slot+.5)*BED.length/10,0])});
 });
}

export function createScene(template,variant){
 const instances=plantPositions(variant),stride=Math.max(...template.map(f=>f.id))+1;
 // r=0 is a geometric outline. The existing minimum screen stroke draws it;
 // lighting.js already excludes such zero-radius lines from shadow casting.
 const forms=[{id:0,type:'stem',color:'stem',r:0,static:true,points:BED_OUTLINE}];
 instances.forEach((instance,index)=>{
  for(const f of template)forms.push({...f,id:1+index*stride+f.id,localId:f.id,
   instanceId:instance.key,instanceOrigin:instance.origin});
 });
 return {variant,instances,forms};
}

export function worldPoint(form,point,time,strength){
 if(form.static)return point;
 const local=deform(point,time,strength,form.flex,form.phase);
 return form.instanceOrigin?local.map((v,i)=>v+form.instanceOrigin[i]):local;
}

export function initialStudyView(template,width,height){
 // One common envelope for ALL variants, plus all plant surfaces and their
 // projected shadows. Projection is linear, so local bounds may be translated.
 let loU=Infinity,loV=Infinity,hiU=-Infinity,hiV=-Infinity;
 const extend=([u,v],radius=0)=>{loU=Math.min(loU,u-radius);hiU=Math.max(hiU,u+radius);loV=Math.min(loV,v-radius);hiV=Math.max(hiV,v+radius);};
 for(const f of template)for(const p of f.points){
  const radius=(f.r||0)*1.3;extend(project(p),radius);
  extend(project([...groundProjection(p),0]),radius);
 }
 const local=[loU,loV,hiU,hiV];loU=loV=Infinity;hiU=hiV=-Infinity;
 for(const key of Object.keys(VARIANTS))for(const {origin}of plantPositions(key)){
  const [u,v]=project(origin);extend([u+local[0],v+local[1]]);extend([u+local[2],v+local[3]]);
 }
 BED_OUTLINE.forEach(p=>extend(project(p)));
 // Conservative projected allowance for the existing wind at strength 1 and
 // the filtered shadow edge; it never depends on the selected variant.
 const margin=.55;loU-=margin;hiU+=margin;loV-=margin;hiV+=margin;
 const inset={left:32,right:32,top:56,bottom:64};
 const scale=Math.min(Math.max(1,width-inset.left-inset.right)/(hiU-loU),Math.max(1,height-inset.top-inset.bottom)/(hiV-loV));
 const target=[(inset.left+width-inset.right)/2,(inset.top+height-inset.bottom)/2];
 return {zoom:scale/Math.min(height*.46,width*.58),
  pan:[target[0]-(loU+hiU)/2*scale-width*.5,target[1]-(loV+hiV)/2*scale-height*.89],
  scale,bounds:{loU,loV,hiU,hiV},inset};
}
