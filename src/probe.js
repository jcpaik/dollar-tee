// probe.js — Rate-limited value inspector with on-screen HUD.
// probe(label, value, hz?) — logs at hz (default 3), returns value for inline use.

const entries = new Map();
let panelEl = null;

function fmt(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return JSON.stringify(v);
  if (v != null && v.toString !== Object.prototype.toString) return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

function ensurePanel() {
  if (panelEl) return;
  panelEl = document.createElement('div');
  panelEl.id = 'probe-panel';
  document.getElementById('editor-pane').appendChild(panelEl);
}

export function probe(label, value, hz = 3) {
  const now = performance.now() / 1000;
  const entry = entries.get(label);
  const interval = 1 / hz;

  if (entry && now - entry.lastTime < interval) return value;

  ensurePanel();

  if (entry) {
    entry.lastTime = now;
    entry.valSpan.textContent = ' ' + fmt(value);
  } else {
    const el = document.createElement('div');
    const lbl = document.createElement('span');
    lbl.className = 'probe-label';
    lbl.textContent = label + ':';
    const valSpan = document.createElement('span');
    valSpan.textContent = ' ' + fmt(value);
    el.appendChild(lbl);
    el.appendChild(valSpan);
    panelEl.appendChild(el);
    entries.set(label, { lastTime: now, valSpan });
  }

  console.log(`[${label}]`, value);
  return value;
}

probe.clear = () => {
  entries.clear();
  if (panelEl) panelEl.innerHTML = '';
};
