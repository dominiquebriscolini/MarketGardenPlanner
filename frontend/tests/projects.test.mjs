import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeProject,decodeProjectList,worldToSvg,projectToMap,demoToMap,parcelPath} from '../.test-build/projectView.mjs';
import {getJSON,listProjects,loadProject} from '../.test-build/projectClient.mjs';
import {fittedView,cameraView} from '../.test-build/interactions.mjs';

const payload=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8'));
const project=payload.project;
const demo=JSON.parse(readFileSync(new URL('../.test-build/demo.json',import.meta.url),'utf8'));
const summary=(({geometry,...rest})=>rest)(project);

test('Project decoding preserves identities, source data, locks and rotations',()=>{
  const before=JSON.stringify(payload);
  assert.equal(decodeProject(payload,project.project_id),project);
  const map=projectToMap(project);
  assert.equal(map.beds[0].id,project.geometry.beds[0].object_id);
  assert.equal(map.beds[0].source.rotation_deg,17);
  assert.equal(map.beds[1].source.geometry_locked,true);
  assert.equal(JSON.stringify(payload),before);
  assert.equal('schedule' in map,false);
});

test('North-up reflection, arbitrary parcel edges and hole path use same metric space',()=>{
  assert.deepEqual(worldToSvg({x:2,y:3}),[2,-3]);
  const map=projectToMap(project);
  assert.deepEqual(map.boundary[2],[26,-20]);
  assert.deepEqual(map.holes[0][0],[16,-10]);
  assert.equal((parcelPath(map).match(/M /g)||[]).length,2);
  assert.equal((parcelPath(map).match(/ Z/g)||[]).length,2);
});

test('All four 17-degree SVG rectangle corners match reflected world corners',()=>{
  const map=projectToMap(project),b=map.beds[0],original=project.geometry.beds[0];
  const theta=17*Math.PI/180,svg=-theta;
  for(const [a,c] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
    const x=a*b.width/2,y=c*b.length/2;
    const actual=[b.x+Math.cos(svg)*x-Math.sin(svg)*y,b.y+Math.sin(svg)*x+Math.cos(svg)*y];
    // SVG local positive y corresponds to negative world length axis.
    const expected=worldToSvg({x:original.center.x+Math.cos(theta)*x+Math.sin(theta)*y,
                              y:original.center.y+Math.sin(theta)*x-Math.cos(theta)*y});
    actual.forEach((value,i)=>assert.ok(Math.abs(value-expected[i])<1e-12));
  }
  assert.equal(b.angle,-17);
  assert.equal(b.width,.65);assert.equal(b.length,8);
});

test('Fit and zoom retain metric proportions for saved project at desktop and mobile sizes',()=>{
  const map=projectToMap(project);
  for(const [w,h] of [[1280,720],[390,844]]) {
    const fit=fittedView(map.boundary,w,h);
    for(const zoom of [1,2,4]) {
      const view=cameraView(fit,zoom,{x:0,y:0});
      assert.ok(Math.abs(w/view.width-h/view.height)<1e-10);
    }
    assert.ok(map.boundary.every(([x,y])=>x>=fit.x&&x<=fit.x+fit.width&&y>=fit.y&&y<=fit.y+fit.height));
  }
});

test('List parsing handles empty lists, distinct IDs and wrong response formats',()=>{
  assert.deepEqual(decodeProjectList({api_version:1,projects:[]}),[]);
  const other={...summary,project_id:'12345678-1234-1234-1234-123456789abc',name:'Other'};
  assert.deepEqual(decodeProjectList({api_version:1,projects:[summary,other]}).map(p=>p.project_id),[project.project_id,other.project_id]);
  assert.throws(()=>decodeProjectList({api_version:1,projects:[summary,summary]}));
  assert.throws(()=>decodeProjectList({api_version:2,projects:[]}));
  assert.throws(()=>decodeProject(payload,other.project_id));
});

test('Unsupported units, unclosed rings, bad rotations and duplicate IDs are rejected',()=>{
  for(const mutate of [p=>p.geometry.frame.unit='cm',p=>p.geometry.parcel.outer.pop(),
    p=>p.geometry.beds[0].rotation_deg=360,p=>p.geometry.beds[0].center.x=Infinity,
    p=>p.geometry.beds[1].object_id=p.geometry.beds[0].object_id]) {
    const copy=structuredClone(payload);mutate(copy.project);
    assert.throws(()=>decodeProject(copy,project.project_id));
  }
});

test('Read-only API client requests list and actual selected UUID',async()=>{
  const calls=[];
  const transport=async(path,options)=>{calls.push({path,options});return new Response(JSON.stringify(path==='/api/v1/projects'?{api_version:1,projects:[summary]}:payload));};
  await listProjects(undefined,transport);
  const loaded=await loadProject(project.project_id,undefined,transport);
  assert.equal(loaded.project_id,project.project_id);
  assert.deepEqual(calls.map(c=>c.path),['/api/v1/projects',`/api/v1/projects/${project.project_id}`]);
  assert.ok(calls.every(c=>!c.options.method&&!c.options.body));
});

test('Network, HTTP, invalid JSON, cancellation and timeout are distinguishable',async()=>{
  await assert.rejects(getJSON('/api/v1/projects',undefined,async()=>{throw new TypeError('network');}),/Keine Verbindung/);
  await assert.rejects(getJSON('/api/v1/projects',undefined,async()=>new Response('{}',{status:404})),/8766/);
  await assert.rejects(getJSON('/api/v1/projects',undefined,async()=>new Response('broken')),/JSON/);
  const transport=async(_path,{signal})=>new Promise((_,reject)=>{
    if(signal.aborted)reject(new DOMException('aborted','AbortError'));
    else signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true});
  });
  const controller=new AbortController();
  const waiting=getJSON('/api/v1/projects',controller.signal,transport);controller.abort();
  await assert.rejects(waiting,e=>e.name==='AbortError');
  await assert.rejects(getJSON('/api/v1/projects',undefined,transport,5),/nicht rechtzeitig/);
});

test('Demo adapter retains old coordinates, IDs and scheduler data without mutation',()=>{
  const before=JSON.stringify(demo),map=demoToMap(demo);
  assert.equal(map.boundary,demo.geometry.boundary);
  for(let i=0;i<map.beds.length;i++) {
    const b=map.beds[i],old=demo.geometry.beds[i];
    assert.deepEqual([b.id,b.x,b.y,b.width,b.length,b.angle],[old.id,old.x,old.y,old.width,old.length,old.angle]);
    assert.equal(b.centered,false);
  }
  assert.deepEqual(map.holes,[]);assert.equal(JSON.stringify(demo),before);
});
