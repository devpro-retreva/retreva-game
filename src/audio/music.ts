/**
 * Original, generative highlife-style music, synthesised live with Web Audio (no recordings, no files,
 * nothing licensed): a palm-wine guitar picking over a I–IV–I–V progression, a walking bass, a bell
 * pattern and a shaker. Each bar picks a fresh picking pattern and melody turn from a seeded random
 * walk, so it never loops the same way twice. `intensity` (0…1) brings in the drums and lifts the level —
 * near a live stage it plays full band; on the street it's a quiet radio somewhere; at a restaurant, in between.
 */

const BPM = 112;
const BEAT = 60 / BPM;
const STEP = BEAT / 4; // 16th notes
const LOOKAHEAD = 0.35;

// semitone offsets from the key's root for each chord (I, IV, I, V) and their triads
const PROGRESSION = [0, 5, 0, 7];
const TRIAD = [0, 4, 7, 12, 16];
const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
const KEYS = [57, 55, 60, 53]; // A3, G3, C4, F3 (MIDI) — a new key now and then

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

/** Small deterministic random, so a session's music is reproducible in tests. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

// picking patterns: which 16th steps of the bar the guitar plays, and which chord tone (index into TRIAD)
const PICKING: [number, number][][] = [
  [[0, 0], [2, 2], [4, 1], [6, 3], [8, 0], [10, 2], [12, 1], [14, 3]],
  [[0, 0], [3, 2], [6, 3], [8, 1], [10, 2], [11, 3], [14, 4]],
  [[2, 2], [4, 1], [6, 3], [7, 2], [10, 1], [12, 3], [14, 2], [15, 1]],
];
const BELL = [0, 2, 4, 5, 7, 9, 11, 12, 14];
const BASS: [number, number][] = [[0, 0], [6, 7], [8, 0], [12, 4], [14, 7]];

export class Music {
  private ctx: AudioContext;
  private out: GainNode;
  private bus: GainNode;
  private noise: AudioBuffer;
  private timer = 0;
  private nextTime = 0;
  private step = 0;
  private bar = 0;
  private key = KEYS[0];
  private pattern = PICKING[0];
  private rand = rng(7);
  private melody = 4;
  intensity = 0.25;
  playing = false;
  bars = 0;

  constructor(ctx: AudioContext, destination: AudioNode, noise: AudioBuffer) {
    this.ctx = ctx;
    this.noise = noise;
    this.out = ctx.createGain();
    this.out.gain.value = 0;
    this.bus = ctx.createGain();
    this.bus.gain.value = 1;
    // a touch of warmth: gentle low-pass on the whole band
    const warm = ctx.createBiquadFilter();
    warm.type = 'lowpass';
    warm.frequency.value = 5200;
    this.bus.connect(warm).connect(this.out).connect(destination);
  }

  /** Overall music volume (from settings). */
  setVolume(v: number) {
    this.out.gain.setTargetAtTime(Math.max(0, Math.min(1, v)) * 0.5, this.ctx.currentTime, 0.2);
  }

  /** 0 = barely there (a radio down the street) … 1 = the band is right in front of you. */
  setIntensity(v: number) {
    this.intensity = Math.max(0, Math.min(1, v));
    this.bus.gain.setTargetAtTime(0.25 + 0.75 * this.intensity, this.ctx.currentTime, 0.6);
  }

  start(seed = Date.now()) {
    if (this.playing) return;
    this.rand = rng(seed);
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = window.setInterval(() => this.schedule(), 100);
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
  }

  private schedule() {
    const c = this.ctx;
    if (c.state !== 'running') return;
    // after a pause (tab hidden), don't try to catch up
    if (this.nextTime < c.currentTime - 0.5) this.nextTime = c.currentTime + 0.05;
    while (this.nextTime < c.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += STEP * (this.step % 2 ? 0.94 : 1.06); // a little swing
      this.step = (this.step + 1) % 16;
      if (this.step === 0) this.newBar();
    }
  }

  private newBar() {
    this.bar++;
    this.bars++;
    if (this.bar % 4 === 0) {
      this.pattern = PICKING[Math.floor(this.rand() * PICKING.length)];
      if (this.bar % 32 === 0) this.key = KEYS[Math.floor(this.rand() * KEYS.length)];
    }
  }

  private playStep(step: number, t: number) {
    const chord = this.key + PROGRESSION[this.bar % 4];
    for (const [s, tone] of this.pattern) if (s === step) this.pluck(midi(chord + 12 + TRIAD[tone]), t, 0.11);
    // a melody note on some offbeats, walking up and down the scale
    if ((step === 3 || step === 11) && this.rand() < 0.55) {
      this.melody = Math.max(0, Math.min(SCALE.length - 1, this.melody + (this.rand() < 0.5 ? -1 : 1) * (this.rand() < 0.3 ? 2 : 1)));
      this.pluck(midi(this.key + 24 + SCALE[this.melody]), t, 0.09, 0.9);
    }
    for (const [s, off] of BASS) if (s === step) this.bass(midi(chord - 12 + off), t);
    if (BELL.includes(step)) this.bell(t, step === 0 ? 0.05 : 0.03);
    if (step % 2 === 1) this.shaker(t, step % 4 === 3 ? 0.05 : 0.03);
    if (this.intensity > 0.45) {
      if (step === 0 || step === 10) this.kick(t);
      if (step === 4 || step === 12) this.snare(t);
    }
  }

  private env(g: GainNode, t: number, peak: number, decay: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  }

  /** Palm-wine guitar: a bright triangle + saw blend through a closing low-pass. */
  private pluck(f: number, t: number, level: number, decay = 0.6) {
    const c = this.ctx;
    const o1 = c.createOscillator();
    const o2 = c.createOscillator();
    o1.type = 'triangle';
    o2.type = 'sawtooth';
    o1.frequency.value = f;
    o2.frequency.value = f * 1.003;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(f * 6, t);
    lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + decay);
    const g = c.createGain();
    const mix = c.createGain();
    mix.gain.value = 0.35;
    this.env(g, t, level, decay);
    o1.connect(lp);
    o2.connect(mix).connect(lp);
    lp.connect(g).connect(this.bus);
    o1.start(t);
    o2.start(t);
    o1.stop(t + decay + 0.05);
    o2.stop(t + decay + 0.05);
  }

  private bass(f: number, t: number) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = f;
    const g = c.createGain();
    this.env(g, t, 0.22, 0.32);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.36);
  }

  /** Gankogui-like bell: two inharmonic sines, very short. */
  private bell(t: number, level: number) {
    const c = this.ctx;
    for (const f of [1620, 2430]) {
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = c.createGain();
      this.env(g, t, level, 0.09);
      o.connect(g).connect(this.bus);
      o.start(t);
      o.stop(t + 0.1);
    }
  }

  private shaker(t: number, level: number) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 6000;
    const g = c.createGain();
    this.env(g, t, level, 0.05);
    src.connect(hp).connect(g).connect(this.bus);
    src.start(t, Math.random() * 3, 0.06);
  }

  private kick(t: number) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = c.createGain();
    this.env(g, t, 0.35 * this.intensity, 0.18);
    o.connect(g).connect(this.bus);
    o.start(t);
    o.stop(t + 0.2);
  }

  private snare(t: number) {
    const c = this.ctx;
    const src = c.createBufferSource();
    src.buffer = this.noise;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1800;
    bp.Q.value = 0.8;
    const g = c.createGain();
    this.env(g, t, 0.12 * this.intensity, 0.12);
    src.connect(bp).connect(g).connect(this.bus);
    src.start(t, Math.random() * 3, 0.14);
  }
}
