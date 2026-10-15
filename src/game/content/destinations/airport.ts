import type { BuildingDef, DestinationPack, ItemDef, NpcDef, NpcLook, WalkerDef } from '../types';
import { flightsFrom } from '../flights';

/**
 * International airport forecourt + concourse, built from one template so every
 * airport plays the same way (ride in → check in → security → gate → fly) while
 * names, colours, staff, shop stock and signs come from the city.
 *
 * Layout (x across, z along the street, north = −z):
 *   east side — the terminal: arrivals, shop, departures/check-in, security, gates (north end)
 *   the 6 m concourse in front of it is where you walk; the road is the taxi drop-off
 *   west side — car park and hotel; an airfield with parked planes beyond the north fence
 */

export interface AirportSpec {
  id: string;
  city: string;
  country: string;
  tagline: string;
  /** Airline colours for desks and the gates sign. */
  brand: { primary: string; accent: string };
  gatesSign: string;
  staff: {
    checkIn: { id: string; name: string; look: NpcLook };
    security: { id: string; name: string; look: NpcLook };
    gate: { id: string; name: string; look: NpcLook };
    shop: { id: string; name: string; look: NpcLook; shopName: string; greeting: string };
    porter: { id: string; name: string; look: NpcLook; line: string };
    taxi: { id: string; name: string; look: NpcLook; line: string };
  };
  items: ItemDef[];
  walkers: WalkerDef[];
  hotelSign: string;
  /** Colour of the waiting taxi. */
  taxiColor: string;
  palette: DestinationPack['palette'];
  traffic: DestinationPack['traffic'];
  localCurrency?: DestinationPack['localCurrency'];
  welcome?: DestinationPack['welcome'];
  /** Extra phrase the check-in agent uses (local flavour). */
  greeting: string;
}

const E = 14; // terminal centre line (8 m deep → front face at x = 10)
const W = -14;
const D = 8;

export function makeAirport(a: AirportSpec): DestinationPack {
  const flights = flightsFrom(a.id);
  const f = flights[0];
  const dest = f ? `${f.cityName} (${f.code})` : 'your flight';
  const gate = f?.gate ?? 'A1';
  const glass = (over: Partial<BuildingDef> & Pick<BuildingDef, 'id' | 'position' | 'size'>): BuildingDef => ({
    facing: 'west',
    wall: '#cfd8de',
    trim: '#5c6670',
    roof: '#7c8086',
    storeys: 3,
    style: 'glass',
    ...over,
  });
  const jobId = `${a.id}-porter`;

  const npcs: NpcDef[] = [
    {
      id: a.staff.checkIn.id,
      name: a.staff.checkIn.name,
      role: 'Check-in agent',
      personality: 'Brisk and kind, has seen every kind of traveller.',
      position: [8.6, 4],
      facing: -Math.PI / 2,
      look: a.staff.checkIn.look,
      promptVerb: 'Check in with',
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId }, node: 'porter' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'checkin' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'checked' },
          { when: { kind: 'trip', stage: 'cleared' }, node: 'checked' },
          { when: { kind: 'trip', stage: 'elsewhere' }, node: 'elsewhere' },
          { node: 'noticket' },
        ],
        nodes: {
          checkin: {
            text: `${a.greeting} Passport, please… ECOWAS — no visa needed. You're on ${dest}. Window or aisle?`,
            options: [
              { label: 'Window, please', action: { kind: 'checkIn' } },
              { label: 'Aisle is fine', action: { kind: 'checkIn' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
          checked: {
            text: `You're checked in. Security is just up the concourse, then gate ${gate}. Safe flight!`,
            options: [{ label: 'Thank you', action: { kind: 'close' } }],
          },
          elsewhere: {
            text: 'This ticket doesn’t leave from this airport — check your boarding pass in your phone’s Travel app.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          noticket: {
            text: `Welcome to ${a.city} International. You'll need a ticket before you can check in — you can book one on your phone.`,
            options: [
              { label: 'Book on my phone', action: { kind: 'openFlights' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
          porter: {
            text: `Is that ${a.staff.porter.name}'s suitcase? Put it on the belt — thank you for helping.`,
            options: [
              { label: 'Hand over the suitcase', action: { kind: 'deliverJob', jobId } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: a.staff.security.id,
      name: a.staff.security.name,
      role: 'Security officer',
      personality: 'Firm, fair, and very serious about liquids.',
      position: [8.8, -13],
      facing: -Math.PI / 2,
      look: a.staff.security.look,
      promptVerb: 'Go through security with',
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'trip', stage: 'cleared' }, node: 'done' },
          { when: { kind: 'carryingLiquids' }, node: 'liquids' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'scan' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'checkin-first' },
          { node: 'travellers' },
        ],
        nodes: {
          liquids: {
            text: 'Bag on the belt… wait. Bottled drinks can’t go through security. Drink them here, or leave them with me.',
            options: [
              { label: 'Drink them now', action: { kind: 'security', liquids: 'drink' } },
              { label: 'Leave them', action: { kind: 'security', liquids: 'leave' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
          scan: {
            text: 'Bag on the belt, phone in the tray, walk through the arch.',
            options: [
              { label: 'Walk through', action: { kind: 'security' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
          'checkin-first': {
            text: 'Boarding pass? You need to check in at the desk first.',
            options: [{ label: 'Going', action: { kind: 'close' } }],
          },
          done: {
            text: `You're cleared. Gate ${gate} is at the end of the concourse.`,
            options: [{ label: 'Thanks', action: { kind: 'close' } }],
          },
          travellers: {
            text: 'Travellers only past this point. Check in first if you’re flying.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.gate.id,
      name: a.staff.gate.name,
      role: 'Gate agent',
      personality: 'Cheerful, keeps the boarding queue moving.',
      position: [8.6, -28],
      facing: -Math.PI / 2,
      look: a.staff.gate.look,
      promptVerb: 'Board with',
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'trip', stage: 'cleared' }, node: 'board' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'security-first' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'checkin-first' },
          { node: 'none' },
        ],
        nodes: {
          board: {
            text: `Now boarding ${dest}, gate ${gate}. Boarding pass? Lovely — enjoy your flight.`,
            options: [
              { label: 'Board the plane', action: { kind: 'board' } },
              { label: 'One minute', action: { kind: 'close' } },
            ],
          },
          'security-first': {
            text: 'Please go through security first — it’s just behind you.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          'checkin-first': {
            text: 'You need to check in at the desk before you can board.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          none: {
            text: `Gate ${gate}. Only passengers with a boarding pass, please.`,
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.shop.id,
      name: a.staff.shop.name,
      role: 'Shopkeeper',
      personality: 'Chatty; airport prices, airport smiles.',
      position: [8.6, 17],
      facing: -Math.PI / 2,
      look: a.staff.shop.look,
      promptVerb: 'Talk to',
      idle: 'sway',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: a.staff.shop.greeting,
            options: [
              { label: 'Show me', action: { kind: 'openShop', businessId: `${a.id}-shop` } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: a.staff.porter.id,
      name: a.staff.porter.name,
      role: 'Traveller',
      personality: 'Overpacked and running late.',
      position: [5.0, 28],
      facing: Math.PI / 2,
      look: a.staff.porter.look,
      promptVerb: 'Talk to',
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: a.staff.porter.line,
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId } },
              { label: 'Sorry, not now', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'The check-in desk — under the DEPARTURES sign. Please hurry!',
            options: [{ label: 'On my way', action: { kind: 'close' } }],
          },
          thanks: {
            text: 'You saved my flight! Safe travels.',
            options: [{ label: 'You too', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.taxi.id,
      name: a.staff.taxi.name,
      role: 'Taxi driver',
      personality: 'Knows every shortcut and every traffic jam.',
      position: [5.0, 37],
      facing: -Math.PI / 2,
      look: a.staff.taxi.look,
      promptVerb: 'Talk to',
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: a.staff.taxi.line,
            options: [
              { label: 'Take a taxi into town', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ];

  return {
    id: a.id,
    name: a.city,
    area: 'Airport',
    country: a.country,
    currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
    localCurrency: a.localCurrency,
    tagline: a.tagline,
    spawn: { position: [6.4, 33], facing: Math.PI },
    arrival: { position: [6.4, 33], facing: Math.PI },
    walkable: [[-9.9, -40, 9.9, 40]],
    walls: [],
    palette: a.palette,
    road: { halfWidth: 4, sidewalk: 6, length: 84, style: 'asphalt' },
    backdrop: 'airfield',
    landmarks: [
      { id: `${a.id}-departures`, name: `${a.city} Departures`, blurb: 'The hall where every trip abroad begins.', position: [7, 4], radius: 4 },
      { id: `${a.id}-planes`, name: 'Plane spotting', blurb: 'Jets parked on the apron, past the north fence.', position: [0, -37], radius: 4 },
    ],
    welcome: a.welcome,
    buildings: [
      glass({ id: `${a.id}-arr`, position: [E, 30], size: [16, 9, D], storeys: 2, sign: { text: 'ARRIVALS', sub: `${a.city.toUpperCase()} INTERNATIONAL`, bg: '#1f2a33', fg: '#ffffff' } }),
      glass({ id: `${a.id}-shop`, position: [E, 17], size: [9, 9, D], storeys: 2, awning: a.brand.accent, sign: { text: a.staff.shop.shopName.toUpperCase(), sub: 'SNACKS · DRINKS · SOUVENIRS', bg: a.brand.accent, fg: '#15130f' } }),
      glass({ id: `${a.id}-dep`, position: [E, 2], size: [20, 12, D], sign: { text: 'DEPARTURES', sub: 'CHECK-IN · GULF COAST AIR', bg: a.brand.primary, fg: '#ffffff' } }),
      glass({ id: `${a.id}-sec`, position: [E, -14], size: [11, 12, D], sign: { text: 'SECURITY', sub: 'PASSPORT CONTROL', bg: '#1f2a33', fg: '#f2b705' } }),
      glass({ id: `${a.id}-gates`, position: [E, -30], size: [19, 12, D], sign: { text: a.gatesSign, sub: 'INTERNATIONAL DEPARTURES', bg: a.brand.primary, fg: '#ffffff' } }),

      { id: `${a.id}-park`, position: [W, -12], size: [24, 9.4, D], facing: 'east', wall: '#bdb8ae', trim: '#4f5a64', roof: '#6a6d70', storeys: 3,
        sign: { text: 'CAR PARK', sub: 'P · SHORT STAY', bg: '#2c5f9e', fg: '#ffffff' } },
      { id: `${a.id}-hotel`, position: [W, 18], size: [18, 15.6, D], facing: 'east', wall: '#e9e1d2', trim: '#7a5c3b', roof: '#5f5246', storeys: 5, balcony: true,
        awning: '#7a5c3b', sign: { text: a.hotelSign, sub: 'ROOMS · RESTAURANT', bg: '#ffffff', fg: '#7a5c3b' } },
      { id: `${a.id}-w3`, position: [W, -34], size: [10, 6.4, D], facing: 'east', wall: '#d6cfc2', trim: '#4f5a64', roof: '#6a6d70', storeys: 2 },
      { id: `${a.id}-w4`, position: [W, 35], size: [8, 6.4, D], facing: 'east', wall: '#cfc6b4', trim: '#4f5a64', roof: '#6a6d70', storeys: 2 },
    ],
    props: [
      // check-in: desks behind the agent, queue posts in front
      { id: 'desk-1', kind: 'counter', position: [9.55, 4], color: a.brand.primary, collide: true },
      { id: 'desk-2', kind: 'counter', position: [9.55, -1.5], color: a.brand.primary, collide: true },
      { id: 'q-1', kind: 'stanchion', position: [6.9, 4] },
      { id: 'q-2', kind: 'stanchion', position: [6.9, -1.5] },
      // security
      { id: 'scan', kind: 'scanner', position: [6.6, -13] },
      { id: 'q-3', kind: 'stanchion', position: [6.4, -9.2] },
      // gate
      { id: 'gate-desk', kind: 'gatedesk', position: [9.55, -28], color: a.brand.primary, collide: true },
      { id: 'q-4', kind: 'stanchion', position: [6.8, -24.5] },
      // forecourt
      { id: 'bench-1', kind: 'bench', position: [4.6, 10.5], collide: true },
      { id: 'bench-2', kind: 'bench', position: [4.6, -20], collide: true },
      { id: 'taxi-1', kind: 'car', position: [2.1, 33], color: a.taxiColor, collide: true },
      { id: 'car-2', kind: 'car', position: [-2.1, 8], rotation: Math.PI, color: '#e8e6e0', collide: true },
      { id: 'palm-1', kind: 'palm', position: [-8.6, 30], collide: true },
      { id: 'palm-2', kind: 'palm', position: [-8.6, 4], collide: true },
      { id: 'palm-3', kind: 'palm', position: [-8.6, -28], collide: true },
      { id: 'tree-1', kind: 'tree', position: [-8.4, 16], collide: true },
    ],
    npcs,
    walkers: a.walkers,
    businesses: [
      {
        id: `${a.id}-shop`,
        name: a.staff.shop.shopName,
        kind: 'provisions',
        ownerNpcId: a.staff.shop.id,
        greeting: a.staff.shop.greeting,
        stock: a.items.map((i) => ({ itemId: i.id, price: i.basePrice })),
      },
    ],
    items: a.items,
    jobs: [
      {
        id: jobId,
        title: 'Suitcase Dash',
        summary: `Carry ${a.staff.porter.name}'s suitcase from the drop-off to the check-in desk before the desk closes.`,
        giverNpcId: a.staff.porter.id,
        dropoffNpcId: a.staff.checkIn.id,
        cargo: 'Heavy suitcase',
        timeLimitMs: 50_000,
        reward: 900,
        bonus: { underMs: 20_000, amount: 300 },
        cooldownMs: 30_000,
      },
    ],
    spots: [
      { id: `${a.id}-bench-1`, kind: 'bench', position: [5.5, 10.5], label: 'Bench', verb: 'Rest on' },
      { id: `${a.id}-bench-2`, kind: 'bench', position: [5.5, -20], label: 'Bench', verb: 'Rest on' },
    ],
    traffic: a.traffic,
    startingMoney: 0,
  };
}
