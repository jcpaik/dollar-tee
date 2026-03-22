// Audio — loads a track, handles playback.

export function createAudio() {
  const audio = new Audio();
  let loaded = false;

  return {
    loadFile(file) {
      if (audio.src) URL.revokeObjectURL(audio.src);
      audio.src = URL.createObjectURL(file);
      return this._waitLoaded();
    },

    loadPath(path) {
      audio.src = path;
      return this._waitLoaded();
    },

    _waitLoaded() {
      return new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', () => {
          loaded = true;
          resolve(audio.duration);
        }, { once: true });
        audio.addEventListener('error', reject, { once: true });
      });
    },

    play() {
      if (!loaded) return;
      audio.play();
    },
    pause()      { audio.pause(); },
    togglePlay() { if (audio.paused) this.play(); else this.pause(); },

    seek(t) {
      if (loaded) audio.currentTime = clamp(t, 0, audio.duration);
    },

    get playing()  { return loaded && !audio.paused; },
    get time()     { return audio.currentTime || 0; },
    get duration() { return audio.duration || 0; },
    get isLoaded() { return loaded; },
    get muted()    { return audio.muted; },
    set muted(v)   { audio.muted = v; },
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }
