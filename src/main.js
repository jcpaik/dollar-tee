// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from './editor.js';
import { createEngine } from './engine.js';
import { createAudio } from './audio.js';
import { createTimeline, FIRST_BEAT } from './timeline.js';
import { compile } from './compiler.js';
import { stdlib } from './stdlib.js';
import { DEMOS } from './demos.js';
import { updateLoopTime } from './intervals.js';

// ── DOM refs ──

const canvas      = document.getElementById('canvas');
const editorEl    = document.getElementById('editor-container');
const errorBar    = document.getElementById('error-bar');
const demoSelect  = document.getElementById('demo-select');
const autoRunBox  = document.getElementById('auto-run');
const timeDisplay = document.getElementById('time-display');

// Transport DOM refs
const audioFileInput = document.getElementById('audio-file');
const audioLoadBtn   = document.getElementById('audio-load-btn');
const playBtn        = document.getElementById('play-btn');
const audioTimeEl    = document.getElementById('audio-time');
const snapBtn        = document.getElementById('snap-btn');

// ── Engine + Audio + Timeline ──

const engine   = createEngine(canvas);
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

function run() {
  const code = editor.getCode();
  try {
    const drawFn = compile(code, stdlib);
    // Test-run to catch immediate errors
    const ctx = engine.getCtx();
    drawFn(ctx, engine.getTime(), canvas.width, canvas.height);
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
  const name = prompt('Save sketch as:', currentSketchName || '');
  if (!name) return;
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
    currentSketchName = null;
    run();
  } else if (val.startsWith('sketch:')) {
    loadSketch(val.slice(7));
  }
});

// ── Resize canvas to fit pane ──

function resize() {
  const pane = document.getElementById('canvas-pane');
  canvas.width = pane.clientWidth;
  canvas.height = pane.clientHeight;
}

resize();
window.addEventListener('resize', resize);

// ── Audio transport ──

// Auto-load music.mp3 on boot
async function loadTrack() {
  await audio.loadPath('/resources/music.mp3');
  engine.setTimeSource(() => audio.time);
  playBtn.disabled = false;
  audioLoadBtn.textContent = 'music.mp3';

  // Decode for waveform
  const resp = await fetch('/resources/music.mp3');
  const buf = await resp.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(buf);
  timeline.setAudioBuffer(audioBuffer);
}
loadTrack();

// Manual load as fallback
audioLoadBtn.addEventListener('click', () => audioFileInput.click());

audioFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await audio.loadFile(file);
  engine.setTimeSource(() => audio.time);
  playBtn.disabled = false;
  audioLoadBtn.textContent = file.name.length > 18
    ? file.name.slice(0, 15) + '...'
    : file.name;
  audioLoadBtn.title = file.name;
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

// ── Boot ──

const firstName = Object.keys(DEMOS)[0];
editor.setCode(DEMOS[firstName]);
run();
engine.start();
