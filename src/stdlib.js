// Standard library — shapes, directives, math, rendering.
// Everything here is injected into user code as top-level names.

import { Color } from './color.js';

// ── Math ──────────────────────────────────────────────────────────

function lerp(a, b, t)  { return a + (b - a) * t; }
function clamp(x, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, x)); }
function map(v, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));
}

function ease(t)      { return t * t * (3 - 2 * t); }
function easeIn(t)    { return t * t; }
function easeOut(t)   { return t * (2 - t); }
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

// Simple hash-based noise
function _hash(n) { const s = Math.sin(n) * 43758.5453123; return s - Math.floor(s); }

function noise(x) {
  const i = Math.floor(x), f = x - i;
  return lerp(_hash(i), _hash(i + 1), f * f * (3 - 2 * f));
}

function noise2(x, y) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = x - i, fy = y - j;
  const sx = fx*fx*(3-2*fx), sy = fy*fy*(3-2*fy);
  const n = i + j * 57;
  return lerp(
    lerp(_hash(n), _hash(n + 1), sx),
    lerp(_hash(n + 57), _hash(n + 58), sx),
    sy
  );
}

// ── Shape Constructors (return descriptor objects) ────────────────

function circle(x, y, r) { return { type: 'circle', x, y, r }; }
function line(x1, y1, x2, y2) { return { type: 'line', x1, y1, x2, y2 }; }
function rect(x, y, w, h) { return { type: 'rect', x, y, w, h }; }
function polygon(pts) { return { type: 'polygon', pts }; }
function arc(x, y, r, start, end) { return { type: 'arc', x, y, r, start, end }; }
function ellipse(x, y, rx, ry) { return { type: 'ellipse', x, y, rx, ry }; }
function text(str, x, y, size) { return { type: 'text', str, x, y, size: size || 16 }; }

// ── Style Directives ─────────────────────────────────────────────
// These go into the scene array alongside shapes.
// A Color object in the array sets both fill and stroke.
// Nested arrays act as groups with push/pop state.

function resolveColor(c) {
  if (c instanceof Color) return c.toCSS();
  return c;
}

function fill(color)    { return { _dir: true, prop: 'fill',      value: resolveColor(color) }; }
function stroke(color)  { return { _dir: true, prop: 'stroke',    value: resolveColor(color) }; }
function lineWidth(w)   { return { _dir: true, prop: 'lineWidth', value: w }; }
function noFill()       { return { _dir: true, prop: 'fill',      value: null }; }
function noStroke()     { return { _dir: true, prop: 'stroke',    value: null }; }
function bg(color)      { return { _dir: true, action: 'bg',      value: resolveColor(color) }; }
function font(f)        { return { _dir: true, prop: 'font',      value: f }; }
function alpha(a)       { return { _dir: true, prop: 'globalAlpha', value: a }; }

// ── val() — identity for now, future: CodeMirror slider widget ───

function val(current, _min = 0, _max = 1) { return current; }

// ── 3D Array Helpers ─────────────────────────────────────────────

function make3D(nx, ny, nz, fillFn) {
  const arr = [];
  for (let x = 0; x < nx; x++) {
    arr[x] = [];
    for (let y = 0; y < ny; y++) {
      arr[x][y] = [];
      for (let z = 0; z < nz; z++) {
        arr[x][y][z] = fillFn ? fillFn(x, y, z) : 0;
      }
    }
  }
  return arr;
}

// ── Scene Renderer (Mathematica-style) ───────────────────────────
// Walks an array of shapes and directives. Nested arrays push/pop state.

const DEFAULT_STATE = {
  fill: '#ffffff',
  stroke: null,
  lineWidth: 1,
  font: '16px monospace',
  globalAlpha: 1,
};

export function renderScene(ctx, items, state) {
  if (!state) state = { ...DEFAULT_STATE };

  for (const item of items) {
    // Nested array → group with scoped state
    if (Array.isArray(item)) {
      renderScene(ctx, item, { ...state });
      continue;
    }

    // Color object → set fill
    if (item instanceof Color) {
      state.fill = item.toCSS();
      continue;
    }

    // Directive
    if (item?._dir) {
      if (item.action === 'bg') {
        ctx.fillStyle = item.value;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      } else {
        state[item.prop] = item.value;
      }
      continue;
    }

    // Shape
    if (item?.type) {
      drawShape(ctx, item, state);
    }
  }
}

function drawShape(ctx, shape, state) {
  ctx.save();
  ctx.globalAlpha = state.globalAlpha;
  ctx.beginPath();

  switch (shape.type) {
    case 'circle':
      ctx.arc(shape.x, shape.y, Math.max(0, shape.r), 0, Math.PI * 2);
      break;
    case 'line':
      ctx.moveTo(shape.x1, shape.y1);
      ctx.lineTo(shape.x2, shape.y2);
      break;
    case 'rect':
      ctx.rect(shape.x, shape.y, shape.w, shape.h);
      break;
    case 'polygon':
      if (!shape.pts || shape.pts.length < 2) { ctx.restore(); return; }
      ctx.moveTo(shape.pts[0][0], shape.pts[0][1]);
      for (let i = 1; i < shape.pts.length; i++) ctx.lineTo(shape.pts[i][0], shape.pts[i][1]);
      ctx.closePath();
      break;
    case 'arc':
      ctx.arc(shape.x, shape.y, Math.max(0, shape.r), shape.start, shape.end);
      break;
    case 'ellipse':
      ctx.ellipse(shape.x, shape.y, Math.max(0, shape.rx), Math.max(0, shape.ry), 0, 0, Math.PI * 2);
      break;
    case 'text':
      ctx.font = state.font || `${shape.size}px monospace`;
      if (state.fill) { ctx.fillStyle = state.fill; ctx.fillText(shape.str, shape.x, shape.y); }
      if (state.stroke) {
        ctx.strokeStyle = state.stroke;
        ctx.lineWidth = state.lineWidth || 1;
        ctx.strokeText(shape.str, shape.x, shape.y);
      }
      ctx.restore();
      return;
  }

  if (state.fill) { ctx.fillStyle = state.fill; ctx.fill(); }
  if (state.stroke) {
    ctx.strokeStyle = state.stroke;
    ctx.lineWidth = state.lineWidth || 1;
    ctx.stroke();
  }
  ctx.restore();
}

// ── draw() — explicit render call for imperative+declarative mix ─

function draw(ctx, items) { renderScene(ctx, items); }

// ── Export everything as a flat object ────────────────────────────

export const stdlib = {
  // Math
  lerp, clamp, map,
  ease, easeIn, easeOut, easeInOut,
  noise, noise2,

  // Shapes
  circle, line, rect, polygon, arc, ellipse, text,

  // Directives
  fill, stroke, lineWidth, noFill, noStroke, bg, font, alpha,

  // Color
  Color,

  // Helpers
  val, make3D, draw,

  // Math builtins
  PI: Math.PI, TWO_PI: Math.PI * 2, HALF_PI: Math.PI / 2,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  abs: Math.abs, sqrt: Math.sqrt, pow: Math.pow,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  min: Math.min, max: Math.max, random: Math.random,
  atan2: Math.atan2, log: Math.log, exp: Math.exp,
};
