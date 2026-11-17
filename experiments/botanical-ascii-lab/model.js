const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const mul=(a,s)=>a.map(v=>v*s);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>mul(a,1/(Math.hypot(...a)||1));
export function createTomato() {
 const forms=[];let id=0;
 const put=(type,points,color,extra={})=>forms.push({id:id++,type,points,color,...extra});
 const stem=(a,b,r=.004,flex=.1,phase=0)=>put('stem',[a,b],'stem',{r,flex,phase});
 const main=z=>[.035*Math.sin(z*4),.018*Math.sin(z*6),z];
 for(let z=0;z<1.66;z+=.035)stem(main(z),main(z+.035),.008*(1-z/2),.012);
 // Same eleven alternate nodes and same number/size of leaflets. The authored
 // azimuths now occupy the whole crown, with mature drooping and younger rising
 // rachises, instead of repeating two nearly horizontal fans.
 const nodes=[[.25,3.6,.43,-.02],[.38,.78,.44,.13],[.52,5.4,.48,.02],[.67,2.2,.44,.14],[.81,4.5,.42,.05],[.96,.05,.43,.18],[1.09,2.95,.37,.12],[1.23,5.6,.35,.20],[1.38,1.45,.29,.10],[1.51,3.85,.23,.15],[1.62,.45,.17,.16]];
 function leaflet(base,tip,width,phase,flex) {
  width*=1.35;
  const d=tip.map((v,i)=>v-base[i]),length=Math.hypot(...d),axis=unit(d);
  const horizontal=unit(cross([0,0,1],axis)),up=unit(cross(axis,horizontal));
  const roll=.72*Math.sin(phase*.73)+.18*Math.cos(phase*.37);
  const side=add(mul(horizontal,Math.cos(roll)),mul(up,Math.sin(roll)));
  const normal=unit(cross(axis,side));
  // A tensor-product surface: arched midrib, shallow cup, rolled local frame,
  // tip droop and progressive twist. All veins use the same surface function.
  const surface=(t,s)=>{
   const envelope=Math.pow(Math.max(0,Math.sin(Math.PI*t)),.8);
   const lobes=1+.23*Math.sin(t*Math.PI*9+phase*.2)+.1*Math.sin(t*61);
   const center=add(mix(base,tip,t),add(mul(normal,length*.075*Math.sin(Math.PI*t)),[0,0,-length*.16*Math.sin(Math.PI*t)*t]));
   const fold=width*envelope*(.22*(1-s*s)+.38*s*(t-.35));
   return add(center,add(mul(side,s*width*envelope*lobes),mul(normal,fold)));
  };
  const pts=[],faces=[];
  for(let j=0;j<=14;j++)for(let k=0;k<5;k++)pts.push(surface(j/14,(k-2)/2));
  for(let j=0;j<14;j++)for(let k=0;k<4;k++){
   const a=j*5+k,b=a+5;faces.push([a,b,b+1],[a,b+1,a+1]);
  }
  put('leaf',pts,'leaf',{faces,flex,phase});
  put('stem',Array.from({length:15},(_,j)=>surface(j/14,0)),'stem',{r:.0014,flex,phase});
  for(let j=3;j<12;j+=3)for(const s of [-1,1])
   put('stem',[surface(j/14-.09,0),surface(j/14-.04,s*.4),surface(j/14,s*.78)],'stem',{r:.0007,flex,phase});
 }
 function compound(origin,a,length,lift,phase) {
  const dir=[Math.cos(a),Math.sin(a),0],side=[-dir[1],dir[0],0];
  const at=t=>add(origin,add(add(mul(dir,length*t),mul(side,length*.065*Math.sin(Math.PI*t)*Math.sin(phase*.4))),[0,0,lift*t+.065*Math.sin(Math.PI*t)-.10*t*t]));
  for(let j=0;j<12;j++)stem(at(j/12),at((j+1)/12),.003*(1-j/18),.15+j*.065,phase);
  for(let pair=0;pair<3;pair++)for(const s of [-1,1]){
   const t=.27+pair*.23+(s===1?.025:0),base=at(t),size=length*(.32-pair*.025)*(s===1?1:.87);
   const pitch=-.22+.48*Math.sin(phase*.9+pair*1.7+s*.65);
   const tip=add(base,add(mul(side,s*size),add(mul(dir,size*.48),[0,0,size*pitch])));
   leaflet(base,tip,size*.28,phase+pair*2+s,.42+t*.65);
   if(pair<2){const small=at(t+.11);leaflet(small,add(small,add(mul(side,s*size*.4),mul(dir,size*.2))),size*.1,phase+pair+s,.65);}
  }
  leaflet(at(.88),add(at(1),add(mul(dir,length*.23),[0,0,-.04])),length*.1,phase,1);
 }
 nodes.forEach(([z,a,l,h],i)=>compound(main(z),a,l,h,i*2.7));
 const shootA=main(.58),shootB=[.18,-.23,1.22];
 for(let j=0;j<15;j++)stem(mix(shootA,shootB,j/15),mix(shootA,shootB,(j+1)/15),.004,.12+j*.015,31);
 compound(mix(shootA,shootB,.5),3.9,.31,.07,35);compound(shootB,.8,.27,.14,39);
 function truss(z,a,count,ripe,phase){
  const root=main(z),dir=[Math.cos(a),Math.sin(a),0];let last=root;
  for(let i=0;i<count;i++){
   const axis=add(root,add(mul(dir,.09+i*.043),[0,0,-.025-i*.022]));stem(last,axis,.003,.22,phase);last=axis;
   const p=add(axis,[Math.sin(a)*.045*(i%2?1:-1),Math.cos(a)*.045*(i%2?-1:1),-.065-i*.006]);
   const r=.039+(count-i)*.0025;
   stem(axis,add(p,[0,0,r]),.002,.34,phase);
   put('fruit',[p],i<ripe?'fruit':'green',{r,flex:.34,phase});
   for(let k=0;k<5;k++){const theta=k*Math.PI*2/5;stem(add(p,[0,0,r]),add(p,[Math.cos(theta)*r*.9,Math.sin(theta)*r*.9,r*.75]),.0018,.34,phase);}
  }
 }
 truss(.67,5.8,5,4,52);truss(.99,2.3,4,2,60);truss(1.3,.3,3,0,69);
 const root=main(1.48);
 for(let n=0;n<4;n++){
  const p=add(root,[.12+n*.03,-.08+n*.02,-.035-n*.02]);stem(root,p,.0018,.65,80);const pts=[];
  for(let k=0;k<10;k++){const a=k*Math.PI/5,r=k%2?.005:.017;pts.push(add(p,[Math.cos(a)*r,Math.sin(a)*r,.007*Math.sin(a)]));}
  put('flower',pts,'flower',{flex:.7,phase:80,shade:1});
 }
 return forms;
}
