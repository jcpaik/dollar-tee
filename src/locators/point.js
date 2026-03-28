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

  function updateDOM() {
    el.style.left = pos.x + 'px';
    el.style.top = pos.y + 'px';
    label.textContent = `$${name} (${Math.round(pos.x)}, ${Math.round(pos.y)})`;
  }
  updateDOM();

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
