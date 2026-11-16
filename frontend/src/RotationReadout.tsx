import {tooltipPosition} from './interactions';
import {formatGeometry} from './geometryDisplay';

export type RotationFeedback={x:number;y:number;angle:number;shift:boolean};
export function RotationReadout({value,viewport}:{value:RotationFeedback;viewport:{width:number;height:number}}) {
  const position=tooltipPosition(value,{width:156,height:58},viewport);
  return <output className="rotation-readout" aria-label="Drehwinkel" aria-live="off" style={{left:position.x,top:position.y}}>
    <strong>{formatGeometry(value.angle)}°</strong><small>{value.shift?'Shift · 15°-Raster':'Frei · Shift für 15°'}</small>
  </output>;
}
