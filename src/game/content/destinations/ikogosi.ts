import type { DestinationPack } from '../types';

/**
 * Ikogosi — the warm springs resort in the Ekiti hills (fictional businesses and people; the warm spring, the cold
 * spring and their meeting are real). The resort road runs between chalets and stalls; the warm spring rises in a pool
 * on the east side, steam hanging over it, and the cold spring on the west; their streams run north beside the road and
 * meet at the end of it. You can swim in both — the warm one eases you, the cold one wakes you. Pa Ojo brings cocoa
 * down from his farm to Baba Tayo's store; Mama Kemi cooks; Bunmi sells cocoa butter, hand-woven cloth and mats
 * (bargain); Seyi, a nurse from Akure, wants to see the springs properly. Dele's bus goes back to Erin-Ijesha.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const ROOF = '#5a4636';
const WARM = '#5fbfae';
const COLD = '#7cb4d6';

export const ikogosi: DestinationPack = {
  id: 'ikogosi-springs',
  name: 'Ikogosi',
  area: 'Warm Springs',
  tagline: 'Ikogosi — a warm spring and a cold spring rising side by side in the Ekiti hills, and meeting at the end of the road.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#dde5dc',
    fog: '#d0d9cf',
    ground: '#6f7a4c',
    road: '#45443f',
    roadLine: '#e6e2d2',
    sidewalk: '#c4bda8',
    gutter: '#4f4a42',
    sun: '#fbf4de',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  openNorth: true,
  ambience: { traffic: 0.05, crowd: 0.4, horns: 0 },
  vista: 'north',
  vistaStyle: 'forest',
  backdrop: 'rainforest',
  landmarks: [
    { id: 'iko-warm', name: 'The warm spring', blurb: 'The warm spring rises here, said to be up to about 70 °C at its source — too hot to touch where it starts, just right in the pool.', position: [6, -10], radius: 4 },
    { id: 'iko-cold', name: 'The cold spring', blurb: 'Only a short walk away, a cold spring rises from the same hill — no one is quite sure why the two are so different.', position: [-6, -10], radius: 4 },
    { id: 'iko-meet', name: 'Where warm meets cold', blurb: 'The two streams meet and run on side by side; where they mix the water is said to settle at about 37 °C. Put a hand in each.', position: [0, -39], radius: 5 },
  ],
  welcome: { from: 'Bunmi', text: 'Welcome to Ikogosi! Warm spring on the right, cold spring on the left — try both, then walk up to where they meet.' },

  buildings: [
    { id: 'k-e1', position: [E, -32], size: [12, 3.4, D], facing: 'west', wall: '#e2dcc8', trim: '#3d5f3a', roof: ROOF, storeys: 1,
      sign: { text: 'WARM SPRINGS RESORT', sub: 'RECEPTION · CHALETS', bg: '#3d5f3a', fg: '#f6efe2' } },
    // the warm spring opens between e1 and e2
    { id: 'k-e2', position: [E, 8], size: [10.4, 3.4, D], facing: 'west', wall: '#f0c75e', trim: '#2a2a2a', roof: ROOF, storeys: 1,
      awning: '#c9583b', businessId: 'kemi-kitchen', sign: { text: 'MAMA KEMI', sub: 'IYAN · EGUSI · CORN', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'k-e3', position: [E, 21], size: [10.4, 3.4, D], facing: 'west', wall: '#e2dcc8', trim: '#5b3a24', roof: ROOF, storeys: 1,
      sign: { text: 'SPRING CHALETS', sub: 'BY THE NIGHT', bg: '#ffffff', fg: '#5b3a24' } },
    { id: 'k-e4', position: [E, 34], size: [10.4, 3.4, D], facing: 'west', wall: '#d8d0bc', trim: '#5b3a24', roof: ROOF, storeys: 1 },

    { id: 'k-w1', position: [W, -32], size: [12, 3.4, D], facing: 'east', wall: '#d6cbb2', trim: '#8a3a2a', roof: ROOF, storeys: 1,
      awning: '#8a5a2a', businessId: 'tayo-cocoa', sign: { text: 'TAYO COCOA STORE', sub: 'COCOA · KOLA', bg: '#8a5a2a', fg: '#fff6e0' } },
    // the cold spring opens between w1 and w2
    { id: 'k-w2', position: [W, 8], size: [10.4, 3.4, D], facing: 'east', wall: '#d9cbb0', trim: '#7a3b72', roof: ROOF, storeys: 1,
      awning: '#7a3b72', businessId: 'bunmi-crafts', sign: { text: 'BUNMI CRAFTS', sub: 'COCOA BUTTER · CLOTH · MATS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'k-w3', position: [W, 21], size: [10.4, 3.4, D], facing: 'east', wall: '#e2dcc8', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'k-w4', position: [W, 35], size: [10, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: ROOF, storeys: 1,
      sign: { text: 'BUSES', sub: 'EFON · ERIN-IJESHA', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    { id: 'warm-pool', kind: 'spring', position: [12, -11], color: WARM, collide: true },
    { id: 'warm-steam', kind: 'steam', position: [12, -11] },
    { id: 'cold-pool', kind: 'spring', position: [-12, -11], color: COLD, collide: true },
    // the two streams run north beside the road and meet beyond its end
    { id: 'warm-stream', kind: 'stream', position: [8.2, -27], color: WARM },
    { id: 'cold-stream', kind: 'stream', position: [-8.2, -27], color: COLD },
    { id: 'meet-warm', kind: 'stream', position: [4.4, -44], rotation: -1.2, color: WARM },
    { id: 'meet-cold', kind: 'stream', position: [-4.4, -44], rotation: 1.2, color: COLD },
    { id: 'meet-pool', kind: 'spring', position: [0, -48.5], rotation: Math.PI / 2, color: '#6cb6c4' },
    { id: 'meet-steam', kind: 'steam', position: [3, -47] },
    { id: 'tree-1', kind: 'tree', position: [6.4, -22], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.3, -22], collide: true },
    { id: 'palm-1', kind: 'palm', position: [6.4, 16], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 28], collide: true },
  ],

  npcs: [
    {
      id: 'pa-ojo',
      name: 'Pa Ojo',
      role: 'Cocoa farmer',
      personality: 'Has farmed cocoa on the hill above the springs for fifty years; walks faster than his grandsons.',
      position: [-5.0, 12.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5a3420', top: '#e8e6e0', bottom: '#5b3a24', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'cap', headColor: '#5b3a24', height: 1.7 },
      promptVerb: 'Talk to',
      hours: [6, 18],
      social: {
        lines: [
          'Ekiti cocoa went into chocolate all over the world, and nobody there knew our names.',
          'Ferment, then dry in the sun, turning, turning. Then they are ready.',
          'I wash my face in the cold spring every morning. Fifty years. Look at me.',
        ],
        likes: ['ekiti-iyan', 'ikogosi-water', 'kola-nut'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'cocoa-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'cocoa-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'My legs are fine but this sack is heavy. Take these dried cocoa beans to Baba Tayo’s store, at the top of the road by the resort gate?',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'cocoa-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Baba Tayo, and ₦700 more if you get there before he goes for lunch — thirty seconds.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'cocoa-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Up the road, on the left — Tayo Cocoa Store.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you, my child. The next sack is still drying.',
            options: [{ label: 'Later then', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'baba-tayo',
      name: 'Baba Tayo',
      role: 'Cocoa buyer',
      personality: 'Weighs every sack twice and pays fairly; knows the price of cocoa in London to the penny.',
      position: [-5.0, -30.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#8a5a2a', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', facialHair: 'moustache', headwear: 'kufi', headColor: '#8a5a2a', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [8, 18],
      social: {
        lines: [
          'Cocoa prices went to the sky. Good for Pa Ojo, hard for chocolate.',
          'Ekiti, Ondo, Osun — the cocoa belt. All roads lead to my scale.',
          'Have you tasted cocoa butter on your skin after the warm spring? Ask Bunmi.',
        ],
        likes: ['ekiti-iyan', 'cocoa-butter', 'kola-nut'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'cocoa-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Cocoa and kola, bought and sold. Kola for your hosts?',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'tayo-cocoa' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Pa Ojo’s beans — beautifully dry. On the scale with them.',
            options: [
              { label: 'Hand over the sack', action: { kind: 'deliverJob', jobId: 'cocoa-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-kemi',
      name: 'Mama Kemi',
      role: 'Cook',
      personality: 'Cooks for the resort guests and the spring attendants; nobody leaves her table hungry.',
      position: [5.2, 10],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [7, 21],
      social: {
        lines: [
          'In Ekiti, pounded yam is not food. It is a matter of honour.',
          'Swim first, then eat. You will thank me.',
          'The spring water makes the best pap. Don’t ask me why.',
        ],
        likes: ['cocoa-butter', 'woven-mat', 'boli-epa'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Pounded yam and egusi, roast corn, cold spring water. Sit!',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'kemi-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'bunmi',
      name: 'Bunmi',
      role: 'Craft seller',
      personality: 'Back from university in Ado-Ekiti to run her mother’s stall; bargains hard and laughs harder.',
      position: [-5.0, 10],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids', accessory: 'earrings', height: 1.67 },
      promptVerb: 'Bargain with',
      hours: [8, 19],
      social: {
        lines: [
          'Raw cocoa butter, from Pa Ojo’s beans. After the warm spring your skin will thank you.',
          'This cloth is woven on a narrow loom in Ado. Every strip by hand.',
          'Bargain, bargain — but remember I’m a student.',
        ],
        likes: ['ekiti-iyan', 'ikogosi-water', 'ife-beads'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Cocoa butter, hand-woven cloth, mats from the hill villages. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'bunmi-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'seyi',
      name: 'Seyi',
      role: 'Visitor',
      personality: 'A nurse from Akure on her day off; heard about the springs all her life and finally came.',
      position: [4.8, 26],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#2c5f9e', bottom: '#e8e6e0', outfit: 'top-trousers', hair: 'long', accessory: 'glasses', height: 1.65 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'Two springs, one warm, one cold, side by side. My patients won’t believe me.',
          'I’m going to put one hand in each. For science.',
          'Akure is only an hour away and I never came. Shame on me.',
        ],
        likes: ['cocoa-butter', 'ikogosi-water', 'kokoro'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'springs-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'springs-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'springs-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'springs-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hello! Seyi, from Akure. Will you show me the springs? The warm one, the cold one, and the place where they meet.',
            options: [
              { label: 'Guide Seyi', action: { kind: 'acceptJob', jobId: 'springs-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,800 — and ₦1,200 more if we’re done before my bus.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'springs-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the springs — the warm one, the cold one, where they meet. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’ve got my hands ready.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'One hand warm, one hand cold. I will tell this story for years. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'springs-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! See you in Akure.',
            options: [{ label: 'Safe journey', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'conductor-dele',
      name: 'Dele',
      role: 'Bus conductor',
      personality: 'Knows every bend on the hill road and warns you about each one.',
      position: [-4.8, 31.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#c0392b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#c0392b', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Efon, Ipetu, Erin — forty-five minutes of hills.',
          'Hold your bottle. The bends are sharp after Efon.',
          'Tourists sleep after the springs. Warm water does that.',
        ],
        likes: ['ikogosi-water', 'kokoro', 'boli-epa'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Efon! Erin-Ijesha! Enter, we are going!',
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
    { id: 'kw-1', look: { gender: 'female', skin: '#7a4a2e', top: '#e8e6e0', bottom: '#2c5f9e', outfit: 'top-trousers', hair: 'braids' }, path: [[3.6, 30], [3.6, -26], [3.6, 30]], speed: 0.9, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'kw-2', look: { gender: 'male', skin: '#5b3622', top: '#3d5f3a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-3.4, 26], [-3.4, -26], [-3.4, 26]], speed: 1.0 },
  ],

  spots: [
    { id: 'iko-warm-swim', kind: 'swim', position: [6.2, -11], label: 'the warm spring', verb: 'Swim in', joy: 18, energy: 16 },
    { id: 'iko-cold-swim', kind: 'swim', position: [-6.2, -11], label: 'the cold spring', verb: 'Swim in', joy: 12, energy: 6 },
    { id: 'iko-bench', kind: 'bench', position: [-5.6, 28], label: 'Bench by the road', verb: 'Rest on' },
    { id: 'ikogosi-chalet-door', kind: 'home', position: [6.2, 21], label: 'Spring Chalets', verb: 'Check', homeId: 'ikogosi-chalet' },
  ],
  homes: [
    { id: 'ikogosi-chalet', name: 'Spring chalet', description: 'A chalet in the trees above the warm spring; you can hear the water all night. Pay once for your stay — or buy it.', moveInCost: 12000, buyPrice: 110000 },
  ],

  businesses: [
    {
      id: 'kemi-kitchen',
      name: 'Mama Kemi',
      kind: 'food',
      ownerNpcId: 'mama-kemi',
      greeting: 'Ekiti cooking.',
      stock: [
        { itemId: 'ekiti-iyan', price: 2200 },
        { itemId: 'ekiti-corn', price: 500 },
        { itemId: 'ikogosi-water', price: 300 },
      ],
    },
    {
      id: 'bunmi-crafts',
      name: 'Bunmi Crafts',
      kind: 'market',
      ownerNpcId: 'bunmi',
      greeting: 'From the hills.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'cocoa-butter', price: 2500 },
        { itemId: 'ekiti-aso-oke', price: 9000 },
        { itemId: 'woven-mat', price: 4000 },
      ],
    },
    {
      id: 'tayo-cocoa',
      name: 'Tayo Cocoa Store',
      kind: 'market',
      ownerNpcId: 'baba-tayo',
      greeting: 'Weighed fairly.',
      stock: [{ itemId: 'ekiti-kola', price: 600 }],
    },
  ],

  items: [
    { id: 'ekiti-iyan', name: 'Pounded yam & egusi', category: 'food', basePrice: 2200, consumable: true, nutrition: 52, icon: 'plate', description: 'Pounded yam with egusi soup — in Ekiti, a matter of honour.' },
    { id: 'ekiti-corn', name: 'Roast corn', category: 'food', basePrice: 500, consumable: true, nutrition: 16, icon: 'snack', description: 'Fresh corn roasted on the coals by the road.' },
    { id: 'ekiti-kola', name: 'Kola nuts', category: 'food', basePrice: 600, consumable: true, nutrition: 4, icon: 'snack', description: 'Red and white kola from the Ekiti hills — for guests and for prayers.' },
    { id: 'ikogosi-water', name: 'Spring water', category: 'drink', basePrice: 300, consumable: true, nutrition: 4, icon: 'bottle', description: 'Cold water from the hill, bottled down the road.' },
    { id: 'cocoa-butter', name: 'Cocoa butter', category: 'goods', basePrice: 2500, icon: 'bottle', description: 'Raw cocoa butter from Ekiti beans — for skin, and for cooking.' },
    { id: 'ekiti-aso-oke', name: 'Hand-woven cloth', category: 'souvenir', basePrice: 9000, icon: 'bag', description: 'Narrow strips woven on a hand loom and sewn into a wrapper.' },
    { id: 'woven-mat', name: 'Woven mat', category: 'goods', basePrice: 4000, icon: 'bag', description: 'A rolled sleeping mat woven from reeds in the hill villages.' },
  ],

  jobs: [
    {
      id: 'cocoa-run',
      title: 'Cocoa Run',
      summary: 'Carry Pa Ojo’s sack of dried cocoa beans up the road to Baba Tayo’s store by the resort gate.',
      giverNpcId: 'pa-ojo',
      dropoffNpcId: 'baba-tayo',
      cargo: 'Sack of dried cocoa beans',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 700 },
      cooldownMs: 25_000,
    },
    {
      id: 'springs-walk',
      kind: 'tour',
      tour: { stops: ['iko-warm', 'iko-cold', 'iko-meet'] },
      requires: { discovered: ['iko-warm', 'iko-cold', 'iko-meet'] },
      title: 'Springs Walk',
      summary: 'Guide Seyi to the warm spring, the cold spring and the place where they meet, in that order.',
      giverNpcId: 'seyi',
      dropoffNpcId: 'seyi',
      cargo: 'Guiding Seyi',
      timeLimitMs: 220_000,
      reward: 3800,
      bonus: { underMs: 160_000, amount: 1200 },
      cooldownMs: 120_000,
    },
  ],

  startingMoney: 0,
};
