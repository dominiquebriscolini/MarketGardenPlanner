import test from 'node:test';
import assert from 'node:assert/strict';
import {BEDS,instances,frameAt,bakeTime,FRAME_COUNTS,CYCLE_MS} from './dp001-scene.js';
test('all scenarios: unique roots inside beds, metre geometry independent of density',()=>{
 for(const n of [10,30,100]){const plants=instances(n);assert.equal(plants.length,n);assert.equal(new Set(plants.map(p=>p.id)).size,n);
  for(const bed of BEDS){const own=plants.filter(p=>p.bed===bed.id);assert.equal(own.length,n/5);for(const p of own){assert.ok(p.x>bed.x&&p.x<bed.x+bed.width);assert.ok(p.y>0&&p.y<bed.length);}}
  assert.equal(new Set(plants.map(p=>p.phase)).size,n);for(let i=1;i<n;i++)assert.ok(plants[i-1].x+plants[i-1].y<=plants[i].x+plants[i].y);
 }assert.throws(()=>instances(20),RangeError);
});
test('shared frame indices are bounded, offset and exactly periodic',()=>{
 for(const n of FRAME_COUNTS){for(const p of instances(100))for(const t of [0,1234,11000,50000]){const f=frameAt(t,p.phase,n);assert.ok(f>=0&&f<n);assert.equal(frameAt(t+CYCLE_MS,p.phase,n),f);}
 assert.ok(new Set(instances(30).map(p=>frameAt(0,p.phase,n))).size>1);}
});
test('bake traversal closes without a wind-field reset',()=>{
 for(const n of FRAME_COUNTS){assert.ok(Math.abs(bakeTime(0,n)-bakeTime(n,n))<1e-10);for(let i=0;i<n;i++)assert.ok(bakeTime(i,n)>=2&&bakeTime(i,n)<=22);}
});
