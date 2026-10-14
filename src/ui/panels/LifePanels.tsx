import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../../game/content';
import { findShift, useGame } from '../../game/store/gameStore';
import { LOW, needLabel, skillLevel, levelProgress } from '../../game/systems/life';
import { usePack } from '../../scene/worldContext';
import { IconBed, IconBolt, IconClose, IconHome, IconPlate, IconStar, ITEM_ICONS } from '../icons/Icons';

/** Two compact need chips under the wallet. Text labels so state never relies on colour alone. */
export function NeedsChips() {
  const energy = useGame((s) => Math.round(s.life.needs.energy));
  const fullness = useGame((s) => Math.round(s.life.needs.fullness));
  const chip = (kind: 'energy' | 'fullness', v: number) => {
    const low = v < LOW;
    const warn = v < 40;
    const Icon = kind === 'energy' ? IconBolt : IconPlate;
    return (
      <div className={`need cut-sm ${low ? 'is-low' : warn ? 'is-warn' : ''}`} aria-label={`${kind === 'energy' ? 'Energy' : 'Fullness'} ${v} — ${needLabel(kind, v)}`}>
        <Icon size={14} />
        <span className="need-bar" aria-hidden="true">
          <i style={{ width: `${v}%` }} />
        </span>
        <span className="need-txt">{warn ? needLabel(kind, v) : v}</span>
      </div>
    );
  };
  return (
    <div className="needs">
      {chip('energy', energy)}
      {chip('fullness', fullness)}
    </div>
  );
}

/** Kitchen shift: read each ticket, pick the matching dish before the timer runs out. */
export function ShiftPanel() {
  const pack = usePack();
  const run = useGame((s) => s.shift);
  const serve = useGame((s) => s.serveDish);
  const close = useGame((s) => s.closeShift);
  const xp = useGame((s) => (run ? s.life.skills[findShift(pack, run.shiftId)?.skill ?? ''] ?? 0 : 0));
  const [now, setNow] = useState(Date.now());
  const raf = useRef(0);
  const def = run ? findShift(pack, run.shiftId) : undefined;

  useEffect(() => {
    const loop = () => {
      setNow(Date.now());
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  // time out the current order
  useEffect(() => {
    if (run && !run.outcome && now > run.deadline) serve(null);
  }, [now, run, serve]);

  // keyboard: 1–4 pick a dish, Enter/Esc closes the summary
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useGame.getState().shift;
      if (!s || !def) return;
      if (s.outcome && (e.key === 'Enter' || e.key === 'Escape')) close();
      const n = Number(e.key);
      if (!s.outcome && n >= 1 && n <= def.dishes.length) serve(def.dishes[n - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [def, serve, close]);

  if (!run || !def) return null;
  const owner = pack.npcs.find((n) => n.id === def.npcId);
  const want = def.dishes.find((d) => d.id === run.orders[run.index]);
  const left = Math.max(0, run.deadline - now);
  const frac = Math.min(1, left / (run.seconds * 1000));

  return (
    <section className="sheet cut shift" role="dialog" aria-label={def.title}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">
            Shift · {owner?.name} · Cooking level {run.level}
          </div>
          <h2>{def.title}</h2>
          {!run.outcome && <p>Read the ticket, serve the right dish before time runs out.</p>}
        </div>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
        {!run.outcome ? (
          <>
            <div className="ticket cut-sm" aria-live="polite">
              <div className="ticket-top">
                <span>
                  Order {run.index + 1} of {run.orders.length}
                </span>
                <span className="num">{(left / 1000).toFixed(1)}s</span>
              </div>
              <div className="ticket-dish" data-want={want?.id}>
                {want?.name}
              </div>
              <div className="ticket-timer" aria-hidden="true">
                <i style={{ width: `${frac * 100}%` }} className={frac < 0.3 ? 'late' : ''} />
              </div>
            </div>
            <div className="dish-grid">
              {def.dishes.map((d, i) => {
                const Icon = ITEM_ICONS[d.icon] ?? IconPlate;
                return (
                  <button key={d.id} className="dish cut-sm" data-dish={d.id} onClick={() => serve(d.id)}>
                    <Icon size={22} />
                    <span>{d.name}</span>
                    <kbd className="key">{i + 1}</kbd>
                  </button>
                );
              })}
            </div>
            <ol className="pips" aria-label="Results so far">
              {run.orders.map((_, i) => (
                <li key={i} className={run.results[i] ?? (i === run.index ? 'now' : '')} aria-label={run.results[i] ?? (i === run.index ? 'current' : 'to come')} />
              ))}
            </ol>
          </>
        ) : (
          <div className="shift-done">
            <div className="big num">+{formatMoney(pack, run.outcome.pay + run.outcome.tip)}</div>
            <p>
              Served {run.outcome.served} of {run.orders.length} correctly
              {run.outcome.tip ? ` — perfect shift, ${owner?.name} tipped ${formatMoney(pack, run.outcome.tip)}` : ''}.
            </p>
            <ul className="shift-lines">
              <li>
                <IconStar size={16} /> Cooking +{run.outcome.xp} XP{run.outcome.levelUp ? ' — level up!' : ''}
                <span className="xpbar" aria-hidden="true">
                  <i style={{ width: `${levelProgress(xp) * 100}%` }} />
                </span>
                <span className="muted">Level {skillLevel(xp)}</span>
              </li>
              <li>
                <IconPlate size={16} /> Staff meal: fullness +{def.staffMeal}
              </li>
              <li>
                <IconBolt size={16} /> Hard work: energy −{def.energyCost}
              </li>
              <li>
                <IconHome size={16} /> {owner?.name} likes you a little more
              </li>
            </ul>
            <button className="btn block" onClick={close} autoFocus>
              Done
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Door of a rentable home: rent (with clear price + confirm) or rest inside. */
export function HomePanel() {
  const pack = usePack();
  const homeId = useGame((s) => s.homeId);
  const owned = useGame((s) => s.life.home);
  const balance = useGame((s) => s.wallet.balance);
  const energy = useGame((s) => Math.round(s.life.needs.energy));
  const rentHome = useGame((s) => s.rentHome);
  const startRest = useGame((s) => s.startRest);
  const close = useGame((s) => s.closePanel);
  const [confirm, setConfirm] = useState(false);
  const home = pack.homes?.find((h) => h.id === homeId);
  if (!home) return null;
  const mine = owned === home.id;
  const afford = balance >= home.moveInCost;
  return (
    <section className="sheet cut" role="dialog" aria-label={home.name}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">{mine ? 'Your home' : 'Room to let'}</div>
          <h2>{home.name}</h2>
          <p>{home.description}</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
        {mine ? (
          <>
            <p className="muted">Energy {energy}. Sleeping here restores you fully, for free.</p>
            <button className="btn block" onClick={() => startRest('home')} disabled={energy >= 99}>
              <IconBed size={18} /> {energy >= 99 ? 'Fully rested' : 'Sleep'}
            </button>
          </>
        ) : !confirm ? (
          <>
            <div className="card-line">
              <span className="muted">Move-in (rent for your stay)</span>
              <b className="num">{formatMoney(pack, home.moveInCost)}</b>
            </div>
            <div className="card-line">
              <span className="muted">You have</span>
              <b className="num">{formatMoney(pack, balance)}</b>
            </div>
            <p className="muted" style={{ marginTop: 10 }}>
              With a home you can sleep to full energy any time. Without one, benches get you back to 70.
            </p>
            <button className="btn block" disabled={!afford} onClick={() => setConfirm(true)}>
              {afford ? 'Rent this room' : `Need ${formatMoney(pack, home.moveInCost - balance)} more`}
            </button>
          </>
        ) : (
          <>
            <p>
              Pay <b className="num">{formatMoney(pack, home.moveInCost)}</b> to move in? You will have <b className="num">{formatMoney(pack, balance - home.moveInCost)}</b> left. This can't be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="btn" onClick={() => rentHome(home.id) && setConfirm(false)}>
                Confirm · pay {formatMoney(pack, home.moveInCost)}
              </button>
              <button className="btn ghost" onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** Short fade while resting; the store applies the energy when it ends. */
export function RestOverlay() {
  const resting = useGame((s) => s.resting);
  const finish = useGame((s) => s.finishRest);
  useEffect(() => {
    if (!resting) return;
    const t = setTimeout(finish, Math.max(0, resting.until - Date.now()));
    return () => clearTimeout(t);
  }, [resting, finish]);
  if (!resting) return null;
  return (
    <div className="rest-overlay" role="status">
      <IconBed size={34} />
      <div>{resting.at === 'home' ? 'Sleeping…' : 'Resting on the bench…'}</div>
    </div>
  );
}
