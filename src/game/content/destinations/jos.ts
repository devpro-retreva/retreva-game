import type { DestinationPack } from '../types';

/**
 * Jos — the city centre around Terminus, up on the Jos Plateau (fictional businesses; the National Museum, the
 * Museum of Traditional Nigerian Architecture, the highland farm produce and the Shere Hills are real). It is cooler
 * up here, the light is greener, and at the end of the street granite boulders pile up in front of the Shere Hills.
 * Pa Gyang brings Irish potatoes and strawberries in from his farm for Mama Rifkatu's produce stall; Mama Rifkatu
 * takes helpers at the busy hour (a stall shift — trading, not cooking); Nanret sells knitted caps, Nok-style
 * terracottas and plateau honey (bargain); Ladi, on holiday from Lagos, wants a guide. Buses back to Abuja leave from
 * the park at the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const jos: DestinationPack = {
  id: 'jos-terminus',
  name: 'Jos',
  area: 'Terminus',
  tagline: 'Terminus — cool plateau air, strawberries and Irish potatoes, the museum, and granite hills at the end of the road.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  // cooler, greener light than the coast
  palette: {
    sky: '#d6dccb',
    fog: '#c9d0c0',
    ground: '#76825a',
    road: '#3a3a38',
    roadLine: '#efe8d4',
    sidewalk: '#c4c0ae',
    gutter: '#4f4d48',
    sun: '#fff2d6',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.45, crowd: 0.5, horns: 2 },
  vista: 'north',
  vistaStyle: 'boulders',
  landmarks: [
    { id: 'jos-museum', name: 'National Museum, Jos', blurb: 'Founded in 1952: Nok terracotta heads more than two thousand years old, pottery from across Nigeria, and the story of the plateau’s tin mines.', position: [-4.6, -10], radius: 4 },
    { id: 'jos-motna', name: 'Museum of Traditional Nigerian Architecture', blurb: 'Beside the museum, life-size buildings from across Nigeria — from a stretch of Kano’s walls to a Tiv village.', position: [-4.6, 6], radius: 4 },
    { id: 'jos-produce', name: 'Highland produce market', blurb: 'The cool plateau grows what the hot lowlands can’t: Irish potatoes, strawberries, cabbages and carrots for half of Nigeria.', position: [4.6, -12], radius: 5 },
    { id: 'jos-shere', name: 'View to the Shere Hills', blurb: 'The granite range east of the city, rising to about 1,800 m — hikers and climbers come for the rocks and the view.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Mama Rifkatu', text: 'Welcome to Jos — bring a sweater! My produce stall is at the market. If you want work, the busy hour always needs hands.' },

  buildings: [
    { id: 'j-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#d9d0bc', trim: '#3d5f3a', roof: '#5f6a5a', storeys: 2 },
    { id: 'j-e2', position: [E, -23.6], size: [10.4, 6.4, D], facing: 'west', wall: '#e8e0cc', trim: '#2c5f9e', roof: '#5f6a5a', storeys: 2,
      awning: '#2c5f9e', sign: { text: 'PLATEAU PHONES', sub: 'PHONES · CHARGERS · REPAIRS', bg: '#ffffff', fg: '#2c5f9e' } },
    { id: 'j-e3', position: [E, -12.6], size: [12, 3.4, D], facing: 'west', wall: '#d2c0a0', trim: '#8d3b2a', roof: '#5f6a5a', storeys: 1,
      awning: '#c0392b', businessId: 'rifkatu-stall', sign: { text: 'RIFKATU FRESH PRODUCE', sub: 'STRAWBERRIES · POTATOES · CABBAGE', bg: '#c0392b', fg: '#fff6e0' } },
    { id: 'j-e4', position: [E, -1.4], size: [10.4, 3.4, D], facing: 'west', wall: '#c8b8a0', trim: '#7a3b72', roof: '#5f6a5a', storeys: 1,
      awning: '#7a3b72', businessId: 'nanret-crafts', sign: { text: 'NANRET CRAFTS', sub: 'KNITWEAR · TERRACOTTA · HONEY', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'j-e5', position: [E, 9.6], size: [10.4, 9.4, D], facing: 'west', wall: '#efe8d8', trim: '#4a5a72', roof: '#5f6a5a', storeys: 3, balcony: true,
      sign: { text: 'TERMINUS ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#4a5a72' } },
    { id: 'j-e6', position: [E, 21.6], size: [10.4, 6.4, D], facing: 'west', wall: '#c97b63', trim: '#fff2e2', roof: '#5f6a5a', storeys: 2 },
    { id: 'j-e7', position: [E, 33.6], size: [10.4, 6.4, D], facing: 'west', wall: '#d9cbb3', trim: '#1f6f4a', roof: '#5f6a5a', storeys: 2 },

    { id: 'j-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2dcc8', trim: '#1f6f4a', roof: '#5f6a5a', storeys: 2 },
    // the museum: low stone walls and a broad roof
    { id: 'j-w2', position: [W, -11], size: [18, 6.4, D], facing: 'east', wall: '#cfc6b2', trim: '#5b3a24', roof: '#6a5a4a', storeys: 2,
      sign: { text: 'NATIONAL MUSEUM', sub: 'JOS · NOK TERRACOTTAS · TIN MINING', bg: '#5b3a24', fg: '#f2e2c0' } },
    // the architecture museum: a mud-walled compound front
    { id: 'j-w3', position: [W, 5.6], size: [12, 3.4, D], facing: 'east', wall: '#b98a5e', trim: '#6a4a2e', roof: '#8a6a3e', storeys: 1,
      sign: { text: 'TRADITIONAL ARCHITECTURE', sub: 'OPEN-AIR MUSEUM', bg: '#6a4a2e', fg: '#f6efe2' } },
    { id: 'j-w4', position: [W, 17], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#5f6a5a', storeys: 1,
      awning: '#1f6f4a', sign: { text: 'ACHA & SOUP', sub: 'ACHA · VEGETABLE SOUP · KUNU', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'j-w5', position: [W, 27.4], size: [10.4, 6.4, D], facing: 'east', wall: '#e9e1cf', trim: '#c0392b', roof: '#5f6a5a', storeys: 2,
      awning: '#c0392b', sign: { text: 'TERMINUS MOTOR PARK', sub: 'ABUJA · BAUCHI · KADUNA', bg: '#c0392b', fg: '#ffffff' } },
    { id: 'j-w6', position: [W, 38], size: [8, 3.4, D], facing: 'east', wall: '#e8e6e0', trim: '#c0392b', roof: '#5f6a5a', storeys: 1 },
  ],

  props: [
    // the produce market spills onto the pavement: crates of potatoes and strawberries
    { id: 'stall-produce', kind: 'stall', position: [6.0, -15.6], rotation: -Math.PI / 2, color: '#c0392b', collide: true },
    { id: 'crates-1', kind: 'crates', position: [6.4, -19.6], collide: true },
    { id: 'crates-2', kind: 'crates', position: [6.4, -8.4], color: '#8a5634', collide: true },
    { id: 'um-1', kind: 'umbrella', position: [5.6, -5.6], color: '#2f6b3a' },
    // a granite boulder by the museum (Jos is a city of rocks)
    { id: 'tree-1', kind: 'tree', position: [-6.2, -24], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, 4], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 12], collide: true },
    { id: 'park-bus', kind: 'danfo', position: [3.9, 31], rotation: 0, color: '#e8e6e0', collide: true },
  ],

  npcs: [
    {
      id: 'pa-gyang',
      name: 'Pa Gyang',
      role: 'Farmer',
      personality: 'Weathered, patient, proud of the plateau’s cool soil.',
      position: [-5.0, -21.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#3d5f3a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#2a2a2a', height: 1.74 },
      promptVerb: 'Talk to',
      hours: [6, 17],
      social: {
        lines: [
          'Up here potatoes grow like they do in Europe. The cold is our gift.',
          'Strawberries in Nigeria — people don’t believe until they taste.',
          'My father mined tin. I farm. The ground gave us both.',
        ],
        likes: ['acha-soup', 'jos-knit-cap', 'kunu-zaki'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'potato-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'potato-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Mama Rifkatu is waiting for my potatoes and strawberries. Carry the basket across to her stall — the red awning.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'potato-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Mama Rifkatu. Reach her inside thirty seconds and she adds ₦750 — strawberries don’t wait.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'potato-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, the red awning.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you. The next load is still coming down from the farm — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-rifkatu',
      name: 'Mama Rifkatu',
      role: 'Produce seller',
      personality: 'Brisk, warm, wrapped in two cardigans; never forgets a customer’s order.',
      position: [5.0, -13.0],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#c0392b', bottom: '#2c5f9e', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#2f6b3a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [7, 19],
      social: {
        lines: [
          'Lagos people come and buy strawberries like gold. Then they ask for the price again.',
          'Cabbage for the coleslaw, carrots for the salad, potatoes for everything.',
          'In harmattan it is so cold here, we wear wool. In Nigeria!',
        ],
        likes: ['jos-knit-cap', 'plateau-honey', 'bole-fish'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'potato-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Fresh from the farms! Strawberries, Irish potatoes, roasted corn — or stand with me: the busy hour is coming.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'rifkatu-stall' } },
              { label: 'Help at the stall (shift)', action: { kind: 'startShift', shiftId: 'produce-stall' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Pa Gyang’s basket! The strawberries are perfect. Bring it.',
            options: [
              { label: 'Hand over the basket', action: { kind: 'deliverJob', jobId: 'potato-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'nanret',
      name: 'Nanret',
      role: 'Craft seller',
      personality: 'Knits while she talks; knows every potter on the plateau.',
      position: [5.0, -1.4],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.66 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'Everyone who comes to Jos buys a cap. Everyone who stays buys two.',
          'These terracottas are new — made in the old Nok style, not dug up. The old ones belong in the museum.',
          'Plateau honey tastes of the hills. Try it on bread.',
        ],
        likes: ['acha-soup', 'strawberries', 'pelete-bite'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Knitted caps for the cold, terracottas in the Nok style, plateau honey. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'nanret-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ladi',
      name: 'Ladi',
      role: 'Visitor',
      personality: 'On holiday from Lagos, visiting her aunt; packed for the wrong weather.',
      position: [-4.8, 22],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'puff', accessory: 'glasses', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'I brought sandals. Everyone here is in jackets. Lesson learnt.',
          'My aunt says Jos used to be called the home of peace and tourism. I can see why.',
          'Strawberries for breakfast! I am never going back to Lagos.',
        ],
        likes: ['strawberries', 'jos-knit-cap', 'kunu-zaki'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'plateau-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'plateau-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'plateau-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'plateau-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — I’m Ladi, on holiday from Lagos. Will you show me round? The museum, the old buildings next door, then the produce market.',
            options: [
              { label: 'Guide Ladi', action: { kind: 'acceptJob', jobId: 'plateau-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,800 — and ₦1,200 more if we’re done before it gets cold this evening. Walk, I’m still in sandals.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'plateau-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows Jos — the museum, the old buildings, the produce market. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — slowly, these sandals.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Nok heads two thousand years old, then strawberries. Best day of my holiday. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'plateau-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! Tomorrow my aunt is taking me to the Wildlife Park.',
            options: [{ label: 'Enjoy', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'conductor-dauda',
      name: 'Dauda',
      role: 'Bus conductor',
      personality: 'Wears a scarf in all weather; calls every passenger “my brother”.',
      position: [-4.8, 32.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#c0392b', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Abuja four and a half hours, down off the plateau. Your ears will pop.',
          'The road to Jos climbs and climbs. Then suddenly — cold.',
          'Jos people are calm. Even our traffic wears a jacket.',
        ],
        likes: ['kunu-zaki', 'roast-corn', 'gala'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Abuja! Abuja! One chance remaining — enter, my brother!',
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
    { id: 'jw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#4a5a72', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#2a2a2a' }, path: [[-5.4, 30], [-5.4, -34], [-5.4, 30]], speed: 1.1 },
    { id: 'jw-2', look: { gender: 'female', skin: '#6b4026', top: '#2f6b3a', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#7a3b72' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'jos-unplugged',
      name: 'Rock City Unplugged',
      kind: 'concert',
      venue: 'The museum lawn',
      description: 'Guitars, a drum and a crowd in jackets on the museum lawn — Jos has always had a music scene, and the cool evening suits it.',
      hours: [18, 22],
      everyDays: 2,
      price: 3000,
      joy: 26,
      energy: 6,
    },
  ],
  spots: [
    { id: 'jos-unplugged-gate', kind: 'event', position: [-5.6, -18], label: 'Rock City Unplugged', verb: 'Go to', eventId: 'jos-unplugged' },
    { id: 'terminus-bench', kind: 'bench', position: [-5.6, 12], label: 'Bench by the museum', verb: 'Rest on' },
    { id: 'terminus-room-door', kind: 'home', position: [6.2, 9.6], label: 'Terminus Rooms', verb: 'Check', homeId: 'terminus-room' },
  ],
  homes: [
    { id: 'terminus-room', name: 'Terminus room', description: 'A room with a thick blanket — you’ll need it — and the granite hills out of the window. Pay once for your stay — or buy it.', moveInCost: 7000, buyPrice: 80000 },
  ],

  businesses: [
    {
      id: 'rifkatu-stall',
      name: 'Rifkatu Fresh Produce',
      kind: 'food',
      ownerNpcId: 'mama-rifkatu',
      greeting: 'From the plateau farms.',
      stock: [
        { itemId: 'strawberries', price: 1500 },
        { itemId: 'roast-corn', price: 500 },
        { itemId: 'acha-soup', price: 2200 },
        { itemId: 'kunu-zaki', price: 400 },
      ],
    },
    {
      id: 'nanret-crafts',
      name: 'Nanret Crafts',
      kind: 'market',
      ownerNpcId: 'nanret',
      greeting: 'Made on the plateau.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'jos-knit-cap', price: 2500 },
        { itemId: 'nok-style-head', price: 8000 },
        { itemId: 'plateau-honey', price: 3000 },
      ],
    },
  ],

  items: [
    { id: 'strawberries', name: 'Jos strawberries', category: 'food', basePrice: 1500, consumable: true, nutrition: 15, icon: 'snack', description: 'A punnet of sweet highland strawberries — grown up here because it is cool enough.' },
    { id: 'roast-corn', name: 'Roasted corn', category: 'food', basePrice: 500, consumable: true, nutrition: 18, icon: 'snack', description: 'Charred on the coals, eaten in the cool evening air.' },
    { id: 'acha-soup', name: 'Acha & vegetable soup', category: 'food', basePrice: 2200, consumable: true, nutrition: 45, icon: 'plate', description: 'Acha (fonio), the plateau’s tiny ancient grain, with a green vegetable soup.' },
    { id: 'kunu-zaki', name: 'Kunu zaki', category: 'drink', basePrice: 400, consumable: true, nutrition: 10, icon: 'cup', description: 'Sweet, spiced millet drink, served cool.' },
    { id: 'jos-knit-cap', name: 'Knitted cap', category: 'clothing', basePrice: 2500, icon: 'bag', description: 'A warm wool cap for plateau evenings and harmattan mornings.' },
    { id: 'nok-style-head', name: 'Nok-style terracotta', category: 'souvenir', basePrice: 8000, icon: 'key', description: 'A new terracotta head made in the style of the ancient Nok culture — the real ones are in the museum.' },
    { id: 'plateau-honey', name: 'Plateau honey', category: 'goods', basePrice: 3000, icon: 'bag', description: 'A jar of dark honey from the hills.' },
  ],

  jobs: [
    {
      id: 'potato-run',
      title: 'Potato Run',
      summary: "Carry Pa Gyang's basket of Irish potatoes and strawberries across the road to Mama Rifkatu's produce stall.",
      giverNpcId: 'pa-gyang',
      dropoffNpcId: 'mama-rifkatu',
      cargo: 'Basket of potatoes and strawberries',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 750 },
      cooldownMs: 25_000,
    },
    {
      id: 'plateau-walk',
      kind: 'tour',
      tour: { stops: ['jos-museum', 'jos-motna', 'jos-produce'] },
      requires: { discovered: ['jos-museum', 'jos-motna', 'jos-produce'] },
      title: 'Plateau Walk',
      summary: 'Guide Ladi to the National Museum, the Museum of Traditional Nigerian Architecture and the produce market, in that order. She’s in sandals — don’t lose her.',
      giverNpcId: 'ladi',
      dropoffNpcId: 'ladi',
      cargo: 'Guiding Ladi',
      timeLimitMs: 220_000,
      reward: 3800,
      bonus: { underMs: 160_000, amount: 1200 },
      cooldownMs: 120_000,
    },
  ],

  shifts: [
    {
      id: 'produce-stall',
      title: 'Produce stall shift',
      npcId: 'mama-rifkatu',
      skill: 'trading',
      labels: { skill: 'Market trading', hint: 'Read what the customer wants, hand over the right produce before they walk off.' },
      dishes: [
        { id: 'strawberries', name: 'Strawberries', icon: 'snack' },
        { id: 'potatoes', name: 'Irish potatoes', icon: 'bag' },
        { id: 'cabbage', name: 'Cabbage', icon: 'plate' },
        { id: 'carrots', name: 'Carrots', icon: 'snack' },
      ],
      orders: 8,
      seconds: 5,
      perLevel: 0.6,
      payPerOrder: 220,
      perfectTip: 450,
      energyCost: 16,
      minEnergy: 20,
      staffMeal: 25,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
