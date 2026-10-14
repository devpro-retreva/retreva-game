import { useState } from 'react';
import { DEFAULT_AVATAR } from '../../game/core/avatarPresets';
import type { AvatarLook, Profile } from '../../game/persistence/types';
import { AvatarEditor, describeLook } from '../avatar/AvatarEditor';
import { AvatarPreview } from '../avatar/AvatarPreview';

export function CreateScreen({ onDone, onBack }: { onDone: (p: Profile) => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [look, setLook] = useState<AvatarLook>(DEFAULT_AVATAR);
  const valid = name.trim().length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onDone({ name: name.trim().slice(0, 18), avatar: look, createdAt: Date.now() });
  };

  return (
    <main className="create">
      <div className="preview">
        <AvatarPreview look={look} />
        <div className="label">
          <div className="eyelabel" style={{ color: 'rgba(21,19,15,0.6)' }}>{describeLook(look)}</div>
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

        <AvatarEditor look={look} onChange={setLook} />

        <button className="btn block" type="submit" disabled={!valid} style={{ minHeight: 54, marginTop: 'auto', fontSize: 'var(--fs-md)' }}>
          Start my life
        </button>
        {!valid && <div style={{ color: 'var(--muted)', fontSize: 'var(--fs-xs)', marginTop: -12 }}>Enter a name with at least 2 letters.</div>}
      </form>
    </main>
  );
}
