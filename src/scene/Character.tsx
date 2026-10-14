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

function buildParts(look: CharacterLook): Parts {
  const key = JSON.stringify(look);
  const hit = cache.get(key);
  if (hit) return hit;
  // Deep browns crush to near-black under linear lighting + filmic tone mapping,
  // which hides faces. Lift lightness at render time; saved data keeps the chosen tone.
  const l = { ...look, skin: shade(look.skin, 0.13) };
  const fem = l.gender === 'female';
  const w = buildW(l.build);
  const hairC = l.hairColor ?? '#17110c';
  const outfit: OutfitStyle = l.outfit ?? (fem ? 'top-skirt' : 'shirt');
  const hairStyle: HairStyle = l.hair ?? (fem ? 'short' : 'low');
  const hw: Headwear = l.headwear ?? 'none';
  const covered = hw !== 'none';

  const b = new ColorGeometryBuilder();

  // ── torso: men square-shouldered and straight; women narrower shoulders, waist and wider hips
  const chest = (fem ? 0.18 : 0.2) * w;
  const waist = (fem ? 0.145 : 0.17) * w;
  const shoulders = (fem ? 0.4 : 0.46) * w;
  b.cylinder(l.top, [0, 1.25, 0], chest, waist, 0.5, 10);
  b.box(l.top, [0, 1.5, 0], [shoulders, 0.12, 0.24]);

  const skirtLike = outfit === 'dress' || outfit === 'top-skirt';
  if (outfit === 'dress') {
    b.cylinder(l.top, [0, 0.77, 0], 0.17 * w, 0.29 * w, 0.5, 12);
    b.cylinder(shade(l.top, -0.14), [0, 0.53, 0], 0.292 * w, 0.292 * w, 0.03, 12);
    b.cylinder(shade(l.top, -0.12), [0, 1.04, 0], waist + 0.004, waist + 0.004, 0.035, 10); // waist tie
  } else if (outfit === 'top-skirt') {
    b.cylinder(l.bottom, [0, 0.79, 0], 0.18 * w, 0.27 * w, 0.46, 12);
    b.cylinder(shade(l.bottom, -0.12), [0, 1.02, 0], 0.182 * w, 0.182 * w, 0.04, 10);
  } else if (outfit === 'kaftan') {
    // long tunic over trousers, with an embroidered neckline
    b.cylinder(l.top, [0, 0.79, 0], 0.18 * w, 0.23 * w, 0.46, 10);
    b.cylinder(shade(l.top, -0.15), [0, 0.57, 0], 0.232 * w, 0.232 * w, 0.03, 10);
    b.box(shade(l.top, -0.18), [0, 1.4, 0.16 * w], [0.05, 0.18, 0.01]);
  } else {
    const hipW = (fem ? 0.4 : 0.36) * w;
    b.box(l.bottom, [0, 0.95, 0], [hipW, 0.2, 0.22]);
    b.cylinder(shade(l.top, -0.12), [0, 1.03, 0], waist + 0.008, waist + 0.008, 0.05, 10); // belt / hem line
    if (outfit === 'shirt') b.box(shade(l.top, -0.15), [0, 1.36, 0.17 * w], [0.012, 0.26, 0.01]); // button placket
  }

  // ── head
  b.cylinder(l.skin, [0, 1.6, 0], fem ? 0.05 : 0.058, fem ? 0.055 : 0.064, 0.12, 6);
  b.sphere(l.skin, [0, 1.75, 0.005], 0.125, fem ? [0.9, 1.04, 0.95] : [0.96, 1.08, 1]);
  for (const ex of [0.044, -0.044]) {
    b.box('#f4ede2', [ex, 1.772, 0.112], [0.04, 0.024, 0.012]);
    b.box('#120c08', [ex, 1.772, 0.119], [0.018, 0.02, 0.006]);
    b.box(hairC === '#9a9590' ? '#5a5550' : '#120c08', [ex, 1.8, 0.114], [0.042, fem ? 0.006 : 0.009, 0.01]);
    if (fem) b.box('#120c08', [ex + (ex > 0 ? 0.022 : -0.022), 1.778, 0.115], [0.008, 0.008, 0.008]); // lashes
  }
  b.box(shade(l.skin, -0.08), [0, 1.74, 0.124], [0.028, 0.04, 0.02]); // nose
  b.box(fem ? '#7a2a22' : '#4a2216', [0, 1.705, 0.114], [fem ? 0.046 : 0.05, fem ? 0.014 : 0.01, 0.01]); // mouth

  // ── hair (crown pieces hide under headwear; hanging pieces always show)
  const cap = () => b.sphere(hairC, [0, 1.8, -0.01], 0.128, [1, fem ? 0.78 : 0.72, 1]);
  switch (hairStyle) {
    case 'low':
    case 'short':
      if (!covered) cap();
      break;
    case 'hightop':
      if (!covered) {
        cap();
        b.cylinder(hairC, [0, 1.89, -0.008], 0.114, 0.124, 0.13, 12);
        b.sphere(hairC, [0, 1.955, -0.008], 0.114, [1, 0.32, 1]);
      }
      break;
    case 'afro':
      if (!covered) b.sphere(hairC, [0, 1.83, -0.025], 0.168, [1.06, 0.92, 1.06]);
      break;
    case 'locs':
      if (!covered) cap();
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (0.32 + (i / 10) * 1.36);
        b.cylinder(hairC, [Math.sin(a) * 0.118, 1.67, Math.cos(a) * 0.118 - 0.012], 0.019, 0.016, 0.3, 5);
      }
      break;
    case 'puff':
      if (!covered) {
        cap();
        b.sphere(hairC, [0, 1.96, -0.05], 0.105, [1, 0.9, 1]);
      }
      break;
    case 'bun':
      if (!covered) {
        cap();
        b.sphere(hairC, [0, 1.86, -0.13], 0.07);
      }
      break;
    case 'braids':
      if (!covered) cap();
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.62 + (i / 8) * 0.76);
        b.cylinder(hairC, [Math.sin(a) * 0.112, 1.53, Math.cos(a) * 0.112 - 0.03], 0.017, 0.014, 0.52, 5);
      }
      break;
    case 'long':
      if (!covered) cap();
      b.box(hairC, [0, 1.6, -0.085], [0.25, 0.42, 0.07]);
      b.box(hairC, [0.112, 1.69, -0.02], [0.04, 0.24, 0.12]);
      b.box(hairC, [-0.112, 1.69, -0.02], [0.04, 0.24, 0.12]);
      break;
    case 'bald':
      break;
  }

  // ── headwear
  const hc = l.headColor ?? '#f4f0e6';
  switch (hw) {
    case 'cap':
      b.sphere(hc, [0, 1.84, -0.005], 0.13, [1.02, 0.6, 1.04]);
      b.box(hc, [0, 1.82, 0.13], [0.2, 0.025, 0.14]);
      break;
    case 'kufi':
      b.cylinder(hc, [0, 1.87, 0], 0.122, 0.13, 0.12, 10);
      b.cylinder(shade(hc, -0.15), [0, 1.82, 0], 0.132, 0.132, 0.02, 10);
      break;
    case 'gele':
      b.sphere(hc, [0, 1.86, -0.015], 0.145, [1.12, 0.62, 1.12]);
      b.sphere(shade(hc, -0.08), [0, 1.93, -0.04], 0.13, [1.2, 0.55, 1.05]);
      b.boxR(hc, [0, 1.99, -0.1], [0.38, 0.13, 0.035], [-0.95, 0, 0]);
      b.boxR(shade(hc, 0.06), [0.09, 2.0, 0.0], [0.2, 0.16, 0.03], [-0.15, 0.55, 0.35]);
      b.boxR(shade(hc, -0.12), [-0.09, 2.0, 0.0], [0.2, 0.16, 0.03], [-0.15, -0.55, -0.35]);
      break;
    case 'wrap':
      b.sphere(hc, [0, 1.83, -0.02], 0.138, [1.08, 0.82, 1.14]);
      b.sphere(shade(hc, -0.1), [0, 1.93, 0.05], 0.05, [1.3, 0.8, 1]);
      break;
  }

  // ── facial hair
  const fh = fem ? 'none' : l.facialHair ?? 'none';
  if (fh === 'moustache' || fh === 'goatee' || fh === 'beard') b.box(hairC, [0, 1.722, 0.118], [0.075, 0.016, 0.014]);
  if (fh === 'goatee') b.box(hairC, [0, 1.668, 0.098], [0.05, 0.05, 0.04]);
  if (fh === 'beard') {
    b.box(hairC, [0, 1.672, 0.065], [0.2, 0.08, 0.11]);
    b.box(hairC, [0.102, 1.73, 0.03], [0.03, 0.1, 0.09]);
    b.box(hairC, [-0.102, 1.73, 0.03], [0.03, 0.1, 0.09]);
  }

  // ── accessories
  if (l.accessory === 'glasses') {
    const f = '#1c1a18';
    for (const ex of [0.045, -0.045]) {
      b.box(f, [ex, 1.789, 0.127], [0.058, 0.008, 0.008]);
      b.box(f, [ex, 1.755, 0.127], [0.058, 0.008, 0.008]);
      b.box(f, [ex + 0.029, 1.772, 0.127], [0.008, 0.042, 0.008]);
      b.box(f, [ex - 0.029, 1.772, 0.127], [0.008, 0.042, 0.008]);
      b.box(f, [ex > 0 ? 0.118 : -0.118, 1.782, 0.06], [0.008, 0.008, 0.13]);
    }
    b.box(f, [0, 1.78, 0.127], [0.03, 0.007, 0.008]);
  }
  if (l.accessory === 'earrings' && fem) {
    for (const ex of [0.118, -0.118]) {
      b.box('#d9a826', [ex, 1.705, 0.005], [0.008, 0.03, 0.008]);
      b.sphere('#e9b830', [ex, 1.68, 0.005], 0.017, [1, 1, 1], 0);
    }
  }

  // ── arms: sleeve length follows the outfit
  const sleeve = outfit === 'kaftan' ? 0.52 : outfit === 'tee-shorts' || outfit === 'dress' || outfit === 'top-skirt' ? 0.15 : 0.27;
  const arm = () => {
    const a = new ColorGeometryBuilder();
    const r0 = fem ? 0.054 : 0.062;
    a.cylinder(l.top, [0, -sleeve / 2, 0], r0, r0 - 0.006, sleeve, 6);
    const skinLen = 0.56 - sleeve;
    if (skinLen > 0.02) a.cylinder(l.skin, [0, -sleeve - skinLen / 2, 0], fem ? 0.043 : 0.048, 0.04, skinLen, 6);
    a.sphere(l.skin, [0, -0.6, 0.01], fem ? 0.044 : 0.05);
    return a.build();
  };

  // ── legs: trousers, shorts or bare under a skirt/dress
  const lg = new ColorGeometryBuilder();
  const lr = fem ? 0.08 : 0.085;
  if (skirtLike) {
    lg.cylinder(l.skin, [0, -0.42, 0], lr * 0.82, lr * 0.68, 0.84, 6);
  } else if (outfit === 'tee-shorts') {
    lg.cylinder(l.bottom, [0, -0.17, 0], lr + 0.01, lr, 0.34, 6);
    lg.cylinder(l.skin, [0, -0.59, 0], lr * 0.8, lr * 0.7, 0.5, 6);
  } else {
    lg.cylinder(l.bottom, [0, -0.42, 0], lr, lr - 0.015, 0.84, 6);
  }
  lg.box(skirtLike ? '#5a2a1e' : '#241a14', [0, -0.86, 0.04], [fem ? 0.1 : 0.12, 0.08, fem ? 0.23 : 0.25]);

  const parts = { body: b.build(), arm: arm(), armR: arm(), leg: lg.build() };
  cache.set(key, parts);
  return parts;
}

export function Character({ look, anim, castShadow = true }: { look: CharacterLook; anim: MutableRefObject<CharacterAnim>; castShadow?: boolean }) {
  const parts = useMemo(() => buildParts(look), [look]);
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
