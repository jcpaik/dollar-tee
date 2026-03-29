// Sketch persistence — file-backed via Vite dev server API,
// falls back to static sketches.json in production builds.

let _cache = [];  // [{name, code}, ...]

export async function fetchSketches() {
  const url = import.meta.env.DEV ? '/api/sketches' : `${import.meta.env.BASE_URL}sketches.json`;
  const res = await fetch(url);
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
  if (import.meta.env.DEV) {
    await fetch(`/api/sketches/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
  }
  const existing = _cache.find(s => s.name === name);
  if (existing) existing.code = code;
  else _cache.push({ name, code });
}

export async function deleteSketch(name) {
  if (import.meta.env.DEV) {
    await fetch(`/api/sketches/${encodeURIComponent(name)}`, { method: 'DELETE' });
  }
  _cache = _cache.filter(s => s.name !== name);
}
