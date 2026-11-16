const displayFormat=new Intl.NumberFormat('de-DE',{maximumFractionDigits:2,useGrouping:false});
const inputFormat=new Intl.NumberFormat('en-US',{maximumFractionDigits:2,useGrouping:false});

/** Presentation only. Never feed these rounded strings back into geometryFields. */
export function formatGeometry(value:number):string {
  const text=displayFormat.format(value);
  return Number(text.replace(',','.'))===0?'0':text;
}
export function displayedInput(value:string,editing=false):string {
  if(editing||value.trim()===''||!Number.isFinite(Number(value)))return value;
  const text=inputFormat.format(Number(value));
  return Number(text)===0?'0':text;
}
