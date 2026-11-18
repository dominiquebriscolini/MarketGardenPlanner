// Extract JSON from saved Playwright CLI responses. No packages required.
import {readFileSync,writeFileSync} from 'node:fs';
for(const name of ['performance-dark','performance-light','quality-results','ui-results','regression-results','runtime-results']){
 const path=new URL(`./${name}.txt`,import.meta.url),raw=readFileSync(path,'utf8'),json=raw.split('### Result')[1]?.split('### Ran Playwright code')[0]?.trim();
 if(!json)throw new Error(`Missing result: ${name}`);
 const data=JSON.parse(json);writeFileSync(new URL(`./${name}.json`,import.meta.url),JSON.stringify(data,null,2)+'\n');
 console.log(name,Array.isArray(data)?data.map(r=>`${r.path}: ${r.passed}`).join(', '):data.checks?`${data.checks.length} checks`:data.results.length+' measurements');
}
