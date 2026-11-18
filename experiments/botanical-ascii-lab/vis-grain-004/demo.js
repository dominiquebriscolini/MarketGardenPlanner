const pause = document.querySelector('#pause');
const theme = document.querySelector('#theme');
const growth = document.querySelector('#growth');
const plots = document.querySelector('#plots');
const status = document.querySelector('#status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function drawShadow(ctx, x, y, [long, short, offset], size, light) {
  ctx.save();
  ctx.translate(x + offset*size, y);
  ctx.scale(long*size, short*size);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, light ? '#303725a6' : '#050805dc');
  gradient.addColorStop(.55, light ? '#30372557' : '#05080590');
  gradient.addColorStop(1, '#00000000');
  ctx.fillStyle = gradient;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function drawUnderground(ctx, x, y, plantScale, [footX, footY], root, light, maturity) {
  const glyphScale = plantScale * 6.3 * maturity;
  const [width, depth] = root.proportions;
  const pitchX = glyphScale*width;
  const pitchY = glyphScale*.86*depth;
  const [shade, highlight] = light ? root.colors.light : root.colors.dark;
  for (const [head, crown] of root.heads) {
    const center = x + (head-footX)*plantScale;
    const crownY = y + (crown-footY)*plantScale;
    const neckWidth = Math.max(.85, glyphScale*.9);
    ctx.fillStyle = highlight;
    ctx.globalAlpha = maturity;
    ctx.fillRect(center, crownY - 1, neckWidth, 4);
    root.marks.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        const mark = row[i];
        if (mark === ' ') continue;
        ctx.fillStyle = mark === '#' ? highlight : shade;
        ctx.globalAlpha = maturity*(mark === '.' ? .75 : 1);
        const stem = mark === '.';
        ctx.fillRect(center + (i-3)*pitchX, crownY + 2 + j*pitchY,
          pitchX*(stem ? .55 : .84), pitchY*(stem ? 1 : .84));
      }
    });
  }
  ctx.globalAlpha = 1;
}

async function start() {
  const [response, presentationResponse] = await Promise.all([
    fetch('./atlas.json'), fetch('./presentation.json'),
  ]);
  if (!response.ok || !presentationResponse.ok) {
    throw new Error('Die Atlas-Zuordnung konnte nicht geladen werden.');
  }
  const [manifest, presentation] = await Promise.all([response.json(), presentationResponse.json()]);
  const ground = presentation.cultures;
  const atlas = new Image();
  atlas.src = new URL(manifest.image, response.url);
  await atlas.decode();
  if (atlas.width !== manifest.width || atlas.height !== manifest.height) {
    throw new Error('Atlas und Zuordnung stimmen nicht überein.');
  }
  const phaseScale = manifest.growthScale;
  let size = phaseScale.mature;
  let growthFrame;
  const cards = Object.entries(manifest.assets).map(([id, asset]) => {
    const figure = document.createElement('figure');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    const caption = document.createElement('figcaption');
    caption.textContent = asset.label;
    figure.append(canvas, caption);
    plots.append(figure);
    return {id, soil: ground[id], canvas, ctx: canvas.getContext('2d')};
  });

  let paused = reduced.matches;
  let light = false;
  let timer;
  let tick = 0;
  const interval = manifest.poseMs / 4;
  const cycle = manifest.sequence.length * 4;

  function draw() {
    const palette = light ? presentation.light : presentation.dark;
    const {minScale, fadeRange, soilVeilOpacity} = presentation.underground;
    for (const {id, soil, canvas, ctx} of cards) {
      const asset = manifest.assets[id];
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(devicePixelRatio, 2);
      const pixelsWide = Math.round(width * ratio);
      const pixelsHigh = Math.round(height * ratio);
      if (canvas.width !== pixelsWide) canvas.width = pixelsWide;
      if (canvas.height !== pixelsHigh) canvas.height = pixelsHigh;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.translate(0, 14);

      const unit = Math.min(width / 3.05, 110);
      const soilTop = 138;
      const faceLeft = width*.16;
      const scale = unit / asset.frames[0].w * asset.previewScale * size;
      const positions = [0, 1, 2].map(i => [(.25 + i*.25) * width, 113 + i*3]);
      const bedColor = light ? '#e6ecdb' : '#222b22';
      ctx.beginPath();
      ctx.moveTo(width*.06, 105);
      ctx.lineTo(width*.82, 105);
      ctx.lineTo(width*.94, soilTop);
      ctx.lineTo(faceLeft, soilTop);
      ctx.closePath();
      ctx.fillStyle = bedColor;
      ctx.strokeStyle = light ? '#a0ad94' : '#566652';
      ctx.fill();
      ctx.stroke();
      ctx.save();
      ctx.clip();
      for (const [x, y] of positions) {
        drawShadow(ctx, x, y, soil.shadow, unit/110*size, light);
      }
      if (soil.underground && size > minScale) {
        const maturity = Math.min(1, (size-minScale)/fadeRange);
        for (const [x, y] of positions) {
          drawUnderground(ctx, x, y, scale, asset.foot, soil.underground, light, maturity);
        }
        // The surface veils the roots without opening the bed geometry.
        ctx.fillStyle = bedColor;
        ctx.globalAlpha = soilVeilOpacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();

      ctx.filter = palette.spriteFilter;
      positions.forEach(([x, y], i) => {
        const name = reduced.matches && paused ? 'center' : manifest.sequence[Math.floor((tick + i*5) / 4) % manifest.sequence.length];
        const frame = asset.frames.find(frame => frame.name === name);
        const left = x - asset.foot[0]*scale;
        const top = y - asset.foot[1]*scale;
        for (let pass = 0; pass < palette.spritePasses; pass++) {
          ctx.drawImage(atlas, frame.x, frame.y, frame.w, frame.h, left, top, frame.w*scale, frame.h*scale);
        }
      });
      ctx.filter = 'none';
    }
  }

  function playback() {
    clearInterval(timer);
    pause.textContent = paused ? 'Abspielen' : 'Pausieren';
    if (!paused && !document.hidden) {
      timer = setInterval(() => {
        tick = (tick + 1) % cycle;
        draw();
      }, interval);
    }
  }

  theme.onclick = () => {
    light = !light;
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    theme.setAttribute('aria-pressed', String(light));
    draw();
  };
  pause.onclick = () => {
    paused = !paused;
    draw();
    playback();
  };
  growth.value = 'mature';
  growth.onchange = () => {
    cancelAnimationFrame(growthFrame);
    const target = phaseScale[growth.value];
    if (reduced.matches) {
      size = target;
      draw();
      return;
    }
    const from = size;
    const startTime = performance.now();
    function grow(now) {
      const progress = Math.min(1, (now-startTime)/720);
      const ease = progress*progress*(3-2*progress);
      size = from + (target-from)*ease;
      draw();
      if (progress < 1) growthFrame = requestAnimationFrame(grow);
    }
    growthFrame = requestAnimationFrame(grow);
  };
  document.addEventListener('visibilitychange', playback);
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      paused = true;
      cancelAnimationFrame(growthFrame);
      size = phaseScale[growth.value];
    }
    draw();
    playback();
  });

  const resize = new ResizeObserver(draw);
  cards.forEach(({canvas}) => resize.observe(canvas));
  draw();
  theme.disabled = false;
  pause.disabled = false;
  growth.disabled = false;
  status.textContent = 'Schematische Größenstufen · Unterirdische Pflanzenteile gedämpft dargestellt';
  playback();
}

start().catch(error => {
  status.textContent = error.message;
  console.error(error);
});
