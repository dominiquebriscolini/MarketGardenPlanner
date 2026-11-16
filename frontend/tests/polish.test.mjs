import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {formatGeometry,displayedInput} from '../.test-build/geometryDisplay.mjs';
import {geometryFields,numericDraft} from '../.test-build/geometryForm.mjs';
import {rotatedBed,snapRotation,rotationHandle,screenToWorld} from '../.test-build/editingGeometry.mjs';
import {commitDraft} from '../.test-build/editingClient.mjs';
import {BedGeometryForm} from '../.test-build/BedGeometryForm.mjs';
import {RotationReadout} from '../.test-build/RotationReadout.mjs';
import {tooltipPosition,cameraView,fittedView} from '../.test-build/interactions.mjs';
import {projectToMap} from '../.test-build/projectView.mjs';

const project=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const bed={...project.geometry.beds[0],width_m:.753421098765,length_m:7.123456789012,
  rotation_deg:17.123456789123,center:{x:5.123456789123,y:9.987654321987}};

test('Geometry display uses at most two decimals and never emits grouping or negative zero',()=>{
  for(const [value,display,input] of [[.753421,'0,75','0.75'],[7.129,'7,13','7.13'],
    [-6.12345,'-6,12','-6.12'],[12345.6789,'12345,68','12345.68'],[0,'0','0'],[-.00001,'0','0'],[90,'90','90']]) {
    assert.equal(formatGeometry(value),display);
    assert.equal(displayedInput(String(value)),input);
    assert.match(input,/^-?\d+(\.\d{1,2})?$/);
  }
});

test('Formatting and selecting a precise bed cannot create a numeric draft or alter raw geometry',()=>{
  const before=JSON.stringify(bed),fields=geometryFields(bed),raw={...fields};
  for(let selection=0;selection<3;selection++) {
    Object.values(fields).forEach(value=>{displayedInput(value);formatGeometry(Number(value));});
    assert.deepEqual(fields,raw);
    assert.equal(numericDraft(bed,fields).draft,null);
  }
  assert.equal(JSON.stringify(bed),before);
});

test('Active edits retain full input precision and incomplete text; blur changes only presentation',()=>{
  for(const value of ['0.753421098765','17.123456789123','','-','1e'])assert.equal(displayedInput(value,true),value);
  const fields=geometryFields(bed),changed={...fields,width:'0.812345678901'};
  assert.equal(displayedInput(changed.width),'0.81');
  const draft=numericDraft(bed,changed).draft;
  assert.deepEqual(draft.changes,{width_m:.812345678901});
  assert.equal(draft.bed.center.x,bed.center.x);
  assert.equal(draft.bed.center.y,bed.center.y);
  assert.equal(draft.bed.length_m,bed.length_m);
  assert.equal(draft.bed.rotation_deg,bed.rotation_deg);
});

test('Rendered inputs are compact without triggering preview or mutating model values',()=>{
  let calls=0;
  const editor={busy:false,draft:null,preview:()=>calls++,clearPreview:()=>calls++,finish:()=>calls++};
  const before=JSON.stringify(bed);
  const markup=renderToStaticMarkup(React.createElement(BedGeometryForm,{bed,editor}));
  const values=[...markup.matchAll(/value="([^"]*)"/g)].map(m=>m[1]);
  assert.deepEqual(values,['0.75','7.12','17.12','5.12','9.99']);
  assert.equal(calls,0);assert.equal(JSON.stringify(bed),before);
});

test('Saving one precise field never writes the rounded display values of other fields',async()=>{
  const actualProject={...project,geometry:{...project.geometry,beds:[bed,project.geometry.beds[1]]}};
  const fields=geometryFields(bed);
  Object.values(fields).forEach(value=>displayedInput(value));
  const draft=numericDraft(bed,{...fields,width:'0.812345678901'}).draft,calls=[];
  const saved={...actualProject,geometry:{...actualProject.geometry,beds:[draft.bed,project.geometry.beds[1]]}};
  const result=await commitDraft(actualProject,draft,'9affbffe-e349-4418-a0ce-6e1f4f07b1aa',undefined,async(path,options)=>{
    calls.push({path,body:JSON.parse(options.body)});
    return new Response(JSON.stringify(calls.length===1?{api_version:1,valid:true}:{api_version:1,project:saved}));
  });
  assert.deepEqual(calls[1].body.changes,{width_m:.812345678901});
  assert.equal(result.geometry.beds[0].length_m,bed.length_m);
  assert.deepEqual(result.geometry.beds[0].center,bed.center);
  assert.equal(result.geometry.beds[0].rotation_deg,bed.rotation_deg);
});

test('Shift alone enables absolute 15-degree steps, including 45, 90 and the zero boundary',()=>{
  for(const [angle,expected] of [[14.1234,15],[44.234567,45],[89.234567,90],[7.5,15],[352.49,345],[352.5,0],[359.9999,0]]) {
    assert.equal(snapRotation(angle,true),expected);
    assert.equal(snapRotation(angle,false),angle);
  }
});

test('Pressing and releasing Shift at the same pointer restores the original free angle exactly',()=>{
  const start=rotationHandle(bed,.05).tip;
  const theta=(44.23456789+90)*Math.PI/180;
  const end={x:bed.center.x+5*Math.cos(theta),y:bed.center.y+5*Math.sin(theta)};
  const free=rotatedBed(bed,start,end,false),snapped=rotatedBed(bed,start,end,true),released=rotatedBed(bed,start,end,false);
  assert.ok(Math.abs(free.rotation_deg-44.23456789)<1e-10);
  assert.equal(snapped.rotation_deg,45);
  assert.deepEqual(released,free);
  assert.deepEqual({...snapped,rotation_deg:bed.rotation_deg},bed);
});

test('Shift snapping preserves absolute direction across zoom and viewport sizes',()=>{
  for(const [width,height] of [[1280,720],[390,844]])for(const zoom of [.65,1,2,6]) {
    const view=cameraView(fittedView(projectToMap(project).boundary,width,height),zoom,{x:2.17,y:-3.25});
    const mpp=view.width/width,handle=rotationHandle(bed,mpp),bounds={left:13,top:9,width,height};
    const theta=(87.25+90)*Math.PI/180;
    const end={x:bed.center.x+5*Math.cos(theta),y:bed.center.y+5*Math.sin(theta)};
    const screen=p=>({x:bounds.left+(p.x-view.x)/mpp,y:bounds.top+(-p.y-view.y)/mpp});
    const start=screenToWorld(screen(handle.tip),bounds,view),target=screenToWorld(screen(end),bounds,view);
    assert.equal(rotatedBed(bed,start,target,true).rotation_deg,90);
    assert.ok(Math.abs(rotatedBed(bed,start,target,false).rotation_deg-87.25)<1e-10);
  }
});

test('Angle readout is upright HTML, compact and bounded near viewport edges',()=>{
  for(const shift of [true,false]) {
    const value={x:1279,y:719,angle:shift?45:44.23456789,shift},viewport={width:1280,height:720};
    const position=tooltipPosition(value,{width:156,height:58},viewport);
    const markup=renderToStaticMarkup(React.createElement(RotationReadout,{value,viewport}));
    assert.ok(markup.includes(shift?'45°':'44,23°'));
    assert.ok(markup.includes(shift?'Shift · 15°-Raster':'Frei · Shift für 15°'));
    assert.ok(!markup.includes('<svg')&&!markup.includes('transform'));
    assert.ok(position.x>=10&&position.x+156<=1270&&position.y>=10&&position.y+58<=710);
  }
});
