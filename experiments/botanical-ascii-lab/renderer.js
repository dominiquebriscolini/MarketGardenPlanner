import {VisibilityBuffer} from './visibility.js?v=single01';
import {PALETTES} from './themes.js?v=theme04';
// Theme changes ink only; glyphs, dot positions, illumination and occlusion agree.
export class PlantRenderer {
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.visibility=new VisibilityBuffer();}
 render(model,options){
  const {width,height,size,mode,grid}=options,start=performance.now(),c=this.ctx;
  const {brightness=1,contrast=1}=options;
  const inkTone=tone=>Math.max(0,Math.min(1,(tone-.5)*contrast+.5))*brightness;
  const theme=options.theme==='light'?'light':'dark',palette=PALETTES[theme];
  if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;}
  c.globalAlpha=1;c.fillStyle=palette.background;c.fillRect(0,0,width,height);
  const buffer=this.visibility.build(model,options),cellX=size*.62,cellY=size;
  c.font=`${theme==='light'?'600 ':''}${size}px Consolas, 'Courier New', monospace`;c.textAlign='center';c.textBaseline='middle';
  // Geometry-derived negative stippling on the ground, beneath every plant mark.
  // No ellipse and no independent animation: same deformed geometry and sun map.
  const light=buffer.lighting,scale=Math.min(height*.46,width*.58)*options.zoom;
  const origin=[width*.5+options.pan[0],height*.89+options.pan[1]];
  const groundStart=performance.now();let shadowCells=0;
  const shadowKey=[theme,light.revision,width,height,options.zoom,...options.pan,size,mode==='ascii'].join(':');
  this.shadowCanvas??=document.createElement('canvas');
  if(this.shadowKey!==shadowKey){
   const layer=this.shadowCanvas;layer.width=width;layer.height=height;
   const g=layer.getContext('2d');g.font=c.font;g.textAlign='center';g.textBaseline='middle';
  g.fillStyle=palette.shadow;
  for(let y=cellY/2;y<height;y+=cellY)for(let x=cellX/2;x<width;x+=cellX){
   const u=(x-origin[0])/scale,v=(y-origin[1])/scale,gx=v+u/Math.sqrt(3),gy=v-u/Math.sqrt(3);
   if(gx<light.minX||gy<light.minY||gx>light.minX+light.dx*light.resolution||gy>light.minY+light.dy*light.resolution)continue;
   const coverage=light.groundCoverage(gx,gy);if(coverage<.02)continue;
   g.globalAlpha=palette.shadowAlpha*coverage;
   if(mode==='ascii')g.fillText(coverage>.65?'#':coverage>.25?':':'.',x,y);
   else {g.beginPath();g.arc(x,y,cellX*.54*Math.sqrt(coverage),0,Math.PI*2);g.fill();}
   shadowCells++;
  }
   this.shadowKey=shadowKey;this.shadowCellCount=shadowCells;
  }else shadowCells=this.shadowCellCount;
  c.drawImage(this.shadowCanvas,0,0);
  c.globalAlpha=1;
  const groundMs=performance.now()-groundStart;
  let glyphs=0,dots=0;const dotGroups=new Map();
  const dot=(x,y,r,mat,tone)=>{const key=mat*100+Math.floor(tone*palette.bins);if(!dotGroups.has(key))dotGroups.set(key,[]);dotGroups.get(key).push([x,y,r]);dots++;};
  if(grid){c.strokeStyle=palette.grid;c.lineWidth=.5;c.beginPath();for(let x=0;x<width;x+=cellX){c.moveTo(x,0);c.lineTo(x,height);}for(let y=0;y<height;y+=cellY){c.moveTo(0,y);c.lineTo(width,y);}c.stroke();}
  for(let row=0,y=cellY/2;y<height;y+=cellY,row++)for(let col=0,x=cellX/2;x<width;x+=cellX,col++){
   const i=buffer.sample(col,row),mat=buffer.material[i],tone=buffer.tone[i]/255;if(!mat)continue;
   const adjusted=inkTone(tone);
   c.fillStyle=palette.ink(mat,adjusted);c.globalAlpha=Math.min(1,palette.opacity(adjusted));
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
  for(const [key,points]of dotGroups){const tone=inkTone((key%100+.5)/palette.bins);c.fillStyle=palette.ink(Math.floor(key/100),tone);c.globalAlpha=Math.min(1,palette.opacity(tone));c.beginPath();for(const [x,y,r]of points){c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2);}c.fill();}
  c.globalAlpha=1;
  return {glyphs,dots,shadowCells,groundMs,shadowMapMs:buffer.shadowMapMs,rasterMs:buffer.rasterMs,ms:performance.now()-start,columns:Math.floor(width/cellX),rows:Math.floor(height/cellY),forms:model.length};
 }
}
