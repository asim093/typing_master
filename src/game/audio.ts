// Lightweight synthesized SFX engine (Web Audio API oscillators/noise —
// no audio files). Everything here is generated at call time.
export type SfxName =
  | 'swordHit'
  | 'critHit'
  | 'typeError'
  | 'hitPlayer'
  | 'bossSpecial'
  | 'bossRoar'
  | 'enemyDefeat'
  | 'victoryFanfare'
  | 'uiClick'
  | 'uiConfirm'
  | 'levelUp'
  | 'unlock'
  | 'thunder';

let ctx: AudioContext | null = null;
let muted = false;
let masterGain: GainNode | null = null;

// --- Real sword-clash voice clips (hero vs enemy) -----------------------
// Layered on top of the synthesized hit sounds below for a more physical
// "clang" — kept as actual audio files (not synthesized) per the source clips.
const heroSwordSrc = typeof Audio !== 'undefined' ? new Audio('/sounds/heroswordsound.mp3') : null;
const enemySwordSrc = typeof Audio !== 'undefined' ? new Audio('/sounds/enemiesswordsound.mp3') : null;
if (heroSwordSrc) heroSwordSrc.volume = 0.55;
if (enemySwordSrc) enemySwordSrc.volume = 0.55;

function playClip(src: HTMLAudioElement | null) {
  if (muted || !src) return;
  // Clone so rapid/overlapping hits (fast typing, combos) don't cut each other off.
  const node = src.cloneNode(true) as HTMLAudioElement;
  node.volume = src.volume;
  void node.play().catch(() => {});
}

/** The hero's weapon connecting with an enemy. */
export function playHeroSword() {
  playClip(heroSwordSrc);
}

/** An enemy's weapon connecting with the hero. */
export function playEnemySword() {
  playClip(enemySwordSrc);
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function setAudioMuted(value: boolean) {
  muted = value;
  if (masterGain) masterGain.gain.value = value ? 0 : 0.35;
}

function tone(
  audioCtx: AudioContext,
  dest: AudioNode,
  freq: number,
  duration: number,
  type: OscillatorType,
  gainAmt: number,
  when = 0,
  freqEnd?: number,
) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  const t0 = audioCtx.currentTime + when;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);
  }
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(gainAmt, t0 + Math.min(0.012, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(dest);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noiseBurst(
  audioCtx: AudioContext,
  dest: AudioNode,
  duration: number,
  filterFreq: number,
  gainAmt: number,
  when = 0,
  filterType: BiquadFilterType = 'bandpass',
) {
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.value = filterFreq;
  const gain = audioCtx.createGain();
  const t0 = audioCtx.currentTime + when;
  gain.gain.setValueAtTime(gainAmt, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  src.connect(filter).connect(gain).connect(dest);
  src.start(t0);
}

export function playSfx(name: SfxName) {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain) return;
  const dest = masterGain;

  switch (name) {
    case 'swordHit':
      noiseBurst(audioCtx, dest, 0.09, 2600, 0.5);
      tone(audioCtx, dest, 850, 0.07, 'triangle', 0.25);
      break;
    case 'critHit':
      noiseBurst(audioCtx, dest, 0.12, 3200, 0.6);
      tone(audioCtx, dest, 620, 0.18, 'sawtooth', 0.3, 0, 1400);
      tone(audioCtx, dest, 1400, 0.1, 'sine', 0.2, 0.02);
      break;
    case 'typeError':
      tone(audioCtx, dest, 180, 0.09, 'square', 0.18, 0, 120);
      break;
    case 'hitPlayer':
      tone(audioCtx, dest, 160, 0.16, 'sine', 0.35, 0, 60);
      noiseBurst(audioCtx, dest, 0.1, 400, 0.3, 0, 'lowpass');
      break;
    case 'bossSpecial':
      tone(audioCtx, dest, 110, 0.32, 'sawtooth', 0.35, 0, 40);
      noiseBurst(audioCtx, dest, 0.28, 300, 0.4, 0, 'lowpass');
      break;
    case 'bossRoar':
      tone(audioCtx, dest, 180, 0.7, 'sawtooth', 0.28, 0, 60);
      tone(audioCtx, dest, 90, 0.7, 'square', 0.2, 0.05, 40);
      break;
    case 'enemyDefeat':
      tone(audioCtx, dest, 440, 0.1, 'sine', 0.22, 0);
      tone(audioCtx, dest, 660, 0.14, 'sine', 0.2, 0.08);
      break;
    case 'victoryFanfare':
      tone(audioCtx, dest, 523, 0.14, 'triangle', 0.25, 0);
      tone(audioCtx, dest, 659, 0.14, 'triangle', 0.25, 0.12);
      tone(audioCtx, dest, 784, 0.22, 'triangle', 0.28, 0.24);
      tone(audioCtx, dest, 1046, 0.3, 'sine', 0.22, 0.4);
      break;
    case 'uiClick':
      noiseBurst(audioCtx, dest, 0.03, 4000, 0.2, 0, 'highpass');
      break;
    case 'uiConfirm':
      tone(audioCtx, dest, 500, 0.08, 'sine', 0.2, 0);
      tone(audioCtx, dest, 750, 0.1, 'sine', 0.2, 0.06);
      break;
    case 'levelUp':
      tone(audioCtx, dest, 392, 0.1, 'triangle', 0.22, 0);
      tone(audioCtx, dest, 523, 0.1, 'triangle', 0.24, 0.09);
      tone(audioCtx, dest, 659, 0.12, 'triangle', 0.26, 0.18);
      tone(audioCtx, dest, 880, 0.28, 'sine', 0.26, 0.3);
      break;
    case 'unlock':
      tone(audioCtx, dest, 660, 0.09, 'sine', 0.22, 0);
      tone(audioCtx, dest, 990, 0.16, 'sine', 0.22, 0.07);
      break;
    case 'thunder':
      noiseBurst(audioCtx, dest, 0.18, 5000, 0.35, 0, 'highpass');
      tone(audioCtx, dest, 70, 1.4, 'sawtooth', 0.3, 0.05, 30);
      noiseBurst(audioCtx, dest, 1.2, 220, 0.25, 0.08, 'lowpass');
      break;
  }
}

// --- Ambient world drone -----------------------------------------------

interface AmbientHandle {
  stop: () => void;
}

let currentAmbient: AmbientHandle | null = null;

const AMBIENT_FREQ: Record<string, [number, number]> = {
  forest: [98, 147],
  desert: [82, 123],
  frozen: [110, 165],
  cyber: [65, 196],
};

export function startAmbient(worldId: string) {
  currentAmbient?.stop();
  const audioCtx = getCtx();
  if (!audioCtx || !masterGain) return;
  const [f1, f2] = AMBIENT_FREQ[worldId] ?? AMBIENT_FREQ.forest;

  const gain = audioCtx.createGain();
  gain.gain.value = 0;
  gain.connect(masterGain);
  gain.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1.5);

  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = f1;
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = f2;

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain).connect(gain.gain);

  osc1.connect(gain);
  osc2.connect(gain);
  osc1.start();
  osc2.start();
  lfo.start();

  currentAmbient = {
    stop: () => {
      const t0 = audioCtx.currentTime;
      gain.gain.cancelScheduledValues(t0);
      gain.gain.setValueAtTime(gain.gain.value, t0);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.6);
      window.setTimeout(() => {
        osc1.stop();
        osc2.stop();
        lfo.stop();
      }, 700);
    },
  };
}

export function stopAmbient() {
  currentAmbient?.stop();
  currentAmbient = null;
}
