import {createTomato} from './model.js';
import {VisibilityBuffer} from './visibility.js?v=light03';
import {PALETTES} from './themes.js?v=theme04';
import {bakeTime} from './dp001-scene.js';
export const SPRITE={width:144,height:180,scale:82.8,rootX:72,rootY:160.2};
// One model and one temporary depth/light buffer, never per garden instance.
export async function bakeSprites(count,theme,onProgress=()=>{}){
 const started=performance.now(),model=createTomato(),buffer=new VisibilityBuffer(),frames=[],palette=PALETTES[theme];
 const {width,height}=SPRITE,size=3,cellX=size*.62;
 await document.fonts.ready;
 for(let f=0;f<count;f++){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const c=canvas.getContext('2d');
  buffer.build(model,{width,height,zoom:1,pan:[0,0],size,wind:.42,time:bakeTime(f,count)});
  c.font=`${theme==='light'?'600 ':''}${size}px Consolas, 'Courier New', monospace`;c.textAlign='center';c.textBaseline='middle';
  for(let row=0,y=size/2;y<height;y+=size,row++)for(let col=0,x=cellX/2;x<width;x+=cellX,col++){
   const i=buffer.sample(col,row),mat=buffer.material[i];if(!mat)continue;
   const tone=buffer.tone[i]/255,variation=(((row*17+col*13)%7)/7-.5)*.2;
   let glyph='.,:;+=*#@'[Math.max(0,Math.min(8,Math.floor((tone+variation)*9)))];
   if(mat===2)glyph=buffer.direction[i]<90?'|':buffer.direction[i]<150?'\\':'/';
   if(mat===5)glyph='*';c.fillStyle=palette.ink(mat,tone);c.globalAlpha=palette.opacity(tone);c.fillText(glyph,x,y);
  }
  frames.push(canvas);onProgress(f+1,count);
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 return {frames,count,theme,buildMs:performance.now()-started,rgbaBytes:count*width*height*4};
}
