// Sketch selector — populates <select> from the API sketch list.

export function createSketchSelector(selectEl, listSketches) {
  let _onChange = null;

  function rebuild(currentName) {
    selectEl.innerHTML = '';
    for (const name of listSketches()) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    }
    if (currentName) selectEl.value = currentName;
  }

  selectEl.addEventListener('change', () => {
    if (_onChange) _onChange(selectEl.value);
  });

  return {
    rebuild,
    select(val) { selectEl.value = val; },
    onChange(cb) { _onChange = cb; },
  };
}
