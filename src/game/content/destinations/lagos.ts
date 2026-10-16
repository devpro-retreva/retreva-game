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
  area: 'Yaba',
  tagline: 'Adeniyi Street — bukas, barbers and busy danfos on the mainland.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [2.4, 41], facing: Math.PI },
  arrival: { position: [-4.4, 16.5], facing: Math.PI },
  landmarks: [
    { id: 'yaba-buka', name: "Mama Titi's Buka", blurb: 'The smokiest jollof on Adeniyi Street.', position: [6.2, 36.6], radius: 4 },
    { id: 'yaba-danfo', name: 'Adeniyi danfo stop', blurb: 'Yellow buses to every corner of Lagos.', position: [-5, 14], radius: 3.5 },
    { id: 'yaba-okada', name: 'Okada park', blurb: 'Where riders wait out the afternoon heat.', position: [-11, -7], radius: 4 },
  ],
  welcome: { from: 'Kunle', text: 'Welcome back to Yaba! Danfo dey for Adeniyi stop anytime you wan move.' },
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
  ambience: { traffic: 0.7, crowd: 0.6, horns: 6 },

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
      awning: '#1f6f4a',
      sign: { text: 'ADENIYI EATERY', sub: 'SIT-DOWN · LUNCH · DINNER', bg: '#f3e2bd', fg: '#1f6f4a' },
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
      awning: '#2f6e5b', businessId: 'okon-home',
      sign: { text: 'OKON HOME', sub: 'FURNITURE · FANS · DECOR', bg: '#2f6e5b', fg: '#f4ead8' },
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
    { id: 'busstop', kind: 'busstop', position: [-6.3, 16.2], rotation: Math.PI / 2, collide: true },
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
      id: 'okon',
      name: 'Mr. Okon',
      role: 'Furniture seller',
      personality: 'Carpenter turned shopkeeper; tests every chair himself.',
      position: [5.2, 4.6],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#2f6e5b', bottom: '#4b4033', outfit: 'shirt', hair: 'low', facialHair: 'beard', accessory: 'glasses', height: 1.78 },
      promptVerb: 'Talk to',
      hours: [8, 20],
      social: { lines: ['A good chair outlives its owner, if you oil it.', 'People buy TVs first. Buy a bed first — sleep is everything.', 'My father made furniture in Calabar. I learned from his hands.'], likes: ['jollof-plate', 'zobo', 'adire-scarf'] },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Welcome to Okon Home! Beds, fans, chairs, lamps — make your room a place you want to come back to. A comfortable home means you wake up truly rested.',
            options: [
              { label: 'Show me the furniture', action: { kind: 'openShop', businessId: 'okon-home' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-titi',
      name: 'Mama Titi',
      role: 'Buka owner',
      personality: 'Warm, loud, always busy. Runs the best jollof on the street.',
      position: [5.2, 36.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#e2a400', bottom: '#2f7a52', outfit: 'top-skirt', hair: 'short', headwear: 'gele', headColor: '#d8452b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Talk to',
      hours: [7, 22],
      social: { lines: ["You know, I started this buka with one pot and a stool. Twenty years now!", "Tunde owes me for three plates. Don't tell him I said so.", "Eat before you go — you're too thin for Lagos hustle."], likes: ["chin-chin", "puff-puff", "ankara-6yd", "adire-scarf"] },
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
              { label: 'Help in the kitchen (shift)', action: { kind: 'startShift', shiftId: 'buka-kitchen' } },
              { label: 'Show me the menu', action: { kind: 'openShop', businessId: 'mama-titi' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦1,900 when it lands. Reach him in under 25 seconds and I add ₦650 — Tunde likes his food hot. His salon is at the north end, same side as me.',
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
            text: 'Thank you o! The next pot is still on the fire. Come back in a little while — or help me serve customers while you wait. I pay per plate.',
            options: [
              { label: 'Help in the kitchen (shift)', action: { kind: 'startShift', shiftId: 'buka-kitchen' } },
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
      hours: [9, 21],
      social: { lines: ["Saturday is the busiest — every man wants a fresh cut for the owambe.", "One day I'll open a second salon in Lekki. Watch.", "You want a lineup? Next time, I'll fit you in."], likes: ["jollof-plate", "zobo", "earbuds"] },
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
      hours: [7, 21],
      social: { lines: ["I can tell how the day will go by the first customer's change.", "My daughter is studying accounting at UNILAG — she checks my books now.", "Prices are going up, my dear. Buy your chin chin while it's cheap."], likes: ["adire-scarf", "lace-fabric", "shea-butter"] },
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
      social: { lines: ["Third Mainland at 6pm? I've seen sunrise in that traffic.", "A good conductor never forgets a face — or a fare.", "One day I'll own my own danfo. Three, even."], likes: ["zobo", "water", "puff-puff", "power-bank"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'CMS! Lekki! Ikeja! Where you dey go? Enter, enter — this danfo dey move now now.',
            options: [
              { label: 'Take a danfo', action: { kind: 'openTravel' } },
              { label: 'Where can I go?', action: { kind: 'goto', node: 'routes' } },
              { label: 'Later, Kunle', action: { kind: 'close' } },
            ],
          },
          routes: {
            text: 'Lagos Island for market — you fit price fabric there. Lekki for beach and coconut. Ikeja for phones and gadgets. Airport road go open soon, then Accra, Dubai…',
            options: [
              { label: 'Take a danfo', action: { kind: 'openTravel' } },
              { label: 'Thanks, Kunle', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'chidi',
      name: 'Chidi',
      role: 'Bicycle mechanic',
      personality: 'Ex-okada rider, laid-back, generous with advice. Sells and fixes bicycles at the lot.',
      position: [-9.6, -6.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#1f6f4a', bottom: '#4b4033', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#f4f0e6', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [8, 20],
      social: { lines: ["Okada is banned on this road, so I fix bicycles now. Honest money.", "A bicycle in Yaba? Fastest thing on the street when traffic stands still.", "Oil the chain, check the brakes, ring the bell. That's the whole religion."], likes: ["roasted-corn", "beach-suya", "water"] },
      idle: 'sway',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Okada? Not on this street, my friend — rules are rules. So now I sell and fix bicycles. Want to see one? And if you need quick money, Mama Titi at the kitchen always needs a fast runner.',
            options: [
              { label: 'Bicycles', action: { kind: 'dealer', dealerId: 'chidi-bikes' } },
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
      id: 'walker-commuter',
      look: { gender: 'male', skin: '#4a2c1c', top: '#dfe6ee', bottom: '#2b2f3a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', height: 1.8 },
      path: [[-5.4, -30], [-5.4, 18.4], [-5.4, 40]],
      speed: 1.45,
      stops: [{ at: 1, activity: 'wait', seconds: 11, face: Math.PI / 2 }],
    },
    {
      id: 'walker-shopper',
      look: { gender: 'female', skin: '#6b4026', top: '#2f7a52', bottom: '#e2a400', outfit: 'top-skirt', hair: 'short', headwear: 'gele', headColor: '#e2a400', accessory: 'earrings', height: 1.64 },
      path: [[5.4, 20], [5.4, -4.4], [5.4, 30], [4.4, 34.4], [5.4, 20]],
      speed: 1.15,
      stops: [{ at: 1, activity: 'shop', seconds: 8, face: Math.PI }, { at: 3, activity: 'eat', seconds: 10, face: 0 }],
    },
    {
      id: 'walker-visitor',
      look: { gender: 'male', skin: '#e3b48f', top: '#2c5f9e', bottom: '#c7b38a', outfit: 'tee-shorts', hair: 'short', hairColor: '#6b4a2a', headwear: 'cap', headColor: '#f4f0e6', height: 1.76 },
      path: [[-5.4, 36], [-5.4, 2], [-5.4, 36]],
      speed: 1.1,
      stops: [{ at: 1, activity: 'photo', seconds: 7, face: Math.PI / 2 }],
    },
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
      id: 'okon-home',
      name: 'Okon Home',
      kind: 'market',
      ownerNpcId: 'okon',
      greeting: 'Make your house a home.',
      haggle: { floor: 0.85, patience: 2 },
      stock: [
        { itemId: 'plastic-chair', price: 1500 },
        { itemId: 'potted-plant', price: 1500 },
        { itemId: 'rechargeable-lamp', price: 1800 },
        { itemId: 'wall-art', price: 2000 },
        { itemId: 'side-table', price: 2500 },
        { itemId: 'ankara-rug', price: 3000 },
        { itemId: 'standing-fan', price: 4500 },
        { itemId: 'armchair', price: 7000 },
        { itemId: 'wooden-bed', price: 9500 },
        { itemId: 'small-tv', price: 12000 },
      ],
    },
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
    { id: 'chapman', name: 'Chapman', category: 'drink', basePrice: 1200, nutrition: 10, consumable: true, icon: 'cup', description: 'Fizzy, fruity, cucumber slice on top — the Nigerian classic.' },
    { id: 'pounded-yam-egusi', name: 'Pounded yam & egusi', category: 'food', basePrice: 3500, nutrition: 70, consumable: true, icon: 'plate', description: 'Smooth pounded yam with melon-seed soup and assorted meat.' },
    { id: 'grilled-fish', name: 'Grilled croaker fish', category: 'food', basePrice: 4500, nutrition: 60, consumable: true, icon: 'plate', description: 'Whole fish, peppered and grilled, with plantain.' },
    { id: 'wooden-bed', name: 'Wooden bed frame', category: 'furniture', basePrice: 9500, icon: 'bag', description: 'A proper bed with a red throw. Comfort +3.' },
    { id: 'armchair', name: 'Armchair', category: 'furniture', basePrice: 7000, icon: 'bag', description: 'Rust-red, deep cushions. Comfort +2.' },
    { id: 'plastic-chair', name: 'Plastic chair', category: 'furniture', basePrice: 1500, icon: 'bag', description: 'The blue chair every Lagos home has. Comfort +1.' },
    { id: 'side-table', name: 'Side table', category: 'furniture', basePrice: 2500, icon: 'bag', description: 'For your phone and a cold drink. Comfort +1.' },
    { id: 'standing-fan', name: 'Standing fan', category: 'furniture', basePrice: 4500, icon: 'bag', description: 'Because Lagos heat is no joke. Comfort +2.' },
    { id: 'small-tv', name: 'Small TV', category: 'furniture', basePrice: 12000, icon: 'bag', description: 'Football and Nollywood on demand. Comfort +2.' },
    { id: 'rechargeable-lamp', name: 'Rechargeable lamp', category: 'furniture', basePrice: 1800, icon: 'bag', description: 'Light when NEPA takes light. Comfort +1.' },
    { id: 'potted-plant', name: 'Potted plant', category: 'furniture', basePrice: 1500, icon: 'bag', description: 'A snake plant that forgives everything. Comfort +1.' },
    { id: 'ankara-rug', name: 'Ankara rug', category: 'furniture', basePrice: 3000, icon: 'bag', description: 'Bright wax-print pattern underfoot. Comfort +1.' },
    { id: 'wall-art', name: 'Wall print', category: 'furniture', basePrice: 2000, icon: 'bag', description: 'A green-and-gold abstract by a Yaba artist. Comfort +1.' },
    { id: 'jollof-plate', name: 'Jollof rice & chicken', category: 'food', basePrice: 2500, consumable: true, nutrition: 55, icon: 'plate',
      description: "Smoky party jollof from Mama Titi's pot, with fried plantain." },
    { id: 'puff-puff', name: 'Puff-puff (5)', category: 'food', basePrice: 300, consumable: true, nutrition: 20, icon: 'snack',
      description: 'Soft, sweet fried dough balls, still warm.' },
    { id: 'zobo', name: 'Zobo', category: 'drink', basePrice: 500, consumable: true, nutrition: 10, icon: 'cup',
      description: 'Chilled hibiscus drink with ginger and pineapple.' },
    { id: 'water', name: 'Bottled water', category: 'drink', basePrice: 200, consumable: true, nutrition: 8, icon: 'bottle',
      description: 'Cold from the freezer. Essential in this heat.' },
    { id: 'chin-chin', name: 'Chin chin', category: 'food', basePrice: 700, consumable: true, nutrition: 15, icon: 'snack',
      description: 'Crunchy fried pastry bites in a sealed bag.' },
    { id: 'plantain-chips', name: 'Plantain chips', category: 'food', basePrice: 400, consumable: true, nutrition: 15, icon: 'snack',
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
      reward: 1900,
      bonus: { underMs: 25_000, amount: 650 },
      cooldownMs: 20_000,
    },
  ],

  shifts: [
    {
      id: 'buka-kitchen',
      title: 'Buka kitchen shift',
      npcId: 'mama-titi',
      skill: 'cooking',
      dishes: [
        { id: 'jollof', name: 'Jollof & chicken', icon: 'plate' },
        { id: 'amala', name: 'Amala & ewedu', icon: 'plate' },
        { id: 'moimoi', name: 'Moi moi', icon: 'snack' },
        { id: 'zobo', name: 'Cold zobo', icon: 'cup' },
      ],
      orders: 8,
      seconds: 5,
      perLevel: 0.6,
      payPerOrder: 190,
      perfectTip: 400,
      energyCost: 18,
      minEnergy: 20,
      staffMeal: 35,
    },
  ],
  spots: [
    { id: 'okada-bench', kind: 'bench', position: [-9.4, -4.3], label: 'Bench', verb: 'Rest on' },
    { id: 'yaba-room-door', kind: 'home', position: [-5.7, 23.4], label: 'Room to let', verb: 'Check', homeId: 'yaba-room' },
    { id: 'yaba-eatery-door', kind: 'door', position: [6.5, -26.5], label: 'Adeniyi Eatery', verb: 'Go into', interiorId: 'yaba-eatery' },
  ],
  dealers: [
    { id: 'chidi-bikes', name: "Chidi's Bicycles", npcId: 'chidi', stock: [{ vehicleId: 'bicycle', price: 8000 }], parkAt: { position: [-8.2, -8.4], yaw: Math.PI / 2 } },
  ],
  homes: [
    { id: 'yaba-room', name: 'Room on Adeniyi Street', description: 'A self-contained room upstairs: a mattress, a chest, a window over the street. Rest here for free whenever you like — and make it yours with furniture.', moveInCost: 6000, buyPrice: 45000 },
  ],
  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'danfo' }, { kind: 'car', color: '#b3261e' }, { kind: 'keke' }, { kind: 'car', color: '#e8e6e0' }, { kind: 'danfo' }, { kind: 'car', color: '#2c5f9e' }],
    speed: [4.5, 7.5],
  },
  startingMoney: 2000,
};
