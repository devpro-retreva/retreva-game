import type { DestinationPack } from '../types';

/**
 * Calabar — the Marina on the Calabar River (fictional businesses; the Slave History Museum, the Old
 * Residency and the Carnival are real). The road runs along the river: buildings on the west, the old port
 * front and a boardwalk to the east. Ekaette brings afang leaves from Watt Market for Mma Affiong's chop
 * house; Tolani from Lagos wants a guide for her carnival video; Nsa sells raffia and carvings (bargain).
 * Carnival bands rehearse on the Marina in the evenings — the full Carnival fills the city every December.
 * The slave-trade history is told plainly and is never the object of a job.
 */

const W = -11.2;
const D = 8;

export const calabar: DestinationPack = {
  id: 'calabar-marina',
  name: 'Calabar',
  area: 'Marina',
  tagline: 'The Marina — the old river port, afang and edikang ikong, and carnival drums at night.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  // the road and the riverside strip, plus the boardwalk out over the water (the strips overlap so you can walk on)
  walkable: [[-6.9, -42, 9.2, 42], [6.5, -21.1, 16.2, -18.9]],
  walls: [],
  palette: {
    sky: '#e6d6ae',
    fog: '#d8cba6',
    ground: '#8f8a5c',
    road: '#383735',
    roadLine: '#f4f0e6',
    sidewalk: '#c8c0ad',
    gutter: '#4f4a45',
    sun: '#ffe8bc',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.3, crowd: 0.45, horns: 2, waves: 0.3 },
  sea: { fromX: 9.8 },
  landmarks: [
    { id: 'cbq-marina', name: 'The old port front', blurb: 'Calabar’s river port traded for centuries; the Marina is now a promenade where the carnival bands gather.', position: [7.6, 4], radius: 4 },
    { id: 'cbq-museum', name: 'Slave History Museum', blurb: 'By the old port, it tells the story of the Atlantic slave trade through Calabar — the people taken, and the trade’s long shadow.', position: [-6, -8], radius: 4 },
    { id: 'cbq-residency', name: 'Old Residency', blurb: 'A colonial governor’s house, made in Britain and shipped out in pieces in the 1880s — now a museum on the hill above the river.', position: [-6, -32], radius: 4 },
    { id: 'cbq-boardwalk', name: 'River boardwalk', blurb: 'Out over the Calabar River: fishing canoes, mangroves, and the creek boats heading up to Creek Town.', position: [11, -20], radius: 3 },
  ],
  welcome: { from: 'Mma Affiong', text: 'Welcome to Calabar, the People’s Paradise! My chop house is on the Marina — come and eat edikang ikong the way it should be cooked.' },

  buildings: [
    { id: 'c-w1', position: [W, -34], size: [11, 9.4, D], facing: 'east', wall: '#f1ece0', trim: '#3d5f6a', roof: '#7a4b32', storeys: 3, balcony: true,
      sign: { text: 'OLD RESIDENCY', sub: 'NATIONAL MUSEUM · UP THE HILL', bg: '#3d5f6a', fg: '#f6efe2' } },
    { id: 'c-w2', position: [W, -21], size: [10.4, 3.4, D], facing: 'east', wall: '#b9d3c7', trim: '#f4f0e6', roof: '#62564a', storeys: 1 },
    { id: 'c-w3', position: [W, -8], size: [12, 6.4, D], facing: 'east', wall: '#e9e2cf', trim: '#1d3557', roof: '#5f5246', storeys: 2,
      sign: { text: 'SLAVE HISTORY MUSEUM', sub: 'CALABAR · THE OLD PORT', bg: '#1d3557', fg: '#f6efe2' } },
    { id: 'c-w4', position: [W, 4.5], size: [9.6, 6.4, D], facing: 'east', wall: '#e3ece6', trim: '#1d5f7a', roof: '#655749', storeys: 2, balcony: true,
      sign: { text: 'MARINA FLATS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#1d5f7a' } },
    { id: 'c-w5', position: [W, 16], size: [11, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#1f6f4a', roof: '#6e5f50', storeys: 1,
      awning: '#1f6f4a', businessId: 'affiong-kitchen', sign: { text: 'MMA AFFIONG CHOP HOUSE', sub: 'EDIKANG IKONG · AFANG · FISHERMAN SOUP', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'c-w6', position: [W, 27.5], size: [10, 6.4, D], facing: 'east', wall: '#ff9f80', trim: '#f4f0e6', roof: '#6c5c4d', storeys: 2 },
    { id: 'c-w7', position: [W, 37.5], size: [8.6, 6.4, D], facing: 'east', wall: '#dfd2bb', trim: '#7a3b72', roof: '#5f5246', storeys: 2,
      awning: '#7a3b72', sign: { text: 'CARNIVAL BAND HQ', sub: 'COSTUMES · DRUMS · REHEARSALS', bg: '#7a3b72', fg: '#ffffff' } },
  ],

  props: [
    // riverside
    { id: 'boardwalk', kind: 'jetty', position: [9.2, -20], rotation: Math.PI / 2 },
    { id: 'canoe-1', kind: 'canoe', position: [13, -23.4], rotation: Math.PI / 2 },
    { id: 'canoe-2', kind: 'canoe', position: [18, -12], rotation: 1.1 },
    { id: 'canoe-3', kind: 'canoe', position: [16, -30], rotation: 2.2, color: '#e9e6df' },
    { id: 'palm-1', kind: 'palm', position: [8.6, -36], collide: true },
    { id: 'palm-2', kind: 'palm', position: [8.4, -8], collide: true },
    { id: 'palm-3', kind: 'palm', position: [8.6, 12], collide: true },
    { id: 'palm-4', kind: 'palm', position: [8.6, 34], collide: true },
    { id: 'bench-1', kind: 'bench', position: [8.0, -1], collide: true },
    // street side
    { id: 'stall-ekaette', kind: 'stall', position: [-6.1, -18.4], rotation: Math.PI / 2, color: '#1f6f4a', collide: true },
    { id: 'stall-nsa', kind: 'stall', position: [-6.1, 27.5], rotation: Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'grill-1', kind: 'grill', position: [-6.2, 12], rotation: Math.PI / 2, collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.4, 20.4], color: '#1f6f4a' },
  ],

  npcs: [
    {
      id: 'ekaette',
      name: 'Ekaette',
      role: 'Vegetable seller',
      personality: 'Early riser, sharp tongue, sweetest laugh on the Marina.',
      position: [-6.2, -16.2],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Afang leaves must be sliced thin thin, or the soup is not soup.',
          'I go to Watt Market at five every morning. The best leaves go by six.',
          'In December this road is so full you cannot see the tarmac.',
        ],
        likes: ['edikang-ikong', 'malt-drink', 'raffia-bag'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'afang-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'afang-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Mma Affiong is waiting for these afang and waterleaf before lunch. Carry the basket to her chop house — the green awning, down the Marina.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'afang-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,400 from Mma. Reach her inside thirty seconds and she adds ₦850 — the pot is already on the fire.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'afang-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Green awning, same side as me, past the flats.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you! Tomorrow’s leaves come early — check back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mma-affiong',
      name: 'Mma Affiong',
      role: 'Chop house owner',
      personality: 'Grand, warm, takes Efik cooking very seriously.',
      position: [-6.0, 18.6],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#7a3b72', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#7a3b72', accessory: 'earrings', height: 1.66 },
      promptVerb: 'Buy from',
      hours: [8, 22],
      social: {
        lines: [
          'People say Calabar women are the best cooks in Nigeria. People are correct.',
          'Edikang ikong needs patience, palm oil and periwinkle. No shortcuts.',
          'My grandmother cooked for the Obong’s guests. I still use her pot.',
        ],
        likes: ['fisherman-soup', 'efik-beads', 'drill-plush'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'afang-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome, my dear! Edikang ikong, afang with fufu, fisherman soup fresh from the river. Sit, sit.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'affiong-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Ekaette’s leaves! Fresh, fresh. Bring them, the pot is waiting.',
            options: [
              { label: 'Hand over the basket', action: { kind: 'deliverJob', jobId: 'afang-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'nsa',
      name: 'Nsa',
      role: 'Craft seller',
      personality: 'Soft-spoken carver, lets his work do the talking — until you bargain.',
      position: [-6.2, 30],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#c9583b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'locs', height: 1.78 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'I carve paddles the way the fishermen at Creek Town use them.',
          'Carnival season, I sell everything by November.',
          'You bargain like a Lagos person. I can tell.',
        ],
        likes: ['afang-soup', 'malt-drink', 'calabar-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Raffia bags, carved paddles, Efik beads — made here in Calabar. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'nsa-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'tolani',
      name: 'Tolani',
      role: 'Visitor',
      personality: 'A Lagos content creator, ring light in her bag, filming a Calabar video.',
      position: [5.6, 30],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'top-trousers', hair: 'long', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'My followers think Calabar is only Carnival. I want to show them more.',
          'This is the calmest city I have ever filmed in. Even the traffic is polite.',
          'The museum was hard to film. Some places you just put the camera down.',
        ],
        likes: ['calabar-postcard', 'edikang-ikong', 'efik-beads'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'marina-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'marina-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'marina-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'marina-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi! I’m Tolani — I make travel videos. Would you walk me through the Marina? The old port front, the museum, and the Old Residency up the hill.',
            options: [
              { label: 'Guide Tolani', action: { kind: 'acceptJob', jobId: 'marina-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 — and ₦1,250 more if we finish while the light is still good. Walk, so I can film.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'marina-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who already knows the Marina — the port front, the museum, the Old Residency. Find them first, then come back for me!',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m filming as we go!',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'That was perfect. And the museum… I’ll tell that part without music. Thank you.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'marina-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! Come back in December for the Carnival — I’ll be filming the whole route.',
            options: [{ label: 'Anytime', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'okokon',
      name: 'Okokon',
      role: 'Taxi driver',
      personality: 'Unhurried, polite, proud of the cleanest streets in Nigeria.',
      position: [-5.0, 23.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', height: 1.75 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'In Calabar we do not hoot for nothing. It is a quiet city.',
          'The airport is in town — twenty minutes, even at rush hour.',
          'Carnival week, I drive from six in the morning to two at night.',
        ],
        likes: ['fisherman-soup', 'malt-drink', 'calabar-meatpie'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Margaret Ekpang is just across town — twenty minutes. Enter.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'cw-1', look: { gender: 'male', skin: '#3f2516', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low' }, path: [[6.0, 28], [6.0, -28], [6.0, 28]], speed: 1.0, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'cw-2', look: { gender: 'female', skin: '#5a3420', top: '#f4f0e6', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#7a3b72' }, path: [[-5.4, -30], [-5.4, 34]], speed: 0.95 },
  ],

  events: [
    {
      id: 'carnival-night',
      name: 'Carnival Band Night',
      kind: 'festival',
      venue: 'The Marina, Calabar',
      description: 'The carnival bands rehearse on the Marina — costumes, drums and dancing by the river. The full Calabar Carnival fills the city every December.',
      hours: [19, 23],
      everyDays: 2,
      price: 5000,
      joy: 30,
      energy: 10,
      stage: { position: [8.2, 22], size: [3.6, 2.6], facing: -Math.PI / 2, color: '#3a2a1c', accent: '#c9583b' },
      performers: [
        { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#f2b705' },
        { gender: 'male', skin: '#3e2416', top: '#f2b705', bottom: '#1d1d1f' },
        { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#f4f0e6' },
      ],
    },
  ],
  spots: [
    { id: 'carnival-night-gate', kind: 'event', position: [5.4, 22], label: 'Carnival Band Night', verb: 'Go to', eventId: 'carnival-night' },
    { id: 'marina-bench', kind: 'bench', position: [7.2, -1], label: 'Bench by the river', verb: 'Rest on' },
    { id: 'marina-flat-door', kind: 'home', position: [-6.2, 4.5], label: 'Marina Flats', verb: 'Check', homeId: 'marina-flat' },
  ],
  homes: [
    { id: 'marina-flat', name: 'Marina flat', description: 'A bright room above the Marina with a balcony on the river and the carnival drums at night. Pay once for your stay — or buy it.', moveInCost: 10000, buyPrice: 110000 },
  ],

  businesses: [
    {
      id: 'affiong-kitchen',
      name: 'Mma Affiong Chop House',
      kind: 'food',
      ownerNpcId: 'mma-affiong',
      greeting: 'Efik cooking, done properly.',
      stock: [
        { itemId: 'edikang-ikong', price: 3000 },
        { itemId: 'afang-soup', price: 2800 },
        { itemId: 'fisherman-soup', price: 3200 },
        { itemId: 'ekpang-nkukwo', price: 2500 },
      ],
    },
    {
      id: 'nsa-crafts',
      name: 'Nsa Crafts',
      kind: 'market',
      ownerNpcId: 'nsa',
      greeting: 'Made in Calabar.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'raffia-bag', price: 6000 },
        { itemId: 'carved-paddle', price: 5000 },
        { itemId: 'efik-beads', price: 3500 },
      ],
    },
  ],

  items: [
    { id: 'edikang-ikong', name: 'Edikang ikong & fufu', category: 'food', basePrice: 3000, consumable: true, nutrition: 50, icon: 'plate', description: 'Fluted pumpkin and waterleaf soup, rich with periwinkle and meat.' },
    { id: 'afang-soup', name: 'Afang soup & fufu', category: 'food', basePrice: 2800, consumable: true, nutrition: 48, icon: 'plate', description: 'Thin-sliced afang leaves and waterleaf, the Efik classic.' },
    { id: 'fisherman-soup', name: 'Fisherman soup', category: 'food', basePrice: 3200, consumable: true, nutrition: 45, icon: 'plate', description: 'River fish and seafood in a hot, peppery broth.' },
    { id: 'ekpang-nkukwo', name: 'Ekpang nkukwo', category: 'food', basePrice: 2500, consumable: true, nutrition: 42, icon: 'plate', description: 'Grated cocoyam wrapped in cocoyam leaves, cooked with palm oil and fish.' },
    { id: 'raffia-bag', name: 'Raffia bag', category: 'bag', basePrice: 6000, icon: 'bag', description: 'Woven raffia, strong enough for market day.' },
    { id: 'carved-paddle', name: 'Carved paddle', category: 'souvenir', basePrice: 5000, icon: 'key', description: 'A small canoe paddle, carved the way the Creek Town fishermen like them.' },
    { id: 'efik-beads', name: 'Efik coral beads', category: 'souvenir', basePrice: 3500, icon: 'key', description: 'Red coral-style beads, the kind worn at Efik weddings.' },
  ],

  jobs: [
    {
      id: 'afang-run',
      title: 'Afang Run',
      summary: "Carry Ekaette's basket of afang and waterleaf down the Marina to Mma Affiong's chop house before lunch.",
      giverNpcId: 'ekaette',
      dropoffNpcId: 'mma-affiong',
      cargo: 'Basket of afang leaves',
      timeLimitMs: 60_000,
      reward: 2400,
      bonus: { underMs: 30_000, amount: 850 },
      cooldownMs: 25_000,
    },
    {
      id: 'marina-walk',
      kind: 'tour',
      tour: { stops: ['cbq-marina', 'cbq-museum', 'cbq-residency'] },
      requires: { discovered: ['cbq-marina', 'cbq-museum', 'cbq-residency'] },
      title: 'Marina Walk',
      summary: 'Guide Tolani to the old port front, the Slave History Museum and the Old Residency, in that order. She films as she walks — don’t lose her.',
      giverNpcId: 'tolani',
      dropoffNpcId: 'tolani',
      cargo: 'Guiding Tolani',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d5f7a' }],
    speed: [4, 6.5],
  },
  startingMoney: 0,
};
