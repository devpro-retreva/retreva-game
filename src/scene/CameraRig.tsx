import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { consumeLook } from '../game/core/input';
import { runtime } from '../game/core/runtime';
import { segmentHit } from '../game/systems/collision';
import { activeRide, useGame } from '../game/store/gameStore';
import { lerpAngle, useCollisionWorld } from './worldContext';

const BASE_DIST = 5.4;
const MIN_PITCH = -0.08;
const MAX_PITCH = 0.95;

/**
 * Third-person follow camera.
 * - drag/touch to orbit, gently re-centres behind the player while walking
 * - pulls in front of walls instead of clipping through them
 * - frames both speakers during conversations
 */
export function CameraRig() {
  const world = useCollisionWorld();
  const st = useRef({
    lastLook: -10,
    t: 0,
    pos: new THREE.Vector3(),
    target: new THREE.Vector3(),
    initialised: false,
    dist: BASE_DIST,
  });
  const tmp = new THREE.Vector3();

  useFrame(({ camera }, dt) => {
    const d = Math.min(dt, 0.1);
    const s = st.current;
    s.t += d;
    const g = useGame.getState();
    const c = runtime.camera;
    const p = runtime.player;
    const look = consumeLook();

    if (g.ui === 'play') {
      const sens = g.settings.cameraSensitivity;
      if (look.dx || look.dy) {
        c.yaw -= look.dx * 0.0055 * sens;
        c.pitch += look.dy * 0.004 * sens * (g.settings.invertY ? -1 : 1);
        c.pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, c.pitch));
        s.lastLook = s.t;
      } else if (p.moving && s.t - s.lastLook > 1.6) {
        // drift back behind the player, slower when strafing toward the camera
        const facingAway = Math.cos(p.yaw - c.yaw);
        if (facingAway > -0.3) c.yaw = lerpAngle(c.yaw, p.yaw, Math.min(1, d * 1.1 * (0.4 + facingAway)));
      }
    }

    const cable = g.ui === 'drive' && activeRide(g)?.vehicle === 'cable-car';
    if (g.ui === 'drive') {
      // ride along: behind the truck and a little to one side as it turns; a cable car is watched from the side, so
      // the climb (and the drop) shows
      c.yaw = lerpAngle(c.yaw, p.yaw + (cable ? 1.25 : 0.4), Math.min(1, d * 1.6));
    }

    let yaw = c.yaw;
    let pitch = c.pitch;
    let dist = BASE_DIST;
    const target = tmp.set(p.x, 1.45, p.z);

    if (g.ui === 'dialogue' && g.dialogue) {
      const npc = runtime.actors.get(g.dialogue.npcId);
      if (npc) {
        const toNpc = Math.atan2(npc.x - p.x, npc.z - p.z);
        yaw = toNpc + 0.85; // over-the-shoulder two-shot
        pitch = 0.1;
        dist = 3.3;
        target.set((p.x * 0.6 + npc.x * 0.4), 1.5, (p.z * 0.6 + npc.z * 0.4));
      }
    } else if (g.ui === 'drive') {
      // high enough to see over the canopy to whatever is beside the track
      dist = cable ? 12 : 9;
      pitch = cable ? 0.22 : 0.42;
      target.y = p.y + (cable ? 1.6 : 2.6);
    } else if (g.ui === 'shop') {
      dist = 4.2;
      pitch = 0.18;
    }
    if (g.world.inside) {
      // indoors: look down into the room from above the walls (they're see-through from outside)
      dist = 4.6;
      pitch = Math.max(pitch, 0.78);
    }

    const cp = Math.cos(pitch);
    const desired = new THREE.Vector3(
      target.x - Math.sin(yaw) * cp * dist,
      target.y + Math.sin(pitch) * dist,
      target.z - Math.cos(yaw) * cp * dist,
    );
    // wall avoidance
    const hit = segmentHit(world, target.x, target.y, target.z, desired.x, desired.y, desired.z);
    let finalDist = dist;
    if (hit < 1) {
      finalDist = Math.max(1.0, dist * hit - 0.3);
      desired.set(
        target.x - Math.sin(yaw) * cp * finalDist,
        target.y + Math.sin(pitch) * finalDist,
        target.z - Math.cos(yaw) * cp * finalDist,
      );
    }
    desired.y = Math.max(0.4, desired.y);

    if (!s.initialised) {
      s.pos.copy(desired);
      s.target.copy(target);
      s.initialised = true;
    }
    // pull in fast when blocked, ease out slowly
    const pulling = finalDist < s.dist - 0.05;
    s.dist = finalDist;
    const k = 1 - Math.exp(-d * (pulling ? 22 : g.ui === 'play' ? 9 : 4));
    s.pos.lerp(desired, k);
    s.target.lerp(target, 1 - Math.exp(-d * 12));
    camera.position.copy(s.pos);
    camera.lookAt(s.target);
    const cam = camera as THREE.PerspectiveCamera;
    const fov = cam.aspect < 0.8 ? 70 : cam.aspect < 1.2 ? 62 : 55;
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
