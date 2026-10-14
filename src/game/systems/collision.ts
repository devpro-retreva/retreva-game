import type { DestinationPack, PropKind } from '../content/types';

export interface Box {
  minX: number;
  minZ: number;
  maxX: number;
  maxZ: number;
  height: number;
}
export interface Circle {
  x: number;
  z: number;
  r: number;
}
export interface CollisionWorld {
  boxes: Box[];
  circles: Circle[];
  walkable: [number, number, number, number][];
}

/** Footprints for collidable props: box half-extents [x, z] or a circle radius. */
const PROP_SHAPES: Partial<Record<PropKind, { box?: [number, number]; r?: number; h: number }>> = {
  danfo: { box: [1.05, 2.7], h: 2.3 },
  okada: { r: 0.6, h: 1.1 },
  kiosk: { box: [1.0, 1.25], h: 2.5 },
  bench: { box: [0.3, 0.9], h: 0.5 },
  tree: { r: 0.45, h: 6 },
  generator: { box: [0.45, 0.35], h: 0.8 },
  tank: { r: 0.65, h: 1.6 },
  grill: { box: [0.35, 0.55], h: 0.9 },
  crates: { box: [0.5, 0.5], h: 1.2 },
  drum: { r: 0.38, h: 0.95 },
};

export const PLAYER_RADIUS = 0.32;

export function buildCollisionWorld(pack: DestinationPack): CollisionWorld {
  const boxes: Box[] = [];
  const circles: Circle[] = [];

  for (const b of pack.buildings) {
    const [w, h, d] = b.size;
    const [x, z] = b.position;
    boxes.push({ minX: x - d / 2, maxX: x + d / 2, minZ: z - w / 2, maxZ: z + w / 2, height: h });
  }

  for (const p of pack.props) {
    if (!p.collide) continue;
    const shape = PROP_SHAPES[p.kind];
    if (!shape) continue;
    const [x, z] = p.position;
    if (shape.r) circles.push({ x, z, r: shape.r });
    if (shape.box) {
      let [hx, hz] = shape.box;
      if (Math.abs(Math.sin(p.rotation ?? 0)) > 0.7) [hx, hz] = [hz, hx];
      boxes.push({ minX: x - hx, maxX: x + hx, minZ: z - hz, maxZ: z + hz, height: shape.h });
    }
  }

  for (const n of pack.npcs) circles.push({ x: n.position[0], z: n.position[1], r: 0.38 });

  for (const [x0, z0, x1, z1] of pack.walls) {
    boxes.push({ minX: Math.min(x0, x1) - 0.15, maxX: Math.max(x0, x1) + 0.15, minZ: Math.min(z0, z1), maxZ: Math.max(z0, z1), height: 1.4 });
  }

  return { boxes, circles, walkable: pack.walkable };
}

function insideWalkable(w: CollisionWorld, x: number, z: number, r: number): boolean {
  return w.walkable.some(([x0, z0, x1, z1]) => x >= x0 + r && x <= x1 - r && z >= z0 + r && z <= z1 - r);
}

function hitsBox(b: Box, x: number, z: number, r: number): boolean {
  const cx = Math.max(b.minX, Math.min(x, b.maxX));
  const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
  const dx = x - cx;
  const dz = z - cz;
  return dx * dx + dz * dz < r * r;
}

export function isBlocked(w: CollisionWorld, x: number, z: number, r = PLAYER_RADIUS): boolean {
  if (!insideWalkable(w, x, z, r)) return true;
  for (const b of w.boxes) if (hitsBox(b, x, z, r)) return true;
  for (const c of w.circles) {
    const dx = x - c.x;
    const dz = z - c.z;
    const rr = r + c.r;
    if (dx * dx + dz * dz < rr * rr) return true;
  }
  return false;
}

/**
 * Slide resolution so the player glides along walls and around round props:
 *  1. the full move
 *  2. the larger axis component, then the smaller (walls)
 *  3. the move deflected ±30°/±60°, shortened by cos(angle) (trees, NPCs, corners)
 * Zero-length axis components are never "accepted" as a move.
 */
export function resolveMove(w: CollisionWorld, x: number, z: number, nx: number, nz: number, r = PLAYER_RADIUS) {
  if (!isBlocked(w, nx, nz, r)) return { x: nx, z: nz };
  const dx = nx - x;
  const dz = nz - z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) return { x, z };
  const min = len * 0.15;
  const axes: [number, number][] = Math.abs(dx) >= Math.abs(dz) ? [[dx, 0], [0, dz]] : [[0, dz], [dx, 0]];
  for (const [ax, az] of axes) {
    if (Math.hypot(ax, az) > min && !isBlocked(w, x + ax, z + az, r)) return { x: x + ax, z: z + az };
  }
  // 1.48 rad ≈ 85°: the tangent option needed when walking dead-centre into a round prop
  for (const a of [0.52, 1.05, 1.48]) {
    // try both sides at this angle; prefer the one with more room so we never wedge into a pocket
    let best: { x: number; z: number; room: number } | null = null;
    const k = Math.max(Math.cos(a), 0.45);
    for (const sign of [1, -1]) {
      const c = Math.cos(a * sign);
      const s = Math.sin(a * sign);
      const px = x + (dx * c - dz * s) * k;
      const pz = z + (dx * s + dz * c) * k;
      if (isBlocked(w, px, pz, r)) continue;
      // look ~0.9m further along this side: a dead end there means a pocket
      const sl = Math.hypot(px - x, pz - z) || 1;
      const ahead = !isBlocked(w, x + ((px - x) / sl) * 0.9, z + ((pz - z) / sl) * 0.9, r);
      const room = (ahead ? 10 : 0) + clearance(w, px, pz);
      if (!best || room > best.room) best = { x: px, z: pz, room };
    }
    if (best) return { x: best.x, z: best.z };
  }
  return { x, z };
}

/** Distance from a point to the nearest obstacle or walkable edge. */
export function clearance(w: CollisionWorld, x: number, z: number): number {
  let d = Infinity;
  for (const b of w.boxes) {
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    d = Math.min(d, Math.hypot(x - cx, z - cz));
  }
  for (const c of w.circles) d = Math.min(d, Math.hypot(x - c.x, z - c.z) - c.r);
  let edge = 0;
  for (const [x0, z0, x1, z1] of w.walkable) {
    if (x >= x0 && x <= x1 && z >= z0 && z <= z1) edge = Math.max(edge, Math.min(x - x0, x1 - x, z - z0, z1 - z));
  }
  return Math.min(d, edge);
}

/**
 * Fraction (0…1) along the segment a→b where it first enters any box taller
 * than the segment at that point. Used to pull the camera in front of walls.
 */
export function segmentHit(w: CollisionWorld, ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
  let best = 1;
  const dx = bx - ax;
  const dz = bz - az;
  for (const b of w.boxes) {
    let t0 = 0;
    let t1 = 1;
    let ok = true;
    for (const [o, d, mn, mx] of [
      [ax, dx, b.minX - 0.2, b.maxX + 0.2],
      [az, dz, b.minZ - 0.2, b.maxZ + 0.2],
    ] as const) {
      if (Math.abs(d) < 1e-9) {
        if (o < mn || o > mx) ok = false;
      } else {
        let ta = (mn - o) / d;
        let tb = (mx - o) / d;
        if (ta > tb) [ta, tb] = [tb, ta];
        t0 = Math.max(t0, ta);
        t1 = Math.min(t1, tb);
        if (t0 > t1) ok = false;
      }
      if (!ok) break;
    }
    if (!ok || t0 >= best) continue;
    const yAt = ay + (by - ay) * t0;
    if (yAt <= b.height) best = t0;
  }
  return best;
}
