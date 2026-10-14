import type { DestinationPack } from '../types';

/**
 * Lagos — Adeniyi Street (fictional), a compact mainland street.
 * All names, businesses and signage are original to Retreva.
 *
 * Layout: the road runs north–south along z (north is -z).
 * East-side buildings face west onto the street; west-side buildings face east.
 */

const EAST_X = 11.2;
const WEST_X = -11.2;
const BLD_DEPTH = 8;

export const lagos: DestinationPack = {
  id: 'lagos-adeniyi',
  name: 'Lagos',
  area: 'Adeniyi Street',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [2.4, 41], facing: Math.PI },
  walkable: [
    [-6.9, -44, 6.9, 44], // street + both sidewalks
    [-15.4, -12, -6, -2], // open lot on the west side
  ],
  walls: [
    [-15.6, -12.2, -15.6, -1.8],
  ],
  palette: {
    sky: '#f3c98b',
    fog: '#e9c597',
    ground: '#b5643c',
    road: '#3a3633',
    roadLine: '#e8d9b0',
    sidewalk: '#b9ab95',
    gutter: '#5d554c',
    sun: '#ffd9a0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 92 },

  buildings: [
    // ── East side (faces west) ─────────────────────────────────
    {
      id: 'e1', position: [EAST_X, -37], size: [10, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#3f7f8c', trim: '#f1e6cf', roof: '#7c6a58', storeys: 2, balcony: true,
      awning: '#d8452b',
      sign: { text: "GOD'S TIME", sub: 'BARBING SALON', bg: '#f4f0e6', fg: '#1b4d7a' },
    },
    {
      id: 'e2', position: [EAST_X, -26.5], size: [10, 9.4, BLD_DEPTH], facing: 'west',
      wall: '#e7d6b5', trim: '#9b5b3a', roof: '#6c5c4d', storeys: 3, balcony: true,
    },
    {
      id: 'e3', position: [EAST_X, -16.5], size: [9.4, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#c9583b', trim: '#f3e7d3', roof: '#6f6255', storeys: 2,
      awning: '#1f6f4a',
      sign: { text: 'BLESSING', sub: 'PHONES & ACCESSORIES', bg: '#1f6f4a', fg: '#fff7e3' },
    },
    {
      id: 'e4', position: [EAST_X, -6.2], size: [10.4, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#f0c75e', trim: '#4a3a2c', roof: '#6e5f50', storeys: 2, balcony: true,
      awning: '#2c5f9e', businessId: 'iya-bisi',
      sign: { text: 'IYA BISI', sub: 'PROVISIONS & SOUVENIRS', bg: '#2c5f9e', fg: '#fff3d6' },
    },
    {
      id: 'e5', position: [EAST_X, 4.6], size: [10.4, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#d9cbb3', trim: '#2f6e5b', roof: '#5f5246', storeys: 2, balcony: true,
    },
    {
      id: 'e6', position: [EAST_X, 15.2], size: [9.8, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#8a4f7d', trim: '#f2e5cf', roof: '#62564a', storeys: 2,
      awning: '#f2b705',
      sign: { text: 'FAITH TAILORING', sub: 'ANKARA · LACE · ASO-OKE', bg: '#f2b705', fg: '#2a1d14' },
    },
    {
      id: 'e7', position: [EAST_X, 25.8], size: [10.4, 9.4, BLD_DEPTH], facing: 'west',
      wall: '#efe4cf', trim: '#b4462e', roof: '#6c5c4d', storeys: 3, balcony: true,
    },
    {
      id: 'e8', position: [EAST_X, 36.6], size: [10, 6.4, BLD_DEPTH], facing: 'west',
      wall: '#2f7a52', trim: '#f5e9d2', roof: '#6b5a49', storeys: 2,
      awning: '#e2a400', businessId: 'mama-titi',
      sign: { text: "MAMA TITI'S", sub: 'KITCHEN · BUKA', bg: '#fff1d0', fg: '#b4321f' },
    },

    // ── West side (faces east) ─────────────────────────────────
    {
      id: 'w1', position: [WEST_X, -37.2], size: [9.6, 6.4, BLD_DEPTH], facing: 'east',
      wall: '#e9e1d2', trim: '#2e7d4f', roof: '#685a4c', storeys: 2,
      awning: '#2e7d4f',
      sign: { text: 'SUNRISE', sub: 'PHARMACY', bg: '#ffffff', fg: '#2e7d4f' },
    },
    {
      id: 'w2', position: [WEST_X, -26.8], size: [10.2, 9.4, BLD_DEPTH], facing: 'east',
      wall: '#c78e5a', trim: '#f4e8d4', roof: '#5f5246', storeys: 3, balcony: true,
    },
    {
      id: 'w3', position: [WEST_X, -17], size: [9.2, 6.4, BLD_DEPTH], facing: 'east',
      wall: '#5a6f8f', trim: '#f0e3cb', roof: '#625649', storeys: 2,
      awning: '#e2a400',
      sign: { text: 'OLUWASEUN', sub: 'ELECTRICALS', bg: '#141414', fg: '#f2b705' },
    },
    // gap: open lot z -12 … -2 (okada park + bench)
    {
      id: 'w5', position: [WEST_X, 4], size: [9.6, 6.4, BLD_DEPTH], facing: 'east',
      wall: '#5fa8b8', trim: '#fdf3df', roof: '#61554a', storeys: 2,
      awning: '#d8452b',
      sign: { text: "ADE'S", sub: 'COLD DRINKS · PURE WATER', bg: '#d8452b', fg: '#fff6e0' },
    },
    {
      id: 'w6', position: [WEST_X, 14.4], size: [10.6, 9.4, BLD_DEPTH], facing: 'east',
      wall: '#efd9a7', trim: '#8d3b2a', roof: '#6a5a4b', storeys: 3, balcony: true,
    },
    {
      id: 'w7', position: [WEST_X, 25.2], size: [10.2, 6.4, BLD_DEPTH], facing: 'east',
      wall: '#d97a8a', trim: '#fff2e2', roof: '#655749', storeys: 2,
      awning: '#6b3f8f',
      sign: { text: 'GRACE', sub: 'HAIR & BEAUTY', bg: '#6b3f8f', fg: '#fff2e2' },
    },
    {
      id: 'w8', position: [WEST_X, 36], size: [10.4, 6.4, BLD_DEPTH], facing: 'east',
      wall: '#dfd2bb', trim: '#3d5f8a', roof: '#5f5246', storeys: 2, balcony: true,
    },
  ],

  props: [
    { id: 'danfo', kind: 'danfo', position: [-2.1, 11.5], rotation: 0, collide: true },
    { id: 'okada-1', kind: 'okada', position: [-10.4, -9.4], rotation: 0.4, collide: true },
    { id: 'okada-2', kind: 'okada', position: [-11.8, -9.0], rotation: 0.2, collide: true },
    { id: 'kiosk-lot', kind: 'kiosk', position: [-13.6, -4.4], rotation: Math.PI / 2, color: '#1f6f4a', collide: true },
    { id: 'umbrella-lot', kind: 'umbrella', position: [-9.2, -4.2], color: '#d8452b' },
    { id: 'bench-lot', kind: 'bench', position: [-9.4, -5.4], rotation: Math.PI / 2, collide: true },
    { id: 'tree-lot', kind: 'tree', position: [-13.2, -10.4], collide: true },
    { id: 'gen-e4', kind: 'generator', position: [6.4, -1.6], collide: true },
    { id: 'gen-w5', kind: 'generator', position: [-6.3, 9.6], rotation: Math.PI, collide: true },
    { id: 'tank-w6', kind: 'tank', position: [-6.3, 19.6], collide: true },
    { id: 'grill-e8', kind: 'grill', position: [6.3, 33.4], collide: true },
    { id: 'crates-e4', kind: 'crates', position: [6.3, -10.4], collide: true },
    { id: 'drum-e3', kind: 'drum', position: [6.4, -20.4], color: '#2c5f9e', collide: true },
    { id: 'drum-w3', kind: 'drum', position: [-6.3, -13.2], color: '#c9583b', collide: true },
    { id: 'tree-1', kind: 'tree', position: [-6.1, 30.6], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.2, 21], collide: true },
    { id: 'tree-3', kind: 'tree', position: [-6.1, -31.6], collide: true },
    { id: 'umbrella-e6', kind: 'umbrella', position: [5.6, 11.2], color: '#f2b705' },
    { id: 'pole-1', kind: 'pole', position: [-6.5, 40] },
    { id: 'pole-2', kind: 'pole', position: [-6.5, 26] },
    { id: 'pole-3', kind: 'pole', position: [-6.5, 2] },
    { id: 'pole-4', kind: 'pole', position: [-6.5, -22] },
    { id: 'pole-5', kind: 'pole', position: [-6.5, -40] },
  ],

  npcs: [
    {
      id: 'mama-titi',
      name: 'Mama Titi',
      role: 'Buka owner',
      personality: 'Warm, loud, always busy. Runs the best jollof on the street.',
      position: [5.2, 36.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#e2a400', bottom: '#2f7a52', outfit: 'top-skirt', hair: 'short', headwear: 'gele', headColor: '#d8452b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Talk to',
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'jollof-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'jollof-run' }, node: 'offer' },
          { node: 'cooldown' },
        ],
        nodes: {
          offer: {
            text: "Ah, you came at the right time! Tunde at the barbing salon ordered jollof and he has been calling me since. Can you run it to him? It's hot — under a minute, abeg.",
            options: [
              { label: "I'll take it", action: { kind: 'acceptJob', jobId: 'jollof-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Show me the menu', action: { kind: 'openShop', businessId: 'mama-titi' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦1,500 when it lands. Reach him in under 25 seconds and I add ₦500 — Tunde likes his food hot. His salon is at the north end, same side as me.',
            options: [
              { label: "Deal — I'm going", action: { kind: 'acceptJob', jobId: 'jollof-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Why are you still standing here? The rice is getting cold! North end of the street — look for the barbing salon.',
            options: [{ label: "I'm going", action: { kind: 'close' } }],
          },
          cooldown: {
            text: 'Thank you o! The next pot is still on the fire. Come back in a little while — or buy something while you wait.',
            options: [
              { label: 'Show me the menu', action: { kind: 'openShop', businessId: 'mama-titi' } },
              { label: 'See you', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'tunde',
      name: 'Tunde',
      role: 'Barber',
      personality: 'Easygoing, impatient only when hungry.',
      position: [5.2, -37],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#f4f0e6', bottom: '#1b2a3a', outfit: 'shirt', hair: 'hightop', facialHair: 'goatee', height: 1.8 },
      promptVerb: 'Talk to',
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'jollof-run' }, node: 'delivery' },
          { when: { kind: 'jobCompletedBefore', jobId: 'jollof-run' }, node: 'regular' },
          { node: 'intro' },
        ],
        nodes: {
          delivery: {
            text: 'Finally! Is that my jollof? Bring it — I have been hungry since morning.',
            options: [
              { label: 'Hand over the food', action: { kind: 'deliverJob', jobId: 'jollof-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          intro: {
            text: "Welcome to God's Time. The chair is full today. Mama Titi is supposed to send my food — if you see her, tell her I'm starving.",
            options: [{ label: "I'll tell her", action: { kind: 'close' } }],
          },
          regular: {
            text: "My guy! Thanks for the delivery. Mama Titi's rice is the best on Adeniyi Street, I'm telling you.",
            options: [{ label: 'Enjoy', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'iya-bisi',
      name: 'Iya Bisi',
      role: 'Shopkeeper',
      personality: 'Patient, sharp with numbers, knows everyone.',
      position: [5.2, -6.2],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#2c5f9e', bottom: '#f0c75e', outfit: 'dress', hair: 'bun', headwear: 'wrap', headColor: '#f2b705', accessory: 'glasses', height: 1.6 },
      promptVerb: 'Shop with',
      idle: 'sway',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Welcome, my dear. Snacks, cold water, small souvenirs — everything is here. Prices are fair; bargaining comes when the market opens.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'iya-bisi' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'kunle',
      name: 'Kunle',
      role: 'Danfo conductor',
      personality: 'Fast talker, knows every route in Lagos.',
      position: [-5.2, 11.5],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#c9583b', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#f2b705', height: 1.74 },
      promptVerb: 'Talk to',
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Oshodi! Ojota! CMS! You dey go? Ah — not today, this motor is waiting for a new tyre. When it is ready, I can drop you at the airport road.',
            options: [
              { label: 'Where can I fly to?', action: { kind: 'goto', node: 'routes' } },
              { label: 'Later, Kunle', action: { kind: 'close' } },
            ],
          },
          routes: {
            text: 'From the airport? Accra, Abuja, even Dubai. Tickets are not cheap o — hustle small, save your money, then come and see me.',
            options: [{ label: "I'll save up", action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'chidi',
      name: 'Chidi',
      role: 'Okada rider',
      personality: 'Laid-back, generous with advice.',
      position: [-9.6, -6.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#1f6f4a', bottom: '#4b4033', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#f4f0e6', height: 1.76 },
      promptVerb: 'Talk to',
      idle: 'sway',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Okada? Not on this street, my friend — rules are rules. But if you want quick money, Mama Titi at the kitchen always needs a fast runner.',
            options: [
              { label: 'Where is her kitchen?', action: { kind: 'goto', node: 'where' } },
              { label: 'Thanks, Chidi', action: { kind: 'close' } },
            ],
          },
          where: {
            text: 'South end, east side — green building, yellow awning. You can smell the jollof from here.',
            options: [{ label: 'On my way', action: { kind: 'close' } }],
          },
        },
      },
    },
  ],

  walkers: [
    {
      id: 'walker-1',
      look: { gender: 'female', skin: '#5a3420', top: '#6b3f8f', bottom: '#e8d9b0', outfit: 'dress', hair: 'braids', headwear: 'none', headColor: '#6b3f8f', height: 1.64 },
      path: [[-5.4, 38], [-5.4, 16], [-5.4, -28], [-5.4, 16]],
      speed: 1.3,
    },
    {
      id: 'walker-2',
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2c5f9e', outfit: 'shirt', hair: 'locs', height: 1.78 },
      path: [[5.3, -30], [5.3, 0], [5.3, 28], [5.3, 0]],
      speed: 1.5,
    },
  ],

  businesses: [
    {
      id: 'mama-titi',
      name: "Mama Titi's Kitchen",
      kind: 'food',
      ownerNpcId: 'mama-titi',
      greeting: 'Everything is fresh today.',
      stock: [
        { itemId: 'jollof-plate', price: 2500 },
        { itemId: 'puff-puff', price: 300 },
        { itemId: 'zobo', price: 500 },
      ],
    },
    {
      id: 'iya-bisi',
      name: 'Iya Bisi Provisions',
      kind: 'provisions',
      ownerNpcId: 'iya-bisi',
      greeting: 'Take your time.',
      stock: [
        { itemId: 'water', price: 200 },
        { itemId: 'chin-chin', price: 700 },
        { itemId: 'plantain-chips', price: 400 },
        { itemId: 'ankara-tote', price: 3500 },
        { itemId: 'lagos-keyring', price: 1200 },
      ],
    },
  ],

  items: [
    { id: 'jollof-plate', name: 'Jollof rice & chicken', category: 'food', basePrice: 2500, consumable: true, icon: 'plate',
      description: "Smoky party jollof from Mama Titi's pot, with fried plantain." },
    { id: 'puff-puff', name: 'Puff-puff (5)', category: 'food', basePrice: 300, consumable: true, icon: 'snack',
      description: 'Soft, sweet fried dough balls, still warm.' },
    { id: 'zobo', name: 'Zobo', category: 'drink', basePrice: 500, consumable: true, icon: 'cup',
      description: 'Chilled hibiscus drink with ginger and pineapple.' },
    { id: 'water', name: 'Bottled water', category: 'drink', basePrice: 200, consumable: true, icon: 'bottle',
      description: 'Cold from the freezer. Essential in this heat.' },
    { id: 'chin-chin', name: 'Chin chin', category: 'food', basePrice: 700, consumable: true, icon: 'snack',
      description: 'Crunchy fried pastry bites in a sealed bag.' },
    { id: 'plantain-chips', name: 'Plantain chips', category: 'food', basePrice: 400, consumable: true, icon: 'snack',
      description: 'Thin, salted and very hard to stop eating.' },
    { id: 'ankara-tote', name: 'Ankara tote bag', category: 'bag', basePrice: 3500, icon: 'bag',
      description: 'Bold wax-print tote, sewn by Faith Tailoring next door.' },
    { id: 'lagos-keyring', name: 'Adeniyi St. keyring', category: 'souvenir', basePrice: 1200, icon: 'key',
      description: 'A small brass keyring shaped like a danfo bus.' },
  ],

  jobs: [
    {
      id: 'jollof-run',
      title: 'Jollof Run',
      summary: "Carry Mama Titi's jollof to Tunde at God's Time Barbing Salon before it gets cold.",
      giverNpcId: 'mama-titi',
      dropoffNpcId: 'tunde',
      cargo: 'Jollof pack',
      timeLimitMs: 60_000,
      reward: 1500,
      bonus: { underMs: 25_000, amount: 500 },
      cooldownMs: 20_000,
    },
  ],

  startingMoney: 2000,
};
