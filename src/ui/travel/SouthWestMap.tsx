import { regionOf, SOUTH_WEST_MAP } from '../../game/content/regions';

/**
 * Schematic south-west Nigeria (0–100 × 0–60, north up): Ogun and Oyo farmland, the Ogun River and the Lagos lagoon.
 * The base layer for the train map and the intercity bus map.
 */
export function SouthWestBase() {
  return (
    <>
      <rect width="100" height="60" fill="#b9a678" />
      <path d="M0,54 C14,52 24,57 40,56 C56,55 70,58 100,57 V60 H0 Z" fill="#2d6f86" />
      <path d="M30,0 C32,12 30,24 34,34 C37,42 34,50 36,56" stroke="#5c9db4" strokeWidth="0.9" fill="none" />
      <g fontSize="2.6" fontWeight={800} fill="#6b5137" letterSpacing="0.5" opacity="0.8">
        <text x="6" y="12">OGUN</text>
        <text x="74" y="34">OYO</text>
      </g>
      <text x="35" y="22" fontSize="2.2" fill="#2f5f72" fontWeight={650} transform="rotate(80 35 22)">Ogun River</text>
      <text x="46" y="58.6" fontSize="2.4" fill="#d7ecf2" opacity="0.8" fontWeight={650}>LAGOS LAGOON</text>
    </>
  );
}

/** An intercity bus trip: the cities on the road network, the road taken, and the bus driving it. */
export function CoachMap({ from, to, durationMs, reduced }: { from: string; to: string; durationMs: number; reduced: boolean }) {
  const a = SOUTH_WEST_MAP[regionOf(from)?.id ?? ''];
  const b = SOUTH_WEST_MAP[regionOf(to)?.id ?? ''];
  if (!a || !b) return null;
  // the road bows a little off the straight line, like the expressways do
  const c: [number, number] = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.18, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.08];
  const path = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  return (
    <svg viewBox="0 0 100 60" className="coast-map" role="img" aria-label={`Bus route from ${regionOf(from)?.name} to ${regionOf(to)?.name}`}>
      <SouthWestBase />
      <path d={path} stroke="#3a3530" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={path} stroke="#f2b705" strokeWidth="0.5" strokeDasharray="1.6 1.2" fill="none" />
      {Object.entries(SOUTH_WEST_MAP).map(([id, [x, y]]) => {
        const name = id[0].toUpperCase() + id.slice(1);
        const end = [regionOf(from)?.id, regionOf(to)?.id].includes(id);
        return (
          <g key={id} transform={`translate(${x} ${y})`}>
            <circle r={end ? 2.2 : 1.4} fill={id === regionOf(to)?.id ? '#f2b705' : '#f6efe2'} stroke="#15130f" strokeWidth="0.5" />
            <text y={y > 40 ? -3.4 : 5.6} textAnchor="middle" fontSize="3" fontWeight={800} fill="#15130f" stroke="#f6efe2" strokeWidth="0.9" style={{ paintOrder: 'stroke' }}>
              {name}
            </text>
          </g>
        );
      })}
      <g transform={reduced ? `translate(${b[0]} ${b[1]})` : undefined}>
        <rect x="-3" y="-1.8" width="6" height="3.2" rx="0.8" fill="#f6efe2" stroke="#15130f" strokeWidth="0.45" />
        <rect x="-3" y="-0.4" width="6" height="0.5" fill="#1f6f4a" />
        {!reduced && <animateMotion dur={`${durationMs}ms`} path={path} fill="freeze" rotate="auto" />}
      </g>
    </svg>
  );
}
