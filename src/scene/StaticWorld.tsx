import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { DestinationPack } from '../game/content/types';
import { buildStaticWorld } from './builders/worldBuilder';
import { makeTiledTexture, paintAsphalt, paintLaterite, paintPaving } from './builders/painters';
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
  const surfaces = useMemo(() => {
    const road = new THREE.MeshLambertMaterial({ map: makeTiledTexture(256, [1, length / 8], paintAsphalt(pack.palette.road)) });
    const walk = new THREE.MeshLambertMaterial({ map: makeTiledTexture(256, [sw / 2, length / 2], paintPaving(pack.palette.sidewalk)) });
    const ground = new THREE.MeshLambertMaterial({ map: makeTiledTexture(256, [40, 40], paintLaterite(pack.palette.ground)) });
    return { road, walk, ground };
  }, [pack, length, sw]);

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
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, 0]} material={surfaces.ground} receiveShadow>
        <planeGeometry args={[220, 220]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} material={surfaces.road} receiveShadow>
        <planeGeometry args={[hw * 2, length]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (hw + 0.36 + (sw - 0.36) / 2), 0.06, 0]} material={surfaces.walk} receiveShadow>
          <boxGeometry args={[sw - 0.36, 0.12, length]} />
        </mesh>
      ))}
      <mesh geometry={built.colorGeometry} material={worldColorMaterial} castShadow={shadows} receiveShadow={shadows} />
      <mesh geometry={built.atlasGeometry} material={atlasMat} receiveShadow={shadows} />
    </group>
  );
}
