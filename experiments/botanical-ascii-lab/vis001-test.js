// Browser integration against the actual app, through its real controls.
import {SUN} from './lighting.js?v=light03';
const frame=document.getElementById('app'),output=document.getElementById('results'),lines=[];
const show=()=>output.textContent=lines.join('\n');
const assert=(name,pass)=>{lines.push(`${pass?'PASS':'FAIL'} ${name}`);show();if(!pass)throw Error(name);};
const waitFor=async predicate=>{const limit=performance.now()+60000;while(performance.now()<limit){if(predicate())return;await new Promise(r=>setTimeout(r,30));}throw Error('Timed out waiting for app render');};
let originalTheme;
try{
 const loaded=new Promise(resolve=>frame.onload=resolve);frame.src='./';await loaded;
 const win=frame.contentWindow,doc=frame.contentDocument;
 const pause=doc.getElementById('pause');pause.checked=true;pause.dispatchEvent(new Event('change'));
 await waitFor(()=>win.labStats?.state.paused);
 originalTheme=win.labStats.state.theme;
 const state=()=>JSON.parse(JSON.stringify(win.labStats.state));
 const waitChanged=async serial=>waitFor(()=>win.labStats.renderSerial>serial);
 const setTheme=async theme=>{if(win.labStats.state.theme===theme)return;const serial=win.labStats.renderSerial;doc.getElementById('themeSwitch').click();await waitChanged(serial);};
 const select=async key=>{if(win.labStats.variant===key)return;const serial=win.labStats.renderSerial;doc.querySelector(`[data-variant="${key}"]`).click();await waitFor(()=>win.labStats.variant===key&&win.labStats.renderSerial>serial);};
 const comparable=s=>{const result={...s};delete result.variant;return JSON.stringify(result);};
 const sun=JSON.stringify(SUN),initial=JSON.stringify(win.labStats.initialView);
 lines.push('INFO initial view '+initial);show();
 for(const theme of ['dark','light']){
  await setTheme(theme);const baseline=comparable(state());let firstPixels;
  for(const variant of ['A','B','C','A']){
   await select(variant);const stats=win.labStats;
   assert(`${theme} ${variant}: all view/render/wind/time/pause state unchanged`,comparable(state())===baseline);
   assert(`${theme} ${variant}: correct plant and primitive counts`,stats.plants===({A:10,B:20,C:30}[variant])&&stats.forms===stats.plants*1467+1);
   assert(`${theme} ${variant}: same initial camera and sun settings`,JSON.stringify(stats.initialView)===initial&&JSON.stringify(SUN)===sun);
   const canvas=doc.querySelector('canvas');
   if(variant==='A'&&!firstPixels)firstPixels=canvas.toDataURL();else if(variant==='A')assert(`${theme}: A image restored after A B C A`,canvas.toDataURL()===firstPixels);
   if(variant!=='A'||!document.getElementById(`export-${theme}-${variant}`)){
    const a=document.createElement('a');a.id=`export-${theme}-${variant}`;a.textContent=`${theme} ${variant}`;a.href=canvas.toDataURL();a.download=`vis001-${theme}-${variant}.png`;document.getElementById('exports').append(a);
   }
   lines.push(`INFO ${theme} ${variant}: render=${stats.ms.toFixed(1)}ms, glyphs=${stats.glyphs}, dots=${stats.dots}, shadows=${stats.shadowCells}`);show();
  }
 }
 // Non-default manual camera and wind settings must also survive a paused switch.
 const wind=doc.getElementById('wind');wind.value='37';let serial=win.labStats.renderSerial;wind.dispatchEvent(new Event('input'));await waitChanged(serial);
 serial=win.labStats.renderSerial;doc.getElementById('plus').click();await waitChanged(serial);
 serial=win.labStats.renderSerial;doc.querySelector('canvas').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await waitChanged(serial);
 const changed=comparable(state());for(const key of ['B','C','A']){await select(key);assert(`Manual zoom/pan and nondefault wind preserved at ${key}`,comparable(state())===changed);}
 wind.value='0';serial=win.labStats.renderSerial;wind.dispatchEvent(new Event('input'));await waitChanged(serial);
 const still=comparable(state());for(const key of ['B','C','A']){await select(key);assert(`Zero-wind paused scene immediately updates at ${key}`,comparable(state())===still);}
 // Exercise preservation at a nonzero animation time and a nondefault output mode.
 wind.value='55';serial=win.labStats.renderSerial;wind.dispatchEvent(new Event('input'));await waitChanged(serial);
 pause.checked=false;pause.dispatchEvent(new Event('change'));
 await waitFor(()=>win.labStats.time>0.25);
 pause.checked=true;pause.dispatchEvent(new Event('change'));
 serial=win.labStats.renderSerial;doc.querySelector('[data-mode="ascii"]').click();await waitChanged(serial);
 const animated=comparable(state());
 assert('Nonzero animation time established before paused switches',state().time>0.25&&state().paused&&state().mode==='ascii');
 for(const key of ['B','C','A']){await select(key);assert(`Nonzero clock and ASCII mode preserved at ${key}`,comparable(state())===animated);}
 await setTheme(originalTheme);
 lines.push(`COMPLETE ${lines.filter(s=>s.startsWith('PASS')).length} checks`);show();
}catch(e){lines.push('ERROR '+e.stack);show();}
