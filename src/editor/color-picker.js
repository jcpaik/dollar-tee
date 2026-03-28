// color-picker.js — Click on '#rrggbb' in the editor to get an inline color picker.
// Picking a color rewrites the hex string in the source text live.
// Also shows a small colored swatch inline next to each hex color.

import { EditorView, Decoration, ViewPlugin, WidgetType } from '@codemirror/view';
import { Annotation } from '@codemirror/state';

// Annotation to tag picker-originated changes (bypass debounce)
export const colorPickerChange = Annotation.define();

// ── Parse hex color strings ────────────────────────────────────────

const COLOR_RE = /(['"])#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\1/g;

function expandHex(hex) {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function findColors(doc) {
  const text = doc.toString();
  const results = [];
  COLOR_RE.lastIndex = 0;
  let m;
  while ((m = COLOR_RE.exec(text)) !== null) {
    results.push({
      from: m.index,
      to: m.index + m[0].length,
      // The hex value between quotes (e.g. #ff764d)
      colorFrom: m.index + 1,
      colorTo: m.index + m[0].length - 1,
      hex: expandHex('#' + m[2]),
    });
  }
  return results;
}

function colorAtPos(doc, pos) {
  return findColors(doc).find(c => pos >= c.from && pos <= c.to) || null;
}

// ── Swatch widget (inline colored square) ──────────────────────────

class SwatchWidget extends WidgetType {
  constructor(color) { super(); this.color = color; }
  eq(other) { return this.color === other.color; }
  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-color-swatch';
    span.style.backgroundColor = this.color;
    return span;
  }
}

// ── Hidden color input — opens OS picker directly, no popover ──────

const hiddenInput = document.createElement('input');
hiddenInput.type = 'color';
hiddenInput.style.position = 'fixed';
hiddenInput.style.width = '1px';
hiddenInput.style.height = '1px';
hiddenInput.style.opacity = '0';
hiddenInput.style.pointerEvents = 'none';
document.body.appendChild(hiddenInput);

function openPicker(view, match) {
  // Position the hidden input at the text so the OS picker anchors below it
  const coords = view.coordsAtPos(match.from);
  if (coords) {
    hiddenInput.style.left = coords.left + 'px';
    hiddenInput.style.top = coords.bottom + 'px';
  }

  hiddenInput.value = match.hex;

  // Replace listener each time
  const onInput = () => {
    const newHex = hiddenInput.value;
    const hit = colorAtPos(view.state.doc, match.from + 1);
    if (!hit) return;

    view.dispatch({
      changes: { from: hit.colorFrom, to: hit.colorTo, insert: newHex },
      annotations: colorPickerChange.of(true),
    });
  };

  hiddenInput.removeEventListener('input', hiddenInput._onInput);
  hiddenInput.addEventListener('input', onInput);
  hiddenInput._onInput = onInput;

  hiddenInput.click();
}

// ── Decorations: swatch + underline ────────────────────────────────

function buildDecorations(view) {
  const decos = [];
  for (const c of findColors(view.state.doc)) {
    decos.push(Decoration.widget({
      widget: new SwatchWidget(c.hex),
      side: -1,
    }).range(c.from));
    decos.push(Decoration.mark({ class: 'cm-color-clickable' }).range(c.from, c.to));
  }
  return Decoration.set(decos, true);
}

const colorHighlight = ViewPlugin.fromClass(
  class {
    constructor(view) { this.decorations = buildDecorations(view); }
    update(update) {
      if (update.docChanged) this.decorations = buildDecorations(update.view);
    }
  },
  { decorations: (v) => v.decorations },
);

// ── Click handler ──────────────────────────────────────────────────

const colorClick = EditorView.domEventHandlers({
  click(event, view) {
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    if (pos == null) return;

    const match = colorAtPos(view.state.doc, pos);
    if (!match) return;

    openPicker(view, match);
  },
});

// ── Export ──────────────────────────────────────────────────────────

export function colorPickerExtension() {
  return [colorClick, colorHighlight];
}
