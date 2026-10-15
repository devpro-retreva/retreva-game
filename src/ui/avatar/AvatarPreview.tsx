import { webglSupport } from '../../game/core/webgl';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { HEIGHT } from '../../game/core/avatarPresets';
import type { AvatarLook } from '../../game/persistence/types';
import { Character, type CharacterAnim } from '../../scene/Character';

/** Slowly turning character; drag to spin. */
function Turntable({ look }: { look: AvatarLook }) {
  const g = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0, idle: 'sway' });
  const drag = useRef<number | null>(null);
  const spin = useRef(0.6);
  useFrame((_, dt) => {
    if (!g.current) return;
    if (drag.current === null) spin.current += dt * 0.5;
    g.current.rotation.y = spin.current;
  });
  return (
    <group
      ref={g}
      onPointerDown={(e) => {
        drag.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (drag.current === null) return;
        spin.current += (e.clientX - drag.current) * 0.012;
        drag.current = e.clientX;
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <Character look={{ ...look, height: HEIGHT[look.gender] }} anim={anim} />
    </group>
  );
}

export function AvatarPreview({ look }: { look: AvatarLook }) {
  // without WebGL the preview can't draw; describe the look instead of crashing the screen
  if (webglSupport() === null) {
    return (
      <div className="avatar-fallback" role="img" aria-label="Character preview unavailable">
        <p>3D preview isn’t available in this browser. Your choices are still saved.</p>
      </div>
    );
  }
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.15, 5.2], fov: 26 }} gl={{ antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 0.95, 0)}>
      <hemisphereLight args={['#fde9cf', '#9a5a3a', 1.6]} />
      <ambientLight color="#ffe1c4" intensity={0.6} />
      <directionalLight position={[-3, 4, 3]} intensity={2.2} color="#ffd9a0" />
      <Turntable look={look} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.7, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
    </Canvas>
  );
}
