// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from '../editor/editor.js';
import { createEngine } from './engine.js';
import { createP5 } from './p5init.js';
import { createAudio } from '../audio/audio.js';
import { createTimeline, FIRST_BEAT } from '../audio/timeline.js';
import { compile } from './compiler.js';
import { stdlib, setP5, updateReactiveState } from './stdlib.js';
import { probe } from './probe.js';
import { DEMOS } from './demos.js';
import { updateLoopTime } from '../audio/intervals.js';
import { listSketches, saveSketch, loadSketch } from './sketch-store.js';
import { createDemoSelector } from './demo-selector.js';
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

// ── Demo + sketch selector ──

let currentSketchName = null;

const selector = createDemoSelector(
  document.getElementById('demo-select'),
  DEMOS,
  listSketches
);

selector.onChange((val) => {
  if (val.startsWith('demo:')) {
    currentSketchName = val.slice(5);
    editor.setCode(DEMOS[currentSketchName]);
    run();
  } else if (val.startsWith('sketch:')) {
    currentSketchName = val.slice(7);
    const code = loadSketch(currentSketchName);
    if (code == null) return;
    editor.setCode(code);
    run();
  }
});

function save() {
  let name = currentSketchName;
  if (!name) { name = prompt('Save sketch as:'); if (!name) return; }
  saveSketch(name, editor.getCode());
  currentSketchName = name;
  selector.rebuild('sketch:' + name);
  selector.select('sketch:' + name);
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
const audioTimeEl = document.getElementById('audio-time');

function fmtTime(s) {
  return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

engine.onPreTick = (t) => {
  updateLoopTime(audio.isLoaded ? t - FIRST_BEAT : t);
};

engine.onTick = (t) => {
  timeDisplay.textContent = 't = ' + t.toFixed(2);
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

editor.setCode(DEMOS[Object.keys(DEMOS)[0]]);
run();
engine.start();
