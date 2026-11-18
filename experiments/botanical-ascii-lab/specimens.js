import {createTomato} from './model.js?v=light03';

const turn = Math.PI * (3 - Math.sqrt(5));
const point = ([x,y,z], a, distance, rise = 0) =>
 [x + Math.cos(a)*distance, y + Math.sin(a)*distance, z + rise];

function specimen() {
 const forms = [];
 const put = (type, points, color, extra) =>
  forms.push({id:forms.length, type, points, color, ...extra});
 const stem = (points, r) => put('stem', points, 'stem', {r});
 function leaf(base, angle, length, width, rise, ridge) {
  const side = angle + Math.PI/2;
  const surface = (t,s) => {
   const envelope = Math.sin(Math.PI*t)**.85 * (1.2-.4*t);
   const center = point(base, angle, length*t, rise*t + ridge*Math.sin(Math.PI*t));
   return point(center, side, width*envelope*s, -ridge*.7*envelope*s*s);
  };
  const points = [], faces = [];
  for(let j=0;j<=12;j++){
   for(let k=0;k<=4;k++) points.push(surface(j/12,(k-2)/2));
   if(j===12) continue;
   for(let k=0;k<4;k++){
    const i=j*5+k;
    faces.push([i,i+5,i+6],[i,i+6,i+1]);
   }
  }
  put('leaf', points, 'leaf', {faces});
  stem(Array.from({length:13},(_,i)=>surface(i/12,0)), .0015);
  for(const t of [.29,.46,.63,.78]) for(const s of [-1,1]){
   stem([surface(t-.1,0),surface(t-.035,.43*s),surface(t,.83*s)], .0008);
  }
 }
 const berry = (center,r,color) => put('fruit',[center],color,{r});
 return {forms, stem, leaf, berry};
}

function createBasil() {
 const {forms,stem,leaf} = specimen();
 for(let shoot=0;shoot<7;shoot++){
  const angle=shoot*turn;
  const height=shoot===0?1.57:1.03+.28*Math.sin(shoot*1.9)**2;
  const at=t=>point([0,0,0],angle,(shoot===0?.06:.37)*t,t*height);
  stem(Array.from({length:16},(_,i)=>at(i/15)),shoot===0?.007:.004);
  for(let node=0;node<5;node++){
   const t=.33+node*.145, length=.33-.035*node;
   for(const offset of [0,Math.PI]){
    const direction=angle+offset+node*Math.PI/2;
    const base=at(t), join=point(base,direction,.04,.018);
    stem([base,join],.0024);
    leaf(join,direction,length,length*.34,.02+.033*Math.sin(node+shoot),.047);
   }
  }
 }
 return forms;
}

function createChard() {
 const {forms,stem,leaf} = specimen();
 for(let i=0;i<13;i++){
  const angle=i*turn, inner=i/12;
  const origin=[0,0,.025];
  const base=point(origin,angle,.34-.21*inner,.35+.57*inner);
  stem([origin,point(origin,angle,.11-.055*inner,base[2]*.62),base],.01-.004*inner);
  leaf(base,angle,.63-.15*inner,.22-.055*inner,.09+.41*inner,.11);
 }
 return forms;
}

function createEggplant() {
 const {forms,stem,leaf,berry} = specimen();
 stem([[0,0,0],[.04,0,.58],[0,0,1.35]],.012);
 for(let i=0;i<11;i++){
  const angle=i*turn, z=.32+i*.087;
  const start=[.025,0,z], joint=point(start,angle,.18,.07);
  const tip=point(start,angle,.3,.16);
  stem([start,joint,tip],.005);
  leaf(tip,angle,.39-i*.014,.16-i*.007,.05,.065);
  leaf(joint,angle+1,.25,.094,.12,.042);
  if(i%3!==1) continue;
  const center=point(joint,angle,.05,-.145);
  stem([joint,point(center,angle,0,.068)],.004);
  berry(center,.081,'fruit');
  berry(point(center,angle,0,.062),.032,'green');
 }
 return forms;
}

export const SPECIMENS = {
 tomato: {name:'Tomate', scientific:['Solanum','lycopersicum'], create:createTomato,
  note:'Wechselständige, unpaarig gefiederte Blätter. Kleine Zwischenfiedern. Seitlich hängende Fruchtstände.'},
 basil: {name:'Basilikum', scientific:['Ocimum','basilicum'], create:createBasil,
  note:'Gegenständige Blattpaare mit breiten, gewölbten Blattflächen und verzweigten Trieben.'},
 chard: {name:'Mangold', scientific:['Beta vulgaris','(Cicla-Gruppe)'], create:createChard,
  note:'Eine grundständige Rosette mit langen Blattstielen, breiten Blättern und ausgeprägten Mittelrippen.'},
 eggplant: {name:'Aubergine', scientific:['Solanum','melongena'], create:createEggplant,
  note:'Breite Einzelblätter und hängende Früchte in den warmen Fruchttönen der Studie.'}
};
