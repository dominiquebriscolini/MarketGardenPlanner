import {useEffect,useState} from 'react';
import type {SavedProject} from './projectView';
import {loadProjectSeason,readSeasonPreference,writeSeasonPreference} from './projectSeason';
import type {ProjectSeasonData,SeasonPreference} from './projectSeason';

export function useProjectSeason(project:SavedProject|null) {
  const [selection,setSelection]=useState<{id:string;value:SeasonPreference}|null>(null);
  const [retry,setRetry]=useState(0);
  const [state,setState]=useState<{key:string;data:ProjectSeasonData|null;error:string}>({key:'',data:null,error:''});
  const preference=project?(selection?.id===project.project_id?selection.value:readSeasonPreference(project.project_id)):null;
  const year=preference?.year??null;
  const base=project?`${project.project_id}:${project.revision_id}:${retry}`:'';
  const key=project?`${base}:${year}`:'';
  const data=state.key.startsWith(`${base}:`)&&state.data&&(year===null||state.data.iso_year===year)?state.data:null;
  const error=state.key===key?state.error:'';
  useEffect(()=>{
    if(!project||data)return;
    const controller=new AbortController();
    loadProjectSeason(project,year,controller.signal).then(data=>{
      if(!controller.signal.aborted)setState({key,data,error:''});
    }).catch(error=>{if(!controller.signal.aborted)setState({key,data:null,error:error.message});});
    return ()=>controller.abort();
  },[key]);
  const week=data?.weeks[Math.min((preference?.week??data.initial_week),data.weeks.length)-1];
  const choose=(selectedYear:number,selectedWeek:number)=>{
    if(!project)return;
    const value={year:selectedYear,week:selectedWeek};
    setSelection({id:project.project_id,value});writeSeasonPreference(project.project_id,value);
  };
  return {frame:data&&week?{season:data,week}:undefined,error,loading:!!project&&!data&&!error,
    retry:()=>setRetry(v=>v+1),choose,
    step:(delta:number)=>{if(!data||!week)return;const next=week.iso_week+delta;
      if(next<1){if(data.iso_year>1)choose(data.iso_year-1,53);}
      else if(next>data.weeks.length){if(data.iso_year<9998)choose(data.iso_year+1,1);}
      else choose(data.iso_year,next);},
  };
}
