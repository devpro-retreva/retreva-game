import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { activeRide, rideMs, useGame } from '../game/store/gameStore';
import { rideAt, ridePose3, sightingsBetween } from '../game/systems/drive';
import { cableCabinGeometry, safariTruckGeometry } from './builders/worldBuilder';
import { worldColorMaterial } from './materials';

/**
 * A ride along a track — the game drive's open truck, or a cable car's cabin. It runs on the wall clock (the player
 * rides along: Player.tsx reads the same pose), and every sighting passed is reported once. A ride waiting for its
 * world (a cable car going down) starts its clock on the first frame drawn.
 */
export function DriveRide() {
  const drive = useGame((s) => s.drive);
  const phase = useGame((s) => s.phase);
  const ride = useGame((s) => activeRide(s));
  const geo = useMemo(() => (ride?.vehicle === 'cable-car' ? cableCabinGeometry() : safariTruckGeometry()), [ride?.vehicle]);
  useEffect(() => () => geo.dispose(), [geo]);
  const mesh = useRef<THREE.Mesh>(null);
  const last = useRef({ startedAt: -1, s: 0 });

  useFrame(() => {
    const d = useGame.getState().drive;
    const m = mesh.current;
    if (!d || !ride || !m) return;
    if (!d.startedAt) {
      if (phase === 'playing') useGame.getState().startRideClock();
      return;
    }
    const reverse = !!d.cable?.down;
    if (last.current.startedAt !== d.startedAt) last.current = { startedAt: d.startedAt, s: rideAt(ride, 0, reverse) };
    const ms = rideMs(d);
    const pose = ridePose3(ride, ms, reverse);
    m.position.set(pose.x, pose.y, pose.z);
    m.rotation.y = pose.yaw;
    const s1 = rideAt(ride, ms, reverse);
    if (s1 !== last.current.s) {
      for (const id of sightingsBetween(ride, Math.min(last.current.s, s1), Math.max(last.current.s, s1), d.spotted)) useGame.getState().spotOnDrive(id);
      last.current.s = s1;
    }
  });

  if (!drive || !ride) return null;
  return <mesh ref={mesh} geometry={geo} material={worldColorMaterial} />;
}
