import type { RideDef, Vec2 } from '../content/types';

/**
 * Rides along a fixed track (the game drive at Yankari): where the vehicle is after `s` metres, how long the ride
 * lasts, and which sightings you pass on the way. Pure — the scene and the store both read it from the same clock,
 * so the truck, the player and the sightings never disagree.
 */

export function trackLength(track: Vec2[]): number {
  let n = 0;
  for (let i = 1; i < track.length; i++) n += Math.hypot(track[i][0] - track[i - 1][0], track[i][1] - track[i - 1][1]);
  return n;
}

/** Position and heading (yaw, +z = 0) `s` metres along the track, clamped to its ends. */
export function pointAlong(track: Vec2[], s: number): { x: number; z: number; yaw: number } {
  let left = Math.max(0, s);
  for (let i = 1; i < track.length; i++) {
    const [ax, az] = track[i - 1];
    const [bx, bz] = track[i];
    const seg = Math.hypot(bx - ax, bz - az);
    const yaw = Math.atan2(bx - ax, bz - az);
    if (left <= seg || i === track.length - 1) {
      const k = seg > 0 ? Math.min(1, left / seg) : 1;
      return { x: ax + (bx - ax) * k, z: az + (bz - az) * k, yaw };
    }
    left -= seg;
  }
  const [x, z] = track[0];
  return { x, z, yaw: 0 };
}

/** Real seconds the ride takes from end to end. */
export function rideSeconds(ride: RideDef): number {
  return trackLength(ride.track) / ride.speed;
}

/** Metres travelled `ms` after setting off. */
export function rideDistance(ride: RideDef, ms: number): number {
  return Math.min(trackLength(ride.track), (Math.max(0, ms) / 1000) * ride.speed);
}

/** Sightings within view somewhere between s0 and s1 metres (sampled every metre, so a slow frame skips none). */
export function sightingsBetween(ride: RideDef, s0: number, s1: number, seen: string[] = []): string[] {
  const out: string[] = [];
  for (const v of ride.sightings) {
    if (seen.includes(v.id)) continue;
    for (let s = s0; s <= s1 + 1e-6; s += 1) {
      const p = pointAlong(ride.track, Math.min(s, s1));
      if (Math.hypot(p.x - v.position[0], p.z - v.position[1]) <= v.radius) {
        out.push(v.id);
        break;
      }
    }
  }
  return out;
}

/** Closest the track comes to a point (for the content checks). */
export function distanceToTrack(track: Vec2[], x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < track.length; i++) {
    const [ax, az] = track[i - 1];
    const [bx, bz] = track[i];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz;
    const k = len2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2)) : 0;
    best = Math.min(best, Math.hypot(x - (ax + dx * k), z - (az + dz * k)));
  }
  return best;
}

/**
 * Like pointAlong, but the heading turns smoothly through each bend (blended over `blend` metres either side of a
 * corner), so the vehicle swings round instead of snapping.
 */
export function poseAlong(track: Vec2[], s: number, blend = 3): { x: number; z: number; yaw: number } {
  const p = pointAlong(track, s);
  const yaws: number[] = [];
  const lens: number[] = [];
  for (let i = 1; i < track.length; i++) {
    yaws.push(Math.atan2(track[i][0] - track[i - 1][0], track[i][1] - track[i - 1][1]));
    lens.push(Math.hypot(track[i][0] - track[i - 1][0], track[i][1] - track[i - 1][1]));
  }
  let left = Math.max(0, s);
  let i = 0;
  while (i < lens.length - 1 && left > lens[i]) left -= lens[i++];
  const b = Math.min(blend, lens[i] / 2);
  if (i < lens.length - 1 && left > lens[i] - b) p.yaw = mixAngle(yaws[i], yaws[i + 1], (left - (lens[i] - b)) / (2 * b));
  else if (i > 0 && left < b) p.yaw = mixAngle(yaws[i - 1], yaws[i], 0.5 + left / (2 * b));
  return p;
}

function mixAngle(a: number, b: number, t: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/** Where the ride is right now (`ms` after setting off). */
export function ridePose(ride: RideDef, ms: number) {
  return poseAlong(ride.track, rideDistance(ride, ms));
}

/** Height of the ride's floor `s` metres along (0 for a ride on the ground). */
export function heightAlong(ride: RideDef, s: number): number {
  const h = ride.heights;
  if (!h) return 0;
  let left = Math.max(0, s);
  for (let i = 1; i < ride.track.length; i++) {
    const seg = Math.hypot(ride.track[i][0] - ride.track[i - 1][0], ride.track[i][1] - ride.track[i - 1][1]);
    if (left <= seg || i === ride.track.length - 1) return h[i - 1] + (h[i] - h[i - 1]) * (seg > 0 ? Math.min(1, left / seg) : 1);
    left -= seg;
  }
  return h[0];
}

/** Where along the track the ride is `ms` after setting off; a reversed ride (a cable car going down) runs end to start. */
export function rideAt(ride: RideDef, ms: number, reverse = false): number {
  const d = rideDistance(ride, ms);
  return reverse ? trackLength(ride.track) - d : d;
}

/** Full pose for drawing: position, height and heading (turned round when riding the track backwards). */
export function ridePose3(ride: RideDef, ms: number, reverse = false): { x: number; z: number; y: number; yaw: number } {
  const s = rideAt(ride, ms, reverse);
  const p = poseAlong(ride.track, s);
  return { ...p, y: heightAlong(ride, s), yaw: reverse ? p.yaw + Math.PI : p.yaw };
}

/** Where a passenger sits, relative to the vehicle (local x right, z forward) and above its floor. */
export const SEATS: Record<RideDef['vehicle'], { x: number; z: number; y: number }> = {
  'safari-truck': { x: 0.45, z: -0.9, y: 1.31 },
  'cable-car': { x: 0, z: -0.5, y: -0.05 },
};
