import type { DestinationPack } from '../types';

/**
 * Abuja — a Wuse street by Wuse Market (fictional businesses; Wuse Market and Aso Rock are real).
 * Office blocks and the market on a wide, tree-lined road; green-and-white taxis; suya smoke in the evening.
 * Hajiya Amina sells foodstuff at the market and needs pepper carried to Mallam Sani's suya grill;
 * Chidinma, a youth corper just posted to the capital, wants someone to show her round; Mama Nkechi's
 * stall sells leather and caps (bargain). At the north end the street opens on a view of Aso Rock.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const abuja: DestinationPack = {
  id: 'abuja-wuse',
  name: 'Abuja',
  area: 'Wuse',
  tagline: 'Wuse — the capital’s busiest market, green taxis, and suya smoke at dusk.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e8d9b0',
    fog: '#dccfa8',
    ground: '#9c8a64',
    road: '#353535',
    roadLine: '#e8d9b0',
    sidewalk: '#c4bdae',
    gutter: '#4f4a45',
    sun: '#ffe6b8',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.55, crowd: 0.6, horns: 3 },
  // the street's north end opens on the view of Aso Rock
  vista: 'north',
  landmarks: [
    { id: 'abv-market', name: 'Wuse Market', blurb: 'One of the capital’s biggest markets: foodstuff, fabric, phones — if Abuja needs it, it’s here.', position: [4.6, -12], radius: 5 },
    { id: 'abv-suya', name: 'Suya street', blurb: 'At dusk the grills come out and the whole street smells of yaji and smoke.', position: [4.6, 10], radius: 4 },
    { id: 'abv-asorock', name: 'Aso Rock view', blurb: 'The granite monolith that gives the Presidential Villa its name rises about 400 m over the city.', position: [0, -38], radius: 5 },
    { id: 'abv-taxis', name: 'Green taxi rank', blurb: 'Abuja’s green-and-white cabs — airport, Maitama, Garki, anywhere.', position: [-4.6, 32], radius: 3 },
  ],
  welcome: { from: 'Hajiya Amina', text: 'Barka da zuwa — welcome to Abuja! I sell foodstuff at Wuse Market. If you want work, come and see me; my pepper always needs carrying.' },

  buildings: [
    { id: 'a-e1', position: [E, -35], size: [10, 12.5, D], facing: 'west', wall: '#d8dde2', trim: '#2f7a52', roof: '#5f5246', storeys: 4, balcony: true },
    { id: 'a-e2', position: [E, -24.4], size: [10.4, 6.4, D], facing: 'west', wall: '#e8e2d4', trim: '#2c5f9e', roof: '#62564a', storeys: 2,
      awning: '#2c5f9e', sign: { text: 'GREENLINE PHARMACY', sub: 'DRUGS · TOILETRIES · BABY', bg: '#ffffff', fg: '#2c5f9e' } },
    { id: 'a-e3', position: [E, -12.8], size: [11.4, 6.4, D], facing: 'west', wall: '#e9d9b8', trim: '#8d3b2a', roof: '#6e5f50', storeys: 2,
      awning: '#2f7a52', sign: { text: 'WUSE MARKET', sub: 'FOODSTUFF · FABRIC · EVERYTHING', bg: '#2f7a52', fg: '#fff6e0' } },
    { id: 'a-e4', position: [E, -1.6], size: [10.6, 9.4, D], facing: 'west', wall: '#c9d3c4', trim: '#f4f0e6', roof: '#61554a', storeys: 3, balcony: true },
    { id: 'a-e5', position: [E, 9.6], size: [10.4, 3.4, D], facing: 'west', wall: '#f0c75e', trim: '#2a2a2a', roof: '#6e5f50', storeys: 1,
      awning: '#b3261e', businessId: 'sani-suya', sign: { text: 'MALLAM SANI SUYA', sub: 'SUYA · KILISHI · MASA', bg: '#b3261e', fg: '#fff6e0' } },
    { id: 'a-e6', position: [E, 20.8], size: [10.4, 9.4, D], facing: 'west', wall: '#efe9dc', trim: '#4a5a72', roof: '#5f5246', storeys: 3, balcony: true,
      sign: { text: 'WUSE 2 STUDIOS', sub: 'FURNISHED · SHORT STAYS', bg: '#ffffff', fg: '#4a5a72' } },
    { id: 'a-e7', position: [E, 31.6], size: [10.4, 6.4, D], facing: 'west', wall: '#d9cbb3', trim: '#1f6f4a', roof: '#6c5c4d', storeys: 2 },

    { id: 'a-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#7a3b72', roof: '#685a4c', storeys: 2,
      awning: '#7a3b72', sign: { text: 'CAPITAL BOOKS', sub: 'STATIONERY · PRINTING · EXAMS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'a-w2', position: [W, -23.4], size: [12.4, 12.5, D], facing: 'east', wall: '#cfd8de', trim: '#5c6670', roof: '#7c8086', storeys: 4, style: 'glass' },
    { id: 'a-w3', position: [W, -11.2], size: [10.4, 6.4, D], facing: 'east', wall: '#a8c4b4', trim: '#fdf3df', roof: '#625649', storeys: 2,
      awning: '#1d7f86', sign: { text: 'SHAWARMA PALACE', sub: 'SHAWARMA · SMALL CHOPS · DRINKS', bg: '#1d7f86', fg: '#ffffff' } },
    { id: 'a-w4', position: [W, -0.2], size: [10.4, 9.4, D], facing: 'east', wall: '#e2cfae', trim: '#8d3b2a', roof: '#6a5a4b', storeys: 3, balcony: true },
    { id: 'a-w5', position: [W, 10.8], size: [10.4, 6.4, D], facing: 'east', wall: '#c97b63', trim: '#fff2e2', roof: '#655749', storeys: 2 },
    { id: 'a-w6', position: [W, 21.8], size: [10.4, 9.4, D], facing: 'east', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#5f5246', storeys: 3, balcony: true },
    { id: 'a-w7', position: [W, 32.6], size: [10.4, 6.4, D], facing: 'east', wall: '#f4f0e6', trim: '#2f7a52', roof: '#61554a', storeys: 2,
      awning: '#2f7a52', sign: { text: 'GREEN TAXI RANK', sub: 'AIRPORT · MAITAMA · GARKI', bg: '#2f7a52', fg: '#ffffff' } },
  ],

  props: [
    // market stalls in front of Wuse Market
    { id: 'stall-amina', kind: 'stall', position: [6.0, -15.4], rotation: -Math.PI / 2, color: '#e4572e', collide: true },
    { id: 'stall-nkechi', kind: 'stall', position: [6.0, -8.6], rotation: -Math.PI / 2, color: '#7a3b72', collide: true },
    { id: 'crates-1', kind: 'crates', position: [6.4, -19.4], collide: true },
    // suya grill
    { id: 'grill-1', kind: 'grill', position: [6.2, 7.6], rotation: -Math.PI / 2, collide: true },
    { id: 'um-1', kind: 'umbrella', position: [5.6, 13.4], color: '#b3261e' },
    // a parked green taxi at the rank, on the kerb clear of the lanes
    { id: 'taxi-parked', kind: 'car', position: [-3.9, 29], rotation: 0, color: '#2f7a52', collide: true },
    // neem trees — Abuja is a green city
    { id: 'tree-1', kind: 'tree', position: [-6.2, -30], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, -29], collide: true },
    { id: 'tree-3', kind: 'tree', position: [-6.2, 4], collide: true },
    { id: 'tree-4', kind: 'tree', position: [6.3, 27], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 15], collide: true },
    { id: 'gen-1', kind: 'generator', position: [-6.4, -18], collide: true },
    // Aso Rock, beyond the north end of the street
    { id: 'aso-rock', kind: 'monolith', position: [4, -112] },
  ],

  npcs: [
    {
      id: 'hajiya-amina',
      name: 'Hajiya Amina',
      role: 'Foodstuff seller',
      personality: 'Commanding, generous, knows the price of every pepper in the capital.',
      position: [5.0, -13.0],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#e4572e', bottom: '#2f7a52', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#e4572e', accessory: 'earrings', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [7, 19],
      social: {
        lines: [
          'I came from Kaduna with one basket. Now I have three stalls and a shop boy.',
          'Wuse Market wakes before the sun. By ten the whole of Abuja is here.',
          'Ehen — you have to taste Sani’s suya. Tell him Hajiya sent you.',
        ],
        likes: ['abuja-suya', 'kunun-aya', 'embroidered-cap'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'pepper-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'pepper-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Sannu! Mallam Sani is waiting for this yaji and onions before the evening crowd. Carry it to his suya grill down the road — quick quick.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'pepper-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,500 when it reaches him. Under twenty-five seconds and he adds ₦900 — the grill does not wait.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'pepper-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Sani’s grill is the red awning, same side as the market, towards the taxi rank.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you, my dear. Come back later — there is always something to carry in this market.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mallam-sani',
      name: 'Mallam Sani',
      role: 'Suya man',
      personality: 'Unhurried, proud of his yaji recipe, slices meat thinner than paper.',
      position: [5.0, 10.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#4b4033', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#b3261e', height: 1.78 },
      promptVerb: 'Buy from',
      hours: [10, 23],
      social: {
        lines: [
          'The secret is the yaji. My grandfather’s recipe, from Zaria.',
          'Kilishi is suya’s patient brother — three days in the sun.',
          'Friday night the queue reaches the pharmacy.',
        ],
        likes: ['kunun-aya', 'fura-da-nono', 'calabash-bowl'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'pepper-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Sannu! Suya hot from the fire, kilishi, masa — and fura to cool your mouth.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'sani-suya' } },
              { label: 'Just smelling', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Hajiya’s yaji! Just in time — the evening crowd is coming. Give it here.',
            options: [
              { label: 'Hand over the bag', action: { kind: 'deliverJob', jobId: 'pepper-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-nkechi',
      name: 'Mama Nkechi',
      role: 'Craft seller',
      personality: 'Quick-witted, from Onitsha, bargains for sport.',
      position: [5.0, -6.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#f2b705', outfit: 'top-skirt', hair: 'braids', headwear: 'gele', headColor: '#7a3b72', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Bargain with',
      hours: [8, 19],
      social: {
        lines: [
          'These sandals come from Kano leather workers. Feel the stitching.',
          'Politicians buy caps here before every swearing-in. Ha!',
          'Bargain well and I will respect you. Bargain badly and I will still sell to you.',
        ],
        likes: ['ankara-tote', 'adire-scarf', 'kilishi'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Leather sandals from Kano, embroidered caps, calabash bowls — all hand-made. Make me an offer!',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'nkechi-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'chidinma',
      name: 'Chidinma',
      role: 'Youth corper',
      personality: 'Just posted to Abuja for her service year, wide-eyed and organised.',
      position: [-4.8, 20],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#f4f0e6', bottom: '#2f7a52', outfit: 'top-trousers', hair: 'puff', accessory: 'glasses', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'I asked for Lagos and they posted me to Abuja. Honestly? I like it.',
          'Everything here is so wide. The roads, the sky, the walks between offices.',
          'My mum in Enugu calls every evening to ask if I have eaten.',
        ],
        likes: ['abuja-suya', 'masa', 'aso-rock-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'capital-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'capital-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'capital-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'capital-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi! I’m Chidinma — corper, just posted here. Would you show me Wuse? The suya street, the market, and that view of Aso Rock everybody talks about.',
            options: [
              { label: 'Show her round', action: { kind: 'acceptJob', jobId: 'capital-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 from my allowance — and ₦1,250 more if we finish before my CDS meeting. Walk though; these shoes are new.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'capital-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need a guide who already knows Wuse — the suya street, the market and the Aso Rock view at the end of the road. Find them first, then come back for me!',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m right behind you!',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Aso Rock is even bigger than in the photos! Thank you — I finally feel like I live here.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'capital-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! When my parents visit, you’re showing them round too.',
            options: [{ label: 'Anytime', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mallam-garba',
      name: 'Mallam Garba',
      role: 'Taxi driver',
      personality: 'Calm, careful, knows every roundabout in the city.',
      position: [-5.0, 32.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#2f7a52', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#f4f0e6', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Abuja roads are wide, but the airport road still has its moments.',
          'Green and white — the city’s colours. My cab is my office.',
          'From here to Nnamdi Azikiwe, forty minutes if God is kind.',
        ],
        likes: ['kunun-aya', 'abuja-suya', 'masa'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Nnamdi Azikiwe, forty minutes on the airport road. Or the Jos bus loads at the park round the corner. Enter, my friend.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Take the bus to Jos', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'aw-1', look: { gender: 'male', skin: '#3f2516', top: '#4a5a72', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[-5.4, 36], [-5.4, -36]], speed: 1.2 },
    { id: 'aw-2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#2c5f9e', outfit: 'dress', hair: 'long', headwear: 'wrap', headColor: '#2c5f9e' }, path: [[3.4, 30], [3.4, -20], [3.4, 30]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'suya-night',
      name: 'Wuse Suya Night',
      kind: 'festival',
      venue: 'Suya street, Wuse',
      description: 'Grills all down the street, a DJ on a car roof, and half of Abuja out in the cool of the evening.',
      hours: [19, 23],
      price: 5000,
      joy: 28,
      energy: 8,
    },
  ],
  spots: [
    { id: 'suya-night-gate', kind: 'event', position: [-5.6, 6], label: 'Wuse Suya Night', verb: 'Go to', eventId: 'suya-night' },
    { id: 'wuse-bench', kind: 'bench', position: [-5.6, 15], label: 'Bench under the neem', verb: 'Rest on' },
    { id: 'wuse-studio-door', kind: 'home', position: [6.2, 20.8], label: 'Wuse 2 Studios', verb: 'Check', homeId: 'wuse-studio' },
  ],
  homes: [
    { id: 'wuse-studio', name: 'Wuse studio', description: 'A tidy studio three floors up, with a balcony over the street and the suya smoke at night. Pay once for your stay — or buy it.', moveInCost: 12000, buyPrice: 120000 },
  ],

  businesses: [
    {
      id: 'sani-suya',
      name: 'Mallam Sani Suya',
      kind: 'food',
      ownerNpcId: 'mallam-sani',
      greeting: 'Hot from the fire.',
      stock: [
        { itemId: 'abuja-suya', price: 2500 },
        { itemId: 'kilishi', price: 3000 },
        { itemId: 'masa', price: 1000 },
        { itemId: 'fura-da-nono', price: 1200 },
      ],
    },
    {
      id: 'nkechi-crafts',
      name: 'Mama Nkechi Crafts',
      kind: 'market',
      ownerNpcId: 'mama-nkechi',
      greeting: 'All hand-made!',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'leather-sandals', price: 9000 },
        { itemId: 'embroidered-cap', price: 4500 },
        { itemId: 'calabash-bowl', price: 3500 },
      ],
    },
  ],

  items: [
    { id: 'abuja-suya', name: 'Suya with onions', category: 'food', basePrice: 2500, consumable: true, nutrition: 40, icon: 'plate', description: 'Thin-sliced beef, yaji spice, raw onion and tomato, wrapped in newspaper.' },
    { id: 'kilishi', name: 'Kilishi', category: 'food', basePrice: 3000, consumable: true, nutrition: 25, icon: 'snack', description: 'Spiced beef dried in the sun — northern Nigeria’s jerky.' },
    { id: 'masa', name: 'Masa (rice cakes)', category: 'food', basePrice: 1000, consumable: true, nutrition: 25, icon: 'plate', description: 'Soft fermented rice cakes with pepper sauce.' },
    { id: 'fura-da-nono', name: 'Fura da nono', category: 'drink', basePrice: 1200, consumable: true, nutrition: 18, icon: 'cup', description: 'Millet balls in cool fresh milk.' },
    { id: 'leather-sandals', name: 'Kano leather sandals', category: 'shoes', basePrice: 9000, icon: 'bag', description: 'Hand-stitched leather from the tanneries of Kano.' },
    { id: 'embroidered-cap', name: 'Embroidered cap (hula)', category: 'clothing', basePrice: 4500, icon: 'bag', description: 'A white cap with fine hand embroidery.' },
    { id: 'calabash-bowl', name: 'Carved calabash bowl', category: 'souvenir', basePrice: 3500, icon: 'key', description: 'A gourd bowl carved with northern patterns.' },
  ],

  jobs: [
    {
      id: 'pepper-run',
      title: 'Pepper Run',
      summary: "Carry Hajiya Amina's yaji and onions from Wuse Market to Mallam Sani's suya grill before the evening crowd.",
      giverNpcId: 'hajiya-amina',
      dropoffNpcId: 'mallam-sani',
      cargo: 'Bag of yaji and onions',
      timeLimitMs: 60_000,
      reward: 2500,
      bonus: { underMs: 25_000, amount: 900 },
      cooldownMs: 25_000,
    },
    {
      id: 'capital-walk',
      kind: 'tour',
      tour: { stops: ['abv-suya', 'abv-market', 'abv-asorock'] },
      requires: { discovered: ['abv-suya', 'abv-market', 'abv-asorock'] },
      title: 'Capital Walk',
      summary: 'Show Chidinma the suya street, Wuse Market and the Aso Rock view, in that order. She walks — don’t lose her.',
      giverNpcId: 'chidinma',
      dropoffNpcId: 'chidinma',
      cargo: 'Guiding Chidinma',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#2f7a52' }, { kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d1d1f' }],
    speed: [5, 8],
  },
  startingMoney: 0,
};
