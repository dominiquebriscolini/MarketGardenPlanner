import type {GrowthPhase} from './projectSeason';

// Original vector silhouettes for the planner and preview. Coordinates are local
// to each symbol, with a common foot point at (23, 46).
const symbols: Record<string,string> = {
  carrots: '<path fill="#d48747" d="M17 37h12l-6 11Z"/><path d="M23 39l-7-21m7 19V15m0 24l8-21"/>',
  lettuce: '<path fill="#91ac69" d="M23 46C8 45 7 35 11 29c5-1 8 3 10 7-3-10 0-15 4-16 5 3 6 8 3 16 4-6 8-7 11-5 1 8-6 15-16 15Z"/>',
  radishes: '<circle fill="#cc7784" cx="23" cy="39" r="7"/><path d="M23 32l-8-12m8 12l1-14m0 15l7-10"/>',
  kohlrabi: '<circle fill="#a1aa75" cx="23" cy="38" r="8"/><path d="M20 36L11 22m13 12V15m1 20l10-13"/>',
  beetroot: '<path fill="#a16282" d="M15 36c0-8 16-9 16 0 0 5-4 8-8 11-4-3-8-6-8-11Z"/><path d="M23 31l-8-13m8 13l7-17"/>',
  spinach: '<path fill="#6f9468" d="M23 46C11 41 8 34 9 28c7-2 13 2 15 9-4-9-2-17 4-21 6 6 6 12 0 22 6-7 10-8 14-5-4 9-11 12-19 13Z"/>',
  'bush-beans': '<path d="M23 46V20m0 13L12 23m11 7l10-12"/><path fill="#9dac65" d="M11 25q-7 6-6 11 7 0 9-11Zm22-6q8 3 5 10-7-3-5-10Z"/><path d="M27 31q7 5 5 11"/>',
  zucchini: '<path fill="#75995d" d="M22 45C11 40 6 33 6 27l9 2 4-8 8 7 7-6 5 11-15 12Z"/><path fill="#b3ad60" d="M22 42q18-8 19-3 3 6-18 7Z"/>',
  tomatoes: '<path d="M23 46V10m0 13l-9-7m9 10l11-8m-11 15l-9-5m9 9l10-7"/><circle fill="#c57662" cx="15" cy="33" r="5"/><circle fill="#c57662" cx="33" cy="35" r="5"/>',
  onions: '<path fill="#d6b382" d="M23 46q-12-2-5-11l5-5 5 5q7 9-5 11Z"/><path d="M23 31q-7-13-5-20m5 20V9m0 22q9-17 8-21"/>',
};

const size = 460;
const species = Object.keys(symbols);
const width = size * species.length;
const markup = species.map((id, index) =>
  `<g transform="translate(${index * size} 0) scale(10)" fill="none" stroke="#5f835d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${symbols[id]}</g>`,
).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${size + 40}">${markup}</svg>`;

export const plantSymbolAtlas = {
  url: `data:image/svg+xml,${encodeURIComponent(svg)}`,
  width,
  height:size + 40,
  sequence:['center'],
  poseMs:1000,
  growthScale:{sprout:.34,juvenile:.55,developing:.75,mature:1} satisfies Record<GrowthPhase,number>,
  presentation:{
    dark:{spriteFilter:'brightness(1.25)',spritePasses:0},
    light:{spriteFilter:'none',spritePasses:0},
  },
};

const assets = new Map(species.map((speciesId, index) => [speciesId,{
  speciesId,
  sprite:{foot:[230,460],previewScale:1,
    frames:[{name:'center',x:index * size,y:0,w:size,h:size + 40}]},
}]));

export function plantSymbolForSpecies(speciesId:string) {
  return assets.get(speciesId);
}

export function plantSymbolForProfile(profileId:string) {
  const speciesId = species.find(id => profileId.startsWith(id + '-'));
  return speciesId ? plantSymbolForSpecies(speciesId) : undefined;
}
