# Strudel Integration

## Why Strudel

`@strudel/core` is a pure JS pattern engine with one dependency (`fraction.js`). No DOM, no audio, no browser APIs. You `npm install` it and get TidalCycles' pattern math in JavaScript.

The key API:

```js
import { sequence, stack } from '@strudel/core';

const pat = sequence('a', ['b', 'c']);
const haps = pat.queryArc(0, 1); // → list of events with fractional timing
```

Each event (`Hap`) has `whole.begin`, `whole.end`, `part`, `value`, `hasOnset()`, `isActive(t)`. You can query any time range and get back precisely-timed events.

## How it fits with dollar-tee

### Option 1: Strudel as pattern source

Use `queryArc()` in the engine's `onPreTick` to poll "what events are happening now?" and expose them alongside `$beat`/`$bars`. Strudel patterns would drive visual parameters (colors, sizes, positions) with TidalCycles' mini-notation: `"red blue [green yellow]"`.

The intervals system (`$beat`, `$bars`) stays as the simple, opinionated timing layer. Strudel becomes the deep, expressive one. `$beat` for quick stuff, Strudel patterns for complex algorithmic sequencing.

### Option 2: Strudel as audio + patterns

Use `@strudel/webaudio` to replace the current `audio.js`, letting Strudel own both the sound and the timing. The engine syncs to Strudel's `Cyclist` scheduler instead of an HTML5 Audio element.

## Strudel packages relevant to integration

| Package | npm | Purpose |
|---|---|---|
| `core` | `@strudel/core` | Pure pattern engine. `Pattern`, `Hap`, `TimeSpan`, `queryArc`, `repl()`. |
| `mini` | `@strudel/mini` | Mini-notation parser (`"bd sd [hh hh]"` syntax) |
| `webaudio` | `@strudel/webaudio` | WebAudio output + `webaudioRepl()` wrapper |
| `draw` | `@strudel/draw` | Canvas2D helpers: `pianoroll()`, `animate()`, `Drawer` class |
| `hydra` | `@strudel/hydra` | Hydra-synth integration, `H()` helper for reading pattern values |
| `midi` | `@strudel/midi` | WebMIDI in/out (notes, CC, sysex) |
| `osc` | `@strudel/osc` | OSC output via WebSocket bridge |
| `web` | `@strudel/web` | Batteries-included browser bundle with `initStrudel()` |

## Event/callback system

Three ways to hook into pattern events:

**`pattern.onTrigger(callback)`** — Called by the Cyclist scheduler when an event fires. Gets `(hap, currentTime, cps, targetTime)`. Set `dominant = false` to keep audio AND get callbacks.

**`pattern.onTriggerTime(callback)`** — Convenience wrapper using `setTimeout` to call at the right moment. Good for visual triggers.

**Direct `queryArc` polling** — Query the pattern yourself in your own animation loop. This is what `@strudel/draw` does.

## What Strudel already does for visuals

`@strudel/draw` does Canvas2D — `Pattern.prototype.pianoroll()` for scrolling piano-roll visualization, `Pattern.prototype.animate()` for rendering haps as geometric shapes, and a `Drawer` class that syncs `requestAnimationFrame` to the scheduler. There's precedent for "Strudel patterns → canvas output."

## Friction points

### Time model mismatch

Strudel thinks in **cycles** (rational fractions). Dollar-tee thinks in **seconds** with known BPM. Conversion is straightforward (`cycles = seconds * cps`) but needs a bridge layer.

### Two schedulers

Strudel has its own `Cyclist` rAF loop. Dollar-tee has its own engine loop. One needs to yield, or you poll Strudel from dollar-tee's loop (which is what `@strudel/draw` already does — proven pattern).

### AGPL-3.0 license

Strudel is AGPL. Any project that uses it must be open-sourced under a compatible license. This is the biggest non-technical constraint.

### Complexity budget

Strudel's pattern language is deep (sequence, stack, rev, jux, every, etc.). Exposing all of it might overwhelm users who just want `$beat.progress`. Could offer it as an opt-in power layer — simple intervals by default, Strudel patterns when you want algorithmic sequencing.

## Bottom line

The `queryArc` API makes integration clean. Dollar-tee's `$beat`/`$bars` and Strudel's pattern engine serve different complexity levels and can coexist. The main constraints are license (AGPL) and keeping the UX simple for users who don't need the full pattern language.
