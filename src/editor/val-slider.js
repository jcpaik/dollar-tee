// val-slider.js — Click on val(x, min, max) in the editor to get an inline slider.
// Dragging the slider rewrites the first argument in the source text live.

import { EditorView, Decoration, ViewPlugin } from '@codemirror/view';
import { Annotation, RangeSetBuilder } from '@codemirror/state';

// Annotation to tag slider-originated changes (bypass debounce)
export const valSliderChange = Annotation.define();

// ── Parse val() calls ──────────────────────────────────────────────

const VAL_RE = /\bval\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)(?:\s*,\s*(-?[\d.]+))?\s*\)/g;

function findVals(doc) {
  const text = doc.toString();
  const results = [];
  VAL_RE.lastIndex = 0;
  let m;
  while ((m = VAL_RE.exec(text)) !== null) {
    const prefix = m[0].match(/^val\s*\(\s*/)[0];
    results.push({
      from: m.index,
      to: m.index + m[0].length,
      numFrom: m.index + prefix.length,
      numTo: m.index + prefix.length + m[1].length,
      current: parseFloat(m[1]),
      min: parseFloat(m[2]),
      max: parseFloat(m[3]),
      step: m[4] != null ? parseFloat(m[4]) : null,
    });
  }
  return results;
}

function valAtPos(doc, pos) {
  return findVals(doc).find(v => pos >= v.from && pos <= v.to) || null;
}

// ── Number formatting ──────────────────────────────────────────────

function formatNum(n, step) {
  if (step != null && step >= 1) return String(Math.round(n));
  if (step != null) {
    const d = (String(step).split('.')[1] || '').length;
    return n.toFixed(d);
  }
  return parseFloat(n.toPrecision(4)).toString();
}

// ── Popover ────────────────────────────────────────────────────────

let popover = null;       // { dom, valFrom, cleanup }
let justDismissed = null; // { valFrom, time } — for toggle detection

function dismiss() {
  if (!popover) return;
  justDismissed = { valFrom: popover.valFrom, time: Date.now() };
  popover.dom.remove();
  popover.cleanup();
  popover = null;
}

function show(view, val) {
  dismiss();

  const coords = view.coordsAtPos(val.from);
  if (!coords) return;

  const dom = document.createElement('div');
  dom.className = 'val-slider-popover';
  dom.style.left = coords.left + 'px';
  dom.style.top = (coords.bottom + 4) + 'px';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = val.min;
  slider.max = val.max;
  slider.value = val.current;
  slider.step = val.step != null ? val.step : (val.max - val.min) / 200;

  const label = document.createElement('span');
  label.className = 'val-slider-value';
  label.textContent = formatNum(val.current, val.step);

  slider.addEventListener('input', () => {
    const n = parseFloat(slider.value);
    const text = formatNum(n, val.step);
    label.textContent = text;

    const hit = valAtPos(view.state.doc, val.from + 1);
    if (!hit) return;

    view.dispatch({
      changes: { from: hit.numFrom, to: hit.numTo, insert: text },
      annotations: valSliderChange.of(true),
    });
  });

  dom.addEventListener('mousedown', (e) => e.stopPropagation());

  dom.appendChild(slider);
  dom.appendChild(label);
  document.body.appendChild(dom);

  const onDown = (e) => {
    if (!dom.contains(e.target)) dismiss();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') dismiss();
  };

  requestAnimationFrame(() => {
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
  });

  popover = {
    dom,
    valFrom: val.from,
    cleanup() {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    },
  };
}

// ── Decorations: underline val() calls ─────────────────────────────

const valMark = Decoration.mark({ class: 'cm-val-clickable' });

function buildDecorations(view) {
  const builder = new RangeSetBuilder();
  for (const v of findVals(view.state.doc)) {
    builder.add(v.from, v.to, valMark);
  }
  return builder.finish();
}

const valHighlight = ViewPlugin.fromClass(
  class {
    constructor(view) { this.decorations = buildDecorations(view); }
    update(update) {
      if (update.docChanged) this.decorations = buildDecorations(update.view);
    }
  },
  { decorations: (v) => v.decorations },
);

// ── Click handler ──────────────────────────────────────────────────

const valClick = EditorView.domEventHandlers({
  click(event, view) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return;

    const val = valAtPos(view.state.doc, pos);
    if (!val) return;

    // Toggle: if we just dismissed this same val, don't reopen
    if (justDismissed && justDismissed.valFrom === val.from &&
        Date.now() - justDismissed.time < 300) {
      justDismissed = null;
      return;
    }

    show(view, val);
  },
});

// ── Export ──────────────────────────────────────────────────────────

export function valSliderExtension() {
  return [valClick, valHighlight];
}
