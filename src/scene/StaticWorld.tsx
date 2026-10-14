import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { DestinationPack } from '../game/content/types';
import { buildStaticWorld } from './builders/worldBuilder';
import { makeTiledTexture, paintAsphalt, paintLaterite, paintPaving, paintSand, paintWater } from './builders/painters';
import { useFrame } from '@react-three/fiber';
import { worldColorMaterial } from './materials';

/**
 * Renders a destination's static environment in a handful of draw calls:
 * one merged vertex-coloured mesh, one atlas-textured mesh for facades and
 * signs, and three tiled ground surfaces.
 */
export function StaticWorld({ pack, shadows }: { pack: DestinationPack; shadows: boolean }) {
  const built = useMemo(() => buildStaticWorld(pack), [pack]);
  const atlasMat = useMemo(() => new THREE.MeshLambertMaterial({ map: built.atlasTexture }), [built]);

  const { halfWidth: hw, sidewalk: sw, length } = pack.road;
  const style = pack.road.style ?? 'asphalt';
  const surfaces = useMemo(() => {
    const road = new THREE.MeshLambertMaterial({
      map: style === 'paved'
        ? makeTiledTexture(256, [hw / 1.5, length / 3], paintPaving(pack.palette.road))
        : makeTiledTexture(256, [1, length / 8], paintAsphalt(pack.palette.road)),
    });
    const walk = new THREE.MeshLambertMaterial({ map: makeTiledTexture(256, [sw / 2, length / 2], paintPaving(pack.palette.sidewalk)) });
    const ground = new THREE.MeshLambertMaterial({
      map: makeTiledTexture(256, style === 'sand' ? [60, 60] : [40, 40], style === 'sand' ? paintSand(pack.palette.ground) : paintLaterite(pack.palette.ground)),
    });
    return { road, walk, ground };
  }, [pack, length, sw, hw, style]);

  useEffect(
    () => () => {
      built.colorGeometry.dispose();
      built.atlasGeometry.dispose();
      built.atlasTexture.dispose();
      atlasMat.dispose();
      Object.values(surfaces).forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    },
    [built, atlasMat, surfaces],
  );

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[pack.sea ? (pack.sea.fromX - 110) / 2 : 0, -0.01, 0]} material={surfaces.ground} receiveShadow>
        <planeGeometry args={[pack.sea ? pack.sea.fromX + 110 : 220, 220]} />
      </mesh>
      {style !== 'sand' && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} material={surfaces.road} receiveShadow>
          <planeGeometry args={[hw * 2, length]} />
        </mesh>
      )}
      {style !== 'sand' &&
        [-1, 1].map((side) => (
          <mesh key={side} position={[side * (hw + 0.36 + (sw - 0.36) / 2), 0.06, 0]} material={surfaces.walk} receiveShadow>
            <boxGeometry args={[sw - 0.36, 0.12, length]} />
          </mesh>
        ))}
      {pack.sea && <Sea fromX={pack.sea.fromX} />}
      <mesh geometry={built.colorGeometry} material={worldColorMaterial} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={built.atlasGeometry} material={atlasMat} receiveShadow={shadows} />
    </group>
  );
}

/** Atlantic: a scrolling wave texture, wet sand and a foam line along the shore. */
function Sea({ fromX }: { fromX: number }) {
  const mats = useMemo(() => {
    const tex = makeTiledTexture(256, [6, 30], paintWater());
    const water = new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.96 });
    const wet = new THREE.MeshLambertMaterial({ color: '#b99a6e' });
    const foam = new THREE.MeshBasicMaterial({ color: '#fbf6ec', transparent: true, opacity: 0.75, depthWrite: false });
    return { tex, water, wet, foam };
  }, []);
  const foam = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    mats.tex.offset.set(-t * 0.02, t * 0.005);
    if (foam.current) {
      foam.current.position.x = fromX + 0.35 + Math.sin(t * 0.8) * 0.35;
      mats.foam.opacity = 0.55 + Math.sin(t * 0.8 + 1) * 0.2;
    }
  });
  useEffect(() => () => {
    mats.tex.dispose();
    mats.water.dispose();
    mats.wet.dispose();
    mats.foam.dispose();
  }, [mats]);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[fromX - 0.6, 0.004, 0]} material={mats.wet}>
        <planeGeometry args={[1.6, 240]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[fromX + 60, -0.02, 0]} material={mats.water}>
        <planeGeometry args={[120, 240]} />
      </mesh>
      <mesh ref={foam} rotation-x={-Math.PI / 2} position={[fromX + 0.35, 0.01, 0]} material={mats.foam} renderOrder={1}>
        <planeGeometry args={[0.7, 240]} />
      </mesh>
    </group>
  );
}
