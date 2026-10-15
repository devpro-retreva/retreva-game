/**
 * Performance diagnostics: frame-time statistics and a short benchmark the player (or the owner, on a
 * real phone) can run from Settings. It turns the camera slowly around the street for a fixed time and
 * measures what the browser actually delivered — average fps, the slowest 1% of frames, frame-time
 * spikes, draw calls — then suggests a graphics tier. Results can be copied as text to share.
 * `summarize` is pure (unit-tested); `runBenchmark` drives the live game.
 */
import { runtime } from './runtime';

export interface BenchResult {
  at: number;
  seconds: number;
  frames: number;
  avgFps: number;
  /** fps of the slowest 1% of frames ("1% low"). */
  low1Fps: number;
  p95Ms: number;
  maxMs: number;
  drawCalls: number;
  triangles: number;
  tier: string;
  dpr: number;
  device: { cores: number | null; memoryGb: number | null; screen: string; ua: string };
  verdict: string;
  suggest: 'low' | 'medium' | 'high';
}

const pct = (sorted: number[], p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)))];

/** Frame times (ms) → statistics and a plain-language verdict. */
export function summarize(frameMs: number[], extra: Omit<BenchResult, 'frames' | 'avgFps' | 'low1Fps' | 'p95Ms' | 'maxMs' | 'verdict' | 'suggest' | 'seconds'> & { seconds?: number }): BenchResult {
  const ms = frameMs.filter((x) => Number.isFinite(x) && x > 0);
  const total = ms.reduce((a, b) => a + b, 0);
  const sorted = [...ms].sort((a, b) => a - b);
  const avgFps = ms.length ? Math.round((ms.length / total) * 1000 * 10) / 10 : 0;
  // 1% low: the average fps over the slowest 1% of frames (at least one frame)
  const worst = sorted.slice(Math.floor(sorted.length * 0.99));
  const worstAvg = worst.length ? worst.reduce((a, b) => a + b, 0) / worst.length : 0;
  const low1Fps = worstAvg ? Math.round((1000 / worstAvg) * 10) / 10 : 0;
  const p95Ms = ms.length ? Math.round(pct(sorted, 0.95) * 10) / 10 : 0;
  const maxMs = ms.length ? Math.round(sorted[sorted.length - 1] * 10) / 10 : 0;
  let verdict: string;
  let suggest: BenchResult['suggest'];
  if (avgFps >= 50 && low1Fps >= 28) {
    verdict = 'Smooth. High graphics should run well here.';
    suggest = 'high';
  } else if (avgFps >= 30 && low1Fps >= 18) {
    verdict = 'Playable. Medium graphics is a good balance.';
    suggest = 'medium';
  } else if (avgFps >= 20) {
    verdict = 'A bit slow. Low graphics will feel better.';
    suggest = 'low';
  } else {
    verdict = 'Struggling. Use Low graphics and close other apps; this device is below what Retreva targets.';
    suggest = 'low';
  }
  return { ...extra, seconds: extra.seconds ?? Math.round(total / 100) / 10, frames: ms.length, avgFps, low1Fps, p95Ms, maxMs, verdict, suggest };
}

export function deviceInfo(): BenchResult['device'] {
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  return {
    cores: nav?.hardwareConcurrency ?? null,
    memoryGb: (nav as unknown as { deviceMemory?: number })?.deviceMemory ?? null,
    screen: typeof window !== 'undefined' ? `${window.screen?.width ?? innerWidth}×${window.screen?.height ?? innerHeight} @${window.devicePixelRatio ?? 1}x` : '',
    ua: nav?.userAgent ?? '',
  };
}

/** JS heap in MB where the browser reports it (Chromium only). */
export function heapMb(): number | null {
  const m = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
  return m ? Math.round(m.usedJSHeapSize / 1048576) : null;
}

export const benchState = { running: false, progress: 0, cancel: false };

/** Turn the camera around for `seconds` and measure every frame the browser renders. */
export function runBenchmark(seconds: number, tier: string, dpr: number, onProgress?: (p: number) => void): Promise<BenchResult> {
  return new Promise((resolve) => {
    const frames: number[] = [];
    const startYaw = runtime.camera.yaw;
    const startPitch = runtime.camera.pitch;
    let last = performance.now();
    const t0 = last;
    let maxCalls = 0;
    let maxTris = 0;
    benchState.running = true;
    benchState.cancel = false;
    const step = (now: number) => {
      const dt = now - last;
      last = now;
      if (now - t0 > 400) frames.push(dt); // skip the first frames (overlay appearing)
      const p = Math.min(1, (now - t0) / (seconds * 1000));
      benchState.progress = p;
      onProgress?.(p);
      runtime.camera.yaw = startYaw + p * Math.PI * 4; // two slow turns: every side of the street
      runtime.camera.pitch = 0.15 + Math.sin(p * Math.PI * 2) * 0.12;
      maxCalls = Math.max(maxCalls, runtime.perf.drawCalls);
      maxTris = Math.max(maxTris, runtime.perf.triangles);
      if (p < 1 && !benchState.cancel) requestAnimationFrame(step);
      else {
        benchState.running = false;
        runtime.camera.yaw = startYaw;
        runtime.camera.pitch = startPitch;
        resolve(summarize(frames, { at: Date.now(), drawCalls: maxCalls, triangles: maxTris, tier, dpr, device: deviceInfo(), seconds: Math.round((now - t0) / 100) / 10 }));
      }
    };
    requestAnimationFrame(step);
  });
}

/** Plain text for sharing (Copy results). */
export function benchText(r: BenchResult): string {
  return [
    `Retreva benchmark — ${new Date(r.at).toISOString()}`,
    `Average ${r.avgFps} fps · 1% low ${r.low1Fps} fps · 95th pct frame ${r.p95Ms} ms · worst ${r.maxMs} ms`,
    `${r.frames} frames in ${r.seconds}s · draw calls ${r.drawCalls} · triangles ${r.triangles}`,
    `Graphics ${r.tier} · pixel ratio ${r.dpr} · ${r.device.cores ?? '?'} cores · ${r.device.memoryGb ?? '?'} GB · screen ${r.device.screen}`,
    `Verdict: ${r.verdict}`,
    r.device.ua,
  ].join('\n');
}
