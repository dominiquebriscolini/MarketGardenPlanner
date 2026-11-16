import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Plot} from '../.test-build/Plot.mjs';
import {ProjectTooltip} from '../.test-build/ProjectTooltip.mjs';
import {projectToMap,demoToMap} from '../.test-build/projectView.mjs';

const project=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const demo=JSON.parse(readFileSync(new URL('../.test-build/demo.json',import.meta.url),'utf8'));

function renderPlot(geometry,data) {
  const previous=globalThis.window;
  try {
    globalThis.window={innerWidth:1280,innerHeight:720};
    return renderToStaticMarkup(React.createElement(Plot,{geometry,data,index:101,selected:null,onSelect:()=>{}}));
  } finally {
    if(previous===undefined)delete globalThis.window;
    else globalThis.window=previous;
  }
}

test('Saved project renders persistent names without dimension or crop text inside beds',()=>{
  const geometry=projectToMap(project),before=JSON.stringify(geometry);
  const markup=renderPlot(geometry);
  assert.equal((markup.match(/class="bed-number"/g)||[]).length,geometry.beds.length);
  for(const bed of geometry.beds)assert.ok(markup.includes(`>${bed.label}</text>`));
  assert.ok(!markup.includes('class="plant-label"'));
  assert.ok(!markup.includes('×'));
  assert.ok(!markup.includes('role="tooltip"'));
  assert.equal(JSON.stringify(geometry),before);
});

test('Rendered name baselines are horizontal and upright at every tested bed angle',()=>{
  for(const angle of [0,17,90,180,270,320,345,359.9]) {
    const copy=structuredClone(project);
    copy.geometry.beds[0].rotation_deg=angle;
    const geometry=projectToMap(copy),bed=geometry.beds[0];
    const markup=renderPlot(geometry);
    const group=markup.match(new RegExp(`<g transform="([^"]+)" data-bed-id="${bed.id}"[\\s\\S]*?<text ([^>]+)class="bed-number"`));
    assert.ok(group,`Rendered bed name at ${angle} degrees`);
    const outer=Number(group[1].match(/rotate\(([-\d.]+)\)/)[1]);
    const rotation=group[2].match(/transform="rotate\(([-\d.]+) ([-\d.]+) ([-\d.]+)\)"/);
    assert.ok(rotation);
    const combined=(outer+Number(rotation[1]))*Math.PI/180;
    // Baseline points right and the top of the glyph points up; no reversal or reflection.
    assert.ok(Math.abs(Math.cos(combined)-1)<1e-12);
    assert.ok(Math.abs(Math.sin(combined))<1e-12);
    assert.equal(Number(rotation[2]),Number(group[2].match(/\bx="([^"]+)"/)[1]));
    assert.equal(Number(rotation[3]),Number(group[2].match(/\by="([^"]+)"/)[1]));
    assert.ok(group[1].includes(`translate(${bed.x} ${bed.y}) rotate(${bed.angle})`));
  }
});

test('Existing hover tooltip renders metric dimensions outside the rotated SVG',()=>{
  for(const angle of [17,90,180,320]) {
    const bed={...project.geometry.beds[0],rotation_deg:angle};
    const markup=renderToStaticMarkup(React.createElement(ProjectTooltip,{
      bed,hover:{id:bed.object_id,x:1275,y:715},viewport:{width:1280,height:720},
    }));
    assert.ok(markup.startsWith('<div'));
    assert.ok(markup.includes('role="tooltip"'));
    assert.ok(markup.includes('0,65 × 8 m'));
    assert.ok(!markup.includes('<svg')&&!markup.includes('<text')&&!markup.includes('transform'));
  }
});

test('Demo retains existing crop labels and bed geometry',()=>{
  const geometry=demoToMap(demo),markup=renderPlot(geometry,demo);
  assert.equal((markup.match(/class="plant-label"/g)||[]).length,geometry.beds.length);
  assert.ok(markup.includes('Kopfsalat'));
  for(const bed of geometry.beds) {
    assert.ok(markup.includes(`transform="translate(${bed.x} ${bed.y}) rotate(${bed.angle})"`));
  }
});
