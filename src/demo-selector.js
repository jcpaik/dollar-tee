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

  function setShared() {
    const opt = document.createElement('option');
    opt.value = '__shared__';
    opt.textContent = '(shared)';
    selectEl.prepend(opt);
    selectEl.value = '__shared__';
  }

  function clearShared() {
    const opt = selectEl.querySelector('option[value="__shared__"]');
    if (opt) opt.remove();
  }

  return {
    rebuild,
    select(val) { selectEl.value = val; },
    onChange(cb) { _onChange = cb; },
    setShared,
    clearShared,
  };
}
