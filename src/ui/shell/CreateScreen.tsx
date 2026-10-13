import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import { BUILDS, DEFAULT_AVATAR, HEADWEAR, OUTFITS, SKIN_TONES } from '../../game/core/avatarPresets';
import type { AvatarLook, Profile } from '../../game/persistence/types';
import { Character, type CharacterAnim } from '../../scene/Character';

const HEAD_COLORS = ['#f4f0e6', '#d8452b', '#f2b705', '#6b3f8f', '#1f6f4a', '#15130f'];

function Turntable({ look }: { look: AvatarLook }) {
  const g = useRef<THREE.Group>(null);
  const anim = useRef<CharacterAnim>({ speed: 0, idle: 'sway' });
  const drag = useRef<number | null>(null);
  const spin = useRef(0.6);
  useFrame((_, dt) => {
    if (g.current && drag.current === null) {
      spin.current += dt * 0.5;
      g.current.rotation.y = spin.current;
    } else if (g.current) g.current.rotation.y = spin.current;
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
      <Character look={{ ...look, height: 1.76 }} anim={anim} />
    </group>
  );
}

export function CreateScreen({ onDone, onBack }: { onDone: (p: Profile) => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [look, setLook] = useState<AvatarLook>(DEFAULT_AVATAR);
  const set = (patch: Partial<AvatarLook>) => setLook((l) => ({ ...l, ...patch }));
  const valid = name.trim().length >= 2;
  const outfit = OUTFITS.find((o) => o.top === look.top && o.bottom === look.bottom)?.id;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onDone({ name: name.trim().slice(0, 18), avatar: look, createdAt: Date.now() });
  };

  return (
    <main className="create">
      <div className="preview">
        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.25, 3.4], fov: 32 }} gl={{ antialias: true }} onCreated={({ camera }) => camera.lookAt(0, 1.0, 0)}>
          <hemisphereLight args={['#fde9cf', '#9a5a3a', 1.6]} />
          <directionalLight position={[-3, 4, 3]} intensity={2.2} color="#ffd9a0" />
          <Turntable look={look} />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0]}>
            <circleGeometry args={[0.7, 32]} />
            <meshBasicMaterial color="#000" transparent opacity={0.18} />
          </mesh>
        </Canvas>
        <div className="label">
          <div className="eyelabel" style={{ color: 'rgba(21,19,15,0.6)' }}>Arriving in Lagos</div>
          <b>{name.trim() || 'Your name'}</b>
        </div>
      </div>

      <form className="form" onSubmit={submit}>
        <div>
          <button type="button" className="btn ghost" style={{ minHeight: 34, padding: '0 10px' }} onClick={onBack}>
            ← Back
          </button>
          <h1>Who are you?</h1>
          <div className="stripes" style={{ width: 64, marginTop: 10 }} />
        </div>

        <div className="field">
          <label className="eyelabel" htmlFor="name">Name</label>
          <input id="name" className="text-input" value={name} maxLength={18} autoComplete="off" placeholder="e.g. Adaeze" onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="field">
          <span className="eyelabel lbl">Skin tone</span>
          <div className="swatches" role="group" aria-label="Skin tone">
            {SKIN_TONES.map((c, i) => (
              <button type="button" key={c} className="swatch" style={{ background: c }} aria-pressed={look.skin === c} aria-label={`Skin tone ${i + 1}`} onClick={() => set({ skin: c })} />
            ))}
          </div>
        </div>

        <div className="field">
          <span className="eyelabel lbl">Outfit</span>
          <div className="swatches" role="group" aria-label="Outfit">
            {OUTFITS.map((o) => (
              <button
                type="button"
                key={o.id}
                className="swatch split"
                title={o.name}
                aria-label={o.name}
                aria-pressed={outfit === o.id}
                style={{ background: `linear-gradient(135deg, ${o.top} 0 55%, ${o.bottom} 55% 100%)` }}
                onClick={() => set({ top: o.top, bottom: o.bottom })}
              />
            ))}
          </div>
        </div>

        <div className="field">
          <span className="eyelabel lbl">Headwear</span>
          <div className="choicegrid" role="group" aria-label="Headwear">
            {HEADWEAR.map((h) => (
              <button type="button" key={h.id} className="pill-btn" aria-pressed={look.headwear === h.id} onClick={() => set({ headwear: h.id })}>
                {h.name}
              </button>
            ))}
          </div>
          {look.headwear !== 'none' && (
            <div className="swatches" style={{ marginTop: 10 }} role="group" aria-label="Headwear colour">
              {HEAD_COLORS.map((c) => (
                <button type="button" key={c} className="swatch" style={{ background: c, width: 30, height: 30 }} aria-pressed={look.headColor === c} aria-label={`Colour ${c}`} onClick={() => set({ headColor: c })} />
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <span className="eyelabel lbl">Build</span>
          <div className="choicegrid" role="group" aria-label="Build">
            {BUILDS.map((b) => (
              <button type="button" key={b.id} className="pill-btn" aria-pressed={look.build === b.id} onClick={() => set({ build: b.id })}>
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <button className="btn block" type="submit" disabled={!valid} style={{ minHeight: 54, marginTop: 'auto', fontSize: 'var(--fs-md)' }}>
          Step onto Adeniyi Street
        </button>
        {!valid && <div style={{ color: 'var(--muted)', fontSize: 'var(--fs-xs)', marginTop: -12 }}>Enter a name with at least 2 letters.</div>}
      </form>
    </main>
  );
}
