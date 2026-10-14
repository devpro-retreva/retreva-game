import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ColorGeometryBuilder } from './builders/geometryBuilder';
import { shade } from './builders/painters';
import { characterMaterial } from './materials';
import { HEIGHT } from '../game/core/avatarPresets';
import type { Accessory, FacialHair, Gender, HairStyle, Headwear, OutfitStyle } from '../game/persistence/types';

export interface CharacterLook {
  gender?: Gender;
  skin: string;
  top: string;
  bottom: string;
  hair?: HairStyle;
  hairColor?: string;
  facialHair?: FacialHair;
  outfit?: OutfitStyle;
  headwear?: Headwear;
  headColor?: string;
  accessory?: Accessory;
  build?: 'slim' | 'regular' | 'broad';
  height?: number;
}

export interface CharacterAnim {
  /** Horizontal speed in m/s; drives the walk cycle. */
  speed: number;
  idle?: 'sway' | 'wave' | 'busy';
  /** When true, the character gestures as if talking. */
  talking?: boolean;
}

interface Parts {
  body: THREE.BufferGeometry;
  arm: THREE.BufferGeometry;
  armR: THREE.BufferGeometry;
  leg: THREE.BufferGeometry;
}

const cache = new Map<string, Parts>();

/** Width multiplier from build. */
const buildW = (b?: CharacterLook['build']) => (b === 'slim' ? 0.9 : b === 'broad' ? 1.14 : 1);
/** Shoulder pivot offset for the arms, by gender. */
export const shoulderX = (l: CharacterLook) => (l.gender === 'female' ? 0.225 : 0.26) * buildW(l.build);

/** Near characters get the full shape budget; distant ones about a third of the triangles. */
export type Lod = 'near' | 'far';
const LOD_SCALE: Record<Lod, number> = { near: 0.72, far: 0.42 };

const mix = (a: string, b: string, t: number) => `#${new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString()}`;

/**
 * Stylised-realistic body built from smooth primitives: a sculpted (lathed) torso, tapered limbs
 * with hands and shoes, and a rounded head with jaw, ears, eyelids, nose and lips.
 * Same pivots as before (shoulders at y 1.5, hips at y 0.9) so animation and gameplay are unchanged.
 */
function buildParts(look: CharacterLook, lod: Lod): Parts {
  const key = `${lod}|${JSON.stringify(look)}`;
  const q = LOD_SCALE[lod];
  const hit = cache.get(key);
  if (hit) return hit;
  // Deep browns crush to near-black under filmic tone mapping, which hides faces.
  // Lift lightness at render time; saved data keeps the chosen tone.
  const l = { ...look, skin: shade(look.skin, 0.12) };
  const fem = l.gender === 'female';
  const w = buildW(l.build);
  const hairC = l.hairColor ?? '#17110c';
  const outfit: OutfitStyle = l.outfit ?? (fem ? 'top-skirt' : 'shirt');
  const hairStyle: HairStyle = l.hair ?? (fem ? 'short' : 'low');
  const hw: Headwear = l.headwear ?? 'none';
  const covered = hw !== 'none';
  const skinShadow = shade(l.skin, -0.06);
  const lip = mix(shade(l.skin, -0.1), '#8c3a34', fem ? 0.45 : 0.25);
  const topShade = shade(l.top, -0.08);

  const b = new ColorGeometryBuilder(q);
  const flat = 0.66; // torso depth relative to width

  // ── torso: one lathed silhouette (hips → waist → chest → shoulders → neck)
  const torso: [number, number][] = fem
    ? [[0.17, 0.98], [0.15, 1.08], [0.135, 1.15], [0.155, 1.26], [0.168, 1.33], [0.163, 1.41], [0.185, 1.465], [0.16, 1.51], [0.1, 1.545], [0.055, 1.565]]
    : [[0.165, 0.98], [0.158, 1.08], [0.158, 1.16], [0.178, 1.28], [0.19, 1.37], [0.205, 1.44], [0.2, 1.49], [0.15, 1.53], [0.06, 1.565]];
  const kaftanLong = outfit === 'kaftan';
  const torsoProfile: [number, number][] = kaftanLong ? [[0.225, 0.6], [0.205, 0.78], [0.18, 0.95], ...torso.slice(1)] : torso;
  b.lathe(l.top, [0, 0, 0], torsoProfile, 18, [w, 1, flat * w + 0.05]);
  // shoulder caps so the arms join smoothly
  for (const sxx of [1, -1]) b.ellipsoid(l.top, [sxx * shoulderX(l) * 0.9, 1.475, 0], fem ? 0.058 : 0.068, [1.15, 0.8, 1], [12, 8]);

  const skirtLike = outfit === 'dress' || outfit === 'top-skirt';
  if (outfit === 'dress') {
    b.lathe(l.top, [0, 0, 0], [[0.3, 0.5], [0.27, 0.62], [0.22, 0.8], [0.175, 0.96], [0.14, 1.08]], 18, [w, 1, 0.82 * w]);
    b.lathe(shade(l.top, -0.14), [0, 0, 0], [[0.142, 1.065], [0.142, 1.1]], 18, [w, 1, flat * w + 0.05]); // waist tie
  } else if (outfit === 'top-skirt') {
    b.lathe(l.bottom, [0, 0, 0], [[0.27, 0.56], [0.24, 0.7], [0.195, 0.88], [0.16, 1.02], [0.148, 1.08]], 18, [w, 1, 0.8 * w]);
  } else if (kaftanLong) {
    b.cylinder(shade(l.top, -0.18), [0, 1.43, 0.12 * w], 0.025, 0.02, 0.16, 6, [0.18, 0, 0]); // embroidered placket
  } else {
    // trousers / shorts seat
    b.lathe(l.bottom, [0, 0, 0], fem ? [[0.15, 0.82], [0.18, 0.9], [0.178, 0.98], [0.16, 1.05]] : [[0.15, 0.82], [0.168, 0.9], [0.168, 0.98], [0.162, 1.05]], 16, [w, 1, flat * w + 0.07]);
    b.lathe(shade(l.top, -0.15), [0, 0, 0], [[(fem ? 0.153 : 0.162) + 0.004, 1.02], [(fem ? 0.153 : 0.162) + 0.004, 1.05]], 16, [w, 1, flat * w + 0.07]); // belt / hem
    if (outfit === 'shirt') {
      b.capsule(topShade, [0, 1.33, 0.13 * w], 0.007, 0.26, [0.1, 0, 0], 4); // button placket
      b.ellipsoid(topShade, [0.05, 1.49, 0.1 * w], 0.04, [1.2, 0.35, 0.6], [8, 5], [0, 0, -0.5]); // collar
      b.ellipsoid(topShade, [-0.05, 1.49, 0.1 * w], 0.04, [1.2, 0.35, 0.6], [8, 5], [0, 0, 0.5]);
    }
  }

  // ── neck and head
  b.capsule(l.skin, [0, 1.585, 0.005], fem ? 0.046 : 0.054, 0.05, [0, 0, 0], 10);
  const headR = 0.118;
  b.ellipsoid(l.skin, [0, 1.755, 0.0], headR, fem ? [0.86, 1.02, 0.95] : [0.9, 1.04, 0.98], [18, 14]);
  b.ellipsoid(l.skin, [0, 1.69, 0.03], 0.08, fem ? [0.92, 0.82, 0.92] : [1.02, 0.84, 0.95], [14, 10]); // jaw + chin
  for (const ex of [1, -1]) b.ellipsoid(l.skin, [ex * (fem ? 0.1 : 0.106), 1.745, -0.005], 0.026, [0.42, 1, 0.68], [8, 6]); // ears
  // eyes: whites, irises with a catch-light, lids and brows
  for (const ex of [0.041, -0.041]) {
    b.ellipsoid('#efe7dc', [ex, 1.772, 0.101], 0.019, [1.3, 0.72, 0.85], [10, 8]);
    b.ellipsoid('#2b1a10', [ex, 1.771, 0.113], 0.0115, [1, 1, 0.5], [8, 6]);
    b.ellipsoid('#ffffff', [ex + 0.004, 1.775, 0.1185], 0.0032, [1, 1, 1], [5, 4]);
    b.capsule(shade(l.skin, -0.1), [ex, 1.784, 0.108], 0.0075, 0.03, [0, 0, Math.PI / 2], 6); // upper lid
    const brow = hairC === '#9a9590' ? '#5a5550' : shade(hairC, 0.02);
    b.capsule(brow, [ex, 1.803, 0.108], fem ? 0.0055 : 0.0075, 0.034, [0, 0, Math.PI / 2 + (ex > 0 ? -0.12 : 0.12)], 6);
    if (fem) b.capsule('#120c08', [ex + (ex > 0 ? 0.023 : -0.023), 1.778, 0.108], 0.0035, 0.01, [0, 0, ex > 0 ? -0.8 : 0.8], 4); // lashes
  }
  // nose: bridge + rounded tip + nostrils
  b.capsule(l.skin, [0, 1.752, 0.105], 0.01, 0.032, [0.32, 0, 0], 8);
  b.ellipsoid(l.skin, [0, 1.73, 0.116], fem ? 0.015 : 0.017, [1.35, 0.85, 0.9], [10, 8]);
  for (const nx of [0.011, -0.011]) b.ellipsoid(skinShadow, [nx, 1.724, 0.112], 0.007, [1.2, 0.7, 0.8], [6, 4]);
  // lips
  b.ellipsoid(lip, [0, 1.7, 0.103], 0.019, [1.65, 0.38, 0.5], [10, 6]);
  b.ellipsoid(shade(lip, 0.04), [0, 1.691, 0.1], 0.018, [1.45, 0.45, 0.5], [10, 6]);
  // cheekbones
  for (const cx of [0.055, -0.055]) b.ellipsoid(shade(l.skin, 0.02), [cx, 1.735, 0.078], 0.035, [1, 0.75, 0.6], [8, 6]);

  // ── hair (crown pieces hide under headwear; hanging pieces always show)
  const cap = () => b.ellipsoid(hairC, [0, 1.795, -0.012], 0.127, [0.92, fem ? 0.82 : 0.74, 1.02], [16, 10]);
  switch (hairStyle) {
    case 'low':
    case 'short':
      if (!covered) cap();
      break;
    case 'hightop':
      if (!covered) {
        cap();
        b.lathe(hairC, [0, 0, -0.008], [[0.112, 1.8], [0.118, 1.88], [0.112, 1.94], [0.08, 1.965], [0.001, 1.97]], 14, [0.95, 1, 1]);
      }
      break;
    case 'afro':
      if (!covered) b.ellipsoid(hairC, [0, 1.825, -0.025], 0.17, [1.02, 0.92, 1.04], [16, 12]);
      break;
    case 'locs':
      if (!covered) cap();
      for (let i = 0; i < 13; i++) {
        const a = Math.PI * (0.3 + (i / 12) * 1.4);
        b.capsule(hairC, [Math.sin(a) * 0.112, 1.66, Math.cos(a) * 0.112 - 0.015], 0.016, 0.26, [Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12], 5);
      }
      break;
    case 'puff':
      if (!covered) {
        cap();
        b.ellipsoid(hairC, [0, 1.955, -0.05], 0.1, [1, 0.88, 1], [12, 10]);
      }
      break;
    case 'bun':
      if (!covered) {
        cap();
        b.ellipsoid(hairC, [0, 1.86, -0.13], 0.065, [1, 1, 1], [10, 8]);
      }
      break;
    case 'braids':
      if (!covered) cap();
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (0.58 + (i / 10) * 0.84);
        b.capsule(hairC, [Math.sin(a) * 0.108, 1.52, Math.cos(a) * 0.108 - 0.035], 0.014, 0.5, [0, 0, 0], 5);
      }
      break;
    case 'long':
      if (!covered) cap();
      b.ellipsoid(hairC, [0, 1.6, -0.08], 0.13, [1, 1.75, 0.42], [14, 10]);
      for (const sx2 of [1, -1]) b.ellipsoid(hairC, [sx2 * 0.1, 1.68, -0.01], 0.05, [0.55, 1.9, 1.1], [8, 8]);
      break;
    case 'bald':
      break;
  }

  // ── headwear
  const hc = l.headColor ?? '#f4f0e6';
  switch (hw) {
    case 'cap':
      b.ellipsoid(hc, [0, 1.835, -0.008], 0.128, [0.95, 0.62, 1.02], [14, 8]);
      b.ellipsoid(shade(hc, -0.05), [0, 1.815, 0.12], 0.09, [1, 0.12, 0.8], [12, 4]);
      break;
    case 'kufi':
      b.lathe(hc, [0, 0, 0], [[0.122, 1.8], [0.124, 1.87], [0.11, 1.915], [0.001, 1.93]], 16, [0.95, 1, 1.02]);
      b.lathe(shade(hc, -0.15), [0, 0, 0], [[0.126, 1.805], [0.126, 1.83]], 16, [0.95, 1, 1.02]);
      break;
    case 'gele':
      b.ellipsoid(hc, [0, 1.86, -0.015], 0.142, [1.08, 0.64, 1.1], [14, 10]);
      b.ellipsoid(shade(hc, -0.08), [0, 1.93, -0.04], 0.128, [1.18, 0.56, 1.04], [14, 10]);
      b.boxR(hc, [0, 1.99, -0.1], [0.38, 0.13, 0.035], [-0.95, 0, 0]);
      b.boxR(shade(hc, 0.06), [0.09, 2.0, 0.0], [0.2, 0.16, 0.03], [-0.15, 0.55, 0.35]);
      b.boxR(shade(hc, -0.12), [-0.09, 2.0, 0.0], [0.2, 0.16, 0.03], [-0.15, -0.55, -0.35]);
      break;
    case 'wrap':
      b.ellipsoid(hc, [0, 1.83, -0.02], 0.136, [1.04, 0.84, 1.12], [14, 10]);
      b.ellipsoid(shade(hc, -0.1), [0, 1.93, 0.05], 0.05, [1.3, 0.8, 1], [8, 6]);
      break;
  }

  // ── facial hair
  const fh = fem ? 'none' : l.facialHair ?? 'none';
  if (fh === 'moustache' || fh === 'goatee' || fh === 'beard') b.ellipsoid(hairC, [0, 1.712, 0.106], 0.03, [1.5, 0.35, 0.6], [10, 6]);
  if (fh === 'goatee') b.ellipsoid(hairC, [0, 1.655, 0.09], 0.03, [1, 1.1, 0.8], [8, 8]);
  if (fh === 'beard') b.ellipsoid(hairC, [0, 1.675, 0.045], 0.088, [1.12, 0.78, 0.95], [14, 10]);

  // ── accessories
  if (l.accessory === 'glasses') {
    const f = '#1c1a18';
    for (const ex of [0.042, -0.042]) {
      b.lathe(f, [ex, 1.773, 0.117], [[0.026, -0.003], [0.026, 0.003]], 12, [1, 1, 1]);
      b.capsule(f, [ex > 0 ? 0.088 : -0.088, 1.78, 0.06], 0.003, 0.11, [Math.PI / 2, 0, 0], 4);
    }
    b.capsule(f, [0, 1.778, 0.118], 0.003, 0.02, [0, 0, Math.PI / 2], 4);
  }
  if (l.accessory === 'earrings' && fem) {
    for (const ex of [0.104, -0.104]) b.ellipsoid('#e2b13a', [ex, 1.705, 0.0], 0.014, [1, 1, 1], [8, 6]);
  }

  // ── arms (pivot at the shoulder): sleeve, forearm, hand with thumb
  const sleeve = outfit === 'kaftan' ? 0.5 : outfit === 'tee-shorts' || outfit === 'dress' || outfit === 'top-skirt' ? 0.16 : 0.27;
  const arm = (side: 1 | -1) => {
    const a = new ColorGeometryBuilder(q);
    const up = fem ? 0.047 : 0.056;
    const fore = fem ? 0.038 : 0.045;
    a.capsule(l.skin, [0, -0.17, 0], up * 0.94, 0.22, [0, 0, 0], 10); // upper arm (skin under any sleeve)
    a.capsule(l.skin, [0, -0.43, 0.012], fore, 0.2, [0.06, 0, 0], 10); // forearm
    a.lathe(l.top, [0, 0, 0], [[up * 0.92 + 0.008, -sleeve], [up + 0.008, -sleeve * 0.45], [up + 0.01, -0.03], [up * 0.85, 0.025], [up * 0.45, 0.052], [0.001, 0.058]], 14, [1, 1, 1]); // sleeve with a rounded shoulder
    if (sleeve > 0.4) a.lathe(l.top, [0, 0, 0.012], [[fore + 0.016, -sleeve], [fore + 0.02, -0.3]], 12, [1, 1, 1]);
    a.ellipsoid(l.skin, [0, -0.6, 0.016], fem ? 0.037 : 0.043, [0.75, 1.25, 0.5], [10, 8]); // palm
    a.capsule(l.skin, [side * -0.022, -0.585, 0.03], 0.011, 0.03, [0.3, 0, side * 0.6], 6); // thumb
    return a.build();
  };

  // ── legs (pivot at the hip): thigh, calf, shoe
  const lg = new ColorGeometryBuilder(q);
  const thighR = fem ? 0.072 : 0.078;
  const calfR = fem ? 0.052 : 0.058;
  const thighC = skirtLike ? l.skin : l.bottom;
  const calfC = skirtLike || outfit === 'tee-shorts' ? l.skin : l.bottom;
  lg.capsule(thighC, [0, -0.22, 0], thighR, 0.3, [0, 0, 0], 12);
  lg.capsule(calfC, [0, -0.61, -0.005], calfR, 0.3, [0, 0, 0], 12);
  if (outfit === 'tee-shorts') lg.lathe(l.bottom, [0, 0, 0], [[thighR + 0.016, -0.36], [thighR + 0.02, -0.1], [thighR + 0.02, 0.04]], 12, [1, 1, 1]);
  else if (!skirtLike) lg.lathe(l.bottom, [0, 0, 0], [[calfR + 0.016, -0.8], [calfR + 0.012, -0.5], [thighR + 0.012, -0.3], [thighR + 0.016, 0.04]], 12, [1, 1, 1]); // trouser leg
  const shoe = skirtLike ? '#5a2a1e' : '#241a14';
  lg.ellipsoid(shoe, [0, -0.85, 0.045], 0.07, fem ? [0.72, 0.5, 1.45] : [0.85, 0.55, 1.6], [12, 8]);
  lg.ellipsoid(shade(shoe, -0.08), [0, -0.877, 0.045], 0.07, fem ? [0.68, 0.16, 1.4] : [0.8, 0.18, 1.55], [12, 6]); // sole

  const parts = { body: b.build(), arm: arm(1), armR: arm(-1), leg: lg.build() };
  cache.set(key, parts);
  return parts;
}

export function Character({ look, anim, castShadow = true, lod = 'near' }: { look: CharacterLook; anim: MutableRefObject<CharacterAnim>; castShadow?: boolean; lod?: Lod }) {
  const parts = useMemo(() => buildParts(look, lod), [look, lod]);
  const scale = (look.height ?? HEIGHT[look.gender ?? 'male']) / 1.75;
  const w = buildW(look.build);
  const sx = shoulderX(look);
  const hx = (look.gender === 'female' ? 0.095 : 0.1) * w;
  const root = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Mesh>(null);
  const armR = useRef<THREE.Mesh>(null);
  const legL = useRef<THREE.Mesh>(null);
  const legR = useRef<THREE.Mesh>(null);
  const state = useRef({ phase: Math.random() * 10, blend: 0, t: Math.random() * 10 });

  useFrame((_, dt) => {
    const a = anim.current;
    const s = state.current;
    const d = Math.min(dt, 0.05);
    s.t += d;
    const moving = a.speed > 0.15;
    s.blend += ((moving ? 1 : 0) - s.blend) * Math.min(1, d * 10);
    s.phase += d * (2.2 + a.speed * 1.9);
    const swing = Math.sin(s.phase) * (0.35 + Math.min(a.speed, 6.5) * 0.08) * s.blend;
    if (legL.current && legR.current && armL.current && armR.current && root.current) {
      legL.current.rotation.x = swing;
      legR.current.rotation.x = -swing;
      let la = -swing * 0.9;
      let ra = swing * 0.9;
      let rz = 0;
      const idle = 1 - s.blend;
      if (idle > 0.01) {
        if (a.talking) {
          ra += idle * (-0.5 + Math.sin(s.t * 3.1) * 0.25);
          la += idle * Math.sin(s.t * 2.3 + 1) * 0.12;
        } else if (a.idle === 'wave' && Math.sin(s.t * 0.7) > 0.55) {
          ra = -2.6 * idle;
          rz = Math.sin(s.t * 9) * 0.35 * idle;
        } else if (a.idle === 'busy') {
          ra += idle * (-0.7 + Math.sin(s.t * 4) * 0.25);
          la += idle * (-0.5 + Math.cos(s.t * 4) * 0.2);
        }
      }
      armL.current.rotation.x = la;
      armR.current.rotation.x = ra;
      armR.current.rotation.z = -0.06 - rz;
      armL.current.rotation.z = 0.06;
      const bob = Math.abs(Math.sin(s.phase)) * 0.04 * s.blend + Math.sin(s.t * 1.6) * 0.006 * idle;
      root.current.position.y = bob;
      root.current.rotation.z = a.idle === 'sway' ? Math.sin(s.t * 0.9) * 0.015 * idle : 0;
    }
  });

  return (
    <group ref={root} scale={scale}>
      <mesh geometry={parts.body} material={characterMaterial} castShadow={castShadow} />
      <mesh ref={armL} geometry={parts.arm} material={characterMaterial} position={[sx, 1.5, 0]} castShadow={castShadow} />
      <mesh ref={armR} geometry={parts.armR} material={characterMaterial} position={[-sx, 1.5, 0]} castShadow={castShadow} />
      <mesh ref={legL} geometry={parts.leg} material={characterMaterial} position={[hx, 0.9, 0]} castShadow={castShadow} />
      <mesh ref={legR} geometry={parts.leg} material={characterMaterial} position={[-hx, 0.9, 0]} castShadow={castShadow} />
    </group>
  );
}
