import test from 'node:test';
import assert from 'node:assert/strict';
import {createTomato} from './model.js';
import {deform} from './wind.js';
import {project} from './projection.js';
import {LightingField} from './lighting.js';
import {BED,BED_OUTLINE,plantPositions,createScene,worldPoint,initialStudyView} from './scene.js';
const template=createTomato(),before=JSON.stringify(template),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,`${a} != ${b}`);
const expectedX={A:[0],B:[-.6875,.6875],C:[-11/12,0,11/12]};
const expectedY=[-2.7,-2.1,-1.5,-.9,-.3,.3,.9,1.5,2.1,2.7];
for(const [variant,rows]of [['A',1],['B',2],['C',3]]){
 test(`${variant}: exact count, rows, spacing and inside-bed origins`,()=>{
  const positions=plantPositions(variant);assert.equal(positions.length,rows*10);
  assert.equal(new Set(positions.map(p=>p.row)).size,rows);
  assert.equal(new Set(positions.map(p=>JSON.stringify(p.origin))).size,rows*10);
  for(const {origin:[x,y,z],row,slot}of positions){near(x,expectedX[variant][row]);near(y,expectedY[slot]);assert.equal(z,0);assert.ok(Math.abs(x)<BED.width/2&&Math.abs(y)<BED.length/2);}
 });
 test(`${variant}: globally unique IDs and shared, unmodified template geometry`,()=>{
  const scene=createScene(template,variant);assert.equal(scene.forms.length,1+rows*10*template.length);
  assert.equal(new Set(scene.forms.map(f=>f.id)).size,scene.forms.length);
  for(const f of scene.forms.slice(1)){
   const base=template[f.localId];assert.strictEqual(f.points,base.points);assert.strictEqual(f.faces,base.faces);
   for(const name of ['type','color','r','flex','phase'])assert.equal(f[name],base[name]);
   assert.ok(Number.isInteger(f.id)&&f.id>0&&f.id<2**31);
  }
  assert.equal(JSON.stringify(template),before);
 });
 test(`${variant}: wind is local and every instance root remains anchored`,()=>{
  const scene=createScene(template,variant);
  for(const instance of scene.instances){
   const f=scene.forms.find(f=>f.instanceId===instance.key&&f.localId===0);
   for(const time of [0,8.5,24]){
    assert.deepEqual(worldPoint(f,[0,0,0],time,1),instance.origin);
    const p=[.38,-.12,1.2],expected=deform(p,time,.55,f.flex,f.phase);
    worldPoint(f,p,time,.55).forEach((v,i)=>near(v,expected[i]+instance.origin[i]));
   }
  }
 });
}
test('A → B → C → A is deterministic and rejects unknown variants',()=>{
 const first=plantPositions('A');plantPositions('B');plantPositions('C');assert.deepEqual(plantPositions('A'),first);
 assert.throws(()=>plantPositions('D'),RangeError);
});
test('Bed has exact dimensions, stays static and casts no artificial line shadow',()=>{
 const bed=createScene(template,'A').forms[0];assert.equal(bed.static,true);assert.equal(bed.r,0);
 assert.deepEqual(bed.points,BED_OUTLINE);near(bed.points[1][0]-bed.points[0][0],2.75);near(bed.points[2][1]-bed.points[1][1],6);
 for(const p of bed.points)for(const time of [0,24])assert.deepEqual(worldPoint(bed,p,time,1),p);
 const light=new LightingField().build([{...bed}]);assert.ok(light.heights.every(z=>z===-Infinity));
});
test('Legacy single-plant path is exactly the original deformation',()=>{
 for(const f of template)for(const p of [f.points[0],f.points.at(-1)])assert.deepEqual(worldPoint(f,p,17,.55),deform(p,17,.55,f.flex,f.phase));
});
test('One common view fits the whole bed, all variants and maximum wind envelope',()=>{
 const width=940,height=768,view=initialStudyView(template,width,height),scale=Math.min(height*.46,width*.58)*view.zoom;
 const inside=p=>{const [u,v]=project(p),x=width*.5+view.pan[0]+u*scale,y=height*.89+view.pan[1]+v*scale;assert.ok(x>=32&&x<=width-32&&y>=56&&y<=height-64,JSON.stringify({p,x,y}));};
 BED_OUTLINE.forEach(inside);
 const extremes=plantPositions('C').filter(p=>p.slot===0||p.slot===9);
 for(const instance of extremes)for(const f of template)for(const p of f.points)for(const time of [0,19])inside(worldPoint({...f,instanceOrigin:instance.origin},p,time,1));
 assert.deepEqual(initialStudyView(template,width,height),view);assert.ok(view.zoom<1);
});
