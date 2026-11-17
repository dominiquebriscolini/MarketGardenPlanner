export type CultureProfile={profile_id:string;species_id:string;name:string;variety_id:string|null;variety_name:string|null;establishment:'direct'|'transplant'};
export type CultivationValues={profile_id:string;establishment:'direct'|'transplant';start_date:string;planned_harvest_date:string|null};
export type Cultivation= CultivationValues & {cultivation_id:string;revision_id:string;bed_id:string;input_status:'user_input'};
export type CultivationPlan={schema_version:1;revision_id:string;entries:Cultivation[]};
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
export function validCalendarDate(value:unknown):value is string {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000'))return false;
  const date=new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value;
}
export function validateCultivation(values:CultivationValues):string {
  if(!values.profile_id||!['direct','transplant'].includes(values.establishment))return 'Bitte eine Kultur mit passender Anbauart auswählen.';
  if(!validCalendarDate(values.start_date))return 'Bitte ein gültiges Aussaat- oder Pflanzdatum eingeben.';
  if(values.planned_harvest_date!==null&&(!validCalendarDate(values.planned_harvest_date)||values.planned_harvest_date<values.start_date))return 'Geplante Ernte muss am oder nach dem Startdatum liegen.';
  return '';
}
export function decodeCultivationPlan(value:any,bedIds:string[]):asserts value is CultivationPlan {
  if(!value||value.schema_version!==1||!uuid(value.revision_id)||!Array.isArray(value.entries))throw Error('Ungültiger Kulturplan der API.');
  const ids=new Set();
  for(const e of value.entries) {
    if(!e||!uuid(e.cultivation_id)||!uuid(e.revision_id)||!bedIds.includes(e.bed_id)||ids.has(e.cultivation_id)||e.input_status!=='user_input'||typeof e.profile_id!=='string'||validateCultivation(e))throw Error('Ungültiger Anbauvorgang der API.');
    ids.add(e.cultivation_id);
  }
}
