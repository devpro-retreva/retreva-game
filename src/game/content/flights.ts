/**
 * Flight routes between airport hubs. Prices are data, in the one wallet currency (naira).
 * The airline is fictional. Lagos ↔ Accra is an ECOWAS route: no visa needed.
 */
export interface FlightRoute {
  id: string;
  /** Flight number shown on the boarding pass. */
  code: string;
  carrier: string;
  /** Departure and arrival airport area ids. */
  from: string;
  to: string;
  /** Where you step out after landing (the arrival taxi into town is included in the fare). */
  arriveAt: string;
  cityName: string;
  country: string;
  minutes: number;
  /** One-way ticket. */
  ticket: number;
  /** Ticket out plus a return ticket, bought together (cheaper than two one-ways). */
  roundTrip: number;
  gate: string;
  /** Budget helpers shown before you buy (estimates, not charged with the ticket). */
  budget: {
    stay: { name: string; cost: number; note: string };
    /** A few days of local rides at the other end (taxis, tro-tros, the metro, danfos), in naira. */
    gettingAround: number;
  };
  /** What the check-in agent says about entry papers (game simplification: nothing to arrange yourself). */
  entry: string;
  /** Shown on the ticket card when the route simplifies something real. */
  note?: string;
  /** Which map the flight is drawn on: the Gulf of Guinea coast, or a long-haul overview. */
  chart?: 'coast' | 'longhaul';
  /** The return route id, used for round-trip tickets. */
  returnId: string;
  /** Text on the in-flight sequence. */
  snack: { name: string; fullness: number };
  /** [x, y] of each end on the coast map (0–100 × 0–60). */
  map: { from: [number, number]; to: [number, number] };
}

const CARRIER = 'Gulf Coast Air';

export const FLIGHTS: FlightRoute[] = [
  {
    id: 'los-acc',
    code: 'GC 214',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'accra-airport',
    arriveAt: 'accra-osu',
    cityName: 'Accra',
    country: 'Ghana',
    minutes: 60,
    ticket: 9000,
    roundTrip: 16000,
    gate: 'A3',
    budget: {
      stay: { name: 'Osu guesthouse', cost: 3500, note: 'a bed for your stay' },
      gettingAround: 8000,
    },
    entry: 'ECOWAS — no visa needed.',
    returnId: 'acc-los',
    snack: { name: 'meat pie and juice', fullness: 12 },
    map: { from: [86, 30], to: [16, 27] },
  },
  {
    id: 'acc-los',
    code: 'GC 215',
    carrier: CARRIER,
    from: 'accra-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 60,
    ticket: 9000,
    roundTrip: 16000,
    gate: 'B1',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'ECOWAS — no visa needed.',
    returnId: 'los-acc',
    snack: { name: 'meat pie and sobolo', fullness: 12 },
    map: { from: [16, 27], to: [86, 30] },
  },
  {
    id: 'los-dxb',
    code: 'GC 571',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'dubai-airport',
    arriveAt: 'dubai-creek',
    cityName: 'Dubai',
    country: 'United Arab Emirates',
    minutes: 390,
    ticket: 95000,
    roundTrip: 170000,
    gate: 'A5',
    budget: {
      stay: { name: 'Creek studio', cost: 15000, note: 'a furnished studio for your stay' },
      gettingAround: 40000,
    },
    entry: 'Your UAE visa is on file with the booking — all set.',
    note: 'In the game the visa is handled with your ticket; real trips need one arranged in advance.',
    chart: 'longhaul',
    returnId: 'dxb-los',
    snack: { name: 'chicken biryani and juice', fullness: 30 },
    map: { from: [16, 44], to: [86, 16] },
  },
  {
    id: 'dxb-los',
    code: 'GC 572',
    carrier: CARRIER,
    from: 'dubai-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 420,
    ticket: 95000,
    roundTrip: 170000,
    gate: 'C2',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Nigerian passport — welcome home soon.',
    chart: 'longhaul',
    returnId: 'los-dxb',
    snack: { name: 'jollof rice and chicken', fullness: 30 },
    map: { from: [86, 16], to: [16, 44] },
  },
];

/** Fill a line of airport dialogue for your ticket: {flight}, {gate}, {entry}. */
export function flightText(text: string, route: FlightRoute | undefined): string {
  if (!route || !text.includes('{')) return text;
  return text.replace(/\{flight\}/g, `${route.cityName} (${route.code})`).replace(/\{gate\}/g, route.gate).replace(/\{entry\}/g, route.entry);
}

export function findFlight(id: string): FlightRoute | undefined {
  return FLIGHTS.find((f) => f.id === id);
}

/** Flights leaving a given airport. */
export function flightsFrom(airportId: string): FlightRoute[] {
  return FLIGHTS.filter((f) => f.from === airportId);
}
