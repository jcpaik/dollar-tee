// Transport — audio controls, file loading, snap toggle.



export function setupTransport({ audio, engine, timeline }) {
  const musicToggle    = document.getElementById('music-toggle');
  const playBtn        = document.getElementById('play-pause-btn');
  const audioFileInput = document.getElementById('audio-file');
  const snapBtn        = document.getElementById('snap-btn');

  let running = false;

  function syncIcon() {
    playBtn.textContent = running ? '\u23F8' : '\u25B6';
  }

  // Pre-load default track (muted by default)
  (async () => {
    await audio.loadPath('/resources/music.mp3');
    audio.muted = true;
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
    audio.muted = false;
    musicToggle.textContent = '\u266B On';
    musicToggle.classList.add('active');
    musicToggle.title = file.name;
  });

  // Play / pause — controls both engine and audio
  playBtn.addEventListener('click', () => {
    if (running) {
      engine.stop();
      if (audio.playing) audio.togglePlay();
      engine.setTimeSource(null);
      running = false;
    } else {
      if (audio.isLoaded) {
        audio.togglePlay();
        engine.setTimeSource(() => audio.time);
      }
      engine.start();
      running = true;
    }
    syncIcon();
  });

  syncIcon();

  // Snap toggle
  snapBtn.addEventListener('click', () => {
    timeline.setSnap(!timeline.snapping);
    snapBtn.classList.toggle('active', timeline.snapping);
  });
}
