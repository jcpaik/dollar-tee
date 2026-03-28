// Horizontal line locator — translucent grey line, draggable vertically.
// Returns y coordinate (number).

export function createHorizontalLocator(name, y, overlay, onDragEnd) {
  const el = document.createElement('div');
  el.className = 'locator-hline';
  el.innerHTML = `
    <div class="locator-hline-visual"></div>
    <span class="locator-label"></span>
  `;
  overlay.appendChild(el);

  const label = el.querySelector('.locator-label');
  const pos = { y };
  let hovered = false;

  function updateDOM() {
    el.style.top = pos.y + 'px';
    label.textContent = hovered ? `$${name} = ${Math.round(pos.y)}` : `$${name}`;
    // Label: prefer above, fall back to below
    if (pos.y < 20) {
      label.style.top = '8px'; label.style.bottom = '';
    } else {
      label.style.top = '-16px'; label.style.bottom = '';
    }
    label.style.left = '4px';
  }
  updateDOM();

  el.addEventListener('mouseenter', () => { hovered = true; updateDOM(); });
  el.addEventListener('mouseleave', () => { hovered = false; updateDOM(); });

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const startY = e.clientY, startPos = pos.y;

    function onMove(e) {
      pos.y = startPos + (e.clientY - startY);
      pos.y = Math.max(0, Math.min(overlay.clientHeight, pos.y));
      updateDOM();
    }
    function onUp() {
      if (onDragEnd) onDragEnd();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  return {
    type: 'horizontal',
    el,
    getValue() { return pos.y; },
    remove() { el.remove(); },
  };
}
