import type { Demo } from './types';

export type Point = { x: number; y: number };
export type View = Point & { width: number; height: number };

/** Uniform metre-to-pixel mapping; independent of panels, selection and season. */
export function fittedView(boundary: number[][], width: number, height: number): View {
  const xs = boundary.map(p => p[0]), ys = boundary.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const availableWidth = Math.max(1, width - (width < 600 ? 40 : 100));
  const availableHeight = Math.max(1, height - (width < 600 ? 280 : 240));
  const metresPerPixel = Math.max((maxX-minX)/availableWidth, (maxY-minY)/availableHeight);
  const viewWidth = width*metresPerPixel, viewHeight = height*metresPerPixel;
  return {x:(minX+maxX-viewWidth)/2, y:(minY+maxY-viewHeight)/2, width:viewWidth, height:viewHeight};
}

export function cameraView(fit: View, zoom: number, pan: Point): View {
  const width = fit.width/zoom, height = fit.height/zoom;
  return {x:fit.x+(fit.width-width)/2+pan.x, y:fit.y+(fit.height-height)/2+pan.y, width, height};
}

/** Flip at edges and clamp; coordinates are screen pixels, never world metres. */
export function tooltipPosition(pointer: Point, size: {width:number;height:number}, viewport: {width:number;height:number}): Point {
  const gap=16, edge=10;
  const x=pointer.x+gap+size.width<=viewport.width-edge ? pointer.x+gap : pointer.x-gap-size.width;
  const y=pointer.y+gap+size.height<=viewport.height-edge ? pointer.y+gap : pointer.y-gap-size.height;
  return {x:Math.max(edge,Math.min(x,viewport.width-size.width-edge)), y:Math.max(edge,Math.min(y,viewport.height-size.height-edge))};
}

/** Lookup of supplied scheduler dates only; no agronomic calculation. */
export function nextBedEvent(data: Demo, bedId: string, day: string): {date:string;label:string}|null {
  const events: {date:string;label:string;order:number}[]=[];
  for (const r of data.schedule.reservations.filter(r=>r.bed_id===bedId)) {
    const batch=data.schedule.batches.find(b=>b.plan.id===r.batch_id);
    if (!batch) continue;
    const p=batch.plan, crop=data.names[p.profile_id];
    events.push({date:p.sowing_date,label:`Aussaat · ${crop}`,order:0});
    if (p.transplant_date) events.push({date:p.transplant_date,label:`Pflanzung · ${crop}`,order:1});
    events.push({date:p.first_harvest,label:`Erntebeginn · ${crop}`,order:2},
      {date:p.harvest_end,label:`Räumungsbeginn · ${crop}`,order:3},
      {date:r.window.end,label:'Beet wieder frei',order:4});
  }
  // Today's events are reflected in today's state; next means strictly later.
  return events.filter(e=>e.date>day).sort((a,b)=>a.date.localeCompare(b.date)||a.order-b.order)[0]??null;
}

export function seasonStep(index:number, delta:number, count:number):number {
  return Math.max(0,Math.min(count-1,index+delta));
}
