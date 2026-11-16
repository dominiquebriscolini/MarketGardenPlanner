import { useState } from 'react';
import { Demo, stages } from './types';
// All SVG world coordinates are metres. Zoom changes only the viewport.
export function Plot({ data, index, selected, onSelect }: {
    data: Demo;
    index: number;
    selected: string;
    onSelect: (id: string) => void;
}) {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const day = data.days[index];
    return <section className="plot-panel">
    <div className="panel-heading"><div><span className="eyebrow">01 / GRUNDSTÜCK</span><h2>Versuchsfeld Nord</h2></div><span className="muted">Lokale Koordinaten · Meter</span></div>
    <div className="map-tools"><button aria-label="Verkleinern" onClick={() => setZoom(z => Math.max(1, z - .25))}>−</button><span>{Math.round(zoom * 100)} %</span><button aria-label="Vergrößern" onClick={() => setZoom(z => Math.min(3, z + .25))}>+</button><button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Einpassen</button><button aria-label="Nach links" onClick={() => setPan(p => ({ ...p, x: p.x - 2 }))}>←</button><button aria-label="Nach rechts" onClick={() => setPan(p => ({ ...p, x: p.x + 2 }))}>→</button><button aria-label="Nach oben" onClick={() => setPan(p => ({ ...p, y: p.y - 2 }))}>↑</button><button aria-label="Nach unten" onClick={() => setPan(p => ({ ...p, y: p.y + 2 }))}>↓</button></div>
    <svg className="plot" viewBox={`${14.5 - 17 / zoom + pan.x} ${10.5 - 13 / zoom + pan.y} ${34 / zoom} ${26 / zoom}`} aria-label="Maßstäbliche Grundstücksansicht">
      <defs><pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="#d9ded7" strokeWidth=".025"/></pattern><pattern id="hatch" width=".3" height=".3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2=".3" stroke="#a16c43" strokeWidth=".08"/></pattern></defs>
      <rect x="-30" y="-30" width="100" height="100" fill="url(#grid)"/>
      <polygon points={data.geometry.boundary.map(p => p.join(',')).join(' ')} fill="#f9faf5" stroke="#667668" strokeWidth=".09"/>
      <path d="M2 14 H26" stroke="#e3e4d9" strokeWidth="1.1"/>
      <text x="3" y="17" className="world-note">ERSCHLIESSUNGSWEG</text><text x="3" y="18" className="world-note">Synthetischer Lageplan / kein vermessenes Grundstück</text>
      {data.geometry.beds.map(b => {
            const s = day.beds[b.id];
            const batch = data.schedule.batches.find(v => v.plan.id === s.batch_id);
            return <g key={b.id} transform={`translate(${b.x} ${b.y}) rotate(${b.angle})`} role="button" tabIndex={0} aria-label={`${b.id}: ${stages[s.stage]}${batch ? ', ' + data.names[batch.plan.profile_id] : ''}`} onClick={() => onSelect(b.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(b.id);
            } }} className="bed">
          <rect x="-.18" y="-.18" width={b.width + .36} height={b.length + .36} rx=".06" fill="none" stroke={selected === b.id ? '#263f36' : 'transparent'} strokeWidth=".09"/>
          <rect width={b.width} height={b.length} className={`bed-fill ${s.stage}`} stroke="#718173" strokeWidth=".045"/>
          {s.stage === 'cleanup' && <rect width={b.width} height={b.length} fill="url(#hatch)"/>}
          <text x={b.width / 2} y="-.5" textAnchor="middle" className="bed-number">{b.id}</text>
          <text transform={`translate(${b.width / 2} ${b.length / 2}) rotate(-90)`} textAnchor="middle" className="plant-label">{batch ? data.names[batch.plan.profile_id] : 'Frei'}</text>
        </g>;
        })}
      <path d="M26 4 V1.7 M25.7 2.2 L26 1.7 L26.3 2.2" fill="none" stroke="#344b40" strokeWidth=".07"/><text x="26" y="1.2" textAnchor="middle" className="bed-number">N</text>
      <path d="M3 19.5 V20 H8 V19.5" fill="none" stroke="#344b40" strokeWidth=".08"/><text x="5.5" y="20.7" textAnchor="middle" className="world-note">5 m</text>
    </svg>
    <div className="legend">{Object.entries(stages).map(([key, label]) => <span key={key}><i className={key}/>{label}</span>)}</div>
  </section>;
}
