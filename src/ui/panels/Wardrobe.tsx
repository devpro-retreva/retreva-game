import { useEffect, useState } from 'react';
import { useGame } from '../../game/store/gameStore';
import type { AvatarLook } from '../../game/persistence/types';
import { AvatarEditor, describeLook } from '../avatar/AvatarEditor';
import { AvatarPreview } from '../avatar/AvatarPreview';

/** In-game profile editor: change name and look any time; saved on confirm. */
export function Wardrobe() {
  const profile = useGame((s) => s.profile);
  const saveProfile = useGame((s) => s.saveProfile);
  const close = useGame((s) => s.closePanel);
  const [name, setName] = useState(profile?.name ?? '');
  const [look, setLook] = useState<AvatarLook | null>(profile?.avatar ?? null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  if (!profile || !look) return null;
  const valid = name.trim().length >= 2;
  const changed = name.trim() !== profile.name || JSON.stringify(look) !== JSON.stringify(profile.avatar);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    saveProfile(name.trim().slice(0, 18), look);
  };

  return (
    <main className="create wardrobe" role="dialog" aria-label="Change your look">
      <div className="preview">
        <AvatarPreview look={look} />
        <div className="label">
          <div className="eyelabel" style={{ color: 'rgba(21,19,15,0.6)' }}>{describeLook(look)}</div>
          <b>{name.trim() || 'Your name'}</b>
        </div>
      </div>
      <form className="form" onSubmit={submit}>
        <div>
          <div className="eyelabel">Profile</div>
          <h1>Change your look</h1>
          <div className="stripes" style={{ width: 64, marginTop: 10 }} />
        </div>
        <div className="field">
          <label className="eyelabel" htmlFor="wardrobe-name">Name</label>
          <input id="wardrobe-name" className="text-input" value={name} maxLength={18} autoComplete="off" onChange={(e) => setName(e.target.value)} />
        </div>
        <AvatarEditor look={look} onChange={setLook} />
        <div className="wardrobe-actions">
          <button className="btn" type="submit" disabled={!valid || !changed} style={{ flex: 1, minHeight: 52 }}>
            Save changes
          </button>
          <button className="btn ghost" type="button" onClick={close} style={{ minHeight: 52 }}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
