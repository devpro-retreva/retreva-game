import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { daylight, hourOf } from '../game/systems/clock';
import { useGame } from '../game/store/gameStore';
import { usePack } from './worldContext';

const DAY = [new THREE.Color('#9fbfcf'), new THREE.Color('#e8d4b4'), new THREE.Color('#f3c98b'), new THREE.Color('#e9a96c')];
const DUSK = [new THREE.Color('#3b4a78'), new THREE.Color('#c0708a'), new THREE.Color('#f09a5a'), new THREE.Color('#f2b066')];
const NIGHT = [new THREE.Color('#070b1c'), new THREE.Color('#121a36'), new THREE.Color('#1f2747'), new THREE.Color('#2a2b45')];
const STOPS = [1, 0.12, 0.02, -0.2]; // y on the unit sphere for each colour, top → horizon → below

/** How much "dusk/dawn" colour to mix in (peaks around sunrise and sunset). */
export function twilight(time: number) {
  const h = hourOf(time);
  const near = (c: number) => Math.max(0, 1 - Math.abs(h - c) / 1.4);
  return Math.max(near(6.3), near(19));
}

/**
 * A sky dome whose gradient follows the clock (day → sunset → night → dawn), plus fog that darkens with it.
 * One mesh, vertex colours rewritten a few times a second — cheap on any phone.
 */
export function SkyDome({ far }: { far: number }) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const pack = usePack();
  const fogDay = useMemo(() => new THREE.Color(pack.palette.fog), [pack]);
  const fogNight = useMemo(() => new THREE.Color('#151a2c'), []);
  const mesh = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(far * 0.9, 24, 16);
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [far]);
  const acc = useRef(1);
  const tmp = useMemo(() => [new THREE.Color(), new THREE.Color(), new THREE.Color(), new THREE.Color()], []);

  useFrame((_, dt) => {
    mesh.current?.position.copy(camera.position);
    acc.current += dt;
    if (acc.current < 0.25) return;
    acc.current = 0;
    const t = useGame.getState().world.time ?? 480;
    const d = daylight(t);
    const tw = twilight(t);
    for (let i = 0; i < 4; i++) tmp[i].copy(NIGHT[i]).lerp(DAY[i], d).lerp(DUSK[i], tw * 0.75);
    const pos = geo.attributes.position;
    const col = geo.attributes.color as THREE.BufferAttribute;
    const r = far * 0.9;
    const c = new THREE.Color();
    for (let v = 0; v < pos.count; v++) {
      const y = pos.getY(v) / r;
      let k = 0;
      while (k < 2 && y < STOPS[k + 1]) k++;
      const f = THREE.MathUtils.clamp((STOPS[k] - y) / (STOPS[k] - STOPS[k + 1]), 0, 1);
      c.copy(tmp[k]).lerp(tmp[k + 1], f);
      col.setXYZ(v, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(fogNight).lerp(fogDay, d).lerp(tmp[2], tw * 0.35);
  });

  return (
    <mesh ref={mesh} geometry={geo} renderOrder={-1} frustumCulled={false}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/**
 * Street lamps that glow after dark: on the power poles where a street has them, otherwise short lamp posts
 * along both sidewalks. One instanced mesh for the heads (+ one for posts where needed).
 */
export function NightLights() {
  const pack = usePack();
  const spots = useMemo(() => {
    const poles = pack.props.filter((p) => p.kind === 'pole').map((p) => ({ x: p.position[0] + Math.sign(-p.position[0] || 1) * 0.9, z: p.position[1], y: 6.9, post: false }));
    if (poles.length) return poles;
    const out: { x: number; z: number; y: number; post: boolean }[] = [];
    const L = pack.road.length / 2 - 4;
    const x = pack.road.halfWidth + 0.35;
    for (let z = -L; z <= L; z += 13) for (const side of [-1, 1]) out.push({ x: side * x, z: z + (side > 0 ? 6 : 0), y: 4.2, post: true });
    return out;
  }, [pack]);
  const posts = spots.filter((s) => s.post);
  const headMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffd98a', toneMapped: false }), []);
  const postMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#4a4a48' }), []);

  const place = (m: THREE.InstancedMesh | null, list: typeof spots, yOf: (s: (typeof spots)[number]) => number) => {
    if (!m) return;
    const o = new THREE.Object3D();
    list.forEach((s, i) => {
      o.position.set(s.x, yOf(s), s.z);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  };

  const acc = useRef(1);
  useFrame((_, dt) => {
    acc.current += dt;
    if (acc.current < 0.3) return;
    acc.current = 0;
    const d = daylight(useGame.getState().world.time ?? 480);
    const glow = THREE.MathUtils.clamp((0.55 - d) / 0.4, 0, 1);
    headMat.color.setRGB(0.32 + 0.68 * glow, 0.3 + 0.55 * glow, 0.26 + 0.28 * glow);
  });

  return (
    <>
      <instancedMesh ref={(m) => place(m, spots, (s) => s.y)} args={[undefined, undefined, spots.length]} material={headMat} frustumCulled={false}>
        <boxGeometry args={[0.5, 0.16, 0.3]} />
      </instancedMesh>
      {posts.length > 0 && (
        <instancedMesh ref={(m) => place(m, posts, (s) => s.y / 2)} args={[undefined, undefined, posts.length]} material={postMat} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 4.2, 6]} />
        </instancedMesh>
      )}
    </>
  );
}
