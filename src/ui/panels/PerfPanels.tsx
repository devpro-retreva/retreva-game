import { useEffect, useState } from 'react';
import { benchState, benchText, deviceInfo, heapMb, runBenchmark, type BenchResult } from '../../game/core/benchmark';
import { deviceEnv, resolveTier } from '../../game/core/quality';
import { runtime } from '../../game/core/runtime';
import { useGame } from '../../game/store/gameStore';

const BENCH_SECONDS = 20;

/** Settings → Performance: live numbers, device facts, and the benchmark. */
export function PerformanceSection() {
  const last = useGame((s) => s.settings.lastBenchmark);
  const graphics = useGame((s) => s.settings.graphics ?? 'auto');
  const update = useGame((s) => s.updateSettings);
  const [live, setLive] = useState({ ...runtime.perf, heap: heapMb() });
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => {
    const id = setInterval(() => setLive({ ...runtime.perf, heap: heapMb() }), 500);
    return () => clearInterval(id);
  }, []);
  const dev = deviceInfo();
  const tier = resolveTier(graphics, deviceEnv());
  const start = useGame((s) => s.startBenchmark);
  const copy = async (r: BenchResult) => {
    try {
      await navigator.clipboard.writeText(benchText(r));
      setCopied('Copied — paste it into a message or issue.');
    } catch {
      setCopied('Copy is blocked here. Select the numbers above instead.');
    }
  };
  return (
    <div className="perf" data-perf>
      <div className="perf-grid num">
        <span>Now</span>
        <b data-live="fps">{live.fps} fps</b>
        <span>Frame</span>
        <b>{live.frameMs || '—'} ms</b>
        <span>Draw calls</span>
        <b>{live.drawCalls}</b>
        <span>Triangles</span>
        <b>{Math.round(live.triangles / 1000)}k</b>
        <span>Graphics</span>
        <b>{tier} · ×{live.dpr}</b>
        <span>Device</span>
        <b>
          {dev.cores ?? '?'} cores · {dev.memoryGb ?? '?'} GB{live.heap ? ` · JS ${live.heap} MB` : ''}
        </b>
      </div>
      <button className="btn block" data-act="bench" onClick={start}>
        Run {BENCH_SECONDS}-second benchmark
      </button>
      {last && (
        <div className="bench-result" data-bench>
          <div className="card-line">
            <span className="muted">Last run · {new Date(last.at).toLocaleDateString()}</span>
            <b className="num" data-bench-fps>{last.avgFps} fps avg</b>
          </div>
          <div className="perf-grid num">
            <span>1% low</span>
            <b>{last.low1Fps} fps</b>
            <span>95% of frames under</span>
            <b>{last.p95Ms} ms</b>
            <span>Worst frame</span>
            <b>{last.maxMs} ms</b>
            <span>Frames</span>
            <b>
              {last.frames} in {last.seconds}s
            </b>
            <span>Graphics</span>
            <b>{last.tier}</b>
          </div>
          <p className="bench-verdict">{last.verdict}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {last.suggest !== tier && (
              <button className="btn sm" data-act="apply-suggest" onClick={() => update({ graphics: last.suggest })}>
                Use {last.suggest} graphics
              </button>
            )}
            <button className="btn sm ghost" onClick={() => void copy(last)}>
              Copy results
            </button>
          </div>
          {copied && <p className="muted small">{copied}</p>}
        </div>
      )}
    </div>
  );
}

/** While the benchmark runs: a small progress card; the camera turns on its own. */
export function BenchmarkOverlay() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let alive = true;
    const s = useGame.getState();
    const tier = resolveTier(s.settings.graphics ?? 'auto', deviceEnv());
    void runBenchmark(BENCH_SECONDS, tier, runtime.perf.dpr, (x) => alive && setP(x)).then((r) => {
      if (!alive) return;
      const g = useGame.getState();
      g.updateSettings({ lastBenchmark: r });
      g.finishBenchmark();
    });
    return () => {
      alive = false;
      benchState.cancel = true;
    };
  }, []);
  return (
    <div className="bench-overlay cut" role="status" aria-live="polite">
      <b>Measuring performance…</b>
      <div className="bench-bar" aria-hidden="true">
        <i style={{ width: `${Math.round(p * 100)}%` }} />
      </div>
      <span className="muted small num">{Math.ceil(BENCH_SECONDS * (1 - p))} s · keep the game in front</span>
    </div>
  );
}
