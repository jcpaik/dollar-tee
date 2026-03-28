// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from '../editor/editor.js';
import { createEngine } from './engine.js';
import { createP5 } from './p5init.js';
import { createAudio } from '../audio/audio.js';
import { createTimeline, FIRST_BEAT } from '../audio/timeline.js';
import { compile } from './compiler.js';
import { stdlib, setP5, updateReactiveState } from './stdlib.js';
import { probe } from './probe.js';
import { updateLoopTime } from '../audio/intervals.js';
import { fetchSketches, listSketches, getSketchCode, saveSketch } from './sketch-store.js';
import { createSketchSelector } from './demo-selector.js';
import { setupTransport } from './transport-ui.js';

// ── Create subsystems ──

const p5Instance = await createP5(document.getElementById('canvas-pane'));
setP5(p5Instance);

const engine   = createEngine(p5Instance.canvas, p5Instance);
const audio    = createAudio();
const timeline = createTimeline(document.getElementById('beat-grid'));

// ── Editor + compile ──

const editor   = createEditor(document.getElementById('editor-container'));
const errorBar = document.getElementById('error-bar');

const stateStdlib = {
  clear(key) { engine.clearState(key); },
  clearAll() { engine.clearAll(); },
};

function run() {
  probe.clear();
  try {
    const allStdlib = Object.defineProperties(
      { ...stateStdlib },
      Object.getOwnPropertyDescriptors(stdlib)
    );
    const drawFn = compile(editor.getCode(), allStdlib, engine.getState(), p5Instance);
    updateReactiveState(engine.getTime(), p5Instance.width, p5Instance.height, p5Instance);
    drawFn(engine.getCtx());
    engine.setDraw(drawFn);
    errorBar.style.display = 'none';
  } catch (e) {
    errorBar.textContent = e.message;
    errorBar.style.display = 'block';
  }
}

// ── Auto-run with debounce ──

const autoRunBox = document.getElementById('auto-run');
let debounceTimer = null;
editor.onChange(() => {
  if (autoRunBox.checked) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 300);
  }
});
editor.onSliderChange(() => run());

// ── Sketch selector ──

let currentSketchName = null;

await fetchSketches();

const selector = createSketchSelector(
  document.getElementById('demo-select'),
  listSketches
);
selector.rebuild();

selector.onChange((name) => {
  currentSketchName = name;
  const code = getSketchCode(name);
  if (code == null) return;
  editor.setCode(code);
  run();
});

async function save() {
  let name = currentSketchName;
  if (!name) { name = prompt('Save sketch as:'); if (!name) return; }
  await saveSketch(name, editor.getCode());
  currentSketchName = name;
  selector.rebuild(name);
  selector.select(name);
}

// ── Keyboard shortcuts ──

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); }
});

// ── Canvas resize ──

function resize() {
  const pane = document.getElementById('canvas-pane');
  p5Instance.resizeCanvas(pane.clientWidth, pane.clientHeight);
}
resize();
window.addEventListener('resize', resize);

// ── Transport ──

setupTransport({ audio, engine, timeline, onResize: resize });

// ── Engine callbacks ──

const timeDisplay = document.getElementById('time-display');
const fpsDisplay  = document.getElementById('fps-display');
const audioTimeEl = document.getElementById('audio-time');

let frameCount = 0;
let lastFpsTime = performance.now();

function fmtTime(s) {
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

engine.onPreTick = (t) => {
  updateLoopTime(audio.isLoaded ? t - FIRST_BEAT : t);
};

engine.onTick = (t) => {
  timeDisplay.textContent = 't = ' + t.toFixed(2);
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    fpsDisplay.textContent = frameCount + ' fps | draw ' + engine.getDrawMs().toFixed(1) + 'ms';
    frameCount = 0;
    lastFpsTime = now;
  }
  if (audio.isLoaded) {
    timeline.update(audio.time);
    audioTimeEl.textContent = fmtTime(audio.time) + ' / ' + fmtTime(audio.duration);
  }
};

engine.onError = (e) => {
  errorBar.textContent = e.message;
  errorBar.style.display = 'block';
};

// ── Boot ──

const firstName = listSketches()[0];
if (firstName) {
  currentSketchName = firstName;
  editor.setCode(getSketchCode(firstName));
  selector.select(firstName);
}
run();
engine.start();
