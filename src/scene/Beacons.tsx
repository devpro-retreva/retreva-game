import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { findNpc } from '../game/content';
import { isAvailable } from '../game/systems/jobs';
import { useGame } from '../game/store/gameStore';
import { beaconMaterial, ringMaterial } from './materials';
import { usePack } from './worldContext';

/**
 * Floating job markers: a diamond over whoever has work for you,
 * and a diamond + ground ring over the delivery target while a job is live.
 * Visibility is decided per frame from store snapshots — no React re-renders.
 */
export function Beacons() {
  const pack = usePack();
  const diamond = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const s = useGame.getState();
    const t = clock.elapsedTime;
    const job = pack.jobs[0];
    let npcId: string | null = null;
    let active = false;
    if (job) {
      if (s.jobs.active?.jobId === job.id) {
        npcId = job.dropoffNpcId;
        active = true;
      } else if (isAvailable(s.jobs, job, Date.now())) {
        npcId = job.giverNpcId;
      }
    }
    const npc = npcId ? findNpc(pack, npcId) : undefined;
    const show = !!npc && s.ui !== 'dialogue';
    const reduced = s.settings.reducedMotion;
    if (diamond.current) {
      diamond.current.visible = show;
      if (npc) {
        diamond.current.position.set(npc.position[0], 2.35 + (reduced ? 0 : Math.sin(t * 2.4) * 0.08), npc.position[1]);
        diamond.current.rotation.y = reduced ? 0 : t * 1.6;
      }
    }
    if (ring.current) {
      ring.current.visible = show && active;
      if (npc) {
        ring.current.position.set(npc.position[0], 0.14, npc.position[1]);
        const k = reduced ? 1 : 1 + ((t * 0.8) % 1) * 0.6;
        ring.current.scale.setScalar(k);
        (ring.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0.45 : 0.6 * (1 - ((t * 0.8) % 1));
      }
    }
  });

  return (
    <>
      <mesh ref={diamond} material={beaconMaterial} visible={false} renderOrder={2}>
        <octahedronGeometry args={[0.2, 0]} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} material={ringMaterial} visible={false} renderOrder={2}>
        <ringGeometry args={[1.2, 1.38, 40]} />
      </mesh>
    </>
  );
}
