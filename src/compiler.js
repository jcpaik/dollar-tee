// Compiler — takes user code (string), returns a draw(ctx, t, W, H) function.
// All stdlib names are injected as local variables so user code can reference
// them directly (no destructuring needed).
// render() can be called anywhere; return [...] still works as fallback.

import { renderScene } from './stdlib.js';

export function compile(code, stdlib) {
  const names = Object.keys(stdlib);
  // Inject render() as a local that captures ctx at call time
  const wrapped = 'const render = (...items) => __renderScene__(ctx, items);\n' + code;
  const fn = new Function('ctx', 't', 'W', 'H', '__renderScene__', ...names, wrapped);
  const values = Object.values(stdlib);

  return (ctx, t, W, H) => {
    const result = fn(ctx, t, W, H, renderScene, ...values);
    // Backward compat: return [...] still renders
    if (Array.isArray(result)) {
      renderScene(ctx, result);
    }
  };
}
