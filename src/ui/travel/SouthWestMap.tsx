import { NIGERIA_MAP, regionOf, REGIONS, SOUTH_WEST_MAP } from '../../game/content/regions';

/**
 * Schematic south-west Nigeria (0–100 × 0–60, north up): Ogun and Oyo farmland, the Ogun River and the Lagos lagoon.
 * The base layer for the train map and the intercity bus map.
 */
export function SouthWestBase() {
  return (
    <>
      <rect width="100" height="60" fill="#b9a678" />
      <path d="M0,54 C14,52 24,57 40,56 C56,55 70,58 100,57 V60 H0 Z" fill="#2d6f86" />
      {/* the Ogun River runs south past Abeokuta to the lagoon; the Osun past Osogbo */}
      <path d="M24,0 C27,10 26,20 29,30 C31,40 30,48 31,56" stroke="#5c9db4" strokeWidth="0.9" fill="none" />
      <path d="M92,0 C90,8 86,14 80,22 C74,30 70,40 64,55" stroke="#5c9db4" strokeWidth="0.7" fill="none" />
      <g fontSize="2.6" fontWeight={800} fill="#6b5137" letterSpacing="0.5" opacity="0.8">
        <text x="6" y="40">OGUN</text>
        <text x="40" y="8">OYO</text>
        <text x="70" y="32">OSUN</text>
      </g>
      <text x="25.5" y="14" fontSize="2.2" fill="#2f5f72" fontWeight={650} transform="rotate(80 25.5 14)">Ogun River</text>
      <text x="46" y="58.6" fontSize="2.4" fill="#d7ecf2" opacity="0.8" fontWeight={650}>LAGOS LAGOON</text>
    </>
  );
}

/** Schematic Nigeria (0–100 × 0–60): neighbours round the edge, the Niger and the Benue meeting at Lokoja. For domestic flights and long bus trips. */
export function NigeriaBase() {
  return (
    <>
      {/* schematic Nigeria: neighbours round the edge, the Niger and the Benue meeting at Lokoja */}
      <rect width="100" height="60" fill="#d8c3a0" />
      <path d="M0,52 C20,50 30,57 44,58 C54,58.5 62,55 72,52 L100,50 V60 H0 Z" fill="#2d6f86" />
      <path d="M11,6 L40,3 L62,7 L80,5 L84,12 L80,24 L74,34 L70,44 L62,51 C54,55 47,57 40,56 C32,55 24,50 14,48 L11,40 L10,26 Z" fill="#c9a77e" stroke="#8a6c4c" strokeWidth="0.5" />
      <path d="M13,10 C20,18 28,26 36,32 C40,35 42,37 42,40 C42,46 41,51 40,55" stroke="#5c9db4" strokeWidth="1" fill="none" />
      <path d="M78,26 C70,30 60,33 52,36 C47,37.5 44,38.5 42,39" stroke="#5c9db4" strokeWidth="1" fill="none" />
      <g fontSize="3" fontWeight={800} fill="#6b5137" letterSpacing="0.5" opacity="0.8">
        <text x="56" y="18">NIGERIA</text>
        <text x="2" y="30">BENIN</text>
        <text x="82" y="42">CAMEROON</text>
        <text x="34" y="6.5" opacity="0.7">NIGER</text>
      </g>
      <g fontSize="2.4" fill="#2f5f72" fontWeight={650} opacity="0.85">
        <text x="20" y="22" transform="rotate(38 20 22)">River Niger</text>
        <text x="56" y="33" transform="rotate(-16 56 33)">Benue</text>
      </g>
      <circle cx="42" cy="39" r="0.7" fill="#15130f" />
      <text x="43.5" y="42" fontSize="2.4" fontWeight={700} fill="#15130f">Lokoja</text>
      <text x="50" y="57.5" fontSize="2.8" fill="#d7ecf2" opacity="0.8" fontWeight={650} letterSpacing="0.4">GULF OF GUINEA</text>
    </>
  );
}

/** An intercity bus trip: the cities on the road network, the road taken, and the bus driving it. */
export function CoachMap({ from, to, durationMs, reduced }: { from: string; to: string; durationMs: number; reduced: boolean }) {
  // trips inside the south-west use its close-up map; longer ones (Lagos → Benin) the map of Nigeria
  const ra = regionOf(from)?.id ?? '';
  const rb = regionOf(to)?.id ?? '';
  const sw = !!(SOUTH_WEST_MAP[ra] && SOUTH_WEST_MAP[rb]);
  const points = sw ? SOUTH_WEST_MAP : NIGERIA_MAP;
  const a = points[ra];
  const b = points[rb];
  if (!a || !b) return null;
  // the road bows a little off the straight line, like the expressways do
  const c: [number, number] = [(a[0] + b[0]) / 2 + (b[1] - a[1]) * 0.18, (a[1] + b[1]) / 2 - (b[0] - a[0]) * 0.08];
  const path = `M${a[0]},${a[1]} Q${c[0]},${c[1]} ${b[0]},${b[1]}`;
  return (
    <svg viewBox="0 0 100 60" className="coast-map" role="img" aria-label={`Bus route from ${regionOf(from)?.name} to ${regionOf(to)?.name}`}>
      {sw ? <SouthWestBase /> : <NigeriaBase />}
      <path d={path} stroke="#3a3530" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d={path} stroke="#f2b705" strokeWidth="0.5" strokeDasharray="1.6 1.2" fill="none" />
      {Object.entries(points).map(([id, [x, y]]) => {
        const name = REGIONS.find((r) => r.id === id)?.name ?? id;
        const end = [regionOf(from)?.id, regionOf(to)?.id].includes(id);
        return (
          <g key={id} transform={`translate(${x} ${y})`}>
            <circle r={end ? 2.2 : 1.4} fill={id === regionOf(to)?.id ? '#f2b705' : '#f6efe2'} stroke="#15130f" strokeWidth="0.5" />
            <text y={y > 40 ? -3.4 : 5.6} x={x > 90 ? 2.6 : 0} textAnchor={x > 90 ? 'end' : 'middle'} fontSize="3" fontWeight={800} fill="#15130f" stroke="#f6efe2" strokeWidth="0.9" style={{ paintOrder: 'stroke' }}>
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
