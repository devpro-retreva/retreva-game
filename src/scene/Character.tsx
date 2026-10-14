import { useMemo, useRef, type MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ColorGeometryBuilder } from './builders/geometryBuilder';
import { shade } from './builders/painters';
import { characterMaterial } from './materials';

export interface CharacterLook {
  skin: string;
  top: string;
  bottom: string;
  headwear?: 'none' | 'cap' | 'kufi' | 'gele';
  headColor?: string;
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

function buildParts(look: CharacterLook): Parts {
  const key = JSON.stringify(look);
  const hit = cache.get(key);
  if (hit) return hit;
  // Deep browns crush to near-black under linear lighting + filmic tone mapping,
  // which hides faces. Lift lightness at render time; saved data keeps the chosen tone.
  const l = { ...look, skin: shade(look.skin, 0.13) };
  const w = l.build === 'slim' ? 0.9 : l.build === 'broad' ? 1.14 : 1;
  const hair = '#17110c';

  const b = new ColorGeometryBuilder();
  b.box(l.bottom, [0, 0.95, 0], [0.36 * w, 0.2, 0.22]);
  b.cylinder(l.top, [0, 1.25, 0], 0.2 * w, 0.17 * w, 0.5, 8);
  b.box(l.top, [0, 1.5, 0], [0.46 * w, 0.12, 0.25]);
  b.cylinder(shade(l.top, -0.12), [0, 1.03, 0], 0.18 * w, 0.18 * w, 0.06, 8); // belt line
  b.cylinder(l.skin, [0, 1.6, 0], 0.055, 0.06, 0.12, 6);
  b.sphere(l.skin, [0, 1.75, 0.005], 0.125, [0.95, 1.08, 1]);
  for (const ex of [0.045, -0.045]) {
    b.box('#f4ede2', [ex, 1.772, 0.114], [0.04, 0.024, 0.012]);
    b.box('#120c08', [ex, 1.772, 0.121], [0.018, 0.02, 0.006]);
    b.box('#120c08', [ex, 1.80, 0.116], [0.042, 0.008, 0.01]);
  }
  b.box(shade(l.skin, -0.08), [0, 1.74, 0.126], [0.03, 0.04, 0.02]); // nose
  b.box('#4a2216', [0, 1.705, 0.117], [0.05, 0.01, 0.01]); // mouth
  const hc = l.headColor ?? '#f4f0e6';
  switch (l.headwear) {
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
    default:
      b.sphere(hair, [0, 1.8, -0.01], 0.128, [1, 0.72, 1]);
  }

  const arm = (sleeve: string) => {
    const a = new ColorGeometryBuilder();
    a.cylinder(sleeve, [0, -0.13, 0], 0.062, 0.055, 0.26, 6);
    a.cylinder(l.skin, [0, -0.41, 0], 0.048, 0.042, 0.3, 6);
    a.sphere(l.skin, [0, -0.6, 0.01], 0.05);
    return a.build();
  };

  const lg = new ColorGeometryBuilder();
  lg.cylinder(l.bottom, [0, -0.42, 0], 0.085, 0.07, 0.84, 6);
  lg.box('#241a14', [0, -0.86, 0.04], [0.12, 0.08, 0.25]);

  const parts = { body: b.build(), arm: arm(l.top), armR: arm(l.top), leg: lg.build() };
  cache.set(key, parts);
  return parts;
}

export function Character({ look, anim, castShadow = true }: { look: CharacterLook; anim: MutableRefObject<CharacterAnim>; castShadow?: boolean }) {
  const parts = useMemo(() => buildParts(look), [look]);
  const scale = (look.height ?? 1.75) / 1.75;
  const w = look.build === 'slim' ? 0.9 : look.build === 'broad' ? 1.14 : 1;
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
      <mesh ref={armL} geometry={parts.arm} material={characterMaterial} position={[0.26 * w, 1.5, 0]} castShadow={castShadow} />
      <mesh ref={armR} geometry={parts.armR} material={characterMaterial} position={[-0.26 * w, 1.5, 0]} castShadow={castShadow} />
      <mesh ref={legL} geometry={parts.leg} material={characterMaterial} position={[0.1 * w, 0.9, 0]} castShadow={castShadow} />
      <mesh ref={legR} geometry={parts.leg} material={characterMaterial} position={[-0.1 * w, 0.9, 0]} castShadow={castShadow} />
    </group>
  );
}
