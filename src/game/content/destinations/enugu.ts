import type { DestinationPack } from '../types';

/**
 * Enugu — Ogui, between Ogbete Main Market and the old Coal Camp, under Milliken Hill (fictional businesses; Ogbete,
 * Michael Okpara Square, the Coal Camp and Milliken Hill are real). Enugu grew around the coal mines, and is still
 * the Coal City. Nne Ada sells cassava at Ogbete and needs a sack carried to Mama Chinyere's abacha stall; Mama
 * Chinyere takes helpers on her stall at the lunch rush (a shift); Uche sells Nsukka pottery, Akwete cloth and isi-agu
 * tops (bargain); Fatima, a geography student from Kaduna, wants a guide. Chidi drives to the airport, or puts you on
 * the bus to Benin City.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const enugu: DestinationPack = {
  id: 'enugu-ogui',
  name: 'Enugu',
  area: 'Ogui',
  tagline: 'Ogui — Ogbete market, abacha and okpa, the Coal City’s miners’ streets and Milliken Hill above.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#dfd6b2',
    fog: '#d0c8a6',
    ground: '#7f7650',
    road: '#383735',
    roadLine: '#efe4c8',
    sidewalk: '#c4bba4',
    gutter: '#4f4a45',
    sun: '#ffe8bc',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.5, crowd: 0.6, horns: 3 },
  vista: 'north',
  vistaStyle: 'escarpment',
  landmarks: [
    { id: 'enu-ogbete', name: 'Ogbete Main Market', blurb: 'The biggest market in Enugu State: foodstuff, cloth, hardware, phones — Ogui’s busy heart.', position: [4.6, -12], radius: 5 },
    { id: 'enu-okpara', name: 'Michael Okpara Square', blurb: 'The city’s ceremonial square, named after the Premier of the old Eastern Region — parades, rallies and concerts.', position: [-4.6, -10], radius: 4 },
    { id: 'enu-coalcamp', name: 'Coal Camp', blurb: 'Enugu grew around the coal mines opened in 1915; the miners lived here, and the city is still called the Coal City.', position: [4.6, 20], radius: 4 },
    { id: 'enu-milliken', name: 'View to Milliken Hill', blurb: 'The escarpment above the city, climbed by the winding Milliken Hill road; on top, the pine forest at Ngwo hides a cave and a waterfall.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Mama Chinyere', text: 'Nnọọ — welcome to the Coal City! My abacha stall is by the square. If you want work, the lunch rush always needs hands.' },

  buildings: [
    { id: 'u-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#d9cbb0', trim: '#2f6b3a', roof: '#6c6f72', storeys: 2 },
    { id: 'u-e2', position: [E, -23.6], size: [10.4, 6.4, D], facing: 'west', wall: '#e8dcc4', trim: '#2c5f9e', roof: '#6c6f72', storeys: 2,
      awning: '#2c5f9e', sign: { text: 'OGBETE PHONES', sub: 'PHONES · CHARGERS · REPAIRS', bg: '#ffffff', fg: '#2c5f9e' } },
    { id: 'u-e3', position: [E, -12.6], size: [12, 3.4, D], facing: 'west', wall: '#d2b98e', trim: '#8d3b2a', roof: '#6c6f72', storeys: 1,
      awning: '#c9583b', sign: { text: 'OGBETE MAIN MARKET', sub: 'FOODSTUFF · CLOTH · EVERYTHING', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'u-e4', position: [E, -1.4], size: [10.4, 3.4, D], facing: 'west', wall: '#c8b49a', trim: '#7a3b72', roof: '#6c6f72', storeys: 1,
      awning: '#7a3b72', businessId: 'uche-crafts', sign: { text: 'UCHE CRAFTS', sub: 'NSUKKA POTS · AKWETE · ISI-AGU', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'u-e5', position: [E, 9.6], size: [10.4, 9.4, D], facing: 'west', wall: '#efe6d4', trim: '#4a5a72', roof: '#6c6f72', storeys: 3, balcony: true,
      sign: { text: 'OGUI ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#4a5a72' } },
    // Coal Camp: the old miners' terraces, low and long
    { id: 'u-e6', position: [E, 21.6], size: [12, 3.4, D], facing: 'west', wall: '#bfb4a0', trim: '#3a3a3a', roof: '#4f4f52', storeys: 1,
      sign: { text: 'COAL CAMP', sub: 'MINERS’ QUARTERS · SINCE 1915', bg: '#2a2a2a', fg: '#e8e2d0' } },
    { id: 'u-e7', position: [E, 33.6], size: [10.4, 3.4, D], facing: 'west', wall: '#b9ae99', trim: '#3a3a3a', roof: '#4f4f52', storeys: 1 },

    { id: 'u-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#2f6b3a', roof: '#6c6f72', storeys: 2 },
    // Michael Okpara Square: a long, low grandstand facing the street
    { id: 'u-w2', position: [W, -11], size: [20, 6.4, D], facing: 'east', wall: '#ece6da', trim: '#2f6b3a', roof: '#5f6a5a', storeys: 2, style: 'glass',
      sign: { text: 'MICHAEL OKPARA SQUARE', sub: 'ENUGU', bg: '#2f6b3a', fg: '#ffffff' } },
    { id: 'u-w3', position: [W, 5.2], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#6c6f72', storeys: 1,
      awning: '#2f6b3a', businessId: 'chinyere-kitchen', sign: { text: 'MAMA CHINYERE', sub: 'ABACHA · OKPA · NKWOBI', bg: '#2f6b3a', fg: '#fff6e0' } },
    { id: 'u-w4', position: [W, 16.4], size: [10.4, 6.4, D], facing: 'east', wall: '#d1b48c', trim: '#fdf3df', roof: '#6c6f72', storeys: 2 },
    { id: 'u-w5', position: [W, 27.4], size: [10.4, 6.4, D], facing: 'east', wall: '#e9e1cf', trim: '#c0392b', roof: '#6c6f72', storeys: 2,
      awning: '#c0392b', sign: { text: 'OGUI MOTOR PARK', sub: 'AIRPORT · BENIN · ONITSHA', bg: '#c0392b', fg: '#ffffff' } },
    { id: 'u-w6', position: [W, 38], size: [8, 3.4, D], facing: 'east', wall: '#e8e6e0', trim: '#c0392b', roof: '#6c6f72', storeys: 1 },
  ],

  props: [
    // Ogbete spills onto the pavement
    { id: 'stall-ada', kind: 'stall', position: [6.0, -15.6], rotation: -Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'stall-2', kind: 'stall', position: [6.0, -9.4], rotation: -Math.PI / 2, color: '#2f6b3a', collide: true },
    { id: 'crates-1', kind: 'crates', position: [6.4, -19.6], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [5.6, -5.2], color: '#f2b705' },
    // Mama Chinyere's stall: the pot and the grill out front
    { id: 'grill-1', kind: 'grill', position: [-6.2, 2.6], rotation: Math.PI / 2, collide: true },
    { id: 'tree-1', kind: 'tree', position: [-6.2, -24], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, 4], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 12], collide: true },
    { id: 'crates-coal', kind: 'crates', position: [6.4, 26.6], color: '#2a2a2a', collide: true },
    { id: 'park-taxi', kind: 'car', position: [3.9, 31], rotation: 0, color: '#e8e6e0', collide: true },
  ],

  npcs: [
    {
      id: 'nne-ada',
      name: 'Nne Ada',
      role: 'Cassava seller',
      personality: 'Small, fierce, and the fastest counter of change in Ogbete.',
      position: [5.0, -13.0],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#c9583b', bottom: '#2f6b3a', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#2f6b3a', accessory: 'earrings', height: 1.6 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'This cassava becomes abacha by noon. Shredded, soaked, and into Mama Chinyere’s pot.',
          'My father mined coal at Onyeama. I sell cassava. Both of us, hard work.',
          'Ogbete is a city inside a city. Don’t get lost — or do, it is fun.',
        ],
        likes: ['abacha', 'akwete-cloth', 'enu-okpa'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'cassava-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'cassava-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Mama Chinyere is waiting for this cassava for her abacha. Carry the sack to her stall — across the road, by the square.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'cassava-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Mama Chinyere. Reach her inside thirty seconds and she adds ₦750 — the lunch rush is coming.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'cassava-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, the green awning by the square.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Daalụ! The next sack is still on the truck — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-chinyere',
      name: 'Mama Chinyere',
      role: 'Abacha seller',
      personality: 'Commands her stall like a general; generous with ugba, never with gossip.',
      position: [-5.0, 7.4],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#2f6b3a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#2f6b3a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Abacha needs ugba, garden egg, palm oil and patience. Mostly patience.',
          'Okpa in the morning, abacha at noon, nkwobi in the evening. That is the Enugu day.',
          'The miners used to eat here. Now it is bankers. Same appetite.',
        ],
        likes: ['nsukka-pot', 'enu-okpa', 'black-soup'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'cassava-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Nnọọ! Abacha, okpa, nkwobi, bitterleaf soup — sit. Or tie an apron: the lunch rush is coming.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'chinyere-kitchen' } },
              { label: 'Help at the stall (shift)', action: { kind: 'startShift', shiftId: 'abacha-stall' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Nne Ada’s cassava! Just in time. Bring it.',
            options: [
              { label: 'Hand over the sack', action: { kind: 'deliverJob', jobId: 'cassava-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'uche',
      name: 'Uche',
      role: 'Craft seller',
      personality: 'Soft-spoken potter’s son; knows which village made every pot.',
      position: [5.0, -1.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', height: 1.78 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'These pots come from the women potters around Nsukka. Fired in the open, the old way.',
          'Isi-agu — the lion’s head. Wear it and people call you chief.',
          'Akwete cloth is woven on upright looms. One wrapper takes days.',
        ],
        likes: ['abacha', 'enu-malt', 'bronze-bell'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Nsukka pots, Akwete cloth, isi-agu tops — real things, from the South-East. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'uche-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'fatima-enugu',
      name: 'Fatima',
      role: 'Visitor',
      personality: 'A geography student from Kaduna, mapping the old coal towns.',
      position: [-4.8, 22],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#7a4a2e', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long', headwear: 'wrap', headColor: '#2c5f9e', accessory: 'glasses', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'Kaduna is flat. This hill is the most exciting thing I have seen all year.',
          'Coal made this city. The railway came for the coal, and the city came with it.',
          'I tried okpa this morning. I am now an okpa person.',
        ],
        likes: ['enu-okpa', 'miner-lamp', 'abacha'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'coal-city-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'coal-city-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'coal-city-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'coal-city-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — Fatima, geography, Kaduna. I’m mapping the Coal City. Will you show me round? Coal Camp, Ogbete, then Okpara Square.',
            options: [
              { label: 'Guide Fatima', action: { kind: 'acceptJob', jobId: 'coal-city-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,800 from my project fund — and ₦1,200 more if we finish before the light goes. Walk, so I can take notes.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'coal-city-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the way — Coal Camp, Ogbete, Okpara Square. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m mapping as we go.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Three sites, forty pages of notes. My supervisor will cry. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'coal-city-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! Tomorrow I’m going up to the pine forest at Ngwo.',
            options: [{ label: 'Enjoy', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'driver-chidi',
      name: 'Chidi',
      role: 'Taxi driver',
      personality: 'Has driven Milliken Hill ten thousand times and still slows for the view.',
      position: [-4.8, 32.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Airport is out east — thirty minutes. Benin by bus is five hours, over the Niger at Onitsha.',
          'Enugu people are calm. Lagos people come here to rest.',
          'At night, from Milliken Hill, the whole city is lights.',
        ],
        likes: ['abacha', 'enu-okpa', 'enu-malt'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Thirty minutes. Or I’ll walk you to the Benin bus — five hours, cheaper than flying.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Take the bus to Benin City', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'uw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#2f6b3a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-5.4, 30], [-5.4, -34], [-5.4, 30]], speed: 1.1 },
    { id: 'uw-2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#7a3b72' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'ogene-night',
      name: 'Highlife & Ogene Night',
      kind: 'concert',
      venue: 'Michael Okpara Square',
      description: 'A highlife band with ogene gongs and talking drums on the square — the Coal City dances under the lights of Milliken Hill.',
      hours: [19, 23],
      everyDays: 2,
      price: 3000,
      joy: 26,
      energy: 8,
    },
  ],
  spots: [
    { id: 'ogene-night-gate', kind: 'event', position: [-5.6, -18], label: 'Highlife & Ogene Night', verb: 'Go to', eventId: 'ogene-night' },
    { id: 'ogui-bench', kind: 'bench', position: [-5.6, 12], label: 'Bench by the stall', verb: 'Rest on' },
    { id: 'ogui-room-door', kind: 'home', position: [6.2, 9.6], label: 'Ogui Rooms', verb: 'Check', homeId: 'ogui-room' },
  ],
  homes: [
    { id: 'ogui-room', name: 'Ogui room', description: 'A cool room two floors up, Ogbete’s noise below and Milliken Hill out of the window. Pay once for your stay — or buy it.', moveInCost: 7000, buyPrice: 80000 },
  ],

  businesses: [
    {
      id: 'chinyere-kitchen',
      name: 'Mama Chinyere',
      kind: 'food',
      ownerNpcId: 'mama-chinyere',
      greeting: 'Enugu food.',
      stock: [
        { itemId: 'abacha', price: 1800 },
        { itemId: 'nkwobi', price: 3200 },
        { itemId: 'onugbu-fufu', price: 2500 },
        { itemId: 'enu-okpa', price: 900 },
      ],
    },
    {
      id: 'uche-crafts',
      name: 'Uche Crafts',
      kind: 'market',
      ownerNpcId: 'uche',
      greeting: 'From the South-East.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'nsukka-pot', price: 5000 },
        { itemId: 'akwete-cloth', price: 8500 },
        { itemId: 'isiagu-top', price: 9000 },
      ],
    },
  ],

  items: [
    { id: 'enu-okpa', name: 'Okpa', category: 'food', basePrice: 900, nutrition: 25, consumable: true, icon: 'snack', description: 'Steamed Bambara-nut pudding, wrapped warm — the Enugu breakfast.' },
    { id: 'abacha', name: 'Abacha', category: 'food', basePrice: 1800, consumable: true, nutrition: 40, icon: 'plate', description: 'African salad: shredded cassava with ugba, garden egg and palm-oil dressing.' },
    { id: 'nkwobi', name: 'Nkwobi', category: 'food', basePrice: 3200, consumable: true, nutrition: 45, icon: 'plate', description: 'Spiced cow foot in a thick palm-oil sauce, with utazi leaves.' },
    { id: 'onugbu-fufu', name: 'Bitterleaf soup & fufu', category: 'food', basePrice: 2500, consumable: true, nutrition: 50, icon: 'plate', description: 'Ofe onugbu — bitterleaf soup with cocoyam, meat and fish.' },
    { id: 'nsukka-pot', name: 'Nsukka clay pot', category: 'souvenir', basePrice: 5000, icon: 'key', description: 'A small water pot, open-fired by the women potters around Nsukka.' },
    { id: 'akwete-cloth', name: 'Akwete cloth', category: 'souvenir', basePrice: 8500, icon: 'bag', description: 'Hand-woven on an upright loom, in bright geometric bands.' },
    { id: 'isiagu-top', name: 'Isi-agu top', category: 'clothing', basePrice: 9000, icon: 'bag', description: 'The lion’s-head print, worn for big days in the South-East.' },
  ],

  jobs: [
    {
      id: 'cassava-run',
      title: 'Cassava Run',
      summary: "Carry Nne Ada's sack of cassava from Ogbete across the road to Mama Chinyere's abacha stall before the lunch rush.",
      giverNpcId: 'nne-ada',
      dropoffNpcId: 'mama-chinyere',
      cargo: 'Sack of cassava',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 750 },
      cooldownMs: 25_000,
    },
    {
      id: 'coal-city-walk',
      kind: 'tour',
      tour: { stops: ['enu-coalcamp', 'enu-ogbete', 'enu-okpara'] },
      requires: { discovered: ['enu-coalcamp', 'enu-ogbete', 'enu-okpara'] },
      title: 'Coal City Walk',
      summary: 'Guide Fatima to the Coal Camp, Ogbete Main Market and Michael Okpara Square, in that order. She maps as she walks — don’t lose her.',
      giverNpcId: 'fatima-enugu',
      dropoffNpcId: 'fatima-enugu',
      cargo: 'Guiding Fatima',
      timeLimitMs: 220_000,
      reward: 3800,
      bonus: { underMs: 160_000, amount: 1200 },
      cooldownMs: 120_000,
    },
  ],

  shifts: [
    {
      id: 'abacha-stall',
      title: 'Abacha stall shift',
      npcId: 'mama-chinyere',
      skill: 'cooking',
      dishes: [
        { id: 'abacha', name: 'Abacha', icon: 'plate' },
        { id: 'okpa', name: 'Okpa', icon: 'snack' },
        { id: 'nkwobi', name: 'Nkwobi', icon: 'plate' },
        { id: 'zobo', name: 'Cold zobo', icon: 'cup' },
      ],
      orders: 8,
      seconds: 5,
      perLevel: 0.6,
      payPerOrder: 220,
      perfectTip: 450,
      energyCost: 18,
      minEnergy: 20,
      staffMeal: 40,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
