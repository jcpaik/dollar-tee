// Easing library — all 33 standard Penner easings (11 curves × 3 flavors).
// Each function takes t ∈ [0,1] and returns a value in [0,1] (with overshoot
// for Back/Elastic/Spring).

// ── Linear ────────────────────────────────────────────────────────

function easeLinear(t) { return t; }

// ── Sine ──────────────────────────────────────────────────────────

function easeInSine(t)    { return 1 - Math.cos(t * Math.PI / 2); }
function easeOutSine(t)   { return Math.sin(t * Math.PI / 2); }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

// ── Quad ──────────────────────────────────────────────────────────

function easeInQuad(t)    { return t * t; }
function easeOutQuad(t)   { return t * (2 - t); }
function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

// ── Cubic ─────────────────────────────────────────────────────────

function easeInCubic(t)    { return t * t * t; }
function easeOutCubic(t)   { const u = 1 - t; return 1 - u * u * u; }
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

// ── Quart ─────────────────────────────────────────────────────────

function easeInQuart(t)    { return t * t * t * t; }
function easeOutQuart(t)   { const u = 1 - t; return 1 - u * u * u * u; }
function easeInOutQuart(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }

// ── Quint ─────────────────────────────────────────────────────────

function easeInQuint(t)    { return t * t * t * t * t; }
function easeOutQuint(t)   { const u = 1 - t; return 1 - u * u * u * u * u; }
function easeInOutQuint(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2; }

// ── Expo ──────────────────────────────────────────────────────────

function easeInExpo(t)    { return t === 0 ? 0 : Math.pow(2, 10 * t - 10); }
function easeOutExpo(t)   { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutExpo(t) {
  if (t === 0 || t === 1) return t;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

// ── Circ ──────────────────────────────────────────────────────────

function easeInCirc(t)    { return 1 - Math.sqrt(1 - t * t); }
function easeOutCirc(t)   { return Math.sqrt(1 - (t - 1) * (t - 1)); }
function easeInOutCirc(t) {
  return t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}

// ── Back ──────────────────────────────────────────────────────────

const C1 = 1.70158;
const C2 = C1 * 1.525;
const C3 = C1 + 1;

function easeInBack(t)    { return C3 * t * t * t - C1 * t * t; }
function easeOutBack(t)   { const u = t - 1; return 1 + C3 * u * u * u + C1 * u * u; }
function easeInOutBack(t) {
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((C2 + 1) * 2 * t - C2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((C2 + 1) * (2 * t - 2) + C2) + 2) / 2;
}

// ── Elastic ───────────────────────────────────────────────────────

const C4 = (2 * Math.PI) / 3;
const C5 = (2 * Math.PI) / 4.5;

function easeInElastic(t) {
  if (t === 0 || t === 1) return t;
  return -Math.pow(2, 10 * t - 10) * Math.sin((10 * t - 10.75) * C4);
}

function easeOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return Math.pow(2, -10 * t) * Math.sin((10 * t - 0.75) * C4) + 1;
}

function easeInOutElastic(t) {
  if (t === 0 || t === 1) return t;
  return t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * C5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * C5)) / 2 + 1;
}

// ── Bounce ────────────────────────────────────────────────────────

function easeOutBounce(t) {
  const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1)         return n1 * t * t;
  if (t < 2 / d1)         return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1)       return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return                          n1 * (t -= 2.625 / d1) * t + 0.984375;
}

function easeInBounce(t)    { return 1 - easeOutBounce(1 - t); }
function easeInOutBounce(t) {
  return t < 0.5
    ? (1 - easeOutBounce(1 - 2 * t)) / 2
    : (1 + easeOutBounce(2 * t - 1)) / 2;
}

// ── Cubic Bezier ──────────────────────────────────────────────────
// CSS-style cubic-bezier(x1, y1, x2, y2). Returns easing function.

function cubicBezier(x1, y1, x2, y2) {
  // Newton-Raphson to solve for t given x, then evaluate y.
  return function bezierEase(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 8; i++) {
      const cx = 3 * x1 * t * (1 - t) * (1 - t) + 3 * x2 * t * t * (1 - t) + t * t * t - x;
      const dx = 3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t;
      if (Math.abs(dx) < 1e-8) break;
      t -= cx / dx;
    }
    t = Math.max(0, Math.min(1, t));

    return 3 * y1 * t * (1 - t) * (1 - t) + 3 * y2 * t * t * (1 - t) + t * t * t;
  };
}

// ── Spring Physics ────────────────────────────────────────────────
// spring(stiffness, damping) returns an easing function.
// Defaults: stiffness=100, damping=10 — a snappy, slightly bouncy spring.

function spring(stiffness = 100, damping = 10) {
  return function springEase(t) {
    if (t === 0 || t === 1) return t;
    const omega = Math.sqrt(stiffness);
    const zeta = damping / (2 * omega);
    if (zeta < 1) {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + (zeta * omega / wd) * Math.sin(wd * t));
    }
    // Critically/over-damped
    return 1 - (1 + omega * t) * Math.exp(-omega * t);
  };
}

// ── Lookup table ──────────────────────────────────────────────────
// Maps short names to functions for $interval.ease("outCubic") API.

export const EASING_MAP = {
  linear:       easeLinear,
  inSine:       easeInSine,       outSine:       easeOutSine,       inOutSine:       easeInOutSine,
  inQuad:       easeInQuad,       outQuad:       easeOutQuad,       inOutQuad:       easeInOutQuad,
  inCubic:      easeInCubic,      outCubic:      easeOutCubic,      inOutCubic:      easeInOutCubic,
  inQuart:      easeInQuart,      outQuart:      easeOutQuart,      inOutQuart:      easeInOutQuart,
  inQuint:      easeInQuint,      outQuint:      easeOutQuint,      inOutQuint:      easeInOutQuint,
  inExpo:       easeInExpo,       outExpo:       easeOutExpo,       inOutExpo:       easeInOutExpo,
  inCirc:       easeInCirc,       outCirc:       easeOutCirc,       inOutCirc:       easeInOutCirc,
  inBack:       easeInBack,       outBack:       easeOutBack,       inOutBack:       easeInOutBack,
  inElastic:    easeInElastic,    outElastic:    easeOutElastic,    inOutElastic:    easeInOutElastic,
  inBounce:     easeInBounce,     outBounce:     easeOutBounce,     inOutBounce:     easeInOutBounce,
};

// ── Exports ───────────────────────────────────────────────────────

export {
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
};
