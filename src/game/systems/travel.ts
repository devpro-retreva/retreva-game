/**
 * Flying abroad: trip budgets, the ticket, and the airport steps
 * (check-in → security → boarding). Pure functions; the store applies them
 * and moves the money through the wallet ledger.
 *
 * A ticket only changes hands when the plane lands (completeFlight), so a
 * reload mid-flight leaves you at the gate with your ticket — never stranded.
 */
import type { FlightRoute } from '../content/flights';
import type { Inventory, InventoryEntry } from './inventory';

export type TicketStage = 'booked' | 'checked-in' | 'cleared';

export interface Ticket {
  id: string;
  routeId: string;
  stage: TicketStage;
  /** What was paid for this ticket (0 for the return half of a round trip). */
  paid: number;
  /** A round-trip ticket turns into the return ticket when you land. */
  roundTrip: boolean;
  bookedAt: number;
}

export interface FlightLog {
  routeId: string;
  ticketId: string;
  at: number;
}

export interface TravelState {
  ticket: Ticket | null;
  history: FlightLog[];
}

export const emptyTravel = (): TravelState => ({ ticket: null, history: [] });

// ── budget ───────────────────────────────────────────────────────────────

export interface BudgetLine {
  key: 'taxi' | 'ticket' | 'stay' | 'around';
  label: string;
  amount: number;
  note?: string;
}

export interface TripBudget {
  lines: BudgetLine[];
  /** Everything, including estimates. */
  total: number;
  /** What you pay to book now (the ticket). */
  dueNow: number;
}

/**
 * Full picture before you buy: getting to the airport, the ticket, somewhere to stay and getting around.
 * Only the ticket is charged at booking; the rest are estimates you pay as you go.
 */
export function tripBudget(route: FlightRoute, opts: { taxiToAirport: number; roundTrip: boolean; hasStay: boolean }): TripBudget {
  const ticket = opts.roundTrip ? route.roundTrip : route.ticket;
  const lines: BudgetLine[] = [];
  if (opts.taxiToAirport > 0) lines.push({ key: 'taxi', label: 'Taxi to the airport', amount: opts.taxiToAirport });
  lines.push({
    key: 'ticket',
    label: opts.roundTrip ? `Return ticket · ${route.code}` : `One-way ticket · ${route.code}`,
    amount: ticket,
    note: `arrival taxi into ${route.cityName} included`,
  });
  lines.push(opts.hasStay
    ? { key: 'stay', label: route.budget.stay.name, amount: 0, note: 'already yours' }
    : { key: 'stay', label: route.budget.stay.name, amount: route.budget.stay.cost, note: route.budget.stay.note });
  lines.push({ key: 'around', label: 'Getting around', amount: route.budget.gettingAround, note: 'taxis while you are there' });
  return { lines, total: lines.reduce((n, l) => n + l.amount, 0), dueNow: ticket };
}

// ── ticket and airport steps ─────────────────────────────────────────────

type Fail<R extends string> = { ok: false; reason: R };
type Ok = { ok: true; state: TravelState };

export function bookFlight(s: TravelState, route: FlightRoute, roundTrip: boolean, id: string, at: number): Ok | Fail<'has-ticket'> {
  if (s.ticket) return { ok: false, reason: 'has-ticket' };
  const paid = roundTrip ? route.roundTrip : route.ticket;
  return { ok: true, state: { ...s, ticket: { id, routeId: route.id, stage: 'booked', paid, roundTrip, bookedAt: at } } };
}

export type StepFail = 'no-ticket' | 'wrong-airport' | 'not-checked-in' | 'not-cleared' | 'done-already';

/** Check-in desk: needs a ticket for a flight from this airport. */
export function checkIn(s: TravelState, route: FlightRoute | undefined, airportId: string): Ok | Fail<StepFail> {
  if (!s.ticket || !route) return { ok: false, reason: 'no-ticket' };
  if (route.from !== airportId) return { ok: false, reason: 'wrong-airport' };
  if (s.ticket.stage !== 'booked') return { ok: false, reason: 'done-already' };
  return { ok: true, state: { ...s, ticket: { ...s.ticket, stage: 'checked-in' } } };
}

/** Security: only after check-in. Liquids are dealt with by the caller before this. */
export function clearSecurity(s: TravelState): Ok | Fail<StepFail> {
  if (!s.ticket) return { ok: false, reason: 'no-ticket' };
  if (s.ticket.stage === 'booked') return { ok: false, reason: 'not-checked-in' };
  if (s.ticket.stage === 'cleared') return { ok: false, reason: 'done-already' };
  return { ok: true, state: { ...s, ticket: { ...s.ticket, stage: 'cleared' } } };
}

/** Gate: you can board once you're through security at this airport. */
export function canBoard(s: TravelState, route: FlightRoute | undefined, airportId: string): true | StepFail {
  if (!s.ticket || !route) return 'no-ticket';
  if (route.from !== airportId) return 'wrong-airport';
  if (s.ticket.stage === 'booked') return 'not-checked-in';
  if (s.ticket.stage === 'checked-in') return 'not-cleared';
  return true;
}

/**
 * Landing: the ticket is used up and logged. A round trip leaves you holding the
 * (already paid) return ticket. Logging is keyed by ticket id, so it can't happen twice.
 */
export function completeFlight(s: TravelState, route: FlightRoute, at: number): Ok | Fail<'not-cleared' | 'done-already'> {
  const t = s.ticket;
  if (!t || t.routeId !== route.id || t.stage !== 'cleared') return { ok: false, reason: 'not-cleared' };
  if (s.history.some((h) => h.ticketId === t.id)) return { ok: false, reason: 'done-already' };
  const next: Ticket | null = t.roundTrip
    ? { id: `${t.id}:return`, routeId: route.returnId, stage: 'booked', paid: 0, roundTrip: false, bookedAt: at }
    : null;
  return { ok: true, state: { ticket: next, history: [...s.history, { routeId: route.id, ticketId: t.id, at }] } };
}

/** Liquids over the cabin limit — bottled drinks you carry. Security makes you drink or leave them. */
export function liquidsIn(inv: Inventory): InventoryEntry[] {
  return inv.entries.filter((e) => e.category === 'drink' && e.quantity > 0);
}
