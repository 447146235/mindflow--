
// Simple synth to avoid loading external assets
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
let audioCtx: AudioContext | null = null;

// Track active nodes for BGM
let bgmNodes: AudioNode[] = [];
let bgmGainNode: GainNode | null = null;
let stopTimeout: any = null; // Track the fade-out timer

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  return audioCtx;
};

// Helper to resume audio context on user interaction (fixes autoplay blocks)
export const resumeAudioContext = async () => {
  const ctx = initAudio();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn("Audio Context resume failed", e);
    }
  }
};

export const playPopSound = () => {
  const ctx = initAudio();
  if (!ctx) return;
  // Non-intrusive fire-and-forget resume attempt
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'sine';
  // Randomize pitch slightly for realism
  oscillator.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.1);
};

// Generates a high-quality ambient drone with LFO and Filters
export const startMeditationDrone = async () => {
  const ctx = initAudio();
  if (!ctx) return;

  // 1. Try to resume context immediately
  if (ctx.state === 'suspended') {
    try { await ctx.resume(); } catch (e) { /* ignore, handled by global click listener */ }
  }

  // 2. Handle Race Condition: If we were in the middle of stopping, cancel it.
  if (stopTimeout) {
    clearTimeout(stopTimeout);
    stopTimeout = null;
  }

  // 3. If already playing, just ramp volume back up (if it was fading)
  if (bgmNodes.length > 0 && bgmGainNode) {
    const now = ctx.currentTime;
    // Cancel any scheduled fade-outs
    bgmGainNode.gain.cancelScheduledValues(now);
    // Ramp back to full volume smoothly
    bgmGainNode.gain.setTargetAtTime(0.7, now, 0.5); 
    return;
  }

  // 4. Create new Audio Graph
  // Master Gain for Fade In/Out
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 3); // Slow fade in for peace
  masterGain.connect(ctx.destination);
  bgmGainNode = masterGain;

  const nodes: AudioNode[] = [];

  // --- Sound Source: Warm Ambient Chord (F Major Sus2 / Open Fifth) ---
  // Using F2, F3, C4 for a very stable, grounding "Om" like sound.
  
  // Osc 1: Deep Bass (F2 - 87.31Hz)
  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 87.31; 

  // Osc 2: Warm Body (F3 - 174.61Hz - Healing Freq)
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 174.61;

  // Osc 3: Airy Harmonic (C4 - 261.63Hz - Perfect Fifth)
  const osc3 = ctx.createOscillator();
  osc3.type = 'sine';
  osc3.frequency.value = 261.63;

  // Mix Gains for oscillators
  const gain1 = ctx.createGain(); gain1.gain.value = 0.6; // Bass heavy
  const gain2 = ctx.createGain(); gain2.gain.value = 0.4; // Mid soft
  const gain3 = ctx.createGain(); gain3.gain.value = 0.2; // High faint

  osc1.connect(gain1);
  osc2.connect(gain2);
  osc3.connect(gain3);

  // --- Filter: Warm LowPass ---
  // Cut off high frequencies to make it sound "underwater" or "womb-like"
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400; 
  filter.Q.value = 0.3; // Gentle slope

  // --- LFO: Gentle "Ocean" Swell ---
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1; // 10 seconds per cycle (very slow breathing)
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.15; // Subtle modulation volume change

  // Base volume node before master
  const padGain = ctx.createGain();
  padGain.gain.value = 0.7; 

  // Connect: LFO -> PadGain.gain
  lfo.connect(lfoGain);
  lfoGain.connect(padGain.gain);

  // Connect: Osc Gains -> Filter -> PadGain -> MasterGain
  gain1.connect(filter);
  gain2.connect(filter);
  gain3.connect(filter);
  filter.connect(padGain);
  padGain.connect(masterGain);

  // Start everything
  const now = ctx.currentTime;
  osc1.start(now);
  osc2.start(now);
  osc3.start(now);
  lfo.start(now);

  nodes.push(osc1, osc2, osc3, lfo, lfoGain, padGain, gain1, gain2, gain3, filter, masterGain);
  bgmNodes = nodes;
};

export const stopMeditationDrone = () => {
  if (!bgmGainNode || !audioCtx) return;

  // If a stop is already pending, don't double schedule
  if (stopTimeout) return;

  const now = audioCtx.currentTime;
  
  // Schedule Fade Out
  try {
      bgmGainNode.gain.cancelScheduledValues(now);
      // Current value to 0 over 2 seconds (Slower fade out)
      bgmGainNode.gain.setValueAtTime(bgmGainNode.gain.value, now);
      bgmGainNode.gain.linearRampToValueAtTime(0, now + 2.0);
  } catch(e) {
      console.warn("Audio fade out error", e);
  }

  // Cleanup after fade
  stopTimeout = setTimeout(() => {
      bgmNodes.forEach(node => {
          try {
              if (node instanceof OscillatorNode) node.stop();
              node.disconnect();
          } catch (e) { /* ignore */ }
      });
      bgmNodes = [];
      bgmGainNode = null;
      stopTimeout = null;
  }, 2100);
};
