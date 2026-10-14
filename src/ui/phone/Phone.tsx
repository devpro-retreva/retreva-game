import { useEffect, useState, type ReactNode } from 'react';
import { areaOfJob, findItem, findNpc, formatMoney, getDestination } from '../../game/content';
import type { ItemCategory } from '../../game/content/types';
import { completedCount, isAvailable } from '../../game/systems/jobs';
import { totalItems } from '../../game/systems/inventory';
import { useGame, type PhoneApp } from '../../game/store/gameStore';
import { saves } from '../../game/persistence/instance';
import { usePack } from '../../scene/worldContext';
import { MapView } from '../hud/MapView';
import { LagosMap } from '../travel/LagosMap';
import { GOALS } from '../../game/systems/progress';
import { LAGOS_AREAS, fareBetween } from '../../game/content/regions/lagosState';
import { describeLook } from '../avatar/AvatarEditor';
import { formatClock, formatDuration } from '../hooks';
import {
  IconBack, IconBag, IconBed, IconBus, IconChat, IconGear, IconJobs, IconMap, IconPlane, IconTicket, IconUser, IconWallet, IconLock, ITEM_ICONS,
} from '../icons/Icons';

type AppId = PhoneApp | 'messages' | 'travel' | 'events' | 'bookings';

const APPS: { id: AppId; name: string; Icon: (p: { size?: number }) => JSX.Element; live: boolean }[] = [
  { id: 'map', name: 'Map', Icon: IconMap, live: true },
  { id: 'jobs', name: 'Jobs', Icon: IconJobs, live: true },
  { id: 'bag', name: 'Bag', Icon: IconBag, live: true },
  { id: 'wallet', name: 'Wallet', Icon: IconWallet, live: true },
  { id: 'messages', name: 'Messages', Icon: IconChat, live: true },
  { id: 'travel', name: 'Travel', Icon: IconPlane, live: true },
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
              ) : app === 'messages' ? (
                <MessagesApp />
              ) : app === 'travel' ? (
                <TravelApp />
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
  const unread = useGame((s) => s.world.messages.filter((m) => !m.read).length);
  const d = new Date(now);
  return (
    <div className="phone-home">
      <div className="clock num">{d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
      <div className="date">
        {d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {pack.name}
      </div>
      <div className="apps">
        {APPS.map((a) => (
          <button key={a.id} className={`app ${a.live ? '' : 'soon'} ${a.id === 'jobs' && avail ? 'live' : ''}`} onClick={() => open(a.id)} aria-label={a.live ? (a.id === 'messages' && unread ? `Messages, ${unread} unread` : a.name) : `${a.name} (coming later)`}>
            <span className="tile">{a.live ? <a.Icon size={24} /> : <a.Icon size={22} />}</span>
            {a.name}
            {a.id === 'jobs' && avail > 0 && <span className="badge">{avail}</span>}
            {a.id === 'messages' && unread > 0 && <span className="badge">{unread}</span>}
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
  const [tab, setTab] = useState<'work' | 'goals'>('work');
  return (
    <>
      <div className="seg tabs" role="tablist" aria-label="Jobs or goals">
        <button role="tab" aria-selected={tab === 'work'} aria-pressed={tab === 'work'} onClick={() => setTab('work')}>
          Work here
        </button>
        <button role="tab" aria-selected={tab === 'goals'} aria-pressed={tab === 'goals'} onClick={() => setTab('goals')}>
          Goals
        </button>
      </div>
      {tab === 'work' ? <WorkList /> : <GoalsList />}
    </>
  );
}

function GoalsList() {
  const pack = usePack();
  const s = useGame();
  const snap = {
    jobs: s.jobs,
    jobArea: (id: string) => areaOfJob(id)?.id,
    visited: s.world.visited,
    discovered: s.world.discovered,
    inventory: s.inventory,
    bestBargain: s.world.bestBargain,
    rides: s.world.rides,
    totalAreas: LAGOS_AREAS.length,
  };
  const doneCount = s.world.goalsDone.length;
  return (
    <>
      <div className="eyelabel" style={{ margin: '12px 0 4px' }}>
        {doneCount} of {GOALS.length} complete
      </div>
      {GOALS.map((g) => {
        const [cur, target] = g.progress(snap);
        const done = s.world.goalsDone.includes(g.id);
        return (
          <div className={`goal-row ${done ? 'done' : ''}`} key={g.id}>
            <div style={{ minWidth: 0 }}>
              <div className="goal-title">{g.title}</div>
              <div className="sub">{g.description}</div>
              {!done && target > 1 && (
                <div className="goal-bar" aria-hidden="true">
                  <i style={{ width: `${(cur / target) * 100}%` }} />
                </div>
              )}
            </div>
            <div className="goal-side num">
              {done ? <span className="chip done">Done</span> : target > 1 ? `${cur}/${target}` : ''}
              <span className="sub">+{formatMoney(pack, g.reward)}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

function WorkList() {
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
  const discovered = useGame((s) => s.world.discovered);
  return (
    <>
      <div className="cut" style={{ height: 380, background: '#2a231b', border: '1px solid var(--line)' }}>
        <MapView pack={pack} mode="full" />
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
        {pack.area}, {pack.name}. Yellow marks work, teal marks the danfo stop.
      </p>
      <div className="eyelabel section-title">Landmarks here</div>
      {pack.landmarks.map((l) => {
        const found = discovered.includes(l.id);
        return (
          <div className="card-line" key={l.id}>
            <div>
              <div style={{ color: found ? 'var(--cream)' : 'var(--faint)' }}>{found ? l.name : 'Undiscovered'}</div>
              <div className="sub">{found ? l.blurb : 'Explore to find it.'}</div>
            </div>
            {found ? <span className="chip done">Found</span> : <span className="chip">?</span>}
          </div>
        );
      })}
    </>
  );
}

function MessagesApp() {
  const messages = useGame((s) => s.world.messages);
  if (!messages.length) {
    return (
      <div className="empty">
        <IconChat size={34} style={{ color: 'var(--faint)' }} />
        <p>No messages yet. People you work with and meet around Lagos will text you here.</p>
      </div>
    );
  }
  return (
    <ul className="messages" aria-label="Messages">
      {[...messages].reverse().map((m) => (
        <li key={m.id} className="message">
          <div className="avatar" aria-hidden="true">{m.from.replace(/^(Engr\.|Mrs\.|Mallam|Alhaja)\s+/, '').slice(0, 1)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="msg-head">
              <b>{m.from}</b>
              <span className="sub num">{new Date(m.at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <p>{m.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TravelApp() {
  const current = useGame((s) => s.destinationId);
  const visited = useGame((s) => s.world.visited);
  const discovered = useGame((s) => s.world.discovered);
  const pack = usePack();
  return (
    <>
      <div className="travel-map cut-sm" style={{ marginBottom: 12 }}>
        <LagosMap current={current} visited={visited} />
      </div>
      {LAGOS_AREAS.map((a) => {
        const dest = getDestination(a.id);
        const found = dest.landmarks.filter((l) => discovered.includes(l.id)).length;
        const here = a.id === current;
        return (
          <div className="card-line" key={a.id}>
            <div style={{ minWidth: 0 }}>
              <div>
                {a.district} {here && <span className="chip live" style={{ marginLeft: 6 }}>You are here</span>}
              </div>
              <div className="sub">{a.known} · landmarks {found}/{dest.landmarks.length}</div>
            </div>
            <span className="num" style={{ color: here ? 'var(--muted)' : 'var(--cream)', fontWeight: 750 }}>
              {here ? '—' : formatMoney(pack, fareBetween(current, a.id))}
            </span>
          </div>
        );
      })}
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
        <IconBus size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
        To ride, talk to the conductor at the bus stop (look for the teal marker).
      </p>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--faint)' }}>Flights to Accra, Abuja and beyond open with the airport.</p>
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
        <div>
          Tips
          <div className="sub">First-time hints about what to do next</div>
        </div>
        <input type="checkbox" className="toggle" checked={settings.tips} onChange={(e) => update({ tips: e.target.checked })} />
      </label>
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
