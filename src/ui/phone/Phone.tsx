import { useEffect, useState, type ReactNode } from 'react';
import { ALL_PACKS, findItem, findNpc, formatMoney, getDestination } from '../../game/content';
import type { ItemCategory } from '../../game/content/types';
import { completedCount, isAvailable } from '../../game/systems/jobs';
import { totalItems } from '../../game/systems/inventory';
import { progressSnapshot, requirementContext, useGame, type PhoneApp } from '../../game/store/gameStore';
import { meets } from '../../game/systems/requirements';
import { courierRank } from '../../game/systems/careers';
import { saves } from '../../game/persistence/instance';
import { usePack } from '../../scene/worldContext';
import { MapView } from '../hud/MapView';
import { LagosMap } from '../travel/LagosMap';
import { GOALS } from '../../game/systems/progress';
import { fareBetween, modeBetween, regionOf } from '../../game/content/regions';
import { findFlight, flightsFrom } from '../../game/content/flights';
import { tripBudget } from '../../game/systems/travel';
import { dayOf as gameDay, formatClock as formatGameClock, isOpen, opensAt } from '../../game/systems/clock';
import { findVehicle } from '../../game/content/vehicles';
import { describeLook } from '../avatar/AvatarEditor';
import { deviceEnv, resolveTier } from '../../game/core/quality';
import { needLabel, regardTier, skillLevel } from '../../game/systems/life';
import { formatClock, formatDuration } from '../hooks';
import { BookingsApp, EventsApp } from '../panels/EventPanels';
import { PerformanceSection } from '../panels/PerfPanels';
import { cityMissing, cityOfArea, ensureForSave } from '../../game/content/cities';
import { CitiesSection, useCityReady } from '../panels/CityPanels';
import { keepOffline } from '../../game/content/cityStore';
import {
  IconBack, IconBag, IconBed, IconBus, IconChat, IconGear, IconJobs, IconMap, IconPlane, IconTicket, IconUser, IconWallet, IconLock, ITEM_ICONS,
} from '../icons/Icons';

type AppId = PhoneApp;

const APPS: { id: AppId; name: string; Icon: (p: { size?: number }) => JSX.Element; live: boolean }[] = [
  { id: 'map', name: 'Map', Icon: IconMap, live: true },
  { id: 'jobs', name: 'Jobs', Icon: IconJobs, live: true },
  { id: 'bag', name: 'Bag', Icon: IconBag, live: true },
  { id: 'wallet', name: 'Wallet', Icon: IconWallet, live: true },
  { id: 'messages', name: 'Messages', Icon: IconChat, live: true },
  { id: 'travel', name: 'Travel', Icon: IconPlane, live: true },
  { id: 'events', name: 'Events', Icon: IconTicket, live: true },
  { id: 'bookings', name: 'Bookings', Icon: IconBed, live: true },
  { id: 'profile', name: 'Profile', Icon: IconUser, live: true },
  { id: 'settings', name: 'Settings', Icon: IconGear, live: true },
];

const LOCKED_COPY: Record<string, string> = {
  messages: 'Texts from people you meet around town will land here.',
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
  const time = useGame((s) => formatGameClock(s.world.time ?? 480));
  const now = useNow(15000);

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
              ) : app === 'events' ? (
                <EventsApp />
              ) : app === 'bookings' ? (
                <BookingsApp />
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
  const gameTime = useGame((s) => s.world.time ?? 480);
  return (
    <div className="phone-home">
      <div className="clock num">{formatGameClock(gameTime)}</div>
      <div className="date">
        Day {gameDay(gameTime)} · {pack.name}
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
  const snap = progressSnapshot(s);
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

/** Courier rank and work skills, with progress to the next step. */
function Careers() {
  const jobs = useGame((s) => s.jobs);
  const skills = useGame((s) => s.life.skills);
  const runs = jobs.history.filter((h) => h.outcome === 'completed' && ALL_PACKS.flatMap((p) => p.jobs).find((j) => j.id === h.jobId)?.kind !== 'tour').length;
  const rank = courierRank(runs);
  const tours = jobs.history.filter((h) => h.outcome === 'completed' && ALL_PACKS.flatMap((p) => p.jobs).find((j) => j.id === h.jobId)?.kind === 'tour').length;
  return (
    <div className="careers" aria-label="Careers">
      <div className="card-line">
        <div>
          <div>Courier · {rank.name}</div>
          <div className="sub num">
            {runs} errands{rank.bonus ? ` · +${Math.round(rank.bonus * 100)}% pay` : ''}{rank.next ? ` · ${rank.next.at - runs} more for ${rank.next.name}` : ' · top rank'}
          </div>
        </div>
      </div>
      <div className="card-line">
        <div>
          <div>Cooking · level {skillLevel(skills.cooking)}</div>
          <div className="sub num">{skills.cooking ?? 0} XP · kitchen shifts</div>
        </div>
      </div>
      <div className="card-line">
        <div>
          <div>Repair · level {skillLevel(skills.repair)}</div>
          <div className="sub num">{skills.repair ?? 0} XP · repair bench in Ikeja</div>
        </div>
      </div>
      <div className="card-line">
        <div>
          <div>Guiding</div>
          <div className="sub num">{tours} tours given</div>
        </div>
      </div>
    </div>
  );
}

function WorkList() {
  const pack = usePack();
  const jobs = useGame((s) => s.jobs);
  const reqCtx = useGame((s) => requirementContext(s));
  const now = useNow(500);
  return (
    <>
      <div className="eyelabel section-title">Careers</div>
      <Careers />
      <div className="eyelabel section-title">Work in {pack.area}</div>
      {(pack.repairs ?? []).map((r) => {
        const req = meets(r.requires, reqCtx);
        return (
          <article className="job-card" key={r.id} data-locked={req.ok ? 'no' : 'yes'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3>{r.title}</h3>
              {req.ok ? <span className="chip">Open</span> : <span className="chip">Locked</span>}
            </div>
            <p>Fix {r.perSession} phones per session: do each repair’s steps in the right order. Pay per phone fixed, more with skill.</p>
            <div className="meta num">
              <span>{formatMoney(pack, r.payPerDevice)} per phone</span>
              <span>+{formatMoney(pack, r.perfectTip)} for clean work</span>
            </div>
            <div className="meta" style={{ marginTop: 8 }}>
              {req.ok ? <span>Ask {findNpc(pack, r.npcId)?.name}</span> : <span className="req">Needs: {req.missing.join(' · ')}</span>}
            </div>
          </article>
        );
      })}
      {pack.jobs.map((j) => {
        const giver = findNpc(pack, j.giverNpcId);
        const to = findNpc(pack, j.dropoffNpcId);
        const active = jobs.active?.jobId === j.id;
        const cool = (jobs.cooldownUntil[j.id] ?? 0) - now;
        const done = completedCount(jobs, j.id);
        const req = meets(j.requires, reqCtx);
        return (
          <article className="job-card" key={j.id} data-locked={req.ok ? 'no' : 'yes'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3>{j.title}</h3>
              {active ? <span className="chip live">Live</span> : !req.ok ? <span className="chip">Locked</span> : cool > 0 ? <span className="chip num">Back in {formatClock(cool)}</span> : <span className="chip">Open</span>}
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
              ) : !req.ok ? (
                <span className="req">Needs: {req.missing.join(' · ')}</span>
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
  ticket: 'Tickets', document: 'Documents', collectible: 'Collectibles', goods: 'Goods', furniture: 'Furniture',
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
                      <button className="btn ghost" onClick={() => consume(e.key)} aria-label={`${item.category === 'drink' ? 'Drink' : 'Eat'} ${item.name}, fullness +${item.nutrition ?? (item.category === 'drink' ? 8 : 20)}`}>
                        {item.category === 'drink' ? 'Drink' : 'Eat'} +{item.nutrition ?? (item.category === 'drink' ? 8 : 20)}
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
  const now = useGame((s) => Math.floor((s.world.time ?? 480) / 10) * 10);
  const people = pack.npcs.filter((n) => n.hours);
  return (
    <>
      <div className="cut" style={{ height: 380, background: '#2a231b', border: '1px solid var(--line)' }}>
        <MapView pack={pack} mode="full" />
      </div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5 }}>
        {pack.area}, {pack.name}. Yellow marks work, teal marks the danfo stop.
      </p>
      {people.length > 0 && (
        <>
          <div className="eyelabel section-title">Around here · {formatGameClock(now)}</div>
          {people.map((n) => {
            const open = isOpen(n.hours, now);
            return (
              <div className="card-line" key={n.id} data-open={open ? 'yes' : 'no'}>
                <div>
                  <div>{n.name}</div>
                  <div className="sub">
                    {n.role} · {opensAt(n.hours!)}–{String(n.hours![1]).padStart(2, '0')}:00
                  </div>
                </div>
                {open ? <span className="chip live">Open</span> : <span className="chip">Opens {opensAt(n.hours!)}</span>}
              </div>
            );
          })}
        </>
      )}
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
  const ticket = useGame((s) => s.travel.ticket);
  const history = useGame((s) => s.travel.history);
  const pack = usePack();
  const region = regionOf(current);
  const airport = region?.areas.find((a) => a.hub);
  const routes = airport ? flightsFrom(airport.id) : [];
  const ride = region?.transit ?? 'Danfo';
  return (
    <>
      {ticket && <BoardingPass />}
      <h3 className="phone-sub">Flights from {region?.name}</h3>
      {routes.map((r) => (
        <FlightCard key={r.id} routeId={r.id} />
      ))}
      <h3 className="phone-sub">Around {region?.name}</h3>
      {region?.map === 'lagos' && (
        <div className="travel-map cut-sm" style={{ marginBottom: 12 }}>
          <LagosMap current={current} visited={visited} />
        </div>
      )}
      {region?.areas.map((a) => {
        const dest = getDestination(a.id);
        const found = dest.landmarks.filter((l) => discovered.includes(l.id)).length;
        const here = a.id === current;
        return (
          <div className="card-line" key={a.id}>
            <div style={{ minWidth: 0 }}>
              <div>
                {a.district} {here && <span className="chip live" style={{ marginLeft: 6 }}>You are here</span>}
              </div>
              <div className="sub">
                {a.known} · {here ? 'here' : modeBetween(current, a.id)} · landmarks {found}/{dest.landmarks.length}
              </div>
            </div>
            <span className="num" style={{ color: here ? 'var(--muted)' : 'var(--cream)', fontWeight: 750 }}>
              {here ? '—' : formatMoney(pack, fareBetween(current, a.id))}
            </span>
          </div>
        );
      })}
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--muted)', lineHeight: 1.5, marginTop: 12 }}>
        <IconBus size={16} style={{ verticalAlign: '-3px', marginRight: 6 }} />
        To ride, talk to a {ride === 'Taxi' ? 'taxi driver' : `${ride.toLowerCase()} conductor or taxi driver`} (look for the teal marker).
      </p>
      {history.length > 0 && (
        <>
          <h3 className="phone-sub">Trips</h3>
          {[...history].reverse().map((h) => {
            const r = findFlight(h.routeId);
            return (
              <div className="card-line" key={h.ticketId}>
                <div>
                  <div>
                    {r?.code} · {regionOf(r?.from ?? '')?.name} → {r?.cityName}
                  </div>
                  <div className="sub num">{new Date(h.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <span className="chip done">Flown</span>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}

const STAGES = ['booked', 'checked-in', 'cleared'] as const;

/** The ticket you hold: where it goes, which gate, and the next airport step. */
function BoardingPass() {
  const ticket = useGame((s) => s.travel.ticket)!;
  const current = useGame((s) => s.destinationId);
  const route = findFlight(ticket.routeId);
  if (!route) return null;
  const from = regionOf(route.from);
  const atAirport = current === route.from;
  const step = STAGES.indexOf(ticket.stage);
  const next =
    ticket.stage === 'booked'
      ? atAirport
        ? 'Next: check in at the Gulf Coast Air desk under the DEPARTURES sign.'
        : `Next: take a taxi to ${from?.name} airport${regionOf(current) === from ? '' : ' (this ticket leaves from another city)'}.`
      : ticket.stage === 'checked-in'
        ? 'Next: security — no bottled drinks past the arch.'
        : `Next: gate ${route.gate} — board your flight.`;
  return (
    <div className="pass cut" data-stage={ticket.stage} aria-label={`Boarding pass ${route.code} to ${route.cityName}, ${ticket.stage}`}>
      <div className="pass-head">
        <div>
          <div className="eyelabel">{route.carrier} · {ticket.roundTrip ? 'return ticket' : ticket.paid === 0 ? 'return half' : 'one-way'}</div>
          <div className="pass-route">
            {from?.name} <IconPlane size={16} /> {route.cityName}
          </div>
        </div>
        <div className="pass-code num">
          {route.code}
          <span>Gate {route.gate}</span>
        </div>
      </div>
      <ol className="pass-steps">
        {['Ticket', 'Check-in', 'Security', 'Gate'].map((label, i) => (
          <li key={label} className={i <= step ? 'done' : i === step + 1 ? 'now' : ''}>
            {label}
          </li>
        ))}
      </ol>
      <p className="pass-next">{next}</p>
    </div>
  );
}

/** One route: trip budget (taxi, ticket, stay, getting around), one-way or return, book with a confirm step. */
function FlightCard({ routeId }: { routeId: string }) {
  const route = findFlight(routeId)!;
  const pack = usePack();
  const current = useGame((s) => s.destinationId);
  const balance = useGame((s) => s.wallet.balance);
  const ticket = useGame((s) => s.travel.ticket);
  const homes = useGame((s) => s.life.homes);
  const book = useGame((s) => s.bookFlight);
  const [roundTrip, setRoundTrip] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const cityHomes = cityOfArea(route.arriveAt)?.homeIds ?? [];
  const city = useCityReady(route.arriveAt);
  const budget = tripBudget(route, {
    taxiToAirport: fareBetween(current, route.from),
    roundTrip,
    hasStay: cityHomes.some((id) => homes.includes(id)),
  });
  const short = budget.dueNow - balance;
  const kind = roundTrip ? 'return' : 'one-way';
  return (
    <div className="flight cut-sm" data-route={route.id}>
      <div className="flight-head">
        <div>
          <div className="name">
            {route.cityName}, {route.country}
          </div>
          <div className="sub">
            {route.carrier} {route.code} · about {route.minutes} min · gate {route.gate} · ECOWAS, no visa
          </div>
        </div>
      </div>
      <div className="seg" role="group" aria-label={`Ticket type to ${route.cityName}`}>
        <button aria-pressed={roundTrip} onClick={() => { setRoundTrip(true); setConfirm(false); }}>Return</button>
        <button aria-pressed={!roundTrip} onClick={() => { setRoundTrip(false); setConfirm(false); }}>One-way</button>
      </div>
      <ul className="budget" aria-label={`Trip budget to ${route.cityName}`}>
        {budget.lines.map((l) => (
          <li key={l.key} data-line={l.key}>
            <span>
              {l.label}
              {l.note && <small>{l.note}</small>}
            </span>
            <b className="num">{l.amount ? formatMoney(pack, l.amount) : '—'}</b>
          </li>
        ))}
        <li className="total">
          <span>Trip estimate</span>
          <b className="num">{formatMoney(pack, budget.total)}</b>
        </li>
      </ul>
      {ticket ? (
        <p className="muted">You already hold a ticket — use it before booking another.</p>
      ) : short > 0 ? (
        <p className="muted">
          The ticket is {formatMoney(pack, budget.dueNow)} — you need <b className="num">{formatMoney(pack, short)}</b> more. Shifts and jobs pay; every area has work.
        </p>
      ) : city !== 'ready' ? (
        <p className="muted" data-city={city}>
          {city === 'loading' ? `Getting ${route.cityName} ready…` : `${route.cityName} isn't on this device and can't download right now. Connect to the internet to book.`}
        </p>
      ) : !confirm ? (
        <button className="btn block" onClick={() => setConfirm(true)} aria-label={`Book ${kind} ticket to ${route.cityName} for ${formatMoney(pack, budget.dueNow)}`}>
          Book {kind} · {formatMoney(pack, budget.dueNow)}
        </button>
      ) : (
        <div className="confirm-row">
          <button className="btn block" onClick={() => { if (book(route.id, roundTrip)) { setConfirm(false); const c = cityOfArea(route.arriveAt); if (c && !c.builtIn) void keepOffline(c.id).catch(() => undefined); } }}>
            Confirm · pay {formatMoney(pack, budget.dueNow)}
          </button>
          <button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
        </div>
      )}
      {!ticket && short <= 0 && <p className="fine">Only the ticket is charged now. Stay and getting around are estimates you pay as you go. Booking also keeps {route.cityName} on this device for offline play (Settings → Cities).{route.note ? ` ${route.note}` : ''}</p>}
    </div>
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

function LifeSection() {
  const life = useGame((s) => s.life);
  const homes = life.homes.map((id) => ALL_PACKS.flatMap((p) => p.homes ?? []).find((h) => h.id === id)?.name ?? 'Your room');
  const people = Object.entries(life.regard).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <h3 className="phone-sub">Life</h3>
      <Stat k="Energy" v={`${Math.round(life.needs.energy)} · ${needLabel('energy', life.needs.energy)}`} />
      <Stat k="Fullness" v={`${Math.round(life.needs.fullness)} · ${needLabel('fullness', life.needs.fullness)}`} />
      <Stat k={homes.length > 1 ? 'Homes' : 'Home'} v={homes.length ? homes.join(' · ') : 'None yet'} />
      <Stat k="Shifts worked" v={life.shiftsDone} />
      <Stat
        k="Vehicles"
        v={
          life.vehicles.length
            ? life.vehicles
                .map((v) => `${findVehicle(v.vehicleId)?.name ?? v.vehicleId} · ${life.riding === v.uid ? 'riding' : `parked in ${v.parked ? getDestination(v.parked.areaId).area : '—'}`}`)
                .join(' · ')
            : 'None yet'
        }
      />
      <h3 className="phone-sub">Skills</h3>
      <Stat k="Cooking" v={`Level ${skillLevel(life.skills.cooking)} · ${life.skills.cooking ?? 0} XP`} />
      <h3 className="phone-sub">People</h3>
      {people.length === 0 ? (
        <p className="muted" style={{ fontSize: 'var(--fs-sm)' }}>Work with people and they'll get to know you.</p>
      ) : (
        people.map(([id, v]) => {
          const npc = ALL_PACKS.flatMap((p) => p.npcs).find((n) => n.id === id);
          return <Stat key={id} k={npc?.name ?? id} v={`${regardTier(v)} · ${Math.round(v)}`} />;
        })
      )}
    </>
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
      <LifeSection />
    </>
  );
}

/** Shows whether this device can launch the game without a connection. */
function OfflineStatus() {
  const [ready, setReady] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        if (!('serviceWorker' in navigator) || !('caches' in window)) return alive && setReady(false);
        const keys = (await caches.keys()).filter((k) => k.startsWith('retreva-'));
        alive && setReady(!!navigator.serviceWorker.controller && keys.length > 0);
      } catch {
        alive && setReady(false);
      }
    };
    void check();
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="setting">
      <div>
        Offline play
        <div className="sub">{ready ? 'Ready — this device can open and play the game without internet.' : ready === false ? 'Not ready yet — open the game once online in a regular browser tab.' : 'Checking…'}</div>
      </div>
      <b data-offline={ready ? 'ready' : 'no'} style={{ fontSize: 'var(--fs-sm)' }}>{ready ? 'Ready' : ready === false ? 'Not yet' : '…'}</b>
    </div>
  );
}

function GraphicsSetting() {
  const graphics = useGame((s) => s.settings.graphics ?? 'auto');
  const update = useGame((s) => s.updateSettings);
  const tier = resolveTier(graphics, deviceEnv());
  return (
    <div className="setting">
      <div>
        Graphics
        <div className="sub">
          Now: {tier[0].toUpperCase() + tier.slice(1)}
          {graphics === 'auto' ? ' (picked for this device)' : ''} · Low saves battery on older phones
        </div>
      </div>
      <div className="seg" role="group" aria-label="Graphics quality">
        {(['auto', 'low', 'medium', 'high'] as const).map((v) => (
          <button key={v} aria-pressed={graphics === v} onClick={() => update({ graphics: v })}>
            {v === 'medium' ? 'Med' : v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Export / import the save as a file: a manual backup that survives clearing the browser, and a way to move a game to another browser. */
function SaveBackup() {
  const hydrate = useGame((s) => s.hydrate);
  const setPhase = useGame((s) => s.setPhase);
  const [info, setInfo] = useState<{ persisted: boolean; usage: number; quota: number } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  useEffect(() => {
    void saves.storageInfo().then(setInfo);
  }, []);
  const exportSave = async () => {
    const text = await saves.exportJson();
    if (!text) return setMsg('Nothing to export yet.');
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `retreva-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMsg('Save file downloaded. Keep it somewhere safe.');
  };
  const importSave = async () => {
    if (!pending) return;
    try {
      const data = await saves.importJson(await pending.text());
      const ready = await ensureForSave(data);
      if (!ready.ok) {
        setMsg(cityMissing(ready.city));
        setPending(null);
        return;
      }
      hydrate(data);
      setPhase('loading');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'That file could not be imported.');
      setPending(null);
    }
  };
  const mb = (n: number) => (n / (1024 * 1024)).toFixed(n < 1024 * 1024 * 10 ? 1 : 0);
  return (
    <div className="backup" data-persisted={info?.persisted ? 'yes' : 'no'}>
      <p className="sub">
        Clearing this browser's data erases local progress. {info?.persisted ? 'This browser has agreed to keep Retreva’s storage.' : 'Export a save file now and then as a backup.'}
        {info && info.quota > 0 && ` Using ${mb(info.usage)} MB of ${mb(info.quota)} MB.`}
      </p>
      <div className="backup-row">
        <button className="btn ghost" onClick={exportSave}>
          Export save file
        </button>
        <label className="btn ghost file-btn">
          Import save file
          <input type="file" accept="application/json,.json" onChange={(e) => { setMsg(null); setPending(e.target.files?.[0] ?? null); }} />
        </label>
      </div>
      {pending && (
        <div className="backup-row">
          <button className="btn danger" onClick={importSave}>
            Replace current game with {pending.name}
          </button>
          <button className="btn ghost" onClick={() => setPending(null)}>
            Cancel
          </button>
        </div>
      )}
      {msg && <p className="sub" role="status">{msg}</p>}
    </div>
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
      <div className="eyelabel section-title">Sound</div>
      <label className="setting">
        <div>
          Sound
          <div className="sub">City ambience and effects, made on your device — nothing to download</div>
        </div>
        <input type="checkbox" className="toggle" checked={!(settings.muted ?? false)} onChange={(e) => update({ muted: !e.target.checked })} aria-label="Sound on" />
      </label>
      <div className="setting">
        <div>
          City ambience
          <div className="sub num">{Math.round((settings.ambienceVolume ?? 0.7) * 100)}%</div>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={settings.ambienceVolume ?? 0.7} onChange={(e) => update({ ambienceVolume: Number(e.target.value) })} aria-label="City ambience volume" disabled={settings.muted ?? false} />
      </div>
      <div className="setting">
        <div>
          Effects
          <div className="sub num">{Math.round((settings.effectsVolume ?? 0.8) * 100)}%</div>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={settings.effectsVolume ?? 0.8} onChange={(e) => update({ effectsVolume: Number(e.target.value) })} aria-label="Effects volume" disabled={settings.muted ?? false} />
      </div>
      <div className="setting">
        <div>
          Music
          <div className="sub num">{(settings.musicVolume ?? 0.4) > 0 ? `${Math.round((settings.musicVolume ?? 0.4) * 100)}% · original, generated live` : 'Off'}</div>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={settings.musicVolume ?? 0.4} onChange={(e) => update({ musicVolume: Number(e.target.value) })} aria-label="Music volume" disabled={settings.muted ?? false} />
      </div>
      <div className="eyelabel section-title">Display</div>
      <GraphicsSetting />
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
      <OfflineStatus />
      <div className="eyelabel section-title">Cities on this device</div>
      <CitiesSection />
      <div className="eyelabel section-title">Performance</div>
      <PerformanceSection />
      <div className="eyelabel section-title">Progress</div>
      <div className="card-line">
        <div>
          Saved on this device
          <div className="sub">{status.error ? `Save problem: ${status.error}` : savedAgo === null ? 'Not saved yet' : `Last saved ${savedAgo}s ago · ${status.adapter === 'indexeddb' ? 'IndexedDB' : 'local storage'}`}</div>
        </div>
      </div>
      <SaveBackup />
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
