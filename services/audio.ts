// Simple synthesizer for a Tibetan singing bowl / Bell sound
// This avoids external dependencies or asset loading issues.

let audioContext: AudioContext | null = null;
let masterGainNode: GainNode | null = null;

const initAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGainNode = audioContext.createGain();
    // Default volume 0.5
    masterGainNode.gain.value = 0.5; 
    masterGainNode.connect(audioContext.destination);
  }
  return { ctx: audioContext, masterGain: masterGainNode as GainNode };
};

export const setMasterVolume = (volume: number) => {
  // Volume should be between 0.0 and 1.0
  const { ctx, masterGain } = initAudio();
  
  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  // Smooth transition to avoid clicking artifacts
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime + 0.1);
};

export const playBellSound = () => {
  const { ctx, masterGain } = initAudio();

  // Ensure context is running
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const t = ctx.currentTime;

  // Fundamental frequency
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(180, t); // ~F3
  
  // Overtones for metallic richness
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(530, t); 

  const osc3 = ctx.createOscillator();
  osc3.type = 'triangle';
  osc3.frequency.setValueAtTime(890, t); 

  // Gain (Volume envelope) - These determine the "shape" of the sound, 
  // not the master volume.
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.6, t + 0.05); // Attack
  gain.gain.exponentialRampToValueAtTime(0.001, t + 4.0); // Long decay

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.2, t + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

  const gain3 = ctx.createGain();
  gain3.gain.setValueAtTime(0, t);
  gain3.gain.linearRampToValueAtTime(0.1, t + 0.05);
  gain3.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

  // Connect Oscillators to their Envelopes
  osc.connect(gain);
  osc2.connect(gain2);
  osc3.connect(gain3);

  // Connect Envelopes to Master Gain (instead of destination directly)
  gain.connect(masterGain);
  gain2.connect(masterGain);
  gain3.connect(masterGain);

  // Start
  osc.start(t);
  osc2.start(t);
  osc3.start(t);

  // Stop
  osc.stop(t + 4.5);
  osc2.stop(t + 4.5);
  osc3.stop(t + 4.5);
};