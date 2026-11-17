import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Demo,fmt,stages} from './types';
import {Plot} from './Plot';
import {Details} from './Details';
import {ProjectDetails} from './ProjectDetails';
import {ForecastWindow} from './ForecastWindow';
import {Point,seasonStep} from './interactions';
import {ProjectSummary,SavedProject,demoToMap,projectToMap} from './projectView';
import {getJSON,listProjects,loadProject} from './projectClient';
import {useBedEditor} from './useBedEditor';
import {EditorControls} from './EditorControls';
import {DeleteBedDialog} from './DeleteBedDialog';
import {deleteShortcut} from './geometryForm';
import {useProjectSeason} from './useProjectSeason';
import {ProjectSeasonBar} from './ProjectSeasonBar';
import {SeasonSlider} from './SeasonSlider';

export function App() {
  const [data,setData]=useState<Demo|null>(null),[demoError,setDemoError]=useState('');
  const [mode,setMode]=useState('demo'),[project,setProject]=useState<SavedProject|null>(null);
  const [catalog,setCatalog]=useState<ProjectSummary[]>([]),[listError,setListError]=useState(''),[listLoading,setListLoading]=useState(true);
  const [projectError,setProjectError]=useState(''),[projectLoading,setProjectLoading]=useState(false),[refresh,setRefresh]=useState(0);
  const [cultivationBusy,setCultivationBusy]=useState(false);
  const cultivationWorking=useRef(false);
  const onCultivationBusy=useCallback((value:boolean)=>{cultivationWorking.current=value;setCultivationBusy(value);},[]);
  const [index,setIndex]=useState(101),[selected,setSelected]=useState<string|null>(null);
  const [legendOpen,setLegendOpen]=useState(false),[forecastOpen,setForecastOpen]=useState(false);
  const [forecastPosition,setForecastPosition]=useState<Point|null>(null);
  useEffect(()=>{
    const controller=new AbortController();setDemoError('');
    getJSON('/api/demo',controller.signal).then(value=>setData(value as Demo)).catch(e=>{if(!controller.signal.aborted)setDemoError(String(e.message));});
    return ()=>controller.abort();
  },[refresh]);
  useEffect(()=>{
    const controller=new AbortController();setListLoading(true);setListError('');
    listProjects(controller.signal).then(value=>{if(!controller.signal.aborted)setCatalog(value);})
      .catch(e=>{if(!controller.signal.aborted)setListError(e.message);})
      .finally(()=>{if(!controller.signal.aborted)setListLoading(false);});
    return ()=>controller.abort();
  },[refresh]);
  useEffect(()=>{
    const controller=new AbortController();setProjectError('');setProject(null);
    if(mode==='demo'){setProjectLoading(false);return ()=>controller.abort();}
    setProjectLoading(true);
    loadProject(mode,controller.signal).then(value=>{if(!controller.signal.aborted)setProject(value);})
      .catch(e=>{if(!controller.signal.aborted)setProjectError(e.message);})
      .finally(()=>{if(!controller.signal.aborted)setProjectLoading(false);});
    return ()=>controller.abort();
  },[mode,refresh]);
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!e.defaultPrevented&&!cultivationWorking.current){setSelected(null);setForecastOpen(false);}};
    let narrow=window.innerWidth<=600;
    const onResize=()=>{const next=window.innerWidth<=600;if(next!==narrow){setForecastPosition(null);narrow=next;}};
    window.addEventListener('keydown',onKey);window.addEventListener('resize',onResize);
    return ()=>{window.removeEventListener('keydown',onKey);window.removeEventListener('resize',onResize);};
  },[]);
  const demoMode=mode==='demo';
  const activeProject=project?.project_id===mode?project:null;
  const projectSeason=useProjectSeason(activeProject);
  const seasonMessage=projectSeason.error?'Wochenstatus nicht verfügbar':projectSeason.loading?'Wochenstatus wird geladen …':undefined;
  const onSaved=useCallback((saved:SavedProject,bedId:string|null)=>{
    setProject(saved);setSelected(bedId);
    const {geometry:_,...summary}=saved;
    setCatalog(items=>items.map(p=>p.project_id===saved.project_id?summary:p));
  },[]);
  const bedEditor=useBedEditor(activeProject,onSaved);
  const editor={...bedEditor,busy:bedEditor.busy||cultivationBusy};
  const selectBed=(id:string|null)=>{if(!cultivationWorking.current)setSelected(id);};
  useEffect(()=>{
    const remove=(event:KeyboardEvent)=>{
      const active=document.activeElement;
      const input=active instanceof HTMLElement&&(active.isContentEditable||!!active.closest('input,textarea,select,[role="textbox"]'));
      const bed=activeProject?.geometry.beds.find(b=>b.object_id===selected);
      if(bed&&!editor.busy&&!editor.deleteTarget&&deleteShortcut(event,input)){event.preventDefault();editor.requestDelete(bed);}
    };
    window.addEventListener('keydown',remove);return ()=>window.removeEventListener('keydown',remove);
  },[activeProject,selected,editor]);
  const geometry=useMemo(()=>demoMode?(data?demoToMap(data):null):(activeProject?projectToMap(activeProject):null),[demoMode,data,activeProject?.geometry]);
  const day=data?.days[index];
  const occupied=day?Object.values(day.beds).filter(b=>b.stage!=='free').length:0;
  const step=(delta:number)=>{if(data)setIndex(i=>seasonStep(i,delta,data.days.length));};
  const changeMode=(value:string)=>{setSelected(null);setForecastOpen(false);setForecastPosition(null);setMode(value);};
  const reload=()=>{setSelected(null);setRefresh(v=>v+1);};
  const title=demoMode?'Versuchsfeld Nord':activeProject?.name||'Gespeichertes Projekt';
  const synthetic=activeProject&&/syntheti/i.test([activeProject.name,activeProject.geometry.parcel.source_reference,...activeProject.geometry.beds.map(b=>b.source_reference)].join(' '));
  const mapError=demoMode?demoError:projectError;
  return <main className={`map-app ${forecastOpen&&demoMode?'forecast-open':''} ${demoMode?'demo-mode':'project-mode'}`}>
    {geometry&&<Plot key={mode} geometry={geometry} data={demoMode?data??undefined:undefined} index={index} selected={selected} onSelect={selectBed} editor={activeProject?editor:undefined} season={projectSeason.frame} seasonMessage={seasonMessage}/>}
    {!geometry&&<div className="map-message floating" role={mapError?'alert':'status'}>
      <h2>{mapError?'Ansicht konnte nicht geladen werden':projectLoading?'Projekt wird geladen …':'Daten werden geladen …'}</h2>
      <p>{mapError||'Die Karte erscheint nach dem Laden.'}</p>{mapError&&<button onClick={reload}>Erneut versuchen</button>}
    </div>}
    <div className="top-left-stack">
      <header className="project-title floating"><span className="eyebrow">MARKET GARDEN / {demoMode?'SAISONATLAS':'PROJEKTANSICHT'}</span>
        <h1 title={title}>{title}{demoMode&&<span>2026</span>}</h1>
        <p className={demoMode||synthetic?'demo-notice':'project-notice'}>{demoMode?'Demo-Modus · synthetische Daten · schreibgeschützt':synthetic?'Synthetisches Testprojekt':'Gespeichertes Projekt'}</p>
        {activeProject&&<p className="project-parcel" title={activeProject.project_id}>{activeProject.geometry.parcel.name||'Grundstück'} · {activeProject.geometry.beds.length} Beete</p>}
        <div className="project-picker"><label className="sr-only" htmlFor="project-choice">Ansicht / Projekt</label>
          <select id="project-choice" value={mode} disabled={editor.busy} onChange={e=>changeMode(e.target.value)}>
            <option value="demo">Demo · Saison 2026 (synthetisch)</option>
            {mode!=='demo'&&!catalog.some(p=>p.project_id===mode)&&<option value={mode}>Ausgewähltes Projekt</option>}
            {catalog.map(p=><option key={p.project_id} value={p.project_id}>{p.name} · {p.project_id.slice(0,8)}</option>)}
          </select><button aria-label="Projektliste neu laden" disabled={editor.busy} onClick={reload}>↻</button>
        </div>
        {listLoading&&<p className="catalog-message" role="status">Projektliste wird geladen …</p>}
        {!listLoading&&listError&&<p className="catalog-message error" role="alert">{listError}</p>}
        {!listLoading&&!listError&&catalog.length===0&&<p className="catalog-message" role="status">Noch keine Projekte gespeichert. Demo ist verfügbar.</p>}
      </header>
      <div className="map-secondary"><div className="legend floating">
        <button aria-expanded={legendOpen} aria-controls="legend-items" onClick={()=>setLegendOpen(v=>!v)}><span className="legend-icon" aria-hidden="true">◫</span> Legende <span>{legendOpen?'−':'+'}</span></button>
        {legendOpen&&<div id="legend-items">{demoMode?Object.entries(stages).map(([key,label])=><span key={key}><i className={key}/>{label}</span>):<>
          <span><i className="planned-week"/>Geplante Belegung</span><span><i className="overlap-week"/>Zeitliche Überlagerung</span><span><i className="uncertain-week"/>Ende offen / unklar</span>
          <span><i className="unplanned"/>Ohne aktive Planungsabschnitte</span><span><i className="hole"/>Grundstücksaussparung</span></>}
          <small>{demoMode?'Schematische Planphasen':'Wochenplanung · keine Wachstumssimulation'}</small></div>}
      </div><button className="floating forecast-toggle" aria-expanded={demoMode&&forecastOpen} disabled={!demoMode||!data} title={demoMode?'':'Keine Scheduler-Ergebnisse für dieses Projekt'} onClick={()=>setForecastOpen(v=>!v)}>Ernteprognose ↗</button></div>
      {activeProject&&<EditorControls editor={editor}/>}
    </div>
    {demoMode&&data&&selected&&<Details data={data} index={index} selected={selected} onClose={()=>setSelected(null)}/>}
    {!demoMode&&activeProject&&selected&&<ProjectDetails project={activeProject} selected={selected} onClose={()=>selectBed(null)} editor={editor} cultivationBusy={cultivationBusy} onCultivationBusy={onCultivationBusy} onSaved={onSaved} season={projectSeason.frame} seasonMessage={seasonMessage}/>}
    {activeProject&&editor.deleteTarget&&<DeleteBedDialog editor={editor}/>}
    {demoMode&&data&&day&&forecastOpen&&<ForecastWindow data={data} day={day.date} position={forecastPosition} onPosition={setForecastPosition} onClose={()=>setForecastOpen(false)}/>}
    {demoMode&&data&&day?<section className="season floating" aria-label="Saisonsteuerung"><div className="season-head">
      <div className="season-date"><span className="eyebrow">SAISONZEITPUNKT</span><strong>{fmt(day.date)}</strong></div><span className="occupancy">{occupied} / {data.geometry.beds.length} Beete belegt</span>
      <div className="date-navigation"><button aria-label="Eine Woche zurück" disabled={index===0} onClick={()=>step(-7)}>− Woche</button><button aria-label="Eine Woche vor" disabled={index===data.days.length-1} onClick={()=>step(7)}>+ Woche</button>
        <input aria-label="Datum wählen" type="date" min={data.days[0].date} max={data.days.at(-1)!.date} value={day.date} onChange={e=>{const i=data.days.findIndex(d=>d.date===e.target.value);if(i>=0)setIndex(i);}}/></div>
      </div><SeasonSlider label="Saisontag" valueText={fmt(day.date)} min={0} max={data.days.length-1} value={index} onChange={setIndex}/>
      <div className="months">{['MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV'].map(m=><span key={m}>{m}</span>)}</div>
    </section>:!demoMode&&activeProject&&<ProjectSeasonBar controller={projectSeason}/>}
  </main>;
}
