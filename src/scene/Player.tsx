import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { readMove } from '../game/core/input';
import { runtime } from '../game/core/runtime';
import { resolveMove } from '../game/systems/collision';
import { useGame } from '../game/store/gameStore';
import { Character, type CharacterAnim } from './Character';
import { HEIGHT } from '../game/core/avatarPresets';
import { groundHeight, lerpAngle, useCollisionWorld, usePack } from './worldContext';

const WALK = 3.4;
const RUN = 6.4;

export function Player() {
  const profile = useGame((s) => s.profile);
  const pack = usePack();
  const world = useCollisionWorld();
  const group = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0 });
  const vel = useRef({ x: 0, z: 0, y: 0 });

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    // Allow long frames (slow phones) but integrate in small fixed steps so
    // speed stays correct and collision never tunnels through thin props.
    const d = Math.min(dt, 0.1);
    const steps = Math.max(1, Math.ceil(d / (1 / 30)));
    const h = d / steps;
    const p = runtime.player;
    const s = useGame.getState();

    const m = readMove();
    const cy = runtime.camera.yaw;
    const dx = Math.sin(cy) * m.y - Math.cos(cy) * m.x;
    const dz = Math.cos(cy) * m.y + Math.sin(cy) * m.x;
    const mag = Math.min(1, Math.hypot(dx, dz));
    const speed = mag * (m.sprint ? RUN : WALK);
    const tx = mag > 0.01 ? (dx / Math.hypot(dx, dz)) * speed : 0;
    const tz = mag > 0.01 ? (dz / Math.hypot(dx, dz)) * speed : 0;
    const accel = mag > 0.01 ? 11 : 14;

    let moved = 0;
    for (let i = 0; i < steps; i++) {
      vel.current.x += (tx - vel.current.x) * Math.min(1, h * accel);
      vel.current.z += (tz - vel.current.z) * Math.min(1, h * accel);
      const next = resolveMove(world, p.x, p.z, p.x + vel.current.x * h, p.z + vel.current.z * h);
      moved += Math.hypot(next.x - p.x, next.z - p.z);
      p.x = next.x;
      p.z = next.z;
    }
    p.speed = d > 0 ? moved / d : 0;
    p.moving = p.speed > 0.2;

    if (mag > 0.05) {
      p.yaw = lerpAngle(p.yaw, Math.atan2(dx, dz), Math.min(1, d * 12));
    } else if (s.ui === 'dialogue' && s.dialogue) {
      const npc = runtime.actors.get(s.dialogue.npcId);
      if (npc) p.yaw = lerpAngle(p.yaw, Math.atan2(npc.x - p.x, npc.z - p.z), Math.min(1, d * 8));
    }

    const gy = groundHeight(p.x, pack.road.halfWidth, pack.road.sidewalk);
    vel.current.y += (gy - vel.current.y) * Math.min(1, d * 18);
    g.position.set(p.x, vel.current.y, p.z);
    g.rotation.y = p.yaw;
    anim.current.speed = p.speed;
    anim.current.talking = s.ui === 'dialogue';
  });

  if (!profile) return null;
  const look = { ...profile.avatar, height: HEIGHT[profile.avatar.gender] };
  return (
    <group ref={group}>
      <Character look={look} anim={anim} />
      {/* soft contact shadow, useful when real shadows are off */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, 0]} renderOrder={1}>
        <circleGeometry args={[0.38, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}
