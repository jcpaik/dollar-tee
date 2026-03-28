// Transport UI — audio controls, file loading, sash drag, snap toggle.

import { FIRST_BEAT } from '../audio/timeline.js';

export function setupTransport({ audio, engine, timeline, onResize }) {
  const musicToggle    = document.getElementById('music-toggle');
  const playBtn        = document.getElementById('play-btn');
  const audioFileInput = document.getElementById('audio-file');
  const snapBtn        = document.getElementById('snap-btn');
  const transportEl    = document.getElementById('transport');
  const transportSash  = document.getElementById('transport-sash');

  // Pre-load default track (muted by default)
  (async () => {
    await audio.loadPath('/resources/music.mp3');
    audio.muted = true;
    engine.setTimeSource(() => audio.time);
    playBtn.disabled = false;
    const resp = await fetch('/resources/music.mp3');
    const buf = await resp.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(buf);
    timeline.setAudioBuffer(audioBuffer);
  })();

  // Mute toggle
  musicToggle.addEventListener('click', () => {
    audio.muted = !audio.muted;
    musicToggle.textContent = audio.muted ? '\u266B Off' : '\u266B On';
    musicToggle.classList.toggle('active', !audio.muted);
  });

  // Right-click: open file picker
  musicToggle.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    audioFileInput.click();
  });

  // Load audio from file
  audioFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await audio.loadFile(file);
    engine.setTimeSource(() => audio.time);
    playBtn.disabled = false;
    audio.muted = false;
    musicToggle.textContent = '\u266B On';
    musicToggle.classList.add('active');
    musicToggle.title = file.name;
  });

  // Play / pause
  playBtn.addEventListener('click', () => {
    if (!audio.playing && audio.time < FIRST_BEAT) audio.seek(FIRST_BEAT);
    audio.togglePlay();
    playBtn.textContent = audio.playing ? '\u275A\u275A' : '\u25B6';
  });

  // Snap toggle
  snapBtn.addEventListener('click', () => {
    timeline.setSnap(!timeline.snapping);
    snapBtn.classList.toggle('active', timeline.snapping);
  });

  // Sash — drag to resize, double-click to toggle
  transportSash.addEventListener('mousedown', (e) => {
    e.preventDefault();
    transportSash.classList.add('dragging');

    const onMove = (ev) => {
      const bottomY = window.innerHeight - ev.clientY;
      if (bottomY < 20) {
        transportEl.classList.add('collapsed');
      } else {
        transportEl.classList.remove('collapsed');
        transportEl.style.height = bottomY + 'px';
      }
      onResize();
    };

    const onUp = () => {
      transportSash.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  transportSash.addEventListener('dblclick', () => {
    transportEl.classList.toggle('collapsed');
    if (!transportEl.classList.contains('collapsed')) transportEl.style.height = '';
    onResize();
  });
}
