import {useEffect,useState} from 'react';
import {checkCultivations} from './cultivationChecks';
import type {CultivationAnalysis} from './cultivationChecks';
import type {Cultivation} from './cultivationModel';

export function useCultivationChecks(entries:Cultivation[]) {
  const key=JSON.stringify(entries);
  const [state,setState]=useState<{key:string;analysis:CultivationAnalysis|null;error:string}>({key:'',analysis:null,error:''});
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>{
      checkCultivations(JSON.parse(key),controller.signal).then(analysis=>{
        if(!controller.signal.aborted)setState({key,analysis,error:''});
      }).catch(error=>{if(!controller.signal.aborted)setState({key,analysis:null,error:error.message});});
    },120);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[key]);
  return state.key===key?state:{analysis:null,error:''};
}
