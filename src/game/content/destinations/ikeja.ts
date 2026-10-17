import type { DestinationPack } from '../types';

/**
 * Ikeja — a gadget-market street in the style of Computer Village (fictional businesses).
 * Phone shops and repair stands; the repair engineer needs a fast courier.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const ikeja: DestinationPack = {
  id: 'ikeja-village',
  name: 'Lagos',
  area: 'Ikeja',
  tagline: 'Computer Village — phones, repairs and the busiest gadget market in West Africa.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e9cfa2',
    fog: '#ddc8a6',
    ground: '#9c7a5e',
    road: '#353535',
    roadLine: '#e8d9b0',
    sidewalk: '#b5b0a5',
    gutter: '#4f4a45',
    sun: '#ffdcae',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.8, crowd: 0.75, horns: 8 },
  landmarks: [
    { id: 'ikeja-village', name: 'Computer Village', blurb: 'If it has a screen, someone here can fix it.', position: [0, 2], radius: 5 },
    { id: 'ikeja-plaza', name: 'Ikeja Tech Plaza', blurb: 'Five floors of phones, laptops and chargers.', position: [6, -14], radius: 4 },
    { id: 'ikeja-stop', name: 'Ikeja danfo park', blurb: 'Buses to Yaba, the Island and Lekki.', position: [-5, 36], radius: 3 },
  ],
  welcome: { from: 'Engr. Tobi', text: 'Welcome to Computer Village! If you need work, I have a repaired phone that must reach its owner fast.' },

  buildings: [
    { id: 'k-e1', position: [E, -35], size: [10, 9.4, D], facing: 'west', wall: '#c7ccd1', trim: '#2c5f9e', roof: '#5f5246', storeys: 3, balcony: true,
      awning: '#2c5f9e', sign: { text: 'OKAFOR & CO.', sub: 'PHARMACY · STORES', bg: '#ffffff', fg: '#2c5f9e' } },
    { id: 'k-e2', position: [E, -24.4], size: [10.4, 6.4, D], facing: 'west', wall: '#e8e2d4', trim: '#d8452b', roof: '#62564a', storeys: 2 },
    { id: 'k-e3', position: [E, -13.4], size: [10.6, 12.5, D], facing: 'west', wall: '#8fa7bf', trim: '#f4f0e6', roof: '#61554a', storeys: 4, balcony: true,
      awning: '#15130f', sign: { text: 'IKEJA TECH PLAZA', sub: 'PHONES · LAPTOPS · TABLETS', bg: '#15130f', fg: '#6fd3ff' } },
    { id: 'k-e4', position: [E, -1.8], size: [10.6, 6.4, D], facing: 'west', wall: '#f0c75e', trim: '#2a2a2a', roof: '#6e5f50', storeys: 2,
      awning: '#2a2a2a', sign: { text: 'GADGET PLUG', sub: 'EARBUDS · CASES · POWER BANKS', bg: '#2a2a2a', fg: '#f2b705' } },
    { id: 'k-e5', position: [E, 9.6], size: [10.4, 9.4, D], facing: 'west', wall: '#d9cbb3', trim: '#1f6f4a', roof: '#5f5246', storeys: 3, balcony: true },
    { id: 'k-e6', position: [E, 20.8], size: [10.4, 6.4, D], facing: 'west', wall: '#3f6f8f', trim: '#f2e5cf', roof: '#62564a', storeys: 2,
      awning: '#e4572e', sign: { text: 'FIXIT REPAIRS', sub: 'SCREENS · BATTERIES · ENGR. TOBI', bg: '#e4572e', fg: '#fff6e0' } },
    { id: 'k-e7', position: [E, 31.6], size: [10.4, 9.4, D], facing: 'west', wall: '#efe4cf', trim: '#4a5a72', roof: '#6c5c4d', storeys: 3 },

    { id: 'k-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e9e1d2', trim: '#7a3b72', roof: '#685a4c', storeys: 2,
      awning: '#7a3b72', sign: { text: 'MEGABYTE', sub: 'ACCESSORIES · SIM CARDS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'k-w2', position: [W, -24.4], size: [10.4, 12.5, D], facing: 'east', wall: '#b9c2c9', trim: '#f4f0e6', roof: '#5f5246', storeys: 4, balcony: true },
    { id: 'k-w3', position: [W, -13.2], size: [10.4, 6.4, D], facing: 'east', wall: '#5fa8b8', trim: '#fdf3df', roof: '#625649', storeys: 2,
      awning: '#1d7f86', sign: { text: 'SMART HUB', sub: 'PHONES · NEW & UK-USED', bg: '#ffffff', fg: '#1d7f86' } },
    { id: 'k-w4', position: [W, -2.2], size: [10.4, 9.4, D], facing: 'east', wall: '#e2cfae', trim: '#8d3b2a', roof: '#6a5a4b', storeys: 3, balcony: true },
    { id: 'k-w5', position: [W, 8.8], size: [10.4, 6.4, D], facing: 'east', wall: '#c97b63', trim: '#fff2e2', roof: '#655749', storeys: 2,
      awning: '#f2b705', sign: { text: 'POWER UP', sub: 'CHARGING · BATTERIES', bg: '#f2b705', fg: '#15130f' } },
    { id: 'k-w6', position: [W, 19.8], size: [10.4, 9.4, D], facing: 'east', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#5f5246', storeys: 3, balcony: true },
    { id: 'k-w7', position: [W, 31], size: [10.4, 6.4, D], facing: 'east', wall: '#a8b6a2', trim: '#f4f0e6', roof: '#61554a', storeys: 2 },
  ],

  props: [
    { id: 'danfo', kind: 'danfo', position: [-2.1, 30], rotation: 0, collide: true },
    { id: 'bus', kind: 'busstop', position: [-6.3, 38.4], rotation: Math.PI / 2, collide: true },
    { id: 'kiosk-1', kind: 'kiosk', position: [6.2, 4.6], rotation: -Math.PI / 2, color: '#2c5f9e', collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.6, -6], color: '#1d7f86' },
    { id: 'um-2', kind: 'umbrella', position: [5.6, 14], color: '#e4572e' },
    { id: 'gen-1', kind: 'generator', position: [6.4, -20], collide: true },
    { id: 'gen-2', kind: 'generator', position: [-6.3, 14], rotation: Math.PI, collide: true },
    { id: 'crates-1', kind: 'crates', position: [-6.3, -28], collide: true },
    { id: 'okada-1', kind: 'okada', position: [-5.8, 2], rotation: 0.3, collide: true },
    { id: 'tree-1', kind: 'tree', position: [6.2, 36], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.1, -18], collide: true },
    { id: 'pole-1', kind: 'pole', position: [-6.5, 34] },
    { id: 'pole-2', kind: 'pole', position: [-6.5, 10] },
    { id: 'pole-3', kind: 'pole', position: [-6.5, -14] },
    { id: 'pole-4', kind: 'pole', position: [-6.5, -38] },
  ],

  npcs: [
    {
      id: 'tobi',
      name: 'Engr. Tobi',
      role: 'Repair engineer',
      personality: 'Methodical, proud of his work, hates late deliveries.',
      position: [5.3, 20.8],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#5a3420', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', accessory: 'glasses', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [9, 19],
      social: { lines: ["A phone tells you its story — the scratches, the battery, the drops.", "I trained in Computer Village for six years before I opened my shop.", "Never buy a 'UK-used' phone without testing the charging port."], likes: ["power-bank", "earbuds", "meat-pie"] },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'phone-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'phone-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: "Mrs. Okafor's phone is fixed — new screen, new battery. She is waiting at her shop at the far end. Carry it carefully and quickly!",
            options: [
              { label: "I'll deliver it", action: { kind: 'acceptJob', jobId: 'phone-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Work the repair bench', action: { kind: 'startRepair', repairId: 'tobi-bench' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,150, and ₦750 extra if you reach her within 22 seconds. She has a meeting.',
            options: [
              { label: 'Deal', action: { kind: 'acceptJob', jobId: 'phone-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Why are you here? Okafor & Co. — north end, right side. Go!',
            options: [{ label: 'Going', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Next delivery is on the bench. Give me small time — or come and help me fix phones. I pay per phone.',
            options: [
              { label: 'Work the repair bench', action: { kind: 'startRepair', repairId: 'tobi-bench' } },
              { label: 'Okay', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'okafor',
      name: 'Mrs. Okafor',
      role: 'Shop owner',
      personality: 'Busy businesswoman, always on a call.',
      position: [4.6, -33],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#2b2b33', outfit: 'dress', hair: 'bun', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Talk to',
      hours: [9, 19],
      social: { lines: ["Three branches, two meetings, one phone. Life!", "Pharmacy, provisions, phones — diversify, my dear.", "You're dependable. I like that in people."], likes: ["lace-fabric", "shea-butter", "kente-stole"] },
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'phone-run' }, node: 'delivery' },
          { node: 'hello' },
        ],
        nodes: {
          delivery: {
            text: 'My phone! Tobi said it would be quick. Let me see that screen.',
            options: [
              { label: 'Hand over the phone', action: { kind: 'deliverJob', jobId: 'phone-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          hello: {
            text: 'Welcome to Okafor & Co. Sorry, I am waiting for my phone from the repair shop.',
            options: [{ label: 'No problem', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'chuka',
      name: 'Chuka',
      role: 'Gadget seller',
      personality: 'Smooth talker, gives a discount if you push.',
      position: [5.2, -1.8],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#2a2a2a', bottom: '#4a5a72', outfit: 'shirt', hair: 'hightop', facialHair: 'none', headwear: 'cap', headColor: '#f2b705', height: 1.8 },
      promptVerb: 'Bargain with',
      hours: [9, 20],
      social: { lines: ["Original or copy? Ask me — I'll tell you honestly. Mostly.", "Gadgets move fast. Last year's phone is this year's bargain.", "Customer is king — but bargain is queen."], likes: ["jollof-plate", "beach-suya", "roasted-corn"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'My guy! Original earbuds, power banks, phone cases. Price na talk — make we talk.',
            options: [
              { label: 'Show me', action: { kind: 'openShop', businessId: 'chuka' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'wale',
      name: 'Wale',
      role: 'Danfo conductor',
      personality: 'Hoarse from shouting, very patient with change.',
      position: [-4.8, 34.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#f2b705', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#15130f', height: 1.72 },
      promptVerb: 'Talk to',
      social: { lines: ["My voice? Gone since 2019. Shouting 'Ikeja!' all day.", "Ojota, Oshodi, Obalende — I know them like my palm.", "Keep your change ready and we'll be friends."], likes: ["water", "zobo", "puff-puff"] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Yaba! Obalende! Lekki! Enter with your change o!',
            options: [
              { label: 'Take a danfo', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'alhaji-sule',
      name: 'Alhaji Sule',
      role: 'Bus conductor',
      personality: 'Fills a bus faster than anyone at the park.',
      position: [5.0, 29],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#c0392b', height: 1.76 },
      promptVerb: 'Talk to',
      social: { lines: ["From Ojota I have sent buses to every corner of the South-West.", "Abeokuta two hours, Ibadan two and a half — if the expressway is kind.", "The train is fine. But the bus leaves when you are ready."], likes: ['kokoro', 'gala', 'zobo'] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Ojota park! Abeokuta! Ibadan! The bus is filling — enter now, we move!',
            options: [
              { label: 'Take an intercity bus', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'kw-3', look: { gender: 'male', skin: '#a8714f', top: '#6b3f8f', bottom: '#2b2f3a', outfit: 'shirt', hair: 'low', accessory: 'glasses', height: 1.72 }, path: [[5.4, 24], [5.4, -6], [5.4, 24]], speed: 1.25, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
    { id: 'kw-4', look: { gender: 'female', skin: '#5a3420', top: '#e8e6e0', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun' }, path: [[-5.4, -20], [-5.4, 26], [-5.4, -20]], speed: 1.3, stops: [{ at: 1, activity: 'wait', seconds: 10, face: Math.PI / 2 }] },
    { id: 'kw-1', look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2c5f9e', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[-5.4, 30], [-5.4, -34]], speed: 1.5 },
    { id: 'kw-2', look: { gender: 'female', skin: '#5a3420', top: '#1d7f86', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids' }, path: [[5.4, -30], [5.4, 28]], speed: 1.3 },
  ],

  businesses: [
    {
      id: 'chuka',
      name: 'Gadget Plug',
      kind: 'market',
      ownerNpcId: 'chuka',
      greeting: 'Everything original, no fake.',
      haggle: { floor: 0.8, patience: 2 },
      stock: [
        { itemId: 'phone-case', price: 2500 },
        { itemId: 'earbuds', price: 7000 },
        { itemId: 'power-bank', price: 9500 },
      ],
    },
  ],

  items: [
    { id: 'phone-case', name: 'Phone case', category: 'goods', basePrice: 2500, icon: 'bag', description: 'Shock-proof, in Lagos yellow.' },
    { id: 'earbuds', name: 'Wireless earbuds', category: 'goods', basePrice: 7000, icon: 'bag', description: 'For long danfo rides.' },
    { id: 'power-bank', name: 'Power bank', category: 'goods', basePrice: 9500, icon: 'bag', description: 'Because NEPA can take light anytime.' },
  ],

  jobs: [
    {
      id: 'phone-run',
      title: 'Phone Run',
      summary: "Deliver the repaired phone from Engr. Tobi's shop to Mrs. Okafor.",
      giverNpcId: 'tobi',
      dropoffNpcId: 'okafor',
      cargo: 'Repaired phone',
      timeLimitMs: 55_000,
      reward: 2150,
      bonus: { underMs: 22_000, amount: 750 },
      cooldownMs: 20_000,
    },
  ],

  repairs: [
    {
      id: 'tobi-bench',
      title: 'Repair bench at FixIt',
      npcId: 'tobi',
      skill: 'repair',
      devices: [
        { name: 'Cracked screen', fault: 'Dropped on the tiles', steps: ['Power off', 'Open the back', 'Disconnect battery', 'Swap the screen', 'Close & test'] },
        { name: 'Dead battery', fault: 'Dies at 40%', steps: ['Power off', 'Open the back', 'Unplug old battery', 'Fit new battery', 'Close & test'] },
        { name: 'Charging port', fault: 'Won’t charge', steps: ['Power off', 'Open the back', 'Clean the port', 'Replace the port', 'Close & test'] },
      ],
      perSession: 3,
      seconds: 10,
      perLevel: 1.2,
      payPerDevice: 650,
      perfectTip: 500,
      energyCost: 14,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'phone-run', count: 1 } },
    },
  ],
  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#9aa3ad' }, { kind: 'danfo' }, { kind: 'car', color: '#1d1d1f' }, { kind: 'keke' }, { kind: 'car', color: '#2f7a52' }],
    speed: [4.5, 7.5],
  },
  startingMoney: 0,
};
