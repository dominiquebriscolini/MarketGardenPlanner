import type {WeeklyBed} from './projectSeason';

export function projectWeekPattern(bed:WeeklyBed|undefined) {
  if(bed?.stage==='overlap')return 'overlap';
  return bed?.uncertain?'open':null;
}

export function ProjectWeekPatterns({prefix}:{prefix:string}) {
  return <>
    <pattern id={prefix+'-overlap'} width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M0 0V.3" className="week-pattern-line" strokeWidth=".04"/>
    </pattern>
    <pattern id={prefix+'-open'} width=".35" height=".35" patternUnits="userSpaceOnUse">
      <circle cx=".17" cy=".17" r=".035" className="week-pattern-dot"/>
    </pattern>
  </>;
}
