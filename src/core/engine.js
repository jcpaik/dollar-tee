// Engine — owns the animation loop and global time.
// The draw function is swapped on recompile; the loop never stops.

import { updateReactiveState } from './stdlib.js';

export function createEngine(p5Instance) {
  const p = p5Instance;
  const startTime = performance.now();
  let drawFn = () => {};
  let running = false;
  let tickCb = null;
  let errorCb = null;
  let preTickCb = null;
  let timeSource = null;
  const state = {};  // persistent $$vars backing store

  function getTime() {
    if (timeSource) return timeSource();
    return (performance.now() - startTime) / 1000;
  }

  function loop() {
    if (!running) return;
    const t = getTime();
    if (preTickCb) preTickCb(t);

    updateReactiveState(t, p.width, p.height, p);

    try {
      drawFn();
    } catch (e) {
      if (errorCb) errorCb(e);
    }

    if (tickCb) tickCb(t);
    requestAnimationFrame(loop);
  }

  return {
    start()       { running = true; requestAnimationFrame(loop); },
    stop()        { running = false; },
    getTime,
    getP5()       { return p; },
    getState()    { return state; },
    setDraw(fn)   { drawFn = fn; },
    clearState(key) { delete state[key]; },
    clearAll()    { for (const k in state) delete state[k]; },
    set onTick(fn)  { tickCb = fn; },
    set onError(fn) { errorCb = fn; },
    set onPreTick(fn) { preTickCb = fn; },
    setTimeSource(fn) { timeSource = fn; },
  };
}
