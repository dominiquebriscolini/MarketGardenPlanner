import {createTomato} from './model.js';
import {PlantRenderer} from './renderer.js';
import {rotateZ,project,depth} from './projection.js';
import {createTomato as beforeModel} from './.qa/before-depth/model.js';
const log=[],assert=(name,pass)=>{log.push(`${pass?'PASS':'FAIL'} ${name}`);if(!pass)throw Error(name);};
const base={width:700,height:700,zoom:1,pan:[0,0],size:5,wind:0,time:0,grid:false};
const canvas=()=>document.createElement('canvas');
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
try{
 const model=createTomato(),old=beforeModel(),leaves=model.filter(f=>f.type==='leaf');
 assert('Leaf / fruit / flower counts unchanged', ['leaf','fruit','flower'].every(type=>model.filter(f=>f.type===type).length===old.filter(f=>f.type===type).length));
 assert('Total model primitive count unchanged',model.length===old.length);
 assert('Geometry deterministic',JSON.stringify(model)===JSON.stringify(createTomato()));
 assert('All mesh coordinates finite',model.every(f=>f.points.flat().every(Number.isFinite)));
 // Nonplanarity is measured against the local base / tip / left-edge plane.
 const sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const warped=leaves.filter(f=>{const a=f.points[2],tip=f.points[72],edge=f.points[35],n=cross(sub(tip,a),sub(edge,a)),length=Math.hypot(...n);return f.points.some(p=>Math.abs(dot(sub(p,a),n))/(length||1)>.001);});
 assert('Every leaflet has >1 mm nonplanarity',warped.length===leaves.length);
 const quadrants=new Set(leaves.map(f=>{const p=f.points[37];return `${p[0]>=0}:${p[1]>=0}`;}));
 assert('Crown occupies all four horizontal quadrants',quadrants.size===4);
 // Camera null-ray contract: translation towards camera changes depth, not u/v.
 assert('Projection and camera depth agree',same(project([.2,.4,.7]).map(v=>+v.toFixed(10)),project([1.2,1.4,1.7]).map(v=>+v.toFixed(10)))&&depth([1.2,1.4,1.7])>depth([.2,.4,.7]));
 for(const degrees of [0]){
  const yaw=degrees*Math.PI/180;
  // Analytical fixtures with known camera-space depth, independent of the model.
  const fromView=(u,v,d)=>rotateZ([u/Math.sqrt(3)+v/3+d/Math.sqrt(3),-u/Math.sqrt(3)+v/3+d/Math.sqrt(3),-2*v/3+d/Math.sqrt(3)],-yaw);
  const sheet=(id,color,tilt=0)=>({id,type:'leaf',color,points:[[-.14,-.94],[.14,-.94],[.14,-.66],[-.14,-.66]].map(([u,v])=>fromView(u,v,.65+tilt*u)),faces:[[0,1,2],[0,2,3]]});
  const ownerAt=(r,u,v)=>{const scale=Math.min(base.height*.46,base.width*.58)*base.zoom,b=r.visibility,x=base.width*.5+u*scale,y=base.height*.89+v*scale;return b.owner[Math.floor(y/b.stepY)*b.w+Math.floor(x/b.stepX)];};
  for(const mode of ['ascii','halftone','hybrid']){
   const r=new PlantRenderer(canvas()),opts={...base,mode,yaw};
   r.render([sheet(600,'leaf'),sheet(601,'fruit',1)],opts);
   assert(`${degrees}° ${mode}: intersecting surfaces switch front layer per sample`,ownerAt(r,-.08,-.8)===600&&ownerAt(r,.08,-.8)===601);
   r.render([sheet(600,'leaf'),{id:602,type:'fruit',color:'fruit',points:[fromView(0,-.8,.63)],r:.05}],opts);
   assert(`${degrees}° ${mode}: sphere front wins although centre is behind leaf`,ownerAt(r,0,-.8)===602&&ownerAt(r,.10,-.8)===600);
  }
  const modes=[];
  for(const mode of ['ascii','halftone','hybrid']){
   const r=new PlantRenderer(canvas()),options={...base,yaw,mode};
   const stats=r.render(model,options),first=r.ctx.getImageData(0,0,700,700).data.slice();
   const owners=r.visibility.owner.slice();modes.push(owners);
   r.render([...model].reverse(),options);
   assert(`${degrees}° ${mode}: image independent of primitive order`,same(first,r.ctx.getImageData(0,0,700,700).data));
   assert(`${degrees}° ${mode}: owner buffer independent of primitive order`,same(owners,r.visibility.owner));
   log.push(`INFO ${degrees}° ${mode}: ${stats.glyphs} glyphs / ${stats.dots} dots / ${stats.ms.toFixed(1)} ms`);
  }
  assert(`${degrees}°: all modes share exactly the same visibility`,same(modes[0],modes[1])&&same(modes[1],modes[2]));
  // Three superimposed opaque sheets containing actual leaf, stem and fruit.
  // Move each fixture along the inverse camera ray; all have identical projection.
  const toWorld=p=>rotateZ(p,-yaw),face=[[0,0,.5],[.2,-.2,.5],[.2,.2,.9],[-.2,.2,.5]].map(p=>toWorld(p.map(v=>v+.4)));
  const near={id:10000,type:'leaf',color:'leaf',points:face,faces:[[0,1,2],[0,2,3]]};
  const behind={...near,id:10001,color:'fruit',points:face.map(p=>p.map((v,i)=>v-toWorld([.2,.2,.2])[i]))};
  const center=face[0].map((_,i)=>face.reduce((s,p)=>s+p[i],0)/4);
  const rearCenter=center.map((v,i)=>v-toWorld([.25,.25,.25])[i]);
  const fruit={id:10002,type:'fruit',color:'fruit',points:[rearCenter],r:.035};
  const stem={id:10003,type:'stem',color:'stem',r:.006,points:[rearCenter.map((v,i)=>v-(i===2?.035:0)),rearCenter.map((v,i)=>v+(i===2?.035:0))]};
  for(const mode of ['ascii','halftone','hybrid']){
   const r=new PlantRenderer(canvas()),opts={...base,mode,yaw};
   r.render([near],opts);const clean=r.visibility.owner.slice();
   r.render([fruit,stem,behind,near],opts);
   assert(`${degrees}° ${mode}: hidden rear surfaces never leak into visibility`,same(clean,r.visibility.owner));
  }
 }
 log.push(`COMPLETE · ${log.filter(s=>s.startsWith('PASS')).length} checks`);
}catch(e){log.push('ERROR '+e.stack);}
document.getElementById('results').textContent=log.join('\n');
