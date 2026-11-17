// Presentation only. Neither geometry nor visibility/illumination depends on theme.
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
const lightShades=[null,[[23,44,32],[70,91,59]],[[25,47,32],[45,68,44]],[[135,62,46],[178,99,66]],[[35,54,29],[80,101,53]],[[109,82,31],[147,116,49]]];
export const PALETTES=Object.freeze({
 dark:Object.freeze({background:'#101713',grid:'#25312a',shadow:'#030806',shadowAlpha:.85,
  colors:Object.freeze(['','#c5d2b2','#d7ddbd','#e59b82','#a8bd91','#e2cf8f']),bins:4,
  ink(material){return this.colors[material];},opacity(tone){return .18+tone*.82;}}),
 light:Object.freeze({background:'#F0EEE5',grid:'#ced1c0',shadow:'#667361',shadowAlpha:.27,bins:16,
  // Dark green shaded ink and lighter desaturated green sunlit ink. Fruit ramps
  // retain muted red/orange. The same light-buffer values select the ink shades.
  ink(material,tone){const [shade,lit]=lightShades[material];return `rgb(${mix(shade,lit,Math.max(0,Math.min(1,tone))).join(',')})`;},
  opacity(){return .94;}})
});
export const THEME_STORAGE_KEY='botanical-ascii-lab:theme';
export function readTheme(){try{return localStorage.getItem(THEME_STORAGE_KEY)==='light'?'light':'dark';}catch{return 'dark';}}
export function setTheme(theme){
 const value=theme==='light'?'light':'dark';document.documentElement.dataset.theme=value;
 try{localStorage.setItem(THEME_STORAGE_KEY,value);}catch{/* In-memory choice still works when storage is blocked. */}
 return value;
}
