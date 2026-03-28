// Transport — audio controls, file loading, snap toggle.

import { FIRST_BEAT } from './timeline.js';

export function setupTransport({ audio, engine, timeline }) {
  const musicToggle    = document.getElementById('music-toggle');
  const playBtn        = document.getElementById('play-btn');
  const audioFileInput = document.getElementById('audio-file');
  const snapBtn        = document.getElementById('snap-btn');

  // Pre-load default track
  (async () => {
    await audio.loadPath('/resources/music.mp3');
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
}
