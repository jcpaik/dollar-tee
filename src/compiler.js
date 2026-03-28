// Compiler — takes user code (string), returns a draw function.
// All stdlib names are injected as local variables so user code can reference
// them directly (no destructuring needed).
// render() can be called anywhere; return [...] still works as fallback.

import { renderScene } from './renderer.js';

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

// $$foo → __state__["foo"]  — rewrite stateful variable references
function transformState(code) {
  return code.replace(/\$\$([a-zA-Z_][a-zA-Z0-9_]*)/g, '__state__["$1"]');
}

// Number of lines the compiler prepends before user code.
const PREAMBLE_LINES = 1;

// Extract user-code line number from an error.
// SyntaxError: browsers embed line info in the message.
// Runtime errors: parse the <anonymous>:line:col from the stack.
function extractErrorLine(e) {
  // Try stack trace first (runtime errors): <anonymous>:LINE:COL
  if (e.stack) {
    const m = e.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (m) return { line: parseInt(m[1]) - PREAMBLE_LINES, col: parseInt(m[2]) };
  }
  // SyntaxError: some browsers put (LINE:COL) in the message
  const m2 = e.message && e.message.match(/\((\d+):(\d+)\)/);
  if (m2) return { line: parseInt(m2[1]) - PREAMBLE_LINES, col: parseInt(m2[2]) };
  return null;
}

export function compile(code, stdlib, state, p5Instance) {
  const names = Object.keys(stdlib);
  const transformed = transformState(transformProbe(code));
  const wrapped = 'const render = (...items) => __renderScene__(items);\n' + transformed;

  let fn;
  try {
    fn = new Function('__renderScene__', '__state__', 'p', ...names, wrapped);
  } catch (e) {
    const loc = extractErrorLine(e);
    if (loc && loc.line > 0) e.loc = loc;
    throw e;
  }

  return () => {
    // Re-evaluate stdlib values each frame so reactive getters ($time, $mouse, etc.) are current
    const values = Object.values(stdlib);
    try {
      const result = fn(renderScene, state, p5Instance, ...values);
      // Backward compat: return [...] still renders
      if (Array.isArray(result)) {
        renderScene(result);
      }
    } catch (e) {
      const loc = extractErrorLine(e);
      if (loc && loc.line > 0) e.loc = loc;
      throw e;
    }
  };
}
