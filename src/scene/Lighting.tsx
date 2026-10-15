import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { runtime } from '../game/core/runtime';
import { daylight } from '../game/systems/clock';
import { useGame } from '../game/store/gameStore';
import { twilight } from './Sky';

const NIGHT_HEMI_SKY = new THREE.Color('#3a4870');
const NIGHT_HEMI_GROUND = new THREE.Color('#2a2420');
const NIGHT_SUN = new THREE.Color('#7f8fc8');
const DUSK_SUN = new THREE.Color('#ff9a52');

/** Late-afternoon Lagos light: low warm sun from the west, hazy sky fill. */
export function Lighting({ shadows, sun }: { shadows: boolean; sun: string }) {
  const light = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const daySun = useRef(new THREE.Color(sun));
  daySun.current.set(sun);
  const OFFSET = new THREE.Vector3(-16, 20, 9);

  useFrame(() => {
    const l = light.current;
    if (!l) return;
    // time of day: the sun dims and warms toward sunset; at night a soft cool "moonlight" and warm street ambience
    const t = useGame.getState().world.time ?? 480;
    const d = daylight(t);
    const tw = twilight(t);
    l.intensity = 0.55 + 1.85 * d;
    l.color.copy(NIGHT_SUN).lerp(daySun.current, d).lerp(DUSK_SUN, tw * 0.6);
    if (hemi.current) {
      hemi.current.intensity = 0.85 + 0.65 * d;
      hemi.current.color.set('#fde9cf').lerp(NIGHT_HEMI_SKY, 1 - d);
      hemi.current.groundColor.set('#9a5a3a').lerp(NIGHT_HEMI_GROUND, 1 - d);
    }
    if (amb.current) amb.current.intensity = 0.38 + 0.17 * d;
    // the shadow frustum follows the player so it stays sharp
    const px = Math.round(runtime.player.x);
    const pz = Math.round(runtime.player.z);
    l.position.set(px + OFFSET.x, OFFSET.y, pz + OFFSET.z);
    l.target.position.set(px, 0, pz);
    l.target.updateMatrixWorld();
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#fde9cf', '#9a5a3a', 1.5]} />
      <ambientLight ref={amb} color="#ffe1c4" intensity={0.55} />
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
