// Standard library — shapes, directives, math, rendering.
// Everything here is injected into user code as top-level names.
// drawShape() uses the p5 instance for rendering when available.

import { Color } from './color.js';
import { $loop, $beat, $beats, tween } from './intervals.js';
import { vec2 } from './vec.js';
import { complex } from './complex.js';
import { probe } from './probe.js';
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
} from './easing.js';

// ── p5 instance (set once during init) ────────────────────────────
let _p5 = null;
export function setP5(p) { _p5 = p; }

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

// ── Shape Constructors (return descriptor objects) ────────────────

function Circle(x, y, r) { return { type: 'circle', x, y, r }; }
function Line(x1, y1, x2, y2) { return { type: 'line', x1, y1, x2, y2 }; }
function Rect(x, y, w, h) { return { type: 'rect', x, y, w, h }; }
function Polygon(pts) { return { type: 'polygon', pts }; }
function Ngon(x, y, r, n, angle = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = angle + (i / n) * Math.PI * 2;
    pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]);
  }
  return Polygon(pts);
}
function Arc(x, y, r, start, end) { return { type: 'arc', x, y, r, start, end }; }
function Ellipse(x, y, rx, ry) { return { type: 'ellipse', x, y, rx, ry }; }
function Text(str, x, y, size) { return { type: 'text', str, x, y, size: size || 16 }; }
function Shape(points, close = true) { return { type: 'shape', points, close }; }
function BezierShape(points) { return { type: 'bezierShape', points }; }
function Bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
  return { type: 'bezier', x1, y1, cx1, cy1, cx2, cy2, x2, y2 };
}
function QuadCurve(x1, y1, cx, cy, x2, y2) {
  return { type: 'quadCurve', x1, y1, cx, cy, x2, y2 };
}
function ImageShape(img, x, y, w, h) { return { type: 'image', img, x, y, w, h }; }

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
function Translate(x, y) { return { _dir: true, action: 'translate', x, y }; }
function Rotate(angle)    { return { _dir: true, action: 'rotate', angle }; }
function Scale(x, y)      { if (y === undefined) y = x; return { _dir: true, action: 'scale', x, y }; }

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

// ── Scene Renderer (Mathematica-style) ───────────────────────────
// Walks an array of shapes and directives. Nested arrays push/pop state.

const DEFAULT_STATE = {
  fill: '#ffffff',
  stroke: null,
  lineWidth: 1,
  font: null,
  globalAlpha: 1,
  textSize: null,
  textFont: null,
};

export function renderScene(ctx, items, state) {
  if (!state) state = { ...DEFAULT_STATE };

  for (const item of items) {
    // Nested array → group with scoped state + push/pop transforms
    if (Array.isArray(item)) {
      if (_p5) _p5.push();
      renderScene(ctx, item, { ...state });
      if (_p5) _p5.pop();
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
        if (_p5) {
          _p5.background(item.value);
        } else {
          ctx.fillStyle = item.value;
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        }
        continue;
      }
      // Transform actions
      if (item.action === 'translate') { if (_p5) _p5.translate(item.x, item.y); continue; }
      if (item.action === 'rotate')    { if (_p5) _p5.rotate(item.angle); continue; }
      if (item.action === 'scale')     { if (_p5) _p5.scale(item.x, item.y); continue; }
      // Style actions
      if (item.action === 'strokeCap')   { if (_p5) _p5.strokeCap(item.value); continue; }
      if (item.action === 'strokeJoin')  { if (_p5) _p5.strokeJoin(item.value); continue; }
      if (item.action === 'blendMode') {
        if (_p5) {
          const mode = typeof item.value === 'string' ? _p5[item.value.toUpperCase()] || item.value : item.value;
          _p5.blendMode(mode);
        }
        continue;
      }
      if (item.action === 'rectMode')    { if (_p5) _p5.rectMode(item.value); continue; }
      if (item.action === 'ellipseMode') { if (_p5) _p5.ellipseMode(item.value); continue; }
      // Typography actions
      if (item.action === 'textAlign')  { if (_p5) _p5.textAlign(item.h, item.v); continue; }
      if (item.action === 'textStyle')  { if (_p5) _p5.textStyle(item.value); continue; }
      // Image actions
      if (item.action === 'tint')   { if (_p5) _p5.tint(item.value); continue; }
      if (item.action === 'noTint') { if (_p5) _p5.noTint(); continue; }
      // Filter action
      if (item.action === 'filter') {
        if (_p5) {
          const filterType = typeof item.type === 'string' ? _p5[item.type.toUpperCase()] || item.type : item.type;
          if (item.param !== undefined) {
            _p5.filter(filterType, item.param);
          } else {
            _p5.filter(filterType);
          }
        }
        continue;
      }
      // Property-based directives (fill, stroke, lineWidth, font, globalAlpha, textSize, textFont)
      if (item.prop) {
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
  if (!_p5) {
    // Fallback to raw Canvas2D if p5 not initialized
    drawShapeCanvas(ctx, shape, state);
    return;
  }

  const p = _p5;

  // Save and apply alpha manually (no push/pop — transforms are scoped by renderScene)
  const prevAlpha = p.drawingContext.globalAlpha;
  if (state.globalAlpha !== 1) {
    p.drawingContext.globalAlpha = state.globalAlpha;
  }

  // Apply fill
  if (state.fill) {
    p.fill(state.fill);
  } else {
    p.noFill();
  }

  // Apply stroke
  if (state.stroke) {
    p.stroke(state.stroke);
    p.strokeWeight(state.lineWidth || 1);
  } else {
    p.noStroke();
  }

  // Draw shape using p5 methods
  switch (shape.type) {
    case 'circle':
      p.circle(shape.x, shape.y, Math.max(0, shape.r) * 2);  // p5 uses diameter
      break;
    case 'rect':
      p.rect(shape.x, shape.y, shape.w, shape.h);
      break;
    case 'line':
      p.line(shape.x1, shape.y1, shape.x2, shape.y2);
      break;
    case 'ellipse':
      p.ellipse(shape.x, shape.y, Math.max(0, shape.rx) * 2, Math.max(0, shape.ry) * 2);  // p5 uses diameters
      break;
    case 'arc':
      p.arc(shape.x, shape.y, Math.max(0, shape.r) * 2, Math.max(0, shape.r) * 2, shape.start, shape.end);
      break;
    case 'polygon':
      if (!shape.pts || shape.pts.length < 2) { p.drawingContext.globalAlpha = prevAlpha; return; }
      p.beginShape();
      for (const pt of shape.pts) p.vertex(pt[0], pt[1]);
      p.endShape(p.CLOSE);
      break;
    case 'shape':
      p.beginShape();
      for (const pt of shape.points) p.vertex(pt[0], pt[1]);
      p.endShape(shape.close ? p.CLOSE : undefined);
      break;
    case 'bezierShape':
      // points: [[x,y], [cx1,cy1,cx2,cy2,x,y], ...]
      // First point is moveTo, rest are bezier segments
      p.beginShape();
      p.vertex(shape.points[0][0], shape.points[0][1]);
      for (let i = 1; i < shape.points.length; i++) {
        const pt = shape.points[i];
        p.bezierVertex(pt[0], pt[1], pt[2], pt[3], pt[4], pt[5]);
      }
      p.endShape();
      break;
    case 'bezier':
      p.bezier(shape.x1, shape.y1, shape.cx1, shape.cy1, shape.cx2, shape.cy2, shape.x2, shape.y2);
      break;
    case 'quadCurve':
      // p5 doesn't have a direct quadratic bezier draw function, use beginShape
      p.beginShape();
      p.vertex(shape.x1, shape.y1);
      p.quadraticVertex(shape.cx, shape.cy, shape.x2, shape.y2);
      p.endShape();
      break;
    case 'image':
      if (shape.w !== undefined && shape.h !== undefined) {
        p.image(shape.img, shape.x, shape.y, shape.w, shape.h);
      } else {
        p.image(shape.img, shape.x, shape.y);
      }
      break;
    case 'text': {
      // Priority: TextSize()/TextFont() > Font('12px monospace') > shape defaults
      if (state.textSize) {
        p.textSize(state.textSize);
        p.textFont(state.textFont || 'monospace');
      } else {
        // Parse legacy Font() CSS string, or fall back to shape.size
        const fontStr = state.font || `${shape.size || 16}px monospace`;
        const sizeMatch = fontStr.match(/(\d+)px/);
        if (sizeMatch) p.textSize(parseInt(sizeMatch[1]));
        const familyMatch = fontStr.match(/\d+px\s+(.+)/);
        if (familyMatch) p.textFont(familyMatch[1]);
        else p.textFont('monospace');
      }
      p.text(shape.str, shape.x, shape.y);
      break;
    }
  }

  // Restore alpha
  p.drawingContext.globalAlpha = prevAlpha;
}

// Canvas2D fallback — preserved for when p5 is not available
function drawShapeCanvas(ctx, shape, state) {
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
  // Reactive globals (getters → always current)
  get $t() { return _reactiveState.$t; },
  get $width() { return _reactiveState.$width; },
  get $height() { return _reactiveState.$height; },
  get $mouseX() { return _reactiveState.$mouseX; },
  get $mouseY() { return _reactiveState.$mouseY; },

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
  Circle, Line, Rect, Polygon, Ngon, Arc, Ellipse, Text,
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
