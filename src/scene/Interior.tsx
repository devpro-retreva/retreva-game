import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { findFurniture, type InteriorDef } from '../game/content/interiors';
import { daylight } from '../game/systems/clock';
import { interiorPieces } from '../game/systems/collision';
import { useGame } from '../game/store/gameStore';
import { Character, type CharacterAnim } from './Character';

/**
 * A room you walk into: floor, four walls drawn facing inward (from outside they vanish, so the
 * third-person camera can sit above and behind you like a cut-away), a window that follows the clock,
 * the door, and the furniture — fixtures plus whatever you have placed. Procedural, no files.
 */
export function InteriorWorld({ def }: { def: InteriorDef }) {
  const placed = useGame((s) => s.life.property[def.id]?.placed);
  const pieces = useMemo(() => interiorPieces(def, placed ?? {}), [def, placed]);
  const [w, d] = def.size;
  const h = def.height;
  const win = useRef<THREE.MeshBasicMaterial>(null);
  const lamp = useRef<THREE.PointLight>(null);
  useFrame(() => {
    const t = useGame.getState().world.time ?? 480;
    const dl = daylight(t);
    win.current?.color.set('#1b2440').lerp(new THREE.Color('#bfe3ff'), dl);
    // the ceiling light matters more at night
    if (lamp.current) lamp.current.intensity = 1.2 + 1.6 * (1 - dl);
  });
  const wallMat = <meshLambertMaterial color={def.wall} side={THREE.FrontSide} />;
  return (
    <group>
      <ambientLight color="#fff2df" intensity={0.65} />
      <hemisphereLight args={['#fff4e6', '#6b4a33', 0.9]} />
      <pointLight ref={lamp} position={[0, h - 0.3, 0]} color="#ffe2b8" intensity={2} distance={Math.max(w, d) * 2} decay={1} />
      {/* floor with a skirting trim */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshLambertMaterial color={def.floor} />
      </mesh>
      {/* walls face inward: back (-z), front (+z, with the door), left, right */}
      <mesh position={[0, h / 2, -d / 2]}>
        <planeGeometry args={[w, h]} />
        {wallMat}
      </mesh>
      <mesh position={[0, h / 2, d / 2]} rotation-y={Math.PI}>
        <planeGeometry args={[w, h]} />
        {wallMat}
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[d, h]} />
        {wallMat}
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[d, h]} />
        {wallMat}
      </mesh>
      {/* skirting */}
      {[
        [0, -d / 2 + 0.03, w, 0],
        [0, d / 2 - 0.03, w, 0],
        [-w / 2 + 0.03, 0, d, Math.PI / 2],
        [w / 2 - 0.03, 0, d, Math.PI / 2],
      ].map(([x, z, len, ry], i) => (
        <mesh key={i} position={[x, 0.06, z]} rotation-y={ry}>
          <boxGeometry args={[len, 0.12, 0.04]} />
          <meshLambertMaterial color={def.trim} />
        </mesh>
      ))}
      {/* window on the back wall: the sky outside follows the clock */}
      {def.window && (
        <group position={[w * 0.1, h * 0.55, -d / 2 + 0.02]}>
          <mesh position={[0, 0, -0.005]}>
            <boxGeometry args={[1.5, 1.1, 0.02]} />
            <meshLambertMaterial color={def.trim} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.3, 0.9]} />
            <meshBasicMaterial ref={win} color="#bfe3ff" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.05, 0.9, 0.02]} />
            <meshLambertMaterial color={def.trim} />
          </mesh>
        </group>
      )}
      {/* the door you came in by */}
      <group position={[def.entry.position[0], 0, d / 2 - 0.02]}>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[1.0, 2.1, 0.04]} />
          <meshLambertMaterial color="#6b4a2e" />
        </mesh>
        <mesh position={[0.36, 1.0, -0.04]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshLambertMaterial color="#e8c46a" />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -0.45]}>
          <planeGeometry args={[1.0, 0.6]} />
          <meshLambertMaterial color="#3d5a40" />
        </mesh>
      </group>
      {pieces.map((pc, i) => (
        <group key={`${pc.itemId}-${pc.slotId ?? pc.fixedIndex}-${i}`} position={[pc.position[0], 0, pc.position[1]]} rotation-y={pc.yaw}>
          <Piece itemId={pc.itemId} wallHeight={h} withChairs={def.fixed[pc.fixedIndex ?? -1]?.use === 'dine'} />
        </group>
      ))}
      {def.kind === 'restaurant' && <Server x={def.fixed.find((f) => f.itemId === 'counter')?.position[0] ?? 0} z={(def.fixed.find((f) => f.itemId === 'counter')?.position[1] ?? -d / 2 + 0.5) - 0.62} />}
    </group>
  );
}

/** Someone behind the counter, so the restaurant isn't empty. */
function Server({ x, z }: { x: number; z: number }) {
  const anim = useRef<CharacterAnim>({ speed: 0, idle: 'busy' });
  return (
    <group position={[x + 0.8, 0, z]} rotation-y={0}>
      <Character look={{ gender: 'female', skin: '#7a4a2c', top: '#f4f0e6', bottom: '#1f6f4a', hair: 'bun', headwear: 'gele', headColor: '#1f6f4a' }} anim={anim} castShadow={false} />
    </group>
  );
}

const M = ({ c }: { c: string }) => <meshLambertMaterial color={c} />;

/** A piece of furniture, drawn from simple shapes. Origin at the floor, facing +z. */
function Piece({ itemId, wallHeight, withChairs }: { itemId: string; wallHeight: number; withChairs?: boolean }) {
  const f = findFurniture(itemId);
  if (!f) return null;
  const [hx, hz] = f.half;
  switch (itemId) {
    case 'foam-mattress':
      return (
        <group>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[hx * 2, 0.2, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 0.21, 0.15]}>
            <boxGeometry args={[hx * 2 - 0.06, 0.03, hz * 1.3]} />
            <M c={f.accent} />
          </mesh>
          <mesh position={[0, 0.26, -hz + 0.22]}>
            <boxGeometry args={[hx * 1.4, 0.1, 0.3]} />
            <M c="#f4f0e6" />
          </mesh>
        </group>
      );
    case 'wooden-bed':
      return (
        <group>
          <mesh position={[0, 0.22, 0]}>
            <boxGeometry args={[hx * 2, 0.24, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 0.4, 0.05]}>
            <boxGeometry args={[hx * 2 - 0.1, 0.14, hz * 2 - 0.15]} />
            <M c="#f1ece2" />
          </mesh>
          <mesh position={[0, 0.48, 0.25]}>
            <boxGeometry args={[hx * 2 - 0.08, 0.04, hz * 1.3]} />
            <M c={f.accent} />
          </mesh>
          <mesh position={[0, 0.52, -hz + 0.3]}>
            <boxGeometry args={[hx * 1.5, 0.12, 0.32]} />
            <M c="#ffffff" />
          </mesh>
          <mesh position={[0, 0.6, -hz + 0.03]}>
            <boxGeometry args={[hx * 2, 1.0, 0.06]} />
            <M c={f.color} />
          </mesh>
        </group>
      );
    case 'plastic-chair':
    case 'armchair': {
      const arm = itemId === 'armchair';
      return (
        <group>
          <mesh position={[0, arm ? 0.3 : 0.42, 0]}>
            <boxGeometry args={[hx * 2, arm ? 0.3 : 0.05, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, arm ? 0.65 : 0.7, -hz + 0.04]}>
            <boxGeometry args={[hx * 2, arm ? 0.55 : 0.5, 0.08]} />
            <M c={f.color} />
          </mesh>
          {arm ? (
            [-1, 1].map((s) => (
              <mesh key={s} position={[s * (hx - 0.06), 0.5, 0]}>
                <boxGeometry args={[0.12, 0.25, hz * 2]} />
                <M c={f.color} />
              </mesh>
            ))
          ) : (
            [-1, 1].flatMap((sx) =>
              [-1, 1].map((sz) => (
                <mesh key={`${sx}${sz}`} position={[sx * (hx - 0.04), 0.2, sz * (hz - 0.04)]}>
                  <cylinderGeometry args={[0.02, 0.025, 0.42, 5]} />
                  <M c={f.color} />
                </mesh>
              )),
            )
          )}
          {arm && (
            <mesh position={[0, 0.47, 0.03]}>
              <boxGeometry args={[hx * 1.5, 0.06, hz * 1.6]} />
              <M c={f.accent} />
            </mesh>
          )}
        </group>
      );
    }
    case 'side-table':
    case 'dining-table':
      return (
        <group>
          <mesh position={[0, itemId === 'dining-table' ? 0.74 : 0.55, 0]}>
            <boxGeometry args={[hx * 2, 0.05, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, (itemId === 'dining-table' ? 0.74 : 0.55) / 2, 0]}>
            <cylinderGeometry args={[0.05, 0.12, itemId === 'dining-table' ? 0.74 : 0.55, 8]} />
            <M c={f.color} />
          </mesh>
          {itemId === 'dining-table' && (
            <>
              <mesh position={[0, 0.775, 0]}>
                <boxGeometry args={[hx * 1.4, 0.01, hz * 1.4]} />
                <M c={f.accent} />
              </mesh>
              {withChairs &&
                [0, Math.PI].map((ry) => (
                  <group key={ry} rotation-y={ry}>
                    <group position={[0, 0, 0.95]} rotation-y={Math.PI}>
                      <mesh position={[0, 0.45, 0]}>
                        <boxGeometry args={[0.42, 0.05, 0.42]} />
                        <M c="#2c7fb8" />
                      </mesh>
                      <mesh position={[0, 0.72, -0.19]}>
                        <boxGeometry args={[0.42, 0.5, 0.05]} />
                        <M c="#2c7fb8" />
                      </mesh>
                    </group>
                  </group>
                ))}
            </>
          )}
        </group>
      );
    case 'counter':
      return (
        <group>
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[hx * 2, 1.1, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 1.12, 0]}>
            <boxGeometry args={[hx * 2 + 0.1, 0.05, hz * 2 + 0.1]} />
            <M c={f.accent} />
          </mesh>
          {/* pots on the counter */}
          {[-1.2, -0.4, 0.5].map((x, i) => (
            <mesh key={x} position={[x, 1.25, 0]}>
              <cylinderGeometry args={[0.16, 0.14, 0.22, 10]} />
              <M c={['#b0b7bd', '#c94f4f', '#e8b21c'][i]} />
            </mesh>
          ))}
        </group>
      );
    case 'potted-plant':
      return (
        <group>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.36, 10]} />
            <M c={f.accent} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.32, 10, 8]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0.1, 1.0, 0.05]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <M c="#3f9a4a" />
          </mesh>
        </group>
      );
    case 'ankara-rug':
      return (
        <group>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 0]}>
            <planeGeometry args={[1.8, 1.2]} />
            <M c={f.color} />
          </mesh>
          {[-0.55, 0, 0.55].map((x) => (
            <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.014, 0]}>
              <circleGeometry args={[0.2, 12]} />
              <M c={f.accent} />
            </mesh>
          ))}
        </group>
      );
    case 'wall-art':
      return (
        <group position={[0, wallHeight * 0.55, 0]}>
          <mesh>
            <boxGeometry args={[1.0, 0.7, 0.04]} />
            <M c="#2b2118" />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[0.88, 0.58]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[-0.15, 0.05, 0.03]}>
            <circleGeometry args={[0.16, 14]} />
            <M c={f.accent} />
          </mesh>
          <mesh position={[0.22, -0.1, 0.03]}>
            <planeGeometry args={[0.3, 0.16]} />
            <M c="#c94f4f" />
          </mesh>
        </group>
      );
    case 'standing-fan':
      return (
        <group>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.2, 0.22, 0.05, 12]} />
            <M c={f.accent} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.15, 6]} />
            <M c={f.accent} />
          </mesh>
          <Spinner y={1.2} color={f.color} />
        </group>
      );
    case 'small-tv':
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[hx * 2, 0.5, hz * 2]} />
            <M c="#6b4a2e" />
          </mesh>
          <mesh position={[0, 0.82, 0]}>
            <boxGeometry args={[0.85, 0.52, 0.06]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 0.82, 0.035]}>
            <planeGeometry args={[0.77, 0.44]} />
            <meshBasicMaterial color={f.accent} toneMapped={false} />
          </mesh>
        </group>
      );
    case 'rechargeable-lamp':
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.4, 10]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 0.48, 0]}>
            <sphereGeometry args={[0.13, 10, 8]} />
            <meshBasicMaterial color={f.accent} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 0.6, 0]} color={f.accent} intensity={0.8} distance={3} decay={1.5} />
        </group>
      );
    case 'storage-chest':
      return (
        <group>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[hx * 2, 0.6, hz * 2]} />
            <M c={f.color} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[hx * 2 + 0.04, 0.06, hz * 2 + 0.04]} />
            <M c="#4f361f" />
          </mesh>
          <mesh position={[0, 0.48, hz + 0.01]}>
            <boxGeometry args={[0.14, 0.1, 0.02]} />
            <M c={f.accent} />
          </mesh>
        </group>
      );
    default:
      return (
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[Math.max(0.3, hx * 2), 0.8, Math.max(0.3, hz * 2)]} />
          <M c={f.color} />
        </mesh>
      );
  }
}

function Spinner({ y, color }: { y: number; color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += dt * 9;
  });
  return (
    <group position={[0, y, 0.05]}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.24, 0.24, 0.06, 16, 1, true]} />
        <meshLambertMaterial color={color} side={THREE.DoubleSide} wireframe />
      </mesh>
      <group ref={g}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation-z={(i * Math.PI * 2) / 3} position={[0, 0, 0.01]}>
            <boxGeometry args={[0.06, 0.38, 0.01]} />
            <M c="#9ab4c8" />
          </mesh>
        ))}
      </group>
    </group>
  );
}
