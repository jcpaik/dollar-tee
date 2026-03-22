// Engine — owns the animation loop and global time.
// The draw function is swapped on recompile; the loop never stops.

export function createEngine(canvas) {
  const ctx = canvas.getContext('2d');
  const startTime = performance.now();
  let drawFn = () => {};
  let running = false;
  let tickCb = null;
  let errorCb = null;

  function getTime() {
    return (performance.now() - startTime) / 1000;
  }

  function loop() {
    if (!running) return;
    const t = getTime();
    const W = canvas.width;
    const H = canvas.height;

    try {
      drawFn(ctx, t, W, H);
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
    setDraw(fn)   { drawFn = fn; },
    set onTick(fn)  { tickCb = fn; },
    set onError(fn) { errorCb = fn; },
  };
}
