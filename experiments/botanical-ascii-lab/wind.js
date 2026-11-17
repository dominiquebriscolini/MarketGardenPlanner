const fract=x=>x-Math.floor(x);
const hash=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
export function noise(t,seed=0) {
 const i=Math.floor(t),f=t-i,s=f*f*f*(f*(f*6-15)+10);
 return (hash(i+seed)*(1-s)+hash(i+1+seed)*s)*2-1;
}
// Aperiodic gust targets, quintic interpolation; no periodic oscillator.
export function deform(p,time,strength,flex=1,phase=0) {
 // A continuous spatial field keeps every shared branch/leaf attachment joined.
 // Radial distance controls compliance, leaving the central stem stable.
 flex=Math.min(1.35,Math.hypot(p[0],p[1])*2.7);
 phase=p[0]*4+p[1]*3+p[2]*2;
 const h=Math.max(0,p[2])/1.7,g=noise(time/9,19)*.7+noise(time/17,83)*.3;
 return [p[0]+strength*(.018*h*h*g+flex*.17*(g+.35*noise(time/6+phase*.09,41))),
 p[1]+strength*flex*.07*noise(time/13+phase*.035,77),p[2]+strength*flex*.028*noise(time/11+phase*.04,29)];
}
