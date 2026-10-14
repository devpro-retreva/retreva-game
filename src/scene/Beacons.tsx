import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DestinationPack, NpcDef } from '../game/content/types';
import { isAvailable } from '../game/systems/jobs';
import { useGame } from '../game/store/gameStore';
import { beaconMaterial, ringMaterial, travelBeaconMaterial } from './materials';
import { usePack } from './worldContext';

/** NPCs whose dialogue can open travel (danfo conductors, keke riders). */
function conductors(pack: DestinationPack): NpcDef[] {
  return pack.npcs.filter((n) => Object.values(n.dialogue.nodes).some((node) => node.options.some((o) => o.action.kind === 'openTravel')));
}

/**
 * Floating markers, decided per frame from store snapshots (no React renders):
 *  - yellow diamond over anyone with work for you, or over the drop-off while a job is live
 *  - yellow ground ring at the drop-off
 *  - teal diamond over conductors who can take you to another area
 */
export function Beacons() {
  const pack = usePack();
  const travel = useMemo(() => conductors(pack), [pack]);
  const diamonds = useRef<(THREE.Mesh | null)[]>([]);
  const travelMarks = useRef<(THREE.Mesh | null)[]>([]);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const s = useGame.getState();
    const t = clock.elapsedTime;
    const reduced = s.settings.reducedMotion;
    const hidden = s.ui === 'dialogue' || s.ui === 'transit';
    const bob = reduced ? 0 : Math.sin(t * 2.4) * 0.08;
    const spin = reduced ? 0 : t * 1.6;
    const now = Date.now();
    let ringAt: [number, number] | null = null;

    pack.jobs.forEach((job, i) => {
      const m = diamonds.current[i];
      if (!m) return;
      let npcId: string | null = null;
      const a = s.jobs.active;
      if (a?.jobId === job.id) {
        const ready = job.kind !== 'collect' || (a.collected?.length ?? 0) >= (job.collect?.count ?? 0);
        if (ready) npcId = job.dropoffNpcId;
      } else if (!a && isAvailable(s.jobs, job, now)) {
        npcId = job.giverNpcId;
      }
      const npc = npcId ? pack.npcs.find((n) => n.id === npcId) : undefined;
      m.visible = !!npc && !hidden;
      if (npc) {
        m.position.set(npc.position[0], 2.35 + bob, npc.position[1]);
        m.rotation.y = spin;
        if (a?.jobId === job.id) ringAt = npc.position;
      }
    });

    travel.forEach((npc, i) => {
      const m = travelMarks.current[i];
      if (!m) return;
      m.visible = !hidden && !s.jobs.active;
      m.position.set(npc.position[0], 2.3 + bob * 0.6, npc.position[1]);
      m.rotation.y = -spin * 0.7;
    });

    if (ring.current) {
      ring.current.visible = !!ringAt && !hidden;
      if (ringAt) {
        const [x, z] = ringAt as [number, number];
        ring.current.position.set(x, 0.14, z);
        const k = reduced ? 1 : 1 + ((t * 0.8) % 1) * 0.6;
        ring.current.scale.setScalar(k);
        (ring.current.material as THREE.MeshBasicMaterial).opacity = reduced ? 0.45 : 0.6 * (1 - ((t * 0.8) % 1));
      }
    }
  });

  return (
    <>
      {pack.jobs.map((j, i) => (
        <mesh key={j.id} ref={(m) => (diamonds.current[i] = m)} material={beaconMaterial} visible={false} renderOrder={2}>
          <octahedronGeometry args={[0.2, 0]} />
        </mesh>
      ))}
      {travel.map((n, i) => (
        <mesh key={n.id} ref={(m) => (travelMarks.current[i] = m)} material={travelBeaconMaterial} visible={false} renderOrder={2}>
          <octahedronGeometry args={[0.16, 0]} />
        </mesh>
      ))}
      <mesh ref={ring} rotation-x={-Math.PI / 2} material={ringMaterial} visible={false} renderOrder={2}>
        <ringGeometry args={[1.2, 1.38, 40]} />
      </mesh>
    </>
  );
}
