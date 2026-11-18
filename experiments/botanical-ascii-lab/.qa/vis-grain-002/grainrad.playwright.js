async page => {
  const output = 'experiments/botanical-ascii-lab/.qa/vis-grain-002/';
  const tomato = 'design/references/02_vegetation/{C9BFABF6-B80E-4268-ADBD-E2BF970A8116}.png';
  const results = [];
  for (const name of ['clean-1.png', 'clean-2.png', 'clean-3.png', 'clean-1.gif', 'clean-2.gif']) {
    const isGif = name.endsWith('.gif');
    await page.goto('https://grainrad.com/');
    await page.locator('input[type=file]').setInputFiles(isGif ? output + 'tomato-input.gif' : tomato);
    await page.getByRole('button', { name: /Dithering$/ }).click();
    await page.getByRole('button', { name: /ASCII$/i }).click();
    await page.getByRole('button', { name: /^\+ Post-Processing$/ }).click();
    const grainLabel = page.getByText('Grain', { exact: true });
    const grainCheck = grainLabel.locator('..').locator('svg');
    if (await grainCheck.count()) await grainLabel.click();
    if (await grainCheck.count()) throw new Error('Grain remains enabled');
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.waitForFunction(() => Array.from(document.querySelectorAll('main canvas')).some(canvas => canvas.width === 460 && canvas.height === 576));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    if (isGif) await page.getByRole('button', { name: 'GIF .gif', exact: true }).click();
    const downloaded = page.waitForEvent('download', { timeout: 60000 });
    await page.getByRole('button', { name: isGif ? 'Export GIF' : 'Export PNG', exact: true }).click();
    const file = await downloaded;
    await file.saveAs(output + name);
    results.push({ name, download: file.suggestedFilename(), failure: await file.failure() });
  }
  return { browser: await page.evaluate(() => navigator.userAgent), results };
}
