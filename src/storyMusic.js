const PREFERENCE_STORAGE_KEY = "portfolio.story.sound";

export const readSoundPreference = () => {
  try {
    return localStorage.getItem(PREFERENCE_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

export const writeSoundPreference = (isOn) => {
  try {
    localStorage.setItem(PREFERENCE_STORAGE_KEY, isOn ? "on" : "off");
  } catch {
    // Preference only lasts for this visit if storage is unavailable.
  }
};

/**
 * Looping background track with fades. Volume runs through a Web Audio gain node
 * because iOS Safari ignores HTMLMediaElement.volume.
 */
export const createStoryMusic = ({ src, volume = 0.35, fadeMs = 900 }) => {
  const audio = new Audio();
  audio.src = src;
  audio.loop = true;
  audio.preload = "none";

  let context = null;
  let gain = null;
  let wantsPlay = false;
  let pauseTimer = null;

  const ensureGraph = () => {
    if (context) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    context = new AudioContextClass();
    gain = context.createGain();
    gain.gain.value = 0;
    context.createMediaElementSource(audio).connect(gain).connect(context.destination);
  };

  const rampTo = (value, ms) => {
    if (!gain) {
      audio.volume = value;
      return;
    }
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(value, now + ms / 1000);
  };

  const play = () => {
    wantsPlay = true;
    window.clearTimeout(pauseTimer);
    ensureGraph();
    context?.resume();

    return audio
      .play()
      .then(() => {
        if (wantsPlay) rampTo(volume, fadeMs);
        return true;
      })
      .catch(() => false);
  };

  const pause = ({ immediate = false } = {}) => {
    wantsPlay = false;
    window.clearTimeout(pauseTimer);

    if (immediate || audio.paused) {
      rampTo(0, 0);
      audio.pause();
      return;
    }

    rampTo(0, fadeMs);
    pauseTimer = window.setTimeout(() => {
      if (!wantsPlay) audio.pause();
    }, fadeMs);
  };

  const restart = () => {
    audio.currentTime = 0;
  };

  return { play, pause, restart };
};
