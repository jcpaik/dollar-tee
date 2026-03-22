# NEXT MOVES — What We Build Next

Pick 1-3 concrete items from IDEAS. Each must be buildable and testable.
Implementation details go in PLAN.md.

---

## 1. Audio Transport — Load, Play, Loop, Cue

From IDEAS §2 (Time Model) and §7 (UI/UX). Bare-bones first step.

**What**: A transport bar at the bottom of the screen. Load an audio file,
play/pause, scrub a timeline, set a temporary cue (start) point, loop the
track back to the cue point. Engine `$t` syncs to audio playback position.

**What it is NOT**: No code bindings, no multiple time variables, no beat
detection, no waveform display. Just the audio playback + transport.

**How to verify**: Load an mp3, hit play, see the playhead move, set a cue
point mid-track, hear it loop back to cue. Visual `$t` matches audio time.
