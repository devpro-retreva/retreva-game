import { Canvas } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { input } from '../game/core/input';
import { useGame } from '../game/store/gameStore';
import { makeSkyTexture } from './builders/painters';
import { Beacons } from './Beacons';
import { Collectibles } from './Collectibles';
import { Traffic } from './Traffic';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { Npcs } from './Npcs';
import { Player } from './Player';
import { StaticWorld } from './StaticWorld';
import { GameLoop, InteractionSystem, ReadySignal } from './Systems';
import { usePack } from './worldContext';
import { useTier } from './useTier';

export const isCoarsePointer = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

export function GameCanvas() {
  const pack = usePack();
  const shadowSetting = useGame((s) => s.settings.shadows);
  const paused = useGame((s) => s.ui === 'wardrobe' || s.ui === 'transit');
  const coarse = useMemo(isCoarsePointer, []);
  const t = useTier();
  const shadows = t.shadows && (shadowSetting === 'on' || (shadowSetting === 'auto' && !coarse));
  const sky = useMemo(makeSkyTexture, []);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  // Desktop: drag with mouse to orbit. Touch look is handled by TouchControls.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !input.enabled) return;
    input.look.dx += e.clientX - d.x;
    input.look.dy += e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  return (
    <div
      className="viewport"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        key={`${pack.id}-${shadows ? 'sh' : 'nosh'}-${t.tier}`}
        frameloop={paused ? 'never' : 'always'}
        shadows={shadows ? { type: THREE.PCFSoftShadowMap } : false}
        dpr={t.dpr}
        gl={{ antialias: t.antialias, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 55, near: 0.15, far: t.viewDistance + 30, position: [pack.spawn.position[0], 3, pack.spawn.position[1] + 5] }}
        onCreated={({ scene, gl }) => {
          scene.background = sky;
          scene.fog = new THREE.Fog(pack.palette.fog, Math.min(28, t.viewDistance * 0.35), t.viewDistance);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Lighting shadows={shadows} sun={pack.palette.sun} />
        <StaticWorld pack={pack} shadows={shadows} />
        <Npcs />
        <Traffic />
        <Player />
        <Beacons />
        <Collectibles />
        <CameraRig />
        <InteractionSystem />
        <GameLoop />
        <ReadySignal />
      </Canvas>
    </div>
  );
}
