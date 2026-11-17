import {VisibilityBuffer} from './visibility.js?v=light03';
// Palette, glyph ramp and density mapping retained from Experiment 01.
const colors=['','#c5d2b2','#d7ddbd','#e59b82','#a8bd91','#e2cf8f'];
export class PlantRenderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.visibility=new VisibilityBuffer();}
 render(model,options){
  const {width,height,size,mode,grid}=options,start=performance.now(),c=this.ctx;
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  c.globalAlpha=1;c.fillStyle='#111714';c.fillRect(0,0,width,height);
  const buffer=this.visibility.build(model,options),cellX=size*.62,cellY=size;
  c.font=`${size}px Consolas, 'Courier New', monospace`;c.textAlign='center';c.textBaseline='middle';
  // Geometry-derived negative stippling on the ground, beneath every plant mark.
  // No ellipse and no independent animation: same deformed geometry and sun map.
  const light=buffer.lighting,scale=Math.min(height*.46,width*.58)*options.zoom;
  const origin=[width*.5+options.pan[0],height*.89+options.pan[1]];
  let shadowCells=0;
  c.fillStyle='#030806';
  for(let y=cellY/2;y<height;y+=cellY)for(let x=cellX/2;x<width;x+=cellX){
   const u=(x-origin[0])/scale,v=(y-origin[1])/scale,gx=v+u/Math.sqrt(3),gy=v-u/Math.sqrt(3);
   if(gx<light.minX||gy<light.minY||gx>light.minX+light.dx*light.resolution||gy>light.minY+light.dy*light.resolution)continue;
   const coverage=light.groundCoverage(gx,gy);if(coverage<.02)continue;
   c.globalAlpha=.85*coverage;
   if(mode==='ascii')c.fillText(coverage>.65?'#':coverage>.25?':':'.',x,y);
   else {c.beginPath();c.arc(x,y,cellX*.54*Math.sqrt(coverage),0,Math.PI*2);c.fill();}
   shadowCells++;
  }
  c.globalAlpha=1;
  let glyphs=0,dots=0;const dotGroups=new Map();
  const dot=(x,y,r,mat,tone)=>{const key=mat*10+Math.floor(tone*4);if(!dotGroups.has(key))dotGroups.set(key,[]);dotGroups.get(key).push([x,y,r]);dots++;};
  if(grid){c.strokeStyle='#25312a';c.lineWidth=.5;c.beginPath();for(let x=0;x<width;x+=cellX){c.moveTo(x,0);c.lineTo(x,height);}for(let y=0;y<height;y+=cellY){c.moveTo(0,y);c.lineTo(width,y);}c.stroke();}
  for(let row=0,y=cellY/2;y<height;y+=cellY,row++)for(let col=0,x=cellX/2;x<width;x+=cellX,col++){
   const i=buffer.sample(col,row),mat=buffer.material[i],tone=buffer.tone[i]/255;if(!mat)continue;
   c.fillStyle=colors[mat];c.globalAlpha=.18+tone*.82;
   if(mode==='ascii'||(mode==='hybrid'&&(mat===2||(row+col)%3===0))){
    const variation=(((row*17+col*13)%7)/7-.5)*.2;
    let glyph='.,:;+=*#@'[Math.max(0,Math.min(8,Math.floor((tone+variation)*9)))];
    if(mat===2)glyph=buffer.direction[i]<90?'|':buffer.direction[i]<150?'\\':'/';
    if(mat===5)glyph='*';c.fillText(glyph,x,y);glyphs++;
   }else{
    // Four subdots at high tones increase density as well as radius.
    const count=tone>.68?4:1,r=Math.min(cellX,cellY)*(.12+tone*.2)/(count===4?1.4:1);
    if(count===4)for(const [dx,dy]of[[-.23,-.22],[.23,-.22],[-.23,.22],[.23,.22]])dot(x+dx*cellX,y+dy*cellY,r,mat,tone);
    else dot(x,y,r,mat,tone);
   }
  }
  for(const [key,points]of dotGroups){c.fillStyle=colors[Math.floor(key/10)];c.globalAlpha=.18+((key%10+.5)/4)*.82;c.beginPath();for(const [x,y,r]of points){c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2);}c.fill();}
  c.globalAlpha=1;
  return {glyphs,dots,shadowCells,ms:performance.now()-start,columns:Math.floor(width/cellX),rows:Math.floor(height/cellY),forms:model.length};
 }
}
