import { useEffect, useRef, useState } from 'react';
import { findFlight } from '../../game/content/flights';
import { regionOf } from '../../game/content/regions';
import { useGame } from '../../game/store/gameStore';
import { IconPlane } from '../icons/Icons';

const PHASES = [
  { until: 0.15, text: (gate: string) => `Boarding at gate ${gate}` },
  { until: 0.32, text: () => 'Taking off' },
  { until: 0.76, text: () => 'Cruising at 33,000 ft' },
  { until: 1.01, text: () => 'Landing' },
];

/**
 * A flight: the plane crosses a schematic map (the Gulf of Guinea coast, Nigeria for domestic flights, or a long-haul overview)
 * while the cabin goes through boarding → take-off → cruise (a snack) → landing.
 * Skippable; reduced motion shortens it and holds the plane still.
 */
export function FlightOverlay() {
  const flight = useGame((s) => s.flight);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const land = useGame((s) => s.land);
  const route = flight ? findFlight(flight.routeId) : undefined;
  const duration = reduced ? 1800 : 7000;
  const plane = useRef<SVGGElement>(null);
  const [k, setK] = useState(0);
  const [eased, setEased] = useState(0);
  const landed = useRef(false);

  const finish = () => {
    if (landed.current) return;
    landed.current = true;
    land();
  };

  const [x0, y0] = route?.map.from ?? [0, 0];
  const [x1, y1] = route?.map.to ?? [0, 0];
  const cx = (x0 + x1) / 2;
  const cy = Math.min(y0, y1) - 16;
  const path = `M${x0},${y0} Q${cx},${cy} ${x1},${y1}`;

  useEffect(() => {
    if (!route) return;
    landed.current = false;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', path);
    const len = el.getTotalLength();
    let raf = 0;
    let last = -1;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const at = reduced ? 1 : e;
      const pt = el.getPointAtLength(len * at);
      const ahead = el.getPointAtLength(Math.min(len, len * at + 0.5));
      const ang = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI;
      plane.current?.setAttribute('transform', `translate(${pt.x} ${pt.y}) rotate(${at >= 1 ? (x1 < x0 ? 180 : 0) : ang})`);
      const q = Math.round(p * 50) / 50;
      if (q !== last) {
        last = q;
        setK(p);
        setEased(at);
      }
      if (p < 1) raf = requestAnimationFrame(step);
      else setTimeout(finish, 450);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.id, duration, reduced]);

  if (!route || !flight) return null;
  const phase = PHASES.find((ph) => k < ph.until) ?? PHASES[PHASES.length - 1];
  const fromName = regionOf(route.from)?.name;
  const cruising = k >= 0.32 && k < 0.76;
  return (
    <div className="transit flight-overlay" role="status" aria-live="polite" data-phase={phase.text(route.gate)}>
      <div className="transit-card">
        <div className="eyelabel">
          {route.carrier} · {route.code}
        </div>
        <h2>
          {fromName} <IconPlane size={20} /> {route.cityName}
        </h2>
        <div className="transit-map cut">
          <svg viewBox="0 0 100 60" className="coast-map" role="img" aria-label={`Flight path from ${fromName} to ${route.cityName}`}>
            <rect width="100" height="60" fill="#2d6f86" />
            {route.chart === 'nigeria' ? (
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
            ) : route.chart === 'longhaul' ? (
              <>
                {/* schematic: West Africa (left), the Sahara, the Red Sea and the Arabian Peninsula (right) */}
                <path d="M0,4 H58 C60,10 61,18 63,26 C64,34 62,44 58,60 H0 Z" fill="#c9a77e" />
                <path d="M66,0 H100 V30 C96,34 90,36 84,34 C78,30 72,24 68,14 C67,9 66,4 66,0 Z" fill="#cfae84" />
                <path d="M58,4 C60,10 61,18 63,26 M66,0 C66,4 67,9 68,14" stroke="#f6efe2" strokeOpacity="0.5" strokeWidth="0.5" fill="none" />
                <g fontSize="3" fontWeight={800} fill="#6b5137" letterSpacing="0.5" opacity="0.8">
                  <text x="6" y="54">WEST AFRICA</text>
                  <text x="22" y="20">SAHARA</text>
                  <text x="74" y="8">ARABIA</text>
                </g>
                <text x="60.5" y="34" fontSize="2.6" fill="#d7ecf2" opacity="0.8" fontWeight={650} transform="rotate(70 60.5 34)">RED SEA</text>
                <text x="84" y="44" fontSize="2.8" fill="#d7ecf2" opacity="0.75" fontWeight={650}>GULF</text>
              </>
            ) : (
              <>
            {/* the coast of Ghana, Togo, Benin and Nigeria, schematic */}
            <path d="M0,0 H100 V28 C94,29 90,30 86,30 C78,31 70,31 60,31 C52,31 46,30.6 40,30 C32,29.2 24,28 16,27 C10,26 5,24 0,23 Z" fill="#c9a77e" />
            <path d="M0,23 C5,24 10,26 16,27 C24,28 32,29.2 40,30 C46,30.6 52,31 60,31 C70,31 78,31 86,30 C90,30 94,29 100,28" stroke="#f6efe2" strokeOpacity="0.5" strokeWidth="0.5" fill="none" />
            {[33, 46, 66].map((x) => (
              <path key={x} d={`M${x},2 L${x + 1},${x === 33 ? 29.5 : x === 46 ? 30.6 : 31}`} stroke="#8a6c4c" strokeWidth="0.4" strokeDasharray="1 1" />
            ))}
            <g fontSize="3" fontWeight={800} fill="#6b5137" letterSpacing="0.5" opacity="0.8">
              <text x="12" y="13">GHANA</text>
              <text x="35.5" y="15">TOGO</text>
              <text x="52" y="16">BENIN</text>
              <text x="78" y="13">NIGERIA</text>
            </g>
            <text x="40" y="50" fontSize="3.2" fill="#d7ecf2" opacity="0.75" fontWeight={650} letterSpacing="0.5">GULF OF GUINEA</text>
            <g fontSize="2.6" fill="#15130f" fontWeight={700}>
              <circle cx="40" cy="30" r="0.8" fill="#15130f" />
              <text x="38" y="34.5">Lomé</text>
              <circle cx="60" cy="31" r="0.8" fill="#15130f" />
              <text x="56.5" y="35.5">Cotonou</text>
            </g>
              </>
            )}
            {[route.map.from, route.map.to].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="2.2" fill={i === 0 ? '#f6efe2' : '#f2b705'} stroke="#15130f" strokeWidth="0.6" />
                <text y="6.4" textAnchor="middle" fontSize="3.4" fontWeight={800} fill="#15130f" stroke="#f6efe2" strokeWidth="1" style={{ paintOrder: 'stroke' }}>
                  {i === 0 ? fromName : route.cityName}
                </text>
              </g>
            ))}
            <path d={path} stroke="#f6efe2" strokeWidth="0.7" strokeDasharray="0.1 1.8" strokeLinecap="round" fill="none" />
            <g ref={plane}>
              <path d="M3,0 L-1.6,-0.7 L-2.4,-2.8 L-3.1,-2.8 L-2.4,-0.6 L-3.2,-0.5 L-3.8,-1.4 L-4.3,-1.4 L-3.9,0 L-4.3,1.4 L-3.8,1.4 L-3.2,0.5 L-2.4,0.6 L-3.1,2.8 L-2.4,2.8 L-1.6,0.7 Z" fill="#f6efe2" stroke="#15130f" strokeWidth="0.4" />
            </g>
          </svg>
        </div>
        <p className="transit-line">
          {phase.text(route.gate)}
          {cruising && ` · ${route.snack.name} served`}
        </p>
        <div className="flight-progress" aria-hidden="true">
          <i style={{ transform: `scaleX(${eased})` }} />
        </div>
        <div className="transit-meta num">
          About {route.minutes} min · {flight.firstVisit ? `First time in ${route.cityName}` : `Back to ${route.cityName}`}
        </div>
        <button className="btn ghost" onClick={finish} style={{ marginTop: 12 }}>
          Skip to landing
        </button>
      </div>
    </div>
  );
}
