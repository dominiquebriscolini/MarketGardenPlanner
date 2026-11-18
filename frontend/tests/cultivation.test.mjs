import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {decodeProject} from '../.test-build/projectView.mjs';
import {decodeCultivationPlan,validateCultivation,validCalendarDate} from '../.test-build/cultivationModel.mjs';
import {commitCultivation,loadCultures} from '../.test-build/cultivationClient.mjs';
import {CultivationPanel,CultivationFormTitle} from '../.test-build/CultivationPanel.mjs';

const fixture=JSON.parse(readFileSync(new URL('../.test-build/project.json',import.meta.url),'utf8')).project;
const uuid=n=>`12345678-1234-4234-8234-${String(n).padStart(12,'0')}`;
const empty={schema_version:1,revision_id:uuid(1),entries:[]};
const p={...fixture,cultivation_plan:empty};
const bedId=p.geometry.beds[0].object_id;
const direct={profile_id:'radishes-spring',establishment:'direct',start_date:'2027-03-15',planned_harvest_date:'2027-04-30'};
const second={...direct,profile_id:'lettuce-butterhead-transplant',establishment:'transplant',start_date:'2027-05-10',planned_harvest_date:null};
const entry=(n,values=direct)=>({...values,cultivation_id:uuid(n),revision_id:uuid(n+100),bed_id:bedId,input_status:'user_input'});
const withEntries=(entries)=>({...p,revision_id:uuid(9),cultivation_plan:{...empty,revision_id:uuid(2),entries}});

test('Calendar inputs reject invalid days and times, preserve leap-day and explicit planned harvest',()=>{
  for(const value of ['2027-02-29','2028-02-30','2027-3-15','20270315','2027-03-15T00:00:00Z','0000-01-01',null])assert.equal(validCalendarDate(value),false);
  assert.equal(validCalendarDate('2028-02-29'),true);
  assert.equal(validateCultivation(direct),'');assert.equal(validateCultivation(second),'');
  assert.ok(validateCultivation({...direct,planned_harvest_date:'2027-03-14'}));
});
test('Project decoder preserves stable cultivation IDs and rejects missing beds or provenance drift',()=>{
  const saved=withEntries([entry(3),entry(4,second)]);
  assert.deepEqual(decodeProject({api_version:1,project:saved},p.project_id),saved);
  for(const change of [{bed_id:uuid(999)},{input_status:'synthetic'},{start_date:'2027-02-29'},{planned_harvest_date:undefined}])assert.throws(()=>decodeCultivationPlan({...empty,entries:[{...entry(3),...change}]},[bedId]));
  assert.throws(()=>decodeCultivationPlan({...empty,entries:[entry(3),entry(3)]},[bedId]));
});
test('Python catalogue identity/method contract contains no independently generated profiles',async()=>{
  const profile={profile_id:'radishes-spring',species_id:'radishes',name:'Radieschen',variety_id:null,variety_name:null,establishment:'direct'};
  const profiles=await loadCultures(undefined,async path=>{assert.equal(path,'/api/v1/cultures');return Response.json({api_version:1,source:'data/cultures.json',profiles:[profile]});});
  assert.deepEqual(profiles,[profile]);
  await assert.rejects(loadCultures(undefined,async()=>Response.json({api_version:1,source:'demo',profiles:[profile]})),/kompatibel/);
});
test('Adding an intention writes expected project revision and replaces only a confirmed response',async()=>{
  const before=JSON.stringify(p),saved=withEntries([entry(3)]);
  const result=await commitCultivation(p,bedId,'add',direct,null,uuid(77),async(path,options)=>{
    assert.equal(path,`/api/v1/projects/${p.project_id}/beds/${bedId}/cultivations`);
    assert.equal(options.method,'POST');
    assert.deepEqual(JSON.parse(options.body),{expected_revision:p.revision_id,command_id:uuid(77),cultivation:direct});
    return Response.json({api_version:1,project:saved});
  });
  assert.deepEqual(result,saved);assert.equal(JSON.stringify(p),before);
});
test('Editing and removing retain neighbors and use the persistent intention identity',async()=>{
  const first=withEntries([entry(3),entry(4,second)]);
  const values={...direct,start_date:'2027-03-17'};
  const edited={...first,cultivation_plan:{...empty,entries:[{...entry(3),...values},entry(4,second)]}};
  assert.deepEqual(await commitCultivation(first,bedId,'update',values,uuid(3),uuid(78),async(path,options)=>{
    assert.ok(path.endsWith(`/cultivations/${uuid(3)}`));assert.equal(options.method,'PUT');return Response.json({api_version:1,project:edited});
  }),edited);
  const removed={...edited,cultivation_plan:{...empty,entries:[entry(4,second)]}};
  assert.deepEqual(await commitCultivation(edited,bedId,'delete',null,uuid(3),uuid(79),async(path,options)=>{
    assert.equal(options.method,'DELETE');assert.ok(!('cultivation' in JSON.parse(options.body)));return Response.json({api_version:1,project:removed});
  }),removed);
});
test('Conflict, deleted bed and API outage never become successful saved changes',async()=>{
  const before=JSON.stringify(p);
  for(const status of [409,404,422])await assert.rejects(commitCultivation(p,bedId,'add',direct,null,uuid(80),async()=>Response.json({error:{code:'revision_conflict'}},{status})));
  await assert.rejects(commitCultivation(p,bedId,'add',direct,null,uuid(81),async()=>{throw new TypeError('offline');}),/Verbindung/);
  assert.equal(JSON.stringify(p),before);
});
test('Partial confirmation, geometry changes and changed unrelated intentions are rejected',async()=>{
  const before=withEntries([entry(4,second)]);
  const valid={...before,cultivation_plan:{...empty,entries:[entry(4,second),entry(3)]}};
  for(const response of [before,{...valid,geometry_token:'f'.repeat(64)},
    {...valid,geometry:{...valid.geometry,beds:valid.geometry.beds.map((b,i)=>i?b:{...b,width_m:b.width_m+.01})}},
    {...valid,cultivation_plan:{...empty,entries:[{...entry(4,second),start_date:'2027-05-12'},entry(3)]}}]) {
    await assert.rejects(commitCultivation(before,bedId,'add',direct,null,uuid(82),async()=>Response.json({api_version:1,project:response})));
  }
});
test('Saved culture list is chronological, clearly user-planned, and available on geometrically locked beds',()=>{
  const saved=withEntries([entry(4,second),entry(3)]);
  const props={project:saved,bedId,disabled:false,busy:false,onBusy:()=>{},onSaved:()=>{}};
  const markup=renderToStaticMarkup(React.createElement(CultivationPanel,props));
  assert.ok(markup.indexOf('radishes-spring')<markup.indexOf('lettuce-butterhead-transplant'));
  assert.ok(markup.includes('Nutzereingaben · keine Ertragsprognose'));
  assert.ok(markup.includes('Ernte noch nicht geplant'));
  assert.ok(!markup.includes('kg')&&!markup.includes('Pflanzenzahl'));
  assert.ok(markup.includes('Entfernen')&&markup.includes('Bearbeiten'));
  const locked={...saved,geometry:{...saved.geometry,beds:saved.geometry.beds.map(b=>({...b,geometry_locked:true}))}};
  assert.equal(renderToStaticMarkup(React.createElement(CultivationPanel,{...props,project:locked})),markup);
});
test('Absent planning API is explained and never silently replaced with demo data',()=>{
  const old={...p};delete old.cultivation_plan;
  const markup=renderToStaticMarkup(React.createElement(CultivationPanel,{project:old,bedId,disabled:false,busy:false,onBusy:()=>{},onSaved:()=>{}}));
  assert.ok(markup.includes('Python-Server neu starten'));
  assert.ok(!markup.includes('Kultur hinzufügen'));
});

const titleProfiles=[{profile_id:'carrots-early-lwg',name:'Karotten',variety_name:null},
  {profile_id:'spinach-spring-direct',name:'Spinat',variety_name:null},
  {profile_id:'lettuce-butterhead-transplant',name:'Kopfsalat',variety_name:null}];
const titleMarkup=entry=>renderToStaticMarkup(React.createElement(CultivationFormTitle,{entry,profiles:titleProfiles}));

test('Editing heading names the actual carrot or spinach intention and its recorded start',()=>{
  const carrots=entry(101,{...direct,profile_id:'carrots-early-lwg',start_date:'2026-11-04'});
  const spinach=entry(102,{...direct,profile_id:'spinach-spring-direct',start_date:'2026-12-16'});
  const before=JSON.stringify([carrots,spinach]);
  assert.match(titleMarkup(carrots),/Karotten bearbeiten/);
  assert.match(titleMarkup(carrots),/Direktsaat · <time dateTime="2026-11-04">04\.11\.2026<\/time>/);
  assert.match(titleMarkup(spinach),/Spinat bearbeiten/);
  assert.match(titleMarkup(spinach),/16\.12\.2026/);
  assert.equal(JSON.stringify([carrots,spinach]),before);
});

test('Two intentions of the same culture keep their own recorded start date',()=>{
  const first=entry(103,{...direct,profile_id:'carrots-early-lwg',start_date:'2026-11-04'});
  const later=entry(104,{...direct,profile_id:'carrots-early-lwg',start_date:'2026-11-18'});
  assert.notEqual(first.cultivation_id,later.cultivation_id);
  assert.match(titleMarkup(first),/04\.11\.2026/);
  assert.match(titleMarkup(later),/18\.11\.2026/);
  assert.ok(!titleMarkup(later).includes('04.11.2026'));
});

test('Planting headings retain the planting method and missing catalogue profiles remain identifiable',()=>{
  const transplant=entry(105,second);
  assert.match(titleMarkup(transplant),/Kopfsalat bearbeiten/);
  assert.match(titleMarkup(transplant),/Pflanzung ·/);
  assert.match(titleMarkup(transplant),/10\.05\.2027/);
  assert.ok(titleMarkup({...transplant,profile_id:'retired-profile'}).includes('retired-profile'));
});

test('New intention heading says Kultur hinzufügen without borrowing an existing culture or date',()=>{
  const markup=titleMarkup(undefined);
  assert.ok(markup.includes('Kultur hinzufügen'));
  assert.ok(!markup.includes('bearbeiten')&&!markup.includes('<small>')&&!markup.includes('<time'));
});
