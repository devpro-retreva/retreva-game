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
  /** Short papers line on the flight card, e.g. "ECOWAS · no visa" or "Domestic · ID card". */
  papers: string;
  /** A flight inside Nigeria: check-in asks for an ID card, not a passport, and the map shows Nigeria. */
  domestic?: boolean;
  /** Shown on the ticket card when the route simplifies something real. */
  note?: string;
  /** Which map the flight is drawn on: the Gulf of Guinea coast, a long-haul overview, or Nigeria. */
  chart?: 'coast' | 'longhaul' | 'nigeria';
  /** The return route id, used for round-trip tickets. */
  returnId: string;
  /** Text on the in-flight sequence. */
  snack: { name: string; fullness: number };
  /** [x, y] of each end on the coast map (0–100 × 0–60). */
  map: { from: [number, number]; to: [number, number] };
}

const CARRIER = 'Gulf Coast Air';

/*
 * Prices are real economy fares (October 2026) at the official rate of about ₦1,332 per US dollar:
 * Lagos–Accra about $190 one-way / $340 return (aggregators list $290–400 returns); Lagos–Dubai about
 * $470 one-way / $800 return, nonstop (Google Flights from $764, Emirates deals ~$840). A long trip is
 * something you save up for: a few hours of jobs and shifts for Accra, a good deal more for Dubai.
 * Lagos–Abuja (domestic) about ₦140,000 one-way / ₦270,000 return: aggregators in September 2026 list
 * ₦124,000 one-way on the cheapest carrier, ₦225,000 on the biggest, returns from about ₦390,000.
 */

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
    ticket: 250000,
    roundTrip: 450000,
    gate: 'A3',
    budget: {
      stay: { name: 'Osu guesthouse', cost: 3500, note: 'a bed for your stay' },
      gettingAround: 8000,
    },
    entry: 'ECOWAS — no visa needed.',
    papers: 'ECOWAS · no visa',
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
    ticket: 250000,
    roundTrip: 450000,
    gate: 'B1',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'ECOWAS — no visa needed.',
    papers: 'ECOWAS · no visa',
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
    ticket: 625000,
    roundTrip: 1065000,
    gate: 'A5',
    budget: {
      stay: { name: 'Creek studio', cost: 15000, note: 'a furnished studio for your stay' },
      gettingAround: 40000,
    },
    entry: 'Your UAE visa is on file with the booking — all set.',
    papers: 'UAE visa with the ticket',
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
    ticket: 625000,
    roundTrip: 1065000,
    gate: 'C2',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Nigerian passport — welcome home soon.',
    papers: 'Nigerian passport',
    chart: 'longhaul',
    returnId: 'los-dxb',
    snack: { name: 'jollof rice and chicken', fullness: 30 },
    map: { from: [86, 16], to: [16, 44] },
  },
  {
    id: 'los-abv',
    code: 'GC 302',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'abuja-airport',
    arriveAt: 'abuja-wuse',
    cityName: 'Abuja',
    country: 'Nigeria',
    minutes: 70,
    ticket: 140000,
    roundTrip: 270000,
    gate: 'A2',
    budget: {
      stay: { name: 'Wuse studio', cost: 12000, note: 'a room for your stay' },
      gettingAround: 20000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    note: 'In the game domestic flights leave from the same hall; in Lagos they use the domestic terminal.',
    chart: 'nigeria',
    returnId: 'abv-los',
    snack: { name: 'meat pie and a cold malt', fullness: 12 },
    map: { from: [14, 47], to: [47, 28] },
  },
  {
    id: 'abv-los',
    code: 'GC 303',
    carrier: CARRIER,
    from: 'abuja-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 70,
    ticket: 140000,
    roundTrip: 270000,
    gate: 'D3',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    chart: 'nigeria',
    returnId: 'los-abv',
    snack: { name: 'meat pie and a cold malt', fullness: 12 },
    map: { from: [47, 28], to: [14, 47] },
  },
];

/** Fill a line of airport dialogue for your ticket: {flight}, {gate}, {entry}, {papers} (passport or ID card). */
export function flightText(text: string, route: FlightRoute | undefined): string {
  if (!route || !text.includes('{')) return text;
  return text
    .replace(/\{flight\}/g, `${route.cityName} (${route.code})`)
    .replace(/\{gate\}/g, route.gate)
    .replace(/\{entry\}/g, route.entry)
    .replace(/\{papers\}/g, route.domestic ? 'ID card' : 'Passport');
}

export function findFlight(id: string): FlightRoute | undefined {
  return FLIGHTS.find((f) => f.id === id);
}

/** Flights leaving a given airport. */
export function flightsFrom(airportId: string): FlightRoute[] {
  return FLIGHTS.filter((f) => f.from === airportId);
}
