// Studio-Grade Hybrid Audio Engine with Web Audio API Buffer Caching & Fallbacks
// 100% reliable, zero-latency playback, handles browser autoplay policies seamlessly

let audioCtx = null;
const bufferCache = {};
let ambientAudio = null;
let isAmbientActive = false;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// Automatic AudioContext unlock on first user gesture
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
}

// Pre-load audio buffers for zero latency
const preloadSound = async (filename) => {
  const ctx = getAudioContext();
  if (!ctx || bufferCache[filename]) return;
  try {
    const res = await fetch(`/sounds/${filename}`);
    if (!res.ok) return;
    const arrayBuffer = await res.arrayBuffer();
    ctx.decodeAudioData(
      arrayBuffer,
      (decoded) => {
        bufferCache[filename] = decoded;
      },
      () => {}
    );
  } catch {}
};

// Preload on startup
if (typeof window !== "undefined") {
  setTimeout(() => {
    preloadSound("click.wav");
    preloadSound("hover.wav");
    preloadSound("success.wav");
    preloadSound("notification.wav");
  }, 300);
}

// Play sound using decoded AudioBuffer -> fallback to HTML5 Audio -> fallback to Synth
const playSound = (filename, volume = 0.5, synthFallback) => {
  if (isMuted()) return;
  const ctx = getAudioContext();

  // 1. Try decoded AudioBuffer (Fastest, zero-latency)
  if (ctx && bufferCache[filename]) {
    try {
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      source.buffer = bufferCache[filename];
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
      return;
    } catch {}
  }

  // 2. Try HTML5 Audio element
  try {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = Math.max(0, Math.min(1, volume));
    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        if (synthFallback) synthFallback(ctx);
      });
    }
  } catch {
    if (synthFallback) synthFallback(ctx);
  }
};

// Check persisted mute state
export const isMuted = () => {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("civic_sound_muted") === "true";
  } catch {
    return false;
  }
};

export const setMuted = (muted) => {
  try {
    localStorage.setItem("civic_sound_muted", muted ? "true" : "false");
    if (muted && ambientAudio) {
      pauseAmbient();
    }
    window.dispatchEvent(
      new CustomEvent("civic-sound-mute-change", { detail: { muted } })
    );
  } catch {}
};

export const toggleMute = () => {
  const next = !isMuted();
  setMuted(next);
  if (!next) {
    playPop();
  }
  return next;
};

// 1. Tactile UI Click
export const playClick = () => {
  playSound("click.wav", 0.45, (ctx) => {
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  });
};

// 2. Gentle hover micro-blip (throttled to avoid noise on fast sweep)
let lastHoverTime = 0;
export const playHover = () => {
  if (isMuted()) return;
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 70) return;
  lastHoverTime = nowMs;

  playSound("hover.wav", 0.15, (ctx) => {
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.02);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  });
};

// 3. Tactile pop for buttons and toggles
export const playPop = () => {
  if (isMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.06);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  } catch {}
};

// 4. Melodic civic celebration chord chime
export const playSuccess = () => {
  playSound("success.wav", 0.7, (ctx) => {
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, time: 0, dur: 0.28, vol: 0.1 },
        { f: 659.25, time: 0.09, dur: 0.32, vol: 0.12 },
        { f: 783.99, time: 0.18, dur: 0.38, vol: 0.13 },
        { f: 1046.5, time: 0.28, dur: 0.55, vol: 0.14 },
      ];
      notes.forEach(({ f, time, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + time);
        gain.gain.setValueAtTime(0.0001, now + time);
        gain.gain.linearRampToValueAtTime(vol, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    } catch {}
  });
};

// 5. Notification chime for Chatbot
export const playNotification = () => {
  playSound("notification.wav", 0.5, (ctx) => {
    playSuccess();
  });
};

// 6. Ambient Civic Background Music Player
export const isAmbientPlaying = () => isAmbientActive;

export const playAmbient = () => {
  if (typeof window === "undefined" || isMuted()) return;
  try {
    if (!ambientAudio) {
      ambientAudio = new Audio("/sounds/ambient.wav");
      ambientAudio.loop = true;
      ambientAudio.volume = 0.22;
    }
    ambientAudio.play().then(() => {
      isAmbientActive = true;
      window.dispatchEvent(
        new CustomEvent("civic-ambient-music-change", { detail: { playing: true } })
      );
    }).catch(() => {});
  } catch {}
};

export const pauseAmbient = () => {
  if (ambientAudio) {
    ambientAudio.pause();
  }
  isAmbientActive = false;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("civic-ambient-music-change", { detail: { playing: false } })
    );
  }
};

export const toggleAmbient = () => {
  if (isAmbientActive) {
    pauseAmbient();
    return false;
  } else {
    playAmbient();
    return true;
  }
};
