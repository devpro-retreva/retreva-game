import type { DestinationPack } from '../types';

/**
 * Obudu — the ranch resort on top of the Obudu Plateau, about 1,600 m up (fictional businesses and people; the
 * plateau, the old cattle ranch, its dairy, the Grotto waterfall and the mist are real). Cool air, rolling grass,
 * stone chalets and paddocks of long-horned cattle; at the north end the upper cable-car station stands on the edge,
 * and beyond the wall the ground drops away into cloud. Pa Ushie's dairy needs milk carried to Mama Ogar's kitchen;
 * Ukpe sells honey, raffia and wool scarves (bargain); Kelechi from Port Harcourt wants a guide; there's a bonfire
 * night. Agbor at the station runs the cable car down (or a taxi down the road).
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const STONE = '#c9c2b2';
const ROOF = '#5a4636';

export const obuduRanch: DestinationPack = {
  id: 'obudu-ranch',
  name: 'Obudu',
  area: 'The Ranch',
  tagline: 'On top of the Obudu Plateau — cool mountain air, cattle in the mist, stone chalets and the Grotto waterfall.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  cableStation: { position: [2.5, -39.5], facing: 0 },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  // cool and misty: pale light, soft grey sky, green grass
  palette: {
    sky: '#dfe6e6',
    fog: '#d4dcdc',
    ground: '#6f8c4e',
    road: '#45474a',
    roadLine: '#e6e6dc',
    sidewalk: '#bdbcb2',
    gutter: '#4a4d48',
    sun: '#f4f4ec',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.05, crowd: 0.25, horns: 0 },
  vista: 'north',
  backdrop: 'highland',
  groundEdge: -48,
  landmarks: [
    { id: 'ob-ranch', name: 'The cattle ranch', blurb: 'The plateau was first ranched in 1951, when a Scottish rancher brought cattle up for the cool, tsetse-free grass. Cattle still graze the paddocks.', position: [-6, -2], radius: 5 },
    { id: 'ob-grotto', name: 'The Grotto path', blurb: 'A path down from the resort to the Grotto, a waterfall pouring into a rock pool in the forest below.', position: [6, -14], radius: 4 },
    { id: 'ob-edge', name: 'The plateau edge', blurb: 'At about 1,600 m the plateau ends in a drop of nearly a kilometre — on clear days you can see far into Cameroon.', position: [0, -39], radius: 4 },
  ],
  welcome: { from: 'Agbor', text: 'Welcome to the top! It’s cool up here — the cable car goes down from my station at the edge whenever you’re ready.' },

  buildings: [
    { id: 'or-e1', position: [E, -32], size: [12, 6.4, D], facing: 'west', wall: STONE, trim: '#3d5f3a', roof: ROOF, storeys: 2,
      sign: { text: 'RANCH RESORT', sub: 'RECEPTION', bg: '#3d5f3a', fg: '#f6efe2' } },
    // the Grotto path opens between e1 and e2
    { id: 'or-e2', position: [E, 0], size: [11, 3.4, D], facing: 'west', wall: '#e8e2d4', trim: '#8a3a2a', roof: ROOF, storeys: 1,
      awning: '#8a3a2a', businessId: 'ogar-kitchen', sign: { text: 'RANCH KITCHEN', sub: 'AFIA EFERE · YOGHURT · TEA', bg: '#8a3a2a', fg: '#fff6e0' } },
    { id: 'or-e3', position: [E, 13], size: [10.4, 3.4, D], facing: 'west', wall: STONE, trim: '#5b3a24', roof: ROOF, storeys: 1,
      sign: { text: 'RANCH CHALETS', sub: 'BY THE NIGHT', bg: '#ffffff', fg: '#5b3a24' } },
    { id: 'or-e4', position: [E, 25], size: [10.4, 3.4, D], facing: 'west', wall: STONE, trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'or-e5', position: [E, 36], size: [10, 3.4, D], facing: 'west', wall: '#d8d2c4', trim: '#5b3a24', roof: ROOF, storeys: 1 },

    { id: 'or-w1', position: [W, -32], size: [12, 3.4, D], facing: 'east', wall: '#f2efe6', trim: '#2c5f9e', roof: ROOF, storeys: 1,
      awning: '#2c5f9e', sign: { text: 'RANCH DAIRY', sub: 'MILK · YOGHURT', bg: '#2c5f9e', fg: '#ffffff' } },
    // the paddock opens between w1 and w2 (fence along the street)
    { id: 'or-w2', position: [W, 14], size: [11, 3.4, D], facing: 'east', wall: '#d6cbb2', trim: '#7a3b72', roof: ROOF, storeys: 1,
      awning: '#7a3b72', businessId: 'ukpe-crafts', sign: { text: 'UKPE CRAFTS', sub: 'HONEY · RAFFIA · WOOL', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'or-w3', position: [W, 27], size: [10.4, 3.4, D], facing: 'east', wall: STONE, trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'or-w4', position: [W, 37.5], size: [9, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: ROOF, storeys: 1,
      sign: { text: 'TAXIS', sub: 'DOWN THE MOUNTAIN', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    { id: 'upper-station', kind: 'cablestation', position: [2.5, -45], rotation: 0 },
    { id: 'fence-1', kind: 'fence', position: [-7.6, -18], rotation: 0 },
    { id: 'fence-2', kind: 'fence', position: [-7.6, -8], rotation: 0 },
    { id: 'fence-3', kind: 'fence', position: [-7.6, 2], rotation: 0 },
    { id: 'cattle-1', kind: 'cattle', position: [-14, -12], rotation: 0.8 },
    { id: 'cattle-2', kind: 'cattle', position: [-20, 2], rotation: -1.2 },
    { id: 'pine-1', kind: 'tree', position: [6.4, -20], collide: true },
    { id: 'pine-2', kind: 'tree', position: [6.4, 20], collide: true },
    { id: 'bench-1', kind: 'bench', position: [6.3, 30], collide: true },
  ],

  npcs: [
    {
      id: 'agbor-attendant',
      name: 'Agbor',
      role: 'Cable car attendant',
      personality: 'Runs the upper station; wears two jackets and still says it is cold.',
      position: [-1.6, -38.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#c0392b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#2a2a2a', height: 1.8 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Some mornings you can’t see the first pylon. Then the sun comes and the whole valley opens.',
          'Down is faster than up. The view is better too — you see where you are going.',
          'Before the cable car, everything came up that road. Even the cows.',
        ],
        likes: ['ob-hot-tea', 'ranch-yoghurt', 'corn-ube'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Going down? The cable car is ₦5,000, you pay at the bottom. Or a taxi down the hairpin road, ₦2,000.',
            options: [
              { label: 'Ride the cable car', action: { kind: 'openTravel', by: 'cable' } },
              { label: 'Take the road down', action: { kind: 'openTravel' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'pa-ushie',
      name: 'Pa Ushie',
      role: 'Dairyman',
      personality: 'Milked the ranch herd as a boy; calls every cow by name.',
      position: [-5.0, -30.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5a3420', top: '#e8e6e0', bottom: '#2c5f9e', outfit: 'shirt', hair: 'bald', facialHair: 'beard', headwear: 'cap', headColor: '#2c5f9e', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [6, 18],
      social: {
        lines: [
          'The grass up here is sweet and there are no tsetse flies. That is why the cows came.',
          'Fresh milk at six, yoghurt by noon.',
          'I have never been to Lagos. Why would I? Look at this air.',
        ],
        likes: ['corn-ube', 'ob-hot-tea', 'ob-palm-wine'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'milk-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'milk-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Mama Ogar is waiting for her milk — the yoghurt won’t make itself. Carry this churn across to the Ranch Kitchen?',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'milk-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Mama Ogar, and ₦700 more if it’s still cold when it gets there — thirty seconds.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'milk-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'The kitchen, across the road. Don’t spill!',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you. The cows are resting now — come back for the evening milking.',
            options: [{ label: 'Later then', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-ogar',
      name: 'Mama Ogar',
      role: 'Cook',
      personality: 'Cooks Efik and Bekwarra food for the resort; insists every guest has hot tea first.',
      position: [5.2, 1.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#8a3a2a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#8a3a2a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [7, 21],
      social: {
        lines: [
          'Afia efere — white soup, the Efik way. Warm for a cold mountain.',
          'The ranch yoghurt is the best in Nigeria. I am not boasting; I am reporting.',
          'Drink your tea. Everyone who comes up shivers the first night.',
        ],
        likes: ['becheve-honey', 'corn-ube', 'ranch-scarf'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'milk-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Afia efere, ranch yoghurt, hot tea. Sit down and warm up.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'ogar-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'The milk! And still cold. Put it here — I’ll start the yoghurt.',
            options: [
              { label: 'Hand over the churn', action: { kind: 'deliverJob', jobId: 'milk-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ukpe',
      name: 'Ukpe',
      role: 'Craft seller',
      personality: 'Keeps bees in the Becheve forest below the plateau and knits in the evening mist.',
      position: [-5.2, 15.6],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'top-skirt', hair: 'braids', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.66 },
      promptVerb: 'Bargain with',
      hours: [8, 19],
      social: {
        lines: [
          'The honey is from the forest at the foot of the mountain. The bees work harder than I do.',
          'Wool scarves sell themselves up here. Calabar people arrive in T-shirts.',
          'Bargain well and I will tell you where the canopy walkway is.',
        ],
        likes: ['corn-ube', 'ranch-yoghurt', 'efik-beads'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Forest honey, raffia bags, wool scarves. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'ukpe-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'kelechi',
      name: 'Kelechi',
      role: 'Visitor',
      personality: 'A Port Harcourt engineer on his first holiday in years; has packed for the beach.',
      position: [5.0, 26.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#2c5f9e', bottom: '#e8e6e0', outfit: 'top-trousers', hair: 'low', facialHair: 'goatee', height: 1.8 },
      promptVerb: 'Talk to',
      hours: [8, 18],
      social: {
        lines: [
          'I brought shorts. Nobody told me it would be cold.',
          'My mother honeymooned here in the eighties. I promised her a photo of the grotto.',
          'In Port Harcourt the air is heavy. Here you can taste it.',
        ],
        likes: ['ranch-scarf', 'ob-hot-tea', 'bole-fish'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'ranch-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'ranch-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'ranch-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'ranch-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hello! Kelechi, from Port Harcourt. Will you show me round? The Grotto path, the cattle ranch, and the edge where the cable car goes down.',
            options: [
              { label: 'Guide Kelechi', action: { kind: 'acceptJob', jobId: 'ranch-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 — and ₦1,250 more if we’re done before the mist comes in.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'ranch-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the ranch — the Grotto path, the paddocks, the edge. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — slowly, I’m out of breath at this height.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'The edge, the clouds below us… my mother will cry at these photos. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'ranch-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thanks again — I’m going to buy a scarf.',
            options: [{ label: 'Good idea', action: { kind: 'close' } }],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'orw-1', look: { gender: 'female', skin: '#7a4a2e', top: '#e8e6e0', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long' }, path: [[3.6, 30], [3.6, -24], [3.6, 30]], speed: 0.9, stops: [{ at: 1, activity: 'photo', seconds: 9, face: Math.PI }] },
  ],

  events: [
    {
      id: 'ranch-bonfire',
      name: 'Bonfire night at the ranch',
      kind: 'concert',
      venue: 'The lawn, Ranch Resort',
      description: 'A fire on the lawn against the mountain cold, a band from Obudu town playing highlife and Bekwarra songs, roast corn and hot tea.',
      hours: [19, 22],
      everyDays: 2,
      price: 3500,
      joy: 26,
      energy: 6,
    },
  ],
  spots: [
    { id: 'ranch-bonfire-gate', kind: 'event', position: [5.6, 8], label: 'Bonfire night', verb: 'Go to', eventId: 'ranch-bonfire' },
    { id: 'ranch-bench', kind: 'bench', position: [5.6, 30], label: 'Bench in the mist', verb: 'Rest on' },
    { id: 'ranch-chalet-door', kind: 'home', position: [6.2, 13], label: 'Ranch Chalets', verb: 'Check', homeId: 'ranch-chalet' },
  ],
  homes: [
    { id: 'ranch-chalet', name: 'Ranch chalet', description: 'A stone chalet with a fireplace and a view over the paddocks; cows at the window in the morning mist. Pay once for your stay — or buy it.', moveInCost: 18000, buyPrice: 150000 },
  ],

  businesses: [
    {
      id: 'ogar-kitchen',
      name: 'Ranch Kitchen',
      kind: 'food',
      ownerNpcId: 'mama-ogar',
      greeting: 'Warm food for a cold mountain.',
      stock: [
        { itemId: 'afia-efere', price: 3200 },
        { itemId: 'ranch-yoghurt', price: 900 },
        { itemId: 'ob-hot-tea', price: 500 },
      ],
    },
    {
      id: 'ukpe-crafts',
      name: 'Ukpe Crafts',
      kind: 'market',
      ownerNpcId: 'ukpe',
      greeting: 'From the mountain.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'becheve-honey', price: 3500 },
        { itemId: 'obanliku-raffia', price: 5500 },
        { itemId: 'ranch-scarf', price: 4500 },
      ],
    },
  ],

  items: [
    { id: 'afia-efere', name: 'Afia efere', category: 'food', basePrice: 3200, consumable: true, nutrition: 48, icon: 'plate', description: 'Efik white soup with goat meat and pounded yam — warm and peppery.' },
    { id: 'ranch-yoghurt', name: 'Ranch yoghurt', category: 'drink', basePrice: 900, consumable: true, nutrition: 14, icon: 'bottle', description: 'Thick yoghurt from the ranch dairy, made from this morning’s milk.' },
    { id: 'ob-hot-tea', name: 'Hot tea', category: 'drink', basePrice: 500, consumable: true, nutrition: 4, icon: 'cup', description: 'Sweet milky tea — up here, everyone drinks it.' },
    { id: 'becheve-honey', name: 'Forest honey', category: 'goods', basePrice: 3500, icon: 'bottle', description: 'Dark honey from hives in the Becheve forest below the plateau.' },
    { id: 'obanliku-raffia', name: 'Raffia basket', category: 'bag', basePrice: 5500, icon: 'bag', description: 'A lidded basket woven from raffia palm in the villages at the foot of the mountain.' },
    { id: 'ranch-scarf', name: 'Wool scarf', category: 'clothing', basePrice: 4500, icon: 'bag', description: 'A thick knitted scarf — essential after sunset on the plateau.' },
  ],

  jobs: [
    {
      id: 'milk-run',
      title: 'Milk Run',
      summary: 'Carry a churn of fresh milk from Pa Ushie’s dairy across to Mama Ogar’s Ranch Kitchen.',
      giverNpcId: 'pa-ushie',
      dropoffNpcId: 'mama-ogar',
      cargo: 'Churn of milk',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 700 },
      cooldownMs: 25_000,
    },
    {
      id: 'ranch-walk',
      kind: 'tour',
      tour: { stops: ['ob-grotto', 'ob-ranch', 'ob-edge'] },
      requires: { discovered: ['ob-grotto', 'ob-ranch', 'ob-edge'] },
      title: 'Ranch Walk',
      summary: 'Guide Kelechi to the Grotto path, the cattle ranch and the plateau edge, in that order. He’s out of breath at this height — don’t lose him.',
      giverNpcId: 'kelechi',
      dropoffNpcId: 'kelechi',
      cargo: 'Guiding Kelechi',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  startingMoney: 0,
};
