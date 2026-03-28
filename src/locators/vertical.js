// Vertical line locator — translucent grey line, draggable horizontally.
// Returns x coordinate (number).

export function createVerticalLocator(name, x, overlay) {
  const el = document.createElement('div');
  el.className = 'locator-vline';
  el.innerHTML = `
    <div class="locator-vline-visual"></div>
    <span class="locator-label"></span>
  `;
  overlay.appendChild(el);

  const label = el.querySelector('.locator-label');
  const pos = { x };
  let hovered = false;

  function updateDOM() {
    el.style.left = pos.x + 'px';
    label.textContent = hovered ? `$${name} = ${Math.round(pos.x)}` : `$${name}`;
    const W = overlay.clientWidth;
    const lw = label.offsetWidth || 40;
    // Label: prefer right, fall back to left
    if (pos.x + lw + 14 > W) {
      label.style.left = ''; label.style.right = '10px';
    } else {
      label.style.left = '10px'; label.style.right = '';
    }
    label.style.top = '4px';
  }
  updateDOM();

  el.addEventListener('mouseenter', () => { hovered = true; updateDOM(); });
  el.addEventListener('mouseleave', () => { hovered = false; updateDOM(); });

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const startX = e.clientX, startPos = pos.x;

    function onMove(e) {
      pos.x = startPos + (e.clientX - startX);
      pos.x = Math.max(0, Math.min(overlay.clientWidth, pos.x));
      updateDOM();
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  return {
    type: 'vertical',
    el,
    getValue() { return pos.x; },
    remove() { el.remove(); },
  };
}
