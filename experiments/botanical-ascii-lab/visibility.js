// CPU z-buffer: 3x3 sub-samples per character cell, before any text/stippling.
// Gaps between output marks reveal background, never an occluded rear layer.
import {project,depth,rotateZ} from './projection.js?v=light03';
import {deform} from './wind.js?v=light03';
import {LightingField} from './lighting.js?v=light03';
const materials={leaf:1,stem:2,fruit:3,green:4,flower:5};
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const U=unit([1,-1,0]),V=unit([1,1,-2]),W=unit([1,1,1]);
export class VisibilityBuffer {
 build(model,{width,height,zoom,pan,size,wind,time}){
  const yaw=0; // Fixed orientation: query parameters and renderer options cannot rotate it.
  const forms=model.map(f=>({...f,points:f.points.map(p=>deform(p,time,wind,f.flex,f.phase))}));
  this.lighting??=new LightingField();this.lighting.build(forms);
  const cellX=size*.62,cellY=size;
  this.columns=Math.ceil(width/cellX);this.rows=Math.ceil(height/cellY);
  this.w=this.columns*3;this.h=this.rows*3;this.stepX=cellX/3;this.stepY=cellY/3;
  const n=this.w*this.h;
  if(this.z?.length!==n){this.z=new Float64Array(n);this.material=new Uint8Array(n);this.tone=new Uint8Array(n);this.direction=new Uint8Array(n);this.owner=new Int32Array(n);}
  this.z.fill(-Infinity);this.material.fill(0);this.owner.fill(-1);
  const scale=Math.min(height*.46,width*.58)*zoom,metricScale=scale*Math.sqrt(1.5);
  const origin=[width*.5+pan[0],height*.89+pan[1]];
  const screen=p=>{const r=rotateZ(p,yaw),q=project(r);return [origin[0]+q[0]*scale,origin[1]+q[1]*scale,depth(r)];};
  const camera=rotateZ(W,-yaw),screenU=rotateZ(U,-yaw),screenV=rotateZ(V,-yaw);
  const write=(x,y,z,mat,tone,direction,id)=>{
   const i=y*this.w+x;
   if(z>this.z[i]||(z===this.z[i]&&id>this.owner[i])){
    this.z[i]=z;this.material[i]=mat;this.tone[i]=tone;this.direction[i]=direction;this.owner[i]=id;
   }
  };
  const bounds=(x0,y0,x1,y1)=>[
   Math.max(0,Math.ceil(x0/this.stepX-.5)),Math.max(0,Math.ceil(y0/this.stepY-.5)),
   Math.min(this.w-1,Math.floor(x1/this.stepX-.5)),Math.min(this.h-1,Math.floor(y1/this.stepY-.5))];
  const triangle=(a,b,c,normal,f,point)=>{
   const denominator=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(denominator)<1e-9)return;
   const [x0,y0,x1,y1]=bounds(Math.min(a[0],b[0],c[0]),Math.min(a[1],b[1],c[1]),Math.max(a[0],b[0],c[0]),Math.max(a[1],b[1],c[1]));
   const tone=this.lighting.shade(normal,point,f.type,camera),mat=materials[f.color];
   for(let y=y0;y<=y1;y++){const py=(y+.5)*this.stepY;for(let x=x0;x<=x1;x++){
    const px=(x+.5)*this.stepX,u=((b[1]-c[1])*(px-c[0])+(c[0]-b[0])*(py-c[1]))/denominator;
    const v=((c[1]-a[1])*(px-c[0])+(a[0]-c[0])*(py-c[1]))/denominator,w=1-u-v;
    if(u>=-1e-9&&v>=-1e-9&&w>=-1e-9)write(x,y,u*a[2]+v*b[2]+w*c[2],mat,tone,0,f.id);
   }}
  };
  const tube=(a,b,f,wa,wb)=>{
   const dx=b[0]-a[0],dy=b[1]-a[1],length2=dx*dx+dy*dy;
   const radius=Math.max(f.r*metricScale,cellX*(f.r<.002?.13:.31)),worldR=radius/metricScale;
   const [x0,y0,x1,y1]=bounds(Math.min(a[0],b[0])-radius,Math.min(a[1],b[1])-radius,Math.max(a[0],b[0])+radius,Math.max(a[1],b[1])+radius);
   const direction=Math.abs(dx)<Math.abs(dy)*.45?60:dx*dy>0?120:180,tone=this.lighting.shade(camera,wa.map((v,i)=>(v+wb[i])/2),'stem',camera);
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const px=(x+.5)*this.stepX,py=(y+.5)*this.stepY,t=clamp(((px-a[0])*dx+(py-a[1])*dy)/(length2||1),0,1);
    const distance2=(px-a[0]-t*dx)**2+(py-a[1]-t*dy)**2;
    if(distance2<=radius*radius){const z=a[2]+t*(b[2]-a[2])+Math.sqrt(Math.max(0,worldR*worldR-distance2/(metricScale*metricScale)));write(x,y,z,materials[f.color],tone,direction,f.id);}
   }
  };
  const sphere=(p,f,center)=>{
   const radius=f.r*metricScale,[x0,y0,x1,y1]=bounds(p[0]-radius,p[1]-radius,p[0]+radius,p[1]+radius);
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const u=((x+.5)*this.stepX-p[0])/radius,v=((y+.5)*this.stepY-p[1])/radius,q=1-u*u-v*v;
    if(q<0)continue;const w=Math.sqrt(q),d=p[2]+f.r*w,normal=camera.map((n,i)=>screenU[i]*u+screenV[i]*v+n*w);
    write(x,y,d,materials[f.color],this.lighting.shade(normal,center.map((v,i)=>v+normal[i]*f.r),f.type,camera),0,f.id);
   }
  };
  // No painter sorting: all opaque surfaces compete at each individual sample.
  for(const f of forms){
   const world=f.points,points=world.map(screen);
   if(f.type==='stem'){for(let j=1;j<points.length;j++)tube(points[j-1],points[j],f,world[j-1],world[j]);}
   else if(f.type==='fruit')sphere(points[0],f,world[0]);
   else if(f.faces){for(const [a,b,c]of f.faces)triangle(points[a],points[b],points[c],unit(cross(sub(world[b],world[a]),sub(world[c],world[a]))),f,world[a].map((v,i)=>(v+world[b][i]+world[c][i])/3));}
   else {
    const center=world[0].map((_,i)=>world.reduce((sum,p)=>sum+p[i],0)/world.length),p=screen(center);
    for(let j=0;j<points.length;j++){const k=(j+1)%points.length;triangle(p,points[j],points[k],unit(cross(sub(world[j],center),sub(world[k],center))),f,center.map((v,i)=>(v+world[j][i]+world[k][i])/3));}
   }
  }
  return this;
 }
 sample(col,row){
  const middle=(row*3+1)*this.w+col*3+1;if(this.material[middle])return middle;
  let best=middle;for(let y=0;y<3;y++)for(let x=0;x<3;x++){const i=(row*3+y)*this.w+col*3+x;if(this.z[i]>this.z[best])best=i;}
  return best;
 }
}
