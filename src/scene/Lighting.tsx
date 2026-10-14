import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../game/core/runtime';

/** Late-afternoon Lagos light: low warm sun from the west, hazy sky fill. */
export function Lighting({ shadows, sun }: { shadows: boolean; sun: string }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const OFFSET = new THREE.Vector3(-16, 20, 9);

  useFrame(() => {
    const l = light.current;
    if (!l) return;
    // the shadow frustum follows the player so it stays sharp
    const px = Math.round(runtime.player.x);
    const pz = Math.round(runtime.player.z);
    l.position.set(px + OFFSET.x, OFFSET.y, pz + OFFSET.z);
    l.target.position.set(px, 0, pz);
    l.target.updateMatrixWorld();
  });

  return (
    <>
      <hemisphereLight args={['#fde9cf', '#9a5a3a', 1.5]} />
      <ambientLight color="#ffe1c4" intensity={0.55} />
      <directionalLight
        ref={light}
        color={sun}
        intensity={2.4}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
      />
    </>
  );
}
