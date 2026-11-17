import {relationDescription} from './cultivationChecks';
import type {CultivationAnalysis} from './cultivationChecks';
import type {Cultivation,CultureProfile} from './cultivationModel';

export function CultivationReview({analysis,entries,profiles,open,onToggle,preview=false}:{analysis:CultivationAnalysis|null;entries:Cultivation[];profiles:CultureProfile[];open:boolean;onToggle:(open:boolean)=>void;preview?:boolean}) {
  if(!analysis?.relations.length)return null;
  const overlaps=analysis.relations.filter(r=>r.kind==='overlap').length,unknown=analysis.relations.length-overlaps;
  return <details id="cultivation-checks" className="cultivation-review" open={open} onToggle={event=>onToggle(event.currentTarget.open)}>
    <summary>{[overlaps?`${overlaps} ${overlaps===1?'Überschneidung':'Überschneidungen'}`:'',unknown?`${unknown} unklar`:''].filter(Boolean).join(' · ')}{preview?' · Entwurf':''}</summary>
    <ul>{analysis.relations.map(r=><li key={r.cultivation_ids.join(':')}>{relationDescription(r,entries,profiles)}</li>)}</ul>
    <p>Hinweis, kein Verbot: Mischkulturen bleiben möglich. Geplante Ernte ist kein Räumdatum.</p>
  </details>;
}
