// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from './editor.js';
import { createEngine } from './engine.js';
import { createAudio } from './audio.js';
import { compile } from './compiler.js';
import { stdlib } from './stdlib.js';
import { DEMOS } from './demos.js';

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
const timeline       = document.getElementById('timeline');
const timelineFill   = document.getElementById('timeline-fill');
const audioTimeEl    = document.getElementById('audio-time');

// ── Engine + Audio ──

const engine = createEngine(canvas);
const audio  = createAudio();

// Beat grid — resources/music.mp3
const BPM           = 126.09;
const FIRST_BEAT    = 50.103333;          // first kick, seconds into the track
const LOOP_BEATS    = 8;
const BEAT_DURATION = 60 / BPM;           // ~0.47585 seconds
const LOOP_DURATION = LOOP_BEATS * BEAT_DURATION; // ~3.80680 seconds

engine.onTick = (t) => {
  timeDisplay.textContent = 't = ' + t.toFixed(2);
  // Update transport UI — timeline shows 8-beat loop position
  if (audio.isLoaded) {
    const elapsed = audio.time - FIRST_BEAT;
    const loopPos = elapsed >= 0
      ? (elapsed % LOOP_DURATION) / LOOP_DURATION
      : 0;
    timelineFill.style.width = (loopPos * 100) + '%';
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

// ── Ctrl-S to run ──

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    run();
  }
});

// ── Demo selector ──

Object.keys(DEMOS).forEach((name) => {
  const opt = document.createElement('option');
  opt.value = name;
  opt.textContent = name;
  demoSelect.appendChild(opt);
});

demoSelect.addEventListener('change', () => {
  editor.setCode(DEMOS[demoSelect.value]);
  run();
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

audioLoadBtn.addEventListener('click', () => audioFileInput.click());

audioFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await audio.load(file);
  engine.setTimeSource(() => audio.time);
  playBtn.disabled = false;
  audioLoadBtn.textContent = file.name.length > 18
    ? file.name.slice(0, 15) + '...'
    : file.name;
  audioLoadBtn.title = file.name;
});

playBtn.addEventListener('click', () => {
  // On first play (or when before the first beat), start at the first kick
  if (!audio.playing && audio.time < FIRST_BEAT) {
    audio.seek(FIRST_BEAT);
  }
  audio.togglePlay();
  playBtn.textContent = audio.playing ? '\u275A\u275A' : '\u25B6';
});

// Timeline: click to seek, shift-click to set cue, drag to scrub
let scrubbing = false;

function seekFromEvent(e) {
  if (!audio.isLoaded) return;
  const rect = timeline.getBoundingClientRect();
  const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const t = frac * audio.duration;
  audio.seek(t);
}

timeline.addEventListener('mousedown', (e) => {
  scrubbing = true;
  seekFromEvent(e);
});
document.addEventListener('mousemove', (e) => {
  if (scrubbing) seekFromEvent(e);
});
document.addEventListener('mouseup', () => { scrubbing = false; });

// ── Boot ──

const firstName = Object.keys(DEMOS)[0];
editor.setCode(DEMOS[firstName]);
run();
engine.start();
