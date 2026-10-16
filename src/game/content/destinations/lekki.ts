import type { DestinationPack } from '../types';

/**
 * Lekki — a stretch of Atlantic beachfront (fictional businesses).
 * Beach bars on the west, open sand in the middle, the sea to the east.
 * The lifeguard runs a timed clean-up; vendors sell coconut, corn and crafts.
 */

const W = -11;
const D = 7;

export const lekki: DestinationPack = {
  id: 'lekki-beach',
  name: 'Lagos',
  area: 'Lekki',
  tagline: 'Lekki beachfront — Atlantic breeze, coconut water and sunset on the sand.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-4, 36], facing: Math.PI },
  arrival: { position: [-3.6, 35.5], facing: Math.PI },
  // the ferry from Badagry ties up at the boat landing at the north end of the beach
  dock: { position: [10.4, 34], facing: -Math.PI / 2 },
  walkable: [[-7.2, -42, 9.4, 42], [9.0, 32.9, 16.2, 35.1]],
  walls: [],
  palette: {
    sky: '#f6d29a',
    fog: '#f1dcb8',
    ground: '#e3c9a0',
    road: '#d8bd92',
    roadLine: '#f4ead8',
    sidewalk: '#d9c29b',
    gutter: '#b89a70',
    sun: '#ffe2b0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'sand' },
  ambience: { traffic: 0, crowd: 0.25, horns: 0, waves: 0.85 },
  sea: { fromX: 9.8 },
  landmarks: [
    { id: 'lekki-tower', name: 'Lifeguard tower', blurb: 'Tolu keeps watch over the swimmers from here.', position: [8, 0], radius: 4 },
    { id: 'lekki-shore', name: 'Atlantic shoreline', blurb: 'Waves roll in all the way from Brazil.', position: [9, -22], radius: 3 },
    { id: 'lekki-landing', name: 'Boat landing', blurb: 'Ferries to Badagry leave from here, by way of CMS on the lagoon.', position: [10.5, 34], radius: 3 },
    { id: 'lekki-palms', name: 'Palm grove', blurb: 'The shadiest spot on the beach.', position: [-3, -33], radius: 4 },
  ],
  welcome: { from: 'Tolu', text: 'Welcome to Lekki beach! The tide brought plenty plastic today — come see me at the lifeguard tower if you want to help.' },

  buildings: [
    { id: 'l-w1', position: [W, -30], size: [11, 6.4, D], facing: 'east', wall: '#f4f0e6', trim: '#1d7f86', roof: '#6b5a49', storeys: 2, balcony: true,
      awning: '#1d7f86', sign: { text: 'COCO VIBES', sub: 'BEACH BAR · GRILL', bg: '#1d7f86', fg: '#fff7e3' } },
    { id: 'l-w2', position: [W, -14], size: [11, 3.4, D], facing: 'east', wall: '#e8c26a', trim: '#4a3a2c', roof: '#7c6a58', storeys: 1,
      awning: '#e4572e', sign: { text: 'ADA BEACH CRAFTS', sub: 'SHELLS · HATS · TOWELS', bg: '#e4572e', fg: '#fff6e0' } },
    { id: 'l-w3', position: [W, 2], size: [11, 6.4, D], facing: 'east', wall: '#ff9f80', trim: '#f4f0e6', roof: '#6c5c4d', storeys: 2, balcony: true },
    { id: 'l-w4', position: [W, 18], size: [11, 3.4, D], facing: 'east', wall: '#f4f0e6', trim: '#2c5f9e', roof: '#62564a', storeys: 1,
      awning: '#2c5f9e', sign: { text: 'SUNSET SHACK', sub: 'SMOOTHIES · SUYA', bg: '#2c5f9e', fg: '#fff2e2' } },
    { id: 'l-w5', position: [W, 33], size: [11, 6.4, D], facing: 'east', wall: '#a7d3c8', trim: '#f4f0e6', roof: '#61554a', storeys: 2, balcony: true },
  ],

  props: [
    { id: 'tower', kind: 'lifeguard', position: [8, 0], collide: true },
    { id: 'hut-1', kind: 'beachhut', position: [-5.2, 10], rotation: Math.PI / 2, collide: true },
    { id: 'hut-2', kind: 'beachhut', position: [5, -28], rotation: -Math.PI / 2, collide: true },
    { id: 'palm-1', kind: 'palm', position: [-6.4, 26], collide: true },
    { id: 'palm-2', kind: 'palm', position: [-6.2, -6], collide: true },
    { id: 'palm-3', kind: 'palm', position: [-2, -34], collide: true },
    { id: 'palm-4', kind: 'palm', position: [-5, -38], collide: true },
    { id: 'palm-5', kind: 'palm', position: [1.6, -30], collide: true },
    { id: 'palm-6', kind: 'palm', position: [2.5, 22], collide: true },
    { id: 'palm-7', kind: 'palm', position: [-6.5, 40], collide: true },
    { id: 'palm-8', kind: 'palm', position: [6.6, 30], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [3.6, 12], color: '#e4572e' },
    { id: 'um-2', kind: 'umbrella', position: [4.4, -8], color: '#1d7f86' },
    { id: 'um-3', kind: 'umbrella', position: [3, -18], color: '#f2b705' },
    { id: 'lo-1', kind: 'lounger', position: [5.4, 13], rotation: 0.3, collide: true },
    { id: 'lo-2', kind: 'lounger', position: [6.2, -7], rotation: -0.2, collide: true },
    { id: 'lo-3', kind: 'lounger', position: [4.8, -17], rotation: 0.1, collide: true },
    { id: 'grill-1', kind: 'grill', position: [-5.9, 16], rotation: Math.PI / 2, collide: true },
    { id: 'bus', kind: 'busstop', position: [-6.4, 37.6], rotation: Math.PI / 2, collide: true },
    { id: 'keke-1', kind: 'keke', position: [1.8, 37.5], rotation: -0.3, collide: true },
    // boat landing
    { id: 'jetty', kind: 'jetty', position: [9.2, 34], rotation: Math.PI / 2 },
    { id: 'ferry', kind: 'canoe', position: [14.6, 36.3], rotation: Math.PI / 2, color: '#e9e6df' },
  ],

  npcs: [
    {
      id: 'tolu',
      name: 'Tolu',
      role: 'Lifeguard',
      personality: 'Sporty, direct, loves her beach.',
      position: [6.6, 2.4],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#e4572e', bottom: '#1f3a5f', outfit: 'top-trousers', hair: 'puff', accessory: 'none', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [7, 19],
      social: { lines: ["The tide changes fast here. Always swim near the flags.", "Best time on this beach? Six in the morning, before anyone.", "I've pulled eleven people out of the water this year."], likes: ["coconut", "water", "beach-towel"] },
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'beach-cleanup' }, node: 'report' },
          { when: { kind: 'jobActive', jobId: 'beach-cleanup' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'beach-cleanup' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'The tide washed up plastic bottles all over the sand. Pick up six and bring them back before they wash out again. I pay from the beach fund!',
            options: [
              { label: "I'll clean up", action: { kind: 'acceptJob', jobId: 'beach-cleanup' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,250 for six bottles. Back within 55 seconds and I add ₦900 — the faster the better before the next wave.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'beach-cleanup' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Look for the bottles shining on the sand — walk over them to pick them up. Six, then come back to me!',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          report: {
            text: 'Six bottles! The beach looks better already. Hand them over.',
            options: [
              { label: 'Hand over the bag', action: { kind: 'deliverJob', jobId: 'beach-cleanup' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          rest: {
            text: 'Thank you! The next tide comes in soon — check back and we go again.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'musa',
      name: 'Mallam Musa',
      role: 'Coconut seller',
      personality: 'Gentle, generous, slices a coconut in three strokes.',
      position: [-3.6, 10],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#f4f0e6', bottom: '#4b4033', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#1f6f4a', height: 1.76 },
      promptVerb: 'Buy from',
      hours: [8, 22],
      social: { lines: ["Coconut water is better than any soft drink. Trust me.", "I came from Kano with nothing. Now I have two stalls.", "Corn roasted on coals — the smoke is the secret."], likes: ["plantain-chips", "chin-chin", "sobolo"] },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Sannu! Fresh coconut, cold from the cooler. Roasted corn too — the sea breeze makes you hungry.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'musa' } },
              { label: 'Just enjoying the breeze', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ada',
      name: 'Ada',
      role: 'Craft seller',
      personality: 'Artsy and talkative. Will bargain, with a smile.',
      position: [-5.2, -14],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d7f86', outfit: 'top-skirt', hair: 'long', accessory: 'earrings', height: 1.65 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: { lines: ["Every shell on my necklaces I picked myself.", "Tourists from Abuja buy the most. They love the sea.", "I'm learning to make earrings next. Watch this space."], likes: ["ankara-tote", "adire-scarf", "beaded-bracelet"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Hand-made shell necklaces, straw hats, beach towels! Everything is negotiable — make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'ada' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'emeka',
      name: 'Emeka',
      role: 'Danfo conductor',
      personality: 'Loud, fast, never lets a seat go empty.',
      position: [-4.8, 35.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#1f6f4a', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'hightop', facialHair: 'moustache', height: 1.78 },
      promptVerb: 'Talk to',
      social: { lines: ["Lekki to CMS? Pray for the bridge.", "I've driven this route so long the bus knows the way.", "Beach on Sunday, church first. That's the plan."], likes: ["beach-suya", "coconut", "zobo"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Lekki–Ajah–CMS! Yaba! Ikeja! One chance remain! You dey come?',
            options: [
              { label: 'Take a danfo', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'lw-3', look: { gender: 'female', skin: '#f1d3b3', top: '#f4f0e6', bottom: '#5b8fc4', outfit: 'top-trousers', hair: 'long', hairColor: '#120c08', accessory: 'glasses', height: 1.62 }, path: [[7.2, -24], [7.2, 14], [7.2, -24]], speed: 0.95, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'lw-4', look: { gender: 'male', skin: '#3f2516', top: '#f2b705', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'hightop' }, path: [[3.2, 30], [3.2, -10], [3.2, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 9, face: Math.PI / 2 }] },
    { id: 'lw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#1d7f86', bottom: '#f4f0e6', outfit: 'tee-shorts', hair: 'locs' }, path: [[6.5, 36], [6.5, -36]], speed: 1.1 },
    { id: 'lw-2', look: { gender: 'female', skin: '#5a3420', top: '#ff9f80', bottom: '#f4f0e6', outfit: 'dress', hair: 'braids', accessory: 'glasses' }, path: [[0.5, -30], [0.5, 30]], speed: 0.9 },
  ],

  events: [
    {
      id: 'beach-highlife',
      name: 'Highlife on the Beach',
      kind: 'concert',
      venue: 'Lekki beach stage',
      description: 'A live band on the sand every evening: horns, talking drum, guitars, and the sea for a backdrop.',
      hours: [19, 22],
      price: 5000,
      joy: 30,
      energy: 8,
      stage: { position: [-4.5, -24], size: [4, 3.4], facing: Math.PI / 2, color: '#2b2b33', accent: '#f2b705' },
      performers: [
        { gender: 'male', skin: '#5a3420', top: '#f2b705', bottom: '#1d1d1f' },
        { gender: 'female', skin: '#7a4a2c', top: '#c94f4f', bottom: '#2c5f9e' },
        { gender: 'male', skin: '#3e2416', top: '#1f6f4a', bottom: '#e8dcc6' },
      ],
    },
  ],
  spots: [
    { id: 'lekki-ferry', kind: 'jetty', position: [12.2, 34], label: 'ferry', verb: 'Take the' },
    { id: 'beach-highlife-gate', kind: 'event', position: [-1.0, -24], label: 'Highlife on the Beach', verb: 'Go to', eventId: 'beach-highlife' },
  ],

  businesses: [
    {
      id: 'musa',
      name: 'Musa Coconut & Corn',
      kind: 'food',
      ownerNpcId: 'musa',
      greeting: 'Cold, sweet and fresh.',
      stock: [
        { itemId: 'coconut', price: 800 },
        { itemId: 'roasted-corn', price: 500 },
        { itemId: 'beach-suya', price: 1500 },
      ],
    },
    {
      id: 'ada',
      name: 'Ada Beach Crafts',
      kind: 'market',
      ownerNpcId: 'ada',
      greeting: 'Everything is hand-made!',
      haggle: { floor: 0.72, patience: 3 },
      stock: [
        { itemId: 'shell-necklace', price: 2500 },
        { itemId: 'straw-hat', price: 3000 },
        { itemId: 'beach-towel', price: 4500 },
      ],
    },
  ],

  items: [
    { id: 'coconut', name: 'Fresh coconut', category: 'drink', basePrice: 800, consumable: true, nutrition: 12, icon: 'cup', description: 'Sliced open on the spot, with a straw.' },
    { id: 'roasted-corn', name: 'Roasted corn', category: 'food', basePrice: 500, consumable: true, nutrition: 25, icon: 'snack', description: 'Charred over coals, best with ube (pear).' },
    { id: 'beach-suya', name: 'Suya wrap', category: 'food', basePrice: 1500, consumable: true, nutrition: 40, icon: 'plate', description: 'Spicy grilled beef with onions and yaji.' },
    { id: 'shell-necklace', name: 'Shell necklace', category: 'souvenir', basePrice: 2500, icon: 'key', description: 'Cowrie and sea shells strung by hand.' },
    { id: 'straw-hat', name: 'Straw beach hat', category: 'clothing', basePrice: 3000, icon: 'bag', description: 'Wide brim for the Lekki sun.' },
    { id: 'beach-towel', name: 'Beach towel', category: 'goods', basePrice: 4500, icon: 'bag', description: 'Bright stripes, very fluffy.' },
  ],

  jobs: [
    {
      id: 'beach-cleanup',
      kind: 'collect',
      title: 'Beach Clean-up',
      summary: 'Pick up six plastic bottles from the sand and bring them back to Tolu.',
      giverNpcId: 'tolu',
      dropoffNpcId: 'tolu',
      cargo: 'Litter bag',
      collect: {
        item: 'plastic bottle',
        count: 6,
        spots: [[4, 26], [-2, 18], [7.5, 15], [1, 4], [-4.5, -2], [6, -12], [-1.5, -20], [8, -26], [3, -36]],
      },
      timeLimitMs: 90_000,
      reward: 2250,
      bonus: { underMs: 55_000, amount: 900 },
      cooldownMs: 30_000,
    },
  ],

  startingMoney: 0,
};
