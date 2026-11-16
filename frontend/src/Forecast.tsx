import { Demo, fmt } from './types';
import { forecastForWeek } from './forecastModel';

export function Forecast({data,day}:{data:Demo;day:string}) {
  const {week,rows} = forecastForWeek(data.schedule.crop_forecasts,day);
  return <section className="forecast" aria-label="Erntemengen der gewählten Kalenderwoche">
    <div className="forecast-week"><strong>KW {week.number} / {week.year}</strong>
      <span>{fmt(week.start)} – {fmt(week.end)}</span></div>
    {rows.length ? <table><thead><tr><th>Kultur</th><th>Erwartete Menge</th></tr></thead>
      <tbody>{rows.map(row=><tr key={`${row.crop_id}:${row.unit}`}>
        <td>{data.names[row.crop_id]??row.crop_id}</td>
        <td>{row.quantity.toLocaleString('de-DE',{maximumSignificantDigits:4})} {row.unit==='pieces'?'Stück':row.unit}</td>
      </tr>)}</tbody></table> : <p className="forecast-empty">Keine Ernte in dieser Woche erwartet</p>}
    <p className="footnote">Synthetische Scheduler-Prognose · Montag bis Sonntag. Mengen der gewählten Woche, einschließlich Ernten außerhalb des Zielzeitraums.</p>
  </section>;
}
