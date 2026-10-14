import { useMemo } from 'react';
import { getDestination, type DestinationPack } from '../game/content';
import { buildCollisionWorld, type CollisionWorld } from '../game/systems/collision';
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

export function useCollisionWorld() {
  const id = useGame((s) => s.destinationId);
  return useMemo(() => getCollisionWorld(id), [id]);
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
