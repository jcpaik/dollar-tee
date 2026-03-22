// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from './editor.js';
import { createEngine } from './engine.js';
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

// ── Engine ──

const engine = createEngine(canvas);

engine.onTick = (t) => {
  timeDisplay.textContent = 't = ' + t.toFixed(2);
};

engine.onError = (e) => {
  errorBar.textContent = e.message;
  errorBar.style.display = 'block';
};

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

// ── Boot ──

const firstName = Object.keys(DEMOS)[0];
editor.setCode(DEMOS[firstName]);
run();
engine.start();
