// Compiler — takes user code (string), returns a draw(ctx, t, W, H) function.
// All stdlib names are injected as local variables so user code can reference
// them directly (no destructuring needed).
// render() can be called anywhere; return [...] still works as fallback.

import { renderScene } from './stdlib.js';

// probe(expr) → probe('expr', expr)  — auto-label single-arg calls
function transformProbe(code) {
  const out = [];
  let i = 0;

  while (i < code.length) {
    const idx = code.indexOf('probe(', i);
    if (idx === -1) { out.push(code.slice(i)); break; }

    if (idx > 0 && /[a-zA-Z0-9_$]/.test(code[idx - 1])) {
      out.push(code.slice(i, idx + 6));
      i = idx + 6;
      continue;
    }

    out.push(code.slice(i, idx));

    let depth = 1, j = idx + 6, comma = -1;
    outer: while (j < code.length && depth > 0) {
      switch (code[j]) {
        case '(': depth++; break;
        case ')': if (--depth === 0) break outer; break;
        case ',': if (depth === 1 && comma === -1) comma = j; break;
        case "'": case '"': case '`': {
          const q = code[j]; j++;
          while (j < code.length) {
            if (code[j] === '\\') { j += 2; continue; }
            if (code[j] === q) break;
            j++;
          }
          break;
        }
      }
      j++;
    }

    if (depth === 0 && comma === -1) {
      const arg = code.slice(idx + 6, j).trim();
      if (arg && arg[0] !== "'" && arg[0] !== '"' && arg[0] !== '`') {
        out.push(`probe('${arg.replace(/'/g, "\\'")}', ${arg})`);
      } else {
        out.push(code.slice(idx, j + 1));
      }
    } else {
      out.push(code.slice(idx, j + 1));
    }
    i = j + 1;
  }

  return out.join('');
}

export function compile(code, stdlib) {
  const names = Object.keys(stdlib);
  // Inject render() as a local that captures ctx at call time
  const wrapped = 'const render = (...items) => __renderScene__(ctx, items);\n' + transformProbe(code);
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
