import { useMemo } from 'react';
import { getDestination, type DestinationPack } from '../game/content';
import { buildCollisionWorld, buildInteriorWorld, type CollisionWorld } from '../game/systems/collision';
import { findInterior } from '../game/content/interiors';
import { useGame } from '../game/store/gameStore';

const worlds = new Map<string, CollisionWorld>();

export function getCollisionWorld(destinationId: string): CollisionWorld {
  let w = worlds.get(destinationId);
  if (!w) {
    w = buildCollisionWorld(getDestination(destinationId));
    worlds.set(destinationId, w);
  }
  return w;
}

export function usePack() {
  const id = useGame((s) => s.destinationId);
  return useMemo(() => getDestination(id), [id]);
}

/** The street's collision, or — when you are inside a room — that room's (rebuilt when furniture moves). */
export function useCollisionWorld() {
  const id = useGame((s) => s.destinationId);
  const roomKey = useGame((s) => (s.world.inside ? `${s.world.inside.interiorId}|${JSON.stringify(s.life.property[s.world.inside.interiorId]?.placed ?? {})}` : ''));
  return useMemo(() => {
    if (!roomKey) return getCollisionWorld(id);
    const [roomId, placed] = roomKey.split('|');
    const def = findInterior(roomId);
    return def ? buildInteriorWorld(def, JSON.parse(placed)) : getCollisionWorld(id);
  }, [id, roomKey]);
}

/** The room you're in, if any. */
export function useInterior() {
  const roomId = useGame((s) => s.world.inside?.interiorId ?? null);
  return useMemo(() => (roomId ? findInterior(roomId) ?? null : null), [roomId]);
}

/** Sidewalks are raised slightly; the player steps up onto them. Beaches are flat. */
export function groundHeight(x: number, road: DestinationPack['road']): number {
  if (road.style === 'sand') return 0;
  const ax = Math.abs(x);
  return ax > road.halfWidth + 0.36 && ax < road.halfWidth + road.sidewalk + 0.05 ? 0.12 : 0;
}

export function lerpAngle(a: number, b: number, t: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
