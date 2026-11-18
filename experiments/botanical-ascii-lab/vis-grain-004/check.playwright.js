async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({width: 1440, height: 900});
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('http://127.0.0.1:8773/vis-grain-004/');
  await page.getByRole('button', {name: 'Abspielen'}).waitFor();
  const labels = await page.locator('figcaption').allTextContents();
  if (new Set(labels).size !== 10 || !['Karotten', 'Rote Bete', 'Buschbohnen', 'Zucchini'].every(label => labels.includes(label))) {
    throw new Error('Ten distinct catalogue cultures expected');
  }
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const grab = () => page.locator('canvas').evaluateAll(items => items.map(item => item.toDataURL()));
  const checkSoil = async (phase, rootsVisible) => {
    const layers = await page.locator('figure').evaluateAll(figures => figures.map(figure => {
      const canvas = figure.querySelector('canvas');
      const sample = new OffscreenCanvas(canvas.width, canvas.height);
      const ctx = sample.getContext('2d', {willReadFrequently: true});
      ctx.drawImage(canvas, 0, 0);
      const ratio = canvas.height / canvas.clientHeight;
      const px = (x, y) => [...ctx.getImageData(Math.round(x), Math.round(y*ratio), 1, 1).data];
      const cutaway = px(canvas.width*.35, 157)[3] !== 0;
      const clearGround = px(canvas.width*.39, 130);
      const shade = px(canvas.width*.52, 130);
      const label = figure.querySelector('figcaption').textContent;
      const isRootCrop = ['Radieschen', 'Zwiebeln', 'Karotten', 'Rote Bete'].includes(label);
      const rootPixels = [];
      if (isRootCrop) {
        for (let y = 131; y <= 151; y++) {
          for (let i = -7; i <= 7; i++) {
            const [red, green, , alpha] = px(canvas.width*.5+i*ratio, y);
            if (alpha === 255 && red > green + 2) rootPixels.push([i, y]);
          }
        }
      }
      return {label, shadow: shade[3] === 255 && shade[0] < clearGround[0], cutaway,
        isRootCrop, rootPixels};
    }));
    if (layers.some(layer => layer.cutaway)) throw new Error('Unexpected soil cross section');
    if (phase === 'mature' && !layers.every(layer => layer.shadow)) throw new Error('Missing ground shadow');
    if (layers.filter(layer => layer.isRootCrop).some(layer => (layer.rootPixels.length > 0) !== rootsVisible)) {
      throw new Error('Incorrect shaded storage organ in ' + phase);
    }
    if (phase === 'mature') {
      const extent = (label, axis) => {
        const values = layers.find(layer => layer.label === label).rootPixels.map(pixel => pixel[axis]);
        return Math.max(...values) - Math.min(...values);
      };
      if (extent('Rote Bete', 0) <= extent('Radieschen', 0) ||
          extent('Karotten', 1) <= extent('Rote Bete', 1)) {
        throw new Error('Relative root widths or lengths are indistinct');
      }
    }
  };
  const still = await grab();
  await checkSoil('mature', true);
  await page.waitForTimeout(650);
  if (JSON.stringify(await grab()) !== JSON.stringify(still)) throw new Error('Reduced motion animated');
  await page.getByRole('button', {name: 'Abspielen'}).click();
  await page.waitForTimeout(1600);
  const moving = await grab();
  if (!moving.every((image, index) => image !== still[index])) throw new Error('A culture did not animate');
  await page.getByRole('button', {name: 'Pausieren'}).click();
  const paused = await grab();
  await page.waitForTimeout(650);
  if (JSON.stringify(await grab()) !== JSON.stringify(paused)) throw new Error('Paused scene animated');
  const screenshot = mode => page.screenshot({
    path: 'experiments/botanical-ascii-lab/.qa/vis-grain-004/preview' + mode + '.png',
    fullPage: true,
  });
  await screenshot('');
  const theme = page.getByRole('button', {name: 'Hellmodus'});
  await theme.click();
  if (await theme.getAttribute('aria-pressed') !== 'true') throw new Error('Light mode not selected');
  const light = await grab();
  if (!light.every((image, index) => image !== paused[index])) throw new Error('Theme did not redraw all cultures');
  await screenshot('-light');
  await checkSoil('mature', true);
  const growth = page.getByLabel('Wachstumsphase');
  const stageImages = [light];
  for (const phase of ['sprout', 'juvenile', 'developing']) {
    await growth.selectOption(phase);
    await page.locator('#growth:enabled').waitFor();
    if (await growth.inputValue() !== phase) throw new Error('Growth atlas failed to load');
    await checkSoil(phase, phase === 'developing');
    stageImages.push(await grab());
    await screenshot('-' + phase + '-light');
  }
  if (!light.every((_, index) => new Set(stageImages.map(images => images[index])).size === 4)) {
    throw new Error('A culture is missing a distinct growth stage');
  }
  await growth.selectOption('mature');
  await page.locator('#growth:enabled').waitFor();
  await page.setViewportSize({width: 390, height: 844});
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile overflow');
  await page.setViewportSize({width: 1440, height: 900});
  await theme.click();
  if (await theme.getAttribute('aria-pressed') !== 'false') throw new Error('Dark mode not restored');
  if (JSON.stringify(await grab()) !== JSON.stringify(paused)) throw new Error('Theme changed the paused pose');
  if (errors.length) throw new Error(errors.join('\n'));
  await page.emulateMedia({reducedMotion: 'no-preference'});
  const beforeGrowth = await grab();
  await growth.selectOption('sprout');
  await page.waitForTimeout(250);
  const growing = await grab();
  await page.waitForTimeout(600);
  const afterGrowth = await grab();
  if (growing[0] === beforeGrowth[0] || growing[0] === afterGrowth[0]) {
    throw new Error('Growth did not render an intermediate size');
  }
  return 'Four gradual sizes across ten cultures, closed beds, shaded roots, both themes and reduced motion checked.';
}
