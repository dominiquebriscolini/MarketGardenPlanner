async page => {
  const folder = 'experiments/botanical-ascii-lab/.qa/vis-grain-003/';
  const results = [];
  for (const pose of ['left', 'center', 'right']) {
    await page.goto('https://grainrad.com/');
    await page.locator('input[type=file]').setInputFiles(folder + pose + '-input.png');
    await page.getByRole('button', { name: /Dithering$/ }).click();
    await page.getByRole('button', { name: /ASCII$/i }).click();
    await page.getByRole('button', { name: /^\+ Post-Processing$/ }).click();
    const grain = page.getByText('Grain', { exact: true });
    const check = grain.locator('..').locator('svg');
    if (await check.count()) await grain.click();
    if (await check.count()) throw new Error('Grain remains enabled');
    const background = page.getByText('Background', { exact: true }).locator('..');
    const hexInput = background.locator('input[type=text]');
    for (const [name, hex] of [['black', '#000000'], ['white', '#FFFFFF']]) {
      await hexInput.fill(hex);
      await hexInput.press('Tab');
      if ((await background.locator('input[type=color]').inputValue()).toLowerCase() !== hex.toLowerCase()) {
        throw new Error('Grainrad rejected background ' + hex);
      }
      await page.evaluate(() => document.fonts.ready.then(() => true));
      await page.waitForFunction(() => [...document.querySelectorAll('main canvas')].some(c => c.width === 460 && c.height === 576));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const pending = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export PNG', exact: true }).click();
      const download = await pending;
      await download.saveAs(folder + pose + '-' + name + '.png');
      if (await download.failure()) throw new Error('PNG download failed');
      results.push([pose, name]);
    }
  }
  return results;
}
