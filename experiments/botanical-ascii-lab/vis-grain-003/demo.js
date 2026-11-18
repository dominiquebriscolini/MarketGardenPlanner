const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const caption = document.querySelector('figcaption');
const pause = document.querySelector('#pause');
const background = document.querySelector('#background');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const sequence = [1, 0, 1, 2];
const intervalMs = 240;
const ticksPerPose = 5;
const plants = [
  [.12, .56, 0], [.30, .56, 6], [.48, .56, 14], [.66, .56, 2], [.84, .56, 10],
  [.18, .90, 16], [.36, .90, 8], [.54, .90, 4], [.72, .90, 18], [.90, .90, 12],
];

let paused = reducedMotion.matches;
let tick = 0;
let timer;
let deadline;
let draws = 0;
let drawMs = 0;

async function start() {
  const response = await fetch('./atlas.json');
  if (!response.ok) throw new Error('Die Atlas-Zuordnung konnte nicht geladen werden.');
  const atlas = await response.json();
  const image = new Image();
  image.src = new URL(atlas.image, response.url);
  await image.decode();
  if (image.width !== atlas.width || image.height !== atlas.height || atlas.frames.length !== 3) {
    throw new Error('Atlas und Zuordnung stimmen nicht überein.');
  }

  function frameAt(phase) {
    return sequence[Math.floor((tick + phase) / ticksPerPose) % sequence.length];
  }

  function draw() {
    const started = performance.now();
    const scale = canvas.height * .42 / atlas.foot[1];
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const [x, y, phase] of plants) {
      const frame = atlas.frames[frameAt(phase)];
      context.drawImage(image, frame.x, frame.y, frame.w, frame.h,
        x * canvas.width - atlas.foot[0] * scale, y * canvas.height - atlas.foot[1] * scale,
        frame.w * scale, frame.h * scale);
    }
    drawMs = performance.now() - started;
    draws++;
  }

  function advance() {
    const now = performance.now();
    if (now >= deadline) {
      const elapsed = Math.floor((now - deadline) / intervalMs) + 1;
      tick = (tick + elapsed) % (sequence.length * ticksPerPose);
      deadline += elapsed * intervalMs;
      draw();
    }
    timer = setTimeout(advance, Math.max(1, deadline - performance.now()));
  }

  function updatePlayback() {
    clearTimeout(timer);
    pause.textContent = paused ? 'Abspielen' : 'Pausieren';
    if (!paused && !document.hidden) {
      deadline = performance.now() + intervalMs;
      timer = setTimeout(advance, intervalMs);
    }
  }

  new ResizeObserver(() => {
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    draw();
  }).observe(canvas);
  pause.disabled = false;
  pause.onclick = () => {
    paused = !paused;
    updatePlayback();
  };
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) paused = true;
    updatePlayback();
  });
  window.grain003 = {
    get state() {
      return { paused, tick, draws, drawMs, frames: plants.map(plant => frameAt(plant[2])),
        canvas: [canvas.width, canvas.height], atlasRgbaBytes: image.width * image.height * 4 };
    },
  };
  caption.textContent = 'Zehn Pflanzen · Drei Windhaltungen · Synthetische Testszene';
  updatePlayback();
}

background.onclick = () => {
  const light = canvas.toggleAttribute('data-light');
  background.setAttribute('aria-pressed', String(light));
};
start().catch(error => {
  caption.textContent = error.message;
  console.error(error);
});
