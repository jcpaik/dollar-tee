// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from './editor.js';
import { createEngine } from './engine.js';
import { createP5 } from './p5init.js';
import { createAudio } from './audio.js';
import { createTimeline, FIRST_BEAT } from './timeline.js';
import { compile } from './compiler.js';
import { stdlib, setP5, updateReactiveState } from './stdlib.js';
import { probe } from './probe.js';
import { DEMOS } from './demos.js';
import { updateLoopTime } from './intervals.js';

// ── DOM refs ──

const editorEl    = document.getElementById('editor-container');
const errorBar    = document.getElementById('error-bar');
const demoSelect  = document.getElementById('demo-select');
const autoRunBox  = document.getElementById('auto-run');
const timeDisplay = document.getElementById('time-display');

// Transport DOM refs
const audioFileInput = document.getElementById('audio-file');
const musicToggle    = document.getElementById('music-toggle');
const playBtn        = document.getElementById('play-btn');
const audioTimeEl    = document.getElementById('audio-time');
const snapBtn        = document.getElementById('snap-btn');
const transportEl    = document.getElementById('transport');
const transportSash  = document.getElementById('transport-sash');

// ── p5 + Engine + Audio + Timeline ──

const p5Instance = await createP5(document.getElementById('canvas-pane'));
const canvas     = p5Instance.canvas;
setP5(p5Instance);

const engine   = createEngine(canvas, p5Instance);
const audio    = createAudio();
const timeline = createTimeline(document.getElementById('beat-grid'));

engine.onPreTick = (t) => {
  const elapsed = audio.isLoaded ? t - FIRST_BEAT : t;
  updateLoopTime(elapsed);
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

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

// ── Editor ──

const editor = createEditor(editorEl);

// ── Compile + swap ──

// ── Stateful variables ($$) — clear/clearAll exposed to user code ──

const stateStdlib = {
  clear(key) { engine.clearState(key); },
  clearAll() { engine.clearAll(); },
};

function run() {
  probe.clear();
  const code = editor.getCode();
  try {
    // Merge preserving getters ($t, $mouseX, etc. are getters on stdlib)
    const allStdlib = Object.defineProperties(
      { ...stateStdlib },
      Object.getOwnPropertyDescriptors(stdlib)
    );
    const drawFn = compile(code, allStdlib, engine.getState(), p5Instance);
    // Test-run to catch immediate errors
    const ctx = engine.getCtx();
    updateReactiveState(engine.getTime(), p5Instance.width, p5Instance.height, p5Instance);
    drawFn(ctx);
    engine.setDraw(drawFn);
    errorBar.style.display = 'none';
  } catch (e) {
    errorBar.textContent = e.message;
    errorBar.style.display = 'block';
  }
}

// ── Auto-run with debounce ──

let debounceTimer = null;

editor.onChange(() => {
  if (autoRunBox.checked) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 300);
  }
});

// Slider changes recompile immediately (no debounce)
editor.onSliderChange(() => run());

// ── Ctrl-Enter to run, Cmd-S to save ──

let currentSketchName = null;

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    run();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSketch();
  }
});

// ── Save / Load sketches (localStorage) ──

const SKETCH_PREFIX = 'dt-sketch:';

function getSavedNames() {
  const names = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(SKETCH_PREFIX)) names.push(key.slice(SKETCH_PREFIX.length));
  }
  return names.sort();
}

function saveSketch() {
  let name = currentSketchName;
  if (!name) {
    name = prompt('Save sketch as:');
    if (!name) return;
  }
  localStorage.setItem(SKETCH_PREFIX + name, editor.getCode());
  currentSketchName = name;
  rebuildSelector();
  demoSelect.value = 'sketch:' + name;
}

function loadSketch(name) {
  const code = localStorage.getItem(SKETCH_PREFIX + name);
  if (code == null) return;
  editor.setCode(code);
  currentSketchName = name;
  run();
}

function deleteSketch(name) {
  localStorage.removeItem(SKETCH_PREFIX + name);
  if (currentSketchName === name) currentSketchName = null;
  rebuildSelector();
}

// ── Demo + sketch selector ──

function rebuildSelector() {
  demoSelect.innerHTML = '';

  // Built-in demos
  Object.keys(DEMOS).forEach((name) => {
    const opt = document.createElement('option');
    opt.value = 'demo:' + name;
    opt.textContent = name;
    demoSelect.appendChild(opt);
  });

  // Saved sketches
  const saved = getSavedNames();
  if (saved.length > 0) {
    const sep = document.createElement('option');
    sep.disabled = true;
    sep.textContent = '── Saved ──';
    demoSelect.appendChild(sep);

    saved.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = 'sketch:' + name;
      opt.textContent = name;
      demoSelect.appendChild(opt);
    });
  }

  // Restore selection
  if (currentSketchName) {
    demoSelect.value = 'sketch:' + currentSketchName;
  }
}

rebuildSelector();

demoSelect.addEventListener('change', () => {
  const val = demoSelect.value;
  if (val.startsWith('demo:')) {
    const name = val.slice(5);
    editor.setCode(DEMOS[name]);
    currentSketchName = name;
    run();
  } else if (val.startsWith('sketch:')) {
    loadSketch(val.slice(7));
  }
});

// ── Resize canvas to fit pane ──

function resize() {
  const pane = document.getElementById('canvas-pane');
  p5Instance.resizeCanvas(pane.clientWidth, pane.clientHeight);
}

resize();
window.addEventListener('resize', resize);

// ── Audio transport ──

// Pre-load music.mp3, wire audio as time source once ready
async function loadTrack() {
  await audio.loadPath('/resources/music.mp3');
  engine.setTimeSource(() => audio.time);
  playBtn.disabled = false;
  // Decode for waveform
  const resp = await fetch('/resources/music.mp3');
  const buf = await resp.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(buf);
  timeline.setAudioBuffer(audioBuffer);
}
loadTrack();

// Music toggle — mute / unmute only, does not affect time
musicToggle.addEventListener('click', () => {
  audio.muted = !audio.muted;
  musicToggle.textContent = audio.muted ? '\u266B Off' : '\u266B On';
  musicToggle.classList.toggle('active', !audio.muted);
});

// Load audio file manually
musicToggle.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  audioFileInput.click();
});

audioFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await audio.loadFile(file);
  engine.setTimeSource(() => audio.time);
  playBtn.disabled = false;
  audio.muted = false;
  musicToggle.textContent = '\u266B On';
  musicToggle.classList.add('active');
  musicToggle.title = file.name;
});

playBtn.addEventListener('click', () => {
  if (!audio.playing && audio.time < FIRST_BEAT) {
    audio.seek(FIRST_BEAT);
  }
  audio.togglePlay();
  playBtn.textContent = audio.playing ? '\u275A\u275A' : '\u25B6';
});

snapBtn.addEventListener('click', () => {
  timeline.setSnap(!timeline.snapping);
  snapBtn.classList.toggle('active', timeline.snapping);
});

// ── Transport sash — drag to resize, double-click to toggle ──

let sashDragging = false;

transportSash.addEventListener('mousedown', (e) => {
  e.preventDefault();
  sashDragging = true;
  transportSash.classList.add('dragging');

  const onMove = (e) => {
    const bottomY = window.innerHeight - e.clientY;
    if (bottomY < 20) {
      transportEl.classList.add('collapsed');
    } else {
      transportEl.classList.remove('collapsed');
      transportEl.style.height = bottomY + 'px';
    }
    resize();
  };

  const onUp = () => {
    sashDragging = false;
    transportSash.classList.remove('dragging');
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});

transportSash.addEventListener('dblclick', () => {
  if (transportEl.classList.contains('collapsed')) {
    transportEl.classList.remove('collapsed');
    transportEl.style.height = '';
  } else {
    transportEl.classList.add('collapsed');
  }
  resize();
});

// ── Boot ──

const firstName = Object.keys(DEMOS)[0];
editor.setCode(DEMOS[firstName]);
run();
engine.start();
