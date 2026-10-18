import * as THREE from 'three';
import type { BuildingDef, DestinationPack, PropDef } from '../../game/content/types';
import { ColorGeometryBuilder, TextureAtlas } from './geometryBuilder';
import { paintFacade, paintSign, seeded, shade, STOREY_H } from './painters';

const MAX_PPM = 40; // facade pixels per metre (lowered automatically for big areas)
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

function building(g: ColorGeometryBuilder, a: TextureAtlas, b: BuildingDef, PPM: number) {
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
  if (b.style === 'adobe') {
    // zanko: pointed mud pinnacles at the corners of the parapet
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.cylinder(shade(b.wall, -0.1), [x + sx * (d / 2 - 0.2), h + 1.15, z + sz * (w / 2 - 0.2)], 0.06, 0.28, 1.0, 6);
  }
  if (b.style !== 'glass' && b.style !== 'adobe' && (!b.sign || rnd() > 0.5)) {
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
  // terminal canopy: a long flat roof over the walkway on slim columns
  if (b.style === 'glass' && !b.awning) {
    const depth = 3.6;
    g.box('#e9e6df', [faceX + out * (depth / 2), 4.3, z], [depth, 0.18, w - 0.4]);
    g.box('#b9b5ad', [faceX + out * (depth - 0.05), 4.12, z], [0.1, 0.22, w - 0.4]);
    // cantilevered: tie rods from the facade hold the outer edge, so nothing stands in the walkway
    const rodLen = Math.hypot(depth, 3.0);
    const rodAng = Math.atan2(3.0, depth);
    for (let cz = z - w / 2 + 1.2; cz <= z + w / 2 - 1.1; cz += 4.2) {
      g.boxR('#8e9399', [faceX + out * (depth / 2), 5.85, cz], [rodLen, 0.06, 0.06], [0, 0, out < 0 ? rodAng : -rodAng]);
    }
  }

  if (b.style !== 'glass' && rnd() > 0.45 && b.storeys >= 2) {
    g.box('#e8e6e0', [faceX + out * 0.25, STOREY_H + 2.4, z + w * 0.3], [0.5, 0.55, 0.8]);
  }
}

function prop(g: ColorGeometryBuilder, p: PropDef) {
  const r = p.rotation ?? 0;
  const at = placer(p.position[0], p.position[1], r);
  switch (p.kind) {
    case 'danfo': {
      // the yellow Lagos danfo; other cities' minibuses (Accra's tro-tros) pass their own colour
      const Y = p.color ?? '#f2b705';
      g.box(Y, at(0, 1.3, 0), [2.0, 1.7, 5.0], r);
      g.box(shade(Y, 0.06), at(0, 2.2, -0.1), [1.9, 0.12, 4.6], r);
      // window band
      g.box('#24292c', at(0, 1.72, -0.1), [2.02, 0.62, 4.3], r);
      g.box('#24292c', at(0, 1.62, 2.505), [1.7, 0.7, 0.02], r);
      // the two black stripes (a blue band on other minibuses)
      const band = p.color ? '#2c5f9e' : '#151515';
      g.box(band, at(0, 1.18, 0), [2.03, 0.1, 5.02], r);
      g.box(band, at(0, 0.98, 0), [2.03, 0.1, 5.02], r);
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
    case 'palm': {
      const rnd = seeded(p.id);
      const lean = (rnd() - 0.5) * 0.3;
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        g.cylinder(i % 2 ? '#8a6a48' : '#7a5c3c', at(lean * t * 6, 0.5 + i * 0.95, 0), 0.15 - t * 0.04, 0.17 - t * 0.04, 0.98, 7);
      }
      const top = at(lean * 6, 6.2, 0);
      g.sphere('#6b4a2a', top, 0.28, [1, 0.8, 1], 0);
      const greens = ['#3f8a3a', '#4f9a44', '#367a33'];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + rnd();
        g.boxR(greens[i % 3], [top[0] + Math.sin(a) * 1.1, top[1] - 0.25, top[2] + Math.cos(a) * 1.1], [0.5, 0.06, 2.3], [0.45, a, 0]);
      }
      for (let i = 0; i < 3; i++) g.sphere('#6a4a20', [top[0] + (rnd() - 0.5) * 0.4, top[1] - 0.35, top[2] + (rnd() - 0.5) * 0.4], 0.13, [1, 1, 1], 0);
      break;
    }
    case 'stall': {
      // trading table with an awning, stacked cloth bolts and goods; faces local +z
      const c = p.color ?? '#d8452b';
      g.box('#6d5236', at(0, 0.8, 0), [2.0, 0.08, 1.3], r);
      for (const [lx, lz] of [[0.9, 0.55], [-0.9, 0.55], [0.9, -0.55], [-0.9, -0.55]]) g.box('#4a3624', at(lx, 0.4, lz), [0.06, 0.8, 0.06], r);
      for (const [lx, lz] of [[0.95, -0.6], [-0.95, -0.6]]) g.box('#3a2a1c', at(lx, 1.4, lz), [0.05, 1.3, 0.05], r);
      g.boxR(c, at(0, 2.1, 0.05), [2.3, 0.05, 1.6], [0.18, r, 0]);
      g.box('#f4f0e6', at(0, 1.98, 0.85), [2.3, 0.18, 0.03], r);
      const rnd = seeded(p.id);
      const bolts = ['#f2b705', '#2d3f8f', '#e4572e', '#1f6f4a', '#7a3b72', '#f4f0e6', '#1d7f86', '#c9583b'];
      for (let i = 0; i < 6; i++) {
        const lx = -0.75 + i * 0.3;
        const h = 0.18 + rnd() * 0.2;
        g.box(bolts[Math.floor(rnd() * bolts.length)], at(lx, 0.84 + h / 2, -0.1 + rnd() * 0.3), [0.26, h, 0.5], r);
      }
      g.box(bolts[Math.floor(rnd() * bolts.length)], at(0.2, 1.1, -0.45), [1.2, 0.5, 0.12], r);
      break;
    }
    case 'beachhut': {
      g.box('#c9a26b', at(0, 1.1, 0), [2.6, 2.2, 2.4], r);
      g.box('#2a1d14', at(0, 1.0, 1.205), [1.8, 0.9, 0.02], r);
      g.box('#e8d4a8', at(0, 0.95, 1.4), [2.2, 0.08, 0.4], r);
      g.cone('#b08a48', at(0, 2.85, 0), 2.3, 1.4, 6);
      g.cone('#9a7638', at(0, 3.55, 0), 0.5, 0.4, 6);
      g.box('#e4572e', at(-0.6, 1.08, 1.42), [0.22, 0.2, 0.2], r);
      g.box('#7fbf4a', at(0.2, 1.08, 1.42), [0.24, 0.22, 0.22], r);
      break;
    }
    case 'lifeguard': {
      for (const [lx, lz] of [[0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) g.box('#f4f0e6', at(lx, 1.2, lz), [0.12, 2.4, 0.12]);
      g.box('#d8452b', at(0, 2.5, 0), [1.8, 0.14, 1.8]);
      g.box('#d8452b', at(0, 3.0, -0.85), [1.8, 1.0, 0.1]);
      g.box('#d8452b', at(0.85, 3.0, 0), [0.1, 1.0, 1.8]);
      g.box('#d8452b', at(-0.85, 3.0, 0), [0.1, 1.0, 1.8]);
      g.cone('#f4f0e6', at(0, 3.85, 0), 1.45, 0.7, 4);
      g.boxR('#bfb6a4', at(0, 1.2, 1.4), [0.6, 0.06, 2.8], [0.9, 0, 0]);
      g.cylinder('#2a2622', at(0, 4.6, 0), 0.03, 0.03, 1.1, 5);
      g.box('#f2b705', at(0.25, 5.0, 0), [0.5, 0.3, 0.02]);
      break;
    }
    case 'lounger': {
      g.box('#f4f0e6', at(0, 0.32, 0.2), [0.6, 0.06, 1.4], r);
      g.boxR('#f4f0e6', at(0, 0.5, -0.65), [0.6, 0.06, 0.6], [-0.6, r, 0]);
      g.box('#1d7f86', at(0, 0.36, 0.2), [0.56, 0.03, 1.36], r);
      for (const [lx, lz] of [[0.25, 0.8], [-0.25, 0.8], [0.25, -0.4], [-0.25, -0.4]]) g.box('#8a7a66', at(lx, 0.15, lz), [0.05, 0.3, 0.05], r);
      break;
    }
    case 'jetty': {
      // wooden landing stage running out over the water along local +z (walk on it: the pack adds a walkable strip)
      const len = 7.4;
      g.box('#8a6a48', at(0, 0.0, len / 2), [2.2, 0.1, len], r);
      for (let i = 0; i < 9; i++) g.box('#6f5238', at(0, 0.055, 0.4 + i * 0.82), [2.2, 0.01, 0.06], r);
      for (let lz = 0.4; lz <= len; lz += 1.8) {
        for (const lx of [-1.05, 1.05]) g.cylinder('#5a3b26', at(lx, -0.2, lz), 0.09, 0.09, 0.7, 6);
      }
      for (const lx of [-1.05, 1.05]) g.cylinder('#5a3b26', at(lx, 0.35, len - 0.1), 0.1, 0.1, 0.8, 6);
      break;
    }
    case 'canoe': {
      // dugout canoe afloat, long axis along local z, with a paddle across it
      const c = p.color ?? '#6b4a2e';
      g.box(c, at(0, 0.08, 0), [0.75, 0.36, 3.6], r);
      g.box(shade(c, -0.2), at(0, 0.27, 0), [0.55, 0.02, 3.3], r);
      for (const s of [1, -1]) {
        g.box(c, at(0, 0.12, s * 2.0), [0.5, 0.28, 0.5], r);
        g.box(c, at(0, 0.16, s * 2.35), [0.26, 0.22, 0.3], r);
      }
      g.boxR('#a5845c', at(0, 0.32, 0.6), [1.6, 0.04, 0.08], [0, r + 0.5, 0]);
      break;
    }
    case 'arch': {
      // a memorial arch on a sandbank across the water, seen from the shore (the Point of No Return on Gberefu)
      g.cylinder('#d8c39a', at(0, 0.02, 0), 9, 10, 0.3, 20);
      g.box('#cbb48a', at(0, 0.3, 0), [3.6, 0.5, 7.6], r);
      for (const lz of [-2.4, 2.4]) g.box('#ebe4d6', at(0, 3.4, lz), [1.2, 6, 1.2], r);
      g.box('#ebe4d6', at(0, 6.9, 0), [1.4, 1.2, 6.2], r);
      g.box('#5b3a24', at(0, 6.3, 0), [1.42, 0.16, 6.22], r);
      for (const [lx, lz] of [[-5, -5], [5.5, 3], [-4, 6]]) prop(g, { id: `${p.id}-palm-${lx}`, kind: 'palm', position: [p.position[0] + lx, p.position[1] + lz] });
      break;
    }
    case 'monolith': {
      // a great granite inselberg on the horizon (Aso Rock): steep domes rising straight out of the plain
      // (blob centres at ground level, so only the upper halves show), with trees at its foot
      const greys = ['#8d8478', '#9a9184', '#7f776c'];
      g.blob(greys[0], at(0, 0, 0), 26, [1.5, 1.25, 0.8]);
      g.blob(greys[1], at(-24, 0, 6), 18, [1.1, 1.05, 0.8]);
      g.blob(greys[2], at(22, 0, 4), 16, [1.1, 1.2, 0.8]);
      for (const [lx, lz, r] of [[-40, 12, 6], [-18, 20, 5], [8, 22, 6], [34, 16, 5]]) g.blob('#5f7f40', at(lx, 1.5, lz), r, [1.4, 0.45, 1]);
      break;
    }
    case 'skyscraper': {
      // a tall slab tower seen over the rooftops (Cocoa House): bands of windows, a darker crown
      const h = 62;
      g.box('#ece8de', at(0, h / 2, 0), [12, h, 12], r);
      for (let y = 4.5; y < h - 4; y += 3.2) {
        for (const s of [-1, 1]) {
          g.box('#4c5a64', at(s * 6.02, y, 0), [0.06, 1.3, 10.6], r);
          g.box('#4c5a64', at(0, y, s * 6.02), [10.6, 1.3, 0.06], r);
        }
      }
      g.box('#7a5a3c', at(0, h + 1.2, 0), [12.4, 2.4, 12.4], r);
      g.box('#c9c3b6', at(0, h + 4, 0), [5, 3.2, 5], r);
      g.cylinder('#c0392b', at(0, h + 7.5, 0), 0.12, 0.12, 4, 6);
      break;
    }
    case 'colonnade': {
      // a colonial town hall front (Mapo Hall): steps, a row of tall columns, entablature and a low roof;
      // the long side runs along local x and the columns face local +z
      g.box('#d9d2c4', at(0, 0.4, 0), [16, 0.8, 10], r);
      g.box('#d1c9b9', at(0, 0.9, 4.2), [15, 0.3, 1.4], r);
      g.box('#ebe5d8', at(0, 5, -1.6), [15, 8.4, 5.6], r);
      for (let i = 0; i < 7; i++) g.cylinder('#f4f0e6', at(-6.3 + i * 2.1, 4.8, 2.6), 0.42, 0.48, 7.8, 10);
      g.box('#e6dfd0', at(0, 9.1, 0.6), [15.6, 1.2, 6.8], r);
      g.box('#8a5a3c', at(0, 10.1, 0), [15.2, 0.8, 7.4], r);
      for (const s of [-1, 1]) g.box('#3a4048', at(s * 2.6, 3.2, 1.2), [1.4, 4, 0.06], r);
      break;
    }
    case 'hilltower': {
      // a hill on the horizon (Oke-Are) crowned by a slim white tower (Bower's Tower)
      // a long low hill, lighter than the roofs in front of it, so the white tower reads against the sky
      g.blob('#8a9a5c', at(0, 0, 0), 28, [2.2, 0.36, 1]);
      g.blob('#93a265', at(-34, 0, 8), 18, [1.6, 0.32, 1]);
      const top = 28 * 0.36 - 1.2;
      g.box('#f4f1ea', at(0, top + 6.5, 0), [3.6, 13, 3.6], r);
      g.box('#e2ddd2', at(0, top + 13.6, 0), [4.4, 1.2, 4.4], r);
      for (const y of [4.5, 8, 11]) g.box('#5a5550', at(0, top + y, 1.82), [0.9, 1.4, 0.04], r);
      break;
    }
    case 'statue': {
      // a bronze figure on a stepped plinth (a market heroine with her wrapper and headtie), facing local +z
      g.box('#d9d2c4', at(0, 0.3, 0), [2.0, 0.6, 2.0], r);
      g.box('#cfc7b6', at(0, 0.95, 0), [1.4, 0.7, 1.4], r);
      const b = p.color ?? '#7a5230';
      g.cylinder(shade(b, -0.1), at(0, 2.0, 0), 0.42, 0.55, 1.5, 10);
      g.cylinder(b, at(0, 3.0, 0), 0.34, 0.4, 0.6, 10);
      g.blob(b, at(0, 3.55, 0), 0.24, [1, 1.2, 1]);
      g.blob(shade(b, 0.08), at(0, 3.85, -0.03), 0.28, [1.15, 0.7, 1.15]);
      for (const side of [-1, 1]) g.boxR(b, at(side * 0.42, 2.85, 0.12), [0.14, 0.7, 0.14], [0.35, r, side * 0.25]);
      break;
    }
    case 'sculpture': {
      // a tall, organic cement sculpture in the spirit of the grove's New Sacred Art: stacked, leaning forms
      const c = p.color ?? '#b8ab94';
      g.blob(shade(c, -0.08), at(0, 0.6, 0), 1.1, [1.2, 0.6, 1.2]);
      g.blob(c, at(0.2, 2.0, 0), 0.9, [0.8, 1.6, 0.8]);
      g.blob(shade(c, 0.05), at(-0.3, 3.6, 0.1), 0.8, [1.1, 1.2, 0.7]);
      g.blob(c, at(0.1, 5.0, -0.1), 0.65, [0.7, 1.3, 0.7]);
      g.blob(shade(c, -0.12), at(0.6, 4.4, 0), 0.45, [1.6, 0.5, 0.5]);
      g.blob(shade(c, -0.12), at(-0.8, 3.0, 0), 0.4, [1.5, 0.5, 0.5]);
      break;
    }
    case 'clothline': {
      // cloth hung out to sell (adire): two posts, a line, and panels in shades of indigo along local x
      for (const lx of [-2.2, 2.2]) g.box('#5a3b26', at(lx, 1.15, 0), [0.08, 2.3, 0.08], r);
      g.box('#2a2622', at(0, 2.25, 0), [4.4, 0.03, 0.03], r);
      const blues = ['#3d6aa3', '#4f7fc0', '#2c5a96', '#6b95cc', '#355d9e'];
      for (let i = 0; i < 5; i++) {
        const lx = -1.75 + i * 0.88;
        g.box(blues[i], at(lx, 1.45, 0), [0.78, 1.55, 0.03], r);
        // pale resist patterns on both faces: circles (oniko) read as dots, paste lines (eleko) as bands
        for (const side of [-1, 1]) {
          g.box('#eef0f2', at(lx, 1.75 - (i % 2) * 0.35, side * 0.02), [0.5, 0.08, 0.01], r);
          g.box('#eef0f2', at(lx, 1.2, side * 0.02), [0.12, 0.12, 0.01], r);
        }
      }
      break;
    }
    case 'train': {
      // a standard-gauge passenger train standing at a platform: diesel locomotive and coaches along local +x
      const coach = p.color ?? '#f1efe8';
      const stripe = '#1f6f4a';
      const len = 22;
      for (let i = 0; i < 4; i++) {
        const cx = -i * (len + 1);
        const loco = i === 0;
        g.box(loco ? '#e9e6dc' : coach, at(cx, 2.4, 0), [len, 3.4, 3.2], r);
        g.box(stripe, at(cx, 1.9, 0), [len + 0.02, 0.5, 3.22], r);
        g.box('#f2b705', at(cx, 2.25, 0), [len + 0.02, 0.12, 3.24], r);
        g.box('#55585c', at(cx, 4.2, 0), [len - 0.4, 0.25, 2.8], r);
        g.box('#2f3236', at(cx, 0.55, 0), [len - 2, 0.7, 2.4], r);
        if (loco) {
          g.box('#22282c', at(cx + len / 2 - 0.5, 3.0, 0), [0.1, 1.0, 2.6], r);
          g.box('#c0392b', at(cx + len / 2 + 0.06, 1.3, 0), [0.12, 0.5, 2.8], r);
        } else {
          for (let wx = -len / 2 + 1.6; wx < len / 2 - 1; wx += 2.0) for (const s of [-1, 1]) g.box('#2a3640', at(cx + wx, 3.0, s * 1.61), [1.3, 0.9, 0.04], r);
          for (const s of [-1, 1]) g.box('#3a4a52', at(cx - len / 2 + 1.2, 2.2, s * 1.61), [0.9, 2.4, 0.05], r);
        }
      }
      break;
    }
    case 'busstop': {
      // shelter: back panel at local -z, roof, bench, sign post; long side along local x
      g.box('#3a5a7a', at(0, 1.25, -0.45), [3.0, 2.3, 0.08], r);
      g.box('#e8e2d4', at(0, 2.45, 0), [3.2, 0.12, 1.2], r);
      g.box('#2a2622', at(1.5, 1.2, 0.45), [0.08, 2.4, 0.08], r);
      g.box('#2a2622', at(-1.5, 1.2, 0.45), [0.08, 2.4, 0.08], r);
      g.box('#8a6a48', at(0, 0.48, -0.2), [2.4, 0.08, 0.4], r);
      g.box('#f2b705', at(1.75, 2.1, 0.5), [0.5, 0.5, 0.06], r);
      g.box('#15130f', at(1.75, 2.1, 0.535), [0.32, 0.12, 0.01], r);
      g.box('#2a2622', at(1.75, 1.0, 0.5), [0.06, 2.0, 0.06], r);
      break;
    }
    case 'keke': {
      const Y = '#f2b705';
      g.box(Y, at(0, 0.85, -0.2), [1.25, 1.0, 1.6], r);
      g.box('#2a2a2a', at(0, 1.55, -0.1), [1.3, 0.08, 1.9], r);
      g.box('#24292c', at(0, 1.15, 0.62), [1.0, 0.55, 0.04], r);
      g.box('#1f6f4a', at(0, 0.62, -0.2), [1.27, 0.12, 1.62], r);
      g.box(Y, at(0, 0.7, 0.85), [0.35, 0.6, 0.6], r);
      for (const [lx, lz] of [[0.55, -0.6], [-0.55, -0.6], [0, 1.0]]) g.cylinder('#151515', at(lx, 0.25, lz), 0.25, 0.25, 0.14, 10, [0, r, Math.PI / 2]);
      for (const [lx, lz] of [[0.6, 0.35], [-0.6, 0.35], [0.6, -0.7], [-0.6, -0.7]]) g.box('#2a2a2a', at(lx, 1.2, lz), [0.04, 0.7, 0.04], r);
      break;
    }
    case 'counter': {
      // airline check-in desk (long side along local z) with a backlit panel and screens
      const c = p.color ?? '#1f6f4a';
      g.box('#e8e6e0', at(0, 0.55, 0), [0.8, 1.1, 2.9], r);
      g.box(c, at(-0.41, 0.55, 0), [0.02, 0.9, 2.7], r);
      g.box('#cfcac0', at(0, 1.12, 0), [0.9, 0.05, 3.0], r);
      for (const lz of [-0.7, 0.7]) {
        g.box('#22282c', at(0.1, 1.38, lz), [0.06, 0.32, 0.48], r);
        g.box('#3b3b3b', at(0.1, 1.18, lz), [0.04, 0.14, 0.04], r);
      }
      g.box(c, at(0.3, 2.3, 0), [0.08, 0.7, 2.6], r);
      g.box('#f6efe2', at(0.25, 2.3, 0), [0.02, 0.18, 1.8], r);
      // bag scale
      g.box('#8d8d8d', at(-0.2, 0.15, 1.75), [0.7, 0.3, 0.6], r);
      break;
    }
    case 'scanner': {
      // walk-through metal detector + X-ray belt beside it (along local z)
      g.box('#b9bec4', at(0, 1.1, -0.45), [0.12, 2.2, 0.12], r);
      g.box('#b9bec4', at(0, 1.1, 0.45), [0.12, 2.2, 0.12], r);
      g.box('#9aa1a8', at(0, 2.25, 0), [0.16, 0.18, 1.04], r);
      g.box('#2fa36b', at(0.09, 2.25, 0), [0.02, 0.06, 0.3], r);
      g.box('#5c6670', at(-1.2, 0.45, 0), [0.6, 0.9, 2.6], r);
      g.box('#22282c', at(-1.2, 0.92, 0), [0.62, 0.04, 2.62], r);
      g.box('#3b4148', at(-1.2, 1.15, 0.1), [0.66, 0.5, 0.9], r);
      break;
    }
    case 'gatedesk': {
      const c = p.color ?? '#1f6f4a';
      g.box('#e8e6e0', at(0, 0.55, 0), [0.7, 1.1, 1.5], r);
      g.box(c, at(-0.36, 0.55, 0), [0.02, 0.9, 1.4], r);
      g.box('#22282c', at(0.1, 1.3, 0.3), [0.06, 0.3, 0.44], r);
      // gate sign on a post
      g.box('#2a2622', at(0.1, 1.5, -0.95), [0.08, 3.0, 0.08], r);
      g.box(c, at(0.1, 2.9, -0.95), [0.1, 0.5, 1.1], r);
      g.box('#f2b705', at(0.06, 2.9, -0.95), [0.02, 0.16, 0.6], r);
      break;
    }
    case 'stanchion': {
      // two queue posts joined by a retractable belt
      for (const lz of [-1.2, 1.2]) {
        g.cylinder('#9aa1a8', at(0, 0.48, lz), 0.03, 0.03, 0.96, 6);
        g.cylinder('#5c6670', at(0, 0.02, lz), 0.16, 0.16, 0.04, 8);
      }
      g.box('#c0392b', at(0, 0.9, 0), [0.02, 0.06, 2.4], r);
      break;
    }
    case 'car': {
      const c = p.color ?? '#c0392b';
      g.box(c, at(0, 0.62, 0), [1.7, 0.6, 4.1], r);
      g.box(c, at(0, 1.12, -0.25), [1.5, 0.5, 2.1], r);
      g.box('#22282c', at(0, 1.13, -0.25), [1.52, 0.38, 1.9], r);
      g.box('#3b3b3b', at(0, 0.42, 2.06), [1.7, 0.18, 0.1], r);
      g.box('#3b3b3b', at(0, 0.42, -2.06), [1.7, 0.18, 0.1], r);
      for (const [lx, lz] of [[0.8, 1.35], [-0.8, 1.35], [0.8, -1.35], [-0.8, -1.35]]) g.cylinder('#1a1a1a', at(lx, 0.34, lz), 0.34, 0.34, 0.24, 10, [0, r, Math.PI / 2]);
      break;
    }
    case 'plane': {
      // a twin-engine airliner parked on the apron, nose toward local +z.
      // Cylinders lie along the plane's axis with rot [±π/2, 0, -r] (Euler XYZ applies Z first, then X).
      const body = '#f4f2ee';
      const tail = p.color ?? '#1f6f4a';
      const along: [number, number, number] = [Math.PI / 2, 0, -r];
      g.cylinder(body, at(0, 3.2, 0), 1.8, 1.8, 30, 14, along);
      g.ellipsoid(body, at(0, 3.2, 15), 1.8, [1, 1, 1.7], [12, 8], [0, r, 0]);
      g.cylinder(body, at(0, 3.6, -17), 0.6, 1.75, 5, 12, [-Math.PI / 2, 0, -r]);
      g.boxR('#22282c', at(0, 3.85, 16.2), [1.6, 0.42, 0.8], [0, r, 0]);
      for (let lz = -12; lz < 13; lz += 1.6) for (const side of [-1, 1]) g.boxR('#2a3640', at(side * 1.79, 3.7, lz), [0.04, 0.32, 0.5], [0, r, 0]);
      g.boxR(tail, at(0, 3.0, 0), [3.64, 0.35, 30.2], [0, r, 0]);
      // wings, engines, stabilisers, tail fin
      for (const side of [-1, 1]) {
        g.boxR('#dcdad5', at(side * 8.5, 2.6, -1.5), [15, 0.35, 4.2], [0, r + side * 0.32, 0]);
        g.cylinder('#cfcdc8', at(side * 5.4, 1.65, 1.2), 0.95, 0.95, 3.4, 12, along);
        g.cylinder('#22282c', at(side * 5.4, 1.65, 2.95), 0.75, 0.75, 0.1, 12, along);
        g.boxR('#dcdad5', at(side * 3.4, 3.9, -16.2), [5.6, 0.2, 2.2], [0, r + side * 0.3, 0]);
      }
      g.boxR(tail, at(0, 7.2, -17.2), [0.35, 6.2, 3.6], [0, r, 0]);
      g.boxR(tail, at(0, 5.0, -15.4), [0.3, 1.8, 2.2], [0, r, 0]);
      g.box('#2a2622', at(0, 0.9, 12), [0.25, 1.8, 0.25]);
      for (const side of [-1, 1]) g.box('#2a2622', at(side * 2.6, 0.9, -1.5), [0.3, 1.8, 0.3]);
      break;
    }
    case 'pole': {
      g.cylinder('#5b4636', at(0, 4, 0), 0.1, 0.14, 8, 6);
      g.box('#4a3a2c', at(0, 7.6, 0), [1.4, 0.1, 0.1]);
      break;
    }
    case 'safaritruck':
      safariTruck(g, at, r, p.color);
      break;
    case 'staff': {
      // a tall granite staff, tapering, studded with a spiral of iron nails, on a low plinth inside a small railing
      g.box('#9a958c', at(0, 0.15, 0), [1.6, 0.3, 1.6], r);
      for (let i = 0; i < 6; i++) g.box(shade('#8e8a82', i * 0.01), at(0, 0.3 + 0.45 + i * 0.9, 0), [0.62 - i * 0.05, 0.92, 0.48 - i * 0.035], r);
      g.box('#8e8a82', at(0, 5.75, 0), [0.32, 0.3, 0.24], r);
      for (let k = 0; k < 40; k++) {
        const y = 0.6 + k * 0.12;
        const a = k * 0.9;
        const w = 0.31 - (y / 5.6) * 0.14;
        g.box('#3a302a', at(Math.sin(a) * w, y, Math.cos(a) * w * 0.78), [0.06, 0.06, 0.06], r);
      }
      for (const [rx, rz] of [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]]) g.box('#2a2a2a', at(rx, 0.5, rz), [0.06, 1.0, 0.06], r);
      for (const sx of [-1, 1]) {
        g.box('#2a2a2a', at(sx * 1.4, 0.9, 0), [0.04, 0.04, 2.8], r);
        g.box('#2a2a2a', at(0, 0.9, sx * 1.4), [2.8, 0.04, 0.04], r);
      }
      break;
    }
    case 'cattle': {
      // a ranch herd: long-horned cattle, mostly white, grazing in a loose group
      const rnd = seeded(p.id);
      for (let i = 0; i < 5; i++) cow(g, scaled(at, (rnd() - 0.5) * 8, (rnd() - 0.5) * 6, 0.9 + rnd() * 0.15), r + (rnd() - 0.5) * 2.4, i === 2 ? '#8a5a3a' : i === 4 ? '#3a302a' : '#efe9dc');
      break;
    }
    case 'fence': {
      // ten metres of post-and-rail along the prop's local z
      for (let z = -5; z <= 5.01; z += 2.5) g.box('#7a5a3a', at(0, 0.6, z), [0.12, 1.2, 0.12], r);
      for (const y of [0.5, 0.95]) g.box('#8a6a48', at(0, y, 0), [0.06, 0.1, 10], r);
      break;
    }
    case 'cablestation': {
      // the upper station at the plateau edge: a canopy over two bullwheels, a cabin waiting, and the haul ropes
      // dropping away north over the edge into the mist
      for (const sx of [-1, 1]) for (const sz of [-2.5, 2.5]) g.box('#b8b4aa', at(sx * 3.4, 3, sz), [0.5, 6, 0.5], r);
      g.box('#d8d4ca', at(0, 6.2, 0), [7.6, 0.4, 6.4], r);
      g.box('#c0392b', at(0, 6.55, 0), [7.2, 0.3, 6], r);
      for (const sx of [-1.6, 1.6]) g.cylinder('#3a3a3a', at(sx, 5.6, -1.5), 1.1, 1.1, 0.2, 14);
      // (drawn for a station facing north, as at the end of a street: the ropes run off along -z)
      for (const sx of [-1.6, 1.6]) {
        const [x0, , z0] = at(sx, 0, -3);
        g.boxR('#202020', [x0, 5.0 - 30, z0 - 35], [0.05, 0.05, Math.hypot(70, 60)], [-Math.atan2(60, 70), 0, 0]);
      }
      cabin(g, (x, y, z) => at(x + 1.6, y + 1.8, z - 1.2), r, '#c0392b');
      break;
    }
    // wildlife: each prop is a small group, spread around its position
    case 'elephant': {
      const herd: [number, number, number, number][] = [[0, 0, 1, 0], [3.2, -1.4, 0.95, 0.5], [1.4, 1.6, 0.55, 0.2]];
      for (const [ox, oz, k, turn] of herd) elephant(g, scaled(at, ox, oz, k), r + turn);
      break;
    }
    case 'antelope': {
      const rnd = seeded(p.id);
      for (let i = 0; i < 5; i++) antelope(g, scaled(at, (rnd() - 0.5) * 7, (rnd() - 0.5) * 6, 0.85 + rnd() * 0.25), r + (rnd() - 0.5) * 1.6, p.color);
      break;
    }
    case 'baboon': {
      const rnd = seeded(p.id);
      for (let i = 0; i < 5; i++) baboon(g, scaled(at, (rnd() - 0.5) * 5, (rnd() - 0.5) * 4, i === 4 ? 0.6 : 0.9 + rnd() * 0.2), r + (rnd() - 0.5) * 3, i % 2 === 0);
      break;
    }
    case 'warthog': {
      for (const [ox, oz, k] of [[0, 0, 1], [1.3, -0.9, 0.6], [-1.1, -1.2, 0.55]] as const) warthog(g, scaled(at, ox, oz, k), r);
      break;
    }
    case 'buffalo': {
      const rnd = seeded(p.id);
      for (let i = 0; i < 4; i++) buffalo(g, scaled(at, (rnd() - 0.5) * 7, (rnd() - 0.5) * 5, 0.9 + rnd() * 0.2), r + (rnd() - 0.5) * 1.2);
      break;
    }
    case 'hippo': {
      for (const [ox, oz, k, turn] of [[0, 0, 1, 0], [2.6, 1.2, 0.9, 0.8], [-2.2, 1.6, 0.7, -0.6]] as const) hippo(g, scaled(at, ox, oz, k), r + turn);
      break;
    }
    case 'acacia': {
      const rnd = seeded(p.id);
      g.cylinder('#5b4a3a', at(0, 1.6, 0), 0.12, 0.2, 3.2, 6);
      for (const sx of [-1, 1]) g.cylinder('#5b4a3a', at(sx * 0.6, 3.3, 0), 0.07, 0.1, 1.4, 5);
      g.blob(rnd() > 0.5 ? '#6f8a3a' : '#7a9145', at(0, 4.1, 0), 2.6, [1.4, 0.28, 1.2]);
      g.blob('#62803a', at(0.9, 3.9, 0.4), 1.6, [1.3, 0.3, 1.1]);
      break;
    }
    case 'baobab': {
      g.cylinder('#8d7b68', at(0, 3, 0), 1.0, 1.35, 6, 9);
      for (const [bx, bz] of [[1, 0], [-0.8, 0.6], [0.2, -1], [-0.4, -0.7]]) {
        g.cylinder('#857262', at(bx * 1.3, 6.6, bz * 1.3), 0.18, 0.32, 1.8, 6);
        g.blob('#6f8a4a', at(bx * 1.8, 7.6, bz * 1.8), 0.9, [1.3, 0.6, 1.3]);
      }
      break;
    }
    case 'stream': {
      // a spring's stream: twenty metres of shallow water in a stony bed, along the prop's local z
      const water = p.color ?? '#6aa9b2';
      g.box('#b9ab88', at(0, 0.03, 0), [2.6, 0.06, 20], r);
      g.box(water, at(0, 0.07, 0), [1.6, 0.04, 20], r);
      const rnd = seeded(p.id);
      for (let i = 0; i < 9; i++) g.blob('#8a8379', at((rnd() > 0.5 ? 1 : -1) * (1.0 + rnd() * 0.3), 0.15, -9 + i * 2.2), 0.35 + rnd() * 0.2, [1.3, 0.6, 1]);
      break;
    }
    case 'steam': {
      // warm water's breath: a few pale puffs hanging low over it
      const rnd = seeded(p.id);
      for (let i = 0; i < 9; i++) g.blob(i % 2 ? '#f4f6f4' : '#eceeec', at((rnd() - 0.5) * 4, 1.2 + rnd() * 1.4, (rnd() - 0.5) * 9), 0.22 + rnd() * 0.22, [1.4, 0.7, 1.4]);
      break;
    }
    case 'spring': {
      // a clear warm pool fed from under the rocks: sandy rim, turquoise water, a few steps down from the path
      g.box('#d8c9a2', at(0, 0.04, 0), [7.4, 0.08, 14.4], r);
      // the water's colour can be set (a cold spring is bluer than a warm one)
      const water = p.color ?? '#5fc2bc';
      g.box(water, at(0, 0.09, 0), [6.2, 0.04, 13.2], r);
      g.box(shade(water, 0.18), at(0.6, 0.1, -2), [3.2, 0.03, 5], r);
      for (let i = 0; i < 3; i++) g.box('#c9b98f', at(-3.4 + i * 0.35, 0.2 - i * 0.05, 4.5), [0.35, 0.12, 2.4], r);
      for (const [rx, rz] of [[2.9, -6.6], [-2.8, -6.2], [3.2, 2.4], [-3.3, -1.5]]) g.blob('#8a8379', at(rx, 0.3, rz), 0.7, [1.3, 0.6, 1]);
      break;
    }
  }
}

/** A cable-car cabin: floor at y 0, hanger arm up to the haul rope at y 3.2. Front faces +z. */
function cabin(g: ColorGeometryBuilder, at: (x: number, y: number, z: number) => [number, number, number], r: number, color = '#c0392b') {
  g.box(color, at(0, 0.2, 0), [1.9, 0.4, 2.3], r);
  g.box('#9fbccb', at(0, 1.05, 0), [1.92, 1.0, 2.32], r); // the window band
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.box(color, at(sx * 0.92, 1.05, sz * 1.12), [0.1, 1.0, 0.1], r);
  g.box(color, at(0, 1.72, 0), [1.9, 0.36, 2.3], r);
  g.box(shade(color, -0.15), at(0, 1.95, 0), [1.6, 0.12, 2.0], r);
  g.box('#5a5a5a', at(0, 2.6, 0), [0.12, 1.2, 0.12], r); // hanger
  g.box('#4a4a4a', at(0, 3.2, 0), [0.3, 0.3, 0.7], r); // grip on the rope
  g.box('#7a5a3a', at(0, 0.48, -0.75), [1.6, 0.1, 0.45], r); // bench
}

/** Just the cabin, for the ride (scene/Drive.tsx). */
export function cableCabinGeometry(color?: string): THREE.BufferGeometry {
  const g = new ColorGeometryBuilder();
  cabin(g, placer(0, 0, 0), 0, color);
  return g.build();
}

function cow(g: ColorGeometryBuilder, a: Scaled, r: number, c: string) {
  const k = a.k;
  g.ellipsoid(c, a(0, 1.05, 0), 0.6 * k, [0.8, 0.85, 1.55], [10, 7], [0, r, 0]);
  legs(g, a, shade(c, -0.12), 0.26, 0.55, -0.55, 0.8, 0.08);
  g.ellipsoid(c, a(0, 1.1, 1.05), 0.26 * k, [0.85, 0.9, 1.4], [8, 6], [0, r, 0]);
  g.ellipsoid(shade(c, -0.05), a(0, 1.5, 0.35), 0.25 * k, [0.9, 0.7, 1.0], [6, 5], [0, r, 0]); // hump
  for (const sx of [-1, 1]) g.box('#e8dcc0', a(sx * 0.3, 1.5, 0.98), [0.5 * k, 0.07 * k, 0.07 * k], r + sx * 0.4);
  for (const sx of [-1, 1]) g.box('#e8dcc0', a(sx * 0.5, 1.75, 0.98), [0.07 * k, 0.5 * k, 0.07 * k], r);
}

/** Wraps a placer so a group member at (ox, oz) can be drawn at scale k with its own local coordinates. */
function scaled(at: ReturnType<typeof placer>, ox: number, oz: number, k: number) {
  const f = (lx: number, ly: number, lz: number) => at(ox + lx * k, ly * k, oz + lz * k);
  f.k = k;
  f.ox = ox;
  f.oz = oz;
  return f;
}
type Scaled = ReturnType<typeof scaled>;

/** An open game-viewing truck: cab in front (+z), three raised benches under a canvas roof. */
function safariTruck(g: ColorGeometryBuilder, at: (x: number, y: number, z: number) => [number, number, number], r: number, color = '#8c9a5a') {
  g.box('#2a2a2a', at(0, 0.78, 0), [1.9, 0.3, 6.0], r);
  g.box(color, at(0, 1.25, 2.55), [2.1, 0.75, 1.2], r); // bonnet
  g.box(color, at(0, 1.6, 1.6), [2.2, 1.45, 0.9], r); // cab
  g.box('#22282c', at(0, 1.95, 2.06), [1.9, 0.6, 0.04], r); // windscreen
  g.box('#22282c', at(0, 1.25, 3.16), [1.4, 0.4, 0.04], r); // grille
  for (const lx of [0.75, -0.75]) g.box('#fff6d0', at(lx, 1.3, 3.17), [0.26, 0.2, 0.03], r);
  g.box(color, at(0, 1.12, -1.3), [2.3, 0.22, 4.6], r); // bed
  for (const sx of [-1, 1]) g.box(shade(color, -0.12), at(sx * 1.13, 1.42, -1.3), [0.06, 0.4, 4.6], r);
  g.box(shade(color, -0.12), at(0, 1.42, -3.58), [2.3, 0.4, 0.06], r);
  for (const [bz, by] of [[0.6, 1.62], [-0.9, 1.76], [-2.4, 1.9]]) {
    g.box('#7a5a3a', at(0, by, bz), [2.0, 0.1, 0.5], r);
    g.box('#7a5a3a', at(0, by + 0.3, bz - 0.27), [2.0, 0.5, 0.07], r);
    g.box('#4a3a2c', at(0, (by + 1.2) / 2, bz), [1.8, by - 1.2, 0.08], r);
  }
  for (const sx of [-1, 1]) for (const pz of [1.1, -3.5]) g.box('#3a3a3a', at(sx * 1.1, 2.45, pz), [0.07, 2.4, 0.07], r);
  g.box('#c8b88a', at(0, 3.68, -1.2), [2.4, 0.07, 4.9], r);
  g.cylinder('#1a1a1a', at(0, 1.6, -3.75), 0.42, 0.42, 0.25, 10, [Math.PI / 2, r, 0]); // spare wheel
  for (const [lx, lz] of [[0.95, 2.3], [-0.95, 2.3], [0.95, -1.9], [-0.95, -1.9]]) {
    g.cylinder('#1a1a1a', at(lx, 0.5, lz), 0.5, 0.5, 0.34, 12, [0, r, Math.PI / 2]);
    g.cylinder('#8a8a7a', at(lx * 1.04, 0.5, lz), 0.22, 0.22, 0.35, 8, [0, r, Math.PI / 2]);
  }
}

function legs(g: ColorGeometryBuilder, a: Scaled, color: string, x: number, zf: number, zb: number, h: number, rad: number) {
  for (const lx of [x, -x]) for (const lz of [zf, zb]) g.cylinder(color, a(lx, h / 2, lz), rad * a.k, rad * a.k * 0.85, h * a.k, 6);
}

function elephant(g: ColorGeometryBuilder, a: Scaled, r: number) {
  const c = '#8a847c';
  const k = a.k;
  g.ellipsoid(c, a(0, 2.15, 0), 1.0 * k, [1.05, 1.0, 1.55], [12, 9], [0, r, 0]);
  legs(g, a, shade(c, -0.05), 0.5, 0.85, -0.85, 1.6, 0.3);
  g.ellipsoid(c, a(0, 2.55, 1.55), 0.62 * k, [0.95, 1.0, 0.9], [10, 8], [0, r, 0]);
  for (const sx of [-1, 1]) g.ellipsoid(shade(c, -0.08), a(sx * 0.62, 2.55, 1.3), 0.7 * k, [0.12, 1.0, 0.8], [8, 6], [0, r, 0]);
  g.cylinder(shade(c, -0.04), a(0, 1.55, 2.0), 0.14 * k, 0.2 * k, 1.5 * k, 6);
  for (const sx of [-1, 1]) g.box('#efe6d0', a(sx * 0.22, 1.95, 2.0), [0.08 * k, 0.08 * k, 0.6 * k], r);
  g.cylinder(shade(c, -0.1), a(0, 1.7, -1.6), 0.04 * k, 0.05 * k, 1.0 * k, 4);
}

function antelope(g: ColorGeometryBuilder, a: Scaled, r: number, color = '#c99a5c') {
  const k = a.k;
  g.ellipsoid(color, a(0, 1.05, 0), 0.5 * k, [0.62, 0.72, 1.35], [10, 7], [0, r, 0]);
  g.ellipsoid('#efe3cc', a(0, 0.9, 0), 0.42 * k, [0.55, 0.4, 1.1], [8, 6], [0, r, 0]);
  legs(g, a, shade(color, -0.15), 0.18, 0.45, -0.45, 0.85, 0.05);
  g.cylinder(color, a(0, 1.45, 0.55), 0.09 * k, 0.13 * k, 0.6 * k, 6);
  g.ellipsoid(color, a(0, 1.78, 0.68), 0.17 * k, [0.8, 0.9, 1.5], [8, 6], [0, r, 0]);
  for (const sx of [-1, 1]) g.cylinder('#3a2e24', a(sx * 0.06, 2.08, 0.62), 0.015 * k, 0.03 * k, 0.4 * k, 4);
}

function baboon(g: ColorGeometryBuilder, a: Scaled, r: number, sitting: boolean) {
  const c = '#7d6c4f';
  const k = a.k;
  if (sitting) {
    g.ellipsoid(c, a(0, 0.38, 0), 0.32 * k, [1, 1.25, 0.95], [8, 6], [0, r, 0]);
    g.sphere(c, a(0, 0.82, 0.08), 0.17 * k);
    g.ellipsoid('#4d4033', a(0, 0.78, 0.22), 0.08 * k, [0.8, 0.8, 1.4], [6, 5], [0, r, 0]);
  } else {
    g.ellipsoid(c, a(0, 0.5, 0), 0.34 * k, [0.6, 0.62, 1.15], [8, 6], [0, r, 0]);
    legs(g, a, shade(c, -0.1), 0.13, 0.25, -0.25, 0.42, 0.045);
    g.sphere(c, a(0, 0.66, 0.42), 0.15 * k);
    g.cylinder(c, a(0, 0.6, -0.55), 0.03 * k, 0.03 * k, 0.6 * k, 4);
  }
}

function warthog(g: ColorGeometryBuilder, a: Scaled, r: number) {
  const c = '#5e4c3f';
  const k = a.k;
  g.ellipsoid(c, a(0, 0.48, 0), 0.4 * k, [0.7, 0.75, 1.4], [8, 6], [0, r, 0]);
  legs(g, a, shade(c, -0.1), 0.17, 0.3, -0.3, 0.32, 0.05);
  g.ellipsoid(c, a(0, 0.42, 0.62), 0.24 * k, [0.85, 0.8, 1.2], [8, 6], [0, r, 0]);
  g.box('#3a2e24', a(0, 0.68, 0.1), [0.08 * k, 0.12 * k, 0.8 * k], r);
  for (const sx of [-1, 1]) g.box('#efe6d0', a(sx * 0.13, 0.42, 0.84), [0.04 * k, 0.16 * k, 0.04 * k], r);
}

function buffalo(g: ColorGeometryBuilder, a: Scaled, r: number) {
  const c = '#5a3a28';
  const k = a.k;
  g.ellipsoid(c, a(0, 1.15, 0), 0.72 * k, [0.92, 0.95, 1.5], [10, 7], [0, r, 0]);
  legs(g, a, shade(c, -0.1), 0.32, 0.6, -0.6, 0.85, 0.1);
  g.ellipsoid(c, a(0, 1.1, 1.2), 0.34 * k, [0.9, 0.95, 1.1], [8, 6], [0, r, 0]);
  g.box('#2e2620', a(0, 1.42, 1.18), [0.95 * k, 0.1 * k, 0.12 * k], r);
}

function hippo(g: ColorGeometryBuilder, a: Scaled, r: number) {
  const c = '#6b5a5e';
  const k = a.k;
  g.ellipsoid(c, a(0, -0.05, 0), 0.9 * k, [0.9, 0.5, 1.5], [10, 6], [0, r, 0]);
  g.ellipsoid(c, a(0, 0.12, 1.3), 0.42 * k, [1.1, 0.55, 1.0], [8, 6], [0, r, 0]);
  for (const sx of [-1, 1]) {
    g.sphere(shade(c, -0.1), a(sx * 0.22, 0.38, 1.05), 0.09 * k);
    g.sphere(shade(c, -0.15), a(sx * 0.3, 0.42, 0.9), 0.06 * k);
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
  const style = pack.road.style ?? 'asphalt';
  if (style === 'sand') {
    // beach: driftwood and rocks close each end; nothing else on the sand
    const rnd = seeded(pack.id + 'rocks');
    for (const end of [-1, 1]) {
      if (pack.backdrop === 'reserve') continue; // a camp road runs on into the bush instead
      for (let x = -8; x < 11; x += 0.9 + rnd() * 0.7) {
        g.blob(rnd() > 0.5 ? '#8a8379' : '#a39b8e', [x, 0.3, end * (L - 1.4 + rnd() * 1.2)], 0.45 + rnd() * 0.45, [1.2, 0.7, 1]);
      }
    }
    return;
  }
  if (style === 'paved') {
    // market lane: low kerbs, colourful bunting strung between the buildings
    for (const side of [-1, 1]) g.box('#c9bfac', [side * (hw + 0.18), 0.05, 0], [0.3, 0.1, length]);
    const flags = ['#f2b705', '#1f6f4a', '#e4572e', '#2c5f9e', '#f4f0e6', '#7a3b72'];
    const span = (hw + sw) * 2 + 0.6;
    for (let z = -L + 6, k = 0; z < L - 3; z += 8, k++) {
      g.box('#2a2622', [0, 4.6, z], [span, 0.02, 0.02]);
      for (let x = -span / 2 + 0.3, i = 0; x < span / 2; x += 0.55, i++) {
        const sag = 0.35 * (1 - Math.pow((2 * x) / span, 2));
        g.boxR(flags[(i + k) % flags.length], [x, 4.42 - sag, z], [0.3, 0.32, 0.01], [0, 0, Math.PI / 4]);
      }
    }
    for (const end of [-1, 1]) {
      const z = end * (L - 1.6);
      for (let x = -hw - sw + 0.6, i = 0; x < hw + sw; x += 1.25, i++) g.box(i % 2 ? '#f4f0e6' : '#d8452b', [x, 0.42, z], [1.15, 0.84, 0.5]);
    }
    return;
  }
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
  // street-end barriers (not across a cable-car station or a climb's gate at the north end)
  for (const end of [-1, 1]) {
    if (end === -1 && (pack.openNorth || pack.cable || pack.cableStation || pack.climbs?.length)) continue;
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

function backdrop(g: ColorGeometryBuilder, pack: DestinationPack) {
  const rnd = seeded('backdrop' + pack.id);
  const seaSide = !!pack.sea;
  const tones = ['#c9a98a', '#b99c84', '#d4b896', '#a98f7a', '#bfa58e'];
  if (pack.backdrop === 'reserve') {
    reserveBeyond(g, pack, rnd);
    return;
  }
  if (pack.backdrop === 'rainforest' || pack.backdrop === 'highland') {
    countryside(g, pack, rnd);
    if (pack.cable) cableway(g, pack.cable.ride.track, pack.cable.ride.heights ?? [], rnd);
    const climb = pack.climbs?.[0]?.ride;
    if (climb) waterfallHill(g, climb, rnd);
    if (pack.backdrop === 'highland') plateauEdge(g, pack, rnd);
    return;
  }
  // behind both rows
  for (const side of [-1, 1]) {
    if (seaSide && side === 1) continue;
    for (let z = -50; z < 50; z += 6 + rnd() * 4) {
      const h = 6 + rnd() * 14;
      const x = side * (19 + rnd() * 8);
      g.box(tones[Math.floor(rnd() * tones.length)], [x, h / 2, z], [6 + rnd() * 4, h, 5 + rnd() * 3]);
    }
  }
  const airfield = pack.backdrop === 'airfield' || pack.backdrop === 'railway';
  if (pack.backdrop === 'airfield') airfieldBeyond(g, pack);
  if (pack.backdrop === 'railway') railwayBeyond(g, pack);
  // street ends: a near row closing the view, and a taller far row for depth
  for (const end of [-1, 1]) {
    if (airfield && end === -1) continue; // the airfield (or the railway) is open beyond the north fence
    if (pack.vista === 'north' && end === -1) {
      if (pack.vistaStyle === 'roofs') roofscape(g, rnd);
      else if (pack.vistaStyle === 'forest') forest(g, rnd);
      else if (pack.vistaStyle === 'moat') moat(g, rnd);
      else if (pack.vistaStyle === 'escarpment') escarpment(g, rnd);
      else if (pack.vistaStyle === 'boulders') boulders(g, rnd);
      else if (pack.vistaStyle === 'citywall') cityWall(g, rnd);
      else openCountry(g, rnd);
      continue;
    }
    const maxX = seaSide ? 6 : 30;
    for (let x = -30; x < maxX; ) {
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
    for (let x = -34; x < (seaSide ? 6 : 34); x += 5 + rnd() * 4) {
      const h = 12 + rnd() * 14;
      g.box(tones[Math.floor(rnd() * tones.length)], [x, h / 2, end * (58 + rnd() * 6)], [5 + rnd() * 3, h, 6]);
    }
  }
  // a distant tower, for skyline character (not where the view north is kept open)
  if (pack.vista !== 'north') {
    g.box('#b7a593', [-30, 22, -78], [8, 44, 8]);
    g.box('#c4b19c', [26, 16, -84], [10, 32, 9]);
  }
}

/**
 * A camp in a game reserve: bush instead of city blocks on every side, and to the north the savanna running down to a
 * river with gallery forest, the game-drive track worn into the grass (from the pack's ride), and low hills far off.
 * The camp gate stands where the track leaves the street.
 */
function reserveBeyond(g: ColorGeometryBuilder, pack: DestinationPack, rnd: () => number) {
  const greens = ['#7f9a46', '#8aa150', '#718f42'];
  const L = pack.road.length / 2;
  // bush behind both rows and beyond the south end
  for (let i = 0; i < 46; i++) {
    const side = i % 2 ? 1 : -1;
    const x = side * (17 + rnd() * 22);
    const z = -40 + rnd() * 90;
    g.cylinder('#5b4a3a', [x, 1.5, z], 0.14, 0.22, 3, 6);
    g.blob(greens[i % 3], [x, 3.6, z], 1.8 + rnd() * 1.2, [1.4, 0.4, 1.2]);
  }
  for (let x = -40; x < 40; x += 4 + rnd() * 4) {
    g.cylinder('#5b4a3a', [x, 1.5, L + 6 + rnd() * 10], 0.14, 0.22, 3, 6);
    g.blob(greens[Math.floor(rnd() * 3)], [x, 3.4, L + 6 + rnd() * 10], 2 + rnd(), [1.4, 0.45, 1.2]);
  }
  // dry grass to the north, a darker band of grass along the river, the river and its forest
  g.box('#c0b277', [0, 0.004, -76], [200, 0.01, 66]);
  g.box('#a3a862', [0, 0.008, -86], [200, 0.01, 10]);
  for (let x = -100; x < 100; x += 8) {
    const z = -92 + Math.sin(x * 0.07) * 2.2;
    g.box('#6aa3a6', [x + 4, 0.02, z], [8.6, 0.02, 5.4]);
    for (let i = 0; i < 2; i++) {
      const tx = x + rnd() * 8;
      const tz = z - 4.5 - rnd() * 6;
      g.cylinder('#4a3a2c', [tx, 2.2, tz], 0.2, 0.3, 4.4, 6);
      g.blob(['#5a8a42', '#66944a', '#527f3c'][i], [tx, 5.6, tz], 2.4 + rnd() * 1.2, [1.2, 0.8, 1.2]);
    }
  }
  g.box('#8f9a5e', [0, 0.004, -103], [200, 0.01, 16]);
  // low hills on the horizon
  for (let x = -100; x < 100; x += 14 + rnd() * 10) g.blob('#7d8a5a', [x, -2, -108 - rnd() * 2], 10 + rnd() * 6, [1.6, 0.6, 0.6]);
  // the track, worn into the grass
  const ride = pack.events?.find((e) => e.ride)?.ride;
  if (ride) {
    for (let i = 1; i < ride.track.length; i++) {
      let [ax, az] = ride.track[i - 1];
      let [bx, bz] = ride.track[i];
      // only the part beyond the camp gate (the camp road is already dirt)
      if (az > -L && bz > -L) continue;
      if (az > -L) [ax, az] = [ax + ((bx - ax) * (az + L)) / (az - bz), -L];
      if (bz > -L) [bx, bz] = [bx + ((ax - bx) * (bz + L)) / (bz - az), -L];
      const len = Math.hypot(bx - ax, bz - az);
      const ends = az === -L || bz === -L ? 0 : 2.4; // round the bends; stop clean at the gate
      g.box('#c2a273', [(ax + bx) / 2, 0.012, (az + bz) / 2], [2.4, 0.012, len + ends], Math.atan2(bx - ax, bz - az));
    }
  }
  // scattered acacias and a baobab or two, kept off the track
  for (let i = 0; i < 34; i++) {
    const x = -80 + rnd() * 160;
    const z = -48 - rnd() * 34;
    if (Math.abs(x) < 7 && z > -60) continue;
    if (ride && distToSegments(ride.track, x, z) < 4) continue;
    g.cylinder('#5b4a3a', [x, 1.6, z], 0.12, 0.2, 3.2, 6);
    g.blob(greens[i % 3], [x, 4.0, z], 2.2 + rnd() * 0.8, [1.4, 0.28, 1.2]);
  }
  // the camp gate: two timber posts and a crossbeam, high enough for the truck
  for (const sx of [-1, 1]) g.box('#6a4a30', [sx * 5.2, 2.6, -L + 0.4], [0.4, 5.2, 0.4]);
  g.box('#6a4a30', [0, 5.0, -L + 0.4], [11, 0.5, 0.45]);
  g.box('#c8b88a', [0, 5.65, -L + 0.4], [4.6, 0.8, 0.12]);
}

/**
 * No city around: rainforest (tall trees close in) at the foot of a mountain, or open highland (rolling grass, a few
 * pines) on top of one — on both sides and beyond the south end.
 */
function countryside(g: ColorGeometryBuilder, pack: DestinationPack, rnd: () => number) {
  const L = pack.road.length / 2;
  const forest = pack.backdrop === 'rainforest';
  const greens = forest ? ['#4a7a3c', '#558a44', '#3f7036', '#5e9048'] : ['#7fa25a', '#8fae62', '#9ab86c'];
  const spots: [number, number][] = [];
  for (let i = 0; i < (forest ? 60 : 30); i++) spots.push([(i % 2 ? 1 : -1) * (16 + rnd() * 26), -L + rnd() * (2 * L + 10)]);
  for (let x = -40; x < 40; x += 5 + rnd() * 4) spots.push([x, L + 5 + rnd() * 12]);
  for (const [x, z] of spots) {
    if (forest) {
      const h = 8 + rnd() * 6;
      g.cylinder('#5a4a3a', [x, h / 2, z], 0.25, 0.4, h, 6);
      g.blob(greens[Math.floor(rnd() * greens.length)], [x, h + 1, z], 3 + rnd() * 1.6, [1.2, 0.7, 1.2]);
    } else {
      g.blob(greens[Math.floor(rnd() * greens.length)], [x, -2, z], 8 + rnd() * 6, [1.4, 0.45, 1.2]);
      if (rnd() > 0.6) {
        g.cylinder('#4a3a2c', [x * 0.9, 2.5, z], 0.15, 0.22, 5, 6);
        g.cone('#2f5a3a', [x * 0.9, 6.2, z], 1.6, 5.5, 7);
      }
    }
  }
}

/** Terrain height under a cable at z: well below the cabin (room for the forest), never below the ground. */
function slopeAt(track: [number, number][], heights: number[], z: number): number {
  if (z >= track[0][1]) return 0;
  for (let i = 1; i < track.length; i++) {
    const [, z0] = track[i - 1];
    const [, z1] = track[i];
    if (z <= z0 && z >= z1) {
      const k = (z0 - z) / (z0 - z1 || 1);
      return Math.max(0, heights[i - 1] + (heights[i] - heights[i - 1]) * k - 12);
    }
  }
  return Math.max(0, heights[heights.length - 1] - 1);
}

/**
 * A cable car running straight up the mountain north of the street: the forested slope rising under it in steps,
 * pylons at each bend of the profile, two haul ropes, the lower station at the street end and the upper one at the
 * top, where the plateau's grassland disappears into mist.
 */
function cableway(g: ColorGeometryBuilder, track: [number, number][], heights: number[], rnd: () => number) {
  const x = track[0][0];
  const zTop = track[track.length - 1][1];
  // the slope, in 3 m terraces, with forest on each
  for (let z = -44; z > -110; z -= 3) {
    const h = slopeAt(track, heights, z - 1.5);
    if (h <= 0.2) continue;
    const top = z < zTop;
    g.box(top ? '#7f9c58' : shade('#4a7a3c', (rnd() - 0.5) * 0.1), [0, h / 2, z - 1.5], [220, h, 3.05]);
    if (top) continue;
    for (let tx = -100; tx < 100; tx += 7 + rnd() * 6) {
      if (Math.abs(tx - x - 1.5) < 4) continue; // the ropes' corridor is kept clear
      g.blob(['#4a7a3c', '#558a44', '#3f7036'][Math.floor(rnd() * 3)], [tx, h + 1.6, z - 1.5], 2.6 + rnd() * 1.4, [1.2, 0.8, 1.2]);
    }
  }
  // a waterfall down the escarpment, west of the line
  const fz = -66;
  const fh = slopeAt(track, heights, fz);
  g.box('#e6f2f4', [x - 14, fh / 2 + 0.6, fz + 1.6], [1.6, fh + 1.2, 0.3]);
  g.blob('#e6f2f4', [x - 14, 0.4, fz + 2.6], 1.6, [1.4, 0.4, 1]);
  // mist on the top edge
  for (let i = 0; i < 14; i++) {
    const h = heights[heights.length - 1];
    g.blob(i % 2 ? '#e8ebe8' : '#dfe3e0', [-70 + i * 11 + rnd() * 6, h - 2 + rnd() * 6, zTop - 2 - rnd() * 10], 6 + rnd() * 4, [1.6, 0.5, 1]);
  }
  // pylons
  for (let i = 1; i < track.length - 1; i++) {
    const [, z] = track[i];
    const base = slopeAt(track, heights, z);
    const tip = heights[i] + 3.6;
    g.box('#9a9a96', [x + 1.5, (base + tip) / 2, z], [0.6, tip - base, 0.6]);
    g.box('#8a8a86', [x + 1.5, tip, z], [4.6, 0.3, 0.4]);
  }
  // two ropes (up and down), one box per span, pitched to the climb
  for (const off of [0, 3]) {
    for (let i = 1; i < track.length; i++) {
      const [, z0] = track[i - 1];
      const [, z1] = track[i];
      const y0 = heights[i - 1] + 3.2;
      const y1 = heights[i] + 3.2;
      const run = z0 - z1;
      g.boxR('#1e1e1e', [x + off, (y0 + y1) / 2, (z0 + z1) / 2], [0.05, 0.05, Math.hypot(run, y1 - y0)], [Math.atan2(y1 - y0, run), 0, 0]);
    }
  }
  // stations: canopy and bullwheel over each end
  for (const [i, wall] of [[0, '#d8d4ca'], [track.length - 1, '#cfcac0']] as const) {
    const [, z] = track[i];
    const y = heights[i];
    for (const sx of [-1.9, 4.9]) for (const sz of [-2.5, 2.5]) g.box('#b8b4aa', [x + sx, y / 2 + 3, z + sz], [0.5, y + 6, 0.5]);
    g.box(wall, [x + 1.5, y + 6.2, z], [7.6, 0.4, 6.4]);
    g.box('#c0392b', [x + 1.5, y + 6.55, z], [7.2, 0.3, 6]);
    g.cylinder('#3a3a3a', [x + 1.5, y + 3.4, z + (i === 0 ? 2.2 : -2.2)], 1.6, 1.6, 0.2, 14);
    if (i > 0) g.box('#9a948a', [x + 1.5, y / 2, z - 2], [10, y, 8]);
  }
}

/**
 * A waterfall stepping down a forested hill in levels, with the climbing path beside it: one terrace per level
 * (the climb's flat stretches), a pool on each, the water falling over each cliff, stone steps up each cliff on
 * the path, a handrail, a marker at every level, and the last, highest fall at the back.
 */
function waterfallHill(g: ColorGeometryBuilder, ride: NonNullable<DestinationPack['climbs']>[number]['ride'], rnd: () => number) {
  const t = ride.track;
  const h = ride.heights ?? t.map(() => 0);
  const px = t[1][0]; // the path runs straight up at this x
  // flat stretches (same height at both ends) are terraces; the pieces between them are the steps
  const flats: { z0: number; z1: number; y: number }[] = [];
  for (let i = 2; i < t.length; i++) if (h[i] === h[i - 1] && t[i][1] < t[i - 1][1]) flats.push({ z0: t[i - 1][1], z1: t[i][1], y: h[i] });
  const greens = ['#4a7a3c', '#558a44', '#3f7036', '#5e9048'];
  flats.forEach((f, i) => {
    const next = flats[i + 1];
    const zEnd = next ? next.z0 : f.z1 - 6;
    const depth = f.z0 - zEnd;
    if (f.y > 0) g.box(shade('#6f6252', (rnd() - 0.5) * 0.12), [0, f.y / 2, (f.z0 + zEnd) / 2], [200, f.y, depth]);
    // forest on the terrace, kept off the falls and the path
    for (let x = -96; x < 96; x += 6 + rnd() * 5) {
      if (x > -6 && x < px + 12) continue; // the falls, the path, and room for the camera beside it
      g.blob(greens[Math.floor(rnd() * greens.length)], [x, f.y + 3.4, (f.z0 + zEnd) / 2 + (rnd() - 0.5) * depth * 0.6], 2.6 + rnd() * 1.6, [1.1, 1.0, 1.1]);
    }
    // the pool, and the water falling into it from the next level
    g.box('#6aa9b2', [0, f.y + 0.04, (f.z0 + f.z1) / 2], [7, 0.06, Math.abs(f.z1 - f.z0) + 1]);
    g.box('#d9eeee', [0, f.y + 0.07, f.z1 + 0.3], [3.6, 0.06, 1.2]);
    const above = next ? next.y : f.y + 9;
    g.box('#cfe8ea', [0, (f.y + above) / 2, zEnd + 0.15], [2.6, above - f.y, 0.3]);
    g.box('#f2fafa', [0.5, (f.y + above) / 2, zEnd + 0.32], [0.9, above - f.y, 0.08]);
    // rocks at the pool's edge
    for (const sx of [-1, 1]) g.blob('#7a7266', [sx * 3.8, f.y + 0.3, (f.z0 + f.z1) / 2 + (rnd() - 0.5) * 3], 0.9, [1.3, 0.6, 1]);
    // the path across the terrace, its rail and the level's marker
    g.box('#a49a88', [px, f.y + 0.05, (f.z0 + f.z1) / 2], [1.8, 0.1, Math.abs(f.z1 - f.z0)]);
    g.box('#5a4636', [px + 1.05, f.y + 0.95, (f.z0 + f.z1) / 2], [0.06, 0.06, Math.abs(f.z1 - f.z0)]);
    g.box('#5a4636', [px - 1.4, f.y + 0.7, f.z0 - 1.2], [0.12, 1.4, 0.12]);
    g.box('#e8dcc0', [px - 1.4, f.y + 1.45, f.z0 - 1.2], [0.7, 0.4, 0.06]);
    // steps up the cliff to the next level
    if (next) {
      const n = Math.max(2, Math.round((next.y - f.y) / 0.6));
      const run = f.z1 - next.z0; // positive
      for (let k = 0; k < n; k++) {
        const top = f.y + ((k + 1) * (next.y - f.y)) / n;
        g.box(shade('#a49a88', -0.04 * (k % 2)), [px, (f.y + top) / 2, f.z1 - ((k + 0.5) * run) / n], [1.8, top - f.y, run / n]);
      }
    }
  });
  // behind the last level: the rock face the top fall comes over, and forest above it
  const last = flats[flats.length - 1];
  if (last) {
    const z = last.z1 - 6;
    g.box('#6f6252', [0, (last.y + 9) / 2, z - 3], [200, last.y + 9, 6]);
    for (let x = -96; x < 96; x += 7 + rnd() * 5) g.blob(greens[Math.floor(rnd() * greens.length)], [x, last.y + 12, z - 3 + (rnd() - 0.5) * 4], 3 + rnd() * 1.5, [1.1, 1, 1.1]);
  }
}

/**
 * Top of a plateau: the ground stops at the north edge (`DestinationPack.groundEdge`) behind a low stone wall, and
 * beyond it there is nothing but mist and, far below, the forested valley.
 */
function plateauEdge(g: ColorGeometryBuilder, pack: DestinationPack, rnd: () => number) {
  const edge = pack.groundEdge ?? -48;
  for (let x = -60; x < 60; x += 2.2) if (Math.abs(x) > 5.5) g.box(rnd() > 0.5 ? '#a8a49a' : '#9a968c', [x, 0.45, edge + 0.6], [2.1, 0.9, 0.7]);
  g.box('#7f9c58', [0, -0.6, edge - 1], [220, 1.2, 2]);
  // cloud lying in the valley, below the edge
  for (let i = 0; i < 22; i++) g.blob(i % 3 ? '#e9ecea' : '#dde2df', [-90 + rnd() * 180, -14 + rnd() * 6, edge - 14 - rnd() * 40], 9 + rnd() * 6, [2, 0.3, 1.3]);
  for (let x = -110; x < 110; x += 12 + rnd() * 8) g.blob(['#3a6232', '#46703a'][Math.floor(rnd() * 2)], [x, -48, -96 - rnd() * 10], 14 + rnd() * 6, [1.4, 0.7, 0.8]);
}

function distToSegments(track: [number, number][], x: number, z: number): number {
  let best = Infinity;
  for (let i = 1; i < track.length; i++) {
    const [ax, az] = track[i - 1];
    const [bx, bz] = track[i];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    best = Math.min(best, Math.hypot(x - ax - dx * k, z - az - dz * k));
  }
  return best;
}

/** North of a street left open: dry grass, scattered trees and a few low roofs running out to the horizon. */
function openCountry(g: ColorGeometryBuilder, rnd: () => number) {
  g.box('#b3a06e', [0, 0.003, -78], [140, 0.01, 60]);
  const greens = ['#5f7f40', '#6f8a4a', '#4f7038'];
  for (let i = 0; i < 26; i++) {
    const x = -60 + rnd() * 120;
    const z = -52 - rnd() * 36;
    if (Math.abs(x) < 7 && z > -62) continue; // keep the line of sight down the street clear
    g.cylinder('#5a3b26', [x, 1.2, z], 0.18, 0.25, 2.4, 6);
    g.blob(greens[i % 3], [x, 3.2, z], 1.6 + rnd() * 1.4, [1.3, 0.7, 1.3]);
  }
  for (let i = 0; i < 6; i++) {
    const x = (i % 2 ? 1 : -1) * (14 + rnd() * 30);
    const z = -56 - rnd() * 20;
    const w = 5 + rnd() * 4;
    g.box('#cdbfa4', [x, 1.5, z], [w, 3, 5]);
    g.box('#8a5a3c', [x, 3.15, z], [w + 0.4, 0.3, 5.4]);
  }
}

/** North of a street in old Ibadan: rust-brown corrugated roofs crowding over the low hills to the horizon. */
function roofscape(g: ColorGeometryBuilder, rnd: () => number) {
  g.box('#8a7458', [0, 0.003, -80], [150, 0.01, 64]);
  const rust = ['#a8643a', '#b8743f', '#96582f', '#c08048', '#8c5030'];
  const walls = ['#cdbb9c', '#bfa98a', '#d8c7a8', '#b59d7e'];
  for (let i = 0; i < 70; i++) {
    const x = -66 + rnd() * 132;
    const z = -52 - rnd() * 44;
    if (Math.abs(x) < 6 && z > -60) continue; // keep the view down the street open
    const rise = Math.max(0, (-z - 52) * 0.12) + rnd() * 1.5; // the city climbs the hills as it goes back
    const w = 4 + rnd() * 4;
    const d = 4 + rnd() * 3;
    const h = 2.6 + rnd() * 2;
    g.box(walls[i % walls.length], [x, rise + h / 2, z], [w, h, d]);
    g.boxR(rust[i % rust.length], [x, rise + h + 0.45, z - d / 4], [w + 0.5, 0.12, d / 2 + 0.5], [0.32, 0, 0]);
    g.boxR(rust[(i + 2) % rust.length], [x, rise + h + 0.45, z + d / 4], [w + 0.5, 0.12, d / 2 + 0.5], [-0.32, 0, 0]);
  }
  for (const [x, z, r] of [[-40, -70, 5], [36, -64, 4], [-12, -88, 6]]) g.blob('#5f7f40', [x, 3, z], r, [1.3, 0.6, 1.3]);
}

/** North of a street at the edge of a sacred grove: tall old forest closing in, dark and green, over a low wall. */
function forest(g: ColorGeometryBuilder, rnd: () => number) {
  g.box('#4f5a36', [0, 0.003, -78], [150, 0.01, 64]);
  const greens = ['#2f5a2c', '#3c6b34', '#2a4d28', '#4a7a3a'];
  for (let i = 0; i < 60; i++) {
    const x = -64 + rnd() * 128;
    const z = -50 - rnd() * 44;
    const h = 7 + rnd() * 10;
    g.cylinder('#4a3524', [x, h / 2, z], 0.35, 0.55, h, 6);
    g.blob(greens[i % greens.length], [x, h + 1.5, z], 3 + rnd() * 2.5, [1.2, 0.9, 1.2]);
  }
  // the grove wall either side of the gate
  for (const side of [-1, 1]) g.box('#b49a74', [side * 12, 0.9, -47], [16, 1.8, 0.6]);
}

/** North of a street that ends at an old city moat: a deep red-earth ditch across the view, its high bank beyond, bush on top. */
function moat(g: ColorGeometryBuilder, rnd: () => number) {
  const z0 = -50;
  g.box('#8a5a3a', [0, 0.003, z0 - 30], [150, 0.01, 64]);
  // the ditch: a dark floor and two sloping red-earth sides
  g.box('#4a3020', [0, -2.8, z0 - 4], [150, 0.2, 5]);
  g.boxR('#a0623c', [0, -1.4, z0 - 1.2], [150, 0.3, 3.4], [-0.95, 0, 0]);
  g.boxR('#94583a', [0, -1.4, z0 - 6.8], [150, 0.3, 3.4], [0.95, 0, 0]);
  // the old bank beyond: a long, worn earth slope, grassed over in patches, then bush along the top
  g.boxR('#8f6a4a', [0, 1.6, z0 - 11], [150, 0.4, 7.6], [0.42, 0, 0]);
  g.box('#86684a', [0, 3.2, z0 - 18], [150, 0.4, 8]);
  const greens = ['#4f7038', '#5f7f40', '#3f6030', '#6f8a4a'];
  for (let i = 0; i < 46; i++) {
    const x = -66 + rnd() * 132;
    const t = rnd();
    // grass and shrubs on the slope, bigger bush and trees on the crest
    const z = t < 0.4 ? z0 - 8.5 - rnd() * 5 : z0 - 15 - rnd() * 26;
    const y = t < 0.4 ? 0.6 + (z0 - 8.5 - z) * 0.45 : 3.8 + rnd() * 1.5;
    g.blob(greens[i % 4], [x, y, z], t < 0.4 ? 0.8 + rnd() * 0.9 : 2 + rnd() * 2.5, [1.4, 0.7, 1.2]);
  }
}

/** North of a street under an escarpment (Milliken Hill): low roofs, then a steep green ridge with pines along the top. */
function escarpment(g: ColorGeometryBuilder, rnd: () => number) {
  g.box('#7a7048', [0, 0.003, -76], [150, 0.01, 60]);
  // the town at the foot of the hill
  for (let i = 0; i < 22; i++) {
    const x = -60 + rnd() * 120;
    if (Math.abs(x) < 6) continue;
    const z = -52 - rnd() * 12;
    const w = 4 + rnd() * 4;
    g.box('#cdbb9c', [x, 1.4, z], [w, 2.8, 4.5]);
    g.box(i % 2 ? '#8a5634' : '#6c6f72', [x, 2.95, z], [w + 0.4, 0.3, 4.9]);
  }
  // the ridge: a long run of steep green slopes, a road scar winding up it
  for (let i = 0; i < 7; i++) g.blob(i % 2 ? '#5f7a3c' : '#6a8442', [-72 + i * 24, 0, -92 - (i % 3) * 4], 22, [1.3, 0.95, 0.7]);
  g.boxR('#b49a74', [-6, 9, -78], [46, 0.3, 1.6], [0, 0.35, 0.32]);
  // pines up the slope (Ngwo), set into the hillside so none float above a dip in the ridge
  for (let i = 0; i < 40; i++) {
    const x = -70 + rnd() * 140;
    const y = 6 + rnd() * 7;
    // the slope's face at height y is about 15·√(1 − (y/21)²) in front of the ridge line; sink each tree a little behind it
    // the ridge sections step back (−92, −96, −100); use the one this tree stands on
    const k = Math.max(0, Math.min(6, Math.round((x + 72) / 24)));
    const z = -92 - (k % 3) * 4 + 15 * Math.sqrt(1 - (y / 21) ** 2) - 2.5 - rnd() * 2;
    g.cylinder('#3f2c1e', [x, y + 1.4, z], 0.22, 0.3, 2.8, 5);
    g.cylinder('#2c4a2a', [x, y + 4.4, z], 0.05, 1.5, 4.8, 7);
  }
}

/** North of a street on the Jos Plateau: grassland with piles of rounded granite boulders and a granite range behind. */
function boulders(g: ColorGeometryBuilder, rnd: () => number) {
  g.box('#7d8a56', [0, 0.003, -78], [150, 0.01, 64]);
  const greys = ['#9a958a', '#8c877c', '#a7a296', '#7f7a70'];
  // the range behind (the Shere Hills): long granite humps
  for (let i = 0; i < 6; i++) g.blob(greys[i % 4], [-70 + i * 28, 0, -104 - (i % 2) * 6], 18 + (i % 3) * 3, [1.5, 0.75, 0.8]);
  // tors in front: rounded boulders stacked in piles, some balanced on others
  for (let t = 0; t < 9; t++) {
    const x = (t % 2 ? 1 : -1) * (10 + rnd() * 50);
    const z = -56 - rnd() * 30;
    const big = 2.5 + rnd() * 3;
    g.blob(greys[t % 4], [x, big * 0.7, z], big, [1.2, 0.85, 1]);
    g.blob(greys[(t + 1) % 4], [x + big * 0.6, big * 0.5, z + big * 0.5], big * 0.7, [1.1, 0.8, 1]);
    g.blob(greys[(t + 2) % 4], [x + big * 0.2, big * 1.55, z + 0.2], big * 0.55, [1.15, 0.85, 1]);
  }
  for (let i = 0; i < 14; i++) {
    const x = -60 + rnd() * 120;
    if (Math.abs(x) < 6) continue;
    g.blob('#5f7a3c', [x, 1.6, -54 - rnd() * 30], 1.4 + rnd(), [1.3, 0.8, 1.3]);
  }
}

/** North of a street in an old walled city (Kano): the earthen wall across the view, a gate where the street meets it,
 *  and the old city's pinnacled roofs and neem trees beyond. */
function cityWall(g: ColorGeometryBuilder, rnd: () => number) {
  const z = -50;
  const mud = '#b07a4e';
  g.box('#b39468', [0, 0.003, z - 30], [150, 0.01, 64]);
  // the wall, broken by the gateway in the middle
  for (const side of [-1, 1]) {
    g.box(mud, [side * 39, 3.2, z], [70, 6.4, 3]);
    for (let x = 5; x < 74; x += 2.4) g.box(shade(mud, -0.06), [side * x, 6.75, z], [1.2, 0.7, 3.1]);
  }
  // the gate: two towers and an arch
  for (const side of [-1, 1]) {
    g.box(shade(mud, 0.04), [side * 4.4, 4.5, z], [2.8, 9, 4]);
    for (const sz of [-1, 1]) g.cylinder(shade(mud, -0.1), [side * 4.4 + sz * 1.1, 9.5, z + 1.6], 0.06, 0.3, 1.1, 6);
  }
  g.box(shade(mud, 0.04), [0, 7.6, z], [6, 2.8, 4]);
  g.box('#5b3a24', [0, 2.8, z + 2.05], [5.2, 5.6, 0.08]);
  // the old city beyond: flat mud roofs with pinnacles, and neem trees
  for (let i = 0; i < 26; i++) {
    const x = -60 + rnd() * 120;
    const zz = z - 8 - rnd() * 30;
    const h = 3 + rnd() * 3;
    const w = 4 + rnd() * 4;
    g.box(i % 2 ? '#c08a58' : '#a8744a', [x, h / 2, zz], [w, h, 4 + rnd() * 2]);
    g.cylinder('#94643e', [x - w / 2 + 0.3, h + 0.5, zz], 0.05, 0.25, 1, 6);
    g.cylinder('#94643e', [x + w / 2 - 0.3, h + 0.5, zz], 0.05, 0.25, 1, 6);
  }
  for (let i = 0; i < 12; i++) g.blob('#5f7a3c', [-60 + rnd() * 120, 6 + rnd() * 2, z - 10 - rnd() * 30], 2.5 + rnd() * 1.5, [1.3, 0.85, 1.3]);
}

/** North of a station street: the fence, the platform with its canopy, two tracks and a train waiting to leave. */
function railwayBeyond(g: ColorGeometryBuilder, pack: DestinationPack) {
  const z0 = -pack.road.length / 2 - 3;
  g.box('#a39d90', [0, 0.004, z0 - 30], [140, 0.01, 60]);
  // fence
  for (let x = -40; x <= 40; x += 3) g.box('#7d8288', [x, 1.1, z0], [0.08, 2.2, 0.08]);
  for (const y of [0.3, 1.1, 2.1]) g.box('#8e9399', [0, y, z0], [80, 0.04, 0.04]);
  // platform and canopy
  const pz = z0 - 8;
  g.box('#cfc8b8', [0, 0.5, pz], [90, 1, 6]);
  g.box('#f2b705', [0, 1.01, pz - 2.8], [90, 0.02, 0.25]);
  for (let x = -40; x <= 40; x += 8) g.box('#e9e6df', [x, 3.2, pz + 0.8], [0.3, 4.4, 0.3]);
  g.box('#e9e6df', [0, 5.5, pz], [88, 0.25, 6.6]);
  g.box('#1f6f4a', [0, 5.8, pz], [88, 0.35, 0.4]);
  // tracks: sleepers and rails
  for (const tz of [pz - 6, pz - 12]) {
    for (let x = -66; x <= 66; x += 1.2) g.box('#5a4a3c', [x, 0.06, tz], [0.35, 0.12, 2.6]);
    for (const s of [-0.72, 0.72]) g.box('#8e9399', [0, 0.2, tz + s], [134, 0.14, 0.1]);
  }
  prop(g, { id: 'train-1', kind: 'train', position: [30, pz - 6] });
  // a goods wagon line and distant trees
  for (let x = -60; x < 30; x += 9) g.box('#8a5a3c', [x, 1.6, pz - 12], [8.4, 2.6, 2.8]);
  for (let x = -60; x <= 60; x += 7) g.blob('#5f7f40', [x, 3.4, z0 - 36 - (x % 3)], 3.2, [1.4, 0.8, 1.2]);
}

/** North of an airport street: a perimeter fence, the apron, parked airliners and the control tower. */
function airfieldBeyond(g: ColorGeometryBuilder, pack: DestinationPack) {
  const z0 = -pack.road.length / 2 - 3;
  // apron concrete
  g.box('#aba8a0', [0, 0.004, z0 - 45], [140, 0.01, 90]);
  for (let x = -60; x <= 60; x += 12) g.box('#e8d9b0', [x, 0.012, z0 - 30], [0.25, 0.004, 30]);
  // fence: posts, rails, wire top
  for (let x = -40; x <= 40; x += 3) g.box('#7d8288', [x, 1.3, z0], [0.08, 2.6, 0.08]);
  for (const y of [0.25, 1.3, 2.5]) g.box('#8e9399', [0, y, z0], [80, 0.04, 0.04]);
  for (let x = -40; x <= 40; x += 0.6) g.box('#9aa0a6', [x, 1.35, z0], [0.015, 2.3, 0.015]);
  g.box('#5c6670', [0, 2.75, z0], [80, 0.08, 0.08]);
  // airliners in their gate stands, and one turning in
  prop(g, { id: 'pl-1', kind: 'plane', position: [6, z0 - 22], rotation: Math.PI / 2, color: '#1f6f4a' });
  prop(g, { id: 'pl-2', kind: 'plane', position: [-36, z0 - 38], rotation: 0.4, color: '#8d1f2b' });
  prop(g, { id: 'pl-3', kind: 'plane', position: [44, z0 - 52], rotation: -0.6, color: '#2c5f9e' });
  // control tower
  g.cylinder('#d8d4cc', [30, 13, z0 - 64], 1.6, 2.2, 26, 12);
  g.cylinder('#2a3640', [30, 27.4, z0 - 64], 3.6, 3.0, 2.8, 12);
  g.cylinder('#e8e6e0', [30, 29.2, z0 - 64], 3.8, 3.8, 0.5, 12);
  g.cylinder('#c0392b', [30, 31.0, z0 - 64], 0.08, 0.08, 3.2, 6);
  // a low hangar
  g.box('#c4c7cb', [-52, 7, z0 - 70], [34, 14, 22]);
  g.box('#8e9399', [-52, 6, z0 - 58.9], [28, 12, 0.2]);
}

/** One moving vehicle as its own geometry (front faces +z), reusing the parked-prop builders. */
export function vehicleGeometry(kind: 'danfo' | 'keke' | 'car', color?: string): THREE.BufferGeometry {
  const g = new ColorGeometryBuilder();
  if (kind === 'car') {
    const c = color ?? '#c0392b';
    g.box(c, [0, 0.62, 0], [1.7, 0.6, 4.1]);
    g.box(c, [0, 1.12, -0.25], [1.5, 0.5, 2.1]);
    g.box('#22282c', [0, 1.13, -0.25], [1.52, 0.38, 1.9]);
    g.box('#22282c', [0, 1.1, 0.83], [1.36, 0.4, 0.04]);
    g.box('#3b3b3b', [0, 0.42, 2.06], [1.7, 0.18, 0.1]);
    g.box('#3b3b3b', [0, 0.42, -2.06], [1.7, 0.18, 0.1]);
    for (const lx of [0.55, -0.55]) {
      g.box('#fff6d0', [lx, 0.7, 2.06], [0.3, 0.14, 0.04]);
      g.box('#c0392b', [lx, 0.7, -2.06], [0.3, 0.14, 0.04]);
    }
    for (const [lx, lz] of [[0.8, 1.35], [-0.8, 1.35], [0.8, -1.35], [-0.8, -1.35]]) {
      g.cylinder('#1a1a1a', [lx, 0.34, lz], 0.34, 0.34, 0.24, 12, [0, 0, Math.PI / 2]);
      g.cylinder('#9a9a9a', [lx * 1.02, 0.34, lz], 0.16, 0.16, 0.25, 8, [0, 0, Math.PI / 2]);
    }
  } else {
    prop(g, { id: 'v', kind, position: [0, 0], rotation: 0, color });
  }
  return g.build();
}

/** The game-drive truck as its own geometry (front faces +z), for the ride. */
export function safariTruckGeometry(color?: string): THREE.BufferGeometry {
  const g = new ColorGeometryBuilder();
  safariTruck(g, placer(0, 0, 0), 0, color);
  return g.build();
}

export function buildStaticWorld(pack: DestinationPack): StaticWorld {
  // Pick a facade resolution that fits every facade into one 2048² atlas,
  // stepping down if the shelf packer still runs out of room.
  const area = pack.buildings.reduce((n, b) => n + b.size[0] * b.size[1], 0);
  let ppm = Math.min(MAX_PPM, Math.floor(Math.sqrt((0.55 * 2048 * 2048) / Math.max(area, 1))));
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const g = new ColorGeometryBuilder();
      const a = new TextureAtlas(2048);
      for (const b of pack.buildings) building(g, a, b, ppm);
      for (const p of pack.props) prop(g, p);
      powerLines(g, pack);
      streetFurniture(g, pack);
      backdrop(g, pack);
      const atlas = a.build();
      return { colorGeometry: g.build(), atlasGeometry: atlas.geometry, atlasTexture: atlas.texture };
    } catch (e) {
      if (!(e instanceof Error) || e.message !== 'Atlas full') throw e;
      ppm = Math.floor(ppm * 0.85);
    }
  }
  throw new Error('Could not fit facades into the atlas');
}
