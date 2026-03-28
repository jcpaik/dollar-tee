// Sketch persistence — localStorage save/load/delete/list.

const PREFIX = 'dt-sketch:';

export function listSketches() {
  const names = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) names.push(key.slice(PREFIX.length));
  }
  return names.sort();
}

export function saveSketch(name, code) {
  localStorage.setItem(PREFIX + name, code);
}

export function loadSketch(name) {
  return localStorage.getItem(PREFIX + name);
}

export function deleteSketch(name) {
  localStorage.removeItem(PREFIX + name);
}
