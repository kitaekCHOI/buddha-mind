// Simple synthesizer for a Tibetan singing bowl / Bell sound
// This avoids external dependencies or asset loading issues.

let audioContext: AudioContext | null = null;

export const playBellSound = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  const ctx = audioContext;
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

  // Gain (Volume envelope)
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

  // Connect
  osc.connect(gain);
  osc2.connect(gain2);
  osc3.connect(gain3);

  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);
  gain3.connect(ctx.destination);

  // Start
  osc.start(t);
  osc2.start(t);
  osc3.start(t);

  // Stop
  osc.stop(t + 4.5);
  osc2.stop(t + 4.5);
  osc3.stop(t + 4.5);
};