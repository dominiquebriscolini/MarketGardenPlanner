import {createTomato} from './model.js?v=light03';
import {PlantRenderer} from './renderer.js?v=theme04';
import {readTheme,setTheme} from './themes.js?v=theme04';
const canvas=document.querySelector('canvas'),renderer=new PlantRenderer(canvas),model=createTomato();
const state={mode:'hybrid',size:5,wind:.55,zoom:1,pan:[0,0],grid:false,time:0,theme:readTheme()};
const cleanURL=new URL(location.href);if(cleanURL.searchParams.has('view')){cleanURL.searchParams.delete('view');history.replaceState(null,'',cleanURL);}
const $=id=>document.getElementById(id);
const themeSwitch=$('themeSwitch');
function applyTheme(theme){
 state.theme=setTheme(theme);themeSwitch.setAttribute('aria-checked',String(state.theme==='light'));
 themeSwitch.title=state.theme==='dark'?'Zu Light Mode wechseln':'Zu Dark Mode wechseln';
}
applyTheme(state.theme);
themeSwitch.onclick=()=>applyTheme(state.theme==='dark'?'light':'dark');
const descriptions={ascii:'Echte Schriftzeichen. Eine Glyphe je belegter Rasterzelle.',halftone:'Variable Punktgröße und Punktdichte modellieren die Flächen.',hybrid:'Schriftzeichen für die Struktur. Punkte für die Blattflächen.'};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('modeLabel').textContent=state.mode.toUpperCase();$('modeDescription').textContent=descriptions[state.mode];});
for(const id of ['size','wind'])$(id).oninput=e=>{state[id]=+e.target.value/(id==='wind'?100:1);$(id+'Out').textContent=e.target.value+(id==='wind'?' %':' px');};
$('grid').onchange=e=>state.grid=e.target.checked;
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;$('pause').checked=paused;$('pause').onchange=e=>paused=e.target.checked;
const zoom=(v,x=canvas.clientWidth/2,y=canvas.clientHeight/2)=>{const old=state.zoom;state.zoom=Math.max(.45,Math.min(3,v));const ratio=state.zoom/old;state.pan=[x-canvas.clientWidth*.5-(x-canvas.clientWidth*.5-state.pan[0])*ratio,y-canvas.clientHeight*.89-(y-canvas.clientHeight*.89-state.pan[1])*ratio];$('zoomOut').textContent=Math.round(state.zoom*100)+' %';};
$('plus').onclick=()=>zoom(state.zoom*1.15);$('minus').onclick=()=>zoom(state.zoom/1.15);
$('reset').onclick=()=>{state.zoom=1;state.pan=[0,0];$('zoomOut').textContent='100 %';};
canvas.onwheel=e=>{e.preventDefault();const r=canvas.getBoundingClientRect();zoom(state.zoom*Math.exp(-e.deltaY*.001),e.clientX-r.left,e.clientY-r.top);};
let drag=null;canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);drag=[e.clientX,e.clientY,...state.pan];};canvas.onpointermove=e=>{if(drag)state.pan=[drag[2]+e.clientX-drag[0],drag[3]+e.clientY-drag[1]];};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','0'].includes(e.key)){e.preventDefault();if(e.key==='+')zoom(state.zoom*1.15);else if(e.key==='-')zoom(state.zoom/1.15);else if(e.key==='0')$('reset').click();else {state.pan[0]+=e.key==='ArrowLeft'?-20:e.key==='ArrowRight'?20:0;state.pan[1]+=e.key==='ArrowUp'?-20:e.key==='ArrowDown'?20:0;}}};
let last=performance.now(),lastStats=0,lastSignature='',lastMode='';
function frame(now){
 const dt=Math.min(.1,(now-last)/1000);last=now;
 if(!document.hidden){
  if(!paused&&state.wind>0)state.time+=dt;
  const options={...state,width:Math.round(canvas.clientWidth),height:Math.round(canvas.clientHeight)},signature=JSON.stringify(options);
  if(signature!==lastSignature){
   const stats=renderer.render(model,options);window.labStats={...stats,time:state.time,mode:state.mode};
   if(now-lastStats>750||paused||state.wind===0||state.mode!==lastMode){$('stats').textContent=`${stats.columns} × ${stats.rows} · ${stats.glyphs} ZEICHEN · ${stats.dots} PUNKTE · ${stats.ms.toFixed(1)} ms`;lastStats=now;}
   lastMode=state.mode;lastSignature=signature;
  }
 }
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
