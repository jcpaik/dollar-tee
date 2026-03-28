// Sketch persistence — file-backed via Vite dev server API.

let _cache = [];  // [{name, code}, ...]

export async function fetchSketches() {
  const res = await fetch('/api/sketches');
  _cache = await res.json();
  return _cache;
}

export function listSketches() {
  return _cache.map(s => s.name);
}

export function getSketchCode(name) {
  const s = _cache.find(s => s.name === name);
  return s ? s.code : null;
}

export async function saveSketch(name, code) {
  await fetch(`/api/sketches/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  const existing = _cache.find(s => s.name === name);
  if (existing) existing.code = code;
  else _cache.push({ name, code });
}

export async function deleteSketch(name) {
  await fetch(`/api/sketches/${encodeURIComponent(name)}`, { method: 'DELETE' });
  _cache = _cache.filter(s => s.name !== name);
}
