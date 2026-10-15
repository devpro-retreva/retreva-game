import { useMemo } from 'react';
import * as THREE from 'three';
import { findVehicle } from '../game/content/vehicles';
import { useGame } from '../game/store/gameStore';
import { ColorGeometryBuilder } from './builders/geometryBuilder';
import { worldColorMaterial } from './materials';
import { usePack } from './worldContext';

const cache = new Map<string, THREE.BufferGeometry>();

/** A city bicycle (front faces +z): wheels, steel frame, saddle, bars, a front basket. One merged mesh. */
export function bicycleGeometry(color: string): THREE.BufferGeometry {
  const hit = cache.get(color);
  if (hit) return hit;
  const g = new ColorGeometryBuilder();
  const R = 0.34;
  for (const z of [-0.52, 0.52]) {
    g.cylinder('#1a1a1a', [0, R, z], R, R, 0.05, 18, [0, 0, Math.PI / 2]);
    g.cylinder('#c9c6bf', [0, R, z], R * 0.8, R * 0.8, 0.055, 14, [0, 0, Math.PI / 2]);
    g.cylinder('#2a2a2a', [0, R, z], R * 0.68, R * 0.68, 0.06, 14, [0, 0, Math.PI / 2]);
    g.cylinder('#9aa1a8', [0, R, z], 0.05, 0.05, 0.12, 8, [0, 0, Math.PI / 2]);
  }
  const tube = (a: [number, number, number], b: [number, number, number], t = 0.045) => {
    const len = Math.hypot(b[1] - a[1], b[2] - a[2]);
    const ang = Math.atan2(b[2] - a[2], b[1] - a[1]);
    g.boxR(color, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], [t, len, t], [ang, 0, 0]);
  };
  const bb: [number, number, number] = [0, 0.32, -0.02]; // bottom bracket
  const seat: [number, number, number] = [0, 0.86, -0.2];
  const head: [number, number, number] = [0, 0.86, 0.38];
  tube(bb, seat);
  tube(seat, head);
  tube(bb, head);
  tube([0, R, -0.52], bb, 0.035);
  tube([0, R, -0.52], seat, 0.035);
  tube([0, R, 0.52], head, 0.04);
  g.box('#1d1d1f', [0, 0.95, -0.22], [0.16, 0.06, 0.28]); // saddle
  g.box('#5c6670', [0, 0.9, -0.2], [0.03, 0.12, 0.03]);
  g.box('#5c6670', [0, 1.02, 0.4], [0.58, 0.035, 0.035]); // bars
  g.box('#1d1d1f', [0.27, 1.02, 0.4], [0.08, 0.045, 0.045]);
  g.box('#1d1d1f', [-0.27, 1.02, 0.4], [0.08, 0.045, 0.045]);
  g.box('#b98a4e', [0, 0.86, 0.62], [0.32, 0.2, 0.24]); // basket
  g.box('#c9c6bf', [0.18, 0.3, -0.02], [0.03, 0.03, 0.2]); // pedals
  g.box('#c9c6bf', [-0.18, 0.34, -0.02], [0.03, 0.03, 0.2]);
  const geo = g.build();
  cache.set(color, geo);
  return geo;
}

/** Vehicles you own that are parked in this area, drawn where you left them. */
export function ParkedVehicles() {
  const pack = usePack();
  const vehicles = useGame((s) => s.life.vehicles);
  const here = useMemo(() => vehicles.filter((v) => v.parked?.areaId === pack.id), [vehicles, pack.id]);
  return (
    <>
      {here.map((v) => (
        <group key={v.uid} position={[v.parked!.x, 0, v.parked!.z]} rotation-y={v.parked!.yaw}>
          {/* parked on its kickstand: a slight lean */}
          <mesh geometry={bicycleGeometry(findVehicle(v.vehicleId)?.color ?? '#1f6f4a')} material={worldColorMaterial} rotation-z={0.08} castShadow />
        </group>
      ))}
    </>
  );
}
