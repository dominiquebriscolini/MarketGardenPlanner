import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {rotatedBed,resizedBed,rotationHandle,screenToWorld,candidateGeometry} from '../.test-build/editingGeometry.mjs';
import {geometryFields,numericDraft,deleteShortcut} from '../.test-build/geometryForm.mjs';
import {commitDraft} from '../.test-build/editingClient.mjs';
import {projectToMap,demoToMap} from '../.test-build/projectView.mjs';
import {fittedView,cameraView} from '../.test-build/interactions.mjs';
import {Plot} from '../.test-build/Plot.mjs';
import {BedGeometryForm} from '../.test-build/BedGeometryForm.mjs';
import {DeleteBedDialog} from '../.test-build/DeleteBedDialog.mjs';

const project=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const demo=JSON.parse(readFileSync(new URL('../.test-build/demo.json',import.meta.url),'utf8'));
const bed=project.geometry.beds[0],locked=project.geometry.beds[1];
const command='7b1071b5-7123-42a1-973e-8aad63d037a9';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status});
const preview=()=>json({api_version:1,valid:true,issues:[]});
const fail=(status,code)=>json({api_version:1,error:{code}},status);
const response=draft=>({api_version:1,project:{...project,geometry:candidateGeometry(project,draft)}});

test('Rotation about center preserves exact center, length, width, ID and decimal angle',()=>{
  const start={x:bed.center.x,y:bed.center.y+5};
  const theta=23.1256789*Math.PI/180;
  const end={x:bed.center.x-5*Math.sin(theta),y:bed.center.y+5*Math.cos(theta)};
  const after=rotatedBed(bed,start,end);
  assert.ok(Math.abs(after.rotation_deg-(17+23.1256789))<1e-12);
  assert.deepEqual({...after,rotation_deg:bed.rotation_deg},bed);
  assert.equal(rotatedBed(bed,start,bed.center),null);
  assert.throws(()=>rotatedBed(locked,start,end),/gesperrt/);
});

test('Rotation crosses zero continuously without snapping',()=>{
  const base={...bed,rotation_deg:359.75};
  const after=rotatedBed(base,{x:base.center.x+1,y:base.center.y},
    {x:base.center.x+Math.cos(.5*Math.PI/180),y:base.center.y+Math.sin(.5*Math.PI/180)});
  assert.ok(Math.abs(after.rotation_deg-.25)<1e-12);
});

test('Handle geometry and polar editing retain the same angle across zoom and viewport sizes',()=>{
  const target={x:bed.center.x-2.7891,y:bed.center.y+3.12345};
  for(const [width,height] of [[1280,720],[390,844]])for(const zoom of [.65,1,2,6]) {
    const view=cameraView(fittedView(projectToMap(project).boundary,width,height),zoom,{x:2.17,y:-3.25});
    const mpp=view.width/width,handle=rotationHandle(bed,mpp),bounds={left:13,top:9,width,height};
    const screen=p=>({x:bounds.left+(p.x-view.x)/mpp,y:bounds.top+(-p.y-view.y)/mpp});
    const end=screenToWorld(screen(target),bounds,view),start=screenToWorld(screen(handle.tip),bounds,view);
    const after=rotatedBed(bed,start,end);
    const expected=(Math.atan2(target.y-bed.center.y,target.x-bed.center.x)*180/Math.PI-90+360)%360;
    assert.ok(Math.abs(after.rotation_deg-expected)<1e-10);
    assert.ok(Math.abs(Math.hypot(handle.tip.x-handle.base.x,handle.tip.y-handle.base.y)/mpp-26)<1e-10);
    assert.ok(Math.abs(handle.radius/mpp-6)<1e-12);
  }
});

test('Center resizing keeps all unedited properties and rejects invalid or unsupported anchors',()=>{
  const after=resizedBed(bed,.753421,7.1234567,'center');
  assert.deepEqual(after,{...bed,width_m:.753421,length_m:7.1234567});
  assert.throws(()=>resizedBed(bed,.75,8,'positive_edge'),/noch nicht/);
  for(const size of [0,-1,Infinity,NaN])assert.throws(()=>resizedBed(bed,size,8));
  assert.throws(()=>resizedBed(locked,.75,8),/gesperrt/);
});

test('Numeric fields preserve full precision, reject blanks and never normalize entered angles',()=>{
  const precise={...bed,width_m:.753421098765,length_m:7.123456789012,rotation_deg:17.123456789123,
    center:{x:5.123456789123,y:9.987654321987}};
  const fields=geometryFields(precise);
  assert.equal(Number(fields.width),precise.width_m);
  assert.equal(numericDraft(precise,fields).draft,null);
  for(const [field,value] of [['width','0'],['length','-1'],['x',''],['y','NaN'],['angle','360'],['angle','-17']]) {
    assert.ok(numericDraft(precise,{...fields,[field]:value}).error);
  }
  assert.equal(numericDraft(precise,{...fields,angle:'359.999999'}).draft.changes.rotation_deg,359.999999);
});

test('Numeric position, dimensions and angle each produce only their explicit patch fields',()=>{
  const fields=geometryFields(bed),before=JSON.stringify(project);
  for(const [values,changes] of [[{x:'5.1234567',y:'9.7654321'},{center:{x:5.1234567,y:9.7654321}}],
    [{width:'0.75321',length:'7.12345'},{width_m:.75321,length_m:7.12345}],
    [{angle:'17.12567'},{rotation_deg:17.12567}]]) {
    const draft=numericDraft(bed,{...fields,...values}).draft;
    assert.deepEqual(draft.changes,changes);
    const geometry=candidateGeometry(project,draft);
    assert.deepEqual(geometry.beds[0],{...bed,...changes});
    assert.equal(geometry.beds[1],locked);
  }
  assert.equal(JSON.stringify(project),before);
});

test('Rotation and numeric edits validate before sending precise PATCH requests',async()=>{
  const drafts=[{kind:'rotate',bed:{...bed,rotation_deg:23.456789}},
    numericDraft(bed,{...geometryFields(bed),width:'.75321',length:'7.12345',x:'5.1234',angle:'23.5678'}).draft];
  for(const draft of drafts) {
    const calls=[];
    const transport=async(path,options)=>{calls.push({path,method:options.method,body:JSON.parse(options.body)});return calls.length===1?preview():json(response(draft));};
    const saved=await commitDraft(project,draft,command,undefined,transport);
    assert.equal(calls[0].path,'/api/v1/geometry/validate');
    assert.equal(calls[1].method,'PATCH');
    assert.deepEqual(calls[1].body.changes,draft.kind==='rotate'?{rotation_deg:23.456789}:draft.changes);
    assert.equal(calls[1].body.expected_revision,project.revision_id);
    assert.equal(saved.geometry.beds[0].rotation_deg,draft.bed.rotation_deg);
  }
});

test('Confirmed deletion removes exactly one bed using DELETE with expected revision and command ID',async()=>{
  const draft={kind:'delete',bed},calls=[],before=JSON.stringify(project);
  const saved=await commitDraft(project,draft,command,undefined,async(path,options)=>{
    calls.push({path,method:options.method,body:JSON.parse(options.body)});
    return calls.length===1?preview():json(response(draft));
  });
  assert.deepEqual(calls[0].body.geometry.beds,[locked]);
  assert.equal(calls[1].method,'DELETE');
  assert.deepEqual(calls[1].body,{expected_revision:project.revision_id,command_id:command});
  assert.deepEqual(saved.geometry.beds,[locked]);assert.equal(JSON.stringify(project),before);
});

test('Delete conflicts, API outages and incomplete confirmations never return an accepted deletion',async()=>{
  const draft={kind:'delete',bed},before=JSON.stringify(project);
  for(const last of [()=>fail(409,'revision_conflict'),()=>fail(422,'geometry_locked'),
    ()=>{throw new TypeError('offline');},()=>json({api_version:1,project}),
    ()=>json({api_version:1,project:{...project,geometry:{...project.geometry,beds:[]}}})]) {
    let calls=0;
    await assert.rejects(commitDraft(project,draft,command,undefined,async()=>++calls===1?preview():last()));
    assert.equal(JSON.stringify(project),before);
  }
  let calls=0;
  await assert.rejects(commitDraft(project,{kind:'delete',bed:locked},command,undefined,async()=>{calls++;return preview();}),/gesperrt/);
  assert.equal(calls,0);
});

test('Delete key is ignored for inputs, composition, repeat, modifiers and handled events',()=>{
  const event={key:'Delete',defaultPrevented:false,repeat:false,isComposing:false,altKey:false,ctrlKey:false,metaKey:false};
  assert.equal(deleteShortcut(event,false),true);
  assert.equal(deleteShortcut(event,true),false);
  for(const field of ['defaultPrevented','repeat','isComposing','altKey','ctrlKey','metaKey'])assert.equal(deleteShortcut({...event,[field]:true},false),false);
  assert.equal(deleteShortcut({...event,key:'Backspace'},false),false);
});

function renderPlot(selected,editor,data) {
  const previous=globalThis.window;
  try {globalThis.window={innerWidth:1280,innerHeight:720};
    return renderToStaticMarkup(React.createElement(Plot,{geometry:data?demoToMap(data):projectToMap(project),data,index:101,selected,onSelect:()=>{},editor}));
  } finally {if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}

test('Rotation handle is limited to the selected unlocked project bed, not demo or drawing mode',()=>{
  const editor={project,tool:'select',busy:false,cancelVersion:0,draft:null};
  const markup=renderPlot(bed.object_id,editor);
  assert.equal((markup.match(/data-rotation-handle=/g)||[]).length,1);
  assert.ok(markup.includes(`data-rotation-handle="${bed.object_id}"`));
  for(const [selected,e,data] of [[null,editor],[locked.object_id,editor],[bed.object_id,{...editor,tool:'draw'}],['B01',editor,demo]])
    assert.ok(!renderPlot(selected,e,data).includes('data-rotation-handle'));
});

test('Detail form renders compact decimals and locked controls; delete confirmation is explicit',()=>{
  const editor={busy:false,cancelVersion:0,inputVersion:0,draft:null,phase:'idle',message:'',deleteTarget:bed};
  const precise={...bed,width_m:.753421098765};
  const form=renderToStaticMarkup(React.createElement(BedGeometryForm,{bed:precise,editor}));
  assert.ok(form.includes('value="0.75"'));
  assert.equal(precise.width_m,.753421098765);
  assert.ok(form.includes('Änderungen speichern')&&form.includes('Beet löschen …'));
  assert.equal((form.match(/type="number"/g)||[]).length,5);
  const lockedForm=renderToStaticMarkup(React.createElement(BedGeometryForm,{bed:locked,editor}));
  assert.ok(lockedForm.includes('<fieldset disabled=""'));
  assert.ok(!lockedForm.includes('Änderungen speichern'));
  const dialog=renderToStaticMarkup(React.createElement(DeleteBedDialog,{editor}));
  assert.ok(dialog.includes('Beet wirklich löschen?')&&dialog.includes('Abbrechen')&&dialog.includes('Endgültig löschen'));
  assert.ok(dialog.includes(bed.object_id));
});
