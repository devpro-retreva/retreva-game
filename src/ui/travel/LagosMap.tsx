import { useEffect, useRef } from 'react';
import { LAGOS_AREAS, findArea } from '../../game/content/regions/lagosState';

/**
 * Schematic map of Lagos: mainland, the lagoon, the Island and the Lekki
 * peninsula along the Atlantic. Areas are pins; an optional route animates
 * a danfo from one area to another.
 */
export function LagosMap({
  current,
  visited = [],
  highlight,
  route,
  durationMs = 2600,
  onPick,
}: {
  current: string;
  visited?: string[];
  highlight?: string;
  route?: { from: string; to: string };
  durationMs?: number;
  onPick?: (id: string) => void;
}) {
  const bus = useRef<SVGGElement>(null);
  const a = route && findArea(route.from);
  const b = route && findArea(route.to);
  // gentle curve between the two areas
  const path = a && b ? `M${a.map[0]},${a.map[1]} Q${(a.map[0] + b.map[0]) / 2 + 10},${(a.map[1] + b.map[1]) / 2 - 12} ${b.map[0]},${b.map[1]}` : null;

  useEffect(() => {
    if (!path || !bus.current) return;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', path);
    const len = el.getTotalLength();
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const pt = el.getPointAtLength(len * e);
      bus.current?.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [path, durationMs]);

  return (
    <svg viewBox="0 0 100 100" className="lagos-map" role="img" aria-label="Map of Lagos">
      <rect width="100" height="100" fill="#2d6f86" />
      {/* mainland */}
      <path d="M0,0 H100 V52 C88,56 74,58 62,60 C52,62 46,60 40,62 C30,64 18,62 0,64 Z" fill="#c9a77e" />
      {/* Lagos Island */}
      <path d="M26,70 C32,66 42,66 48,70 C50,74 44,78 36,78 C30,78 24,75 26,70 Z" fill="#c9a77e" />
      {/* Lekki peninsula along the Atlantic */}
      <path d="M48,78 C60,74 80,74 100,72 V86 C80,88 62,88 48,86 Z" fill="#c9a77e" />
      {/* Atlantic */}
      <path d="M0,90 C30,88 60,94 100,90 V100 H0 Z" fill="#245d73" />
      <path d="M0,90 C30,88 60,94 100,90" stroke="#f6efe2" strokeOpacity="0.5" strokeWidth="0.6" fill="none" />
      {/* bridges */}
      <path d="M38,62 L37,68" stroke="#7d7362" strokeWidth="1" />
      <path d="M47,71 L52,78" stroke="#7d7362" strokeWidth="1" />
      <text x="70" y="66" fontSize="3.2" fill="#d7ecf2" opacity="0.7" fontWeight={650} letterSpacing="0.4">LAGOON</text>
      <text x="6" y="97" fontSize="3.2" fill="#d7ecf2" opacity="0.7" fontWeight={650} letterSpacing="0.4">ATLANTIC OCEAN</text>
      {path && <path d={path} stroke="#f2b705" strokeWidth="1.2" strokeDasharray="0.1 2.4" strokeLinecap="round" fill="none" />}
      {LAGOS_AREAS.map((area) => {
        const isCur = area.id === current;
        const seen = visited.includes(area.id);
        const hl = area.id === highlight;
        const below = area.map[1] < 30;
        return (
          <g
            key={area.id}
            transform={`translate(${area.map[0]} ${area.map[1]})`}
            onClick={onPick && !isCur ? () => onPick(area.id) : undefined}
            style={{ cursor: onPick && !isCur ? 'pointer' : undefined }}
          >
            {(hl || isCur) && <circle r="5" fill={isCur ? '#f2b705' : '#f6efe2'} opacity="0.25" />}
            <circle r="2.4" fill={isCur ? '#f2b705' : seen ? '#f6efe2' : '#15130f'} stroke={isCur ? '#15130f' : '#f6efe2'} strokeWidth="0.7" />
            <text y={below ? 7 : -4.2} textAnchor="middle" fontSize="4" fontWeight={800} fill="#15130f" stroke="#f6efe2" strokeWidth="1.1" style={{ paintOrder: 'stroke' }}>
              {area.district}
            </text>
          </g>
        );
      })}
      {path && (
        <g ref={bus}>
          <rect x="-3" y="-2" width="6" height="3.6" rx="0.8" fill="#f2b705" stroke="#15130f" strokeWidth="0.5" />
          <rect x="-3" y="-0.4" width="6" height="0.5" fill="#15130f" />
          <circle cx="-1.6" cy="1.8" r="0.7" fill="#15130f" />
          <circle cx="1.6" cy="1.8" r="0.7" fill="#15130f" />
        </g>
      )}
    </svg>
  );
}
