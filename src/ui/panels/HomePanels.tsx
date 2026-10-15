import { useState } from 'react';
import { findItem, formatMoney } from '../../game/content';
import { findFurniture, findInterior, WELL_RESTED_COMFORT } from '../../game/content/interiors';
import { useGame } from '../../game/store/gameStore';
import { isOpen } from '../../game/systems/clock';
import { comfort, fits, homeValuation } from '../../game/systems/home';
import { usePack } from '../../scene/worldContext';
import { IconBag, IconClose, IconCup, IconHome, IconPlate, IconStar } from '../icons/Icons';

function Head({ eyelabel, title, sub }: { eyelabel: string; title: string; sub?: string }) {
  const close = useGame((s) => s.closePanel);
  return (
    <>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">{eyelabel}</div>
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
    </>
  );
}

/** Comfort meter: four or more and you wake up well rested. */
export function ComfortMeter({ value }: { value: number }) {
  const pct = Math.min(100, (value / 10) * 100);
  return (
    <div className="comfort" data-comfort={value}>
      <div className="card-line">
        <span className="muted">Home comfort</span>
        <b className="num">{value}</b>
      </div>
      <div className="comfort-bar" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
        <b style={{ left: `${(WELL_RESTED_COMFORT / 10) * 100}%` }} />
      </div>
      <p className="muted small">{value >= WELL_RESTED_COMFORT ? 'Comfy: you wake up well rested (energy drains slower until midday).' : `Reach ${WELL_RESTED_COMFORT} to wake up well rested.`}</p>
    </div>
  );
}

/** Furnish a spot in your home with furniture from your bag. */
export function FurnishPanel() {
  const pack = usePack();
  const inside = useGame((s) => s.world.inside);
  const def = inside ? findInterior(inside.interiorId) : undefined;
  const prop = useGame((s) => (inside ? s.life.property[inside.interiorId] : undefined));
  const startSlot = useGame((s) => s.slotId);
  const bag = useGame((s) => s.inventory.entries);
  const placeIt = useGame((s) => s.placeFurniture);
  const removeIt = useGame((s) => s.removeFurniture);
  const [slotId, setSlot] = useState(startSlot ?? def?.slots[0]?.id ?? '');
  if (!def || !prop) return null;
  const slot = def.slots.find((x) => x.id === slotId) ?? def.slots[0];
  const here = prop.placed[slot.id];
  const options = bag.filter((e) => e.category === 'furniture' && fits(def, slot.id, e.itemId));
  return (
    <section className="sheet cut furnish" role="dialog" aria-label="Furnish your home">
      <Head eyelabel="Make it yours" title="Furnish" sub="Put furniture from your bag in a spot. What was there goes back to your bag." />
      <div className="sheet-body">
        <div className="slot-tabs" role="tablist" aria-label="Spots in the room">
          {def.slots.map((sl) => (
            <button key={sl.id} role="tab" aria-selected={sl.id === slot.id} data-slot={sl.id} className={`slot-chip ${sl.id === slot.id ? 'on' : ''} ${prop.placed[sl.id] ? 'filled' : ''}`} onClick={() => setSlot(sl.id)}>
              {sl.label.replace(/ \(.*\)/, '')}
            </button>
          ))}
        </div>
        <div className="card-line" style={{ marginTop: 10 }}>
          <span className="muted">{slot.label}</span>
          <b>{here ? findItem(pack, here)?.name : 'Empty'}</b>
        </div>
        {here && (
          <button className="btn ghost block" onClick={() => removeIt(slot.id)} data-act="remove">
            <IconBag size={16} /> Take it back to your bag
          </button>
        )}
        <h3 className="list-h">From your bag</h3>
        {options.length === 0 ? (
          <p className="muted">Nothing in your bag fits here. Okon's shop in Yaba sells furniture ({slot.accepts.join(', ')}).</p>
        ) : (
          <ul className="hlist">
            {options.map((e) => {
              const it = findItem(pack, e.itemId);
              const f = findFurniture(e.itemId);
              return (
                <li key={e.key} className="hrow">
                  <span>
                    <b>{it?.name}</b>
                    <span className="muted small"> · comfort +{f?.comfort ?? 0}{e.quantity > 1 ? ` · ×${e.quantity}` : ''}</span>
                  </span>
                  <button className="btn sm" data-place={e.itemId} onClick={() => placeIt(slot.id, e.key)}>
                    Place
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <ComfortMeter value={comfort(prop)} />
      </div>
    </section>
  );
}

/** The storage chest: keep things at home instead of carrying them. */
export function StoragePanel() {
  const pack = usePack();
  const inside = useGame((s) => s.world.inside);
  const prop = useGame((s) => (inside ? s.life.property[inside.interiorId] : undefined));
  const bag = useGame((s) => s.inventory.entries);
  const store = useGame((s) => s.storeItem);
  const take = useGame((s) => s.takeItem);
  if (!prop) return null;
  const stored = prop.storage.reduce((n, x) => n + x.quantity, 0);
  return (
    <section className="sheet cut storage" role="dialog" aria-label="Storage chest">
      <Head eyelabel="Your chest" title="Storage" sub="Things in the chest stay here, safe, until you take them out." />
      <div className="sheet-body two-col">
        <div>
          <h3 className="list-h">In the chest · {stored}</h3>
          {prop.storage.length === 0 ? (
            <p className="muted">Empty.</p>
          ) : (
            <ul className="hlist" data-list="chest">
              {prop.storage.map((x, i) => (
                <li key={`${x.itemId}-${x.purchasePrice}-${i}`} className="hrow">
                  <span>
                    <b>{findItem(pack, x.itemId)?.name ?? x.itemId}</b> <span className="muted small num">×{x.quantity}</span>
                  </span>
                  <button className="btn sm ghost" data-take={x.itemId} onClick={() => take(i)}>
                    Take one
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="list-h">In your bag</h3>
          {bag.length === 0 ? (
            <p className="muted">Your bag is empty.</p>
          ) : (
            <ul className="hlist" data-list="bag">
              {bag.map((e) => (
                <li key={e.key} className="hrow">
                  <span>
                    <b>{findItem(pack, e.itemId)?.name ?? e.itemId}</b> <span className="muted small num">×{e.quantity}</span>
                  </span>
                  <button className="btn sm" data-store={e.itemId} onClick={() => store(e.key)}>
                    Store one
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

/** A restaurant menu: sit down and eat — fills you up and lifts your mood more than street food. */
export function MenuPanel() {
  const pack = usePack();
  const inside = useGame((s) => s.world.inside);
  const def = inside ? findInterior(inside.interiorId) : undefined;
  const balance = useGame((s) => s.wallet.balance);
  const needs = useGame((s) => s.life.needs);
  const order = useGame((s) => s.orderMeal);
  const time = useGame((s) => s.world.time ?? 480);
  const [pick, setPick] = useState<string | null>(null);
  if (!def?.menu) return null;
  const open = isOpen(def.hours, time);
  const dish = def.menu.find((m) => m.itemId === pick);
  return (
    <section className="sheet cut menu" role="dialog" aria-label={`${def.name} menu`}>
      <Head eyelabel="Sit down and eat" title={def.name} sub="A proper meal at a table fills you up and lifts your mood." />
      <div className="sheet-body">
        <div className="card-line">
          <span className="muted">Fullness {Math.round(needs.fullness)} · Joy {Math.round(needs.joy)}</span>
          <b className="num">{formatMoney(pack, balance)}</b>
        </div>
        {!open && <p className="warn-line">The kitchen has closed for the night.</p>}
        <ul className="hlist menu-list">
          {def.menu.map((m) => {
            const it = findItem(pack, m.itemId);
            const Icon = it?.category === 'drink' ? IconCup : IconPlate;
            return (
              <li key={m.itemId} className={`hrow ${pick === m.itemId ? 'picked' : ''}`}>
                <span>
                  <Icon size={16} /> <b>{it?.name}</b>
                  <span className="muted small"> · fills +{it?.nutrition ?? 0} · joy +{m.joy + 8}</span>
                </span>
                <button className="btn sm" data-dish={m.itemId} disabled={!open || balance < m.price} onClick={() => setPick(m.itemId)}>
                  {formatMoney(pack, m.price)}
                </button>
              </li>
            );
          })}
        </ul>
        {dish && (
          <div className="confirm-row">
            <p>
              Order <b>{findItem(pack, dish.itemId)?.name}</b> for <b className="num">{formatMoney(pack, dish.price)}</b>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn" data-act="order" onClick={() => order(dish.itemId)}>
                Order and eat
              </button>
              <button className="btn ghost" onClick={() => setPick(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Buy, sell or leave a home — shown in the door panel. */
export function TenurePanel({ homeId, inRoom }: { homeId: string; inRoom?: boolean }) {
  const pack = usePack();
  const home = pack.homes?.find((h) => h.id === homeId);
  const prop = useGame((s) => s.life.property[homeId]);
  const balance = useGame((s) => s.wallet.balance);
  const buy = useGame((s) => s.buyHome);
  const sell = useGame((s) => s.sellHome);
  const leave = useGame((s) => s.moveOut);
  const [confirm, setConfirm] = useState<'buy' | 'sell' | 'leave' | null>(null);
  if (!home) return null;
  const own = prop?.tenure === 'own';
  const value = prop ? homeValuation(prop) : 0;
  const things = prop ? Object.keys(prop.placed).length + prop.storage.reduce((n, x) => n + x.quantity, 0) : 0;
  if (confirm === 'buy' && home.buyPrice)
    return (
      <div className="tenure confirm-row">
        <p>
          Buy {home.name} for <b className="num">{formatMoney(pack, home.buyPrice)}</b>? You'll have <b className="num">{formatMoney(pack, balance - home.buyPrice)}</b> left. You can sell it later for 85% of the price.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" data-act="confirm-buy" onClick={() => buy(home.id) && setConfirm(null)}>
            Confirm · pay {formatMoney(pack, home.buyPrice)}
          </button>
          <button className="btn ghost" onClick={() => setConfirm(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  if (confirm === 'sell')
    return (
      <div className="tenure confirm-row">
        <p>
          Sell {home.name} for <b className="num">{formatMoney(pack, value)}</b>? {things ? `Your ${things} piece${things > 1 ? 's' : ''} of furniture and stored things go back to your bag. ` : ''}This can't be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" data-act="confirm-sell" onClick={() => sell(home.id)}>
            Confirm · sell
          </button>
          <button className="btn ghost" onClick={() => setConfirm(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  if (confirm === 'leave')
    return (
      <div className="tenure confirm-row">
        <p>Move out of {home.name}? Rent isn't refunded. {things ? 'Your furniture and stored things go back to your bag.' : ''}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn" data-act="confirm-leave" onClick={() => leave(home.id)}>
            Confirm · move out
          </button>
          <button className="btn ghost" onClick={() => setConfirm(null)}>
            Cancel
          </button>
        </div>
      </div>
    );
  return (
    <div className="tenure">
      <div className="card-line">
        <span className="muted">{own ? 'You own it' : 'You rent it'}</span>
        <b className="num">{own ? `Worth ${formatMoney(pack, value)}` : home.buyPrice ? `For sale · ${formatMoney(pack, home.buyPrice)}` : ''}</b>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!own && home.buyPrice && (
          <button className="btn sm" data-act="buy" disabled={balance < home.buyPrice} onClick={() => setConfirm('buy')}>
            <IconStar size={14} /> {balance < home.buyPrice ? `Buy · need ${formatMoney(pack, home.buyPrice - balance)} more` : 'Buy it'}
          </button>
        )}
        {own && !inRoom && (
          <button className="btn sm ghost" data-act="sell" onClick={() => setConfirm('sell')}>
            Sell
          </button>
        )}
        {!own && !inRoom && (
          <button className="btn sm ghost" data-act="leave" onClick={() => setConfirm('leave')}>
            <IconHome size={14} /> Move out
          </button>
        )}
      </div>
    </div>
  );
}
