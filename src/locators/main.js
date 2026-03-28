// Locator system — registry, overlay, context menu, stdlib getter export.

import { createPointLocator } from './point.js';
import { createHorizontalLocator } from './horizontal.js';
import { createVerticalLocator } from './vertical.js';
import { save } from '../ui/persist.js';

const locators = new Map();  // name → { type, el, getValue(), remove() }
let overlay = null;
let menu = null;
let onChangeCb = null;

// ── Setup ────────────────────────────────────────────────────────

export function setupLocators(canvasPane, onLocatorChange) {
  onChangeCb = onLocatorChange;

  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'locator-overlay';
  canvasPane.appendChild(overlay);

  // Create context menu (reusable, hidden by default)
  menu = document.createElement('div');
  menu.id = 'locator-menu';
  overlay.appendChild(menu);

  // Right-click on canvas pane → show menu
  canvasPane.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    // Don't show "add" menu if right-clicking a locator element
    if (e.target.closest('.locator-point, .locator-hline, .locator-vline')) {
      showDeleteMenu(e);
      return;
    }
    showAddMenu(e);
  });

  // Dismiss menu on click outside or Escape
  document.addEventListener('mousedown', (e) => {
    if (!menu.contains(e.target)) hideMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideMenu();
  });
}

// ── Context menu ─────────────────────────────────────────────────

let pendingType = null;
let pendingX = 0, pendingY = 0;

function showAddMenu(e) {
  const rect = overlay.getBoundingClientRect();
  pendingX = e.clientX - rect.left;
  pendingY = e.clientY - rect.top;

  menu.innerHTML = `
    <div class="menu-item" data-action="point">Add point locator</div>
    <div class="menu-item" data-action="horizontal">Add horizontal line</div>
    <div class="menu-item" data-action="vertical">Add vertical line</div>
  `;
  positionMenu(e.clientX - rect.left, e.clientY - rect.top);
  menu.style.display = 'block';

  menu.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => {
      pendingType = item.dataset.action;
      showNameInput();
    });
  });
}

function showDeleteMenu(e) {
  const el = e.target.closest('.locator-point, .locator-hline, .locator-vline');
  if (!el) return;
  const name = findLocatorName(el);
  if (!name) return;

  const rect = overlay.getBoundingClientRect();
  menu.innerHTML = `<div class="menu-item" data-action="delete">Delete $${name}</div>`;
  positionMenu(e.clientX - rect.left, e.clientY - rect.top);
  menu.style.display = 'block';

  menu.querySelector('.menu-item').addEventListener('click', () => {
    deleteLocator(name);
    hideMenu();
  });
}

function showNameInput() {
  menu.innerHTML = `
    <div class="name-input-row">
      <span class="name-prefix">$</span>
      <input class="name-input" type="text" placeholder="name" autofocus>
    </div>
  `;
  const input = menu.querySelector('.name-input');
  input.focus();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const name = input.value.trim();
      if (name && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name) && !locators.has(name)) {
        addLocator(pendingType, name, pendingX, pendingY);
        hideMenu();
      }
      e.preventDefault();
    }
    if (e.key === 'Escape') hideMenu();
    e.stopPropagation();
  });
}

function positionMenu(x, y) {
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function hideMenu() {
  menu.style.display = 'none';
  pendingType = null;
}

// ── Locator CRUD ─────────────────────────────────────────────────

function saveLocatorState() {
  const arr = [];
  for (const [name, loc] of locators) {
    const v = loc.getValue();
    const entry = { name, type: loc.type };
    if (loc.type === 'point') { entry.x = v.x; entry.y = v.y; }
    else if (loc.type === 'horizontal') { entry.y = v; }
    else if (loc.type === 'vertical') { entry.x = v; }
    arr.push(entry);
  }
  save('locators', arr);
}

function addLocator(type, name, x, y) {
  let locator;
  switch (type) {
    case 'point':      locator = createPointLocator(name, x, y, overlay, saveLocatorState); break;
    case 'horizontal': locator = createHorizontalLocator(name, y, overlay, saveLocatorState); break;
    case 'vertical':   locator = createVerticalLocator(name, x, overlay, saveLocatorState); break;
  }
  locators.set(name, locator);
  saveLocatorState();
  if (onChangeCb) onChangeCb();
}

function deleteLocator(name) {
  const locator = locators.get(name);
  if (locator) {
    locator.remove();
    locators.delete(name);
    saveLocatorState();
    if (onChangeCb) onChangeCb();
  }
}

export function restoreLocators(arr) {
  if (!arr || !overlay) return;
  for (const { name, type, x, y } of arr) {
    addLocator(type, name, x ?? 0, y ?? 0);
  }
}

function findLocatorName(el) {
  for (const [name, loc] of locators) {
    if (loc.el === el || loc.el.contains(el)) return name;
  }
  return null;
}

// ── Stdlib integration ───────────────────────────────────────────

export function getLocatorGetters() {
  const obj = {};
  for (const [name, locator] of locators) {
    Object.defineProperty(obj, '$' + name, {
      get: () => locator.getValue(),
      enumerable: true,
      configurable: true,
    });
  }
  return obj;
}

// ── Visibility toggle ────────────────────────────────────────────

let visible = true;

export function toggleLocators() {
  visible = !visible;
  if (overlay) overlay.style.display = visible ? '' : 'none';
  return visible;
}

// ── Resize sync ──────────────────────────────────────────────────

export function syncOverlay() {
  // Overlay is position:absolute, 100%x100% of canvas-pane — no sync needed
  // unless canvas becomes smaller than pane (future: aspect ratio constraints)
}
