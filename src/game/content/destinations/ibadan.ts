import type { DestinationPack } from '../types';

/**
 * Ibadan — a Dugbe street in the old city centre (fictional businesses; Cocoa House, Dugbe Market, Mapo Hall and
 * Bower's Tower are real). Cocoa House rises over the west side; Dugbe Market fills the east; Mapo Hall's columns
 * stand at the south end; and to the north the street opens on the city's famous sea of rust-brown roofs, with
 * Bower's Tower on Oke-Are hill. Mama Risi sells pepper at Dugbe Market and needs a basket carried to Iya Sikiru's
 * amala buka; Dayo, back from abroad, wants someone to show him his grandfather's city; Alhaji Lateef sells aso-oke
 * from Iseyin (bargain). The station is at Moniya, a taxi ride north.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const ibadan: DestinationPack = {
  id: 'ibadan-dugbe',
  name: 'Ibadan',
  area: 'Dugbe',
  tagline: 'Dugbe — Cocoa House, the market, amala and ewedu, and rust-brown roofs to the horizon.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e8d6ab',
    fog: '#dccaa0',
    ground: '#9a7c58',
    road: '#3a3734',
    roadLine: '#efe4c8',
    sidewalk: '#c6b9a2',
    gutter: '#4f4a45',
    sun: '#ffe4b0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.55, crowd: 0.65, horns: 3 },
  vista: 'north',
  vistaStyle: 'roofs',
  landmarks: [
    { id: 'ibd-cocoa', name: 'Cocoa House', blurb: 'Finished in 1965 and paid for by the cocoa farmers of the West, it was the first skyscraper in West Africa.', position: [-4.6, -6], radius: 4 },
    { id: 'ibd-dugbe', name: 'Dugbe Market', blurb: 'One of the biggest markets in Ibadan: pepper, fabric, phones, pots — and the noise of a thousand bargains.', position: [4.6, -13], radius: 5 },
    { id: 'ibd-mapo', name: 'Mapo Hall', blurb: 'The colonial town hall of 1929, on Mapo Hill, with its row of tall columns; Ibadan’s kings have been crowned there.', position: [4.6, 30], radius: 4 },
    { id: 'ibd-bower', name: 'View to Bower’s Tower', blurb: 'On Oke-Are, the city’s highest hill, Bower’s Tower looks out over the rust-brown roofs of old Ibadan.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Mama Risi', text: 'Ẹ káàbọ̀ — welcome to Ibadan! I sell pepper in Dugbe Market. If you want work, come; my baskets are always heavier than my children.' },

  buildings: [
    { id: 'i-e1', position: [E, -35], size: [10, 9.4, D], facing: 'west', wall: '#d9c6a6', trim: '#7a4b32', roof: '#7a4a2e', storeys: 3, balcony: true },
    { id: 'i-e2', position: [E, -23.6], size: [10.4, 6.4, D], facing: 'west', wall: '#ebe0c8', trim: '#2c5f9e', roof: '#7a4a2e', storeys: 2,
      awning: '#2c5f9e', sign: { text: 'OKE-ADO PHONES', sub: 'PHONES · CHARGERS · REPAIRS', bg: '#ffffff', fg: '#2c5f9e' } },
    { id: 'i-e3', position: [E, -12.6], size: [11.4, 3.4, D], facing: 'west', wall: '#e3c99c', trim: '#8d3b2a', roof: '#7a4a2e', storeys: 1,
      awning: '#c9583b', sign: { text: 'DUGBE MARKET', sub: 'PEPPER · FABRIC · EVERYTHING', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'i-e4', position: [E, -1.6], size: [10.6, 6.4, D], facing: 'west', wall: '#cbb79a', trim: '#f4f0e6', roof: '#7a4a2e', storeys: 2,
      awning: '#7a3b72', sign: { text: 'ALHAJI LATEEF ASO-OKE', sub: 'ISEYIN WEAVES · CAPS · DRUMS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'i-e5', position: [E, 9.6], size: [10.4, 9.4, D], facing: 'west', wall: '#efe6d4', trim: '#4a5a72', roof: '#7a4a2e', storeys: 3, balcony: true,
      sign: { text: 'DUGBE ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#4a5a72' } },
    { id: 'i-e7', position: [E, 40], size: [6, 6.4, D], facing: 'west', wall: '#d6c3a3', trim: '#4f5a64', roof: '#7a4a2e', storeys: 2 },

    { id: 'i-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#1f6f4a', roof: '#7a4a2e', storeys: 2,
      awning: '#1f6f4a', sign: { text: 'OKE-ARE BOOKSHOP', sub: 'BOOKS · EXAMS · PRINTING', bg: '#1f6f4a', fg: '#ffffff' } },
    { id: 'i-w2', position: [W, -23.4], size: [10.4, 6.4, D], facing: 'east', wall: '#d1b48c', trim: '#fdf3df', roof: '#7a4a2e', storeys: 2 },
    { id: 'i-w3', position: [W, -7], size: [16, 9.4, D], facing: 'east', wall: '#e8e6e0', trim: '#5c6670', roof: '#7c8086', storeys: 3, style: 'glass',
      sign: { text: 'COCOA HOUSE', sub: 'DUGBE · SINCE 1965', bg: '#5b3a24', fg: '#f4e2c0' } },
    { id: 'i-w4', position: [W, 10.4], size: [11, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#7a4a2e', storeys: 1,
      awning: '#1f6f4a', businessId: 'sikiru-buka', sign: { text: 'IYA SIKIRU AMALA', sub: 'AMALA · EWEDU · GBEGIRI', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'i-w5', position: [W, 21.8], size: [10.4, 6.4, D], facing: 'east', wall: '#c97b63', trim: '#fff2e2', roof: '#7a4a2e', storeys: 2 },
    { id: 'i-w6', position: [W, 32.6], size: [10.4, 6.4, D], facing: 'east', wall: '#f4f0e6', trim: '#d8452b', roof: '#7a4a2e', storeys: 2,
      awning: '#d8452b', sign: { text: 'MONIYA TAXIS', sub: 'STATION · UI · OJOO · BODIJA', bg: '#d8452b', fg: '#ffffff' } },
  ],

  props: [
    // Dugbe Market spills onto the pavement
    { id: 'stall-risi', kind: 'stall', position: [6.0, -15.4], rotation: -Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'stall-2', kind: 'stall', position: [6.0, -9.6], rotation: -Math.PI / 2, color: '#2c5f9e', collide: true },
    { id: 'crates-1', kind: 'crates', position: [6.4, -19.4], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [5.6, -6.2], color: '#f2b705' },
    { id: 'kiosk-1', kind: 'kiosk', position: [-6.3, -20], rotation: Math.PI / 2, collide: true },
    { id: 'tree-1', kind: 'tree', position: [-6.2, -30], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, 20], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 16.4], collide: true },
    { id: 'keke-1', kind: 'keke', position: [-3.9, 27], rotation: 0, collide: true },
    // Cocoa House rises over the west row; Mapo Hall's columns close the south-east corner
    { id: 'cocoa-house', kind: 'skyscraper', position: [-24, -7] },
    { id: 'mapo-hall', kind: 'colonnade', position: [15.4, 28], rotation: -Math.PI / 2 },
    // Bower's Tower on Oke-Are, beyond the roofs to the north
    { id: 'bowers-tower', kind: 'hilltower', position: [10, -100] },
  ],

  npcs: [
    {
      id: 'mama-risi',
      name: 'Mama Risi',
      role: 'Pepper seller',
      personality: 'Loud, generous, knows the price of everything in Dugbe.',
      position: [5.0, -13.0],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#f2b705', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Tatashe, shombo, ata rodo — if it burns, I sell it.',
          'Ibadan people don’t rush. We get there, and we get there with pepper.',
          'My mother had this same spot in Dugbe. Her mother before her.',
        ],
        likes: ['abula', 'aso-oke-cap', 'gala'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'dugbe-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'dugbe-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Iya Sikiru is waiting for this pepper for her ewedu and gbegiri. Carry the basket to her buka — the green awning, across the road, past Cocoa House.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'dugbe-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Iya Sikiru. Reach her inside thirty seconds and she adds ₦750 — her pot is already boiling.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'dugbe-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Green awning, other side of the road, past the tall building.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Ese gan! The next basket is not ready yet — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'iya-sikiru',
      name: 'Iya Sikiru',
      role: 'Buka owner',
      personality: 'Brisk, proud, serves the softest amala in Dugbe.',
      position: [-5.0, 12.6],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#1f6f4a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Amala must be soft and hot. If it is hard, it is not my amala.',
          'Abula — amala, gbegiri and ewedu together. That is Ibadan on a plate.',
          'Students from UI come all the way to Dugbe to eat here on Fridays.',
        ],
        likes: ['abula', 'zobo', 'ibadan-postcard'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'dugbe-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome! Amala and ewedu, abula, ofada with ayamase — sit down, sit down.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'sikiru-buka' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Mama Risi’s pepper! Just in time. Bring it, bring it.',
            options: [
              { label: 'Hand over the basket', action: { kind: 'deliverJob', jobId: 'dugbe-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'alhaji-lateef',
      name: 'Alhaji Lateef',
      role: 'Aso-oke seller',
      personality: 'Courtly and patient; enjoys a long bargain more than a quick sale.',
      position: [5.0, -3.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#7a3b72', height: 1.76 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'This aso-oke is woven in Iseyin, strip by strip, on the old looms.',
          'For a wedding you want sanyan — the beige silk. For a party, alaari, the red.',
          'Bargaining is a conversation. Sit, let us talk.',
        ],
        likes: ['abula', 'zobo', 'rail-keyring'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Aso-oke from Iseyin, caps, a talking drum — the real things. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'lateef-asooke' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'dayo',
      name: 'Dayo',
      role: 'Visitor',
      personality: 'Grew up abroad; back to see the city his grandfather talked about.',
      position: [-4.8, 22],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'hightop', accessory: 'glasses', height: 1.8 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'My grandfather worked in Cocoa House when it was new. He said you could see all of Ibadan from the top.',
          'I can understand Yoruba, I just reply in English. Don’t laugh.',
          'All these brown roofs — he described them exactly.',
        ],
        likes: ['ibadan-postcard', 'aso-oke-cap', 'abula'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'dugbe-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'dugbe-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'dugbe-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'dugbe-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — I’m Dayo. My grandfather was from here and I’ve never been. Would you show me round? Cocoa House, Dugbe Market, then Mapo Hall.',
            options: [
              { label: 'Guide Dayo', action: { kind: 'acceptJob', jobId: 'dugbe-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,800 — and ₦1,200 more if we’re done before my aunty calls me for lunch. Walk, so I can keep up.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'dugbe-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows their way — Cocoa House, the market, Mapo Hall. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m taking pictures for my grandfather’s album.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Mapo Hall… he told me about these columns. Thank you. Really.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'dugbe-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again. Next time I’m climbing Bower’s Tower — come with me.',
            options: [{ label: 'Anytime', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'baba-tunde',
      name: 'Baba Tunde',
      role: 'Taxi driver',
      personality: 'Slow talker, fast driver, knows every pothole between Dugbe and Ojoo.',
      position: [-5.0, 32.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#d8452b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'kufi', headColor: '#2a2a2a', height: 1.74 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Moniya is far o — past Ojoo, past UI. Forty minutes if God is with us.',
          'Ibadan is not a city, it is many cities that agreed to share a name.',
          'The train is good. Before, Lagos was three hours of go-slow on the expressway.',
        ],
        likes: ['abula', 'gala', 'zobo'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Moniya station? Enter — forty minutes, past Ojoo.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'iw-1', look: { gender: 'male', skin: '#3f2516', top: '#4a5a72', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-5.4, 36], [-5.4, -36]], speed: 1.15 },
    { id: 'iw-2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#7a3b72' }, path: [[3.4, 30], [3.4, -22], [3.4, 30]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'fuji-night',
      name: 'Fuji Night at Dugbe',
      kind: 'concert',
      venue: 'In front of Mapo Hall',
      description: 'A fuji band under the lights — talking drums, sakara and a singer who knows everybody’s name. Ibadan dances till late.',
      hours: [19, 23],
      everyDays: 2,
      price: 3500,
      joy: 28,
      energy: 10,
    },
  ],
  spots: [
    { id: 'fuji-night-gate', kind: 'event', position: [5.6, 33.4], label: 'Fuji Night at Dugbe', verb: 'Go to', eventId: 'fuji-night' },
    { id: 'dugbe-bench', kind: 'bench', position: [-5.6, 16.4], label: 'Bench by the buka', verb: 'Rest on' },
    { id: 'dugbe-room-door', kind: 'home', position: [6.2, 9.6], label: 'Dugbe Rooms', verb: 'Check', homeId: 'dugbe-room' },
  ],
  homes: [
    { id: 'dugbe-room', name: 'Dugbe room', description: 'A room up two flights of stairs, with a view over the brown roofs to Oke-Are. Pay once for your stay — or buy it.', moveInCost: 7000, buyPrice: 75000 },
  ],

  businesses: [
    {
      id: 'sikiru-buka',
      name: 'Iya Sikiru Amala',
      kind: 'food',
      ownerNpcId: 'iya-sikiru',
      greeting: 'Soft amala, hot soup.',
      stock: [
        { itemId: 'amala-ewedu', price: 1800 },
        { itemId: 'abula', price: 2200 },
        { itemId: 'ofada-ayamase', price: 2500 },
        { itemId: 'ekuru', price: 1000 },
      ],
    },
    {
      id: 'lateef-asooke',
      name: 'Alhaji Lateef Aso-oke',
      kind: 'market',
      ownerNpcId: 'alhaji-lateef',
      greeting: 'Woven in Iseyin.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'aso-oke-strip', price: 7500 },
        { itemId: 'aso-oke-cap', price: 4000 },
        { itemId: 'gangan-drum', price: 6000 },
        { itemId: 'ibadan-postcard', price: 600 },
      ],
    },
  ],

  items: [
    { id: 'amala-ewedu', name: 'Amala & ewedu', category: 'food', basePrice: 1800, consumable: true, nutrition: 45, icon: 'plate', description: 'Dark, soft yam-flour amala with slippery ewedu and stew.' },
    { id: 'abula', name: 'Abula', category: 'food', basePrice: 2200, consumable: true, nutrition: 50, icon: 'plate', description: 'Amala with gbegiri (bean soup) and ewedu together — Ibadan on a plate.' },
    { id: 'ofada-ayamase', name: 'Ofada rice & ayamase', category: 'food', basePrice: 2500, consumable: true, nutrition: 48, icon: 'plate', description: 'Local brown rice with green-pepper stew, wrapped in leaves.' },
    { id: 'ekuru', name: 'Ekuru', category: 'food', basePrice: 1000, consumable: true, nutrition: 25, icon: 'snack', description: 'Steamed white bean cake with pepper sauce.' },
    { id: 'aso-oke-strip', name: 'Aso-oke cloth', category: 'souvenir', basePrice: 7500, icon: 'bag', description: 'Hand-woven strips from Iseyin, sewn into a wrapper.' },
    { id: 'aso-oke-cap', name: 'Aso-oke cap (fila)', category: 'souvenir', basePrice: 4000, icon: 'key', description: 'A folded fila, worn tilted for a party.' },
    { id: 'gangan-drum', name: 'Gangan talking drum', category: 'souvenir', basePrice: 6000, icon: 'key', description: 'Squeeze the strings and it talks — a small one, for your shelf.' },
    { id: 'ibadan-postcard', name: 'Ibadan postcard', category: 'souvenir', basePrice: 600, icon: 'key', description: 'Brown roofs and Cocoa House, on card.' },
  ],

  jobs: [
    {
      id: 'dugbe-run',
      title: 'Dugbe Run',
      summary: "Carry Mama Risi's basket of pepper across the road to Iya Sikiru's amala buka before her soups boil dry.",
      giverNpcId: 'mama-risi',
      dropoffNpcId: 'iya-sikiru',
      cargo: 'Basket of pepper',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 750 },
      cooldownMs: 25_000,
    },
    {
      id: 'dugbe-walk',
      kind: 'tour',
      tour: { stops: ['ibd-cocoa', 'ibd-dugbe', 'ibd-mapo'] },
      requires: { discovered: ['ibd-cocoa', 'ibd-dugbe', 'ibd-mapo'] },
      title: 'Grandfather’s City',
      summary: 'Guide Dayo to Cocoa House, Dugbe Market and Mapo Hall, in that order. He takes pictures as he goes — don’t lose him.',
      giverNpcId: 'dayo',
      dropoffNpcId: 'dayo',
      cargo: 'Guiding Dayo',
      timeLimitMs: 220_000,
      reward: 3800,
      bonus: { underMs: 160_000, amount: 1200 },
      cooldownMs: 120_000,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#d8452b' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
