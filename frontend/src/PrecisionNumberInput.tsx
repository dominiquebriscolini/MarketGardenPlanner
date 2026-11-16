import {useState} from 'react';
import type {InputHTMLAttributes} from 'react';
import {displayedInput} from './geometryDisplay';

type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'|'onBlur'|'type'|'step'> & {
  value:string;onValueChange:(value:string)=>void;
};
export function PrecisionNumberInput({value,onValueChange,...props}:Props) {
  const [editing,setEditing]=useState(false);
  return <input {...props} type="number" step="any" value={displayedInput(value,editing)}
    onChange={event=>{setEditing(true);onValueChange(event.target.value);}}
    onBlur={()=>setEditing(false)}/>;
}
