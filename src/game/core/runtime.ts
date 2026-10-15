/**
 * Mutable per-frame state. Read and written inside useFrame / rAF loops only.
 * Nothing here triggers React renders — that is the point.
 */
export const runtime = {
  player: { x: 0, z: 0, yaw: 0, speed: 0, moving: false, eatUntil: 0 },
  camera: { yaw: Math.PI, pitch: 0.32, distance: 5.6 },
  /** Live positions of NPCs and walkers, keyed by id. */
  actors: new Map<string, { x: number; z: number }>(),
  perf: { fps: 0, drawCalls: 0, triangles: 0 },
  /** Moving vehicles this frame (read-only outside Traffic). */
  /** What each walker is doing right now (null while walking). */
  activity: new Map<string, string | null>(),
  traffic: [] as { x: number; z: number; speed: number; lane: number }[],
};

export function resetRuntime(x: number, z: number, yaw: number) {
  runtime.player.x = x;
  runtime.player.z = z;
  runtime.player.yaw = yaw;
  runtime.player.speed = 0;
  runtime.player.moving = false;
  runtime.camera.yaw = yaw;
  runtime.camera.pitch = 0.32;
}

// Expose a read-only debug handle for automated playtests.
declare global {
  interface Window {
    __retreva?: unknown;
  }
}
