import type {SpatialBed} from './projectView';
import {rotationHandle} from './editingGeometry';

export function RotationHandle({bed,metresPerPixel}:{bed:SpatialBed;metresPerPixel:number}) {
  const {base,tip,radius}=rotationHandle(bed,metresPerPixel);
  return <g className="rotation-handle" data-rotation-handle={bed.object_id} role="button" tabIndex={0}
    aria-label={`Beet drehen: ${bed.name||'Beet'}`} onClick={event=>event.stopPropagation()}>
    <title>Zum Drehen ziehen · Shift für 15°-Schritte · Winkel alternativ im Detailpanel eingeben</title>
    <line x1={base.x} y1={-base.y} x2={tip.x} y2={-tip.y} pointerEvents="none"/>
    <circle cx={tip.x} cy={-tip.y} r={radius*1.8} fill="transparent" stroke="none"/>
    <circle className="rotation-knob" cx={tip.x} cy={-tip.y} r={radius}/>
  </g>;
}
