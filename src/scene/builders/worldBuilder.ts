import * as THREE from 'three';
import type { BuildingDef, DestinationPack, PropDef } from '../../game/content/types';
import { ColorGeometryBuilder, TextureAtlas } from './geometryBuilder';
import { paintFacade, paintSign, seeded, shade, STOREY_H } from './painters';

const PPM = 40; // facade pixels per metre
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export interface StaticWorld {
  colorGeometry: THREE.BufferGeometry;
  atlasGeometry: THREE.BufferGeometry;
  atlasTexture: THREE.CanvasTexture;
}

/** Local → world helper for a prop placed at (x,z) rotated by r around y. */
function placer(x: number, z: number, r: number) {
  const c = Math.cos(r);
  const s = Math.sin(r);
  return (lx: number, ly: number, lz: number): [number, number, number] => [x + lx * c + lz * s, ly, z - lx * s + lz * c];
}

function building(g: ColorGeometryBuilder, a: TextureAtlas, b: BuildingDef) {
  const [w, h, d] = b.size;
  const [x, z] = b.position;
  const out = b.facing === 'west' ? -1 : 1; // street direction along x
  const faceX = x + out * (d / 2);
  const rnd = seeded(b.id + 'geo');

  // body
  g.box(b.wall, [x, h / 2, z], [d, h, w]);
  // roof slab + parapet
  g.box(b.roof, [x, h + 0.05, z], [d - 0.1, 0.1, w - 0.1]);
  const pc = shade(b.wall, -0.06);
  g.box(pc, [x, h + 0.35, z - w / 2 + 0.12], [d, 0.7, 0.24]);
  g.box(pc, [x, h + 0.35, z + w / 2 - 0.12], [d, 0.7, 0.24]);
  g.box(pc, [x - d / 2 + 0.12, h + 0.35, z], [0.24, 0.7, w]);
  g.box(pc, [x + d / 2 - 0.12, h + 0.35, z], [0.24, 0.7, w]);

  // rooftop water tank on stand (very common on Lagos roofs)
  if (!b.sign || rnd() > 0.5) {
    const tx = x - out * (d * 0.15);
    const tz = z + (rnd() - 0.5) * w * 0.4;
    g.box('#6b6660', [tx, h + 0.55, tz], [1.2, 0.9, 1.2]);
    g.cylinder('#1c1c1c', [tx, h + 1.65, tz], 0.6, 0.62, 1.3, 10);
    g.cylinder('#2a2a2a', [tx, h + 2.36, tz], 0.18, 0.18, 0.14, 8);
  }

  // facade (textured, one quad from the atlas)
  const uv = a.region(w * PPM, h * PPM, paintFacade(b, PPM));
  const fx = faceX + out * 0.012;
  const zL = out < 0 ? z - w / 2 : z + w / 2;
  const zR = out < 0 ? z + w / 2 : z - w / 2;
  a.quad(V(fx, 0, zL), V(fx, 0, zR), V(fx, h, zR), V(fx, h, zL), uv);

  // signboard
  if (b.sign) {
    const sw = Math.min(w * 0.8, 7.2);
    const sh = 0.95;
    const sy = STOREY_H - 0.05;
    const sx = faceX + out * 0.14;
    g.box('#2a2622', [faceX + out * 0.06, sy + sh / 2, z], [0.12, sh + 0.12, sw + 0.12]);
    const suv = a.region(sw * 64, sh * 64, paintSign(b.sign, b.id));
    const szL = out < 0 ? z - sw / 2 : z + sw / 2;
    const szR = out < 0 ? z + sw / 2 : z - sw / 2;
    a.quad(V(sx, sy, szL), V(sx, sy, szR), V(sx, sy + sh, szR), V(sx, sy + sh, szL), suv);
  }

  // awning over the shop front
  if (b.awning) {
    const aw = w * 0.78;
    const depth = 1.5;
    g.boxR(b.awning, [faceX + out * (depth / 2), 2.72, z], [depth, 0.07, aw], [0, 0, out < 0 ? 0.22 : -0.22]);
    g.box('#f4f0e6', [faceX + out * (depth - 0.02), 2.44, z], [0.04, 0.22, aw]);
    // posts
    g.box('#2a2622', [faceX + out * (depth - 0.08), 1.2, z - aw / 2 + 0.1], [0.07, 2.4, 0.07]);
    g.box('#2a2622', [faceX + out * (depth - 0.08), 1.2, z + aw / 2 - 0.1], [0.07, 2.4, 0.07]);
  }

  // top-storey balcony with concrete balustrade
  if (b.balcony && b.storeys >= 2) {
    const by = (b.storeys - 1) * STOREY_H;
    const bw = w * 0.5;
    const bd = 1.0;
    g.box(shade(b.trim, -0.05), [faceX + out * (bd / 2), by, z], [bd, 0.16, bw]);
    g.box(b.trim, [faceX + out * (bd - 0.06), by + 0.5, z], [0.12, 0.85, bw]);
    g.box(b.trim, [faceX + out * (bd / 2), by + 0.5, z - bw / 2 + 0.06], [bd, 0.85, 0.12]);
    g.box(b.trim, [faceX + out * (bd / 2), by + 0.5, z + bw / 2 - 0.06], [bd, 0.85, 0.12]);
    // a couple of potted plants
    g.cylinder('#8a4a2e', [faceX + out * 0.7, by + 0.25, z - bw / 2 + 0.4], 0.16, 0.12, 0.3, 6);
    g.blob('#2f6b3a', [faceX + out * 0.7, by + 0.55, z - bw / 2 + 0.4], 0.28);
  }

  // AC unit or satellite dish for variety
  if (rnd() > 0.45 && b.storeys >= 2) {
    g.box('#e8e6e0', [faceX + out * 0.25, STOREY_H + 2.4, z + w * 0.3], [0.5, 0.55, 0.8]);
  }
}

function prop(g: ColorGeometryBuilder, p: PropDef) {
  const r = p.rotation ?? 0;
  const at = placer(p.position[0], p.position[1], r);
  switch (p.kind) {
    case 'danfo': {
      const Y = '#f2b705';
      g.box(Y, at(0, 1.3, 0), [2.0, 1.7, 5.0], r);
      g.box(shade(Y, 0.06), at(0, 2.2, -0.1), [1.9, 0.12, 4.6], r);
      // window band
      g.box('#24292c', at(0, 1.72, -0.1), [2.02, 0.62, 4.3], r);
      g.box('#24292c', at(0, 1.62, 2.505), [1.7, 0.7, 0.02], r);
      // the two black stripes
      g.box('#151515', at(0, 1.18, 0), [2.03, 0.1, 5.02], r);
      g.box('#151515', at(0, 0.98, 0), [2.03, 0.1, 5.02], r);
      // bumpers, lights
      g.box('#3b3b3b', at(0, 0.55, 2.55), [2.0, 0.22, 0.12], r);
      g.box('#3b3b3b', at(0, 0.55, -2.55), [2.0, 0.22, 0.12], r);
      g.box('#fff6d0', at(0.7, 0.85, 2.52), [0.28, 0.18, 0.04], r);
      g.box('#fff6d0', at(-0.7, 0.85, 2.52), [0.28, 0.18, 0.04], r);
      g.box('#c0392b', at(0.75, 0.85, -2.52), [0.2, 0.16, 0.04], r);
      g.box('#c0392b', at(-0.75, 0.85, -2.52), [0.2, 0.16, 0.04], r);
      // open sliding door
      g.box('#111111', at(1.005, 1.2, 0.9), [0.02, 1.4, 1.0], r);
      for (const [lx, lz] of [[0.9, 1.7], [-0.9, 1.7], [0.9, -1.6], [-0.9, -1.6]]) {
        g.cylinder('#1a1a1a', at(lx, 0.38, lz), 0.38, 0.38, 0.28, 12, [0, r, Math.PI / 2]);
        g.cylinder('#8d8d8d', at(lx * 1.02, 0.38, lz), 0.18, 0.18, 0.29, 8, [0, r, Math.PI / 2]);
      }
      // roof rack
      g.box('#2a2a2a', at(0, 2.32, -0.4), [1.6, 0.06, 2.6], r);
      break;
    }
    case 'okada': {
      for (const lz of [0.66, -0.66]) {
        g.cylinder('#151515', at(0, 0.33, lz), 0.32, 0.32, 0.1, 12, [0, r, Math.PI / 2]);
      }
      g.box('#b3261e', at(0, 0.62, 0.05), [0.24, 0.3, 1.0], r);
      g.box('#1b1b1b', at(0, 0.82, -0.25), [0.3, 0.1, 0.65], r);
      g.box('#b3261e', at(0, 0.84, 0.3), [0.3, 0.2, 0.36], r);
      g.box('#6d6d6d', at(0, 1.05, 0.62), [0.7, 0.05, 0.05], r);
      g.box('#6d6d6d', at(0, 0.75, 0.6), [0.05, 0.6, 0.05], r);
      break;
    }
    case 'kiosk': {
      const c = p.color ?? '#1f6f4a';
      g.box(c, at(0, 1.1, 0), [2.0, 2.2, 2.4], r);
      g.box('#e2a400', at(0, 2.3, 0.25), [2.3, 0.12, 3.0], r);
      g.box('#2a1d14', at(0, 1.35, 1.205), [1.6, 0.9, 0.02], r);
      g.box(shade(c, 0.15), at(0, 0.88, 1.35), [1.7, 0.08, 0.3], r);
      // goods on counter
      g.box('#e4572e', at(-0.4, 1.0, 1.32), [0.2, 0.18, 0.15], r);
      g.box('#f4f0e6', at(0.1, 1.0, 1.32), [0.25, 0.14, 0.15], r);
      g.box('#2c5f9e', at(0.5, 1.02, 1.32), [0.18, 0.22, 0.15], r);
      break;
    }
    case 'umbrella': {
      const c = p.color ?? '#d8452b';
      g.cylinder('#2a2622', at(0, 1.15, 0), 0.03, 0.03, 2.3, 6);
      g.cone(c, at(0, 2.45, 0), 1.45, 0.55, 10);
      g.cone('#f4f0e6', at(0, 2.75, 0), 0.35, 0.18, 10);
      // plastic chairs
      for (const [lx, lz] of [[0.8, 0.3], [-0.6, 0.7]]) {
        const ch = placer(p.position[0] + lx, p.position[1] + lz, 0.6);
        g.box('#e9e4d8', ch(0, 0.45, 0), [0.45, 0.06, 0.45], 0.6);
        g.box('#e9e4d8', ch(0, 0.72, -0.2), [0.45, 0.5, 0.05], 0.6);
        for (const [a, b] of [[0.18, 0.18], [-0.18, 0.18], [0.18, -0.18], [-0.18, -0.18]]) g.box('#d6d0c2', ch(a, 0.22, b), [0.04, 0.44, 0.04], 0.6);
      }
      break;
    }
    case 'bench': {
      g.box('#7a5432', at(0, 0.46, 0), [0.45, 0.07, 1.8], r);
      g.box('#5d3e24', at(0.15, 0.22, 0.7), [0.08, 0.44, 0.08], r);
      g.box('#5d3e24', at(-0.15, 0.22, 0.7), [0.08, 0.44, 0.08], r);
      g.box('#5d3e24', at(0.15, 0.22, -0.7), [0.08, 0.44, 0.08], r);
      g.box('#5d3e24', at(-0.15, 0.22, -0.7), [0.08, 0.44, 0.08], r);
      break;
    }
    case 'tree': {
      const rnd = seeded(p.id);
      g.cylinder('#5a3b26', at(0, 1.4, 0), 0.16, 0.24, 2.8, 7);
      g.cylinder('#d9d2c2', at(0, 0.5, 0), 0.25, 0.25, 1.0, 7); // whitewashed base
      const greens = ['#4f8f45', '#5f9e4a', '#437d3d'];
      for (let i = 0; i < 4; i++) {
        g.blob(greens[i % 3], at((rnd() - 0.5) * 1.6, 3.4 + rnd() * 1.2, (rnd() - 0.5) * 1.6), 1.0 + rnd() * 0.6, [1, 0.75, 1]);
      }
      break;
    }
    case 'generator': {
      g.box('#d8a400', at(0, 0.42, 0), [0.9, 0.7, 0.7], r);
      g.box('#1f1f1f', at(0, 0.82, 0), [0.92, 0.1, 0.72], r);
      g.box('#c0392b', at(0.3, 0.55, 0.36), [0.2, 0.2, 0.02], r);
      g.cylinder('#555', at(-0.35, 0.95, -0.2), 0.04, 0.04, 0.3, 6);
      break;
    }
    case 'tank': {
      g.box('#6b6660', at(0, 0.3, 0), [1.2, 0.6, 1.2]);
      g.cylinder('#1c1c1c', at(0, 1.25, 0), 0.62, 0.64, 1.3, 12);
      break;
    }
    case 'grill': {
      for (const [lx, lz] of [[0.25, 0.4], [-0.25, 0.4], [0.25, -0.4], [-0.25, -0.4]]) g.box('#2a2a2a', at(lx, 0.35, lz), [0.05, 0.7, 0.05], r);
      g.box('#2d2d2d', at(0, 0.78, 0), [0.6, 0.18, 1.0], r);
      g.box('#ff7a2a', at(0, 0.88, 0), [0.5, 0.03, 0.9], r);
      for (let i = 0; i < 5; i++) g.cylinder('#f2c94c', at(0, 0.93, -0.36 + i * 0.18), 0.04, 0.04, 0.4, 6, [0, r, Math.PI / 2]);
      break;
    }
    case 'crates': {
      const cols = ['#c0392b', '#1f6f4a', '#c0392b', '#2c5f9e'];
      let i = 0;
      for (const ly of [0.22, 0.67]) for (const lz of [-0.24, 0.24]) g.box(cols[i++], at(0, ly, lz), [0.44, 0.44, 0.44], r);
      g.box('#c0392b', at(0, 1.12, 0), [0.44, 0.44, 0.44], r);
      break;
    }
    case 'drum': {
      const c = p.color ?? '#2c5f9e';
      g.cylinder(c, at(0, 0.47, 0), 0.36, 0.36, 0.94, 12);
      g.cylinder(shade(c, -0.15), at(0, 0.3, 0), 0.37, 0.37, 0.05, 12);
      g.cylinder(shade(c, -0.15), at(0, 0.65, 0), 0.37, 0.37, 0.05, 12);
      break;
    }
    case 'pole': {
      g.cylinder('#5b4636', at(0, 4, 0), 0.1, 0.14, 8, 6);
      g.box('#4a3a2c', at(0, 7.6, 0), [1.4, 0.1, 0.1]);
      break;
    }
  }
}

function powerLines(g: ColorGeometryBuilder, pack: DestinationPack) {
  const poles = pack.props.filter((p) => p.kind === 'pole').sort((a, b) => a.position[1] - b.position[1]);
  for (let i = 0; i < poles.length - 1; i++) {
    const [x0, z0] = poles[i].position;
    const [, z1] = poles[i + 1].position;
    for (const off of [-0.6, 0, 0.6]) {
      const mid = (z0 + z1) / 2;
      const sag = 0.55;
      for (const [a, b] of [[z0, mid], [mid, z1]]) {
        const ya = a === mid ? 7.55 - sag : 7.55;
        const yb = b === mid ? 7.55 - sag : 7.55;
        const len = Math.hypot(b - a, yb - ya);
        const ang = Math.atan2(yb - ya, b - a);
        g.boxR('#151515', [x0 + off, (ya + yb) / 2, (a + b) / 2], [0.025, 0.025, len], [-ang, 0, 0]);
      }
    }
  }
  // service drops into a few buildings
  for (const p of poles.slice(1, 4)) {
    const [x, z] = p.position;
    g.boxR('#151515', [x - 0.6, 6.6, z], [0.02, 0.02, 2.4], [0, Math.PI / 2, 0.45]);
  }
}

function streetFurniture(g: ColorGeometryBuilder, pack: DestinationPack) {
  const { halfWidth: hw, sidewalk: sw, length } = pack.road;
  const L = length / 2;
  // gutters (open drains) and curbs
  for (const side of [-1, 1]) {
    g.box(pack.palette.gutter, [side * (hw + 0.18), -0.02, 0], [0.36, 0.04, length]);
    g.box('#cfc6b4', [side * (hw + 0.38), 0.07, 0], [0.06, 0.14, length]);
    g.box('#cfc6b4', [side * (hw - 0.02), 0.04, 0], [0.06, 0.08, length]);
    // slab covers over the drain at entrances
    for (let z = -L + 6; z < L; z += 10.5) g.box('#9e958a', [side * (hw + 0.18), 0.03, z], [0.44, 0.06, 1.4]);
  }
  // centre dashes
  for (let z = -L + 1; z < L; z += 3.2) g.box(pack.palette.roadLine, [0, 0.012, z], [0.12, 0.004, 1.6]);
  // street-end barriers
  for (const end of [-1, 1]) {
    const z = end * (L - 1.6);
    for (let x = -hw - sw + 0.6, i = 0; x < hw + sw; x += 1.25, i++) {
      g.box(i % 2 ? '#f4f0e6' : '#d8452b', [x, 0.42, z], [1.15, 0.84, 0.5]);
    }
  }
  // perimeter walls of the lot
  for (const [x0, z0, x1, z1] of pack.walls) {
    const len = Math.hypot(x1 - x0, z1 - z0);
    g.box('#cbb89a', [(x0 + x1) / 2, 0.7, (z0 + z1) / 2], [Math.abs(x1 - x0) + 0.3, 1.4, len]);
    g.box('#a8987e', [(x0 + x1) / 2, 1.45, (z0 + z1) / 2], [Math.abs(x1 - x0) + 0.4, 0.1, len + 0.1]);
  }
}

function backdrop(g: ColorGeometryBuilder) {
  const rnd = seeded('backdrop');
  const tones = ['#c9a98a', '#b99c84', '#d4b896', '#a98f7a', '#bfa58e'];
  // behind both rows
  for (const side of [-1, 1]) {
    for (let z = -50; z < 50; z += 6 + rnd() * 4) {
      const h = 6 + rnd() * 14;
      const x = side * (19 + rnd() * 8);
      g.box(tones[Math.floor(rnd() * tones.length)], [x, h / 2, z], [6 + rnd() * 4, h, 5 + rnd() * 3]);
    }
  }
  // street ends: a near row closing the view, and a taller far row for depth
  for (const end of [-1, 1]) {
    for (let x = -30; x < 30; ) {
      const w = 5 + rnd() * 4;
      const h = 6 + rnd() * 7;
      const z = end * (49 + rnd() * 1.5);
      g.box(tones[Math.floor(rnd() * tones.length)], [x + w / 2, h / 2, z], [w, h, 5]);
      g.box('#2b2724', [x + w / 2, h + 0.3, z], [w, 0.6, 5]);
      const face = z - end * 2.52;
      for (let fy = 2.2; fy < h - 1; fy += 3.1) {
        for (let fx = x + 1.1; fx < x + w - 0.9; fx += 1.9) g.box('#3a3029', [fx, fy, face], [1.0, 1.2, 0.06]);
      }
      x += w;
    }
    for (let x = -34; x < 34; x += 5 + rnd() * 4) {
      const h = 12 + rnd() * 14;
      g.box(tones[Math.floor(rnd() * tones.length)], [x, h / 2, end * (58 + rnd() * 6)], [5 + rnd() * 3, h, 6]);
    }
  }
  // a distant tower, for skyline character
  g.box('#b7a593', [-30, 22, -78], [8, 44, 8]);
  g.box('#c4b19c', [26, 16, -84], [10, 32, 9]);
}

export function buildStaticWorld(pack: DestinationPack): StaticWorld {
  const g = new ColorGeometryBuilder();
  const a = new TextureAtlas(2048);
  for (const b of pack.buildings) building(g, a, b);
  for (const p of pack.props) prop(g, p);
  powerLines(g, pack);
  streetFurniture(g, pack);
  backdrop(g);
  const atlas = a.build();
  return { colorGeometry: g.build(), atlasGeometry: atlas.geometry, atlasTexture: atlas.texture };
}
