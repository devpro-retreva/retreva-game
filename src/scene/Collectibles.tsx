import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../game/core/runtime';
import { PICKUP_RANGE } from '../game/systems/jobs';
import { useGame } from '../game/store/gameStore';
import { usePack } from './worldContext';

const bottleGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.32, 8);
const capGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 6);
const glowGeo = new THREE.RingGeometry(0.28, 0.42, 24);
const bottleMat = new THREE.MeshLambertMaterial({ color: '#9fd8e8', transparent: true, opacity: 0.85 });
const capMat = new THREE.MeshLambertMaterial({ color: '#2c5f9e' });
const glowMat = new THREE.MeshBasicMaterial({ color: '#f2b705', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });

/**
 * Litter for collect jobs: visible only while that job is live, picked up by
 * walking over it. Positions come from the job data.
 */
export function Collectibles() {
  const pack = usePack();
  const job = useMemo(() => pack.jobs.find((j) => j.kind === 'collect'), [pack]);
  const groups = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    if (!job?.collect) return;
    const s = useGame.getState();
    const a = s.jobs.active;
    const live = a?.jobId === job.id;
    const got = a?.collected ?? [];
    const full = got.length >= job.collect.count;
    const t = clock.elapsedTime;
    job.collect.spots.forEach(([x, z], i) => {
      const g = groups.current[i];
      if (!g) return;
      const show = live && !full && !got.includes(i);
      g.visible = show;
      if (!show) return;
      g.position.set(x, 0, z);
      g.rotation.y = t * 0.6 + i;
      const p = runtime.player;
      if (s.ui === 'play' && Math.hypot(p.x - x, p.z - z) < PICKUP_RANGE) s.collect(i);
    });
    glowMat.opacity = 0.35 + Math.sin(t * 4) * 0.25;
  });

  if (!job?.collect) return null;
  return (
    <>
      {job.collect.spots.map((_, i) => (
        <group key={i} ref={(g) => (groups.current[i] = g)} visible={false}>
          <mesh geometry={bottleGeo} material={bottleMat} position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0.4]} />
          <mesh geometry={capGeo} material={capMat} position={[0.06, 0.07, 0.17]} rotation={[Math.PI / 2, 0, 0.4]} />
          <mesh geometry={glowGeo} material={glowMat} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} />
        </group>
      ))}
    </>
  );
}
