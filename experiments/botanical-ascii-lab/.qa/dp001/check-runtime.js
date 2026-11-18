async page => {
 const checks=[];const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw new Error(name);};
 const ready=()=>page.waitForFunction(()=>window.dp001&&!window.dp001.state.busy&&!window.dp001.state.benchmarking);
 await ready();
 await page.evaluate(async()=>{const {VisibilityBuffer}=await import('./visibility.js?v=light03');window.dpBuildCalls=0;window.dpOriginalBuild=VisibilityBuffer.prototype.build;VisibilityBuffer.prototype.build=function(...args){window.dpBuildCalls++;return window.dpOriginalBuild.apply(this,args);};});
 if(await page.evaluate(()=>window.dp001.state.paused))await page.locator('#pause').click();
 const before=await page.evaluate(()=>window.dp001.state.drawSerial);await page.waitForTimeout(800);
 check('animation draws cached images without geometry build',await page.evaluate(before=>window.dp001.state.drawSerial>before&&window.dpBuildCalls===0,before));
 await page.locator('[data-count="100"]').click();await page.waitForTimeout(200);
 check('100 instances retain same shared atlas without geometry build',await page.evaluate(()=>window.dpBuildCalls===0&&window.dp001.state.atlasRgbaBytes===20*144*180*4));
 await page.locator('#diagnostics').evaluate(e=>e.open=true);await page.locator('#frames').selectOption('12');await ready();
 check('12 frames built once for all 100 instances',await page.evaluate(()=>window.dpBuildCalls===12&&window.dp001.state.frames===12&&window.dp001.state.count===100));
 await page.locator('#themeSwitch').click();await ready();
 check('theme replaces common set with 12 builds',await page.evaluate(()=>window.dpBuildCalls===24&&window.dp001.state.frames===12));
 await page.locator('#themeSwitch').click();await ready();await page.locator('#frames').selectOption('20');await ready();
 const saved=await page.evaluate(()=>window.dp001.state);
 await page.evaluate(()=>{window.dpAbortResult=null;window.dp001.benchmark(10000,[8]).then(()=>window.dpAbortResult='unexpected success').catch(e=>window.dpAbortResult=e.message);});
 await page.waitForFunction(()=>window.dp001.state.benchmarking&&!window.dp001.state.busy);
 await page.waitForTimeout(600);
 // Controlled visibility-event injection; tests the cancellation path, not OS tab policy.
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;});
 await ready();check('hidden-tab signal rejects measurement',await page.evaluate(()=>/verworfen/.test(window.dpAbortResult)));
 check('aborted benchmark restores scenario and frame set',await page.evaluate(saved=>{const s=window.dp001.state;return s.count===saved.count&&s.season===saved.season&&s.paused===saved.paused&&s.frames===saved.frames;},saved));
 const downloadPromise=page.waitForEvent('download');
 // Short smoke run for export only; not included in performance results.
 await page.evaluate(()=>window.dp001.benchmark(200,[20]));await page.locator('#download').click();const download=await downloadPromise;
 await download.saveAs('experiments/botanical-ascii-lab/.qa/dp001/export-smoke.json');check('JSON download produced',download.suggestedFilename()==='dp001-performance.json');
 await page.evaluate(async()=>{const {VisibilityBuffer}=await import('./visibility.js?v=light03');VisibilityBuffer.prototype.build=window.dpOriginalBuild;});
 const context=await page.context().browser().newContext({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
 try{const retina=await context.newPage();await retina.goto('http://127.0.0.1:8773/dp001.html');await retina.waitForFunction(()=>window.dp001&&!window.dp001.state.busy);const env=await retina.evaluate(()=>window.dp001.environment());check('DPR2 backing canvas and pause',env.renderDpr===2&&env.canvasBacking[0]===env.canvasCss[0]*2&&await retina.evaluate(()=>window.dp001.state.paused));}
 finally{await context.close();}
 await page.locator('[data-count="30"]').click();await page.locator('#diagnostics').evaluate(e=>e.open=false);
 return {checks};
}
