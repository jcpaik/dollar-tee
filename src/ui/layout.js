// Layout — draggable sashes for editor↔canvas and bottom panel.

export function setupLayout({ onResize }) {
  const bottomPanel = document.getElementById('bottom-panel');
  const hSash       = document.getElementById('h-sash');
  const vSash       = document.getElementById('v-sash');
  const editorPane  = document.getElementById('editor-pane');

  // ── Horizontal sash — drag to resize bottom panel, snap to close ──

  const SNAP_ZONE = 30;

  function startHDrag(e) {
    e.preventDefault();
    hSash.classList.add('dragging');
    edgeZone.classList.add('dragging');

    const onMove = (ev) => {
      const bottomY = window.innerHeight - ev.clientY;
      if (bottomY < SNAP_ZONE) {
        bottomPanel.classList.add('collapsed');
        edgeZone.classList.add('snap');
      } else {
        bottomPanel.classList.remove('collapsed');
        edgeZone.classList.remove('snap');
        bottomPanel.style.height = bottomY + 'px';
      }
      onResize();
    };

    const onUp = () => {
      hSash.classList.remove('dragging');
      edgeZone.classList.remove('dragging');
      edgeZone.classList.remove('snap');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  hSash.addEventListener('mousedown', startHDrag);

  hSash.addEventListener('dblclick', () => {
    bottomPanel.classList.toggle('collapsed');
    if (!bottomPanel.classList.contains('collapsed')) bottomPanel.style.height = '';
    onResize();
  });

  // Bottom-edge drag zone — when panel is collapsed, dragging up from
  // the bottom edge of the screen reopens it.
  const edgeZone = document.createElement('div');
  edgeZone.id = 'edge-zone';
  document.body.appendChild(edgeZone);

  edgeZone.addEventListener('mousedown', (e) => {
    bottomPanel.classList.remove('collapsed');
    bottomPanel.style.height = '0px';
    startHDrag(e);
  });

  // ── Vertical sash — drag to resize editor ↔ canvas ──

  vSash.addEventListener('mousedown', (e) => {
    e.preventDefault();
    vSash.classList.add('dragging');

    const onMove = (ev) => {
      const pct = (ev.clientX / window.innerWidth) * 100;
      const clamped = Math.max(15, Math.min(85, pct));
      editorPane.style.width = clamped + '%';
      onResize();
    };

    const onUp = () => {
      vSash.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}
