// Compiler — takes user code (string), returns a draw(ctx, t, W, H) function.
// All stdlib names are injected as local variables so user code can reference
// them directly (no destructuring needed).
// If user code returns an array, it's rendered as a declarative scene.

import { renderScene } from './stdlib.js';

export function compile(code, stdlib) {
  const names = Object.keys(stdlib);
  const fn = new Function('ctx', 't', 'W', 'H', ...names, code);
  const values = Object.values(stdlib);

  return (ctx, t, W, H) => {
    const result = fn(ctx, t, W, H, ...values);
    if (Array.isArray(result)) {
      renderScene(ctx, result);
    }
  };
}
