import {useEffect,useRef,useState} from 'react';
import {commitCultivation,loadCultures,validateCultivation} from './cultivationClient';
import type {CultureProfile,Cultivation,CultivationValues} from './cultivationClient';
import type {SavedProject} from './projectView';
import {fmt} from './types';
import {cultivationName,relationDescription} from './cultivationChecks';
import {useCultivationChecks} from './useCultivationChecks';
import {CultivationReview} from './CultivationReview';

export function CultivationPanel({project,bedId,disabled,busy,onBusy,onSaved}:{project:SavedProject;bedId:string;disabled:boolean;busy:boolean;
  onBusy:(value:boolean)=>void;onSaved:(project:SavedProject,bedId:string)=>void}) {
  const [profiles,setProfiles]=useState<CultureProfile[]>([]),[catalogueError,setCatalogueError]=useState(''),[reload,setReload]=useState(0);
  const [editing,setEditing]=useState<string|null>(null),[values,setValues]=useState<CultivationValues>({profile_id:'',establishment:'direct',start_date:'',planned_harvest_date:null});
  const [remove,setRemove]=useState<string|null>(null),[message,setMessage]=useState(''),[error,setError]=useState('');
  const working=useRef(false);
  const [checksOpen,setChecksOpen]=useState(false);
  const previewId=useRef(crypto.randomUUID());
  useEffect(()=>{
    const controller=new AbortController();setCatalogueError('');
    loadCultures(controller.signal).then(setProfiles).catch(e=>{if(!controller.signal.aborted)setCatalogueError(e.message);});
    return ()=>controller.abort();
  },[reload]);
  const entries=project.cultivation_plan?.entries.filter(e=>e.bed_id===bedId).slice().sort((a,b)=>a.start_date.localeCompare(b.start_date)||a.cultivation_id.localeCompare(b.cultivation_id))??[];
  const name=(e:Cultivation)=>cultivationName(e,profiles);
  const preview=editing!==null&&!validateCultivation(values);
  const checkedEntries=preview?[
    ...entries.filter(e=>e.cultivation_id!==editing),
    {...values,cultivation_id:editing==='new'?previewId.current:editing!,revision_id:previewId.current,bed_id:bedId,input_status:'user_input' as const},
  ]:entries;
  const checks=useCultivationChecks(checkedEntries);
  const begin=(entry?:Cultivation)=>{
    setError('');setMessage('');setRemove(null);setEditing(entry?.cultivation_id??'new');
    setValues(entry?{profile_id:entry.profile_id,establishment:entry.establishment,start_date:entry.start_date,planned_harvest_date:entry.planned_harvest_date}:
      {profile_id:'',establishment:'direct',start_date:'',planned_harvest_date:null});
  };
  const save=async(operation:'add'|'update'|'delete',id:string|null)=>{
    if(working.current||disabled)return;
    working.current=true;onBusy(true);setError('');setMessage('Speicherung wird bestätigt …');
    try {
      const saved=await commitCultivation(project,bedId,operation,operation==='delete'?null:values,id,crypto.randomUUID());
      onSaved(saved,bedId);setEditing(null);setRemove(null);setMessage(operation==='delete'?'Anbauvorgang entfernt.':'Anbauvorgang gespeichert.');
    } catch(e) {setMessage('');setError(`Speicherung nicht bestätigt. ${e instanceof Error?e.message:String(e)} Gespeicherten Stand mit ↻ neu laden, bevor Sie erneut speichern.`);}
    finally {working.current=false;onBusy(false);}
  };
  return <section className="cultivation-panel" aria-label="Kulturplanung">
    <div className="cultivation-heading"><h3>Kulturplanung <span>{entries.length}</span></h3>
      {project.cultivation_plan&&editing===null&&<button className="add-cultivation" disabled={busy||disabled||!profiles.length} onClick={()=>begin()}>+ Kultur hinzufügen</button>}
    </div>
    {!project.cultivation_plan?<p role="alert">Kulturplanung fehlt in der API. Python-Server neu starten und Projekt neu laden.</p>:<>
      {catalogueError&&<p className="form-error" role="alert">{catalogueError} <button onClick={()=>setReload(v=>v+1)}>Katalog erneut laden</button></p>}
      {!entries.length&&<p className="cultivation-empty">Noch keine Anbauvorgänge für dieses Beet.</p>}
      <ol className="cultivation-list">{entries.map(entry=>{
        const related=checks.analysis?.relations.filter(r=>r.cultivation_ids.includes(entry.cultivation_id))??[];
        const overlaps=related.some(r=>r.kind==='overlap');
        return <li key={entry.cultivation_id} className={related.length?(overlaps?'has-overlap':'has-unknown'):undefined}>
        <div className="cultivation-row-head"><strong title={entry.profile_id}>{name(entry)}</strong>
          <div className="cultivation-row-actions"><button disabled={busy||disabled} onClick={()=>begin(entry)} aria-label={`${name(entry)} bearbeiten`} title="Anbauvorgang bearbeiten">Bearbeiten</button>
          <button disabled={busy||disabled} onClick={()=>{setRemove(entry.cultivation_id);setEditing(null);setError('');}} aria-label={`${name(entry)} entfernen`} title="Anbauvorgang entfernen">Entfernen</button></div></div>
        <dl className="cultivation-dates"><div><dt>{entry.establishment==='direct'?'Direktsaat':'Pflanzung'}</dt><dd><time dateTime={entry.start_date}>{fmt(entry.start_date)}</time></dd></div>
          <div><dt>Ernte geplant</dt><dd>{entry.planned_harvest_date?<time dateTime={entry.planned_harvest_date}>{fmt(entry.planned_harvest_date)}</time>:<span className="date-open" title="Ernte noch nicht geplant; das Ende bleibt unbekannt.">offen</span>}</dd></div></dl>
        {related.length>0&&<button className={`cultivation-warning ${overlaps?'overlap':'unknown'}`} onClick={()=>setChecksOpen(v=>!v)} aria-controls="cultivation-checks" aria-expanded={checksOpen}
          title={related.map(r=>relationDescription(r,checkedEntries,profiles)).join(' ')}>{overlaps?'Überschneidung':'Überschneidung unklar'} ↗</button>}
        {remove===entry.cultivation_id&&<div className="cultivation-confirm"><p>Anbauvorgang endgültig entfernen?</p>
          <button disabled={busy||disabled} onClick={()=>void save('delete',entry.cultivation_id)}>Entfernen bestätigen</button> <button disabled={busy} onClick={()=>setRemove(null)}>Abbrechen</button></div>}
      </li>;})}</ol>
      <CultivationReview analysis={checks.analysis} entries={checkedEntries} profiles={profiles} open={checksOpen} onToggle={setChecksOpen} preview={preview}/>
      {checks.error&&<p className="form-error" role="alert">Datumsprüfung nicht verfügbar. {checks.error} Speichern bleibt möglich.</p>}
      {preview&&!checks.analysis&&!checks.error&&<p className="check-status" role="status">Termine werden geprüft …</p>}
      {editing!==null&&
        <form className="cultivation-form" aria-label={editing==='new'?'Anbauvorgang hinzufügen':'Anbauvorgang bearbeiten'} onSubmit={event=>{event.preventDefault();void save(editing==='new'?'add':'update',editing==='new'?null:editing);}}>
          <fieldset disabled={busy||disabled}><legend>{editing==='new'?'Neuer Anbauvorgang':'Anbauvorgang bearbeiten'}</legend>
            <label>Kultur / Katalogprofil<select aria-label="Kultur / Katalogprofil" required value={values.profile_id} onChange={event=>{
              const profile=profiles.find(p=>p.profile_id===event.target.value);
              setValues(v=>({...v,profile_id:profile?.profile_id??'',establishment:profile?.establishment??'direct'}));
            }}><option value="">Kultur auswählen …</option>{profiles.map(p=><option key={p.profile_id} value={p.profile_id}>{p.name}{p.variety_name?` · ${p.variety_name}`:''} · {p.profile_id}</option>)}</select></label>
            <label>Anbauart<select aria-label="Anbauart" value={values.establishment} onChange={event=>setValues(v=>({...v,establishment:event.target.value as CultivationValues['establishment']}))}>
              <option value="direct" disabled={profiles.find(p=>p.profile_id===values.profile_id)?.establishment==='transplant'}>Direktsaat</option>
              <option value="transplant" disabled={profiles.find(p=>p.profile_id===values.profile_id)?.establishment==='direct'}>Pflanzung</option></select></label>
            <label>{values.establishment==='direct'?'Aussaat ins Beet':'Pflanzung ins Beet'}<input aria-label="Aussaat- oder Pflanzdatum" required type="date" value={values.start_date} onChange={event=>setValues(v=>({...v,start_date:event.target.value}))}/></label>
            <label>Geplante Ernte (optional)<input aria-label="Geplantes Erntedatum" type="date" min={values.start_date||undefined} value={values.planned_harvest_date??''} onChange={event=>setValues(v=>({...v,planned_harvest_date:event.target.value||null}))}/></label>
          </fieldset>
          <p className="geometry-hint">Termine sind Ihre Planung. Überschneidungen bleiben erlaubt; Ernte ist kein Räumdatum.</p>
          <div className="cultivation-actions"><button type="submit" disabled={busy||disabled||!!validateCultivation(values)}>Anbauvorgang speichern</button>
            <button type="button" disabled={busy} onClick={()=>{setEditing(null);setError('');}}>Abbrechen</button></div>
        </form>}
      {message&&<p className={busy?'check-status':'sr-only'} role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
      <details className="planning-notes"><summary>Hinweise zur Planung</summary><p>Nutzereingaben · keine Ertragsprognose. Kulturdefinitionen: Python-Katalog. Datumsprüfung nur bis zur geplanten Ernte, einschließlich dieses Tages. Ohne Ernte ist nur der Starttag bekannt. Ernte ist kein Räumdatum; spätere Beetverfügbarkeit wird nicht bestätigt.</p></details>
    </>}
  </section>;
}
