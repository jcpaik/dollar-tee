// Renderer — walks scene array, applies directives, draws shapes.
// Requires p5.js backend (set via setRendererP5 before first render).

import { Color } from './lib/color.js';

let _p5 = null;
export function setRendererP5(p) { _p5 = p; }

const DEFAULT_STATE = {
  fill: '#ffffff',
  stroke: null,
  lineWidth: 1,
  font: null,
  globalAlpha: 1,
  textSize: null,
  textFont: null,
};

// ── Primary flow: traverse scene array ──────────────────────────

export function renderScene(items, state) {
  if (!state) state = { ...DEFAULT_STATE };

  for (const item of items) {
    if (Array.isArray(item)) {
      _p5.push();
      renderScene(item, { ...state });
      _p5.pop();
      continue;
    }

    if (item instanceof Color) {
      state.fill = item.toCSS();
      continue;
    }

    if (item?._dir) {
      applyDirective(item, state);
      continue;
    }

    if (item?.type) {
      drawShape(item, state);
    }
  }
}

// ── Directive handling ──────────────────────────────────────────

function applyDirective(item, state) {
  if (item.action === 'bg') {
    _p5.background(item.value);
    return;
  }

  // Transform actions
  if (item.action === 'translate') { _p5.translate(item.x, item.y); return; }
  if (item.action === 'rotate')    { _p5.rotate(item.angle); return; }
  if (item.action === 'scale')     { _p5.scale(item.x, item.y); return; }

  // Style actions
  if (item.action === 'strokeCap')   { _p5.strokeCap(item.value); return; }
  if (item.action === 'strokeJoin')  { _p5.strokeJoin(item.value); return; }
  if (item.action === 'blendMode') {
    const mode = typeof item.value === 'string' ? _p5[item.value.toUpperCase()] || item.value : item.value;
    _p5.blendMode(mode);
    return;
  }
  if (item.action === 'rectMode')    { _p5.rectMode(item.value); return; }
  if (item.action === 'ellipseMode') { _p5.ellipseMode(item.value); return; }

  // Typography actions
  if (item.action === 'textAlign')  { _p5.textAlign(item.h, item.v); return; }
  if (item.action === 'textStyle')  { _p5.textStyle(item.value); return; }

  // Image actions
  if (item.action === 'tint')   { _p5.tint(item.value); return; }
  if (item.action === 'noTint') { _p5.noTint(); return; }

  // Clip action — draw mask shape inside beginClip/endClip
  if (item.action === 'clip') {
    _p5.beginClip({ invert: item.invert });
    drawShape(item.shape, state);
    _p5.endClip();
    return;
  }

  // Filter action
  if (item.action === 'filter') {
    const filterType = typeof item.type === 'string' ? _p5[item.type.toUpperCase()] || item.type : item.type;
    if (item.param !== undefined) {
      _p5.filter(filterType, item.param);
    } else {
      _p5.filter(filterType);
    }
    return;
  }

  // Property-based directives (fill, stroke, lineWidth, font, globalAlpha, textSize, textFont)
  if (item.prop) {
    state[item.prop] = item.value;
  }
}

// ── Shape drawing ──────────────────────────────────────────────

function drawShape(shape, state) {
  const p = _p5;

  const prevAlpha = p.drawingContext.globalAlpha;
  if (state.globalAlpha !== 1) p.drawingContext.globalAlpha = state.globalAlpha;

  if (state.fill) { p.fill(state.fill); } else { p.noFill(); }
  if (state.stroke) { p.stroke(state.stroke); p.strokeWeight(state.lineWidth || 1); } else { p.noStroke(); }

  switch (shape.type) {
    case 'circle':
      p.circle(shape.x, shape.y, Math.max(0, shape.r) * 2);
      break;
    case 'rect':
      p.rect(shape.x, shape.y, shape.w, shape.h);
      break;
    case 'line':
      p.line(shape.x1, shape.y1, shape.x2, shape.y2);
      break;
    case 'polyline':
      p.beginShape();
      for (const pt of shape.pts) p.vertex(pt.x, pt.y);
      p.endShape();
      break;
    case 'ellipse':
      p.ellipse(shape.x, shape.y, Math.max(0, shape.rx) * 2, Math.max(0, shape.ry) * 2);
      break;
    case 'arc':
      p.arc(shape.x, shape.y, Math.max(0, shape.r) * 2, Math.max(0, shape.r) * 2, shape.start, shape.end);
      break;
    case 'polygon':
      if (!shape.pts || shape.pts.length < 2) { p.drawingContext.globalAlpha = prevAlpha; return; }
      p.beginShape();
      for (const pt of shape.pts) p.vertex(pt.x, pt.y);
      p.endShape(p.CLOSE);
      break;
    case 'shape':
      p.beginShape();
      for (const pt of shape.points) p.vertex(pt.x, pt.y);
      p.endShape(shape.close ? p.CLOSE : undefined);
      break;
    case 'bezierShape':
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
      const size = state.textSize || shape.size || 16;
      p.textSize(size);
      p.textFont(state.textFont || state.font || 'monospace');
      p.text(shape.str, shape.x, shape.y);
      break;
    }
  }

  p.drawingContext.globalAlpha = prevAlpha;
}
