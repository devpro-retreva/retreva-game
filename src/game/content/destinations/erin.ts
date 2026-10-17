import type { DestinationPack, Vec2 } from '../types';

/**
 * Erin-Ijesha — the road up to the Olumirin Waterfalls (fictional businesses and people; the falls, their seven
 * levels and the story of Akinla are real). A short street of stalls and guesthouses ends at the falls gate; beyond
 * it the water steps down a forested hill in seven levels, with the climbing path beside it. You pay the gate fee
 * once a day and climb on foot — as far as you like, every level counted — and come back down to the gate. Baba
 * Femi needs a crate of water taken up to Iya Bose's kiosk; Mama Funmi cooks; Baba Femi sells walking sticks and
 * sun hats (bargain); Ayo's bus goes to Ile-Ife and Osogbo from the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const ROOF = '#6a4a34';

/** The climb: from the gate, up the path beside the falls — flat across each level's terrace, steps up each cliff. */
const LEVELS = 7;
const TRACK: Vec2[] = [[3.4, -34], [6, -44]];
const HEIGHTS: number[] = [0, 0];
for (let i = 0; i < LEVELS; i++) {
  const zA = -44 - 8 * i;
  TRACK.push([6, zA - 6]);
  HEIGHTS.push(3 * i);
  if (i < LEVELS - 1) {
    TRACK.push([6, zA - 8]);
    HEIGHTS.push(3 * (i + 1));
  }
}

const LEVEL_NOTES = [
  'The first pool, wide and shallow, where most visitors stop to swim.',
  'Up the first steps: the fall is louder here, and the spray reaches the path.',
  'The third level, the last of the three big falls.',
  'Above the big falls the path gets steeper and the crowd thins out.',
  'Forest closes in over the water; monkeys sometimes cross the stream here.',
  'The sixth level: a narrow pool between rocks, and the town far below.',
  'The top level, where the water first comes over the rock — quiet, cool, and worth every step.',
];

export const erin: DestinationPack = {
  id: 'erin-olumirin',
  name: 'Erin-Ijesha',
  area: 'Olumirin Falls',
  tagline: 'Erin-Ijesha — the Olumirin Waterfalls, seven levels down a forested hill, and the path that climbs beside them.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#dfe4d8',
    fog: '#d2d9cc',
    ground: '#8a6a48',
    road: '#3d3c38',
    roadLine: '#e9e4d2',
    sidewalk: '#c8bfa8',
    gutter: '#4f4a42',
    sun: '#fbf3dc',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.2, crowd: 0.45, horns: 1 },
  vista: 'north',
  backdrop: 'rainforest',
  landmarks: [
    { id: 'erin-gate', name: 'Olumirin Waterfalls gate', blurb: 'The way in to the falls. Local tradition says Akinla, a granddaughter of Oduduwa, found them while leading her people here, centuries ago.', position: [0, -36], radius: 5 },
    { id: 'erin-hills', name: 'The Ijesha hills', blurb: 'Erin-Ijesha sits in the forested hills of Ijesha land, east of Ilesa — country of cocoa farms, kola and old gold workings.', position: [0, 24], radius: 5 },
  ],
  welcome: { from: 'Kayode', text: 'Welcome to Erin-Ijesha! I guide at the falls — the gate is at the top of the street. Seven levels. How many can you climb?' },

  buildings: [
    { id: 'e-e1', position: [E, -33], size: [12, 3.4, D], facing: 'west', wall: '#d8cdb4', trim: '#1f6f4a', roof: ROOF, storeys: 1,
      awning: '#1f6f4a', sign: { text: 'OLUMIRIN WATERFALLS', sub: 'GATE · TICKETS · GUIDES', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'e-e2', position: [E, -19], size: [10.4, 3.4, D], facing: 'west', wall: '#f0c75e', trim: '#2a2a2a', roof: ROOF, storeys: 1,
      awning: '#c9583b', businessId: 'funmi-food', sign: { text: 'MAMA FUNMI', sub: 'IYAN · BOLI · COCONUT', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'e-e3', position: [E, -5], size: [10.4, 6.4, D], facing: 'west', wall: '#e6dcc6', trim: '#4a5a72', roof: ROOF, storeys: 2, balcony: true,
      sign: { text: 'FALLS VIEW', sub: 'GUESTHOUSE', bg: '#ffffff', fg: '#4a5a72' } },
    { id: 'e-e4', position: [E, 12], size: [10.4, 3.4, D], facing: 'west', wall: '#d6c7a8', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'e-e5', position: [E, 26], size: [10.4, 3.4, D], facing: 'west', wall: '#e2d6bc', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'e-w1', position: [W, -32], size: [10, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#2c5f9e', roof: ROOF, storeys: 1,
      awning: '#2c5f9e', sign: { text: 'FEMI STORES', sub: 'WATER · STICKS · HATS', bg: '#2c5f9e', fg: '#ffffff' }, businessId: 'femi-stores' },
    { id: 'e-w2', position: [W, -17], size: [10.4, 3.4, D], facing: 'east', wall: '#d9cbb0', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'e-w3', position: [W, -2], size: [10.4, 6.4, D], facing: 'east', wall: '#e2d6bc', trim: '#7a3b72', roof: ROOF, storeys: 2 },
    { id: 'e-w4', position: [W, 14], size: [10.4, 3.4, D], facing: 'east', wall: '#ddd0b6', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'e-w5', position: [W, 34], size: [10, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: ROOF, storeys: 1,
      sign: { text: 'BUSES', sub: 'ILESA · IFE · OSOGBO', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    { id: 'kiosk-bose', kind: 'kiosk', position: [-6.2, -39.6], rotation: Math.PI / 2, color: '#1f6f4a', collide: true },
    { id: 'palm-1', kind: 'palm', position: [6.4, -26], collide: true },
    { id: 'palm-2', kind: 'palm', position: [-6.3, 6], collide: true },
    { id: 'tree-1', kind: 'tree', position: [6.3, 4], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.2, 24], collide: true },
    { id: 'bench-1', kind: 'bench', position: [6.3, 19], collide: true },
    { id: 'stall-funmi', kind: 'grill', position: [6.2, -15.6], rotation: -Math.PI / 2, collide: true },
  ],

  npcs: [
    {
      id: 'guide-kayode',
      name: 'Kayode',
      role: 'Falls guide',
      personality: 'Grew up swimming in the first pool; has climbed to the top more times than he can count.',
      position: [-1.6, -33],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#1f6f4a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#1f6f4a', height: 1.78 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Most people stop at the first level, swim and go home. The top is for people with legs and patience.',
          'In the rains the falls roar. In the dry season you can hear yourself think.',
          'Akinla found the falls, they say. We just keep the path clean.',
        ],
        likes: ['boli-epa', 'erin-coconut', 'ijesha-iyan'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'The falls go up in seven levels. Pay at the gate once and climb as far as you like today — turn back whenever your legs say so. Bring water!',
            options: [
              { label: 'How hard is it?', action: { kind: 'goto', node: 'hard' } },
              { label: 'Thanks', action: { kind: 'close' } },
            ],
          },
          hard: {
            text: 'The first three levels are easy. After that it is steps and more steps, slippery in the rains. Go slowly and you will see the top.',
            options: [{ label: 'I’ll try', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'iya-bose',
      name: 'Iya Bose',
      role: 'Kiosk keeper',
      personality: 'Sells cold water and plantain chips at the gate; knows exactly who will make it to the top.',
      position: [-4.6, -37],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#2a2a2a', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.63 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'You? To the top? Drink water first and I will believe you.',
          'Every Saturday the students come from Ife and Ilesa. Every Saturday I run out of water.',
          'My grandmother sold kola here before there was a gate.',
        ],
        likes: ['boli-epa', 'ijesha-iyan', 'raffia-sunhat'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'water-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Cold water, plantain chips! The climb is long, my dear.',
            options: [{ label: 'Thank you', action: { kind: 'close' } }],
          },
          report: {
            text: 'Water at last! The students were about to fight me. Put it here.',
            options: [
              { label: 'Hand over the crate', action: { kind: 'deliverJob', jobId: 'water-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'baba-femi',
      name: 'Baba Femi',
      role: 'Shopkeeper',
      personality: 'Sells everything a climber forgets; bargains cheerfully and tells you which level he reached in 1979.',
      position: [-5.0, -29.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#2c5f9e', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#2c5f9e', height: 1.74 },
      promptVerb: 'Bargain with',
      hours: [7, 19],
      social: {
        lines: [
          'In 1979 I reached the fifth level in my Sunday shoes. Buy a stick.',
          'The sun hat is for the street. Under the trees by the falls it is cool.',
          'Iya Bose always runs out of water. Always.',
        ],
        likes: ['ijesha-iyan', 'erin-coconut', 'kola-nut'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'water-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'water-run' }, node: 'offer' },
          { node: 'shop' },
        ],
        nodes: {
          offer: {
            text: 'Iya Bose at the gate has run out of water again. Carry this crate up to her kiosk? Or see my sticks and hats.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'water-run' } },
              { label: 'See your goods', action: { kind: 'openShop', businessId: 'femi-stores' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Up the street, by the gate — the green kiosk.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          shop: {
            text: 'Walking sticks, sun hats, the T-shirt. Make me an offer.',
            options: [
              { label: 'See your goods', action: { kind: 'openShop', businessId: 'femi-stores' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-funmi',
      name: 'Mama Funmi',
      role: 'Cook',
      personality: 'Feeds the climbers coming down, who are always hungrier than the ones going up.',
      position: [5.2, -17.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#f2b705', bottom: '#1f6f4a', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [7, 20],
      social: {
        lines: [
          'Ijesha people and pounded yam — it is a love story.',
          'Boli and groundnut: food for the road, food for the falls.',
          'Coconut water after the climb. Trust me.',
        ],
        likes: ['walking-stick', 'kola-nut', 'ife-zobo'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Pounded yam and efo, boli and groundnut, fresh coconut. Eat!',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'funmi-food' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'conductor-ayo',
      name: 'Ayo',
      role: 'Bus conductor',
      personality: 'Plays fuji on a phone speaker and calls Ilesa like it is a song.',
      position: [-4.8, 31.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#c0392b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#c0392b', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Ilesa, Ife, Osogbo — the hills are kind to my engine today.',
          'After the falls everyone sleeps on my bus. I don’t blame them.',
          'Sit by the window. The cocoa farms are beautiful.',
        ],
        likes: ['boli-epa', 'erin-coconut', 'dodo-ikire'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Ilesa! Ife! Osogbo! Enter, enter!',
            options: [
              { label: 'Take an intercity bus', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'ew-1', look: { gender: 'female', skin: '#7a4a2e', top: '#e4572e', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids', headwear: 'cap', headColor: '#2c5f9e' }, path: [[3.6, 28], [3.6, -24], [3.6, 28]], speed: 1.0, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI }] },
    { id: 'ew-2', look: { gender: 'male', skin: '#5b3622', top: '#1f6f4a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-3.4, 26], [-3.4, -20], [-3.4, 26]], speed: 1.05 },
  ],

  climbs: [
    {
      id: 'olumirin',
      name: 'Olumirin climb',
      fee: 1500,
      minEnergy: 30,
      energy: 28,
      joy: 32,
      ride: {
        vehicle: 'on-foot',
        track: TRACK,
        heights: HEIGHTS,
        speed: 1.0,
        minutes: 150,
        sightings: LEVEL_NOTES.map((blurb, i) => ({ id: `olumirin-${i + 1}`, name: `Level ${i + 1}`, blurb, position: [0, -47 - 8 * i] as Vec2, radius: 7 })),
      },
    },
  ],

  spots: [
    { id: 'olumirin-gate', kind: 'climb', position: [2.4, -36], label: 'the falls', verb: 'Climb', climbId: 'olumirin' },
    { id: 'erin-bench', kind: 'bench', position: [5.6, 19], label: 'Bench in the shade', verb: 'Rest on' },
    { id: 'erin-guesthouse-door', kind: 'home', position: [6.2, -5], label: 'Falls View Guesthouse', verb: 'Check', homeId: 'erin-guesthouse' },
  ],
  homes: [
    { id: 'erin-guesthouse', name: 'Falls View room', description: 'A room in the guesthouse at the top of the street; you can hear the falls at night. Pay once for your stay — or buy it.', moveInCost: 5500, buyPrice: 55000 },
  ],

  businesses: [
    {
      id: 'funmi-food',
      name: 'Mama Funmi',
      kind: 'food',
      ownerNpcId: 'mama-funmi',
      greeting: 'For before and after.',
      stock: [
        { itemId: 'ijesha-iyan', price: 2000 },
        { itemId: 'boli-epa', price: 700 },
        { itemId: 'erin-coconut', price: 500 },
      ],
    },
    {
      id: 'femi-stores',
      name: 'Femi Stores',
      kind: 'market',
      ownerNpcId: 'baba-femi',
      greeting: 'Everything you forgot.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'walking-stick', price: 2500 },
        { itemId: 'raffia-sunhat', price: 3000 },
        { itemId: 'olumirin-tee', price: 5000 },
      ],
    },
  ],

  items: [
    { id: 'ijesha-iyan', name: 'Pounded yam & efo', category: 'food', basePrice: 2000, consumable: true, nutrition: 50, icon: 'plate', description: 'Smooth pounded yam with efo riro, the Ijesha way — plenty of it.' },
    { id: 'boli-epa', name: 'Boli & groundnut', category: 'food', basePrice: 700, consumable: true, nutrition: 20, icon: 'snack', description: 'Roast plantain with roasted groundnuts — the climber’s snack.' },
    { id: 'erin-coconut', name: 'Fresh coconut', category: 'drink', basePrice: 500, consumable: true, nutrition: 8, icon: 'cup', description: 'Cut open in front of you; drink the water, then eat the flesh.' },
    { id: 'walking-stick', name: 'Walking stick', category: 'goods', basePrice: 2500, icon: 'key', description: 'A carved hardwood stick, smooth from the hand. Useful above level three.' },
    { id: 'raffia-sunhat', name: 'Raffia sun hat', category: 'clothing', basePrice: 3000, icon: 'bag', description: 'Wide-brimmed and woven by hand.' },
    { id: 'olumirin-tee', name: 'Olumirin T-shirt', category: 'clothing', basePrice: 5000, icon: 'bag', description: 'Green, with seven little waterfalls on the back.' },
  ],

  jobs: [
    {
      id: 'water-run',
      title: 'Water Run',
      summary: 'Carry a crate of cold water from Femi Stores up the street to Iya Bose’s kiosk at the falls gate.',
      giverNpcId: 'baba-femi',
      dropoffNpcId: 'iya-bose',
      cargo: 'Crate of cold water',
      timeLimitMs: 60_000,
      reward: 1800,
      bonus: { underMs: 30_000, amount: 600 },
      cooldownMs: 25_000,
    },
  ],

  startingMoney: 0,
};
