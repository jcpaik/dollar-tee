// Intervals — named time regions with .s, .e, .len, .progress, .ease().
// Updated each frame via updateLoopTime(). User code sees $loop, $bar1–$bar8, $beat.

import { EASING_MAP } from './easing.js';
import { LOOP_DURATION, LOOP_BEATS, BEAT_DURATION } from './timeline.js';

let _loopT = 0;

// Call once per frame with elapsed time (audio time minus first beat).
export function updateLoopTime(elapsed) {
  _loopT = elapsed >= 0 ? elapsed % LOOP_DURATION : 0;
}

class Interval {
  constructor(s, e) {
    this.s = s;
    this.e = e;
    this.len = e - s;
  }

  get progress() {
    return Math.max(0, Math.min(1, (_loopT - this.s) / this.len));
  }

  get active() {
    return _loopT >= this.s && _loopT < this.e;
  }

  ease(name, from, to) {
    const easeFn = typeof name === 'function' ? name : EASING_MAP[name];
    if (!easeFn) return this.progress;
    const eased = easeFn(this.progress);
    if (from !== undefined && to !== undefined) {
      return from + (to - from) * eased;
    }
    return eased;
  }
}

// $beat — always-active interval that cycles every beat
const $beat = {
  get s() { return Math.floor(_loopT / BEAT_DURATION) * BEAT_DURATION; },
  get e() { return (Math.floor(_loopT / BEAT_DURATION) + 1) * BEAT_DURATION; },
  len: BEAT_DURATION,
  get progress() { return (_loopT % BEAT_DURATION) / BEAT_DURATION; },
  get active() { return true; },
  ease(name, from, to) {
    const easeFn = typeof name === 'function' ? name : EASING_MAP[name];
    if (!easeFn) return this.progress;
    const eased = easeFn(this.progress);
    if (from !== undefined && to !== undefined) {
      return from + (to - from) * eased;
    }
    return eased;
  },
};

// tween(interval, from, to, easeFn?) — all-in-one convenience
export function tween(interval, from, to, easeFn) {
  const p = interval.progress;
  if (!easeFn) return from + (to - from) * p;
  const fn = typeof easeFn === 'string' ? EASING_MAP[easeFn] : easeFn;
  return from + (to - from) * fn(p);
}

// Build standard intervals
const $loop = new Interval(0, LOOP_DURATION);
const $bars = [];
for (let i = 0; i < LOOP_BEATS; i++) {
  $bars.push(new Interval(i * BEAT_DURATION, (i + 1) * BEAT_DURATION));
}

export { $loop, $beat, $bars };
