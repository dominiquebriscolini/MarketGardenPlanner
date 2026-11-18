import {useEffect,useRef} from 'react';
import {grainradPlantAtlas,grainradPlantForProfile} from './grainradPlants';
import type {GrowthPhase} from './projectSeason';
import type {Point,View} from './interactions';

type Sprite = NonNullable<ReturnType<typeof grainradPlantForProfile>>;
export type PlantingSpriteGrid = {
  columns:number;positions:number;asset:Sprite;phase:GrowthPhase;origin:Point;across:Point;along:Point;
};

function visiblePlants(grids:PlantingSpriteGrid[],view:View,unitsPerPixel:number) {
  const plants:{x:number;y:number;asset:Sprite;scale:number;phaseOffset:number}[]=[];
  const spriteWidth=Math.max(38*unitsPerPixel,1.2);
  for(const {columns,positions,asset,phase,origin,across,along} of grids) {
    const scale=spriteWidth*asset.sprite.previewScale*grainradPlantAtlas.growthScale[phase]/460;
    // A plant can still be visible when its foot is outside the viewport.
    const [footX,footY]=asset.sprite.foot;
    const margin=scale*Math.max(footX,footY,...asset.sprite.frames.map(
      frame=>Math.max(frame.w-footX,frame.h-footY)));
    const determinant=across.x*along.y-across.y*along.x;
    if(!determinant)continue;
    const limits = [
      [view.x-margin,view.y-margin],[view.x+view.width+margin,view.y-margin],
      [view.x-margin,view.y+view.height+margin],[view.x+view.width+margin,view.y+view.height+margin],
    ].map(([x,y])=>{
      const dx=x-origin.x,dy=y-origin.y;
      return [(dx*along.y-dy*along.x)/determinant,(dy*across.x-dx*across.y)/determinant];
    });
    const range=(axis:number,count:number,step:Point)=>{
      const values=limits.map(p=>p[axis]);
      const first=Math.max(0,Math.floor(Math.min(...values)));
      const last=Math.min(count-1,Math.ceil(Math.max(...values)));
      const stride=Math.max(1,Math.ceil(3*unitsPerPixel/Math.hypot(step.x,step.y)));
      return {first:Math.ceil(first/stride)*stride,last,stride};
    };
    const rows=range(0,columns,across),slots=range(1,positions,along);
    for(let r=rows.first;r<=rows.last;r+=rows.stride) {
      for(let c=slots.first;c<=slots.last;c+=slots.stride) {
        const x=origin.x+across.x*r+along.x*c,y=origin.y+across.y*r+along.y*c;
        if(x<view.x-margin||x>view.x+view.width+margin||y<view.y-margin||y>view.y+view.height+margin)continue;
        plants.push({x,y,asset,scale,phaseOffset:(r*3+c)%10*480});
      }
    }
  }
  return plants.sort((a,b)=>a.y-b.y);
}

const textures=new Map<boolean,Promise<HTMLCanvasElement>>();
function atlasTexture(dark:boolean) {
  const cached=textures.get(dark);
  if(cached)return cached;
  const texture=new Promise<HTMLCanvasElement>((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>{
      const canvas=document.createElement('canvas');
      canvas.width=grainradPlantAtlas.width;canvas.height=grainradPlantAtlas.height;
      const ctx=canvas.getContext('2d');
      if(!ctx){reject(Error('Pflanzenatlas konnte nicht vorbereitet werden.'));return;}
      const style=dark?grainradPlantAtlas.presentation.dark:grainradPlantAtlas.presentation.light;
      ctx.filter=style.spriteFilter;
      for(let i=0;i<=style.spritePasses;i++)ctx.drawImage(image,0,0);
      resolve(canvas);
    };
    image.onerror=()=>reject(Error('Pflanzenatlas konnte nicht geladen werden.'));
    image.src=grainradPlantAtlas.url;
  }).catch(error=>{textures.delete(dark);throw error;});
  textures.set(dark,texture);
  return texture;
}

export function GrainradPlantLayer({grids,view,unitsPerPixel,dark}:{grids:PlantingSpriteGrid[];view:View;unitsPerPixel:number;dark:boolean}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const [width,height]=[view.width/unitsPerPixel,view.height/unitsPerPixel];
  useEffect(()=>{
    const node=canvas.current;
    const ctx=node?.getContext('2d');
    if(!node||!ctx)return;
    const plants=visiblePlants(grids,view,unitsPerPixel);
    const pixelRatio=Math.min(window.devicePixelRatio||1,2);
    node.width=Math.ceil(width*pixelRatio);node.height=Math.ceil(height*pixelRatio);
    if(!plants.length)return;
    let texture:HTMLCanvasElement|undefined;
    let cancelled=false;
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer:ReturnType<typeof setInterval>|undefined;
    const paint=()=>{
      if(!texture||document.hidden)return;
      ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
      ctx.clearRect(0,0,width,height);
      const elapsed=performance.now();
      for(const {x,y,asset,scale,phaseOffset} of plants) {
        const frames=asset.sprite.frames;
        const pose=motion.matches?'center':grainradPlantAtlas.sequence[
          Math.floor((elapsed+phaseOffset)/grainradPlantAtlas.poseMs)%grainradPlantAtlas.sequence.length];
        const frame=frames.find(candidate=>candidate.name===pose)??frames[1];
        const size=scale/unitsPerPixel;
        const [footX,footY]=asset.sprite.foot;
        ctx.drawImage(texture,frame.x,frame.y,frame.w,frame.h,
          (x-view.x)/unitsPerPixel-footX*size,(y-view.y)/unitsPerPixel-footY*size,frame.w*size,frame.h*size);
      }
    };
    const updateAnimation=()=>{
      clearInterval(timer);
      if(!texture||document.hidden)return;
      paint();
      if(!motion.matches)timer=setInterval(paint,240);
    };
    void atlasTexture(dark).then(loaded=>{
      if(cancelled)return;
      texture=loaded;
      updateAnimation();
    }).catch(error=>{if(!cancelled)console.error(error);});
    motion.addEventListener('change',updateAnimation);
    document.addEventListener('visibilitychange',updateAnimation);
    return ()=>{
      cancelled=true;
      clearInterval(timer);
      motion.removeEventListener('change',updateAnimation);
      document.removeEventListener('visibilitychange',updateAnimation);
    };
  },[grids,view,unitsPerPixel,width,height,dark]);
  return <div className="grainrad-plant-layer" aria-hidden="true">
    <canvas ref={canvas} style={{width,height}}/>
  </div>;
}
