// Engine — owns the animation loop and global time.
// The draw function is swapped on recompile; the loop never stops.
// See src/engine/README.md for rAF throttling behavior and p5.js relationship.

import { updateReactiveState } from './stdlib.js';

export function createEngine(canvas, p5Instance) {
  const ctx = canvas.getContext('2d');
  const p = p5Instance;
  const startTime = performance.now();
  let drawFn = () => {};
  let running = false;
  let tickCb = null;
  let errorCb = null;
  let preTickCb = null;
  let timeSource = null;
  let drawMs = 0;
  let frameGapMs = 0;
  let lastLoopTime = 0;
  const state = {};  // persistent $$vars backing store

  function getTime() {
    if (timeSource) return timeSource();
    return (performance.now() - startTime) / 1000;
  }

  function loop() {
    if (!running) return;
    const loopNow = performance.now();
    if (lastLoopTime) frameGapMs = loopNow - lastLoopTime;
    lastLoopTime = loopNow;
    const t = getTime();
    if (preTickCb) preTickCb(t);
    const W = p ? p.width : canvas.width;
    const H = p ? p.height : canvas.height;

    updateReactiveState(t, W, H, p);

    try {
      const t0 = performance.now();
      drawFn(ctx);
      drawMs = performance.now() - t0;
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
    getCtx()      { return ctx; },
    getDrawMs()   { return drawMs; },
    getFrameGapMs() { return frameGapMs; },
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
