import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../game/core/runtime';
import { worldColorMaterial } from './materials';
import { vehicleGeometry } from './builders/worldBuilder';
import { usePack } from './worldContext';
import { useTier } from './useTier';

/** Shared geometry per vehicle kind/colour — every car of a type is the same mesh. */
const geoCache = new Map<string, THREE.BufferGeometry>();
const geoFor = (kind: 'danfo' | 'keke' | 'car', color?: string) => {
  const k = `${kind}:${color ?? ''}`;
  let g = geoCache.get(k);
  if (!g) geoCache.set(k, (g = vehicleGeometry(kind, color)));
  return g;
};

const LENGTH: Record<string, number> = { danfo: 5, keke: 2.2, car: 4.1 };

interface Car {
  lane: number;
  z: number;
  x: number;
  speed: number;
  cruise: number;
  len: number;
}

/**
 * Bounded traffic: vehicles follow lane paths along the main road, keep their distance,
 * stop for people in their lane, steer around parked vehicles, and wrap at the street ends.
 * Pure math per frame (no physics); count is capped by data and the graphics setting.
 */
export function Traffic() {
  const pack = usePack();
  const maxVehicles = useTier().maxVehicles;
  const def = useMemo(() => (pack.traffic ? { ...pack.traffic, vehicles: pack.traffic.vehicles.slice(0, maxVehicles) } : undefined), [pack, maxVehicles]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const half = pack.road.length / 2 + 6;

  // parked vehicles in the road are obstacles to steer around
  const parked = useMemo(
    () => pack.props.filter((p) => (p.kind === 'danfo' || p.kind === 'keke') && Math.abs(p.position[0]) < pack.road.halfWidth).map((p) => ({ x: p.position[0], z: p.position[1] })),
    [pack],
  );

  const cars = useRef<Car[]>([]);
  useEffect(() => {
    if (!def) return;
    const n = def.vehicles.length;
    cars.current = def.vehicles.map((v, i) => {
      const lane = i % def.lanes.length;
      const cruise = def.speed[0] + ((i * 0.37) % 1) * (def.speed[1] - def.speed[0]);
      return { lane, z: -half + ((i + 0.5) / n) * half * 2, x: def.lanes[lane].x, speed: cruise, cruise, len: LENGTH[v.kind] };
    });
    runtime.traffic = cars.current;
    return () => void (runtime.traffic = []);
  }, [def, half]);

  useFrame((_, dtRaw) => {
    if (!def) return;
    const dt = Math.min(dtRaw, 0.1);
    const p = runtime.player;
    const list = cars.current;
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const lane = def.lanes[c.lane];
      const dir = lane.dir;
      // steer around a parked vehicle sitting in this lane
      let targetX = lane.x;
      for (const o of parked) {
        if (Math.abs(o.x - lane.x) < 1.6 && Math.abs(o.z - c.z) < 7.5) targetX = lane.x - Math.sign(lane.x) * 1.9;
      }
      c.x += (targetX - c.x) * Math.min(1, dt * 2.2);
      // gap to whatever is ahead in the lane: other vehicles, or the player standing in the road
      let gap = Infinity;
      for (let j = 0; j < list.length; j++) {
        if (j === i || list[j].lane !== c.lane) continue;
        const d = (list[j].z - c.z) * dir;
        if (d > 0) gap = Math.min(gap, d - (list[j].len + c.len) / 2);
      }
      const ahead = (p.z - c.z) * dir;
      if (ahead > 0 && Math.abs(p.x - c.x) < 1.5) gap = Math.min(gap, ahead - c.len / 2 - 0.4);
      // ease off inside 6 m but keep rolling (≥ 25% cruise) until the stop point, then stop — no endless creep
      const want = gap < 1.2 ? 0 : gap < 6 ? c.cruise * Math.max(0.25, (gap - 1.2) / 4.8) : c.cruise;
      c.speed += (want - c.speed) * Math.min(1, dt * (want < c.speed ? 5 : 1.2));
      c.z += c.speed * dir * dt;
      if (c.z * dir > half) c.z = -half * dir; // drive off one end, reappear at the other
      const m = meshes.current[i];
      if (m) {
        m.position.set(c.x, 0, c.z);
        m.rotation.y = dir > 0 ? 0 : Math.PI;
      }
    }
  });

  if (!def) return null;
  return (
    <>
      {def.vehicles.map((v, i) => (
        <mesh key={i} ref={(m) => void (meshes.current[i] = m)} geometry={geoFor(v.kind, v.color)} material={worldColorMaterial} castShadow />
      ))}
    </>
  );
}
