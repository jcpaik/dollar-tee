# editor/

CodeMirror 6 integration with inline widgets for live parameter tweaking.

## Files

### editor.js

`createEditor(parent)` -- sets up CodeMirror 6 with syntax highlighting, one-dark theme, and custom extensions.

**API:**
- `getCode()` -- get document text
- `setCode(code)` -- replace document text
- `onChange(fn)` -- register change callback (fires on any edit)
- `onSliderChange(fn)` -- register callback for slider/picker-only changes (bypasses debounce)
- `view` -- raw CodeMirror `EditorView` instance

**Extensions loaded:**
- `basicSetup` (fold, bracket matching, search, etc.)
- `javascript()` syntax
- `oneDark` theme
- `valSliderExtension()` -- inline val() sliders
- `colorPickerExtension()` -- inline hex color picker
- Ctrl-S interception (prevents browser save dialog)

### color-picker.js

`colorPickerExtension()` -- CodeMirror extension for inline hex color editing.

- **Regex:** matches `'#rrggbb'` or `"#rrggbb"` (3- and 6-digit hex)
- **Decorations:** inline color swatch widget + underline on hex string
- **Click:** opens native OS color picker (`<input type="color">`)
- **On change:** rewrites hex string in-place in the editor
- **Hex expansion:** `#fff` -> `#ffffff` when picker opens
- `colorPickerChange` -- CodeMirror annotation that tags picker-originated edits

### val-slider.js

`valSliderExtension()` -- CodeMirror extension for inline parameter sliders.

- **Regex:** matches `val(current, min, max[, step])`
- **Decorations:** underline on val() calls
- **Click:** shows popover with range `<input>` slider + formatted value display
- **On drag:** rewrites the first argument (current value) in-place
- **Number formatting:** respects step precision; integer display if step >= 1
- **Toggle:** click again to dismiss (300ms debounce prevents re-open on same click)
- `valSliderChange` -- CodeMirror annotation that tags slider-originated edits
