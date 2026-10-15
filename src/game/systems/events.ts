/**
 * Ticketed events: concerts and shows that happen at set times on the game clock. Pure functions.
 * Tickets are bought for one showing (ledger id `ticket:<eventId>:d<day>`, so the same showing can't be
 * paid for twice) and used by going to the venue while the show is on.
 */
import type { EventDef } from '../content/types';
import { dayOf } from './clock';

export interface EventTicket {
  id: string;
  eventId: string;
  /** Game day of the showing (1-based). */
  day: number;
  paid: number;
  status: 'booked' | 'used';
}

const DAY = 24 * 60;

/** Is there a showing on this game day? */
export function showsOn(ev: EventDef, day: number): boolean {
  const every = Math.max(1, ev.everyDays ?? 1);
  return (day - 1 - (ev.offsetDays ?? 0)) % every === 0 && day - 1 - (ev.offsetDays ?? 0) >= 0;
}

/** Absolute start/end (game minutes) of the showing on a day. Shows may run past midnight. */
export function showtime(ev: EventDef, day: number): { start: number; end: number } {
  const start = (day - 1) * DAY + ev.hours[0] * 60;
  const len = ((ev.hours[1] - ev.hours[0] + 24) % 24 || 24) * 60;
  return { start, end: start + len };
}

/** The next showing you can still catch (one that's on now counts), within two weeks. */
export function nextShowing(ev: EventDef, time: number): { day: number; start: number; end: number } | null {
  for (let day = Math.max(1, dayOf(time) - 1); day < dayOf(time) + 15; day++) {
    if (!showsOn(ev, day)) continue;
    const t = showtime(ev, day);
    if (t.end > time) return { day, ...t };
  }
  return null;
}

/** Is a showing on right now? Returns its day, or null. */
export function onNow(ev: EventDef, time: number): number | null {
  const n = nextShowing(ev, time);
  return n && n.start <= time && time < n.end ? n.day : null;
}

export type TicketState = 'upcoming' | 'on-now' | 'used' | 'missed';

export function ticketState(t: EventTicket, ev: EventDef, time: number): TicketState {
  if (t.status === 'used') return 'used';
  const s = showtime(ev, t.day);
  if (time >= s.end) return 'missed';
  return time >= s.start ? 'on-now' : 'upcoming';
}

/** Ledger id for a ticket to one showing. */
export const ticketTxId = (eventId: string, day: number) => `ticket:${eventId}:d${day}`;

/** Buying at the gate costs a bit more than booking ahead in the app. */
export const gatePrice = (ev: EventDef) => Math.round((ev.price * 1.2) / 100) * 100;
