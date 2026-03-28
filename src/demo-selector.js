// Demo selector — populates <select> with demos + saved sketches, dispatches changes.

export function createDemoSelector(selectEl, demos, listSketches) {
  let _onChange = null;

  function rebuild(currentKey) {
    selectEl.innerHTML = '';

    for (const name of Object.keys(demos)) {
      const opt = document.createElement('option');
      opt.value = 'demo:' + name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    }

    const saved = listSketches();
    if (saved.length > 0) {
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '\u2500\u2500 Saved \u2500\u2500';
      selectEl.appendChild(sep);

      for (const name of saved) {
        const opt = document.createElement('option');
        opt.value = 'sketch:' + name;
        opt.textContent = name;
        selectEl.appendChild(opt);
      }
    }

    if (currentKey) selectEl.value = currentKey;
  }

  selectEl.addEventListener('change', () => {
    if (_onChange) _onChange(selectEl.value);
  });

  rebuild();

  return {
    rebuild,
    select(val) { selectEl.value = val; },
    onChange(cb) { _onChange = cb; },
  };
}
