import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Demo } from './types';
import type { Point } from './interactions';
import { clampWindowPosition, forecastWindowLayout } from './forecastModel';
import { Forecast } from './Forecast';

export function ForecastWindow({data,day,position,onPosition,onClose}: {
  data:Demo; day:string; position:Point|null; onPosition:(point:Point)=>void; onClose:()=>void;
}) {
  const ref = useRef<HTMLElement>(null);
  const drag = useRef<{id:number;start:Point;origin:Point}|null>(null);
  const [viewport,setViewport] = useState({width:window.innerWidth,height:window.innerHeight});
  const [size,setSize] = useState({width:340,height:226});
  const [dragging,setDragging] = useState(false);
  const layout = forecastWindowLayout(viewport,size.height);
  const point = clampWindowPosition(position??layout.initial,size,viewport);
  useEffect(()=>{
    const resize=()=>setViewport({width:window.innerWidth,height:window.innerHeight});
    window.addEventListener('resize',resize);
    return ()=>window.removeEventListener('resize',resize);
  },[]);
  useLayoutEffect(()=>{
    const node=ref.current;
    if(!node)return;
    const measure=()=>{
      const rect=node.getBoundingClientRect();
      setSize(old=>old.width===rect.width&&old.height===rect.height?old:{width:rect.width,height:rect.height});
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(node);
    return ()=>observer.disconnect();
  },[day,viewport.width,viewport.height]);
  return <aside ref={ref} className={`forecast-overlay floating ${dragging?'window-dragging':''}`}
    aria-label="Ernteprognose" style={{left:point.x,top:point.y,width:layout.width,maxHeight:layout.maxHeight}}
    onPointerDown={event=>event.stopPropagation()}>
    <div className="forecast-window-header">
      <div className="forecast-drag-handle" role="button" tabIndex={0} aria-label="Ernteprognose verschieben"
        title="Am Titel ziehen · Pfeiltasten verschieben das Fenster"
        onPointerDown={event=>{
          if(event.button!==0)return;
          event.preventDefault();event.stopPropagation();
          drag.current={id:event.pointerId,start:{x:event.clientX,y:event.clientY},origin:point};
          event.currentTarget.setPointerCapture(event.pointerId);setDragging(true);
        }}
        onPointerMove={event=>{
          const d=drag.current;if(!d||d.id!==event.pointerId)return;
          onPosition(clampWindowPosition({x:d.origin.x+event.clientX-d.start.x,y:d.origin.y+event.clientY-d.start.y},size,viewport));
        }}
        onPointerUp={event=>{
          drag.current=null;setDragging(false);
          if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onPointerCancel={()=>{drag.current=null;setDragging(false);}}
        onKeyDown={event=>{
          if(event.key==='Escape'){event.stopPropagation();onClose();return;}
          const delta=event.shiftKey?50:10;
          const offsets:Record<string,Point>={ArrowLeft:{x:-delta,y:0},ArrowRight:{x:delta,y:0},ArrowUp:{x:0,y:-delta},ArrowDown:{x:0,y:delta}};
          const offset=offsets[event.key];
          if(offset){event.preventDefault();event.stopPropagation();onPosition(clampWindowPosition({x:point.x+offset.x,y:point.y+offset.y},size,viewport));}
        }}>
        <span className="drag-grip" aria-hidden="true">⠿</span><h2>Ernteprognose</h2>
      </div>
      <button className="close-button" aria-label="Ernteprognose schließen" onClick={onClose}>×</button>
    </div>
    <div className="forecast-window-body"><Forecast data={data} day={day}/></div>
  </aside>;
}
