// p5 initialization — creates a p5 instance in instance mode.
// Dollar-tee owns the animation loop, so we call p.noLoop().

import p5 from 'p5';

export function createP5(container) {
  return new Promise((resolve) => {
    new p5((p) => {
      p.setup = () => {
        p.createCanvas(container.clientWidth, container.clientHeight);
        p.canvas.id = 'canvas';  // keep existing CSS working
        p.noLoop();
        resolve(p);
      };
    }, container);
  });
}
