# audio/

Audio playback, beat-synced timing, and timeline visualization.

## Files

### audio.js

`createAudio()` -- wraps an HTML5 `<audio>` element.

- `loadFile(file)` -- load from File object, returns `Promise<duration>`
- `loadPath(path)` -- load from URL/path, returns `Promise<duration>`
- `play()`, `pause()`, `togglePlay()` -- playback control
- `seek(t)` -- jump to time, clamped to `[0, duration]`
- Getters: `playing`, `time`, `duration`, `isLoaded`, `muted`

Handles object URL revocation on re-load.

### intervals.js

Beat-synced timing primitives. State is updated each frame by the engine via `updateLoopTime(elapsed)`.

**Exports:**
- `updateLoopTime(elapsed)` -- call each frame with elapsed time relative to `FIRST_BEAT`
- `$loop` -- interval spanning the full loop (0 to `LOOP_DURATION`)
- `$beat` -- interval cycling every `BEAT_DURATION`, always active
- `$beats[0..7]` -- individual beat intervals within the loop
- `tween(interval, from, to, easeFn?)` -- convenience tweening function

**Interval API** (shared by `$loop`, `$beat`, `$beats[i]`):
- `progress` -- `[0, 1]` within current cycle
- `active` -- boolean, whether currently in this interval's time range
- `n` -- integer count of completed cycles
- `t` -- elapsed time in current occurrence
- `s`, `e`, `len` -- start, end, duration
- `ease(name, from?, to?)` -- apply named easing, optionally interpolate between values

**Imports:** `EASING_MAP` from `../lib/easing.js`; `LOOP_DURATION`, `LOOP_BEATS`, `BEAT_DURATION` from `timeline.js`.

### timeline.js

`createTimeline(container)` -- canvas-based beat grid with waveform visualization.

**Constants:**
- `BPM = 126.09`
- `FIRST_BEAT = 53.416735` (seconds into audio where the loop starts)
- `LOOP_BEATS = 8`
- `BEAT_DURATION = 60 / BPM` (~0.477s)
- `LOOP_DURATION = LOOP_BEATS * BEAT_DURATION` (~3.816s)
- `PEAKS_RESOLUTION = 2000` (samples per beat for waveform)

**API:**
- `update(audioTime)` -- redraw: beat grid, waveform, cues, playhead
- `setAudioBuffer(audioBuffer)` -- extract peaks from decoded audio
- `setSnap(on)` -- toggle snap-to-beat for cue placement
- `snapping` -- getter
- `cues` -- getter, returns array of cue times

**Interactions:**
- Scroll wheel to zoom
- Click to add/remove cue markers (snaps to beat grid if enabled)
- Displays: waveform (green), playhead (yellow), cues (orange), beat grid lines
