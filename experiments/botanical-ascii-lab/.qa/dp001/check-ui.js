async page => {
 const checks=[];const check=(name,ok)=>{checks.push({name,ok});if(!ok)throw new Error(name);};
 const ready=()=>page.waitForFunction(()=>window.dp001&&!window.dp001.state.busy&&!window.dp001.state.benchmarking);
 await ready();await page.setViewportSize({width:1440,height:1000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(await page.evaluate(()=>window.dp001.state.theme)==='light'){await page.locator('#themeSwitch').click();await ready();}
 const initial=await page.evaluate(()=>window.dp001.state);
 if(!initial.paused)await page.locator('#pause').click();
 const serial=await page.evaluate(()=>window.dp001.state.drawSerial);
 await page.waitForTimeout(300);const stable=await page.evaluate(()=>window.dp001.state.drawSerial);await page.waitForTimeout(300);
 check('pause stops redraws',stable===await page.evaluate(()=>window.dp001.state.drawSerial));
 const image=await page.locator('#garden').evaluate(c=>c.toDataURL());
 for(const n of [10,100,30]){await page.locator(`[data-count="${n}"]`).click();check(`${n} instances selectable`,(await page.evaluate(()=>window.dp001.state.count))===n);}
 await page.waitForTimeout(150);check('return to 30 restores paused pixels',image===await page.locator('#garden').evaluate(c=>c.toDataURL()));
 await page.locator('[data-bed="B-04"]').click();check('detail selection',await page.locator('#bedTitle').textContent()==='Beet B-04');
 await page.locator('[data-season="0"]').click();check('spring is explicitly prepared',await page.locator('#stateLabel').textContent()==='Vorbereitet');check('spring hides plants',await page.locator('#plantLabel').textContent()==='0 INSTANZEN');
 await page.locator('[data-season="2"]').click();check('autumn prepared state',await page.locator('#stateLabel').textContent()==='Nach der Saison');
 await page.locator('[data-season="1"]').click();await page.locator('[data-bed="B-01"]').click();
 await page.locator('#themeSwitch').click();await ready();check('theme preserves density, selection, pause',await page.evaluate(()=>{const s=window.dp001.state;return s.count===30&&s.selected==='B-01'&&s.paused&&s.season===1;}));
 await page.screenshot({path:'experiments/botanical-ascii-lab/.qa/dp001/light-30.png'});
 await page.reload();await ready();check('theme survives reload',await page.evaluate(()=>window.dp001.state.theme)!==initial.theme);
 if(!await page.evaluate(()=>window.dp001.state.paused))await page.locator('#pause').click();
 await page.locator('#themeSwitch').click();await ready();check('theme restores original',await page.evaluate(()=>window.dp001.state.theme)===initial.theme);
 await page.screenshot({path:'experiments/botanical-ascii-lab/.qa/dp001/dark-30.png'});
 await page.locator('[data-count="100"]').click();await page.screenshot({path:'experiments/botanical-ascii-lab/.qa/dp001/dark-100.png'});
 await page.locator('[data-count="10"]').click();await page.screenshot({path:'experiments/botanical-ascii-lab/.qa/dp001/dark-10.png'});
 await page.locator('#pause').click();const t=await page.evaluate(()=>window.dp001.state.time);await page.waitForTimeout(400);check('animation advances',await page.evaluate(()=>window.dp001.state.time)>t);
 await page.locator('#pause').click();const beforeWheel=await page.locator('#garden').evaluate(c=>c.toDataURL());await page.locator('#garden').hover();await page.mouse.wheel(0,-150);await page.waitForTimeout(100);check('wheel does not zoom garden',beforeWheel===await page.locator('#garden').evaluate(c=>c.toDataURL()));
 for(const size of [{width:900,height:800},{width:390,height:844}]){await page.setViewportSize(size);await page.waitForTimeout(200);check(`no horizontal overflow ${size.width}`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:`experiments/botanical-ascii-lab/.qa/dp001/viewport-${size.width}.png`,fullPage:true});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await ready();check('reduced motion starts paused',await page.evaluate(()=>window.dp001.state.paused));await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});await page.locator('[data-count="30"]').click();
 check('no application errors',errors.length===0);
 return {checks,errors,environment:await page.evaluate(()=>window.dp001.environment())};
}
