import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {checkCultivations,relationDescription} from '../.test-build/cultivationChecks.mjs';
import {CultivationReview} from '../.test-build/CultivationReview.mjs';
import {ProjectDetails} from '../.test-build/ProjectDetails.mjs';

const fixture=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const id=n=>`12345678-1234-4234-8234-${String(n).padStart(12,'0')}`;
const bed=fixture.geometry.beds[0];
const a={cultivation_id:id(1),revision_id:id(11),bed_id:bed.object_id,profile_id:'radishes-spring',establishment:'direct',start_date:'2027-03-01',planned_harvest_date:'2027-04-30',input_status:'user_input'};
const b={...a,cultivation_id:id(2),profile_id:'lettuce-butterhead-transplant',establishment:'transplant',start_date:'2027-04-10',planned_harvest_date:'2027-05-10'};
const profiles=[{profile_id:a.profile_id,name:'Radieschen'},{profile_id:b.profile_id,name:'Kopfsalat'}];
const overlap={kind:'overlap',cultivation_ids:[a.cultivation_id,b.cultivation_id],start_date:'2027-04-10',end_date:'2027-04-30',complete:true};
const analysis={schema_version:1,relations:[overlap],incomplete_ids:[]};

test('Date check sends actual intentions only to the read-only Python endpoint',async()=>{
  const entries=[a,b],before=JSON.stringify(entries);
  const result=await checkCultivations(entries,undefined,async(path,options)=>{
    assert.equal(path,'/api/v1/cultivations/analyze');assert.equal(options.method,'POST');
    assert.deepEqual(JSON.parse(options.body),{entries});
    return Response.json({api_version:1,analysis});
  });
  assert.deepEqual(result,analysis);assert.equal(JSON.stringify(entries),before);
});
test('Sequential and incomplete results stay distinct rather than filling missing harvest dates',async()=>{
  for(const result of [{schema_version:1,relations:[],incomplete_ids:[]},
    {schema_version:1,relations:[{kind:'unknown',cultivation_ids:[a.cultivation_id,b.cultivation_id]}],incomplete_ids:[a.cultivation_id]}]) {
    const entries=[{...a,planned_harvest_date:null},b];
    assert.deepEqual(await checkCultivations(entries,undefined,async()=>Response.json({api_version:1,analysis:result})),result);
    assert.equal(entries[0].planned_harvest_date,null);
  }
});
test('Malformed references, dates and foreign-bed relations cannot be displayed as successful checks',async()=>{
  for(const bad of [{...analysis,schema_version:2},{...analysis,incomplete_ids:[id(99)]},
    {...analysis,relations:[{...overlap,cultivation_ids:[id(1),id(99)]}]},
    {...analysis,relations:[{...overlap,end_date:'2027-02-29'}]},
    {...analysis,relations:[{...overlap,complete:undefined}]}]) {
    await assert.rejects(checkCultivations([a,b],undefined,async()=>Response.json({api_version:1,analysis:bad})));
  }
  await assert.rejects(checkCultivations([a,{...b,bed_id:id(88)}],undefined,async()=>Response.json({api_version:1,analysis})));
});
test('API outage and cancellation do not invent a clean result or change input data',async()=>{
  await assert.rejects(checkCultivations([a,b],undefined,async()=>{throw new TypeError('offline');}),/Verbindung/);
  const controller=new AbortController();controller.abort();
  await assert.rejects(checkCultivations([a,b],controller.signal,async()=>{throw new TypeError('aborted');}),{name:'AbortError'});
});
test('Overlap explanations identify both crops and precise known dates without declaring clearance',()=>{
  const text=relationDescription(overlap,[a,b],profiles);
  assert.ok(text.includes('Radieschen (Aussaat 01.03.2027)'));
  assert.ok(text.includes('Kopfsalat (Pflanzung 10.04.2027)'));
  assert.ok(text.includes('10.04.2027 bis 30.04.2027'));
  const unknown=relationDescription({kind:'unknown',cultivation_ids:[a.cultivation_id,b.cultivation_id]},[a,b],profiles);
  assert.ok(unknown.includes('unklar')&&unknown.includes('geplante Ernte fehlt'));
  assert.ok(relationDescription({...overlap,start_date:'2027-04-10',end_date:'2027-04-10',complete:false},[a,b],profiles).includes('Weitere Dauer bleibt offen'));
});
test('Review is compact and expandable, explicitly permits mixed cultivation, and disappears without relations',()=>{
  const props={analysis,entries:[a,b],profiles,open:false,onToggle:()=>{}};
  const markup=renderToStaticMarkup(React.createElement(CultivationReview,props));
  assert.ok(markup.includes('1 Überschneidung')&&markup.includes('Mischkulturen bleiben möglich'));
  assert.ok(markup.includes('Geplante Ernte ist kein Räumdatum'));
  assert.ok(!markup.includes(' open=""'));
  const preview=renderToStaticMarkup(React.createElement(CultivationReview,{...props,open:true,preview:true}));
  assert.ok(preview.includes('Entwurf')&&preview.includes(' open=""'));
  assert.equal(renderToStaticMarkup(React.createElement(CultivationReview,{...props,analysis:{...analysis,relations:[]}})),'');
});
test('Plan modes preserve culture dates and expose editing only in culture planning',()=>{
  const p={...fixture,cultivation_plan:{schema_version:1,revision_id:id(22),entries:[a,b]}};
  const before=JSON.stringify(p);
  const props={project:p,selected:bed.object_id,onClose:()=>{},onSaved:()=>{},onCultivationBusy:()=>{}};
  const markup=renderToStaticMarkup(React.createElement(ProjectDetails,props));
  const cultures=renderToStaticMarkup(React.createElement(ProjectDetails,{...props,cultivationMode:true}));
  assert.ok(!markup.includes('Anbauvorgang bearbeiten')&&!markup.includes('Anbauvorgang entfernen'));
  assert.ok(cultures.includes('Anbauvorgang bearbeiten')&&cultures.includes('Anbauvorgang entfernen'));
  assert.ok(!cultures.includes('geometry-section')&&!cultures.includes('identity-section'));
  assert.ok(cultures.includes('01.03.2027')&&cultures.includes('30.04.2027'));
  assert.ok(markup.includes('cultivation-row-head')&&markup.includes('cultivation-dates'));
  for(const label of ['Direktsaat','Pflanzung','Ernte geplant','01.03.2027','30.04.2027','10.04.2027','10.05.2027'])assert.ok(markup.includes(label));
  assert.ok(markup.includes('<details class="geometry-section">')&&markup.includes('<details class="identity-section">'));
  assert.ok(markup.includes('title="radishes-spring"'));
  assert.equal(JSON.stringify(p),before);
});
