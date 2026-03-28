// Persist — localStorage helpers for UI state.
// All keys are prefixed with 'dt:' to avoid collisions.

const PREFIX = 'dt:';

export function load(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch { return undefined; }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* quota exceeded — silently ignore */ }
}
