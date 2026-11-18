import {readTheme,setTheme} from './themes.js?v=theme04';
import {project} from './projection.js';
import {BEDS,instances,frameAt,FRAME_COUNTS} from './dp001-scene.js';
import {bakeSprites,SPRITE} from './dp001-sprites.js';
const $=id=>document.getElementById(id),canvas=$('garden'),ctx=canvas.getContext('2d'),ground=document.createElement('canvas'),g=ground.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let theme=setTheme(readTheme()),count=30,plants=instances(count),selected=BEDS[0].id,season=1,paused=reduced.matches,atlas=null,busy=false,benchmarking=false;
let width=0,height=0,dpr=1,scale=1,origin=[0,0],dirty=true,groundDirty=true,time=0,last=0,signature='',drawSerial=0,drawMs=0,results=[];
const samples=[],seasons=[['Frühjahr','Vorbereitet'],['Sommer','Beispielbestand'],['Herbst','Nach der Saison']];
const color=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const point=(x,y,z=0)=>{const p=project([x,y,z]);return [origin[0]+p[0]*scale,origin[1]+p[1]*scale];};
function path(c,points){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();}
function polygon(c,x,y,w,h){path(c,[[x,y],[x+w,y],[x+w,y+h],[x,y+h]].map(p=>point(...p)));}
function resize(){const r=canvas.getBoundingClientRect();width=Math.max(1,Math.round(r.width));height=Math.max(1,Math.round(r.height));dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ground.width=canvas.width;ground.height=canvas.height;scale=Math.min((width-28)/15.6,(height-65)/11.3);origin=[width/2-1.1*scale,height/2-2.7*scale];groundDirty=dirty=true;}
function drawGround(){
 g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,width,height);g.fillStyle=color('--bg');g.fillRect(0,0,width,height);
 g.strokeStyle=color('--line');g.lineWidth=.7;g.setLineDash([3,5]);polygon(g,-.6,-.65,10.2,7.3);g.stroke();g.setLineDash([]);
 for(const bed of BEDS){polygon(g,bed.x,bed.y,bed.width,bed.length);g.fillStyle=color(bed.id===selected?'--selected':'--bed');g.fill();g.strokeStyle=color(bed.id===selected?'--accent':'--line');g.lineWidth=bed.id===selected?1.2:.8;g.stroke();
  g.strokeStyle=color('--line');g.lineWidth=.5;for(const x of [.3,.9]){g.beginPath();g.moveTo(...point(bed.x+x,.15));g.lineTo(...point(bed.x+x,5.85));g.stroke();}
  const p=point(bed.x+.6,6.35);g.font='9px Consolas, monospace';g.textAlign='center';g.fillStyle=color(bed.id===selected?'--accent':'--muted');g.fillText(bed.id,...p);
 }
 // Ground ruler is a projected world-metre segment, not a UI zoom control.
 const a=[20,height-100],b=[20+Math.sqrt(3)*scale,height-100+scale];g.strokeStyle=color('--muted');g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();g.font='9px Consolas, monospace';g.textAlign='left';g.fillStyle=color('--muted');g.fillText('2 m · Beispielgeometrie',a[0],Math.max(a[1],b[1])+16);groundDirty=false;
}
function render(){
 const start=performance.now();if(groundDirty)drawGround();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(ground,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);
 if(season===1&&atlas){const ratio=scale/SPRITE.scale;ctx.imageSmoothingEnabled=true;
  for(const plant of plants){const p=point(plant.x,plant.y);ctx.drawImage(atlas.frames[frameAt(time,plant.phase,atlas.count)],p[0]-SPRITE.rootX*ratio,p[1]-SPRITE.rootY*ratio,SPRITE.width*ratio,SPRITE.height*ratio);}
 }
 drawMs=performance.now()-start;drawSerial++;dirty=false;return drawMs;
}
function update(){
 document.querySelectorAll('[data-count]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.count===count)));
 document.querySelectorAll('[data-bed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bed===selected)));
 document.querySelectorAll('[data-season]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.season===season)));
 $('bedTitle').textContent=`Beet ${selected}`;$('bedCount').textContent=season===1?String(count/5):'0 sichtbar';$('plantLabel').textContent=`${season===1?count:0} INSTANZEN`;
 $('seasonTitle').textContent=seasons[season][0];$('stateLabel').textContent=seasons[season][1];$('seasonCaption').textContent=seasons[season].join(' · ');
 $('pause').setAttribute('aria-pressed',String(paused));$('pause').textContent=paused?'Animation fortsetzen':'Animation pausieren';
 $('themeSwitch').setAttribute('aria-checked',String(theme==='light'));$('themeSwitch').title=theme==='light'?'Zu Dark Mode wechseln':'Zu Light Mode wechseln';
 dirty=groundDirty=true;
}
function setCount(value){count=value;plants=instances(count);update();}
function lock(value){document.querySelectorAll('button,select').forEach(b=>b.disabled=value);}
async function prepare(frameCount=20){
 busy=true;lock(true);$('loading').hidden=false;
 try{atlas=null; // Release the previous set; no per-instance or dual-theme image cache.
  atlas=await bakeSprites(frameCount,theme,(n,total)=>$('loading').textContent=`ASCII-Bilder vorbereiten · ${n} / ${total}`);
  $('frames').value=String(frameCount);$('metrics').textContent=`${frameCount} × 144 × 180 px · ${(atlas.rgbaBytes/1048576).toFixed(2)} MiB RGBA · Vorbereitung ${atlas.buildMs.toFixed(0)} ms. Zeichenzeit wird im Vergleich gemessen.`;
  $('loading').hidden=true;dirty=true;
 }catch(error){$('loading').textContent=`Vorbereitung fehlgeschlagen: ${error.message}. Bitte neu laden.`;throw error;}
 finally{busy=false;if(!benchmarking)lock(false);}
}
function tick(now){
 const delta=last?now-last:0;last=now;
 if(!document.hidden&&!busy){if(!paused)time+=delta;
  const next=atlas&&season===1?plants.map(p=>frameAt(time,p.phase,atlas.count)).join(','):String(season);
  let cost=null;if(dirty||next!==signature){signature=next;cost=render();}
  for(const collector of samples)collector({now,delta,cost});
 }requestAnimationFrame(tick);
}
function measure(duration){return new Promise((resolve,reject)=>{
 if(document.hidden){reject(new Error('Messung verworfen: Tab ist verborgen. Bitte erneut starten.'));return;}
 const intervals=[],costs=[];let start=null,previous=null,initialDraw=drawSerial;
 const cleanup=()=>{const i=samples.indexOf(collect);if(i>=0)samples.splice(i,1);document.removeEventListener('visibilitychange',visibility);};
 const visibility=()=>{if(document.hidden){cleanup();reject(new Error('Messung verworfen: Tab war verborgen. Bitte erneut starten.'));}};
 const collect=sample=>{if(start===null){start=sample.now;previous=sample.now;return;}intervals.push(sample.now-previous);previous=sample.now;if(sample.cost!==null)costs.push(sample.cost);
  if(sample.now-start>=duration){cleanup();const elapsed=sample.now-start,sorted=[...costs].sort((a,b)=>a-b);resolve({plants:count,frames:atlas.count,theme,durationMs:elapsed,rafFps:intervals.length*1000/elapsed,drawsPerSecond:(drawSerial-initialDraw)*1000/elapsed,drawMeanMs:costs.reduce((a,b)=>a+b,0)/(costs.length||1),drawP95Ms:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]??0,longIntervals:intervals.filter(x=>x>50).length,atlasRgbaBytes:atlas.rgbaBytes,canvasRgbaBytes:canvas.width*canvas.height*4*2,buildMs:atlas.buildMs,jsHeapBytes:performance.memory?.usedJSHeapSize??null});}
 };samples.push(collect);document.addEventListener('visibilitychange',visibility);
 });}
async function benchmark(duration=5000,frameCounts=FRAME_COUNTS){
 if(busy||benchmarking)throw new Error('Preparation or measurement already running');
 if(document.hidden)throw new Error('Keep this tab visible during measurement');
 benchmarking=true;const previous={count,season,paused,frames:atlas.count};lock(true);results=[];season=1;paused=false;update();
 try{for(const frames of frameCounts){await prepare(frames);for(const n of [10,30,100]){
   setCount(n);$('benchStatus').textContent=`Messung läuft · ${frames} Frames · ${n} Pflanzen. Tab sichtbar lassen.`;
   await new Promise(r=>setTimeout(r,400));const result=await measure(duration);results.push(result);
   $('benchResults').textContent=results.map(r=>`${r.frames}F / ${r.plants}P: ${r.rafFps.toFixed(1)} rAF/s\n  ${r.drawMeanMs.toFixed(3)} ms/Zeichnung`).join('\n');
  }}
  $('benchStatus').textContent='Vergleich abgeschlossen. rAF/s zählt Browser-Takte, keine GPU-Präsentationen.';$('download').hidden=false;return {environment:environment(),results:[...results]};
 }finally{count=previous.count;plants=instances(count);season=previous.season;paused=previous.paused;await prepare(previous.frames);benchmarking=false;lock(false);update();}
}
function environment(){return {userAgent:navigator.userAgent,viewport:[innerWidth,innerHeight],canvasCss:[width,height],canvasBacking:[canvas.width,canvas.height],devicePixelRatio,renderDpr:dpr,hardwareConcurrency:navigator.hardwareConcurrency,deviceMemoryGiB:navigator.deviceMemory??null,visibility:document.visibilityState,measuredAt:new Date().toISOString(),method:'rAF intervals; synchronous Canvas2D submission timing; excludes GPU presentation. One shared active-theme RGBA atlas; two garden canvases.'};}
$('beds').innerHTML=BEDS.map(b=>`<button data-bed="${b.id}" aria-pressed="${b.id===selected}">${b.id}<span>Tomate ↗</span></button>`).join('');
document.querySelectorAll('[data-bed]').forEach(b=>b.onclick=()=>{selected=b.dataset.bed;update();});
document.querySelectorAll('[data-count]').forEach(b=>b.onclick=()=>setCount(+b.dataset.count));
document.querySelectorAll('[data-season]').forEach(b=>b.onclick=()=>{season=+b.dataset.season;update();});
$('pause').onclick=()=>{paused=!paused;update();};
$('themeSwitch').onclick=async()=>{theme=setTheme(theme==='dark'?'light':'dark');update();await prepare(atlas?.count??20);};
$('frames').onchange=()=>prepare(+$('frames').value);
$('benchmark').onclick=()=>benchmark().catch(e=>$('benchStatus').textContent=e.message);
$('download').onclick=()=>{const blob=new Blob([JSON.stringify({environment:environment(),results},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='dp001-performance.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&benchmarking){$('benchStatus').textContent='Tab war verborgen: diesen Lauf als nicht vergleichbar verwerfen.';}});
reduced.addEventListener('change',e=>{if(e.matches&&!benchmarking){paused=true;update();}});
new ResizeObserver(resize).observe(canvas);
// Read-only diagnostics and repeatable benchmark entry for the local browser harness.
window.dp001={get state(){return {theme,count,season,paused,selected,busy,benchmarking,frames:atlas?.count,drawSerial,drawMs,time,atlasRgbaBytes:atlas?.rgbaBytes};},benchmark,environment};
update();resize();requestAnimationFrame(tick);prepare().catch(console.error);
