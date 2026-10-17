import type { BuildingDef, DestinationPack, ItemDef, NpcDef, NpcLook, WalkerDef } from '../types';

/**
 * Railway station forecourt + concourse, built from one template so every station plays the same way
 * (ride in → ticket check → bag scan → platform → train) while names, colours, staff and stock come from the city.
 * It follows the airport layout, so the same walkable street works:
 *   east side — the station hall: exit, kiosk, ticket check, bag scan, platforms (north end)
 *   west side — the car park and the motor park; the tracks and a waiting train beyond the north fence
 * The steps reuse the flight ticket: check-in is the ticket check, security the bag scan, the gate the platform.
 */

export interface StationSpec {
  id: string;
  city: string;
  /** e.g. "Mobolaji Johnson Station". */
  stationName: string;
  /** Neighbourhood on the signs, e.g. "EBUTE METTA". */
  locality: string;
  tagline: string;
  brand: { primary: string; accent: string };
  greeting: string;
  staff: {
    inspector: { id: string; name: string; look: NpcLook };
    security: { id: string; name: string; look: NpcLook };
    guard: { id: string; name: string; look: NpcLook };
    shop: { id: string; name: string; look: NpcLook; shopName: string; greeting: string };
    porter: { id: string; name: string; look: NpcLook; line: string };
    /** Who takes you on into town: a danfo conductor or a taxi driver. */
    ride: { id: string; name: string; look: NpcLook; line: string; kind: 'danfo' | 'taxi'; color: string };
  };
  items: ItemDef[];
  walkers: WalkerDef[];
  palette: DestinationPack['palette'];
  traffic: DestinationPack['traffic'];
  welcome?: DestinationPack['welcome'];
}

const E = 14;
const W = -14;
const D = 8;

export function makeStation(a: StationSpec): DestinationPack {
  const hall = (over: Partial<BuildingDef> & Pick<BuildingDef, 'id' | 'position' | 'size'>): BuildingDef => ({
    facing: 'west',
    wall: '#ece6da',
    trim: a.brand.primary,
    roof: '#6f6a62',
    storeys: 2,
    style: 'glass',
    ...over,
  });
  const jobId = `${a.id}-porter`;
  const sign = a.stationName.toUpperCase();

  const npcs: NpcDef[] = [
    {
      id: a.staff.inspector.id,
      name: a.staff.inspector.name,
      role: 'Ticket inspector',
      personality: 'Unhurried, knows every coach number by heart.',
      position: [8.6, 4],
      facing: -Math.PI / 2,
      look: a.staff.inspector.look,
      promptVerb: 'Show your ticket to',
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId }, node: 'porter' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'check' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'checked' },
          { when: { kind: 'trip', stage: 'cleared' }, node: 'checked' },
          { when: { kind: 'trip', stage: 'elsewhere' }, node: 'elsewhere' },
          { node: 'noticket' },
        ],
        nodes: {
          check: {
            text: `${a.greeting} Ticket, please… {class} class to {flight}. The next train leaves at {departs}. {entry}`,
            options: [
              { label: 'Show my ticket', action: { kind: 'checkIn' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
          checked: {
            text: 'Your ticket is stamped. The bag scan is just up the hall, then platform {gate}.',
            options: [{ label: 'Thank you', action: { kind: 'close' } }],
          },
          elsewhere: {
            text: 'This ticket isn’t for a train from this station — look at it again in your phone’s Travel app.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          noticket: {
            text: `Welcome to ${a.stationName}. You need a ticket for the train — you can buy one on your phone, in the Travel app.`,
            options: [
              { label: 'Buy on my phone', action: { kind: 'openFlights' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
          porter: {
            text: `Is that ${a.staff.porter.name}'s bag? Put it here by the barrier — I’ll see it onto the right coach.`,
            options: [
              { label: 'Hand over the bag', action: { kind: 'deliverJob', jobId } },
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
      personality: 'Calm, thorough, waves the queue along.',
      position: [8.8, -13],
      facing: -Math.PI / 2,
      look: a.staff.security.look,
      promptVerb: 'Go through the bag check with',
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'trip', stage: 'cleared' }, node: 'done' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'scan' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'ticket-first' },
          { node: 'travellers' },
        ],
        nodes: {
          scan: {
            text: 'Bag on the scanner, please, and walk through. Drinks are fine on the train.',
            options: [
              { label: 'Walk through', action: { kind: 'security' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
          'ticket-first': {
            text: 'Have your ticket checked at the barrier first, then come through.',
            options: [{ label: 'Going', action: { kind: 'close' } }],
          },
          done: {
            text: 'You’re cleared. Platform {gate} is at the end of the hall.',
            options: [{ label: 'Thanks', action: { kind: 'close' } }],
          },
          travellers: {
            text: 'Passengers only past this point. Get a ticket and have it checked first.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.guard.id,
      name: a.staff.guard.name,
      role: 'Train guard',
      personality: 'Whistle on a lanyard, watch always in hand.',
      position: [8.6, -28],
      facing: -Math.PI / 2,
      look: a.staff.guard.look,
      promptVerb: 'Board with',
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'trip', stage: 'cleared' }, node: 'board' },
          { when: { kind: 'trip', stage: 'checked-in' }, node: 'security-first' },
          { when: { kind: 'trip', stage: 'booked' }, node: 'ticket-first' },
          { node: 'none' },
        ],
        nodes: {
          board: {
            text: 'The train to {flight} is on platform {gate} and leaves at {departs}. {class} class is up front — find your seat and wait on board.',
            options: [
              { label: 'Board the train', action: { kind: 'board' } },
              { label: 'One minute', action: { kind: 'close' } },
            ],
          },
          'security-first': {
            text: 'Bag check first, please — it’s just behind you.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          'ticket-first': {
            text: 'Have your ticket checked at the barrier before you come on the platform.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
          none: {
            text: 'Platforms 1 and 2. Only passengers with a checked ticket, please.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.shop.id,
      name: a.staff.shop.name,
      role: 'Shopkeeper',
      personality: 'Sells to every train, remembers every regular.',
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
      personality: 'Travelling with far too much luggage.',
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
            text: 'The ticket barrier — under the TICKETS sign. Please hurry!',
            options: [{ label: 'On my way', action: { kind: 'close' } }],
          },
          thanks: {
            text: 'You saved my journey! Safe travels.',
            options: [{ label: 'You too', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: a.staff.ride.id,
      name: a.staff.ride.name,
      role: a.staff.ride.kind === 'danfo' ? 'Danfo conductor' : 'Taxi driver',
      personality: 'Meets every train.',
      position: [5.0, 37],
      facing: -Math.PI / 2,
      look: a.staff.ride.look,
      promptVerb: 'Talk to',
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: a.staff.ride.line,
            options: [
              { label: a.staff.ride.kind === 'danfo' ? 'Take a danfo' : 'Take a taxi into town', action: { kind: 'openTravel' } },
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
    area: a.stationName,
    country: 'Nigeria',
    currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
    tagline: a.tagline,
    spawn: { position: [6.4, 33], facing: Math.PI },
    // you step off the train at the platform end
    arrival: { position: [5.6, -33], facing: 0 },
    walkable: [[-9.9, -40, 9.9, 40]],
    walls: [],
    palette: a.palette,
    road: { halfWidth: 4, sidewalk: 6, length: 84, style: 'asphalt' },
    backdrop: 'railway',
    ambience: { traffic: 0.4, crowd: 0.5, horns: 1.2, chimes: 1 },
    landmarks: [
      { id: `${a.id}-hall`, name: a.stationName, blurb: `The ${a.locality.toLowerCase()} station hall, where the trains to and from ${a.city === 'Lagos' ? 'Ibadan' : 'Lagos'} start.`, position: [7, 4], radius: 4 },
      { id: `${a.id}-train`, name: 'Train spotting', blurb: 'The standard-gauge train waiting at the platform, past the north fence.', position: [0, -37], radius: 4 },
    ],
    welcome: a.welcome,
    buildings: [
      hall({ id: `${a.id}-exit`, position: [E, 30], size: [16, 9, D], sign: { text: 'WAY OUT', sub: `${a.locality} · TAXIS · BUSES`, bg: '#1f2a33', fg: '#ffffff' } }),
      hall({ id: `${a.id}-shop`, position: [E, 17], size: [9, 9, D], awning: a.brand.accent, sign: { text: a.staff.shop.shopName.toUpperCase(), sub: 'SNACKS · DRINKS · PAPERS', bg: a.brand.accent, fg: '#15130f' } }),
      hall({ id: `${a.id}-main`, position: [E, 2], size: [20, 13, D], storeys: 3, sign: { text: sign, sub: 'TICKETS · WESTERN EXPRESS RAIL', bg: a.brand.primary, fg: '#ffffff' } }),
      hall({ id: `${a.id}-sec`, position: [E, -14], size: [11, 9, D], sign: { text: 'BAG CHECK', sub: 'PASSENGERS ONLY', bg: '#1f2a33', fg: '#f2b705' } }),
      hall({ id: `${a.id}-plat`, position: [E, -30], size: [19, 9, D], sign: { text: 'PLATFORMS 1 – 2', sub: 'LAGOS ⇄ IBADAN', bg: a.brand.primary, fg: '#ffffff' } }),

      { id: `${a.id}-park`, position: [W, -12], size: [24, 6.4, D], facing: 'east', wall: '#c9c2b4', trim: '#4f5a64', roof: '#6a6d70', storeys: 2,
        sign: { text: 'CAR PARK', sub: 'P · PICK-UP AND DROP-OFF', bg: '#2c5f9e', fg: '#ffffff' } },
      { id: `${a.id}-motorpark`, position: [W, 18], size: [18, 6.4, D], facing: 'east', wall: '#e3d6bf', trim: '#7a5c3b', roof: '#5f5246', storeys: 2,
        awning: '#f2b705', sign: { text: 'MOTOR PARK', sub: 'DANFO · TAXI · KEKE', bg: '#f2b705', fg: '#15130f' } },
      { id: `${a.id}-w3`, position: [W, -34], size: [10, 6.4, D], facing: 'east', wall: '#d6cfc2', trim: '#4f5a64', roof: '#6a6d70', storeys: 2 },
      { id: `${a.id}-w4`, position: [W, 35], size: [8, 6.4, D], facing: 'east', wall: '#cfc6b4', trim: '#4f5a64', roof: '#6a6d70', storeys: 2 },
    ],
    props: [
      // ticket barrier: counters behind the inspector, queue posts in front
      { id: 'desk-1', kind: 'counter', position: [9.55, 4], color: a.brand.primary, collide: true },
      { id: 'desk-2', kind: 'counter', position: [9.55, -1.5], color: a.brand.primary, collide: true },
      { id: 'q-1', kind: 'stanchion', position: [6.9, 4] },
      { id: 'q-2', kind: 'stanchion', position: [6.9, -1.5] },
      // bag scan
      { id: 'scan', kind: 'scanner', position: [6.6, -13] },
      { id: 'q-3', kind: 'stanchion', position: [6.4, -9.2] },
      // platform gate
      { id: 'gate-desk', kind: 'gatedesk', position: [9.55, -28], color: a.brand.primary, collide: true },
      { id: 'q-4', kind: 'stanchion', position: [6.8, -24.5] },
      // forecourt
      { id: 'bench-1', kind: 'bench', position: [4.6, 10.5], collide: true },
      { id: 'bench-2', kind: 'bench', position: [4.6, -20], collide: true },
      { id: 'ride-1', kind: a.staff.ride.kind === 'danfo' ? 'danfo' : 'car', position: [2.1, 33], color: a.staff.ride.color, collide: true },
      { id: 'car-2', kind: 'car', position: [-2.1, 8], rotation: Math.PI, color: '#e8e6e0', collide: true },
      { id: 'tree-1', kind: 'tree', position: [-8.6, 30], collide: true },
      { id: 'tree-2', kind: 'tree', position: [-8.6, 4], collide: true },
      { id: 'palm-1', kind: 'palm', position: [-8.6, -28], collide: true },
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
        title: 'Platform Dash',
        summary: `Carry ${a.staff.porter.name}'s bag from the drop-off to the ticket barrier before the train is called.`,
        giverNpcId: a.staff.porter.id,
        dropoffNpcId: a.staff.inspector.id,
        cargo: 'Bulging travel bag',
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
