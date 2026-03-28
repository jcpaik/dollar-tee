// Standard library — shapes, directives, math.
// Everything here is injected into user code as top-level names.

import { Color } from '../lib/color.js';
import { $loop, $beat, $beats, tween } from '../audio/intervals.js';
import { vec2, Vec2 } from '../lib/vec.js';
import { complex } from '../lib/complex.js';
import { probe } from './probe.js';
import { setRendererP5, renderScene } from './renderer.js';
import {
  easeLinear,
  easeInSine,    easeOutSine,    easeInOutSine,
  easeInQuad,    easeOutQuad,    easeInOutQuad,
  easeInCubic,   easeOutCubic,   easeInOutCubic,
  easeInQuart,   easeOutQuart,   easeInOutQuart,
  easeInQuint,   easeOutQuint,   easeInOutQuint,
  easeInExpo,    easeOutExpo,    easeInOutExpo,
  easeInCirc,    easeOutCirc,    easeInOutCirc,
  easeInBack,    easeOutBack,    easeInOutBack,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBounce,  easeOutBounce,  easeInOutBounce,
  cubicBezier,
  spring,
} from '../lib/easing.js';

// ── p5 instance (set once during init) ────────────────────────────
export function setP5(p) { setRendererP5(p); }

// ── Reactive globals (updated each frame by the engine) ──────────
let _reactiveState = { $t: 0, $width: 0, $height: 0, $mouseX: 0, $mouseY: 0 };

export function updateReactiveState(t, W, H, p) {
  _reactiveState.$t = t;
  _reactiveState.$width = W;
  _reactiveState.$height = H;
  _reactiveState.$mouseX = p ? p.mouseX : 0;
  _reactiveState.$mouseY = p ? p.mouseY : 0;
}

// ── Math ──────────────────────────────────────────────────────────

function If(cond, a, b) { return cond ? a : b; }

function lerp(a, b, t)  { return a + (b - a) * t; }
function clamp(x, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, x)); }
function map(v, inMin, inMax, outMin, outMax) {
  return outMin + (outMax - outMin) * ((v - inMin) / (inMax - inMin));
}

function ease(a, b, t, fn) {
  if (b === undefined) return a * a * (3 - 2 * a); // ease(t) smoothstep
  const et = fn ? fn(t) : t;
  if (typeof a === 'number') return a + (b - a) * et;
  if (a.lerp) return a.lerp(b, et); // Vec2, Complex
  return a + (b - a) * et;
}

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

// ── vec2 detection ───────────────────────────────────────────────
const _isV = (v) => v instanceof Vec2;

// ── Shape Constructors (return descriptor objects) ────────────────
// All position args accept vec2 or separate (x, y) numbers.

function Circle(a, b, c) {
  if (_isV(a)) return { type: 'circle', x: a.x, y: a.y, r: b };
  return { type: 'circle', x: a, y: b, r: c };
}
function Line(a, b, c, d) {
  if (_isV(a)) return { type: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  return { type: 'line', x1: a, y1: b, x2: c, y2: d };
}
function Rect(a, b, c, d) {
  if (_isV(a)) return { type: 'rect', x: a.x, y: a.y, w: b, h: c };
  return { type: 'rect', x: a, y: b, w: c, h: d };
}
function Polygon(pts) { return { type: 'polygon', pts }; }
function Arc(a, b, c, d, e) {
  if (_isV(a)) return { type: 'arc', x: a.x, y: a.y, r: b, start: c, end: d };
  return { type: 'arc', x: a, y: b, r: c, start: d, end: e };
}
function Ellipse(a, b, c, d) {
  if (_isV(a)) return { type: 'ellipse', x: a.x, y: a.y, rx: b, ry: c };
  return { type: 'ellipse', x: a, y: b, rx: c, ry: d };
}
function Text(str, a, b, c) {
  if (_isV(a)) return { type: 'text', str, x: a.x, y: a.y, size: b || 16 };
  return { type: 'text', str, x: a, y: b, size: c || 16 };
}
function Shape(points, close = true) { return { type: 'shape', points, close }; }
function BezierShape(points) { return { type: 'bezierShape', points }; }
function Bezier(a, b, c, d, e, f, g, h) {
  if (_isV(a)) return { type: 'bezier', x1: a.x, y1: a.y, cx1: b.x, cy1: b.y, cx2: c.x, cy2: c.y, x2: d.x, y2: d.y };
  return { type: 'bezier', x1: a, y1: b, cx1: c, cy1: d, cx2: e, cy2: f, x2: g, y2: h };
}
function QuadCurve(a, b, c, d, e, f) {
  if (_isV(a)) return { type: 'quadCurve', x1: a.x, y1: a.y, cx: b.x, cy: b.y, x2: c.x, y2: c.y };
  return { type: 'quadCurve', x1: a, y1: b, cx: c, cy: d, x2: e, y2: f };
}
function ImageShape(img, a, b, c, d) {
  if (_isV(a)) return { type: 'image', img, x: a.x, y: a.y, w: b, h: c };
  return { type: 'image', img, x: a, y: b, w: c, h: d };
}

// ── Style Directives ─────────────────────────────────────────────
// These go into the scene array alongside shapes.
// A Color object in the array sets both fill and stroke.
// Nested arrays act as groups with push/pop state.

function resolveColor(c) {
  if (c instanceof Color) return c.toCSS();
  return c;
}

function Fill(color)    { return { _dir: true, prop: 'fill',      value: resolveColor(color) }; }
function Stroke(color)  { return { _dir: true, prop: 'stroke',    value: resolveColor(color) }; }
function LineWidth(w)   { return { _dir: true, prop: 'lineWidth', value: w }; }
function NoFill()       { return { _dir: true, prop: 'fill',      value: null }; }
function NoStroke()     { return { _dir: true, prop: 'stroke',    value: null }; }
function Bg(color)      { return { _dir: true, action: 'bg',      value: resolveColor(color) }; }
function Font(f)        { return { _dir: true, prop: 'font',      value: f }; }
function Alpha(a)       { return { _dir: true, prop: 'globalAlpha', value: a }; }

// Transform directives
function Translate(a, b) {
  if (_isV(a)) return { _dir: true, action: 'translate', x: a.x, y: a.y };
  return { _dir: true, action: 'translate', x: a, y: b };
}
function Rotate(angle)    { return { _dir: true, action: 'rotate', angle }; }
function Scale(a, b) {
  if (_isV(a)) return { _dir: true, action: 'scale', x: a.x, y: a.y };
  if (b === undefined) b = a;
  return { _dir: true, action: 'scale', x: a, y: b };
}

// Style directives
function StrokeCap(cap)     { return { _dir: true, action: 'strokeCap', value: cap }; }
function StrokeJoin(join)    { return { _dir: true, action: 'strokeJoin', value: join }; }
function BlendMode(mode)     { return { _dir: true, action: 'blendMode', value: mode }; }
function RectMode(mode)      { return { _dir: true, action: 'rectMode', value: mode }; }
function EllipseMode(mode)   { return { _dir: true, action: 'ellipseMode', value: mode }; }

// Typography directives
function TextSize(size)       { return { _dir: true, prop: 'textSize', value: size }; }
function TextAlign(h, v)      { return { _dir: true, action: 'textAlign', h, v }; }
function TextFont(font)       { return { _dir: true, prop: 'textFont', value: font }; }
function TextStyle(style)     { return { _dir: true, action: 'textStyle', value: style }; }

// Image & tint directives
function Tint(color)    { return { _dir: true, action: 'tint', value: color }; }
function NoTint()       { return { _dir: true, action: 'noTint' }; }

// Filter directive
function Filter(type, param) { return { _dir: true, action: 'filter', type, param }; }

// ── val() — identity for now, future: CodeMirror slider widget ───

function val(current, _min = 0, _max = 1) { return current; }

// ── table() — Mathematica-style declarative iteration ────────────
// table({i: 8, j: 8}, ({i, j}) => [...items])
// Range syntax:
//   {i: 8}             → i from 1 to 8
//   {i: [3, 10]}       → i from 3 to 10
//   {i: [3, 10, 2]}    → i from 3 to 10, step 2
//   {i: {from: 3, to: 10, step: 2}}

function parseRange(r) {
  if (typeof r === 'number') return [1, r, 1];
  if (Array.isArray(r)) {
    const [a, b, s] = r;
    const step = s || (a <= b ? 1 : -1);
    return [a, b, step];
  }
  if (typeof r === 'object' && r !== null) {
    const step = r.step || (r.from <= r.to ? 1 : -1);
    return [r.from, r.to, step];
  }
  return [1, 1, 1];
}

function table(spec, fn) {
  const keys = Object.keys(spec);
  const ranges = keys.map(k => parseRange(spec[k]));
  const items = [];

  function recurse(depth, obj) {
    if (depth === keys.length) {
      const result = fn(obj);
      if (Array.isArray(result)) items.push(...result);
      else if (result != null) items.push(result);
      return;
    }
    const key = keys[depth];
    const [from, to, step] = ranges[depth];
    const cmp = step > 0 ? (v) => v <= to : (v) => v >= to;
    for (let v = from; cmp(v); v += step) {
      obj[key] = v;
      recurse(depth + 1, obj);
    }
  }

  recurse(0, {});
  return items;
}

// ── subdivide() — parameter space for functional chaining ────────
// subdivide({t: {from: 0, to: 1, size: 60}})  → 60 values from 0 to 1
// subdivide({i: 8})                            → 8 integers: 0, 1, ..., 7
// subdivide({x: {from: 0, to: 100, step: 10}}) → 0, 10, 20, ..., 100
// Returns array with .mapWith() for chaining: adds fields without losing existing ones.

function _attachMapWith(arr) {
  arr.mapWith = function(fn) {
    return _attachMapWith(this.map(el => ({...el, ...fn(el)})));
  };
  return arr;
}

function subdivide(spec) {
  const keys = Object.keys(spec);
  const ranges = keys.map(k => {
    const v = spec[k];
    if (typeof v === 'number') {
      return { from: 0, count: v, step: 1 };
    }
    const from = v.from ?? 0;
    const to = v.to ?? 1;
    if (v.step != null) {
      const count = Math.floor(Math.abs(to - from) / Math.abs(v.step)) + 1;
      return { from, count, step: v.step };
    }
    const count = v.size ?? (Math.round(Math.abs(to - from)) + 1);
    const step = count <= 1 ? 0 : (to - from) / (count - 1);
    return { from, count, step };
  });

  const items = [];

  function recurse(depth, obj) {
    if (depth === keys.length) {
      items.push({...obj});
      return;
    }
    const key = keys[depth];
    const { from, count, step } = ranges[depth];
    for (let i = 0; i < count; i++) {
      obj[key] = from + step * i;
      recurse(depth + 1, obj);
    }
  }

  recurse(0, {});
  return _attachMapWith(items);
}

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

// ── draw() — explicit render call for imperative+declarative mix ─

function draw(ctx, items) { renderScene(ctx, items); }

// ── Export everything as a flat object ────────────────────────────

export const stdlib = {
  // Reactive globals (getters → always current)
  get $t() { return _reactiveState.$t; },
  get $width() { return _reactiveState.$width; },
  get $height() { return _reactiveState.$height; },
  get $mouseX() { return _reactiveState.$mouseX; },
  get $mouseY() { return _reactiveState.$mouseY; },
  get $mouse() { return vec2(_reactiveState.$mouseX, _reactiveState.$mouseY); },
  get $center() { return vec2(_reactiveState.$width / 2, _reactiveState.$height / 2); },

  // Math
  If, lerp, clamp, map,
  ease, noise, noise2,

  // Easings (33 Penner + utilities)
  easeLinear,
  easeInSine,    easeOutSine,    easeInOutSine,
  easeInQuad,    easeOutQuad,    easeInOutQuad,
  easeInCubic,   easeOutCubic,   easeInOutCubic,
  easeInQuart,   easeOutQuart,   easeInOutQuart,
  easeInQuint,   easeOutQuint,   easeInOutQuint,
  easeInExpo,    easeOutExpo,    easeInOutExpo,
  easeInCirc,    easeOutCirc,    easeInOutCirc,
  easeInBack,    easeOutBack,    easeInOutBack,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBounce,  easeOutBounce,  easeInOutBounce,
  cubicBezier, spring,

  // Shapes
  Circle, Line, Rect, Polygon, Arc, Ellipse, Text,
  Shape, BezierShape, Bezier, QuadCurve,
  Image: ImageShape,

  // Directives
  Fill, Stroke, LineWidth, NoFill, NoStroke, Bg, Font, Alpha,
  Translate, Rotate, Scale,
  StrokeCap, StrokeJoin, BlendMode, RectMode, EllipseMode,
  TextSize, TextAlign, TextFont, TextStyle,
  Tint, NoTint, Filter,

  // Color
  Color,

  // Intervals
  $loop, $beat, $beats,
  $beat1: $beats[0], $beat2: $beats[1], $beat3: $beats[2], $beat4: $beats[3],
  $beat5: $beats[4], $beat6: $beats[5], $beat7: $beats[6], $beat8: $beats[7],
  tween,

  // Vector & Complex
  vec2, complex,

  // Helpers
  val, make3D, draw, table, subdivide, probe,

  // Math builtins
  PI: Math.PI, TWO_PI: Math.PI * 2, HALF_PI: Math.PI / 2,
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  abs: Math.abs, sqrt: Math.sqrt, pow: Math.pow,
  floor: Math.floor, ceil: Math.ceil, round: Math.round,
  min: Math.min, max: Math.max, random: Math.random,
  atan2: Math.atan2, log: Math.log, exp: Math.exp,
};
