/**
 * Flight routes between airport hubs, and train routes between stations (`mode: 'rail'`) — both are bought,
 * checked and boarded the same way. Prices are data, in the one wallet currency (naira).
 * The airline and the rail operator are fictional. Lagos ↔ Accra is an ECOWAS route: no visa needed.
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
    /** Trains: the ride from the arrival station into town, paid there (flights fold it into the fare). */
    onward?: { label: string; cost: number };
  };
  /** What the check-in agent says about entry papers (game simplification: nothing to arrange yourself). */
  entry: string;
  /** Short papers line on the flight card, e.g. "ECOWAS · no visa" or "Domestic · ID card". */
  papers: string;
  /** A flight inside Nigeria: check-in asks for an ID card, not a passport, and the map shows Nigeria. */
  domestic?: boolean;
  /** Shown on the ticket card when the route simplifies something real. */
  note?: string;
  /** Which map the trip is drawn on: the Gulf of Guinea coast, a long-haul overview, Nigeria, or a railway line. */
  chart?: 'coast' | 'longhaul' | 'nigeria' | 'rail';
  /** A train between stations instead of a flight: ticket check, bag scan, then the platform ({gate} is the platform). */
  mode?: 'rail';
  /** Trains only: the ticket class and what it gets you (joy on arrival), and the stops the line runs through. */
  rail?: { cls: 'Standard' | 'Business' | 'First'; perk: string; joy: number; stops: string[] };
  /** Trains only: departure times (minutes after midnight). Boarding means waiting on the platform for the next one. */
  departs?: number[];
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
 * Lagos–Calabar (domestic) about ₦150,000 one-way / ₦285,000 return: airline and guide pages list
 * ₦110,000–135,000 budget fares and ₦135,000–185,000 for standard economy (2026).
 * Lagos–Benin City (domestic, about an hour) about ₦110,000 one-way / ₦210,000 return: Google Flights and Trip.com list
 * one-way fares from $66–88 (September–October 2026), agency pages ₦120,000–250,000 at busy times.
 * Lagos–Enugu (domestic, about an hour) about ₦115,000 one-way / ₦215,000 return: the airline's own site lists returns
 * from ₦108,000 to ₦214,000 for late-2026 dates; Google Flights and Trip.com one-way fares from $66–85.
 * Lagos–Port Harcourt (domestic, about 70 min, a busy oil-city route) about ₦135,000 one-way / ₦255,000 return:
 * Expedia and Trip.com list one-way fares from $64–126 (2026), Flightpadi from ₦177,733 at busy times.
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
  {
    id: 'los-cbq',
    code: 'GC 306',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'calabar-airport',
    arriveAt: 'calabar-marina',
    cityName: 'Calabar',
    country: 'Nigeria',
    minutes: 80,
    ticket: 150000,
    roundTrip: 285000,
    gate: 'A4',
    budget: {
      stay: { name: 'Marina flat', cost: 10000, note: 'a room for your stay' },
      gettingAround: 12000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    note: 'In the game domestic flights leave from the same hall; in Lagos they use the domestic terminal.',
    chart: 'nigeria',
    returnId: 'cbq-los',
    snack: { name: 'plantain chips and a cold malt', fullness: 12 },
    map: { from: [14, 47], to: [65, 49] },
  },
  {
    id: 'cbq-los',
    code: 'GC 307',
    carrier: CARRIER,
    from: 'calabar-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 80,
    ticket: 150000,
    roundTrip: 285000,
    gate: 'E2',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    chart: 'nigeria',
    returnId: 'los-cbq',
    snack: { name: 'plantain chips and a cold malt', fullness: 12 },
    map: { from: [65, 49], to: [14, 47] },
  },
  {
    id: 'los-bni',
    code: 'GC 308',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'benin-airport',
    arriveAt: 'benin-kings-square',
    cityName: 'Benin City',
    country: 'Nigeria',
    minutes: 55,
    ticket: 110000,
    roundTrip: 210000,
    gate: 'A1',
    budget: {
      stay: { name: 'Room by King’s Square', cost: 7000, note: 'a room for your stay' },
      gettingAround: 8000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    note: 'In the game domestic flights leave from the same hall; in Lagos they use the domestic terminal.',
    chart: 'nigeria',
    returnId: 'bni-los',
    snack: { name: 'chin-chin and a cold malt', fullness: 10 },
    map: { from: [14, 47], to: [36, 44] },
  },
  {
    id: 'bni-los',
    code: 'GC 309',
    carrier: CARRIER,
    from: 'benin-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 55,
    ticket: 110000,
    roundTrip: 210000,
    gate: 'B2',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    chart: 'nigeria',
    returnId: 'los-bni',
    snack: { name: 'chin-chin and a cold malt', fullness: 10 },
    map: { from: [36, 44], to: [14, 47] },
  },
  {
    id: 'los-enu',
    code: 'GC 310',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'enugu-airport',
    arriveAt: 'enugu-ogui',
    cityName: 'Enugu',
    country: 'Nigeria',
    minutes: 65,
    ticket: 115000,
    roundTrip: 215000,
    gate: 'A6',
    budget: {
      stay: { name: 'Room in Ogui', cost: 7000, note: 'a room for your stay' },
      gettingAround: 10000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    note: 'In the game domestic flights leave from the same hall; in Lagos they use the domestic terminal.',
    chart: 'nigeria',
    returnId: 'enu-los',
    snack: { name: 'meat pie and a cold malt', fullness: 12 },
    map: { from: [14, 47], to: [50, 45] },
  },
  {
    id: 'enu-los',
    code: 'GC 311',
    carrier: CARRIER,
    from: 'enugu-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 65,
    ticket: 115000,
    roundTrip: 215000,
    gate: 'C2',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    chart: 'nigeria',
    returnId: 'los-enu',
    snack: { name: 'meat pie and a cold malt', fullness: 12 },
    map: { from: [50, 45], to: [14, 47] },
  },
  {
    id: 'los-phc',
    code: 'GC 312',
    carrier: CARRIER,
    from: 'lagos-airport',
    to: 'ph-airport',
    arriveAt: 'ph-waterfront',
    cityName: 'Port Harcourt',
    country: 'Nigeria',
    minutes: 70,
    ticket: 135000,
    roundTrip: 255000,
    gate: 'A2',
    budget: {
      stay: { name: 'Creekside room', cost: 9000, note: 'a room for your stay' },
      gettingAround: 15000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    note: 'In the game domestic flights leave from the same hall; in Lagos they use the domestic terminal.',
    chart: 'nigeria',
    returnId: 'phc-los',
    snack: { name: 'plantain chips and a cold malt', fullness: 12 },
    map: { from: [14, 47], to: [55, 52] },
  },
  {
    id: 'phc-los',
    code: 'GC 313',
    carrier: CARRIER,
    from: 'ph-airport',
    to: 'lagos-airport',
    arriveAt: 'ikeja-village',
    cityName: 'Lagos',
    country: 'Nigeria',
    minutes: 70,
    ticket: 135000,
    roundTrip: 255000,
    gate: 'D1',
    budget: {
      stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
      gettingAround: 3000,
    },
    entry: 'Domestic flight — your national ID card is all you need.',
    papers: 'Domestic · ID card, no passport',
    domestic: true,
    chart: 'nigeria',
    returnId: 'los-phc',
    snack: { name: 'plantain chips and a cold malt', fullness: 12 },
    map: { from: [55, 52], to: [14, 47] },
  },
];


/*
 * The Lagos–Ibadan standard-gauge line: Mobolaji Johnson Station (Ebute Metta) to Obafemi Awolowo Station (Moniya),
 * through Agege, Agbado, Kajola, Papalanto, Abeokuta, Olodo and Omi-Adio. Fares are the railway's published
 * adult fares (fare tables updated October 2026): Standard ₦3,600, Business ₦6,500, First ₦13,000 (older guides
 * still say ₦9,000 for First). There is no return discount, so a return is two singles. The regular timetable
 * has a morning and an afternoon train each way (8:00 and 16:00; extra trains run at holidays); the trip takes
 * about 2½ hours with the Abeokuta stop. The operator name in the game is fictional.
 */
const RAIL = 'Western Express Rail';
const LINE = ['Ebute Metta', 'Agege', 'Agbado', 'Kajola', 'Papalanto', 'Abeokuta', 'Olodo', 'Omi-Adio', 'Moniya'];
const CLASSES = [
  { key: 's', cls: 'Standard', fare: 3600, perk: 'a window seat in a busy coach', joy: 0, snack: { name: 'gala and a sachet of water from the trolley', fullness: 6 } },
  { key: 'b', cls: 'Business', fare: 6500, perk: 'a wide reclining seat and a quiet coach', joy: 4, snack: { name: 'meat pie and a cold malt', fullness: 12 } },
  { key: 'f', cls: 'First', fare: 13000, perk: 'a lounge seat, a hot meal and the best view of the Ogun River', joy: 8, snack: { name: 'jollof rice and chicken at your seat', fullness: 30 } },
] as const;

function trains(): FlightRoute[] {
  const out: FlightRoute[] = [];
  for (const c of CLASSES) {
    const common = {
      carrier: RAIL,
      country: 'Nigeria',
      minutes: 150,
      ticket: c.fare,
      roundTrip: c.fare * 2,
      entry: 'Ticket and a quick bag check — no ID or boarding pass needed on the train.',
      papers: `${c.cls} class · ${c.perk}`,
      domestic: true,
      mode: 'rail' as const,
      chart: 'rail' as const,
      snack: c.snack,
      departs: [8 * 60, 16 * 60],
    };
    out.push({
      ...common,
      id: `los-ibd-${c.key}`,
      code: 'WX 1',
      from: 'lagos-station',
      to: 'ibadan-station',
      arriveAt: 'ibadan-station',
      cityName: 'Ibadan',
      gate: '2',
      budget: {
        stay: { name: 'Room in Dugbe', cost: 7000, note: 'a room for your stay' },
        gettingAround: 6000,
        onward: { label: 'Taxi from Moniya into Dugbe', cost: 5000 },
      },
      rail: { cls: c.cls, perk: c.perk, joy: c.joy, stops: LINE },
      returnId: `ibd-los-${c.key}`,
      map: { from: [8, 52], to: [52, 20] },
    });
    out.push({
      ...common,
      id: `ibd-los-${c.key}`,
      code: 'WX 2',
      from: 'ibadan-station',
      to: 'lagos-station',
      arriveAt: 'lagos-station',
      cityName: 'Lagos',
      gate: '1',
      budget: {
        stay: { name: 'Room to let, Yaba', cost: 6000, note: 'if you don’t have a place yet' },
        gettingAround: 3000,
        onward: { label: 'Danfo from Ebute Metta to Yaba', cost: 300 },
      },
      rail: { cls: c.cls, perk: c.perk, joy: c.joy, stops: [...LINE].reverse() },
      returnId: `los-ibd-${c.key}`,
      map: { from: [52, 20], to: [8, 52] },
    });
  }
  return out;
}

FLIGHTS.push(...trains());

/** Clock time for minutes after midnight, e.g. 960 → "16:00". */
const clock = (m: number) => `${String(Math.floor((m % 1440) / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/**
 * The next train on a route, from game time `now` (minutes since day 1 00:00): when it leaves (absolute game minutes)
 * and how to say it. Routes without a timetable leave straight away.
 */
export function nextDeparture(route: FlightRoute, now: number): { at: number; label: string } {
  if (!route.departs?.length) return { at: now, label: 'now' };
  const day = Math.floor(now / 1440);
  for (const d of [0, 1]) {
    for (const t of [...route.departs].sort((a, b) => a - b)) {
      const at = (day + d) * 1440 + t;
      if (at >= now) return { at, label: d === 0 ? clock(t) : `${clock(t)} tomorrow` };
    }
  }
  return { at: now, label: 'now' };
}

export const isRail = (route: FlightRoute | undefined) => route?.mode === 'rail';

/**
 * Fill a line of airport or station dialogue for your ticket: {flight}, {gate}, {entry}, {papers} (passport or ID card),
 * {class} and {departs} (the next train, from game time `now`).
 */
export function flightText(text: string, route: FlightRoute | undefined, now = 0): string {
  if (!route || !text.includes('{')) return text;
  return text
    .replace(/\{departs\}/g, nextDeparture(route, now).label)
    .replace(/\{class\}/g, route.rail?.cls ?? 'Economy')
    .replace(/\{flight\}/g, `${route.cityName} (${route.code})`)
    .replace(/\{gate\}/g, route.gate)
    .replace(/\{entry\}/g, route.entry)
    .replace(/\{papers\}/g, route.domestic ? 'ID card' : 'Passport');
}

export function findFlight(id: string): FlightRoute | undefined {
  return FLIGHTS.find((f) => f.id === id);
}

/** Flights (or trains) leaving a given airport (or station). */
export function flightsFrom(airportId: string): FlightRoute[] {
  return FLIGHTS.filter((f) => f.from === airportId);
}
