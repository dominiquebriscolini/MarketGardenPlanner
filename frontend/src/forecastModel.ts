import type { Demo } from './types';
import type { Point } from './interactions';

const DAY = 86400000;
type SchedulerRow = Demo['schedule']['crop_forecasts'][number];
export type WindowSize = {width:number; height:number};

/** Calendar-only ISO weeks, Monday through Sunday. No local-time/DST arithmetic. */
export function calendarWeek(day:string) {
  const date = new Date(`${day}T00:00:00Z`);
  const monday = date.getTime() - ((date.getUTCDay()+6)%7)*DAY;
  const year = new Date(monday+3*DAY).getUTCFullYear();
  const jan4 = new Date(Date.UTC(year,0,4));
  const firstMonday = jan4.getTime()-((jan4.getUTCDay()+6)%7)*DAY;
  const iso = (value:number) => new Date(value).toISOString().slice(0,10);
  return {start:iso(monday), end:iso(monday+6*DAY), endExclusive:iso(monday+7*DAY),
    number:Math.round((monday-firstMonday)/(7*DAY))+1, year};
}

/** Select and group original scheduler quantities; independent of bed display states. */
export function forecastForWeek(source:readonly SchedulerRow[], day:string) {
  const week = calendarWeek(day);
  const groups = new Map<string,{crop_id:string;unit:string;quantity:number}>();
  for (const row of source) {
    if (row.week_start !== week.start || row.quantity <= 0) continue;
    const key = `${row.crop_id}\0${row.unit}`;
    const group = groups.get(key);
    if (group) group.quantity += row.quantity;
    else groups.set(key,{crop_id:row.crop_id,unit:row.unit,quantity:row.quantity});
  }
  return {week,rows:[...groups.values()].sort((a,b)=>a.crop_id.localeCompare(b.crop_id)||a.unit.localeCompare(b.unit))};
}

export function clampWindowPosition(point:Point, size:WindowSize, viewport:WindowSize):Point {
  return {x:Math.max(12,Math.min(point.x,viewport.width-size.width-12)),
    y:Math.max(12,Math.min(point.y,viewport.height-size.height-12))};
}

/** Initial placement keeps the right detail column and bottom season bar available. */
export function forecastWindowLayout(viewport:WindowSize, measuredHeight=226) {
  const narrow = viewport.width <= 600;
  const width = Math.min(viewport.width-24,narrow?340:Math.max(220,Math.min(340,viewport.width-366)));
  const maxHeight = Math.min(viewport.height-24,narrow?Math.max(120,Math.min(226,viewport.height-546)):Math.max(160,Math.min(340,viewport.height-500)));
  const initial = {x:narrow?12:22,y:narrow?viewport.height-143-maxHeight:Math.min(350,viewport.height-150-Math.min(maxHeight,measuredHeight))};
  return {width,maxHeight,initial};
}
