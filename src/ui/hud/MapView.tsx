import { useMemo, useRef } from 'react';
import type { DestinationPack } from '../../game/content/types';
import { runtime } from '../../game/core/runtime';
import { useGame } from '../../game/store/gameStore';
import { useRaf } from '../hooks';

/**
 * Top-down street map drawn from destination data.
 * - mode "follow": small, centred on the player (HUD minimap)
 * - mode "full": whole destination with labels (phone Map app)
 * Player marker and viewBox update per frame via refs, never via React state.
 */
export function MapView({ pack, mode }: { pack: DestinationPack; mode: 'follow' | 'full' }) {
  const svg = useRef<SVGSVGElement>(null);
  const me = useRef<SVGGElement>(null);
  const target = useRef<SVGGElement>(null);
  const jobs = useGame((s) => s.jobs);
  const discovered = useGame((s) => s.world.discovered);

  const [minX, minZ, maxX, maxZ] = useMemo(() => {
    const xs = pack.buildings.flatMap((b) => [b.position[0] - b.size[2] / 2, b.position[0] + b.size[2] / 2]);
    const zs = pack.buildings.flatMap((b) => [b.position[1] - b.size[0] / 2, b.position[1] + b.size[0] / 2]);
    return [Math.min(...xs) - 2, Math.min(...zs) - 4, Math.max(...xs) + 2, Math.max(...zs) + 4];
  }, [pack]);

  const activeJob = jobs.active ? pack.jobs.find((j) => j.id === jobs.active!.jobId) : undefined;
  const job = activeJob ?? pack.jobs[0];
  const goalNpc = activeJob ? pack.npcs.find((n) => n.id === activeJob.dropoffNpcId) : pack.npcs.find((n) => n.id === job?.giverNpcId);

  useRaf(() => {
    const p = runtime.player;
    if (mode === 'follow' && svg.current) {
      const r = 22;
      svg.current.setAttribute('viewBox', `${p.x - r} ${p.z - r} ${r * 2} ${r * 2}`);
    }
    if (me.current) {
      const deg = ((Math.PI - p.yaw) * 180) / Math.PI;
      me.current.setAttribute('transform', `translate(${p.x} ${p.z}) rotate(${deg})`);
    }
    if (target.current) {
      const t = (performance.now() / 1000) % 1.4;
      target.current.style.opacity = String(0.55 + 0.45 * Math.cos(t * Math.PI * 1.4));
    }
  });

  const { halfWidth: hw, sidewalk: sw, length } = pack.road;
  const full = mode === 'full';
  const vb = full ? `${minX} ${minZ} ${maxX - minX} ${maxZ - minZ}` : '-22 -22 44 44';

  return (
    <svg ref={svg} viewBox={vb} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Map of ${pack.area}`}>
      <rect x={minX - 40} y={minZ - 40} width={maxX - minX + 80} height={maxZ - minZ + 80} fill="#2a231b" />
      {pack.walkable.map(([x0, z0, x1, z1], i) => (
        <rect key={i} x={x0} y={z0} width={x1 - x0} height={z1 - z0} fill="#5c4e3d" />
      ))}
      <rect x={-hw} y={-length / 2} width={hw * 2} height={length} fill="#3d3833" />
      <line x1={0} y1={-length / 2} x2={0} y2={length / 2} stroke="#e8d9b0" strokeWidth={0.18} strokeDasharray="1.6 1.6" opacity={0.6} />
      {pack.buildings.map((b) => (
        <rect
          key={b.id}
          x={b.position[0] - b.size[2] / 2}
          y={b.position[1] - b.size[0] / 2}
          width={b.size[2]}
          height={b.size[0]}
          fill={b.sign ? b.wall : '#7b6c5a'}
          opacity={b.sign ? 0.95 : 0.8}
          stroke="#15130f"
          strokeWidth={0.3}
        />
      ))}
      {full &&
        pack.buildings
          .filter((b) => b.sign)
          .map((b) => (
            <text
              key={b.id + 't'}
              x={b.position[0] + (b.facing === 'west' ? 1.2 : -1.2)}
              y={b.position[1] + 0.6}
              textAnchor="middle"
              fontSize={1.9}
              fontWeight={800}
              fill="#f6efe2"
              style={{ paintOrder: 'stroke' }}
              stroke="#15130f"
              strokeWidth={0.5}
            >
              {b.sign!.text}
            </text>
          ))}
      {pack.npcs.map((n) => {
        const conductor = Object.values(n.dialogue.nodes).some((node) => node.options.some((o) => o.action.kind === 'openTravel'));
        return <circle key={n.id} cx={n.position[0]} cy={n.position[1]} r={conductor ? (full ? 1.3 : 1.1) : full ? 0.9 : 0.7} fill={conductor ? '#3fc1c9' : '#f6efe2'} opacity={0.9} />;
      })}
      {full &&
        pack.landmarks
          .filter((l) => discovered.includes(l.id))
          .map((l) => (
            <rect key={l.id} x={l.position[0] - 0.9} y={l.position[1] - 0.9} width={1.8} height={1.8} transform={`rotate(45 ${l.position[0]} ${l.position[1]})`} fill="#6fc3d6" stroke="#15130f" strokeWidth={0.3} />
          ))}
      {goalNpc && (
        <g ref={target}>
          <circle cx={goalNpc.position[0]} cy={goalNpc.position[1]} r={full ? 2.6 : 2} fill="none" stroke="#f2b705" strokeWidth={0.5} />
          <circle cx={goalNpc.position[0]} cy={goalNpc.position[1]} r={0.9} fill="#f2b705" />
        </g>
      )}
      <g ref={me}>
        <circle r={full ? 1.6 : 1.3} fill="#15130f" opacity={0.6} />
        <path d={full ? 'M0 -2.4 L1.6 1.6 L0 0.7 L-1.6 1.6 Z' : 'M0 -1.9 L1.3 1.3 L0 0.55 L-1.3 1.3 Z'} fill="#f2b705" stroke="#15130f" strokeWidth={0.25} />
      </g>
      {full && (
        <text x={hw + sw + 1} y={maxZ - 1.5} fontSize={1.6} fill="#b3a891" fontWeight={650} letterSpacing={0.2}>
          N ↑
        </text>
      )}
    </svg>
  );
}
