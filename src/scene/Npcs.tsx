import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { NpcDef, WalkerDef } from '../game/content/types';
import { runtime } from '../game/core/runtime';
import { npcPresent, useGame } from '../game/store/gameStore';
import { phaseOf } from '../game/systems/clock';
import { Character, type CharacterAnim, type Lod } from './Character';

/** Switch to the low-detail body past ~18 m, back to full detail inside ~15 m (hysteresis avoids flicker). */
function useLod(pos: () => { x: number; z: number }): Lod {
  const far = useTier().lodFar;
  const [lod, setLod] = useState<Lod>('near');
  const acc = useRef(Math.random() * 0.5);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.5) return;
    acc.current = 0;
    const p = pos();
    const d = Math.hypot(p.x - runtime.player.x, p.z - runtime.player.z);
    if (lod === 'near' && d > far) setLod('far');
    else if (lod === 'far' && d < far - 3) setLod('near');
  });
  return lod;
}
import { groundHeight, lerpAngle, useCollisionWorld, usePack } from './worldContext';
import { resolveMove } from '../game/systems/collision';
import { useTier } from './useTier';

function Npc({ def }: { def: NpcDef }) {
  const group = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0, idle: def.idle });
  const yaw = useRef(def.facing);
  const pack = usePack();
  const y = groundHeight(def.position[0], pack.road);
  const lod = useLod(() => ({ x: def.position[0], z: def.position[1] }));

  const world0 = useCollisionWorld();
  // when following you, ignore the person's own spot in the collision world
  const world = useMemo(() => ({ ...world0, circles: world0.circles.filter((c) => !(c.x === def.position[0] && c.z === def.position[1])) }), [world0, def]);
  const pos = useRef({ x: def.position[0], z: def.position[1], following: false, waited: false });
  useEffect(() => {
    runtime.actors.set(def.id, { x: def.position[0], z: def.position[1] });
    return () => void runtime.actors.delete(def.id);
  }, [def]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const p = runtime.player;
    const s0 = useGame.getState();
    const st = pos.current;
    // a guest on a tour follows you on foot (walking pace); otherwise people stay at their spot
    const a = s0.jobs.active;
    const job = a ? pack.jobs.find((j) => j.id === a.jobId) : undefined;
    const onTour = job?.kind === 'tour' && job.giverNpcId === def.id;
    // while you talk, a guest stands still (and stays where they are — the tour isn't over)
    const guiding = onTour && s0.ui !== 'dialogue';
    if (guiding) {
      const d = Math.min(dt, 0.1);
      const fx = p.x - st.x;
      const fz = p.z - st.z;
      const dist = Math.hypot(fx, fz);
      if (dist > 9) {
        // too far ahead: they stop and call out (once per separation)
        anim.current.speed = 0;
        anim.current.idle = 'wave';
        if (!st.waited) {
          st.waited = true;
          s0.pushToast({ kind: 'warn', title: `${def.name}: “Wait for me!”`, detail: 'Walk back — your guest can’t keep up when you run.' });
        }
      } else if (dist > 1.8) {
        st.waited = false;
        const step = Math.min(dist - 1.6, 3.1 * d);
        const next = resolveMove(world, st.x, st.z, st.x + (fx / dist) * step, st.z + (fz / dist) * step);
        st.x = next.x;
        st.z = next.z;
        anim.current.speed = step / d;
        anim.current.idle = def.idle;
      } else anim.current.speed = 0;
      st.following = true;
    } else if (st.following && !onTour) {
      // tour over: back to their spot
      st.following = false;
      st.x = def.position[0];
      st.z = def.position[1];
      anim.current.speed = 0;
      anim.current.idle = def.idle;
    }
    runtime.actors.set(def.id, { x: st.x, z: st.z });
    g.position.set(st.x, groundHeight(st.x, pack.road), st.z);
    const dx = p.x - st.x;
    const dz = p.z - st.z;
    const near = dx * dx + dz * dz < 16 || guiding;
    const s = s0;
    const talking = s.ui === 'dialogue' && s.dialogue?.npcId === def.id;
    const want = near || talking ? Math.atan2(dx, dz) : def.facing;
    yaw.current = lerpAngle(yaw.current, want, Math.min(1, dt * (near ? 5 : 2)));
    g.rotation.y = yaw.current;
    anim.current.talking = talking;
  });

  return (
    <group ref={group} position={[def.position[0], y, def.position[1]]} rotation-y={def.facing}>
      <Character look={def.look} anim={anim} lod={lod} />
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
  const st = useRef<{ x: number; z: number; i: number; yaw: number; wait: number; face: number | null }>({ x: def.path[0][0], z: def.path[0][1], i: 1, yaw: 0, wait: 0, face: null });
  const pack = usePack();
  const lod = useLod(() => st.current);
  useEffect(() => () => void runtime.actors.delete(def.id), [def.id]);

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
    if (s.wait > 0) {
      s.wait -= d;
      if (s.face !== null) s.yaw = lerpAngle(s.yaw, s.face, Math.min(1, d * 4));
      if (s.wait <= 0) {
        runtime.activity.set(def.id, null);
        s.face = null;
        anim.current.idle = undefined;
        anim.current.talking = false;
      }
    } else if (!ahead) {
      if (dist < 0.1) {
        // purposeful stop at this point: shop, wait for the bus, eat, chat, take a photo
        const stop = def.stops?.find((x) => x.at === s.i);
        if (stop) {
          s.wait = stop.seconds * (0.8 + Math.random() * 0.4);
          s.face = stop.face;
          anim.current.idle = stop.activity === 'shop' || stop.activity === 'eat' ? 'busy' : stop.activity === 'photo' ? 'wave' : 'sway';
          anim.current.talking = stop.activity === 'chat';
          runtime.activity.set(def.id, stop.activity);
        } else s.wait = 0.6 + Math.random() * 1.6;
        s.i = (s.i + 1) % def.path.length;
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
      <Character look={def.look} anim={anim} lod={lod} />
    </group>
  );
}

export function Npcs() {
  const pack = usePack();
  // who is around right now: people with opening hours go home outside them (see npcPresent)
  // someone already out who you're standing with (or talking to) finishes up instead of vanishing in front
  // of you — they go once you step away
  const shown = useRef(new Set<string>());
  const presentKey = useGame((s) =>
    pack.npcs
      .filter((n) => {
        if (npcPresent(n, s, pack)) return true;
        if (!shown.current.has(n.id)) return false;
        if (s.dialogue?.npcId === n.id) return true;
        const a = runtime.actors.get(n.id);
        return !!a && Math.hypot(a.x - runtime.player.x, a.z - runtime.player.z) < 4;
      })
      .map((n) => n.id)
      .join(','),
  );
  useEffect(() => {
    shown.current = new Set(presentKey.split(',').filter(Boolean));
  }, [presentKey]);
  const npcs = useMemo(() => pack.npcs.filter((n) => presentKey.split(',').includes(n.id)), [pack, presentKey]);
  const night = useGame((s) => phaseOf(s.world.time ?? 480) === 'night');
  const maxWalkers = useTier().maxWalkers;
  // purposeful walkers first, so a low tier keeps the most lively people; fewer people out after dark
  const walkers = useMemo(
    () => [...pack.walkers].sort((a, b) => (b.stops?.length ?? 0) - (a.stops?.length ?? 0)).slice(0, night ? Math.min(maxWalkers, pack.nightWalkers ?? 2) : maxWalkers),
    [pack, maxWalkers, night],
  );
  return (
    <>
      {npcs.map((n) => (
        <Npc key={n.id} def={n} />
      ))}
      {walkers.map((w) => (
        <Walker key={w.id} def={w} />
      ))}
    </>
  );
}
