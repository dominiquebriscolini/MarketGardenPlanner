import test from 'node:test';
import assert from 'node:assert/strict';
import {fittedView,cameraView,tooltipPosition,nextBedEvent,seasonStep} from '../.test-build/interactions.mjs';

test('Fit includes parcel without changing aspect or metric proportions',()=>{
  const boundary=[[0,0],[29,0],[29,15],[24,21],[6,21],[0,16]];
  for(const [w,h] of [[1440,900],[800,650],[390,844]]) {
    const fit=fittedView(boundary,w,h);
    assert.ok(Math.abs(fit.width/fit.height-w/h)<1e-10);
    for(const [x,y] of boundary) {
      assert.ok(x>=fit.x && x<=fit.x+fit.width && y>=fit.y && y<=fit.y+fit.height);
    }
    const v=cameraView(fit,2,{x:1,y:-2});
    assert.equal(v.width,fit.width/2);
    assert.equal(v.x+v.width/2,fit.x+fit.width/2+1);
  }
});

test('Tooltip flips and stays in viewport at all corners',()=>{
  const screen={width:390,height:700},size={width:256,height:194};
  for(const p of [{x:0,y:0},{x:389,y:699},{x:389,y:0},{x:0,y:699}]) {
    const point=tooltipPosition(p,size,screen);
    assert.ok(point.x>=10 && point.x+size.width<=380);
    assert.ok(point.y>=10 && point.y+size.height<=690);
  }
});

const fixture={names:{lettuce:'Kopfsalat'},schedule:{reservations:[
  {bed_id:'A',batch_id:'t:1',window:{start:'2026-05-01',end:'2026-06-09'}}
],batches:[{plan:{id:'t:1',profile_id:'lettuce',sowing_date:'2026-04-15',transplant_date:'2026-05-01',first_harvest:'2026-06-04',harvest_end:'2026-06-05'}}]}};

test('Next event uses scheduler dates, handles free beds and exclusive transitions',()=>{
  assert.equal(nextBedEvent(fixture,'A','2026-04-01').date,'2026-04-15');
  assert.equal(nextBedEvent(fixture,'A','2026-04-15').date,'2026-05-01');
  assert.equal(nextBedEvent(fixture,'A','2026-06-04').label,'Räumungsbeginn · Kopfsalat');
  assert.equal(nextBedEvent(fixture,'A','2026-06-05').date,'2026-06-09');
  assert.equal(nextBedEvent(fixture,'A','2026-06-09'),null);
  assert.equal(nextBedEvent(fixture,'unused','2026-04-01'),null);
});

test('Season navigation clamps both boundaries',()=>{
  assert.equal(seasonStep(0,-7,246),0);
  assert.equal(seasonStep(244,7,246),245);
  assert.equal(seasonStep(101,7,246),108);
});
