// Main — entry point. Wires editor, engine, and compiler together.

import { createEditor } from './editor/editor.js';
import { createEngine } from './engine.js';
import { createP5 } from './p5init.js';
import { createAudio } from './audio/audio.js';
import { createTimeline, FIRST_BEAT } from './audio/timeline.js';
import { compile } from './compiler.js';
import { stdlib, setP5, updateReactiveState } from './stdlib.js';
import { watch } from './watch.js';
import { updateLoopTime } from './audio/intervals.js';
import { fetchSketches, listSketches, getSketchCode, saveSketch } from './sketch-store.js';
import { createSketchSelector } from './demo-selector.js';
import { updateHash, decodeFromHash } from './url-share.js';
import { setupTransport } from './audio/transport.js';
import { setupLayout } from './ui/layout.js';
import { setupLocators, getLocatorGetters, syncOverlay, toggleLocators, restoreLocators } from './locators/main.js';
import { load, save as saveUI } from './ui/persist.js';
import { EditorSelection } from '@codemirror/state';

// ── Create subsystems ──

const p5Instance = await createP5(document.getElementById('canvas-pane'));
setP5(p5Instance);

const engine   = createEngine(p5Instance);
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
  watch.clear();
  try {
    const allStdlib = Object.defineProperties(
      { ...stateStdlib },
      Object.getOwnPropertyDescriptors(stdlib)
    );
    Object.defineProperties(allStdlib, Object.getOwnPropertyDescriptors(getLocatorGetters()));
    const drawFn = compile(editor.getCode(), allStdlib, engine.getState(), p5Instance);
    updateReactiveState(engine.getTime(), p5Instance.width, p5Instance.height, p5Instance);
    drawFn();
    engine.setDraw(drawFn);
    errorBar.style.display = 'none';
  } catch (e) {
    errorBar.textContent = e.loc ? `Line ${e.loc.line}:${e.loc.col}: ${e.message}` : e.message;
    errorBar.style.display = 'block';
  }
}

// ── Locators ──

setupLocators(document.getElementById('canvas-pane'), run);

// ── Auto-run with debounce ──

const autoRunBox = document.getElementById('auto-run');
const savedAutoRun = load('autorun');
if (savedAutoRun !== undefined) autoRunBox.checked = savedAutoRun;
autoRunBox.addEventListener('change', () => saveUI('autorun', autoRunBox.checked));

let debounceTimer = null;
let hashTimer = null;
editor.onChange(() => {
  if (autoRunBox.checked) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(run, 300);
  }
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => updateHash(editor.getCode()), 1000);
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
  saveUI('sketch', name);
  selector.clearShared();
  const code = getSketchCode(name);
  if (code == null) return;
  editor.setCode(code);
  run();
  updateHash(code);
});

async function save() {
  let name = currentSketchName;
  if (!name) { name = prompt('Save sketch as:'); if (!name) return; }
  await saveSketch(name, editor.getCode());
  currentSketchName = name;
  saveUI('sketch', name);
  selector.rebuild(name);
  selector.select(name);
}

// ── Keyboard shortcuts ──

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') { e.preventDefault(); toggleLocators(); }
});

// ── Share button ──

const shareBtn = document.getElementById('share-btn');
let shareResetTimer = null;
shareBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    shareBtn.textContent = 'Copied!';
    shareBtn.classList.add('copied');
  } catch {
    shareBtn.textContent = 'Failed';
  }
  clearTimeout(shareResetTimer);
  shareResetTimer = setTimeout(() => {
    shareBtn.textContent = 'Share';
    shareBtn.classList.remove('copied');
  }, 1500);
});

// ── Canvas resize ──

function resize() {
  const pane = document.getElementById('canvas-pane');
  p5Instance.resizeCanvas(pane.clientWidth, pane.clientHeight);
  syncOverlay();
}
resize();
window.addEventListener('resize', resize);

// ── Layout + Transport ──

setupLayout({ onResize: resize });
setupTransport({ audio, engine, timeline });

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
  timeDisplay.textContent = '$time = ' + t.toFixed(2);
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    fpsDisplay.innerHTML = frameCount + ' fps<br>draw ' + engine.getDrawMs().toFixed(1) + 'ms';
    frameCount = 0;
    lastFpsTime = now;
  }
  if (audio.isLoaded) {
    timeline.update(audio.time);
    audioTimeEl.textContent = fmtTime(audio.time) + ' / ' + fmtTime(audio.duration);
  }
};

engine.onError = (e) => {
  errorBar.textContent = e.loc ? `Line ${e.loc.line}:${e.loc.col}: ${e.message}` : e.message;
  errorBar.style.display = 'block';
};

// ── Restore locators ──

restoreLocators(load('locators'));

// ── Cursor persistence ──

function saveCursor() {
  const sel = editor.view.state.selection.main;
  saveUI('cursor', {
    anchor: sel.anchor, head: sel.head,
    scroll: editor.view.scrollDOM.scrollTop,
  });
}
editor.view.dom.addEventListener('focusout', saveCursor);
window.addEventListener('beforeunload', saveCursor);

// ── Panel tabs ──

document.getElementById('panel-tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.panel-tab');
  if (!btn || !btn.dataset.tab) return;
  document.querySelectorAll('.panel-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#panel-content > div').forEach(el => el.style.display = 'none');
  document.getElementById(btn.dataset.tab).style.display = '';
});

// ── Boot ──

const sharedCode = await decodeFromHash();

if (sharedCode) {
  editor.setCode(sharedCode);
  selector.setShared();
} else {
  const savedSketch = load('sketch');
  const bootSketch = (savedSketch && listSketches().includes(savedSketch))
    ? savedSketch
    : listSketches()[0];

  if (bootSketch) {
    currentSketchName = bootSketch;
    editor.setCode(getSketchCode(bootSketch));
    selector.select(bootSketch);

    const savedCursor = load('cursor');
    if (savedCursor && bootSketch === savedSketch) {
      const docLen = editor.view.state.doc.length;
      const anchor = Math.min(savedCursor.anchor, docLen);
      const head = Math.min(savedCursor.head, docLen);
      editor.view.dispatch({ selection: EditorSelection.range(anchor, head) });
      if (savedCursor.scroll != null) {
        requestAnimationFrame(() => { editor.view.scrollDOM.scrollTop = savedCursor.scroll; });
      }
    }
  }
  updateHash(editor.getCode());
}
run();
