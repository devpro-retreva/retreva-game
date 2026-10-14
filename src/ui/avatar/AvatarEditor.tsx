import type { ReactNode } from 'react';
import { BUILDS, COLOURWAYS, GENDERS, HAIR_COLORS, HEAD_COLORS, OPTIONS, SKIN_TONES, switchGender } from '../../game/core/avatarPresets';
import type { AvatarLook, Gender } from '../../game/persistence/types';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="field">
      <span className="eyelabel lbl">{label}</span>
      {children}
    </div>
  );
}

function Pills<T extends string>({ label, value, options, onPick }: { label: string; value: T; options: { id: T; name: string }[]; onPick: (v: T) => void }) {
  return (
    <Field label={label}>
      <div className="choicegrid" role="group" aria-label={label}>
        {options.map((o) => (
          <button type="button" key={o.id} className="pill-btn" aria-pressed={value === o.id} onClick={() => onPick(o.id)}>
            {o.name}
          </button>
        ))}
      </div>
    </Field>
  );
}

/** Simple figure glyphs for the gender buttons: a straight silhouette and a dress silhouette. */
function Figure({ gender }: { gender: Gender }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="4.6" r="2.6" />
      {gender === 'male' ? (
        <path d="M8.2 8.6h7.6l-.6 6.6h-1.6l-.5 6.6h-2.2l-.5-6.6H8.8z" />
      ) : (
        <path d="M9.4 8.6h5.2l3 8.2h-3.1l-.4 5h-4.2l-.4-5H6.4z" />
      )}
    </svg>
  );
}

/**
 * Everything a player can personalise. Gender picks the body and filters the
 * style options; switching it keeps skin, colours and build.
 */
export function AvatarEditor({ look, onChange }: { look: AvatarLook; onChange: (l: AvatarLook) => void }) {
  const set = (patch: Partial<AvatarLook>) => onChange({ ...look, ...patch });
  const opts = OPTIONS[look.gender];
  const colourway = COLOURWAYS.find((c) => c.top === look.top && c.bottom === look.bottom)?.id;
  const twoTone = look.outfit !== 'dress';

  return (
    <>
      <Field label="Gender">
        <div className="gender-toggle" role="radiogroup" aria-label="Gender">
          {GENDERS.map((g) => (
            <button
              type="button"
              role="radio"
              key={g.id}
              aria-checked={look.gender === g.id}
              className="gender-btn"
              onClick={() => onChange(switchGender(look, g.id))}
            >
              <Figure gender={g.id} />
              {g.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Skin tone">
        <div className="swatches" role="group" aria-label="Skin tone">
          {SKIN_TONES.map((c, i) => (
            <button type="button" key={c} className="swatch" style={{ background: c }} aria-pressed={look.skin === c} aria-label={`Skin tone ${i + 1}`} onClick={() => set({ skin: c })} />
          ))}
        </div>
      </Field>

      <Pills label="Hairstyle" value={look.hair} options={opts.hair} onPick={(hair) => set({ hair })} />
      {look.hair !== 'bald' && (
        <Field label="Hair colour">
          <div className="swatches" role="group" aria-label="Hair colour">
            {HAIR_COLORS.map((c) => (
              <button type="button" key={c.id} className="swatch" style={{ background: c.id, width: 32, height: 32 }} aria-pressed={look.hairColor === c.id} aria-label={c.name} title={c.name} onClick={() => set({ hairColor: c.id })} />
            ))}
          </div>
        </Field>
      )}

      {look.gender === 'male' && <Pills label="Facial hair" value={look.facialHair} options={opts.facialHair} onPick={(facialHair) => set({ facialHair })} />}

      <Pills label="Outfit" value={look.outfit} options={opts.outfit} onPick={(outfit) => set({ outfit })} />
      <Field label="Outfit colours">
        <div className="swatches" role="group" aria-label="Outfit colours">
          {COLOURWAYS.map((o) => (
            <button
              type="button"
              key={o.id}
              className="swatch split"
              title={o.name}
              aria-label={o.name}
              aria-pressed={colourway === o.id}
              style={{ background: twoTone ? `linear-gradient(135deg, ${o.top} 0 55%, ${o.bottom} 55% 100%)` : o.top }}
              onClick={() => set({ top: o.top, bottom: o.bottom })}
            />
          ))}
        </div>
      </Field>

      <Pills label="Headwear" value={look.headwear} options={opts.headwear} onPick={(headwear) => set({ headwear })} />
      {look.headwear !== 'none' && (
        <div className="swatches" style={{ marginTop: -10 }} role="group" aria-label="Headwear colour">
          {HEAD_COLORS.map((c) => (
            <button type="button" key={c} className="swatch" style={{ background: c, width: 30, height: 30 }} aria-pressed={look.headColor === c} aria-label={`Headwear colour ${c}`} onClick={() => set({ headColor: c })} />
          ))}
        </div>
      )}

      <Pills label="Accessories" value={look.accessory} options={opts.accessory} onPick={(accessory) => set({ accessory })} />
      <Pills label="Build" value={look.build} options={BUILDS} onPick={(build) => set({ build })} />
    </>
  );
}

/** Short human description, e.g. "Female · Braids · Dress". */
export function describeLook(look: AvatarLook): string {
  const o = OPTIONS[look.gender];
  const name = <T,>(list: { id: T; name: string }[], v: T) => list.find((x) => x.id === v)?.name ?? '';
  return [GENDERS.find((g) => g.id === look.gender)?.name, name(o.hair, look.hair), name(o.outfit, look.outfit)].filter(Boolean).join(' · ');
}
