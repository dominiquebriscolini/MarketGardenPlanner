// Equal-length orthographic axes, ground axes at 30 degrees.
export const project=([x,y,z])=>[(x-y)*Math.sqrt(3)/2,(x+y)*.5-z];
// Unit viewing ray: positive depth is nearer the camera. Orthogonal to both
// screen axes; interpolate this value on each triangle, never its average.
export const depth=([x,y,z])=>(x+y+z)/Math.sqrt(3);
export const rotateZ=([x,y,z],angle=0)=>[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle),z];
