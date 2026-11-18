import {useEffect,useRef,useState} from 'react';
import {commitCultivation,loadCultures,validateCultivation} from './cultivationClient';
import type {CultureProfile,Cultivation,CultivationValues} from './cultivationClient';
import type {SavedProject} from './projectView';
import {fmt} from './types';
import {cultivationName,relationDescription} from './cultivationChecks';
import {useCultivationChecks} from './useCultivationChecks';
import {CultivationReview} from './CultivationReview';
import type {PlantingLayout,WeeklyBed} from './projectSeason';

const yieldFormat=new Intl.NumberFormat('de-DE',{maximumSignificantDigits:2});

export function CultivationFormTitle({entry,profiles}:{entry?:Cultivation;profiles:CultureProfile[]}) {
  return <legend id="cultivation-form-title" className="cultivation-form-title">
    <span>{entry?`${cultivationName(entry,profiles)} bearbeiten`:'Kultur hinzufügen'}</span>
    {entry&&<small>{entry.establishment==='direct'?'Direktsaat':'Pflanzung'} · <time dateTime={entry.start_date}>{fmt(entry.start_date)}</time></small>}
  </legend>;
}

export function CultivationPanel({project,bedId,disabled,busy,onBusy,onSaved,layouts,weekState,readOnly=false}:{project:SavedProject;bedId:string;disabled:boolean;busy:boolean;readOnly?:boolean;layouts?:Record<string,PlantingLayout|null>;weekState?:WeeklyBed;
  onBusy:(value:boolean)=>void;onSaved:(project:SavedProject,bedId:string)=>void}) {
  const [profiles,setProfiles]=useState<CultureProfile[]>([]),[catalogueError,setCatalogueError]=useState(''),[reload,setReload]=useState(0);
  const [editing,setEditing]=useState<string|null>(null),[values,setValues]=useState<CultivationValues>({profile_id:'',establishment:'direct',start_date:'',planned_harvest_date:null});
  const [rowText,setRowText]=useState('');
  const [remove,setRemove]=useState<string|null>(null),[message,setMessage]=useState(''),[error,setError]=useState('');
  const working=useRef(false);
  const autosave=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [saving,setSaving]=useState(false),[inputError,setInputError]=useState('');
  useEffect(()=>()=>{if(autosave.current!==null)clearTimeout(autosave.current);},[]);
  const [checksOpen,setChecksOpen]=useState(false);
  const previewId=useRef(crypto.randomUUID());
  useEffect(()=>{
    const controller=new AbortController();setCatalogueError('');
    loadCultures(controller.signal).then(setProfiles).catch(e=>{if(!controller.signal.aborted)setCatalogueError(e.message);});
    return ()=>controller.abort();
  },[reload]);
  const entries=project.cultivation_plan?.entries.filter(e=>e.bed_id===bedId).slice().sort((a,b)=>a.start_date.localeCompare(b.start_date)||a.cultivation_id.localeCompare(b.cultivation_id))??[];
  const name=(e:Cultivation)=>cultivationName(e,profiles);
  const editingEntry=entries.find(entry=>entry.cultivation_id===editing);
  const preview=!readOnly&&editing!==null&&!validateCultivation(values);
  const checkedEntries=preview?[
    ...entries.filter(e=>e.cultivation_id!==editing),
    {...values,cultivation_id:editing==='new'?previewId.current:editing!,revision_id:previewId.current,bed_id:bedId,input_status:'user_input' as const},
  ]:entries;
  const checks=useCultivationChecks(checkedEntries);
  const begin=(entry?:Cultivation)=>{
    setError('');setInputError('');setMessage('');setRemove(null);setEditing(entry?.cultivation_id??'new');
    setRowText(entry?.row_numbers?.join(', ')??'');
    setValues(entry?{row_numbers:entry.row_numbers??null,profile_id:entry.profile_id,establishment:entry.establishment,start_date:entry.start_date,planned_harvest_date:entry.planned_harvest_date}:
      {profile_id:'',establishment:'direct',start_date:'',planned_harvest_date:null,row_numbers:null});
  };
  const save=async(operation:'add'|'update'|'delete',id:string|null,next:CultivationValues|null)=>{
    if(readOnly||working.current||disabled){onBusy(false);return;}
    working.current=true;setSaving(true);onBusy(true);setError('');setMessage('Wird gespeichert …');
    try {
      const saved=await commitCultivation(project,bedId,operation,next,id,crypto.randomUUID());
      onSaved(saved,bedId);
      if(operation==='add') {
        const previous=new Set(entries.map(entry=>entry.cultivation_id));
        const created=saved.cultivation_plan?.entries.find(entry=>entry.bed_id===bedId&&!previous.has(entry.cultivation_id));
        setEditing(created?.cultivation_id??null);
      }
      setRemove(null);setMessage(operation==='delete'?'Anbauvorgang entfernt.':'Automatisch gespeichert.');
    } catch(e) {
      setMessage('');
      setError(`Speicherung nicht bestätigt. ${e instanceof Error?e.message:String(e)} Der gespeicherte Stand lässt sich mit ↻ neu laden.`);
    } finally {working.current=false;setSaving(false);onBusy(false);}
  };

  const change=(next:CultivationValues,inputProblem='')=>{
    if(working.current||readOnly||disabled||editing===null)return;
    if(autosave.current!==null)clearTimeout(autosave.current);
    autosave.current=null;
    setValues(next);setError('');setMessage('');
    const invalid=inputProblem||validateCultivation(next);
    setInputError(invalid||'');
    const changed=!editingEntry||Object.entries(next).some(
      ([key,value])=>key==='row_numbers'
        ?JSON.stringify(editingEntry.row_numbers??null)!==JSON.stringify(value??null)
        :editingEntry[key as keyof CultivationValues]!==value,
    );
    if(invalid||!changed){onBusy(false);return;}
    onBusy(true);setMessage('Automatische Speicherung ausstehend …');
    autosave.current=setTimeout(()=>{
      autosave.current=null;
      void save(editing==='new'?'add':'update',editing==='new'?null:editing,next);
    },650);
  };

  return <section className="cultivation-panel" aria-label="Kulturplanung">
    <div className="cultivation-heading"><h3>Kulturplanung <span>{entries.length}</span></h3>
      {!readOnly&&project.cultivation_plan&&editing===null&&<button className="add-cultivation" disabled={busy||disabled||!profiles.length} onClick={()=>begin()}>+ Kultur hinzufügen</button>}
    </div>
    {!project.cultivation_plan?<p role="alert">Kulturplanung fehlt in der API. Python-Server neu starten und Projekt neu laden.</p>:<>
      {catalogueError&&<p className="form-error" role="alert">{catalogueError} <button onClick={()=>setReload(v=>v+1)}>Katalog erneut laden</button></p>}
      {!entries.length&&<p className="cultivation-empty">Noch keine Anbauvorgänge für dieses Beet.</p>}
      <ol className="cultivation-list">{entries.map(entry=>{
        const related=checks.analysis?.relations.filter(r=>r.cultivation_ids.includes(entry.cultivation_id))??[];
        const rowConflict=weekState?.row_layout_issue&&weekState.active_ids.includes(entry.cultivation_id);
        const layout=rowConflict?undefined:layouts?.[entry.cultivation_id];
        const area=entry.row_numbers?'Zugeordnete Reihen':'Ganzes Beet';
        const estimate=layout?.reference_yield;
        const overlaps=related.some(r=>r.kind==='overlap');
        const isEditing=!readOnly&&entry.cultivation_id===editingEntry?.cultivation_id;
        return <li key={entry.cultivation_id} data-cultivation-id={entry.cultivation_id} aria-current={isEditing?'true':undefined}
          className={[related.length?(overlaps?'has-overlap':'has-unknown'):'',isEditing?'is-editing':''].filter(Boolean).join(' ')||undefined}>
        <div className="cultivation-row-head"><strong title={entry.profile_id}>{name(entry)}</strong>
          {!readOnly&&<div className="cultivation-row-actions"><button disabled={busy||disabled} onClick={()=>begin(entry)} aria-label={`${name(entry)} bearbeiten`} title="Anbauvorgang bearbeiten">Bearbeiten</button>
          <button disabled={busy||disabled} onClick={()=>{setRemove(entry.cultivation_id);setEditing(null);setError('');}} aria-label={`${name(entry)} entfernen`} title="Anbauvorgang entfernen">Entfernen</button></div>}</div>
        <dl className="cultivation-dates"><div><dt>{entry.establishment==='direct'?'Direktsaat':'Pflanzung'}</dt><dd><time dateTime={entry.start_date}>{fmt(entry.start_date)}</time></dd></div>
          <div><dt>Ernte geplant</dt><dd>{entry.planned_harvest_date?<time dateTime={entry.planned_harvest_date}>{fmt(entry.planned_harvest_date)}</time>:<span className="date-open" title="Ernte noch nicht geplant; das Ende bleibt unbekannt.">offen</span>}</dd></div></dl>
        {entry.row_numbers&&<p className="geometry-hint">Reihen von links: {entry.row_numbers.join(', ')}</p>}
        {layout&&<p className="geometry-hint planting-layout"
          title={`Reihenabstand ${layout.row_spacing_m.toLocaleString('de-DE')} m (${layout.row_spacing_status}): ${layout.row_spacing_source}\nPflanzabstand ${layout.plant_spacing_m.toLocaleString('de-DE')} m (${layout.plant_spacing_status}): ${layout.plant_spacing_source}`}>
          {area} · {layout.rows} {layout.rows===1?'Reihe':'Reihen'} × {layout.positions_per_row} Plätze · {layout.capacity} Pflanzplätze
        </p>}
        {estimate&&<p className="geometry-hint reference-yield">
          {area} · Referenzschätzung: {yieldFormat.format(estimate.min_kg)}
          {estimate.min_kg!==estimate.max_kg&&`–${yieldFormat.format(estimate.max_kg)}`} kg
          {estimate.multiple_cuts?' über mehrere Schnitte':''} ·{' '}
          <a href={estimate.source} target="_blank" rel="noreferrer" title={estimate.scope}>Quelle (Minnesota)</a>
        </p>}
        {layout&&estimate===null&&<p className="geometry-hint reference-yield">Keine passende Ertragsreferenz.</p>}
        {layout===null&&<p className="geometry-hint planting-layout">Pflanzabstände fehlen.</p>}
        {related.length>0&&<button className={`cultivation-warning ${overlaps?'overlap':'unknown'}`} onClick={()=>setChecksOpen(v=>!v)} aria-controls="cultivation-checks" aria-expanded={checksOpen}
          title={related.map(r=>relationDescription(r,checkedEntries,profiles)).join(' ')}>{overlaps?'Überschneidung':'Überschneidung unklar'} ↗</button>}
        {!readOnly&&remove===entry.cultivation_id&&<div className="cultivation-confirm"><p>Anbauvorgang endgültig entfernen?</p>
          <button disabled={busy||disabled} onClick={()=>void save('delete',entry.cultivation_id,null)}>Entfernen bestätigen</button> <button disabled={busy} onClick={()=>setRemove(null)}>Abbrechen</button></div>}
      </li>;})}</ol>
      <CultivationReview analysis={checks.analysis} entries={checkedEntries} profiles={profiles} open={checksOpen} onToggle={setChecksOpen} preview={preview}/>
      {checks.error&&<p className="form-error" role="alert">Datumsprüfung nicht verfügbar. {checks.error} Speichern bleibt möglich.</p>}
      {preview&&!checks.analysis&&!checks.error&&<p className="check-status" role="status">Termine werden geprüft …</p>}
      {!readOnly&&(editing==='new'||editingEntry)&&
        <form className="cultivation-form" aria-labelledby="cultivation-form-title" data-cultivation-id={editingEntry?.cultivation_id} onSubmit={event=>event.preventDefault()}>
          <fieldset disabled={saving||disabled}><CultivationFormTitle entry={editingEntry} profiles={profiles}/>
            <label>Kultur / Katalogprofil<select aria-label="Kultur / Katalogprofil" required value={values.profile_id} onChange={event=>{
              const profile=profiles.find(p=>p.profile_id===event.target.value);
              change({...values,profile_id:profile?.profile_id??'',establishment:profile?.establishment??'direct'});
            }}><option value="">Kultur auswählen …</option>{profiles.map(p=><option key={p.profile_id} value={p.profile_id}>{p.name}{p.variety_name?` · ${p.variety_name}`:''} · {p.profile_id}</option>)}</select></label>
            <label>Anbauart<select aria-label="Anbauart" value={values.establishment} onChange={event=>change({...values,establishment:event.target.value as CultivationValues['establishment']})}>
              <option value="direct" disabled={profiles.find(p=>p.profile_id===values.profile_id)?.establishment==='transplant'}>Direktsaat</option>
              <option value="transplant" disabled={profiles.find(p=>p.profile_id===values.profile_id)?.establishment==='direct'}>Pflanzung</option></select></label>
            <label>{values.establishment==='direct'?'Aussaat ins Beet':'Pflanzung ins Beet'}<input aria-label="Aussaat- oder Pflanzdatum" required type="date" value={values.start_date} onChange={event=>change({...values,start_date:event.target.value},event.target.validity.badInput?'Bitte das Datum vollständig eingeben.':'')}/></label>
            <label>Geplante Ernte (optional)<input aria-label="Geplantes Erntedatum" type="date" min={values.start_date||undefined} value={values.planned_harvest_date??''} onChange={event=>change({...values,planned_harvest_date:event.target.value||null},event.target.validity.badInput?'Bitte das Datum vollständig eingeben.':'')}/></label>
            <label>Reihen von links <input aria-label="Reihen von links" placeholder="z. B. 1, 3, 5" value={rowText} onChange={event=>{
              const text=event.target.value;setRowText(text);
              const parts=text.trim()?text.split(',').map(part=>part.trim()):[];
              const rows=parts.map(Number).sort((a,b)=>a-b);
              const invalid=parts.some(part=>!/^\d+$/.test(part));
              change({...values,row_numbers:rows.length?rows:null},invalid?'Bitte Reihennummern durch Kommas trennen.':'');
            }}/></label>
            <small>Nummern bestimmen die Reihenfolge. Leer bedeutet ganzes Beet.</small>
          </fieldset>
          <p className="geometry-hint">Termine sind Ihre Planung. Überschneidungen bleiben erlaubt; Ernte ist kein Räumdatum.</p>
          {inputError&&<p className="form-error" role="status">{inputError}</p>}
          <div className="cultivation-actions">
            <button type="button" disabled={busy} onClick={()=>{setEditing(null);setInputError('');setError('');setMessage('');}}>Fertig</button>
          </div>
        </form>}
      {!readOnly&&message&&<p className="check-status" role="status">{message}</p>}{!readOnly&&error&&<p className="form-error" role="alert">{error}</p>}
      <details className="planning-notes"><summary>Hinweise zur Planung</summary><p>Nutzereingaben · keine Ertragsprognose. Kulturdefinitionen: Python-Katalog. Datumsprüfung nur bis zur geplanten Ernte, einschließlich dieses Tages. Ohne Ernte ist nur der Starttag bekannt. Ernte ist kein Räumdatum; spätere Beetverfügbarkeit wird nicht bestätigt.</p></details>
    </>}
  </section>;
}
