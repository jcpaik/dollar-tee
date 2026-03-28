// Color schemes — functions from [0,1] → Color
// Usage: viridis(0.5) → Color, inferno(t) → Color, etc.
//
// Each scheme is defined by control points (sampled from matplotlib/d3)
// with linear interpolation between them. 16 points per scheme gives
// visually indistinguishable results from full 256-entry LUTs.

import { Color } from './color.js';

// ── Internals ────────────────────────────────────────────────────

function makeScheme(points) {
  const n = points.length;
  const fn = (t) => {
    t = Math.max(0, Math.min(1, t));
    const scaled = t * (n - 1);
    const i = Math.min(Math.floor(scaled), n - 2);
    const f = scaled - i;
    const a = points[i];
    const b = points[i + 1];
    return new Color(
      Math.round(a[0] + (b[0] - a[0]) * f),
      Math.round(a[1] + (b[1] - a[1]) * f),
      Math.round(a[2] + (b[2] - a[2]) * f),
    );
  };
  fn._points = points;
  return fn;
}

// Reverse a scheme
function reverse(scheme) {
  const fn = (t) => scheme(1 - t);
  fn._points = scheme._points ? [...scheme._points].reverse() : null;
  return fn;
}

// Combine two schemes at a split point
function join(schemeA, schemeB, split = 0.5) {
  return (t) => t < split
    ? schemeA(t / split)
    : schemeB((t - split) / (1 - split));
}

// Create a scheme from an array of CSS colors or Color objects
function schemeFrom(...colors) {
  const points = colors.map(c => {
    if (c instanceof Color) return [c.r, c.g, c.b];
    if (typeof c === 'string') {
      const col = Color.hex(c);
      return [col.r, col.g, col.b];
    }
    return c;
  });
  return makeScheme(points);
}

// ── Matplotlib / Scientific ──────────────────────────────────────
// Sampled at 16 evenly-spaced points from the canonical definitions.

const viridis = makeScheme([
  [68,   1, 84],
  [72,  26, 108],
  [71,  47, 125],
  [65,  68, 135],
  [57,  86, 140],
  [49, 104, 142],
  [42, 120, 142],
  [35, 137, 142],
  [31, 154, 138],
  [34, 170, 130],
  [53, 186, 116],
  [86, 199,  95],
  [128, 209,  69],
  [175, 216,  42],
  [221, 224,  36],
  [253, 231,  37],
]);

const inferno = makeScheme([
  [  0,   0,   4],
  [ 14,  11,  43],
  [ 37,  12,  79],
  [ 60,   9, 101],
  [ 84,   2, 109],
  [110,   1, 107],
  [136,  16,  92],
  [160,  37,  71],
  [181,  58,  52],
  [200,  82,  34],
  [217, 108,  18],
  [231, 137,   8],
  [241, 168,  18],
  [246, 201,  52],
  [247, 234, 106],
  [252, 255, 164],
]);

const plasma = makeScheme([
  [ 13,   8, 135],
  [ 48,   3, 155],
  [ 75,   3, 162],
  [100,   2, 162],
  [125,   3, 156],
  [148,  11, 141],
  [168,  24, 122],
  [186,  39, 103],
  [203,  55,  83],
  [217,  73,  64],
  [229,  93,  47],
  [239, 115,  31],
  [246, 140,  17],
  [250, 167,   8],
  [249, 198,  10],
  [240, 249,  33],
]);

const magma = makeScheme([
  [  0,   0,   4],
  [ 10,   9,  41],
  [ 27,  16,  75],
  [ 48,  17, 103],
  [ 71,  15, 119],
  [ 95,  15, 125],
  [120,  22, 122],
  [146,  33, 114],
  [170,  48, 104],
  [192,  66,  93],
  [212,  88,  82],
  [229, 114,  75],
  [242, 143,  76],
  [250, 176,  89],
  [254, 212, 120],
  [252, 253, 191],
]);

const cividis = makeScheme([
  [  0,  32,  77],
  [  0,  43,  94],
  [ 21,  55, 104],
  [ 48,  67, 108],
  [ 68,  78, 112],
  [ 86,  91, 114],
  [103, 103, 116],
  [120, 115, 116],
  [138, 127, 113],
  [155, 139, 108],
  [173, 152, 100],
  [191, 165,  88],
  [209, 179,  73],
  [227, 194,  55],
  [243, 210,  36],
  [253, 231,  37],
]);

// ── Artistic / Performance ───────────────────────────────────────

const sunset = makeScheme([
  [ 54,  22,  93],
  [ 88,  24, 115],
  [132,  32, 107],
  [173,  43,  84],
  [205,  66,  59],
  [231, 102,  40],
  [247, 148,  29],
  [255, 200,  50],
]);

const ocean = makeScheme([
  [  2,   4,  25],
  [  8,  29,  68],
  [ 16,  60, 102],
  [ 22,  96, 128],
  [ 33, 135, 149],
  [ 64, 175, 160],
  [120, 210, 174],
  [190, 240, 210],
]);

const thermal = makeScheme([
  [  4,  10,  29],
  [ 20,  27,  77],
  [ 58,  28, 113],
  [103,  26, 114],
  [146,  33,  95],
  [184,  56,  65],
  [213,  95,  40],
  [235, 145,  23],
  [247, 199,  30],
  [245, 250,  88],
]);

const fire = makeScheme([
  [  0,   0,   0],
  [ 48,   0,   8],
  [102,   4,   0],
  [160,  24,   0],
  [210,  56,   0],
  [240, 102,   8],
  [252, 160,  32],
  [255, 220,  80],
  [255, 255, 180],
]);

const ice = makeScheme([
  [  4,   4,  20],
  [ 10,  20,  60],
  [ 20,  50, 110],
  [ 40,  90, 160],
  [ 80, 140, 200],
  [140, 185, 225],
  [200, 220, 240],
  [240, 248, 255],
]);

const neon = makeScheme([
  [ 10,   0,  40],
  [ 60,   0, 120],
  [160,   0, 200],
  [255,   0, 180],
  [255,  50, 100],
  [255, 120,  40],
  [255, 200,   0],
  [255, 255, 100],
]);

// ── Rainbow (HSL-based, not LUT) ────────────────────────────────

function rainbow(t) {
  return Color.hsl(Math.max(0, Math.min(1, t)) * 360, 80, 55);
}

// ── Export ────────────────────────────────────────────────────────

export const schemes = {
  // Scientific
  viridis, inferno, plasma, magma, cividis,
  // Artistic
  sunset, ocean, thermal, fire, ice, neon, rainbow,
  // Utilities
  reverse, join, schemeFrom,
};
