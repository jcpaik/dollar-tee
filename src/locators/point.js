// Point locator — Mathematica-style crosshair + translucent circle.
// Draggable, returns vec2.

import { vec2 } from '../lib/vec.js';

export function createPointLocator(name, x, y, overlay) {
  const el = document.createElement('div');
  el.className = 'locator-point';
  el.innerHTML = `
    <div class="locator-point-circle"></div>
    <div class="locator-point-cross-h"></div>
    <div class="locator-point-cross-v"></div>
    <span class="locator-label"></span>
  `;
  overlay.appendChild(el);

  const label = el.querySelector('.locator-label');
  const pos = { x, y };

  let hovered = false;

  function updateDOM() {
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    label.textContent = hovered
      ? `$${name} = (${Math.round(pos.x)}, ${Math.round(pos.y)})`
      : `$${name}`;

    // Position label to avoid clipping
    const W = overlay.clientWidth, H = overlay.clientHeight;
    const lw = label.offsetWidth, lh = label.offsetHeight;
    // Vertical: prefer above, fall back to below
    if (pos.y < lh + 20) {
      label.style.top = '18px'; label.style.bottom = '';
    } else {
      label.style.top = ''; label.style.bottom = (el.offsetHeight - 6) + 'px';
    }
    // Horizontal: center, but clamp to overlay edges
    const halfLw = lw / 2;
    if (pos.x - halfLw < 0) {
      label.style.left = -pos.x + 'px'; label.style.transform = '';
    } else if (pos.x + halfLw > W) {
      label.style.left = ''; label.style.right = -(W - pos.x) + 'px'; label.style.transform = '';
    } else {
      label.style.left = '50%'; label.style.right = ''; label.style.transform = 'translateX(-50%)';
    }
  }
  updateDOM();

  el.addEventListener('mouseenter', () => { hovered = true; updateDOM(); });
  el.addEventListener('mouseleave', () => { if (!el.classList.contains('dragging')) { hovered = false; updateDOM(); } });

  // Drag
  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = overlay.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const startPosX = pos.x, startPosY = pos.y;

    el.classList.add('dragging');
    function onMove(e) {
      pos.x = startPosX + (e.clientX - startX);
      pos.y = startPosY + (e.clientY - startY);
      pos.x = Math.max(0, Math.min(overlay.clientWidth, pos.x));
      pos.y = Math.max(0, Math.min(overlay.clientHeight, pos.y));
      updateDOM();
    }
    function onUp() {
      el.classList.remove('dragging');
      hovered = false;
      updateDOM();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  return {
    type: 'point',
    el,
    getValue() { return vec2(pos.x, pos.y); },
    remove() { el.remove(); },
  };
}
