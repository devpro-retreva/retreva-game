import { useEffect, useState } from 'react';
import { CITY_PACKS, cityName, isCityLoaded, loadCity } from '../../game/content/cities';
import { ALL_PACKS, areaOfEvent, findEvent, formatMoney, getDestination, localPrice } from '../../game/content';
import { findInterior } from '../../game/content/interiors';
import { findFlight } from '../../game/content/flights';
import type { EventDef } from '../../game/content/types';
import { useGame } from '../../game/store/gameStore';
import { dayOf, formatClock } from '../../game/systems/clock';
import { gatePrice, nextShowing, onNow, ticketState, type TicketState } from '../../game/systems/events';
import { homeValuation } from '../../game/systems/home';
import { usePack } from '../../scene/worldContext';
import { IconClose, IconTicket } from '../icons/Icons';

const KIND_LABEL: Record<EventDef['kind'], string> = { concert: 'Live music', comedy: 'Comedy', festival: 'Street jam' };

/** "Today 19:00–22:00", "Tomorrow …", "Day 5 …" relative to the game clock. */
export function whenLabel(start: number, end: number, now: number): string {
  const d = dayOf(start) - dayOf(now);
  const day = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `Day ${dayOf(start)}`;
  return `${day} ${formatClock(start)}–${formatClock(end)}`;
}

/** At the venue's gate: show your ticket and go in, buy one at the gate, or see when it's next on. */
export function EventGatePanel() {
  const pack = usePack();
  const eventId = useGame((s) => s.eventId);
  const ev = eventId ? findEvent(eventId) : undefined;
  const time = useGame((s) => s.world.time ?? 480);
  const tickets = useGame((s) => s.world.tickets ?? []);
  const balance = useGame((s) => s.wallet.balance);
  const buy = useGame((s) => s.buyTicket);
  const attend = useGame((s) => s.attendEvent);
  const close = useGame((s) => s.closePanel);
  const [confirm, setConfirm] = useState(false);
  if (!ev) return null;
  const show = nextShowing(ev, time);
  const day = onNow(ev, time);
  const mine = show ? tickets.find((t) => t.eventId === ev.id && t.day === show.day && t.status === 'booked') : undefined;
  const gate = gatePrice(ev);
  return (
    <section className="sheet cut event-gate" role="dialog" aria-label={ev.name}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">{KIND_LABEL[ev.kind]} · {ev.venue}</div>
          <h2>{ev.name}</h2>
          <p>{ev.description}</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
        {show && (
          <div className="card-line">
            <span className="muted">{day !== null ? 'On now' : 'Next show'}</span>
            <b className="num" data-when>{whenLabel(show.start, show.end, time)}</b>
          </div>
        )}
        <div className="card-line">
          <span className="muted">Joy</span>
          <b className="num">+{ev.joy} · energy −{ev.energy}</b>
        </div>
        {day !== null && mine ? (
          <button className="btn block" data-act="attend" onClick={() => attend(ev.id)}>
            <IconTicket size={18} /> Show your ticket and go in
          </button>
        ) : day !== null ? (
          !confirm ? (
            <>
              <p className="muted">No ticket for tonight. You can pay at the gate — it's cheaper in the Events app ({formatMoney(pack, ev.price)}).</p>
              <button className="btn block" data-act="gate" disabled={balance < gate} onClick={() => setConfirm(true)}>
                {balance < gate ? `Need ${formatMoney(pack, gate - balance)} more` : `Buy at the gate · ${formatMoney(pack, gate)}`}
              </button>
            </>
          ) : (
            <div className="confirm-row">
              <p>
                Pay <b className="num">{formatMoney(pack, gate)}</b> at the gate and go in?
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" data-act="confirm-gate" onClick={() => buy(ev.id, true) && attend(ev.id)}>
                  Confirm · pay {formatMoney(pack, gate)}
                </button>
                <button className="btn ghost" onClick={() => setConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )
        ) : mine ? (
          <p className="muted" data-state="booked">You have a ticket. Come back when the doors open.</p>
        ) : (
          <p className="muted">Gates open at showtime. Book ahead in the Events app on your phone ({formatMoney(pack, ev.price)}).</p>
        )}
      </div>
    </section>
  );
}

/** Events app: every show in every city, with the next showing and tickets. */
export function EventsApp() {
  const pack = usePack();
  const time = useGame((s) => s.world.time ?? 480);
  const tickets = useGame((s) => s.world.tickets ?? []);
  const balance = useGame((s) => s.wallet.balance);
  const buy = useGame((s) => s.buyTicket);
  const here = useGame((s) => s.destinationId);
  const [pending, setPending] = useState<string | null>(null);
  // listings for other cities come with their city pack: fetch them while online (small), or say they're missing
  const [, setLoaded] = useState(0);
  const missing = CITY_PACKS.filter((c) => !isCityLoaded(c.id));
  useEffect(() => {
    let alive = true;
    for (const c of CITY_PACKS) if (!isCityLoaded(c.id)) loadCity(c.id).then(() => alive && setLoaded((n) => n + 1), () => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const events = ALL_PACKS.flatMap((p) => (p.events ?? []).map((ev) => ({ ev, area: p })));
  // shows in this area first
  events.sort((a, b) => (a.area.id === here ? 0 : 1) - (b.area.id === here ? 0 : 1));
  return (
    <>
      <p className="muted" style={{ fontSize: 'var(--fs-sm)', margin: '0 0 12px' }}>
        A night out lifts your mood. Book here — it's cheaper than paying at the gate.
      </p>
      {events.map(({ ev, area }) => {
        const show = nextShowing(ev, time);
        const has = show && tickets.some((t) => t.eventId === ev.id && t.day === show.day);
        const live = onNow(ev, time) !== null;
        const local = localPrice(area, ev.price);
        return (
          <article className="job-card event-card" key={ev.id} data-event={ev.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
              <h3>{ev.name}</h3>
              {has ? <span className="chip done">Booked</span> : live ? <span className="chip live">On now</span> : <span className="chip">{KIND_LABEL[ev.kind]}</span>}
            </div>
            <p>{ev.description}</p>
            <div className="meta num">
              <span>{area.area} · {area.name}</span>
              {show && <span>{whenLabel(show.start, show.end, time)}</span>}
              {ev.everyDays && ev.everyDays > 1 ? <span>Every {ev.everyDays} days</span> : <span>Nightly</span>}
            </div>
            <div className="event-buy">
              <b className="num">{formatMoney(pack, ev.price)}{local ? ` · ${local}` : ''}</b>
              {pending === ev.id ? (
                <span style={{ display: 'flex', gap: 8 }}>
                  <button className="btn sm" data-act="confirm-ticket" onClick={() => { buy(ev.id); setPending(null); }}>
                    Confirm
                  </button>
                  <button className="btn sm ghost" onClick={() => setPending(null)}>
                    Cancel
                  </button>
                </span>
              ) : (
                <button className="btn sm" data-act="ticket" disabled={!!has || !show || balance < ev.price} onClick={() => setPending(ev.id)}>
                  {has ? 'Booked' : balance < ev.price ? 'Short' : 'Get a ticket'}
                </button>
              )}
            </div>
          </article>
        );
      })}
      {missing.map((c) => (
        <div className="empty" key={c.id} data-missing={c.id}>
          {cityName(c.id)} shows appear here once {cityName(c.id)} is loaded — it downloads while you're online.
        </div>
      ))}
    </>
  );
}

const STATE_LABEL: Record<TicketState, string> = { upcoming: 'Upcoming', 'on-now': 'On now — go!', used: 'Attended', missed: 'Missed' };

/** Bookings app: show tickets, your flight, and your homes. */
export function BookingsApp() {
  const pack = usePack();
  const time = useGame((s) => s.world.time ?? 480);
  const tickets = useGame((s) => s.world.tickets ?? []);
  const flight = useGame((s) => s.travel.ticket);
  const homes = useGame((s) => s.life.homes);
  const property = useGame((s) => s.life.property);
  const list = [...tickets].reverse();
  const route = flight ? findFlight(flight.routeId) : undefined;
  return (
    <>
      <h3 className="phone-sub">Show tickets</h3>
      {list.length === 0 ? (
        <div className="empty">No tickets yet. The Events app has concerts, comedy and street jams.</div>
      ) : (
        list.map((t) => {
          const ev = findEvent(t.eventId);
          if (!ev) return null;
          const st = ticketState(t, ev, time);
          const area = areaOfEvent(ev.id);
          return (
            <div className={`card-line booking is-${st}`} key={t.id} data-ticket={t.eventId} data-state={st}>
              <div style={{ minWidth: 0 }}>
                <b>{ev.name}</b>
                <div className="muted num" style={{ fontSize: 'var(--fs-xs)' }}>
                  Day {t.day} · {String(ev.hours[0]).padStart(2, '0')}:00 · {area?.area}
                </div>
              </div>
              <span className={`chip ${st === 'on-now' ? 'live' : st === 'used' ? 'done' : ''}`}>{STATE_LABEL[st]}</span>
            </div>
          );
        })
      )}
      <h3 className="phone-sub">Flight</h3>
      {flight && route ? (
        <div className="card-line" data-booking="flight">
          <div>
            <b>{getDestination(route.from).area} → {getDestination(route.to).area}</b>
            <div className="muted" style={{ fontSize: 'var(--fs-xs)' }}>{flight.stage.replace(/-/g, ' ')}{flight.roundTrip ? ' · return included' : ''}</div>
          </div>
          <span className="chip live">Ticket</span>
        </div>
      ) : (
        <div className="empty">No flight booked. The Travel app sells tickets.</div>
      )}
      <h3 className="phone-sub">Homes</h3>
      {homes.length === 0 ? (
        <div className="empty">No home yet. Rooms to let have a door you can check.</div>
      ) : (
        homes.map((id) => {
          const p = property[id];
          const name = findInterior(id)?.name ?? id;
          return (
            <div className="card-line" key={id} data-booking={`home:${id}`}>
              <div>
                <b>{name}</b>
                <div className="muted num" style={{ fontSize: 'var(--fs-xs)' }}>
                  {p?.tenure === 'own' ? `Owned · worth ${formatMoney(pack, homeValuation(p))}` : 'Rented for your stay'}
                </div>
              </div>
              <span className="chip">{p?.tenure === 'own' ? 'Owned' : 'Rented'}</span>
            </div>
          );
        })
      )}
    </>
  );
}
