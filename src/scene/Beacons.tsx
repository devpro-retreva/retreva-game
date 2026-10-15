import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DestinationPack, NpcDef } from '../game/content/types';
import { isAvailable } from '../game/systems/jobs';
import { npcPresent, requirementContext, useGame } from '../game/store/gameStore';
import { meets } from '../game/systems/requirements';
import { runtime } from '../game/core/runtime';
import { beaconMaterial, ringMaterial, travelBeaconMaterial } from './materials';
import { usePack } from './worldContext';

/** The airport desk for each ticket stage: check-in, then security, then the gate. */
const STEP_ACTION = { booked: 'checkIn', 'checked-in': 'security', cleared: 'board' } as const;
function airportDesk(pack: DestinationPack, action: string): NpcDef | undefined {
  return pack.npcs.find((n) => Object.values(n.dialogue.nodes).some((node) => node.options.some((o) => o.action.kind === action)));
}

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
  const stepMark = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const s = useGame.getState();
    const t = clock.elapsedTime;
    const reduced = s.settings.reducedMotion;
    const hidden = s.ui === 'dialogue' || s.ui === 'transit' || s.ui === 'flight';
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
        if (job.kind === 'tour' && job.tour) {
          const i = a.collected?.length ?? 0;
          const lm = i < job.tour.stops.length ? pack.landmarks.find((l) => l.id === job.tour!.stops[i]) : undefined;
          if (lm) ringAt = lm.position; // the ring marks the next stop
          else npcId = job.dropoffNpcId;
        } else {
          const ready = job.kind !== 'collect' || (a.collected?.length ?? 0) >= (job.collect?.count ?? 0);
          if (ready) npcId = job.dropoffNpcId;
        }
      } else if (!a && isAvailable(s.jobs, job, now) && meets(job.requires, requirementContext(s)).ok) {
        npcId = job.giverNpcId;
      }
      const found = npcId ? pack.npcs.find((n) => n.id === npcId) : undefined;
      const npc = found && npcPresent(found, s, pack) ? found : undefined;
      m.visible = !!npc && !hidden;
      if (npc) {
        // people can move (a tour guest follows you), so use their live position
        const live = runtime.actors.get(npc.id) ?? { x: npc.position[0], z: npc.position[1] };
        m.position.set(live.x, 2.35 + bob, live.z);
        m.rotation.y = spin;
        if (a?.jobId === job.id) ringAt = [live.x, live.z];
      }
    });

    travel.forEach((npc, i) => {
      const m = travelMarks.current[i];
      if (!m) return;
      m.visible = !hidden && !s.jobs.active && npcPresent(npc, s, pack);
      m.position.set(npc.position[0], 2.3 + bob * 0.6, npc.position[1]);
      m.rotation.y = -spin * 0.7;
    });

    // next airport step: a yellow diamond over the desk you need now
    if (stepMark.current) {
      const t0 = s.travel.ticket;
      const desk = t0 && !s.jobs.active ? airportDesk(pack, STEP_ACTION[t0.stage]) : undefined;
      stepMark.current.visible = !!desk && !hidden;
      if (desk) {
        stepMark.current.position.set(desk.position[0], 2.35 + bob, desk.position[1]);
        stepMark.current.rotation.y = spin;
      }
    }

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
      <mesh ref={stepMark} material={beaconMaterial} visible={false} renderOrder={2}>
        <octahedronGeometry args={[0.2, 0]} />
      </mesh>
      <mesh ref={ring} rotation-x={-Math.PI / 2} material={ringMaterial} visible={false} renderOrder={2}>
        <ringGeometry args={[1.2, 1.38, 40]} />
      </mesh>
    </>
  );
}
