async page => {
  const input = '~/Documents/MarketGardenPlanner/design/references/02_vegetation/{C9BFABF6-B80E-4268-ADBD-E2BF970A8116}.png';
  const output = '~/Documents/MarketGardenPlanner/experiments/botanical-ascii-lab/.qa/vis-grain-002/';
  const results = [];
  for (let run = 1; run <= 3; run++) {
    await page.goto('https://grainrad.com/');
    await page.locator('input[type=file]').setInputFiles(input);
    await page.getByRole('button', {name: /Dithering/}).click();
    await page.getByRole('button', {name: /ASCII$/i}).click();
    const settings = await page.locator('[role=slider],input[type=range]').evaluateAll(nodes => nodes.map(e => e.value ?? e.getAttribute('aria-valuenow')));
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForFunction(() => [...document.querySelectorAll('main canvas')].some(canvas => canvas.width > 300 && canvas.height > 150));
    await page.waitForTimeout(1000);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export PNG', exact: true}).click();
    await (await downloadPromise).saveAs(output + 'stable-' + run + '.png');
    results.push({run, settings, preview: await page.locator('main').innerText()});
  }
  return results;
}
