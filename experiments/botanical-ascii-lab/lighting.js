// Shared world-space sun for the fixed isometry, for every future scene object.
// project(SUN.direction) = (-0.327, -1.057): upper LEFT on screen.
const unit=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const SUN=Object.freeze({direction:Object.freeze(unit([-.32,.08,1])),resolution:256});
export const groundProjection=([x,y,z])=>[x-SUN.direction[0]/SUN.direction[2]*z,y-SUN.direction[1]/SUN.direction[2]*z];

export class LightingField {
 constructor(){this.resolution=SUN.resolution;this.heights=new Float32Array(this.resolution**2);}
 build(forms){
  const size=this.resolution,kx=SUN.direction[0]/SUN.direction[2],ky=SUN.direction[1]/SUN.direction[2];
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const f of forms)for(const p of f.points){const [x,y]=groundProjection(p),r=f.r||0;minX=Math.min(minX,x-r);maxX=Math.max(maxX,x+r);minY=Math.min(minY,y-r);maxY=Math.max(maxY,y+r);}
  const pad=.08;this.minX=minX-pad;this.minY=minY-pad;
  this.dx=(maxX-minX+pad*2)/size;this.dy=(maxY-minY+pad*2)/size;this.heights.fill(-Infinity);
  const local=p=>{const [x,y]=groundProjection(p);return [(x-this.minX)/this.dx,(y-this.minY)/this.dy,p[2]];};
  const bounds=(a,b,c,d)=>[Math.max(0,Math.ceil(a-.5)),Math.max(0,Math.ceil(b-.5)),Math.min(size-1,Math.floor(c-.5)),Math.min(size-1,Math.floor(d-.5))];
  const triangle=(a,b,c)=>{
   const den=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);if(Math.abs(den)<1e-10)return;
   const [x0,y0,x1,y1]=bounds(Math.min(a[0],b[0],c[0]),Math.min(a[1],b[1],c[1]),Math.max(a[0],b[0],c[0]),Math.max(a[1],b[1],c[1]));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const u=((b[1]-c[1])*(x+.5-c[0])+(c[0]-b[0])*(y+.5-c[1]))/den;
    const v=((c[1]-a[1])*(x+.5-c[0])+(a[0]-c[0])*(y+.5-c[1]))/den,w=1-u-v;
    if(u>=0&&v>=0&&w>=0){const i=y*size+x,z=u*a[2]+v*b[2]+w*c[2];if(z>this.heights[i])this.heights[i]=z;}
   }
  };
  const sphere=(p,r)=>{
   const [gx,gy]=groundProjection(p),rx=r*Math.sqrt(1+kx*kx),ry=r*Math.sqrt(1+ky*ky);
   const [x0,y0,x1,y1]=bounds((gx-rx-this.minX)/this.dx,(gy-ry-this.minY)/this.dy,(gx+rx-this.minX)/this.dx,(gy+ry-this.minY)/this.dy);
   const a=1+kx*kx+ky*ky;
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const px=this.minX+(x+.5)*this.dx-p[0],py=this.minY+(y+.5)*this.dy-p[1];
    const b=kx*px+ky*py-p[2],c=px*px+py*py+p[2]*p[2]-r*r,q=b*b-a*c;
    if(q>=0){const z=(-b+Math.sqrt(q))/a,i=y*size+x;if(z>this.heights[i])this.heights[i]=z;}
   }
  };
  for(const f of forms){
   if(f.type==='fruit')sphere(f.points[0],f.r);
   else if(f.type==='stem'){
    if(f.r<.002)continue; // Submillimetre veins are below shadow-map resolution.
    for(let j=1;j<f.points.length;j++){const a=f.points[j-1],b=f.points[j],steps=Math.max(1,Math.ceil(Math.hypot(...a.map((v,i)=>v-b[i]))/.006));for(let k=0;k<=steps;k++)sphere(a.map((v,i)=>v+(b[i]-v)*k/steps),f.r);}
   }else if(f.faces){for(const [a,b,c]of f.faces)triangle(local(f.points[a]),local(f.points[b]),local(f.points[c]));}
   else {const p=f.points[0].map((_,i)=>f.points.reduce((s,p)=>s+p[i],0)/f.points.length);for(let j=0;j<f.points.length;j++)triangle(local(p),local(f.points[j]),local(f.points[(j+1)%f.points.length]));}
  }
  return this;
 }
 height(x,y){const ix=Math.floor((x-this.minX)/this.dx),iy=Math.floor((y-this.minY)/this.dy),n=this.resolution;return ix<0||iy<0||ix>=n||iy>=n?-Infinity:this.heights[iy*n+ix];}
 visibility(p,normal){
  const [x,y]=groundProjection(p),slope=1-Math.abs(dot(normal,SUN.direction));
  const bias=.007+slope*.012;let lit=0;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(this.height(x+i*this.dx,y+j*this.dy)<=p[2]+bias)lit++;
  return lit/9;
 }
 shade(normal,p,kind,camera){
  const front=dot(normal,camera)>=0,n=front?normal:normal.map(v=>-v);
  const diffuse=Math.max(0,dot(n,SUN.direction)),lit=this.visibility(p,n),height=clamp(p[2]/1.7,0,1);
  const ambient=.15+.09*height;
  let value=ambient+.70*diffuse*lit*(front?1:.68);
  if(kind==='stem')value=.29+.46*lit;
  if(kind==='flower')value=.35+.55*lit;
  return Math.round(clamp(Math.round(value*16)/16,.125,.94)*255);
 }
 groundCoverage(x,y){
  // Height-dependent penumbra, filtered footprint of the actual caster map.
  const h=this.height(x,y),radius=1.15+(Number.isFinite(h)?Math.max(0,h)*1.4:1.2);
  const weights=[1,4,6,4,1];let coverage=0;
  for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++)if(this.height(x+i*this.dx*radius,y+j*this.dy*radius)>0)coverage+=weights[i+2]*weights[j+2];
  return coverage/256;
 }
}
