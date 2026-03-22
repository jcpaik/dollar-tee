// Editor — CodeMirror 6 setup

import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

export function createEditor(parent) {
  let changeCb = null;

  const state = EditorState.create({
    doc: '',
    extensions: [
      basicSetup,
      javascript(),
      oneDark,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && changeCb) changeCb();
      }),
      EditorView.theme({
        '&': { height: '100%', fontSize: '14px' },
        '.cm-scroller': { overflow: 'auto', fontFamily: "'Menlo', 'Consolas', monospace" },
        '.cm-content': { lineHeight: '1.6' },
      }),
      // Prevent Ctrl-S from reaching the browser
      EditorView.domEventHandlers({
        keydown(e) {
          if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
          }
        }
      }),
    ],
  });

  const view = new EditorView({ state, parent });

  return {
    getCode() {
      return view.state.doc.toString();
    },
    setCode(code) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: code },
      });
    },
    onChange(fn) { changeCb = fn; },
    view,
  };
}
