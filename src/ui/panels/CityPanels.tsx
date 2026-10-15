import { useCallback, useEffect, useState } from 'react';
import { CITY_PACKS, cityName, cityOfArea, isCityLoaded, loadCity } from '../../game/content/cities';
import { cityStatus, installCity, offlineSupported, removeCity, verifyCity, type CityState } from '../../game/content/cityStore';
import { REGIONS } from '../../game/content/regions';
import { useGame } from '../../game/store/gameStore';

/** Loads the city an area belongs to (if it isn't yet) and reports whether it's ready. */
export function useCityReady(areaId: string): 'ready' | 'loading' | 'unavailable' {
  const city = cityOfArea(areaId);
  const [state, setState] = useState<'ready' | 'loading' | 'unavailable'>(!city || isCityLoaded(city.id) ? 'ready' : 'loading');
  useEffect(() => {
    if (!city || isCityLoaded(city.id)) return setState('ready');
    let alive = true;
    setState('loading');
    loadCity(city.id).then(
      () => alive && setState('ready'),
      () => alive && setState('unavailable'),
    );
    return () => {
      alive = false;
    };
  }, [city]);
  return state;
}

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

const LABEL: Record<CityState, string> = {
  'built-in': 'Built in',
  installed: 'On this device',
  update: 'Update available',
  'not-installed': 'Not downloaded',
  unsupported: 'Online only here',
};

/** Settings → Cities: which cities are on this device for offline play; download, verify, remove. */
export function CitiesSection() {
  const here = useGame((s) => s.destinationId);
  const [status, setStatus] = useState<Record<string, { state: CityState; bytes: number }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    const out: typeof status = {};
    for (const c of CITY_PACKS) out[c.id] = await cityStatus(c.id);
    setStatus(out);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const say = (id: string, text: string) => setMsg((m) => ({ ...m, [id]: text }));

  const install = async (id: string) => {
    setBusy(id);
    setProgress(0);
    const r = await installCity(id, (d, t) => setProgress(t ? d / t : 1));
    if (r.ok) {
      const v = await verifyCity(id);
      say(id, v.ok ? 'Downloaded and checked. You can play it offline now.' : 'Downloaded, but the check failed — try again.');
      void loadCity(id).catch(() => undefined);
    } else say(id, r.error);
    setBusy(null);
    await refresh();
  };
  const verify = async (id: string) => {
    setBusy(id);
    const v = await verifyCity(id);
    say(id, v.ok ? 'All files checked — nothing is missing or damaged.' : `${v.bad.length} file${v.bad.length > 1 ? 's are' : ' is'} missing or damaged. Download it again to fix.`);
    setBusy(null);
  };
  const remove = async (id: string) => {
    setConfirm(null);
    await removeCity(id);
    say(id, 'Removed from this device. Your game is untouched; the city downloads again when you go there online.');
    await refresh();
  };

  return (
    <div className="cities" data-cities>
      {!offlineSupported() && <p className="muted small">This browser can’t keep cities for offline play here; they load as you travel while online.</p>}
      {CITY_PACKS.map((c) => {
        const st = status[c.id];
        const region = REGIONS.find((r) => r.id === c.id);
        const inIt = region?.areas.some((a) => a.id === here);
        return (
          <div className="city-row" key={c.id} data-city={c.id} data-state={st?.state ?? 'checking'}>
            <div className="card-line">
              <div style={{ minWidth: 0 }}>
                <b>{cityName(c.id)}</b>
                <div className="muted small">
                  {region?.country} · {region?.areas.length} areas{st && st.bytes ? ` · ${kb(st.bytes)}` : ''}
                </div>
              </div>
              <span className={`chip ${st?.state === 'installed' || st?.state === 'built-in' ? 'done' : st?.state === 'update' ? 'live' : ''}`}>{st ? LABEL[st.state] : '…'}</span>
            </div>
            {busy === c.id && (
              <div className="bench-bar" aria-label="Downloading">
                <i style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
            )}
            {st && !c.builtIn && st.state !== 'unsupported' && (
              <div className="city-actions">
                {(st.state === 'not-installed' || st.state === 'update') && (
                  <button className="btn sm" data-act="install" disabled={!!busy} onClick={() => void install(c.id)}>
                    {st.state === 'update' ? 'Update' : 'Download'}
                  </button>
                )}
                {st.state === 'installed' && (
                  <>
                    <button className="btn sm ghost" data-act="verify" disabled={!!busy} onClick={() => void verify(c.id)}>
                      Check files
                    </button>
                    {confirm === c.id ? (
                      <>
                        <button className="btn sm" data-act="confirm-remove" onClick={() => void remove(c.id)}>
                          Remove
                        </button>
                        <button className="btn sm ghost" onClick={() => setConfirm(null)}>
                          Keep
                        </button>
                      </>
                    ) : (
                      <button className="btn sm ghost" data-act="remove" disabled={!!busy} onClick={() => setConfirm(c.id)}>
                        Remove…
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            {confirm === c.id && <p className="muted small">{inIt ? `You're in ${cityName(c.id)} now — it keeps working while the game is open, but needs the internet after a restart.` : 'Frees the space; your game and progress stay.'}</p>}
            {msg[c.id] && (
              <p className="muted small" data-msg>
                {msg[c.id]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
