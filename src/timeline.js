// Timeline — canvas-based beat grid with waveform, playhead, cues, and zoom.

export const BPM           = 126.09;
export const FIRST_BEAT    = 53.416735;
export const LOOP_BEATS    = 8;
export const BEAT_DURATION = 60 / BPM;
export const LOOP_DURATION = LOOP_BEATS * BEAT_DURATION;

const PEAKS_RESOLUTION = 2000;

export function createTimeline(container) {
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let peaks = null;
  let zoom = 1;
  let viewCenter = LOOP_DURATION / 2;
  const cues = [];
  let snap = true;

  // Scroll to zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1 / 1.15 : 1.15;
    zoom = Math.max(1, Math.min(32, zoom * factor));
  }, { passive: false });

  // Click to add/remove cue
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const view = getView();
    let clickTime = view.start + frac * view.width;
    if (snap) clickTime = Math.round(clickTime / BEAT_DURATION) * BEAT_DURATION;

    const threshold = snap ? BEAT_DURATION * 0.4 : view.width * 0.02;
    const idx = cues.findIndex(t => Math.abs(t - clickTime) < threshold);
    if (idx >= 0) {
      cues.splice(idx, 1);
    } else {
      cues.push(clickTime);
    }
  });

  function getView() {
    const w = LOOP_DURATION / zoom;
    let start = viewCenter - w / 2;
    let end = viewCenter + w / 2;
    if (start < 0) { start = 0; end = Math.min(w, LOOP_DURATION); }
    if (end > LOOP_DURATION) { end = LOOP_DURATION; start = Math.max(0, end - w); }
    return { start, end, width: end - start };
  }

  function toX(t, view, W) {
    return ((t - view.start) / view.width) * W;
  }

  return {
    update(audioTime) {
      const W = container.clientWidth;
      const H = container.clientHeight;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }

      const elapsed = audioTime - FIRST_BEAT;
      const loopPos = elapsed >= 0 ? elapsed % LOOP_DURATION : 0;

      if (zoom > 1) viewCenter = loopPos;
      else viewCenter = LOOP_DURATION / 2;

      const view = getView();

      ctx.clearRect(0, 0, W, H);

      // Beat rectangles
      for (let i = 0; i < LOOP_BEATS; i++) {
        const bStart = i * BEAT_DURATION;
        const bEnd = (i + 1) * BEAT_DURATION;
        const x1 = toX(bStart, view, W);
        const x2 = toX(bEnd, view, W);
        if (x2 < 0 || x1 > W) continue;
        const cx1 = Math.max(0, x1);
        const cx2 = Math.min(W, x2);
        const isActive = loopPos >= bStart && loopPos < bEnd;
        ctx.fillStyle = isActive ? '#3d3d3d' : '#2a2a2a';
        ctx.fillRect(cx1, 0, cx2 - cx1 - 1, H);
      }

      // Waveform
      if (peaks) {
        const midY = H / 2;
        const amp = H * 0.4;
        ctx.fillStyle = 'rgba(180, 180, 180, 0.3)';

        const pStart = Math.max(0, Math.floor((view.start / LOOP_DURATION) * peaks.length));
        const pEnd = Math.min(peaks.length, Math.ceil((view.end / LOOP_DURATION) * peaks.length));
        const barW = Math.max(1, W / (pEnd - pStart));

        for (let i = pStart; i < pEnd; i++) {
          const t = (i / peaks.length) * LOOP_DURATION;
          const x = toX(t, view, W);
          const top = midY - peaks[i].max * amp;
          const bot = midY - peaks[i].min * amp;
          ctx.fillRect(x, top, barW + 0.5, bot - top);
        }
      }

      // Cue markers
      ctx.fillStyle = '#ff764d';
      for (const t of cues) {
        const x = toX(t, view, W);
        if (x < -5 || x > W + 5) continue;
        ctx.fillRect(x - 1, 0, 2, H);
        ctx.beginPath();
        ctx.moveTo(x - 4, 0);
        ctx.lineTo(x + 4, 0);
        ctx.lineTo(x, 6);
        ctx.fill();
      }

      // Playhead
      const phX = toX(loopPos, view, W);
      ctx.fillStyle = '#f5c518';
      ctx.fillRect(phX - 1, 0, 2, H);
    },

    setAudioBuffer(audioBuffer) {
      const data = audioBuffer.getChannelData(0);
      const sr = audioBuffer.sampleRate;
      const s0 = Math.floor(FIRST_BEAT * sr);
      const s1 = Math.floor((FIRST_BEAT + LOOP_DURATION) * sr);
      const bucket = (s1 - s0) / PEAKS_RESOLUTION;

      peaks = [];
      for (let i = 0; i < PEAKS_RESOLUTION; i++) {
        const from = s0 + Math.floor(i * bucket);
        const to = s0 + Math.floor((i + 1) * bucket);
        let min = 1, max = -1;
        for (let j = from; j < to && j < data.length; j++) {
          if (data[j] < min) min = data[j];
          if (data[j] > max) max = data[j];
        }
        peaks.push({ min, max });
      }
    },

    setSnap(on) { snap = on; },
    get snapping() { return snap; },
    get cues() { return [...cues]; },
  };
}
