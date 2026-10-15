import type { DestinationPack } from '../types';

/**
 * Osu, Accra — a busy strip in the spirit of Oxford Street (fictional businesses).
 * Chop bars, craft shops, forex bureaus, taxis and tro-tros. Auntie Akosua runs the
 * waakye stall and always needs hands; Efua sells crafts and needs a fast courier.
 * Prices are in the one wallet (naira); shops show the cedi equivalent as a guide.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const accra: DestinationPack = {
  id: 'accra-osu',
  name: 'Accra',
  area: 'Osu',
  tagline: 'Oxford Street — waakye, kente, highlife and the best people-watching in Accra.',
  country: 'Ghana',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  localCurrency: { code: 'GHS', symbol: 'GH₵', perUnit: 100 },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e6d2a4',
    fog: '#dccaa2',
    ground: '#a5714e',
    road: '#373534',
    roadLine: '#f4e7b8',
    sidewalk: '#c1b49f',
    gutter: '#4f4a45',
    sun: '#ffdcae',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.6, crowd: 0.65, horns: 4 },
  landmarks: [
    { id: 'osu-oxford-street', name: 'Oxford Street', blurb: 'Accra’s busiest strip — food, fashion, forex and music spilling onto the pavement.', position: [0, 2], radius: 5 },
    { id: 'osu-danquah', name: 'Danquah Circle', blurb: 'The roundabout at the top of the street — everyone in Osu meets here.', position: [0, 38], radius: 4 },
    { id: 'osu-crafts', name: 'Kente row', blurb: 'Hand-woven kente and Adinkra prints — every pattern has a meaning.', position: [-5, -13], radius: 3 },
  ],
  welcome: { from: 'Auntie Akosua', text: 'Akwaaba! Welcome to Osu. My waakye is the best on Oxford Street — and if you need work, my stall always needs hands. Come and see me.' },

  buildings: [
    { id: 'a-e1', position: [E, -35], size: [10, 9.4, D], facing: 'west', wall: '#e9d8b4', trim: '#1f4f8a', roof: '#5f5246', storeys: 3, balcony: true,
      awning: '#1f4f8a', sign: { text: 'GYE NYAME TAILORING', sub: 'SUITS · KABA & SLIT · ALTERATIONS', bg: '#1f4f8a', fg: '#f4e7b8' } },
    { id: 'a-e2', position: [E, -24.4], size: [10.4, 6.4, D], facing: 'west', wall: '#d47a4a', trim: '#f4f0e6', roof: '#62564a', storeys: 2 },
    { id: 'a-e3', position: [E, -13.4], size: [10.6, 9.4, D], facing: 'west', wall: '#f2efe6', trim: '#2f7a52', roof: '#61554a', storeys: 3,
      awning: '#2f7a52', sign: { text: 'OSU FOREX BUREAU', sub: 'BUY · SELL · CEDIS · NAIRA · DOLLARS', bg: '#2f7a52', fg: '#ffffff' } },
    { id: 'a-e4', position: [E, -1.8], size: [10.6, 6.4, D], facing: 'west', wall: '#f2c14e', trim: '#8d1f2b', roof: '#6e5f50', storeys: 2,
      awning: '#8d1f2b', businessId: 'akosua', sign: { text: "AUNTIE AKOS' CHOP BAR", sub: 'WAAKYE · KELEWELE · RED-RED', bg: '#8d1f2b', fg: '#f2c14e' } },
    { id: 'a-e5', position: [E, 9.6], size: [10.4, 12.5, D], facing: 'west', wall: '#c9d4c0', trim: '#4a5a72', roof: '#5f5246', storeys: 4, balcony: true },
    { id: 'a-e6', position: [E, 20.8], size: [10.4, 6.4, D], facing: 'west', wall: '#3f7f8f', trim: '#f2e5cf', roof: '#62564a', storeys: 2,
      awning: '#e8b21c', sign: { text: 'ADOM PHONES', sub: 'AIRTIME · MOBILE MONEY · REPAIRS', bg: '#e8b21c', fg: '#15130f' } },
    { id: 'a-e7', position: [E, 31.6], size: [10.4, 9.4, D], facing: 'west', wall: '#efe4cf', trim: '#7a5c3b', roof: '#6c5c4d', storeys: 3, balcony: true,
      sign: { text: 'OSU GUESTHOUSE', sub: 'CLEAN ROOMS · DAILY · WEEKLY', bg: '#ffffff', fg: '#7a5c3b' } },

    { id: 'a-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#2b3a4a', trim: '#e8b21c', roof: '#685a4c', storeys: 2,
      awning: '#e8b21c', sign: { text: 'SUNSET SPOT', sub: 'GRILLS · DRINKS · HIGHLIFE', bg: '#15130f', fg: '#e8b21c' } },
    { id: 'a-w2', position: [W, -24.4], size: [10.4, 12.5, D], facing: 'east', wall: '#e2d6c0', trim: '#8d3b2a', roof: '#5f5246', storeys: 4, balcony: true },
    { id: 'a-w3', position: [W, -13.2], size: [10.4, 6.4, D], facing: 'east', wall: '#e8b21c', trim: '#1f6f4a', roof: '#625649', storeys: 2,
      awning: '#1f6f4a', businessId: 'efua', sign: { text: 'SANKOFA CRAFTS', sub: 'KENTE · BEADS · ADINKRA PRINTS', bg: '#1f6f4a', fg: '#e8b21c' } },
    { id: 'a-w4', position: [W, -2.2], size: [10.4, 9.4, D], facing: 'east', wall: '#d9c3a3', trim: '#2c5f9e', roof: '#6a5a4b', storeys: 3, balcony: true },
    { id: 'a-w5', position: [W, 8.8], size: [10.4, 6.4, D], facing: 'east', wall: '#e9a0a8', trim: '#fff2e2', roof: '#655749', storeys: 2,
      awning: '#7a3b72', sign: { text: 'BLESSED HANDS SALON', sub: 'BRAIDS · NAILS · WIGS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'a-w6', position: [W, 19.8], size: [10.4, 9.4, D], facing: 'east', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#5f5246', storeys: 3, balcony: true },
    { id: 'a-w7', position: [W, 31], size: [10.4, 6.4, D], facing: 'east', wall: '#a8b6a2', trim: '#f4f0e6', roof: '#61554a', storeys: 2,
      sign: { text: 'TAXI RANK', sub: 'AIRPORT · CIRCLE · LABONE', bg: '#d9a31c', fg: '#15130f' } },
  ],

  props: [
    { id: 'trotro', kind: 'danfo', position: [-2.1, 24], rotation: 0, color: '#e8e6e0', collide: true },
    { id: 'taxi-rank', kind: 'car', position: [-2.1, 31.5], color: '#d9a31c', collide: true },
    { id: 'grill-1', kind: 'grill', position: [6.3, 2.8], collide: true },
    { id: 'kiosk-1', kind: 'kiosk', position: [6.2, 18], rotation: -Math.PI / 2, color: '#e8b21c', collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.6, -6], color: '#8d1f2b' },
    { id: 'um-2', kind: 'umbrella', position: [5.6, -18.5], color: '#2f7a52' },
    { id: 'bench-1', kind: 'bench', position: [-6.2, 14.4], collide: true },
    { id: 'palm-1', kind: 'palm', position: [6.2, 36], collide: true },
    { id: 'palm-2', kind: 'palm', position: [-6.1, -20], collide: true },
    { id: 'tree-1', kind: 'tree', position: [6.2, -28], collide: true },
    { id: 'drum-1', kind: 'drum', position: [-6.3, -28], collide: true },
    { id: 'pole-1', kind: 'pole', position: [-6.5, 34] },
    { id: 'pole-2', kind: 'pole', position: [-6.5, 10] },
    { id: 'pole-3', kind: 'pole', position: [-6.5, -14] },
    { id: 'pole-4', kind: 'pole', position: [-6.5, -38] },
  ],

  npcs: [
    {
      id: 'akosua',
      name: 'Auntie Akosua',
      role: 'Chop bar owner',
      personality: 'Generous, teasing, feeds everyone who walks past.',
      position: [5.2, -1.8],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#8d1f2b', bottom: '#e8b21c', outfit: 'kaftan', hair: 'short', headwear: 'wrap', headColor: '#e8b21c', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [7, 21],
      social: { lines: ["My waakye leaves come from my sister's farm in Kumasi.", "Lagos people say their jollof is better. We'll see!", "Come by on Sunday — I make light soup for regulars."], likes: ["kente-keyring", "shea-butter", "adire-scarf"] },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Akwaaba, my dear! You look hungry. Waakye, kelewele, red-red — or come behind the counter and help me serve. The lunch rush is coming.',
            options: [
              { label: 'Help at the stall (shift)', action: { kind: 'startShift', shiftId: 'waakye-stall' } },
              { label: 'Show me the food', action: { kind: 'openShop', businessId: 'akosua' } },
              { label: 'Later, Auntie', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'efua',
      name: 'Efua',
      role: 'Craft seller',
      personality: 'Proud of her weavers; bargains hard but fairly.',
      position: [-5.2, -13.2],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#e8b21c', outfit: 'dress', hair: 'braids', accessory: 'earrings', height: 1.7 },
      promptVerb: 'Talk to',
      hours: [9, 19],
      social: { lines: ["Each kente pattern has a name and a meaning. This one means 'unity'.", "My weavers are in Bonwire — the kente village.", "Sankofa: go back and fetch what you left behind. I like that."], likes: ["ankara-6yd", "lace-fabric", "sobolo"] },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'kente-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'kente-run' }, node: 'offer' },
          { node: 'shop' },
        ],
        nodes: {
          offer: {
            text: 'Ei, perfect timing! Mr. Asante the tailor needs this kente for a wedding suit — today. His shop is at the south end, across the road. Can you run it?',
            options: [
              { label: "I'll take it", action: { kind: 'acceptJob', jobId: 'kente-run' } },
              { label: 'Show me your crafts', action: { kind: 'openShop', businessId: 'efua' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'The kente! Gye Nyame Tailoring — south end, the other side of the road. Hurry, the wedding is tomorrow.',
            options: [{ label: 'Going', action: { kind: 'close' } }],
          },
          shop: {
            text: 'Kente, beads, Adinkra prints — all handmade. Every symbol means something. We can talk about the price.',
            options: [
              { label: 'Show me', action: { kind: 'openShop', businessId: 'efua' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'asante',
      name: 'Mr. Asante',
      role: 'Tailor',
      personality: 'Precise, measuring tape always round his neck.',
      position: [5.2, -35],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2b2f3a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', accessory: 'glasses', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [9, 19],
      social: { lines: ["A good suit takes three fittings. Patience, my friend.", "I made the president's nephew's wedding suit. True story.", "Kaba and slit, kaftan, suit — I do it all."], likes: ["kente-stole", "adinkra-shirt", "aso-oke-cap"] },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'kente-run' }, node: 'delivery' },
          { node: 'hello' },
        ],
        nodes: {
          delivery: {
            text: 'The kente from Efua! Look at this weave. The groom will shine. Thank you.',
            options: [
              { label: 'Hand over the kente', action: { kind: 'deliverJob', jobId: 'kente-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          hello: {
            text: 'Gye Nyame Tailoring — suits, kaba and slit, anything. I am waiting on cloth from Efua for a wedding.',
            options: [{ label: 'Okay', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'kofi',
      name: 'Kofi',
      role: 'Taxi driver',
      personality: 'Plays highlife loud, drives gently.',
      position: [-4.8, 34.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#d9a31c', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#15130f', height: 1.76 },
      promptVerb: 'Talk to',
      social: { lines: ["Highlife in the taxi, always. It calms the traffic.", "Osu at night is another city. The lights, the music!", "If you need a driver tomorrow, call Kofi."], likes: ["kelewele", "sobolo", "sausage-roll"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Taxi! Airport? I will get you there in time — Accra traffic is my friend.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'ow-1', look: { gender: 'female', skin: '#4a2c1c', top: '#e8b21c', bottom: '#1f6f4a', outfit: 'dress', hair: 'puff' }, path: [[5.4, 26], [5.4, -6], [5.4, 26]], speed: 1.2, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
    { id: 'ow-2', look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2c5f9e', outfit: 'shirt', hair: 'low' }, path: [[-5.4, 30], [-5.4, -30], [-5.4, 30]], speed: 1.4, stops: [{ at: 1, activity: 'chat', seconds: 8, face: Math.PI / 2 }] },
    { id: 'ow-3', look: { gender: 'female', skin: '#f2cfb0', top: '#7a3b72', bottom: '#c9b28a', outfit: 'top-trousers', hair: 'long', hairColor: '#c49a5a', height: 1.7 }, path: [[-5.4, -30], [-5.4, 8], [-5.4, -30]], speed: 1.1, stops: [{ at: 1, activity: 'photo', seconds: 7, face: Math.PI / 2 }] },
    { id: 'ow-4', look: { gender: 'male', skin: '#5a3420', top: '#8d1f2b', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'locs' }, path: [[5.4, -30], [5.4, 4], [5.4, -30]], speed: 1.3, stops: [{ at: 1, activity: 'eat', seconds: 8, face: -Math.PI / 2 }] },
    { id: 'ow-5', look: { gender: 'female', skin: '#a8714f', top: '#2f7a52', bottom: '#2a2a2a', outfit: 'top-skirt', hair: 'bun' }, path: [[5.4, 34], [5.4, -34]], speed: 1.5 },
  ],

  businesses: [
    {
      id: 'akosua',
      name: "Auntie Akos' Chop Bar",
      kind: 'food',
      ownerNpcId: 'akosua',
      greeting: 'Eat well, my dear.',
      stock: [
        { itemId: 'waakye', price: 1500 },
        { itemId: 'kelewele', price: 800 },
        { itemId: 'red-red', price: 1300 },
        { itemId: 'sobolo', price: 500 },
      ],
    },
    {
      id: 'efua',
      name: 'Sankofa Crafts',
      kind: 'market',
      ownerNpcId: 'efua',
      greeting: 'Handmade in Ghana.',
      haggle: { floor: 0.78, patience: 3 },
      stock: [
        { itemId: 'kente-stole', price: 6000 },
        { itemId: 'beaded-bracelet', price: 2000 },
        { itemId: 'adinkra-shirt', price: 5500 },
      ],
    },
  ],

  items: [
    { id: 'waakye', name: 'Waakye', category: 'food', basePrice: 1500, nutrition: 55, consumable: true, icon: 'plate', description: 'Rice and beans with shito, gari, egg and spaghetti — the full works.' },
    { id: 'kelewele', name: 'Kelewele', category: 'food', basePrice: 800, nutrition: 25, consumable: true, icon: 'snack', description: 'Spicy fried plantain with ginger and pepper.' },
    { id: 'red-red', name: 'Red-red', category: 'food', basePrice: 1300, nutrition: 45, consumable: true, icon: 'plate', description: 'Bean stew in palm oil with fried plantain.' },
    { id: 'sobolo', name: 'Sobolo', category: 'drink', basePrice: 500, nutrition: 10, consumable: true, icon: 'cup', description: 'Chilled hibiscus drink with ginger — cousin of zobo.' },
    { id: 'kente-stole', name: 'Kente stole', category: 'souvenir', basePrice: 6000, icon: 'bag', description: 'Hand-woven strip of gold, green and red.' },
    { id: 'beaded-bracelet', name: 'Beaded bracelet', category: 'souvenir', basePrice: 2000, icon: 'bag', description: 'Recycled-glass beads in sunset colours.' },
    { id: 'adinkra-shirt', name: 'Adinkra print shirt', category: 'clothing', basePrice: 5500, icon: 'bag', description: 'Stamped with Gye Nyame and Sankofa symbols.' },
  ],

  jobs: [
    {
      id: 'kente-run',
      title: 'Kente Run',
      summary: "Take Efua's kente across Oxford Street to Mr. Asante the tailor.",
      giverNpcId: 'efua',
      dropoffNpcId: 'asante',
      cargo: 'Kente cloth',
      timeLimitMs: 55_000,
      reward: 1600,
      bonus: { underMs: 24_000, amount: 500 },
      cooldownMs: 25_000,
    },
  ],

  shifts: [
    {
      id: 'waakye-stall',
      title: 'Waakye stall shift',
      npcId: 'akosua',
      skill: 'cooking',
      dishes: [
        { id: 'waakye', name: 'Waakye full works', icon: 'plate' },
        { id: 'kelewele', name: 'Kelewele', icon: 'snack' },
        { id: 'red-red', name: 'Red-red', icon: 'plate' },
        { id: 'sobolo', name: 'Cold sobolo', icon: 'cup' },
      ],
      orders: 8,
      seconds: 5,
      perLevel: 0.6,
      payPerOrder: 170,
      perfectTip: 350,
      energyCost: 18,
      minEnergy: 20,
      staffMeal: 40,
    },
  ],
  events: [
    {
      id: 'osu-night-jam',
      name: 'Oxford Street Night Jam',
      kind: 'festival',
      venue: 'Sunset Spot, Osu',
      description: 'Highlife and azonto till late at the Sunset Spot — grills going, the whole street dancing.',
      hours: [18, 23],
      price: 4000,
      joy: 28,
      energy: 10,
    },
  ],
  spots: [
    { id: 'osu-night-jam-gate', kind: 'event', position: [-6.0, -33.5], label: 'Oxford Street Night Jam', verb: 'Go to', eventId: 'osu-night-jam' },
    { id: 'osu-bench', kind: 'bench', position: [-5.4, 14.4], label: 'Bench', verb: 'Rest on' },
    { id: 'osu-guesthouse-door', kind: 'home', position: [6.5, 29], label: 'Osu Guesthouse', verb: 'Check', homeId: 'osu-guesthouse' },
  ],
  homes: [
    { id: 'osu-guesthouse', name: 'Osu Guesthouse room', description: 'A clean room with a ceiling fan and a balcony over Oxford Street. Yours for your stay — rest free whenever you like.', moveInCost: 3500, buyPrice: 38000 },
  ],
  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#d9a31c' }, { kind: 'danfo', color: '#e8e6e0' }, { kind: 'car', color: '#9aa3ad' }, { kind: 'car', color: '#d9a31c' }, { kind: 'car', color: '#2f7a52' }],
    speed: [4.5, 7.5],
  },
  startingMoney: 0,
};
