// DP-001 only: synthetic metres, independent of screen pixels and Planner data.
export const BEDS=Object.freeze(Array.from({length:5},(_,i)=>Object.freeze({id:`B-${String(i+1).padStart(2,'0')}`,x:i*2.1,y:0,width:1.2,length:6})));
export const FRAME_COUNTS=Object.freeze([8,12,20]);
export const CYCLE_MS=12000;
export function instances(count){
 if(![10,30,100].includes(count))throw new RangeError('DP-001 supports 10, 30 or 100 plants');
 return BEDS.flatMap((bed,b)=>Array.from({length:count/5},(_,i)=>({id:`${bed.id}-P${i+1}`,bed:bed.id,
  x:bed.x+.3+(i%2)*.6,y:.3+Math.floor(i/2)*5.4/(count/10===1?1:count/10-1),
  phase:((b*20+i)*.61803398875)%1}))).sort((a,b)=>(a.x+a.y)-(b.x+b.y));
}
export function frameAt(time,phase,count){return Math.floor((((time%CYCLE_MS)/CYCLE_MS+phase)%1+1)%1*count+1e-10)%count;}
// Smooth closed traversal of the existing aperiodic wind field. No reset jump.
export function bakeTime(index,count){return 12+10*Math.sin(2*Math.PI*index/count);}
