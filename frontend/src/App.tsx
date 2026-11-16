import { useEffect, useState } from 'react';
import { Demo, fmt, stages } from './types';
import { Plot } from './Plot';
import { Details } from './Details';
import { ForecastWindow } from './ForecastWindow';
import type { Point } from './interactions';
import { seasonStep } from './interactions';

export function App() {
  const [data,setData]=useState<Demo|null>(null),[error,setError]=useState('');
  const [index,setIndex]=useState(101),[selected,setSelected]=useState<string|null>(null);
  const [legendOpen,setLegendOpen]=useState(false),[forecastOpen,setForecastOpen]=useState(false);
  const [forecastPosition,setForecastPosition]=useState<Point|null>(null);
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/demo',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();})
      .then(setData).catch(e=>{if(e.name!=='AbortError')setError(String(e));});
    return ()=>controller.abort();
  },[]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){setSelected(null);setForecastOpen(false);}};
    let narrow=window.innerWidth<=600;
    const onResize=()=>{
      const next=window.innerWidth<=600;
      if(next!==narrow){setForecastPosition(null);narrow=next;}
    };
    window.addEventListener('keydown',onKey);window.addEventListener('resize',onResize);
    return ()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('resize',onResize);};
  },[]);
  if(error)return <main className="loading-screen"><h1>Plan konnte nicht geladen werden</h1><p>{error}</p><p>Python-Server prüfen und Seite neu laden.</p></main>;
  if(!data)return <main className="loading-screen"><h1>Saisonplan wird geladen …</h1></main>;
  const day=data.days[index],occupied=Object.values(day.beds).filter(b=>b.stage!=='free').length;
  const step=(delta:number)=>setIndex(i=>seasonStep(i,delta,data.days.length));
  return <main className={`map-app ${forecastOpen?'forecast-open':''}`}>
    <Plot data={data} index={index} selected={selected} onSelect={setSelected}/>
    <header className="project-title floating"><span className="eyebrow">MARKET GARDEN / SAISONATLAS</span>
      <h1>Versuchsfeld Nord <span>2026</span></h1><p className="demo-notice" title={data.notice}>Synthetische Demo · keine Produktionsprognose</p></header>
    <div className="map-secondary"><div className="legend floating">
      <button aria-expanded={legendOpen} aria-controls="legend-items" onClick={()=>setLegendOpen(v=>!v)}><span className="legend-icon" aria-hidden="true">◫</span> Legende <span>{legendOpen?'−':'+'}</span></button>
      {legendOpen&&<div id="legend-items">{Object.entries(stages).map(([key,label])=><span key={key}><i className={key}/>{label}</span>)}<small>Schematische Planphasen</small></div>}
    </div><button className="floating forecast-toggle" aria-expanded={forecastOpen} onClick={()=>setForecastOpen(v=>!v)}>Ernteprognose ↗</button></div>
    {selected&&<Details data={data} index={index} selected={selected} onClose={()=>setSelected(null)}/>}
    {forecastOpen&&<ForecastWindow data={data} day={day.date} position={forecastPosition}
      onPosition={setForecastPosition} onClose={()=>setForecastOpen(false)}/>}
    <section className="season floating" aria-label="Saisonsteuerung"><div className="season-head">
      <div className="season-date"><span className="eyebrow">SAISONZEITPUNKT</span><strong>{fmt(day.date)}</strong></div>
      <span className="occupancy">{occupied} / {data.geometry.beds.length} Beete belegt</span>
      <div className="date-navigation"><button aria-label="Eine Woche zurück" disabled={index===0} onClick={()=>step(-7)}>− Woche</button>
        <button aria-label="Eine Woche vor" disabled={index===data.days.length-1} onClick={()=>step(7)}>+ Woche</button>
        <input aria-label="Datum wählen" type="date" min={data.days[0].date} max={data.days.at(-1)!.date} value={day.date}
          onChange={e=>{const i=data.days.findIndex(d=>d.date===e.target.value);if(i>=0)setIndex(i);}}/></div>
    </div><input className="season-slider" aria-label="Saisontag" aria-valuetext={fmt(day.date)} type="range" min="0" max={data.days.length-1} value={index} onChange={e=>setIndex(Number(e.target.value))}/>
      <div className="months">{['MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV'].map(m=><span key={m}>{m}</span>)}</div>
    </section>
  </main>;
}
