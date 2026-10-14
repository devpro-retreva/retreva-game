import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NpcDef, WalkerDef } from '../game/content/types';
import { runtime } from '../game/core/runtime';
import { useGame } from '../game/store/gameStore';
import { Character, type CharacterAnim } from './Character';
import { groundHeight, lerpAngle, usePack } from './worldContext';

function Npc({ def }: { def: NpcDef }) {
  const group = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0, idle: def.idle });
  const yaw = useRef(def.facing);
  const pack = usePack();
  const y = groundHeight(def.position[0], pack.road);

  useEffect(() => {
    runtime.actors.set(def.id, { x: def.position[0], z: def.position[1] });
    return () => void runtime.actors.delete(def.id);
  }, [def]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = runtime.player;
    const dx = p.x - def.position[0];
    const dz = p.z - def.position[1];
    const near = dx * dx + dz * dz < 16;
    const s = useGame.getState();
    const talking = s.ui === 'dialogue' && s.dialogue?.npcId === def.id;
    const want = near || talking ? Math.atan2(dx, dz) : def.facing;
    yaw.current = lerpAngle(yaw.current, want, Math.min(1, dt * (near ? 5 : 2)));
    g.rotation.y = yaw.current;
    anim.current.talking = talking;
  });

  return (
    <group ref={group} position={[def.position[0], y, def.position[1]]} rotation-y={def.facing}>
      <Character look={def.look} anim={anim} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]}>
        <circleGeometry args={[0.36, 14]} />
        <meshBasicMaterial color="#000" transparent opacity={0.2} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Walker({ def }: { def: WalkerDef }) {
  const group = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0 });
  const st = useRef({ x: def.path[0][0], z: def.path[0][1], i: 1, yaw: 0, wait: 0 });
  const pack = usePack();

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const s = st.current;
    const [tx, tz] = def.path[s.i];
    const dx = tx - s.x;
    const dz = tz - s.z;
    const dist = Math.hypot(dx, dz);
    const p = runtime.player;
    // pause politely if the player is directly in the way
    const ahead = Math.hypot(p.x - (s.x + (dx / (dist || 1)) * 0.9), p.z - (s.z + (dz / (dist || 1)) * 0.9)) < 0.85;
    let speed = 0;
    if (s.wait > 0) s.wait -= d;
    else if (!ahead) {
      if (dist < 0.1) {
        s.i = (s.i + 1) % def.path.length;
        s.wait = 0.6 + Math.random() * 1.6;
      } else {
        const step = Math.min(dist, def.speed * d);
        s.x += (dx / dist) * step;
        s.z += (dz / dist) * step;
        s.yaw = lerpAngle(s.yaw, Math.atan2(dx, dz), Math.min(1, d * 6));
        speed = def.speed;
      }
    }
    anim.current.speed = speed;
    runtime.actors.set(def.id, { x: s.x, z: s.z });
    g.position.set(s.x, groundHeight(s.x, pack.road), s.z);
    g.rotation.y = s.yaw;
  });

  return (
    <group ref={group}>
      <Character look={def.look} anim={anim} />
    </group>
  );
}

export function Npcs() {
  const pack = usePack();
  const npcs = useMemo(() => pack.npcs, [pack]);
  return (
    <>
      {npcs.map((n) => (
        <Npc key={n.id} def={n} />
      ))}
      {pack.walkers.map((w) => (
        <Walker key={w.id} def={w} />
      ))}
    </>
  );
}
