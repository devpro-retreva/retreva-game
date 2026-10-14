import { useMemo, useState } from 'react';
import type { SaveData } from '../../game/persistence/types';
import { seeded } from '../../scene/builders/painters';
import { formatDuration } from '../hooks';

/** Layered street-silhouette illustration built from shapes, not images. */
function Skyline() {
  const shapes = useMemo(() => {
    const rnd = seeded('title-skyline');
    const far: JSX.Element[] = [];
    const near: JSX.Element[] = [];
    let x = -20;
    while (x < 1440) {
      const w = 60 + rnd() * 90;
      const h = 120 + rnd() * 220;
      far.push(<rect key={`f${x}`} x={x} y={400 - h} width={w} height={h} />);
      x += w + rnd() * 10;
    }
    x = -10;
    let i = 0;
    while (x < 1440) {
      const w = 110 + rnd() * 120;
      const h = 90 + rnd() * 110;
      const y = 400 - h;
      near.push(<rect key={`n${i}`} x={x} y={y} width={w} height={h} />);
      // parapet + rooftop tank
      if (rnd() > 0.35) {
        const tx = x + 16 + rnd() * (w - 50);
        near.push(<rect key={`ts${i}`} x={tx} y={y - 10} width={30} height={10} />);
        near.push(<rect key={`t${i}`} x={tx + 3} y={y - 34} width={24} height={26} rx={4} />);
      }
      // windows punched out as lighter ink
      for (let r = 0; r < Math.floor(h / 48); r++) {
        for (let c = 0; c < Math.floor(w / 46); c++) {
          if (rnd() > 0.75) continue;
          near.push(<rect key={`w${i}-${r}-${c}`} x={x + 14 + c * 46} y={y + 18 + r * 48} width={22} height={24} fill="#3a2a1c" />);
        }
      }
      x += w + 6;
      i++;
    }
    return { far, near };
  }, []);

  return (
    <svg className="skyline" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill="#c78f63" opacity={0.55}>{shapes.far}</g>
      {/* power lines */}
      <g stroke="#2a1d14" strokeWidth={2} fill="none" opacity={0.75}>
        <path d="M0 150 Q 240 190 480 150 T 960 150 T 1440 150" />
        <path d="M0 162 Q 240 202 480 162 T 960 162 T 1440 162" />
      </g>
      <g fill="#2a1d14">
        {[480, 960].map((px) => (
          <g key={px}>
            <rect x={px - 4} y={140} width={8} height={260} />
            <rect x={px - 30} y={146} width={60} height={6} />
          </g>
        ))}
      </g>
      <g fill="#4a3424">{shapes.near}</g>
      {/* palm */}
      <g fill="#2a1d14">
        <path d="M1180 400 C 1185 330 1192 290 1200 250 L 1208 252 C 1200 300 1196 340 1194 400 Z" />
        <path d="M1204 250 c -40 -6 -70 10 -90 30 c 30 -14 60 -18 90 -24 Z M1204 250 c 30 -24 66 -26 96 -14 c -34 2 -66 8 -96 18 Z M1204 250 c -10 -36 -40 -56 -70 -60 c 26 14 50 34 66 62 Z M1204 250 c 20 -30 52 -44 84 -42 c -30 8 -58 24 -80 46 Z" />
      </g>
      {/* danfo */}
      <g transform="translate(250 330)">
        <rect x={0} y={0} width={190} height={58} rx={10} fill="#f2b705" />
        <rect x={12} y={8} width={150} height={20} rx={3} fill="#2a1d14" />
        <rect x={0} y={34} width={190} height={4} fill="#15130f" />
        <rect x={0} y={42} width={190} height={4} fill="#15130f" />
        <circle cx={40} cy={60} r={14} fill="#15130f" />
        <circle cx={150} cy={60} r={14} fill="#15130f" />
      </g>
      <rect x={0} y={388} width={1440} height={12} fill="#2a1d14" />
    </svg>
  );
}

export function TitleScreen({ save, onContinue, onNew }: { save: SaveData | null; onContinue: () => void; onNew: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <main className="screen-full">
      <Skyline />
      <div className="title-wrap">
        <h1 className="wordmark">
          Retr<em>e</em>va
        </h1>
        <p className="tagline">Build a virtual lifestyle and travel to places of your dreams.</p>
        {save && (
          <p className="continue-meta num">
            {save.profile.name} · ₦{save.wallet.balance.toLocaleString('en-NG')} · played {formatDuration(save.stats.playTimeMs)}
          </p>
        )}
        <div className="title-actions">
          {save && (
            <button className="btn dark" onClick={onContinue} autoFocus>
              Continue
            </button>
          )}
          {save && !confirm ? (
            <button className="btn ghost" onClick={() => setConfirm(true)}>
              New life
            </button>
          ) : (
            <button className="btn dark" onClick={onNew} autoFocus={!save} style={save ? { background: '#b4321f' } : undefined}>
              {save ? 'Replace my save' : 'Start a new life'}
            </button>
          )}
        </div>
        <div className="title-foot">Saves on this device · No account needed</div>
      </div>
    </main>
  );
}
