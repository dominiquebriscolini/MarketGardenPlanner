async page => {
 const results=[];
 for(const path of ['test.html','light-test.html','depth-test.html','theme-test.html','vis001-render-test.html','vis001-test.html']){
  await page.goto(`http://127.0.0.1:8773/${path}`);
  await page.waitForFunction(()=>/COMPLETE|ERROR/.test(document.getElementById('results')?.textContent??''),{},{timeout:120000});
  const text=await page.locator('#results').textContent();results.push({path,passed:(text.match(/^PASS/gm)||[]).length,failed:/ERROR|FAIL/.test(text),text});
  if(/ERROR|FAIL/.test(text))throw new Error(`${path}: ${text}`);
 }
 return results;
}
