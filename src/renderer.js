// Renderer — walks scene array, applies directives, draws shapes.
// Supports p5.js (primary) and Canvas2D fallback.

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

export function renderScene(ctx, items, state) {
  if (!state) state = { ...DEFAULT_STATE };

  for (const item of items) {
    if (Array.isArray(item)) {
      if (_p5) _p5.push();
      renderScene(ctx, item, { ...state });
      if (_p5) _p5.pop();
      continue;
    }

    if (item instanceof Color) {
      state.fill = item.toCSS();
      continue;
    }

    if (item?._dir) {
      applyDirective(ctx, item, state);
      continue;
    }

    if (item?.type) {
      drawShape(ctx, item, state);
    }
  }
}

// ── Directive handling ──────────────────────────────────────────

function applyDirective(ctx, item, state) {
  if (item.action === 'bg') {
    if (_p5) {
      _p5.background(item.value);
    } else {
      ctx.fillStyle = item.value;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    return;
  }

  // Transform actions
  if (item.action === 'translate') { if (_p5) _p5.translate(item.x, item.y); return; }
  if (item.action === 'rotate')    { if (_p5) _p5.rotate(item.angle); return; }
  if (item.action === 'scale')     { if (_p5) _p5.scale(item.x, item.y); return; }

  // Style actions
  if (item.action === 'strokeCap')   { if (_p5) _p5.strokeCap(item.value); return; }
  if (item.action === 'strokeJoin')  { if (_p5) _p5.strokeJoin(item.value); return; }
  if (item.action === 'blendMode') {
    if (_p5) {
      const mode = typeof item.value === 'string' ? _p5[item.value.toUpperCase()] || item.value : item.value;
      _p5.blendMode(mode);
    }
    return;
  }
  if (item.action === 'rectMode')    { if (_p5) _p5.rectMode(item.value); return; }
  if (item.action === 'ellipseMode') { if (_p5) _p5.ellipseMode(item.value); return; }

  // Typography actions
  if (item.action === 'textAlign')  { if (_p5) _p5.textAlign(item.h, item.v); return; }
  if (item.action === 'textStyle')  { if (_p5) _p5.textStyle(item.value); return; }

  // Image actions
  if (item.action === 'tint')   { if (_p5) _p5.tint(item.value); return; }
  if (item.action === 'noTint') { if (_p5) _p5.noTint(); return; }

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
    return;
  }

  // Property-based directives (fill, stroke, lineWidth, font, globalAlpha, textSize, textFont)
  if (item.prop) {
    state[item.prop] = item.value;
  }
}

// ── Shape drawing (p5) ──────────────────────────────────────────

function drawShape(ctx, shape, state) {
  if (!_p5) { drawShapeCanvas(ctx, shape, state); return; }

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
    case 'ellipse':
      p.ellipse(shape.x, shape.y, Math.max(0, shape.rx) * 2, Math.max(0, shape.ry) * 2);
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
      if (state.textSize) {
        p.textSize(state.textSize);
        p.textFont(state.textFont || 'monospace');
      } else {
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

  p.drawingContext.globalAlpha = prevAlpha;
}

// ── Shape drawing (Canvas2D fallback) ───────���───────────────────

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
