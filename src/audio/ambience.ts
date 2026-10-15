/**
 * City soundscapes and small sound effects, synthesised with Web Audio — no audio files, so nothing to
 * download, license or cache, and it works offline. Each area describes its mix in pack data
 * (`pack.ambience`); this module turns that into layers:
 *   traffic  — low filtered noise (engines, tyres)
 *   crowd    — mid-band noise with slow random swells (people talking, without words)
 *   horns    — occasional two-tone danfo/taxi horns, panned left/right
 *   waves    — slow swelling surf (beach)
 *   chimes   — a soft two-note chime now and then (airport announcements)
 * Ambience and effects have separate volumes and a master mute (Settings → Sound).
 * Browsers only allow audio after a tap/click, so `unlock()` is called from the first user gesture.
 */
import type { DestinationPack } from '../game/content/types';
import { Music } from './music';
export type AmbienceDef = NonNullable<DestinationPack['ambience']>;

type Layer = { gain: GainNode; stop: () => void };

class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private amb!: GainNode;
  private fx!: GainNode;
  private duck!: GainNode;
  private layers: Layer[] = [];
  private timers: number[] = [];
  private noise: AudioBuffer | null = null;
  current: string | null = null;
  settings = { ambience: 0.7, effects: 0.8, muted: false, music: 0.4 };
  music: Music | null = null;
  private musicWanted = false;
  private musicIntensity = 0.25;
  /** For tests and the settings screen. */
  get status() {
    return { state: this.ctx?.state ?? 'none', area: this.current, layers: this.layers.length, music: { playing: !!this.music?.playing, bars: this.music?.bars ?? 0, intensity: this.music?.intensity ?? 0 } };
  }

  unlock() {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!this.ctx) {
      try {
        this.ctx = new AC();
      } catch {
        return;
      }
      const c = this.ctx;
      this.master = c.createGain();
      this.duck = c.createGain();
      this.amb = c.createGain();
      this.fx = c.createGain();
      this.amb.connect(this.duck);
      this.duck.connect(this.master);
      this.fx.connect(this.master);
      this.master.connect(c.destination);
      this.apply(this.settings);
      // one shared 4 s white-noise buffer; filters shape it into each layer
      const len = c.sampleRate * 4;
      this.noise = c.createBuffer(1, len, c.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.music = new Music(c, this.master, this.noise);
      this.music.setVolume(this.settings.music);
      this.music.setIntensity(this.musicIntensity);
      if (this.musicWanted && this.settings.music > 0) this.music.start();
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.visibilityState === 'hidden') void this.ctx.suspend();
        else void this.ctx.resume();
      });
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  apply(s: { ambience: number; effects: number; muted: boolean; music?: number }) {
    this.settings = { ...s, music: s.music ?? this.settings.music };
    this.music?.setVolume(this.settings.music);
    if (this.music && this.settings.music <= 0) this.music.stop();
    else if (this.music && this.musicWanted && this.ctx?.state === 'running') this.music.start();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(s.muted ? 0 : 1, t, 0.05);
    this.amb.gain.setTargetAtTime(s.ambience * 0.55, t, 0.1);
    this.fx.gain.setTargetAtTime(s.effects * 0.6, t, 0.05);
  }

  /** Music on or off (it starts once audio is unlocked), and how present it is (see Music.setIntensity). */
  setMusic(on: boolean, intensity = this.musicIntensity) {
    this.musicWanted = on;
    this.musicIntensity = intensity;
    if (!this.music) return;
    this.music.setIntensity(intensity);
    if (on && this.settings.music > 0) this.music.start();
    else if (!on) this.music.stop();
  }

  /** Quieter ambience behind menus, conversations and the phone. */
  setDucked(on: boolean) {
    if (!this.ctx) return;
    this.duck.gain.setTargetAtTime(on ? 0.4 : 1, this.ctx.currentTime, 0.25);
  }

  private noiseSource(): AudioBufferSourceNode {
    const src = this.ctx!.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    src.playbackRate.value = 0.9 + Math.random() * 0.2;
    src.start(0, Math.random() * 3);
    return src;
  }

  private filtered(type: BiquadFilterType, freq: number, q: number, level: number): Layer {
    const c = this.ctx!;
    const src = this.noiseSource();
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = c.createGain();
    g.gain.value = 0;
    g.gain.setTargetAtTime(level, c.currentTime, 1.2);
    src.connect(f).connect(g).connect(this.amb);
    return { gain: g, stop: () => { g.gain.setTargetAtTime(0, c.currentTime, 0.4); setTimeout(() => src.stop(), 1600); } };
  }

  /** Slowly wander a layer's level so it breathes like a real street. */
  private wander(layer: Layer, base: number, depth: number, every: number) {
    const id = window.setInterval(() => {
      if (!this.ctx) return;
      layer.gain.gain.setTargetAtTime(Math.max(0, base * (1 - depth + Math.random() * depth * 2)), this.ctx.currentTime, every / 3000);
    }, every);
    this.timers.push(id);
  }

  /** A danfo/taxi horn: two detuned tones, short and slightly distant. */
  horn() {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    const pan = c.createStereoPanner();
    pan.pan.value = Math.random() * 1.6 - 0.8;
    const g = c.createGain();
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600;
    const level = 0.05 + Math.random() * 0.06;
    const beeps = Math.random() < 0.4 ? 2 : 1;
    for (let k = 0; k < beeps; k++) {
      const t0 = t + k * 0.32;
      for (const f of [392, 466]) {
        const o = c.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f * (0.97 + Math.random() * 0.06);
        o.connect(lp);
        o.start(t0);
        o.stop(t0 + 0.22);
      }
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(level, t0 + 0.02);
      g.gain.setTargetAtTime(0, t0 + 0.16, 0.03);
    }
    lp.connect(g).connect(pan).connect(this.amb);
  }

  private chime() {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime;
    [659.25, 523.25].forEach((f, i) => this.tone(f, t + i * 0.45, 0.9, 0.05, this.amb));
  }

  private tone(freq: number, at: number, dur: number, level: number, out: AudioNode, type: OscillatorType = 'sine') {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(level, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(out);
    o.start(at);
    o.stop(at + dur + 0.05);
  }

  /** Switch to an area's soundscape (cross-fades the old one out). */
  setArea(id: string, def: AmbienceDef | undefined) {
    if (!this.ctx || this.current === id) return;
    this.current = id;
    this.layers.forEach((l) => l.stop());
    this.layers = [];
    this.timers.forEach((t) => clearInterval(t));
    this.timers = [];
    if (!def) return;
    if (def.traffic > 0) {
      const l = this.filtered('lowpass', 180, 0.7, def.traffic * 0.5);
      this.layers.push(l);
      this.wander(l, def.traffic * 0.5, 0.35, 2600);
    }
    if (def.crowd > 0) {
      for (const [f, q] of [[520, 1.4], [1100, 1.8]] as const) {
        const l = this.filtered('bandpass', f, q, def.crowd * 0.32);
        this.layers.push(l);
        this.wander(l, def.crowd * 0.32, 0.6, 900 + Math.random() * 700);
      }
    }
    if (def.waves) {
      const l = this.filtered('lowpass', 700, 0.5, def.waves * 0.5);
      this.layers.push(l);
      // a slow swell every ~7 s
      const id = window.setInterval(() => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        l.gain.gain.cancelScheduledValues(t);
        l.gain.gain.setTargetAtTime(def.waves! * 0.9, t, 1.2);
        l.gain.gain.setTargetAtTime(def.waves! * 0.18, t + 3.2, 1.6);
      }, 7000);
      this.timers.push(id);
    }
    const every = (perMin: number, fn: () => void) => {
      if (perMin <= 0) return;
      const id = window.setInterval(() => {
        if (Math.random() < 0.5) fn();
      }, (60000 / perMin) * 0.5);
      this.timers.push(id);
    };
    every(def.horns, () => this.horn());
    every(def.chimes ?? 0, () => this.chime());
  }

  // ── effects ──
  coin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(988, t, 0.12, 0.12, this.fx, 'triangle');
    this.tone(1319, t + 0.08, 0.3, 0.12, this.fx, 'triangle');
  }
  bell() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 2; i++) {
      this.tone(2093, t + i * 0.16, 0.35, 0.07, this.fx);
      this.tone(3136, t + i * 0.16, 0.2, 0.03, this.fx);
    }
  }
  tap() {
    if (!this.ctx) return;
    this.tone(660, this.ctx.currentTime, 0.06, 0.05, this.fx, 'triangle');
  }
  takeoff() {
    if (!this.ctx) return;
    const c = this.ctx;
    const src = this.noiseSource();
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(200, c.currentTime);
    f.frequency.linearRampToValueAtTime(900, c.currentTime + 2.5);
    const g = c.createGain();
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(0.25, c.currentTime + 1.5);
    g.gain.setTargetAtTime(0, c.currentTime + 4, 0.8);
    src.connect(f).connect(g).connect(this.fx);
    setTimeout(() => src.stop(), 7000);
  }
}

export const audio = new AudioEngine();
