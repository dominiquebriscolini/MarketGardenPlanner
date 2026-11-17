export function SeasonSlider({min,max,value,label,valueText,onChange,disabled=false}:{min:number;max:number;value:number;label:string;valueText:string;onChange:(value:number)=>void;disabled?:boolean}) {
  return <input className="season-slider" aria-label={label} aria-valuetext={valueText} type="range" min={min} max={max} value={value} disabled={disabled} onChange={event=>onChange(Number(event.target.value))}/>;
}
