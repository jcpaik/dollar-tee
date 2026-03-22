// Audio — loads a track, handles playback.

export function createAudio() {
  const audio = new Audio();
  let loaded = false;

  return {
    load(file) {
      if (audio.src) URL.revokeObjectURL(audio.src);
      const url = URL.createObjectURL(file);
      audio.src = url;
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
  };
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(v, hi)); }
