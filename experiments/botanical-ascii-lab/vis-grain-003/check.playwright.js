async page => {
  const base = 'http://127.0.0.1:8773/';
  const qa = 'experiments/botanical-ascii-lab/.qa/vis-grain-003/';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + 'vis-grain-003/');
  await page.waitForFunction(() => window.grain003?.state.draws > 0);
  assert(await page.evaluate(() => grain003.state.paused), 'Reduced motion did not start paused');
  await page.getByRole('button', { name: 'Abspielen' }).click();
  const observations = await page.evaluate(async () => {
    const timeline = new Map();
    const until = performance.now() + 5100;
    while (performance.now() < until) {
      const { tick, frames } = grain003.state;
      timeline.set(tick, frames);
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    return [...timeline.entries()];
  });
  assert(observations.length === 20, 'Expected a full cycle');
  assert(observations.every(([, frames]) => frames.length === 10 && new Set(frames).size === 3),
    'Expected ten instances in staggered poses');
  for (let plant = 0; plant < 10; plant++) {
    assert(new Set(observations.map(([, frames]) => frames[plant])).size === 3, 'A plant did not visit all poses');
  }
  await page.getByRole('button', { name: 'Pausieren' }).click();
  const before = await page.evaluate(() => grain003.state.draws);
  await page.waitForTimeout(500);
  assert(await page.evaluate(() => grain003.state.draws) === before, 'Paused view still drawing');
  await page.screenshot({ path: qa + 'demo-dark.png' });
  await page.getByRole('button', { name: 'Heller Grund' }).click();
  assert(await page.locator('canvas').getAttribute('data-light') !== null, 'Light canvas missing');
  await page.screenshot({ path: qa + 'demo-light.png' });
  await page.setViewportSize({ width: 390, height: 780 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'Mobile viewport overflows');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  const taskTime = async () => (await cdp.send('Performance.getMetrics')).metrics
    .find(metric => metric.name === 'TaskDuration').value;
  const results = [];
  for (const variant of ['VIS-GRAIN-003', 'DP-001', 'VIS-001']) {
    const path = { 'VIS-GRAIN-003': 'vis-grain-003/', 'DP-001': 'dp001.html', 'VIS-001': '' }[variant];
    await page.goto(base + path);
    if (variant === 'VIS-GRAIN-003') {
      await page.waitForFunction(() => window.grain003?.state.draws > 0);
    } else if (variant === 'DP-001') {
      await page.waitForFunction(() => window.dp001?.state.frames && !dp001.state.busy);
      await page.locator('[data-count="10"]').click();
      await page.locator('#diagnostics summary').click();
      await page.locator('#frames').selectOption('8');
      await page.waitForFunction(() => window.dp001?.state.frames === 8 && !dp001.state.busy);
    } else {
      await page.locator('[data-variant="A"]').click();
      await page.locator('[data-mode="ascii"]').click();
      await page.waitForFunction(() => window.labStats?.mode === 'ascii' && labStats.plants === 10);
    }
    await page.waitForTimeout(600);
    const taskStart = await taskTime();
    const trace = await page.evaluate(async variant => {
      const read = {
        'VIS-GRAIN-003': () => [grain003.state.draws, grain003.state.drawMs, grain003.state.atlasRgbaBytes],
        'DP-001': () => [dp001.state.drawSerial, dp001.state.drawMs, dp001.state.atlasRgbaBytes],
        'VIS-001': () => [labStats.renderSerial, labStats.ms, null],
      }[variant];
      const canvas = document.querySelector(variant === 'DP-001' ? '#garden' : 'canvas');
      const [initial] = read();
      let previous = initial;
      const times = [];
      const start = performance.now();
      let elapsed;
      do {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const [serial, ms] = read();
        if (previous !== serial) times.push(ms);
        previous = serial;
        elapsed = performance.now() - start;
      } while (elapsed < 5000);
      times.sort((a, b) => a - b);
      return { variant, elapsed, frames: previous - initial, samples: times.length,
        drawMeanMs: times.reduce((a, b) => a + b, 0) / times.length,
        drawP95Ms: times[Math.ceil(times.length * .95) - 1],
        canvas: [canvas.width, canvas.height], atlasRgbaBytes: read()[2],
        viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, userAgent: navigator.userAgent };
    }, variant);
    const taskEnd = await taskTime();
    assert(trace.samples > 0, variant + ' did not animate');
    results.push({ ...trace, taskDurationMs: (taskEnd - taskStart) * 1000 });
  }
  await cdp.detach();
  assert(errors.length === 0, errors.join('\n'));
  const downloadEvent = page.waitForEvent('download');
  await page.evaluate(results => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'benchmark.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, results);
  await (await downloadEvent).saveAs(qa + 'benchmark.json');
  return { playbackTicks: observations.length, plants: 10, results };
}
