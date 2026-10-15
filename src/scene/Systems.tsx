import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { runtime } from '../game/core/runtime';
import { useGame } from '../game/store/gameStore';
import { saves } from '../game/persistence/instance';
import { usePack } from './worldContext';
import { findVehicle } from '../game/content/vehicles';
import { findFurniture, findInterior, type InteriorDef } from '../game/content/interiors';
import { interiorPieces } from '../game/systems/collision';
import type { Nearby } from '../game/store/gameStore';

const INTERACT_RANGE = 2.5;

const USE_VERB = { sleep: ['Sleep', 'in your bed'], storage: ['Open', 'the storage chest'], dine: ['Sit at', 'a table'] } as const;

/** Inside a room: the door, the things you can use (bed, chest, tables) and — at home — the furniture spots. */
export function nearestInRoom(def: InteriorDef, placed: Record<string, string>, x: number, z: number): Nearby | null {
  const [, d] = def.size;
  const cands: { n: Nearby; dist: number }[] = [];
  const door = Math.hypot(x - def.entry.position[0], z - d / 2);
  if (door < 1.5) cands.push({ n: { id: 'exit', kind: 'interior', label: def.kind === 'home' ? 'outside' : 'back to the street', verb: 'Go' }, dist: door - 0.4 });
  for (const pc of interiorPieces(def, placed)) {
    const fx = pc.fixedIndex !== undefined ? def.fixed[pc.fixedIndex] : undefined;
    // a bed you placed is slept in like the mattress it replaced
    const use = fx?.use ?? (pc.slotId === 'bed' ? 'sleep' : undefined);
    if (!use) continue;
    const f = findFurniture(pc.itemId);
    const reach = Math.max(f?.half[0] ?? 0.5, f?.half[1] ?? 0.5) + 0.9;
    const dist = Math.hypot(x - pc.position[0], z - pc.position[1]);
    const idx = fx ? pc.fixedIndex! : def.fixed.findIndex((q) => q.use === 'sleep');
    if (dist < reach) cands.push({ n: { id: `use:${idx}`, kind: 'interior', label: USE_VERB[use][1], verb: USE_VERB[use][0] }, dist: dist - reach + 1 });
  }
  if (def.kind === 'home') {
    for (const sl of def.slots) {
      const dist = Math.hypot(x - sl.position[0], z - sl.position[1]);
      if (dist < 1.3) cands.push({ n: { id: `slot:${sl.id}`, kind: 'interior', label: sl.label.toLowerCase(), verb: placed[sl.id] ? 'Change' : 'Furnish' }, dist: dist + 0.3 });
    }
  }
  cands.sort((a, b) => a.dist - b.dist);
  return cands[0]?.n ?? null;
}

/** Finds the nearest interactable each ~120ms and publishes it only on change. */
export function InteractionSystem() {
  const pack = usePack();
  const acc = useRef(0);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.12) return;
    acc.current = 0;
    const s = useGame.getState();
    if (s.ui !== 'play') return;
    const p = runtime.player;
    if (s.world.inside) {
      const def = findInterior(s.world.inside.interiorId);
      if (def) s.setNearby(nearestInRoom(def, s.life.property[def.id]?.placed ?? {}, p.x, p.z));
      return;
    }
    let best: { id: string; d: number } | null = null;
    for (const n of pack.npcs) {
      const a = runtime.actors.get(n.id);
      if (!a) continue;
      const d = Math.hypot(a.x - p.x, a.z - p.z);
      if (d < INTERACT_RANGE && (!best || d < best.d)) best = { id: n.id, d };
    }
    const npc = best && pack.npcs.find((n) => n.id === best!.id);
    let spotHit: { id: string; d: number } | null = null;
    for (const sp of pack.spots ?? []) {
      const d = Math.hypot(sp.position[0] - p.x, sp.position[1] - p.z);
      if (d < 1.8 && (!spotHit || d < spotHit.d)) spotHit = { id: sp.id, d };
    }
    // your parked vehicles here (get on), or — while riding with nothing else in reach — get off
    let vehHit: { id: string; d: number } | null = null;
    if (!s.life.riding) {
      for (const v of s.life.vehicles) {
        if (v.parked?.areaId !== pack.id) continue;
        const d = Math.hypot(v.parked.x - p.x, v.parked.z - p.z);
        if (d < 1.9 && (!vehHit || d < vehHit.d)) vehHit = { id: v.uid, d };
      }
    }
    if (vehHit && (!best || vehHit.d < best.d) && (!spotHit || vehHit.d < spotHit.d)) {
      const v = s.life.vehicles.find((x) => x.uid === vehHit!.id)!;
      s.setNearby({ id: v.uid, kind: 'vehicle', label: `your ${findVehicle(v.vehicleId)?.name.toLowerCase() ?? 'vehicle'}`, verb: 'Ride' });
    } else if (s.life.riding && !best && !spotHit) {
      s.setNearby({ id: 'dismount', kind: 'dismount', label: 'and park here', verb: 'Get off' });
    } else if (spotHit && (!best || spotHit.d < best.d)) {
      const sp = pack.spots!.find((x) => x.id === spotHit!.id)!;
      const mine = sp.kind === 'home' && !!sp.homeId && s.life.homes.includes(sp.homeId);
      s.setNearby({ id: sp.id, kind: 'spot', label: mine ? 'your room' : sp.label, verb: mine ? 'Go into' : sp.verb });
    } else s.setNearby(npc ? { id: npc.id, kind: 'npc', label: npc.name, verb: npc.promptVerb } : null);
    // landmarks discover themselves when you walk close
    for (const lm of pack.landmarks) {
      if (s.world.discovered.includes(lm.id)) continue;
      if (Math.hypot(lm.position[0] - p.x, lm.position[1] - p.z) < lm.radius) s.discover(lm.id);
    }
  });
  return null;
}

/** Game clock (job timers, play time), periodic autosave and perf sampling. */
export function GameLoop() {
  const gl = useThree((s) => s.gl);
  const acc = useRef({ tick: 0, save: 0, perf: 0, frames: 0, lastX: 0, lastZ: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    const d = Math.min(dt, 0.1);
    a.tick += d;
    a.save += d;
    a.perf += dt;
    a.frames++;
    if (a.tick >= 0.1) {
      useGame.getState().tick(a.tick * 1000);
      a.tick = 0;
    }
    if (a.save >= 4) {
      a.save = 0;
      const p = runtime.player;
      if (Math.hypot(p.x - a.lastX, p.z - a.lastZ) > 0.5 || useGame.getState().jobs.active) {
        a.lastX = p.x;
        a.lastZ = p.z;
        saves.schedule(0);
      }
    }
    if (a.perf >= 0.5) {
      runtime.perf.fps = Math.round(a.frames / a.perf);
      runtime.perf.drawCalls = gl.info.render.calls;
      runtime.perf.triangles = gl.info.render.triangles;
      runtime.perf.frameMs = Math.round((a.perf / a.frames) * 10000) / 10;
      runtime.perf.dpr = gl.getPixelRatio();
      a.perf = 0;
      a.frames = 0;
    }
  });
  return null;
}

/** Flips the game to "playing" once the world has actually rendered a few frames. */
export function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    // count frames rendered while loading, so it also works when the same area reloads (e.g. importing a save)
    if (useGame.getState().phase !== 'loading') {
      frames.current = 0;
      return;
    }
    if (++frames.current >= 3) useGame.getState().setPhase('playing');
  });
  return null;
}
