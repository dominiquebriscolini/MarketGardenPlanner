import {SeasonSlider} from './SeasonSlider';
import {fmt} from './types';
import type {useProjectSeason} from './useProjectSeason';

export function ProjectSeasonBar({controller:c}:{controller:ReturnType<typeof useProjectSeason>}) {
  const f=c.frame;
  return <section className="season floating project-season-bar" aria-label="Projekt-Saisonsteuerung">
    {!f?<div role={c.error?'alert':'status'}><strong>{c.error?'Wochenstatus nicht verfügbar':'Wochenplanung wird geladen …'}</strong>
      {c.error&&<><p>{c.error}</p><button onClick={c.retry}>Wochenansicht erneut laden</button></>}</div>:<>
      <div className="season-head"><div className="season-date"><span className="eyebrow">ZEITLICHE PLANUNGSANSICHT</span><strong>KW {f.week.iso_week} / {f.week.iso_year}</strong></div>
        <span className="week-dates">{fmt(f.week.start_date)} – {fmt(f.week.end_date)}</span>
        <div className="date-navigation"><button aria-label="Vorherige Kalenderwoche" disabled={f.week.iso_year===1&&f.week.iso_week===1} onClick={()=>c.step(-1)}>− Woche</button>
          <select aria-label="ISO-Jahr" value={f.season.iso_year} onChange={event=>c.choose(Number(event.target.value),f.week.iso_week)}>{f.season.years.map(y=><option key={y} value={y}>{y}</option>)}</select>
          <button aria-label="Nächste Kalenderwoche" disabled={f.week.iso_year===9998&&f.week.iso_week===f.season.weeks.length} onClick={()=>c.step(1)}>+ Woche</button></div>
      </div>
      <SeasonSlider min={1} max={f.season.weeks.length} value={f.week.iso_week} label="Saisonwoche" valueText={`KW ${f.week.iso_week} / ${f.week.iso_year}`} onChange={value=>c.choose(f.season.iso_year,value)}/>
      <div className="week-axis"><span>KW 1</span><small>Geplante Ernte ≠ bestätigte Ernte oder Räumung · Ende offen bleibt unklar</small><span>KW {f.season.weeks.length}</span></div>
    </>}
  </section>;
}
