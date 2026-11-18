import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {screenToWorld,drawnBed,translatedBed,candidateGeometry} from '../.test-build/editingGeometry.mjs';
import {commitDraft,validateDraft} from '../.test-build/editingClient.mjs';
import {projectToMap,demoToMap} from '../.test-build/projectView.mjs';
import {fittedView,cameraView} from '../.test-build/interactions.mjs';
import {Plot} from '../.test-build/Plot.mjs';
import {EditorControls} from '../.test-build/EditorControls.mjs';

const project=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const demo=JSON.parse(readFileSync(new URL('../.test-build/demo.json',import.meta.url),'utf8'));
const seed={...project.geometry.beds[0],object_id:'fa146233-47bd-4d3d-a089-b382439b304d',name:'New bed'};
const create={kind:'create',bed:drawnBed({x:3.125,y:15},{x:7.331,y:18.52},.81234,seed)};
const move={kind:'move',bed:translatedBed(project.geometry.beds[0],{x:1,y:2},{x:2.1234,y:2.5678})};
const command='b2ec98cd-8818-44c6-84c3-2d5320dd2192';
const json=value=>new Response(JSON.stringify(value));
const validation=()=>json({api_version:1,valid:true,issues:[]});
const failure=(status,code,issues=[])=>new Response(JSON.stringify({api_version:1,error:{code,issues}}),{status});
function savedResponse(draft) {
  const saved=structuredClone(project);
  saved.revision_id='f0caef80-a4b4-46bc-8bdf-363a8a5225b8';
  saved.geometry=candidateGeometry(project,draft);
  return {api_version:1,project:saved};
}

test('Pointer-to-world inverse preserves meters under zoom, pan, viewport offsets and letterboxing',()=>{
  const world={x:9.731245,y:12.1271},geometry=projectToMap(project);
  for(const [width,height] of [[1280,720],[390,844]])for(const zoom of [.65,1,2,6]) {
    const view=cameraView(fittedView(geometry.boundary,width,height),zoom,{x:3.12,y:-2.5});
    const bounds={left:22,top:15,width,height:height+70};
    const scale=Math.min(bounds.width/view.width,bounds.height/view.height);
    const screen={x:bounds.left+(bounds.width-view.width*scale)/2+(world.x-view.x)*scale,
      y:bounds.top+(bounds.height-view.height*scale)/2+(-world.y-view.y)*scale};
    const actual=screenToWorld(screen,bounds,view);
    assert.ok(Math.abs(actual.x-world.x)<1e-12&&Math.abs(actual.y-world.y)<1e-12);
  }
});

test('Two length-axis points retain exact width, endpoints and unsnapped direction',()=>{
  const start={x:4.123456,y:3.654321},end={x:8.13579,y:14.26789};
  const bed=drawnBed(start,end,.65321,seed);
  assert.equal(bed.width_m,.65321);
  assert.equal(bed.length_m,Math.hypot(end.x-start.x,end.y-start.y));
  const theta=(bed.rotation_deg+90)*Math.PI/180;
  for(const [sign,expected] of [[-1,start],[1,end]]) {
    assert.ok(Math.abs(bed.center.x+sign*Math.cos(theta)*bed.length_m/2-expected.x)<1e-12);
    assert.ok(Math.abs(bed.center.y+sign*Math.sin(theta)*bed.length_m/2-expected.y)<1e-12);
  }
  assert.ok(![0,30,45,90].includes(bed.rotation_deg));
  assert.equal(bed.object_id,seed.object_id);
  assert.equal(drawnBed(start,start,.65,seed),null);
  assert.equal(drawnBed(start,end,0,seed),null);
  assert.equal(drawnBed(start,end,NaN,seed),null);
});

test('Shift drawing snaps from the original anchor and preserves length, including at the zero boundary',()=>{
  const start={x:4.12,y:3.65},width=.713,length=7.324;
  for(const [freeAngle,snappedAngle] of [[14,15],[44,45],[89,90],[359,0]]) {
    const theta=(freeAngle+90)*Math.PI/180;
    const end={x:start.x+Math.cos(theta)*length,y:start.y+Math.sin(theta)*length};
    const free=drawnBed(start,end,width,seed);
    const snapped=drawnBed(start,end,width,seed,true);
    assert.equal(snapped.rotation_deg,snappedAngle);
    assert.equal(snapped.length_m,free.length_m);
    assert.equal(snapped.width_m,width);
    const axis=(snappedAngle+90)*Math.PI/180;
    assert.ok(Math.abs(snapped.center.x-Math.cos(axis)*length/2-start.x)<1e-12);
    assert.ok(Math.abs(snapped.center.y-Math.sin(axis)*length/2-start.y)<1e-12);
    assert.deepEqual(drawnBed(start,end,width,seed,false),free);
  }
});

test('Move is a pure translation of a 17-degree bed and cannot change neighbors or dimensions',()=>{
  const before=JSON.stringify(project),geometry=candidateGeometry(project,move);
  const old=project.geometry.beds[0],after=geometry.beds[0];
  assert.deepEqual(after,{...old,center:move.bed.center});
  assert.equal(after.rotation_deg,17);
  assert.equal(geometry.beds[1],project.geometry.beds[1]);
  assert.equal(JSON.stringify(project),before);
  assert.throws(()=>translatedBed(project.geometry.beds[1],{x:0,y:0},{x:1,y:1}),/gesperrt/);
  assert.throws(()=>candidateGeometry(project,{kind:'move',bed:project.geometry.beds[1]}),/gesperrt/);
  const tampered={...move,bed:{...move.bed,width_m:99,rotation_deg:90}};
  assert.equal(candidateGeometry(project,tampered).beds[0].width_m,old.width_m);
  assert.equal(candidateGeometry(project,tampered).beds[0].rotation_deg,17);
});

test('Draw validates first, then creates with UUID, expected revision and command ID',async()=>{
  const before=JSON.stringify(project),calls=[];
  const transport=async(path,options)=>{
    calls.push({path,method:options.method,body:JSON.parse(options.body)});
    return calls.length===1?validation():json(savedResponse(create));
  };
  const saved=await commitDraft(project,create,command,undefined,transport);
  assert.deepEqual(calls.map(c=>[c.path,c.method]),[
    ['/api/v1/geometry/validate','POST'],[`/api/v1/projects/${project.project_id}/beds`,'POST']]);
  assert.deepEqual(calls[1].body,{bed:create.bed,expected_revision:project.revision_id,command_id:command});
  assert.equal(saved.geometry.beds.at(-1).object_id,seed.object_id);
  assert.equal(JSON.stringify(project),before);
});

test('Move writes only center through existing PATCH after validation',async()=>{
  const calls=[];
  const transport=async(path,options)=>{calls.push({path,body:JSON.parse(options.body)});return calls.length===1?validation():json(savedResponse(move));};
  const saved=await commitDraft(project,move,command,undefined,transport);
  assert.ok(calls[1].path.endsWith(`/beds/${move.bed.object_id}`));
  assert.deepEqual(calls[1].body.changes,{center:move.bed.center});
  assert.equal(saved.geometry.beds[0].rotation_deg,17);
});

test('Collision, boundary and hole failures block writes and retain confirmed input',async()=>{
  for(const code of ['bed_overlap','outside_parcel']) {
    let calls=0;const before=JSON.stringify(project);
    const transport=async()=>{calls++;return failure(422,'geometry_invalid',[{code,object_ids:[seed.object_id],message:'invalid'}]);};
    await assert.rejects(commitDraft(project,create,command,undefined,transport),e=>e.status===422&&e.issues[0].code===code);
    assert.equal(calls,1);assert.equal(JSON.stringify(project),before);
  }
});

test('API outage, conflict and incomplete confirmation never return a saved candidate',async()=>{
  const before=JSON.stringify(project);
  for(const fail of [()=>{throw new TypeError('network');},()=>failure(409,'revision_conflict'),()=>json({api_version:1,project})]) {
    let calls=0;
    await assert.rejects(commitDraft(project,create,command,undefined,async()=>++calls===1?validation():fail()));
    assert.equal(JSON.stringify(project),before);
  }
  await assert.rejects(validateDraft(project,create,undefined,async()=>{throw new TypeError('offline');}),/Keine Verbindung/);
});

test('Cancelled validation cannot start a write',async()=>{
  const controller=new AbortController();let calls=0;
  await assert.rejects(commitDraft(project,move,command,controller.signal,async()=>{
    calls++;controller.abort();return validation();
  }),e=>e.name==='AbortError');
  assert.equal(calls,1);
});

function plotMarkup(geometry,data,editor) {
  const previous=globalThis.window;
  try {
    globalThis.window={innerWidth:1280,innerHeight:720};
    return renderToStaticMarkup(React.createElement(Plot,{geometry,data,index:101,selected:move.bed.object_id,onSelect:()=>{},editor}));
  } finally {if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}

test('Invalid ghost is visibly distinct; confirmed bed remains at its saved transform',()=>{
  const editor={project,tool:'select',draft:move,phase:'invalid',busy:false,cancelVersion:0};
  const geometry=projectToMap(project),markup=plotMarkup(geometry,undefined,editor),original=geometry.beds[0];
  assert.ok(markup.includes('class="bed-draft invalid"'));
  assert.ok(markup.includes('move-origin'));
  assert.ok(markup.includes(`transform="translate(${original.x} ${original.y}) rotate(${original.angle})"`));
  assert.ok(markup.includes('aria-pressed="true"'));
});

test('Demo ignores editing inputs and keeps original seasonal labels',()=>{
  const markup=plotMarkup(demoToMap(demo),demo,{project,tool:'draw',draft:create,phase:'valid'});
  assert.ok(!markup.includes('bed-draft')&&!markup.includes('drawing-mode'));
  assert.ok(markup.includes('Kopfsalat'));
});

test('Toolbar exposes explicit width and disables edit tools during confirmation',()=>{
  const markup=renderToStaticMarkup(React.createElement(EditorControls,{editor:{tool:'draw',busy:true,width:'0.65321',widthM:.65321,draft:null,message:'',setTool:()=>{},setWidth:()=>{}}}));
  assert.ok(markup.includes('Beet zeichnen')&&markup.includes('Auswählen'));
  assert.ok(markup.includes('value="0.65"'));
  assert.equal((markup.match(/disabled=""/g)||[]).length,3);
});
