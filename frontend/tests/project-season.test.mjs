import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {decodeSeason,loadProjectSeason,weekCrops,readSeasonPreference,writeSeasonPreference} from '../.test-build/projectSeason.mjs';
import {projectToMap,demoToMap} from '../.test-build/projectView.mjs';
import {Plot} from '../.test-build/Plot.mjs';
import {ProjectTooltip} from '../.test-build/ProjectTooltip.mjs';
import {ProjectDetails} from '../.test-build/ProjectDetails.mjs';
import {ProjectSeasonBar} from '../.test-build/ProjectSeasonBar.mjs';
import {SeasonSlider} from '../.test-build/SeasonSlider.mjs';

const fixture=JSON.parse(readFileSync(new URL('../.test-build/season.json',import.meta.url),'utf8'));
const project=fixture.project,raw=fixture.seasons['2026'];
const data=decodeSeason(raw,project,2026),frame={season:data,week:data.weeks[19]};
const demo=JSON.parse(readFileSync(new URL('../.test-build/demo.json',import.meta.url),'utf8'));
function plot(props) {
  const previous=globalThis.window;
  try {globalThis.window={innerWidth:1280,innerHeight:720};return renderToStaticMarkup(React.createElement(Plot,{geometry:projectToMap(project),index:101,selected:null,onSelect:()=>{},...props}));}
  finally {if(previous===undefined)delete globalThis.window;else globalThis.window=previous;}
}

test('Weekly view decodes actual Python states for no crop, future, current, completed, mixed and open beds',()=>{
  assert.deepEqual(project.geometry.beds.map(b=>frame.week.beds[b.object_id].stage),['unplanned','future','planned','completed','overlap','uncertain']);
  assert.equal(data.weeks.length,53); // 2026 is an ISO 53-week year.
  assert.equal(frame.week.iso_year,2026);assert.equal(frame.week.iso_week,20);
  assert.equal(frame.week.start_date,'2026-05-11');assert.equal(frame.week.end_date,'2026-05-17');
});
test('Server-supplied 52/53 weeks and dates cross years without frontend calendar calculations',()=>{
  const a=decodeSeason(fixture.seasons['2020'],project,2020),b=decodeSeason(fixture.seasons['2021'],project,2021);
  assert.equal(a.weeks.length,53);assert.equal(b.weeks.length,52);
  assert.equal(a.weeks[52].end_date,'2021-01-03');assert.equal(b.weeks[0].start_date,'2021-01-04');
});
test('Different project, stale revision and stale geometry responses cannot colour the current map',()=>{
  for(const change of [{project_id:crypto.randomUUID()},{revision_id:crypto.randomUUID()},
    {cultivation_revision_id:crypto.randomUUID()},{geometry_token:'f'.repeat(64)}])assert.throws(()=>decodeSeason({api_version:1,season:{...raw.season,...change}},project,2026));
  assert.throws(()=>decodeSeason(raw,project,2021));
});
test('Missing beds, wrong culture references and incomplete week responses are rejected',()=>{
  for(const mutate of [s=>delete s.weeks[0].beds[project.geometry.beds[0].object_id],s=>s.weeks.pop(),
    s=>s.weeks[0].iso_week=53,s=>s.weeks[0].beds[project.geometry.beds[0].object_id].shown_ids=['missing'],
    s=>s.cultivations[0].start_date='2026-01-01']) {
    const broken=structuredClone(raw);mutate(broken.season);assert.throws(()=>decodeSeason(broken,project,2026));
  }
});
test('Read-only season client uses project and ISO-year path; errors never become empty/free states',async()=>{
  assert.deepEqual(await loadProjectSeason(project,2026,undefined,async(path,options)=>{
    assert.equal(path,`/api/v1/projects/${project.project_id}/season/2026`);assert.equal(options.method,undefined);
    return Response.json(raw);
  }),data);
  await assert.rejects(loadProjectSeason(project,2026,undefined,async()=>{throw new TypeError('offline');}),/Verbindung/);
  await assert.rejects(loadProjectSeason(project,2026,undefined,async()=>Response.json({error:{code:'revision_conflict'}},{status:409})),/geändert/);
});
test('Project preferences remain separate across projects and tolerate blocked/invalid storage',()=>{
  const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
  writeSeasonPreference(project.project_id,{year:2020,week:53},storage);
  writeSeasonPreference('other',{year:2021,week:1},storage);
  assert.deepEqual(readSeasonPreference(project.project_id,storage),{year:2020,week:53});
  assert.deepEqual(readSeasonPreference('other',storage),{year:2021,week:1});
  for(const value of ['bad','{}','{"year":2026,"week":54}']) {
    storage.setItem(`mgp.season.v1:${project.project_id}`,value);assert.equal(readSeasonPreference(project.project_id,storage),null);
  }
  assert.doesNotThrow(()=>writeSeasonPreference('x',{year:2026,week:1},{setItem:()=>{throw Error();}}));
  assert.equal(readSeasonPreference('x',{getItem:()=>{throw Error();}}),null);
});
test('Project map shows actual culture names, simultaneous hatching and explicit open status; geometry stays exact',()=>{
  const before=JSON.stringify(project),geometry=projectToMap(project),markup=plot({season:frame});
  for(const stage of ['unplanned','future','planned','completed','overlap','uncertain'])assert.ok(markup.includes(`bed-fill project-${stage}`));
  for(const name of ['Kopfsalat','Spinat','Radieschen','Karotten'])assert.ok(markup.includes(name));
  assert.ok(markup.includes('url(#week-overlap)')&&markup.includes('url(#week-open)'));
  for(const b of geometry.beds)assert.ok(markup.includes(`translate(${b.x} ${b.y}) rotate(${b.angle})`));
  plot({season:{season:data,week:data.weeks[40]}});
  assert.equal(JSON.stringify(project),before);
});
test('All concurrent cultures are accessible through tooltip and detail summary with their uncertainty',()=>{
  const b=project.geometry.beds[4],open=project.geometry.beds[5];
  assert.equal(weekCrops(frame,b.object_id).length,2);
  const tooltip=renderToStaticMarkup(React.createElement(ProjectTooltip,{bed:b,hover:{id:b.object_id,x:10,y:10},viewport:{width:1280,height:720},season:frame}));
  assert.ok(tooltip.includes('Spinat')&&tooltip.includes('Radieschen')&&tooltip.includes('Mischkultur'));
  const details=renderToStaticMarkup(React.createElement(ProjectDetails,{project,selected:open.object_id,onClose:()=>{},season:frame}));
  assert.ok(details.includes('Karotten (Ende offen)')&&details.includes('Fortdauer ist unklar'));
});
test('The demo ignores accidentally supplied project-season state and retains original daily crop labels',()=>{
  const base=plot({geometry:demoToMap(demo),data:demo});
  const mixed=plot({geometry:demoToMap(demo),data:demo,season:frame});
  assert.equal(mixed,base);assert.ok(base.includes('Kopfsalat'));assert.ok(!base.includes('project-overlap'));
});
test('Shared slider preserves demo day controls and project week range; ISO year and week are explicit',()=>{
  const controller={frame,choose:()=>{},step:()=>{},retry:()=>{},error:'',loading:false};
  const bar=renderToStaticMarkup(React.createElement(ProjectSeasonBar,{controller}));
  assert.ok(bar.includes('KW 20 / 2026')&&bar.includes('aria-label="ISO-Jahr"'));
  assert.ok(bar.includes('aria-label="Saisonwoche"')&&bar.includes('max="53"'));
  const slider=renderToStaticMarkup(React.createElement(SeasonSlider,{min:0,max:245,value:101,label:'Saisontag',valueText:'10.06.2026',onChange:()=>{}}));
  assert.ok(slider.includes('aria-label="Saisontag"')&&slider.includes('value="101"'));
});
test('Unavailable projection is visibly unknown instead of unoccupied, and a reload action remains available',()=>{
  const markup=plot({seasonMessage:'Wochenstatus nicht verfügbar'});
  assert.ok(markup.includes('project-unavailable')&&markup.includes('Wochenstatus nicht verfügbar'));
  const bar=renderToStaticMarkup(React.createElement(ProjectSeasonBar,{controller:{frame:undefined,error:'API offline',loading:false,retry:()=>{}}}));
  assert.ok(bar.includes('role="alert"')&&bar.includes('Wochenansicht erneut laden'));
});
