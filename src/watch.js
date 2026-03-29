// watch.js — Rate-limited value inspector with table display in bottom panel.
// watch(label, value, hz?) — logs at hz (default 3), returns value for inline use.

const entries = new Map();
let tableEl = null;

function fmt(v) {
  if (v == null) return String(v);
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return '[' + v.map(fmt).join(', ') + ']';
  if (v.toString !== Object.prototype.toString) return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

function ensureTable() {
  if (tableEl) return;
  const tab = document.getElementById('watch-tab');
  tableEl = document.createElement('table');
  tableEl.id = 'watch-table';
  tab.appendChild(tableEl);
}

let autoIdx = 0;

export function watch(label, value, hz = 3) {
  // watch(value) or watch(value, hz) — auto-label
  if (typeof label !== 'string' || arguments.length < 2) {
    hz = (value !== undefined) ? value : 3;
    value = label;
    label = `#${++autoIdx}`;
  }
  const now = performance.now() / 1000;
  const entry = entries.get(label);
  const interval = 1 / hz;

  if (entry && now - entry.lastTime < interval) return value;

  ensureTable();

  if (entry) {
    entry.lastTime = now;
    entry.valCell.textContent = fmt(value);
  } else {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.className = 'watch-label';
    labelCell.textContent = label;
    const valCell = document.createElement('td');
    valCell.className = 'watch-value';
    valCell.textContent = fmt(value);
    row.appendChild(labelCell);
    row.appendChild(valCell);
    tableEl.appendChild(row);
    entries.set(label, { lastTime: now, valCell });
  }

  console.log(`[${label}]`, value);
  return value;
}

watch.clear = () => {
  entries.clear();
  autoIdx = 0;
  if (tableEl) tableEl.innerHTML = '';
};
