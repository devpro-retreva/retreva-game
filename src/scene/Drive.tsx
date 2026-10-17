import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { findEvent } from '../game/content';
import { useGame } from '../game/store/gameStore';
import { rideDistance, ridePose, sightingsBetween } from '../game/systems/drive';
import { safariTruckGeometry } from './builders/worldBuilder';
import { worldColorMaterial } from './materials';

/**
 * The game drive: while one is on, the truck runs along its track on the wall clock (the player rides in the back —
 * Player.tsx reads the same pose), and every sighting it passes is reported once.
 */
export function DriveRide() {
  const drive = useGame((s) => s.drive);
  const ride = drive ? findEvent(drive.eventId)?.ride : undefined;
  const geo = useMemo(() => safariTruckGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const mesh = useRef<THREE.Mesh>(null);
  const last = useRef({ startedAt: 0, s: 0 });

  useFrame(() => {
    const d = useGame.getState().drive;
    const m = mesh.current;
    if (!d || !ride || !m) return;
    if (last.current.startedAt !== d.startedAt) last.current = { startedAt: d.startedAt, s: 0 };
    const ms = Date.now() - d.startedAt;
    const pose = ridePose(ride, ms);
    m.position.set(pose.x, 0, pose.z);
    m.rotation.y = pose.yaw;
    const s1 = rideDistance(ride, ms);
    if (s1 > last.current.s) {
      for (const id of sightingsBetween(ride, last.current.s, s1, d.spotted)) useGame.getState().spotOnDrive(id);
      last.current.s = s1;
    }
  });

  if (!ride) return null;
  return <mesh ref={mesh} geometry={geo} material={worldColorMaterial} />;
}
