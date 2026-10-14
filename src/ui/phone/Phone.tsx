import { useEffect, useState, type ReactNode } from 'react';
import { findItem, findNpc, formatMoney } from '../../game/content';
import type { ItemCategory } from '../../game/content/types';
import { completedCount, isAvailable } from '../../game/systems/jobs';
import { totalItems } from '../../game/systems/inventory';
import { useGame, type PhoneApp } from '../../game/store/gameStore';
import { saves } from '../../game/persistence/instance';
import { usePack } from '../../scene/worldContext';
import { MapView } from '../hud/MapView';
import { describeLook } from '../avatar/AvatarEditor';
import { formatClock, formatDuration } from '../hooks';
import {
  IconBack, IconBag, IconBed, IconChat, IconGear, IconJobs, IconMap, IconPlane, IconTicket, IconUser, IconWallet, IconLock, ITEM_ICONS,
} from '../icons/Icons';

type AppId = PhoneApp | 'messages' | 'travel' | 'events' | 'bookings';

const APPS: { id: AppId; name: string; Icon: (p: { size?: number }) => JSX.Element; live: boolean }[] = [
  { id: 'map', name: 'Map', Icon: IconMap, live: true },
  { id: 'jobs', name: 'Jobs', Icon: IconJobs, live: true },
  { id: 'bag', name: 'Bag', Icon: IconBag, live: true },
  { id: 'wallet', name: 'Wallet', Icon: IconWallet, live: true },
  { id: 'messages', name: 'Messages', Icon: IconChat, live: false },
  { id: 'travel', name: 'Travel', Icon: IconPlane, live: false },
  { id: 'events', name: 'Events', Icon: IconTicket, live: false },
  { id: 'bookings', name: 'Bookings', Icon: IconBed, live: false },
  { id: 'profile', name: 'Profile', Icon: IconUser, live: true },
  { id: 'settings', name: 'Settings', Icon: IconGear, live: true },
];

const LOCKED_COPY: Record<string, string> = {
  messages: 'Texts from people you meet around town will land here.',
  travel: 'Plan a trip, compare fares and buy your ticket. Opens with the airport.',
  events: 'Concerts, festivals and owambes near you, with tickets.',
  bookings: 'Hotel rooms and tickets you have booked, ready for check-in.',
};

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

export function Phone() {
  const app = useGame((s) => s.phoneApp);
  const setApp = useGame((s) => s.setPhoneApp);
  const close = useGame((s) => s.closePanel);
  const [locked, setLocked] = useState<string | null>(null);
  const now = useNow(15000);
  const time = new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const open = (id: AppId) => {
    const def = APPS.find((a) => a.id === id)!;
    if (def.live) {
      setLocked(null);
      setApp(id as PhoneApp);
    } else setLocked(id);
  };
  const back = () => {
    setLocked(null);
    setApp('home');
  };
  const showing = locked ?? app;
  const def = APPS.find((a) => a.id === showing);

  return (
    <section className="phone" role="dialog" aria-label="Phone">
      <div className="screen">
        {showing === 'home' && <div className="wallpaper" />}
        <div className="statusbar" style={{ position: 'relative' }}>
          <span className="num">{time}</span>
          <span>Retreva · 4G</span>
        </div>
        {showing === 'home' ? (
          <Home open={open} now={now} />
        ) : (
          <>
            <div className="appbar">
              <button className="icon-btn" style={{ width: 36, height: 36, background: 'transparent', border: 0 }} onClick={back} aria-label="Back to home">
                <IconBack size={20} />
              </button>
              <h2>{def?.name}</h2>
            </div>
            <div className="content">
              {locked ? (
                <Locked id={locked} />
              ) : app === 'jobs' ? (
                <JobsApp />
              ) : app === 'bag' ? (
                <BagApp />
              ) : app === 'wallet' ? (
                <WalletApp />
              ) : app === 'map' ? (
                <MapApp />
              ) : app === 'profile' ? (
                <ProfileApp />
              ) : app === 'settings' ? (
                <SettingsApp />
              ) : null}
            </div>
          </>
        )}
        <div className="homebar">
          <button onClick={showing === 'home' ? close : back} aria-label={showing === 'home' ? 'Put phone away' : 'Home'} />
        </div>
      </div>
    </section>
  );
}

function Home({ open, now }: { open: (id: AppId) => void; now: number }) {
  const pack = usePack();
  const jobs = useGame((s) => s.jobs);
  const close = useGame((s) => s.closePanel);
  const avail = pack.jobs.filter((j) => isAvailable(jobs, j, now)).length + (jobs.active ? 1 : 0);
  const d = new Date(now);
  return (
    <div className="phone-home">
      <div className="clock num">{d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="date">
        {d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {pack.name}
      </div>
      <div className="apps">
        {APPS.map((a) => (
          <button key={a.id} className={`app ${a.live ? '' : 'soon'} ${a.id === 'jobs' && avail ? 'live' : ''}`} onClick={() => open(a.id)} aria-label={a.live ? a.name : `${a.name} (coming later)`}>
            <span className="tile">{a.live ? <a.Icon size={24} /> : <a.Icon size={22} />}</span>
            {a.name}
            {a.id === 'jobs' && avail > 0 && <span className="badge">{avail}</span>}
          </button>
        ))}
      </div>
      <button className="btn ghost block" style={{ marginTop: 22 }} onClick={close}>
        Put phone away
      </button>
    </div>
  );
}

function Locked({ id }: { id: string }) {
  return (
    <div className="empty">
      <IconLock size={34} style={{ color: 'var(--faint)' }} />
      <p style={{ color: 'var(--cream)', fontWeight: 700, fontSize: 'var(--fs-md)', margin: '14px 0 6px' }}>Not on this street yet</p>
      <p style={{ margin: 0 }}>{LOCKED_COPY[id]}</p>
    </div>
  );
}

function JobsApp() {
  const pack = usePack();
  const jobs = useGame((s) => s.jobs);
  const now = useNow(500);
  return (
    <>
      {pack.jobs.map((j) => {
        const giver = findNpc(pack, j.giverNpcId);
        const to = findNpc(pack, j.dropoffNpcId);
        const active = jobs.active?.jobId === j.id;
        const cool = (jobs.cooldownUntil[j.id] ?? 0) - now;
        const done = completedCount(jobs, j.id);
        return (
          <article className="job-card" key={j.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3>{j.title}</h3>
              {active ? <span className="chip live">Live</span> : cool > 0 ? <span className="chip num">Back in {formatClock(cool)}</span> : <span className="chip">Open</span>}
            </div>
            <p>{j.summary}</p>
            <div className="meta num">
              <span>Pay {formatMoney(pack, j.reward)}</span>
              <span>+{formatMoney(pack, j.bonus.amount)} under {j.bonus.underMs / 1000}s</span>
              <span>Limit {j.timeLimitMs / 1000}s</span>
            </div>
            <div className="meta" style={{ marginTop: 8 }}>
              {active && jobs.active ? (
                <span style={{ color: 'var(--danfo)' }} className="num">
                  Deliver to {to?.name} · {formatClock(jobs.active.remainingMs)} left
                </span>
              ) : (
                <span>Ask {giver?.name} · {done ? `done ${done}×` : 'not tried yet'}</span>
              )}
            </div>
          </article>
        );
      })}
      <div className="eyelabel section-title">Recent work</div>
      {jobs.history.length === 0 && <div className="empty" style={{ padding: 18 }}>No jobs yet. Mama Titi is looking for a runner.</div>}
      {[...jobs.history].reverse().slice(0, 8).map((h) => (
        <div className="card-line" key={h.runId}>
          <div>
            <div>{pack.jobs.find((j) => j.id === h.jobId)?.title}</div>
            <div className="sub num">
              {h.outcome === 'completed' ? `${(h.elapsedMs / 1000).toFixed(1)}s` : 'Ran out of time'} · {new Date(h.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          {h.outcome === 'completed' ? <span className="pos num">+{formatMoney(pack, h.payout)}</span> : <span className="chip">Failed</span>}
        </div>
      ))}
    </>
  );
}

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  food: 'Food', drink: 'Drinks', clothing: 'Clothing', shoes: 'Shoes', bag: 'Bags', souvenir: 'Souvenirs',
  ticket: 'Tickets', document: 'Documents', collectible: 'Collectibles', goods: 'Goods',
};

function BagApp() {
  const pack = usePack();
  const inventory = useGame((s) => s.inventory);
  const consume = useGame((s) => s.consume);
  if (inventory.entries.length === 0) {
    return (
      <div className="empty">
        <IconBag size={34} style={{ color: 'var(--faint)' }} />
        <p>Your bag is empty. Iya Bisi and Mama Titi both sell things worth carrying.</p>
      </div>
    );
  }
  const groups = new Map<ItemCategory, typeof inventory.entries>();
  for (const e of inventory.entries) groups.set(e.category, [...(groups.get(e.category) ?? []), e]);
  return (
    <>
      <div className="eyelabel" style={{ marginBottom: 4 }}>{totalItems(inventory)} items</div>
      {[...groups.entries()].map(([cat, entries]) => (
        <div key={cat}>
          <div className="eyelabel section-title">{CATEGORY_LABEL[cat]}</div>
          <ul className="rows">
            {entries.map((e) => {
              const item = findItem(pack, e.itemId);
              const Icon = ITEM_ICONS[item?.icon ?? 'bag'] ?? ITEM_ICONS.bag;
              return (
                <li className="row-item" key={e.key}>
                  <span className="glyph cut-sm"><Icon size={20} /></span>
                  <div>
                    <div className="name">
                      {item?.name ?? e.itemId} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>×{e.quantity}</span>
                    </div>
                    <div className="desc num">Bought in {pack.name} · {formatMoney(pack, e.purchasePrice)} each</div>
                  </div>
                  <div className="side">
                    {item?.consumable && (
                      <button className="btn ghost" onClick={() => consume(e.key)}>
                        {item.category === 'drink' ? 'Drink' : 'Eat'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

function WalletApp() {
  const pack = usePack();
  const wallet = useGame((s) => s.wallet);
  const earned = wallet.ledger.filter((t) => t.amount > 0 && t.id !== 'start').reduce((n, t) => n + t.amount, 0);
  const spent = wallet.ledger.filter((t) => t.amount < 0).reduce((n, t) => n - t.amount, 0);
  return (
    <>
      <div className="eyelabel">Balance</div>
      <div className="stat-big num">{formatMoney(pack, wallet.balance)}</div>
      <div className="meta num" style={{ display: 'flex', gap: 16, fontSize: 'var(--fs-sm)', color: 'var(--muted)', marginTop: 4 }}>
        <span>Earned <b className="pos">{formatMoney(pack, earned)}</b></span>
        <span>Spent <b style={{ color: 'var(--cream-2)' }}>{formatMoney(pack, spent)}</b></span>
      </div>
      <div className="eyelabel section-title">Transactions</div>
      {[...wallet.ledger].reverse().slice(0, 30).map((t) => (
        <div className="card-line" key={t.id}>
          <div>
            <div>{t.reason}</div>
            <div className="sub num">{new Date(t.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          <span className={`num ${t.amount > 0 ? 'pos' : 'neg'}`}>
            {t.amount > 0 ? '+' : ''}
            {formatMoney(pack, t.amount)}
          </span>
        </div>
      ))}
    </>
  );
}

function MapApp() {
  const pack = usePack();
  return (
    <>
      <div className="cut" style={{ height: 380, background: '#2a231b', border: '1px solid var(--line)' }}>
        <MapView pack={pack} mode="full" />
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
        {pack.area}, {pack.name}. The yellow ring marks where you are needed. More of the city opens as you travel.
      </p>
    </>
  );
}

function Stat({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="card-line">
      <span style={{ color: 'var(--muted)' }}>{k}</span>
      <b className="num">{v}</b>
    </div>
  );
}

function ProfileApp() {
  const pack = usePack();
  const s = useGame();
  if (!s.profile) return null;
  const a = s.profile.avatar;
  const hairShown = a.hair !== 'bald' && a.headwear === 'none';
  const deliveries = s.jobs.history.filter((h) => h.outcome === 'completed').length;
  const earned = s.wallet.ledger.filter((t) => t.amount > 0 && t.id !== 'start').reduce((n, t) => n + t.amount, 0);
  return (
    <>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '6px 0 10px' }}>
        <div className="cut" style={{ width: 64, height: 64, background: a.top, display: 'grid', placeItems: 'center' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: a.skin, boxShadow: a.headwear !== 'none' ? `0 -6px 0 ${a.headColor}` : hairShown ? `0 -6px 0 ${a.hairColor}` : 'none' }} />
        </div>
        <div>
          <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800 }}>{s.profile.name}</div>
          <div style={{ color: 'var(--muted)', fontSize: 'var(--fs-sm)' }}>{describeLook(a)}</div>
          <div style={{ color: 'var(--muted)', fontSize: 'var(--fs-xs)' }}>Living in {pack.name} · since {new Date(s.profile.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
        </div>
      </div>
      <button className="btn block" style={{ margin: '4px 0 14px' }} onClick={s.openWardrobe}>
        Change look &amp; name
      </button>
      <Stat k="Time played" v={formatDuration(s.playTimeMs)} />
      <Stat k="Deliveries" v={deliveries} />
      <Stat k="Money earned" v={formatMoney(pack, earned)} />
      <Stat k="Items owned" v={totalItems(s.inventory)} />
      <Stat k="Cities visited" v="1 · Lagos" />
    </>
  );
}

function SettingsApp() {
  const settings = useGame((s) => s.settings);
  const update = useGame((s) => s.updateSettings);
  const resetAll = useGame((s) => s.resetAll);
  const [confirm, setConfirm] = useState(false);
  const status = saves.status;
  const savedAgo = status.lastSavedAt ? Math.max(0, Math.round((Date.now() - status.lastSavedAt) / 1000)) : null;

  const wipe = async () => {
    await saves.wipe();
    resetAll();
  };

  return (
    <>
      <div className="setting">
        <div>
          Camera sensitivity
          <div className="sub num">{settings.cameraSensitivity.toFixed(1)}×</div>
        </div>
        <input type="range" min={0.4} max={2} step={0.1} value={settings.cameraSensitivity} onChange={(e) => update({ cameraSensitivity: Number(e.target.value) })} aria-label="Camera sensitivity" />
      </div>
      <label className="setting">
        <div>Invert vertical look</div>
        <input type="checkbox" className="toggle" checked={settings.invertY} onChange={(e) => update({ invertY: e.target.checked })} />
      </label>
      <label className="setting">
        <div>
          Reduce motion
          <div className="sub">Calmer markers and transitions</div>
        </div>
        <input type="checkbox" className="toggle" checked={settings.reducedMotion} onChange={(e) => update({ reducedMotion: e.target.checked })} />
      </label>
      <div className="setting">
        <div>Text size</div>
        <div className="seg" role="group" aria-label="Text size">
          {([1, 1.15, 1.3] as const).map((v, i) => (
            <button key={v} aria-pressed={settings.textScale === v} onClick={() => update({ textScale: v })}>
              {['A', 'A+', 'A++'][i]}
            </button>
          ))}
        </div>
      </div>
      <div className="setting">
        <div>
          Shadows
          <div className="sub">Auto turns them off on phones</div>
        </div>
        <div className="seg" role="group" aria-label="Shadows">
          {(['auto', 'on', 'off'] as const).map((v) => (
            <button key={v} aria-pressed={settings.shadows === v} onClick={() => update({ shadows: v })}>
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <label className="setting">
        <div>Show frame rate</div>
        <input type="checkbox" className="toggle" checked={settings.showFps} onChange={(e) => update({ showFps: e.target.checked })} />
      </label>
      <div className="eyelabel section-title">Progress</div>
      <div className="card-line">
        <div>
          Saved on this device
          <div className="sub">{status.error ? `Save problem: ${status.error}` : savedAgo === null ? 'Not saved yet' : `Last saved ${savedAgo}s ago · ${status.adapter === 'indexeddb' ? 'IndexedDB' : 'local storage'}`}</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        {confirm ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn danger" style={{ flex: 1 }} onClick={wipe}>
              Erase everything
            </button>
            <button className="btn ghost" onClick={() => setConfirm(false)}>
              Keep
            </button>
          </div>
        ) : (
          <button className="btn danger block" onClick={() => setConfirm(true)}>
            Start a new life…
          </button>
        )}
      </div>
    </>
  );
}
