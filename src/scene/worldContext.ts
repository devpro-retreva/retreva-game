import { useMemo } from 'react';
import { getDestination } from '../game/content';
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

/** Sidewalks are raised slightly; the player steps up onto them. */
export function groundHeight(x: number, halfWidth: number, sidewalk: number): number {
  const ax = Math.abs(x);
  return ax > halfWidth + 0.36 && ax < halfWidth + sidewalk + 0.05 ? 0.12 : 0;
}

export function lerpAngle(a: number, b: number, t: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
