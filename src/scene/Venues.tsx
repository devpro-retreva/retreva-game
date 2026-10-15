import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EventDef } from '../game/content/types';
import { useGame } from '../game/store/gameStore';
import { onNow } from '../game/systems/events';
import { Character, type CharacterAnim } from './Character';
import { usePack } from './worldContext';

/**
 * Show venues: a gate post at every event's spot (it lights up while the show is on), and for outdoor
 * shows a stage with a truss, speakers and string lights — with a band and a small crowd while it's on.
 */
export function Venues() {
  const pack = usePack();
  const events = pack.events ?? [];
  const [live, setLive] = useState<Record<string, boolean>>({});
  const acc = useRef(0);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 1) return;
    acc.current = 0;
    const t = useGame.getState().world.time ?? 480;
    const next: Record<string, boolean> = {};
    let changed = false;
    for (const ev of events) {
      next[ev.id] = onNow(ev, t) !== null;
      if (next[ev.id] !== !!live[ev.id]) changed = true;
    }
    if (changed) setLive(next);
  });
  if (!events.length) return null;
  return (
    <group>
      {events.map((ev) => {
        const gate = pack.spots?.find((s) => s.kind === 'event' && s.eventId === ev.id);
        return (
          <group key={ev.id}>
            {gate && <GatePost x={gate.position[0]} z={gate.position[1]} on={!!live[ev.id]} />}
            {ev.stage && <Stage ev={ev} on={!!live[ev.id]} />}
          </group>
        );
      })}
    </group>
  );
}

function GatePost({ x, z, on }: { x: number; z: number; on: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.8, 6]} />
        <meshLambertMaterial color="#2b2118" />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.05]} />
        <meshBasicMaterial color={on ? '#f2b705' : '#6b5a3a'} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.75, 0.03]}>
        <planeGeometry args={[0.46, 0.18]} />
        <meshBasicMaterial color={on ? '#15130f' : '#3a3226'} />
      </mesh>
    </group>
  );
}

const CROWD: { dx: number; dz: number; look: { gender: 'male' | 'female'; skin: string; top: string; bottom: string } }[] = [
  { dx: 3.4, dz: -2.2, look: { gender: 'female', skin: '#6b3f25', top: '#2c7fb8', bottom: '#1d1d1f' } },
  { dx: 3.0, dz: 1.6, look: { gender: 'male', skin: '#4a2c1a', top: '#e4572e', bottom: '#2c3e50' } },
  { dx: 4.6, dz: -1.4, look: { gender: 'female', skin: '#8a5636', top: '#f4f0e6', bottom: '#7a3b72' } },
  { dx: 4.4, dz: 2.4, look: { gender: 'male', skin: '#5a3420', top: '#1f6f4a', bottom: '#d9d2c3' } },
];

function Stage({ ev, on }: { ev: EventDef; on: boolean }) {
  const st = ev.stage!;
  const [sx, sz] = st.size;
  const bulbs = useMemo(() => Array.from({ length: 9 }, (_, i) => -sz / 2 + (i * sz) / 8), [sz]);
  const lights = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (lights.current) lights.current.color.setHSL(on ? (clock.elapsedTime * 0.08) % 1 : 0.12, on ? 0.9 : 0.2, on ? 0.6 : 0.35);
  });
  // the stage faces +x (toward the sea at Lekki); the truss stands at its back edge
  const back = -sx / 2 + 0.15;
  return (
    <group position={[st.position[0], 0, st.position[1]]}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[sx, 0.8, sz]} />
        <meshLambertMaterial color={st.color} />
      </mesh>
      <mesh position={[sx / 2 - 0.05, 0.4, 0]}>
        <boxGeometry args={[0.1, 0.8, sz]} />
        <meshLambertMaterial color={st.accent} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[back, 2.2, (s * sz) / 2]}>
          <boxGeometry args={[0.15, 2.8, 0.15]} />
          <meshLambertMaterial color="#9aa0a6" />
        </mesh>
      ))}
      <mesh position={[back, 3.55, 0]}>
        <boxGeometry args={[0.18, 0.18, sz + 0.15]} />
        <meshLambertMaterial color="#9aa0a6" />
      </mesh>
      {/* backdrop */}
      <mesh position={[back - 0.05, 2.0, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[sz - 0.2, 2.4]} />
        <meshLambertMaterial color={st.accent} side={THREE.DoubleSide} />
      </mesh>
      {/* string lights on the truss */}
      {bulbs.map((z) => (
        <mesh key={z} position={[back + 0.12, 3.4, z]}>
          <sphereGeometry args={[0.07, 6, 5]} />
          <meshBasicMaterial ref={z === bulbs[0] ? lights : undefined} color="#f2b705" toneMapped={false} />
        </mesh>
      ))}
      {/* speakers */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[sx / 2 - 0.4, 1.35, (s * (sz / 2 - 0.35))]}>
          <boxGeometry args={[0.5, 1.1, 0.5]} />
          <meshLambertMaterial color="#15130f" />
        </mesh>
      ))}
      {on && <pointLight position={[sx / 2 + 1, 3, 0]} color="#ffd29a" intensity={3} distance={12} decay={1.4} />}
      {on &&
        (ev.performers ?? []).map((look, i) => (
          <Performer key={i} x={-0.3 + (i % 2) * 0.5} z={-sz / 3 + (i * (sz * 0.66)) / Math.max(1, (ev.performers?.length ?? 1) - 1)} look={look} />
        ))}
      {on && CROWD.map((c, i) => <Performer key={`c${i}`} x={sx / 2 + c.dx - 1} z={c.dz} y={-0.8} look={c.look} facing={-Math.PI / 2} />)}
    </group>
  );
}

function Performer({ x, z, y = 0, look, facing = Math.PI / 2 }: { x: number; z: number; y?: number; look: { gender: 'male' | 'female'; skin: string; top: string; bottom: string }; facing?: number }) {
  const anim = useRef<CharacterAnim>({ speed: 0, idle: 'busy' });
  return (
    <group position={[x, 0.8 + y, z]} rotation-y={facing}>
      <Character look={look} anim={anim} castShadow={false} lod="far" />
    </group>
  );
}
