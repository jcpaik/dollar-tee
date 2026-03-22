# dollar-tee: Ecosystem Landscape

Nothing in the p5.js / creative coding ecosystem combines all of dollar-tee's pieces. The gap is real.

## Closest Overall Comparisons

### P5LIVE
- **URL**: https://teddavis.org/p5live/ | [GitHub](https://github.com/ffd8/P5LIVE)
- The nearest match. Browser-based p5.js live-coding editor, auto-compiles on keystroke, sketch saving, code+canvas split. Collaborative editing (COCODING), pop-up visual-only window, built-in p5.js reference.
- **Missing**: No audio timeline, no beat grid, no custom stdlib. Its "SoniCode" feature sonifies keystrokes — it doesn't sync visuals to music.
- **Actively maintained**: Yes, by Ted Davis. Presented at ICLC 2023.

### Gibber
- **URL**: https://gibber.cc/ | [GitHub](https://github.com/gibber-cc/gibber)
- Unified audio+visual live coding in the browser, pure JavaScript, sequencing built in. Combines music synthesis + sequencing with ray-marching 3D graphics. Supports p5.js/Hydra integration.
- **Missing**: Visuals are ray-marched 3D (not Canvas2D), no beat grid UI, no custom drawing stdlib.
- **Actively maintained**: Yes, by Charlie Roberts.

### Strudel
- **URL**: https://strudel.cc/ | [GitHub (archived)](https://github.com/tidalcycles/strudel) | Now on [Codeberg](https://codeberg.org)
- Best beat/pattern model in the browser. TidalCycles ported to JS with cycle-based timing and inline code visualizations (scope, FFT, piano roll). Mini-notation for concise rhythmic patterns: `"bd sd [hh hh] cp"`.
- **Missing**: Music-first — visuals are oscilloscopes/piano rolls, not generative Canvas2D art. No canvas drawing, no custom drawing stdlib.
- **Actively maintained**: Yes, moved from GitHub to Codeberg.

## By Feature

| dollar-tee feature | Who does it | What they're missing |
|---|---|---|
| Code editor + Canvas2D output | p5.js Web Editor, P5LIVE, OpenProcessing | No auto-run (p5 editor), no audio sync |
| Auto-run on code change | P5LIVE, Hydra, LiveCodeLab | No beat grid/timeline |
| Audio/beat-synced visuals | Strudel, Gibber, Sonic Pi+OSC, TidalCycles | No Canvas2D drawing canvas |
| Beat grid / timeline UI | *Nobody in the browser creative coding space* | — |
| Custom drawing stdlib (declarative scene tree) | Hydra (chained DSL), LiveCodeLab (custom lang) | Not Canvas2D; not JS-native |
| Sketch saving (localStorage) | p5.js Editor, P5LIVE, OpenProcessing | — |

## Live Coding Editors

### p5.js Web Editor
- **URL**: https://editor.p5js.org/ | [GitHub](https://github.com/processing/p5.js-web-editor)
- The official browser-based editor for p5.js. Code editor on the left, canvas output on the right. Sketch saving/sharing, JS console, library inclusion.
- Does NOT auto-run on code change (you must press play). No audio timeline, no beat grid, no custom DSL.
- **Actively maintained**: Yes, by the Processing Foundation. Currently undergoing TypeScript migration. p5.js 2.0 released April 2025 (variable fonts, JS-based shaders, OKLCH colors, async/await).

### HY5LIVE
- **URL**: https://hy5live.teddavis.org/ | [GitHub](https://github.com/ffd8/HY5LIVE)
- Minimal live-coding editor bridging Hydra-synth and p5.js. Pass visuals between both frameworks. Smooth compilation between both libraries.
- No audio timeline, no beat grid, no custom stdlib. More of a mashup environment.
- **Actively maintained**: Yes, by Ted Davis. Presented at ICLC 2025.

### OpenProcessing
- **URL**: https://openprocessing.org/
- Online creative coding platform for p5.js. Code editor + canvas output, one-click library enabling, sketch forking/remixing, portfolio creation, class/assignment system for educators.
- No auto-run on code change. No audio timeline, no beat grid, no custom DSL. Community/education platform, not a performance tool.
- **Actively maintained**: Yes, commercial platform with Plus+ tier.

### canvas-sketch
- **URL**: [GitHub](https://github.com/mattdesl/canvas-sketch)
- CLI tool + JS library for generative art. Scaffolds sketch files, hot-reloading in browser, Cmd+S to export high-res PNG. Companion utility library (canvas-sketch-util) with math/random/color helpers.
- Local dev tool (CLI + browser), not a self-contained browser editor. No audio features.
- **Actively maintained**: In beta by Matt DesLauriers. Widely used but last significant updates were a few years ago.

## Music / Audio-Reactive Visuals

### p5.sound Library
- **URL**: https://p5js.org/reference/p5.sound/
- Built on Web Audio API. `p5.Amplitude` (volume/RMS), `p5.FFT` (frequency domain), `p5.PeakDetect` (beat/onset detection), `p5.Oscillator`, `p5.SoundFile`, `p5.AudioIn` (mic input).
- PeakDetect provides basic beat detection but it's reactive/passive — detects peaks in incoming audio, not syncing to a known BPM/beat grid. No timeline, no beat grid UI, no transport controls. A building block, not a tool.
- **Actively maintained**: Yes, by the Processing Foundation.

### Tone.js
- **URL**: https://tonejs.github.io/ | [GitHub](https://github.com/Tonejs/Tone.js)
- Web Audio framework with DAW-like features. `Tone.Transport` is a tempo-aware clock with BPM scheduling, tempo curves, automation, subdivision-based timing. Prebuilt synths, effects, instruments.
- The strongest JS library for beat grid / timeline timing. But it's a library — no UI, no code editor, no canvas. Complementary, not competing.
- **Actively maintained**: Yes, very actively maintained.

### Synesthesia
- **URL**: https://synesthesia.live/
- Professional VJ software / live music visualizer. 80+ scenes, advanced audio algorithms for automatic beat-synced visuals, MIDI & OSC controls, Syphon/Spout/NDI output, built-in GLSL live coding.
- Desktop app (not browser), shader-based (not Canvas2D), scene-oriented rather than code-first.
- **Actively maintained**: Yes, commercial product.

### Nuvotion (formerly AVsync.LIVE)
- **URL**: https://nuvotion.live/
- Free browser-based tool for audio-reactive visuals. Real-time audio analysis, multiple cameras, motion tracking, syncs effects to live music.
- UI-driven effects, not code-driven drawing. No code editing, no canvas drawing, no custom stdlib.
- **Actively maintained**: Yes, under active development.

## Custom DSL / Simplified APIs

### Hydra
- **URL**: https://hydra.ojack.xyz/ | [GitHub](https://github.com/hydra-synth/hydra)
- Live-codeable video synth in the browser. Chainable JS DSL inspired by analog modular synthesis: `osc(10,0.1).rotate(0.5).out()`. Compiles to WebGL. Audio reactivity, MIDI, integration with p5.js/Tone.js/THREE.js. Extremely concise — one line can produce complex visuals.
- Strong precedent for a "custom drawing stdlib" design. Auto-runs on code change. But shader/WebGL-based, not Canvas2D. No beat grid or timeline. No sketch saving.
- **Actively maintained**: Yes, by Olivia Jack. Very active community.

### LiveCodeLab
- **URL**: https://livecodelab.net/ | [GitHub](https://github.com/davidedc/livecodelab)
- Browser-based environment where 3D visuals and sounds start as you type. Own language "LiveCodeLang" — simplified, conversational. Renders at 60fps, sound at adjustable BPM. Auto-runs as you type.
- Good "simplified API + instant feedback" reference. But 3D-focused, not Canvas2D. Own language, not JavaScript. No audio timeline or beat grid — just a BPM clock. No sketch saving.
- **Actively maintained**: Development slower in recent years, still functional.

### Mercury
- **URL**: [GitHub](https://github.com/tmhglnd/mercury) | Browser: [Mercury Playground](https://github.com/tmhglnd/mercury-playground)
- Minimal human-readable language for live coding algorithmic electronic music. Editor restricted to 30 lines. Clear descriptive function names. Produces sound with reactive visuals.
- Language design philosophy (minimal, human-readable) is relevant. But music-first, own language, 30-line constraint, no Canvas2D drawing.
- **Actively maintained**: Yes, by Timo Hoogland.

## Beat-Synced / Timeline-Based

### Sonic Pi
- **URL**: https://sonic-pi.net/ | [GitHub](https://github.com/sonic-pi-net/sonic-pi)
- Live coding music synth. Ruby code generates music in real-time. `live_loop` for repeating patterns, extensive synth/sample library. Visuals via OSC integration with external tools (p5.js, Processing, Hydra).
- `live_loop` and BPM-aware timing is a strong conceptual reference. But desktop-only, Ruby, music-only, visual integration requires separate software via OSC.
- **Actively maintained**: Yes, has AI integration as of 2025.

### TidalCycles
- **URL**: https://tidalcycles.org/ | [GitHub](https://github.com/tidalcycles)
- Haskell-based live coding language for algorithmic music patterns. Uses SuperCollider for sound. Visuals via OSC to external tools.
- Cycle-based time model is the gold standard for algorithmic beat patterns. Intellectual ancestor of Strudel. But requires Haskell + SuperCollider, not browser-based.
- **Actively maintained**: Yes, active community project.

## Live Coding Performance Tools

### Flok
- **URL**: https://flok.cc/ | [GitHub](https://github.com/munshkr/flok)
- Web-based P2P collaborative editor for live coding. Multiple panels for different languages (Strudel, Mercury, Hydra, SuperCollider, TidalCycles). Hydra runs directly in browser.
- Collaborative performance platform, not a single-tool editor. No Canvas2D drawing, no custom stdlib, no beat grid UI.
- **Actively maintained**: Yes, by Damian Silvani.

### Estuary
- **URL**: https://estuary.mcmaster.ca/ | [GitHub](https://github.com/dktr0/estuary)
- Multilingual, zero-installation collaborative live coding platform. Supports TidalCycles, p5.js, GLSL, Punctual. Networked ensembles for remote collaboration. Education + performance.
- Most feature-rich collaborative platform. Supports p5.js (Canvas2D possible). But ensemble-oriented, no beat grid UI, no custom stdlib.
- **Actively maintained**: Yes, supported by academic grants (SSHRC).

### cables.gl
- **URL**: https://cables.gl/ | [GitHub](https://github.com/cables-gl)
- Visual programming tool for interactive web content. Node-based (like TouchDesigner/VVVV for the web). GPU-powered, MIDI, gamepads, cameras, VR. Open source (MIT).
- Different paradigm entirely — visual node-based programming vs. text-based coding. WebGL, not Canvas2D.
- **Actively maintained**: Yes, by undev studio in Berlin. Open source since 2024.

### KodeLife
- **URL**: https://hexler.net/kodelife
- Real-time GPU shader editor. Visuals evolve as you type. GLSL and Metal. MIDI, gamepad, live audio input. Syphon/Spout output.
- Shares the "visuals update as you type" philosophy. But desktop app, shader-based, GLSL not JavaScript. No beat grid or timeline.
- **Actively maintained**: Yes, by Hexler.

### Visor VJ
- **URL**: https://visor.live/ | [GitHub](https://github.com/emperorjack/visor)
- VJ software for live coding in JavaScript/TypeScript. Rust-based engine with Deno Core. Sketch-based coding familiar to Processing/p5.js users.
- Conceptually similar JS live coding. Early development. No beat grid or audio timeline mentioned.
- **Actively maintained**: Early development stage.

## Audio Libraries (Building Blocks)

### Glicol
- **URL**: https://glicol.org/ | [GitHub](https://github.com/chaosprint/glicol)
- Graph-oriented live coding language for audio. Rust compiled to WebAssembly. 2.1MB vs Tone.js at 11.3MB. Collaborative editing.
- Lightweight audio engine option. No visuals, no canvas, no editor UI.

### Clubber.js
- **URL**: [GitHub](https://github.com/nicoptere/clubber)
- Applies music theory to audio reactive visualizations. Extracts meaningful parameters from audio (not just raw FFT).
- Specialized audio analysis that could provide smarter beat/music data than raw FFT.

## The Gap dollar-tee Fills

No existing tool combines **Canvas2D drawing + beat-synced timeline with a beat grid UI + custom declarative stdlib + auto-compiling browser editor**.

- The **music live-coders** (Strudel, Gibber, TidalCycles) have great timing models but weak/no visual canvases
- The **visual live-coders** (P5LIVE, Hydra, p5.js editor) have great drawing but no musical time awareness
- The **audio libraries** (Tone.js, p5.sound) provide building blocks but no integrated editor

The `$beat` / `$bars` / `$loop` interval system with easing, combined with the declarative scene tree stdlib and the beat grid timeline UI, is genuinely novel in this space. The closest conceptual ancestor is Strudel's cycle-based patterns, but applied to Canvas2D drawing rather than music synthesis.
