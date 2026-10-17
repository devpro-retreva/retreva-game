import type { DestinationPack, Vec2 } from '../types';

/**
 * Yankari — Wikki Camp, the tourist camp inside Yankari Game Reserve (fictional businesses and people; the reserve,
 * Wikki Camp, the Wikki Warm Spring, the Gaji River and its elephants, baboons, kob, buffalo, warthogs and hippos are
 * real). A dirt camp road between low chalets; the warm spring opens off the east side; at the north end the camp
 * gate lets the game-drive track out into the savanna and down to the river. Game drives (a ride: you sit in the
 * open truck and it carries you round the track and back) leave from Ranger Bala's post. Mama Asabe needs towels
 * carried down to the spring; Mama Saratu cooks; Malam Sani sells carvings and fans (bargain). Buses back to Jos
 * leave from the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const CHALET = '#e6dcc4';
const ROOF = '#7a5a3a';

/** The game drive: out of the camp gate, west through the grass, along the river and back in. */
const TRACK: Vec2[] = [
  [3.4, -28], [2.4, -42], [0, -50], [-12, -58], [-30, -66], [-48, -76], [-40, -84], [-20, -84], [0, -83],
  [20, -82], [38, -76], [46, -62], [32, -52], [14, -50], [3, -46], [-2.4, -42], [-2.8, -33],
];

export const yankari: DestinationPack = {
  id: 'yankari-wikki',
  name: 'Yankari',
  area: 'Wikki Camp',
  tagline: 'Wikki Camp — game drives through the savanna, elephants at the river, baboons in camp and a warm spring to swim in.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  // savanna light: a pale, dusty sky over dry grass
  palette: {
    sky: '#dfe2cf',
    fog: '#d4d3b6',
    ground: '#b48a5c',
    road: '#9a7550',
    roadLine: '#d9c49c',
    sidewalk: '#c8b08a',
    gutter: '#6b5a44',
    sun: '#fff1cf',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'sand' },
  ambience: { traffic: 0.05, crowd: 0.3, horns: 0 },
  vista: 'north',
  backdrop: 'reserve',
  landmarks: [
    { id: 'yk-spring', name: 'Wikki Warm Spring', blurb: 'A clear spring that wells up at about 31 °C all year round and runs into the Gaji River — Yankari’s famous swimming spot, open day and night.', position: [6.2, -5], radius: 4 },
    { id: 'yk-gate', name: 'Camp gate to the savanna', blurb: 'Beyond the gate the grass runs down to the Gaji River. In the dry season the reserve’s elephants come to the river to drink.', position: [0, -39], radius: 4 },
  ],
  welcome: { from: 'Ranger Bala', text: 'Welcome to Yankari! Game drives leave from my post by the camp gate, mornings and afternoons. The baboons will try to steal your breakfast — don’t let them.' },

  buildings: [
    { id: 'y-e1', position: [E, -33], size: [12, 3.4, D], facing: 'west', wall: '#c9b98a', trim: '#4a5a2e', roof: ROOF, storeys: 1,
      awning: '#4a5a2e', sign: { text: 'RANGER POST', sub: 'GAME DRIVES · 07:00–17:00', bg: '#4a5a2e', fg: '#f6efe2' } },
    { id: 'y-e2', position: [E, -20], size: [11, 3.4, D], facing: 'west', wall: '#e8d8b4', trim: '#8a3a2a', roof: ROOF, storeys: 1,
      awning: '#8a3a2a', businessId: 'wikki-kitchen', sign: { text: 'WIKKI RESTAURANT', sub: 'TUWO · GUINEA FOWL · ZOBO', bg: '#8a3a2a', fg: '#fff6e0' } },
    // the spring opens off the street between z -12 and +2
    { id: 'y-e3', position: [E, 9], size: [10.4, 3.4, D], facing: 'west', wall: CHALET, trim: '#5b3a24', roof: ROOF, storeys: 1,
      sign: { text: 'WIKKI CHALETS', sub: 'ROOMS · BY THE NIGHT', bg: '#ffffff', fg: '#5b3a24' } },
    { id: 'y-e4', position: [E, 21.6], size: [10.4, 3.4, D], facing: 'west', wall: CHALET, trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'y-e5', position: [E, 34], size: [10.4, 3.4, D], facing: 'west', wall: '#ddd0b2', trim: '#5b3a24', roof: ROOF, storeys: 1 },

    { id: 'y-w1', position: [W, -34], size: [10, 3.4, D], facing: 'east', wall: '#e0d6c0', trim: '#2c5f9e', roof: ROOF, storeys: 1,
      sign: { text: 'CAMP LAUNDRY', sub: 'TOWELS · LINEN', bg: '#2c5f9e', fg: '#ffffff' } },
    { id: 'y-w2', position: [W, -21], size: [11, 3.4, D], facing: 'east', wall: '#d6c49c', trim: '#7a3b72', roof: ROOF, storeys: 1,
      awning: '#7a3b72', businessId: 'sani-curios', sign: { text: 'YANKARI CURIOS', sub: 'CARVINGS · FANS · T-SHIRTS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'y-w3', position: [W, -6], size: [12, 6.4, D], facing: 'east', wall: '#efe4cc', trim: '#4a5a2e', roof: ROOF, storeys: 2,
      sign: { text: 'WIKKI CAMP', sub: 'RECEPTION · GATE FEES', bg: '#4a5a2e', fg: '#f6efe2' } },
    { id: 'y-w4', position: [W, 9], size: [10.4, 3.4, D], facing: 'east', wall: CHALET, trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'y-w5', position: [W, 22], size: [10.4, 3.4, D], facing: 'east', wall: '#ddd0b2', trim: '#5b3a24', roof: ROOF, storeys: 1 },
    { id: 'y-w6', position: [W, 35], size: [10, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: ROOF, storeys: 1,
      sign: { text: 'BUSES', sub: 'BAUCHI · JOS', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    { id: 'spring', kind: 'spring', position: [12, -5], collide: true },
    { id: 'truck-parked', kind: 'safaritruck', position: [-2.8, -4], rotation: 0, collide: true },
    { id: 'tree-1', kind: 'tree', position: [6.3, 14], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.2, 15], collide: true },
    { id: 'baobab-camp', kind: 'baobab', position: [17, -14] },
    { id: 'acacia-camp', kind: 'acacia', position: [18, 3] },
    { id: 'bench-1', kind: 'bench', position: [6.3, 27], collide: true },
    { id: 'baboons-camp', kind: 'baboon', position: [-15, 15] },
    // out in the reserve, along the drive (kept off the track — a unit test checks)
    { id: 'baboons', kind: 'baboon', position: [-2, -58], rotation: 1.2 },
    { id: 'kob', kind: 'antelope', position: [-27, -56], rotation: -0.6, color: '#c99a5c' },
    { id: 'elephants', kind: 'elephant', position: [-53, -86], rotation: 0.6 },
    { id: 'hippos', kind: 'hippo', position: [-6, -93], rotation: 0.3 },
    { id: 'buffalo', kind: 'buffalo', position: [30, -68], rotation: 2.4 },
    { id: 'warthogs', kind: 'warthog', position: [22, -56], rotation: -1.4 },
    { id: 'baobab-1', kind: 'baobab', position: [16, -66] },
    { id: 'acacia-1', kind: 'acacia', position: [-20, -48] },
    { id: 'acacia-2', kind: 'acacia', position: [-38, -58] },
    { id: 'acacia-3', kind: 'acacia', position: [50, -48] },
  ],

  npcs: [
    {
      id: 'ranger-bala',
      name: 'Ranger Bala',
      role: 'Ranger',
      personality: 'Twenty years in the reserve; speaks softly, sees everything, and counts the elephants like family.',
      position: [5.6, -30.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#5b6b3a', bottom: '#5b6b3a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#4a5a2e', height: 1.8 },
      promptVerb: 'Talk to',
      hours: [6, 19],
      social: {
        lines: [
          'In the dry season the elephants walk down to the Gaji to drink. That is when we see the most.',
          'The baboons in camp are clever. Close your chalet window or they will open it for you.',
          'Nothing is promised on a game drive. The bush shows you what it wants.',
        ],
        likes: ['guinea-fowl', 'yk-zobo', 'kunu-zaki'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Game drives leave from the gate here, from seven in the morning until five. Book a seat in the Events app, or pay at the gate — the truck goes out past the river and back, about two hours.',
            options: [
              { label: 'What might we see?', action: { kind: 'goto', node: 'see' } },
              { label: 'Thanks', action: { kind: 'close' } },
            ],
          },
          see: {
            text: 'Baboons first, always. Kob in the grass, buffalo, warthogs. Hippos in the river. And if we are lucky, elephants drinking. Sit still and watch both sides.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-asabe',
      name: 'Mama Asabe',
      role: 'Laundry',
      personality: 'Runs the camp laundry like an army camp; warm once you’ve worked for her.',
      position: [-5.2, -38.4],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#2c5f9e', bottom: '#2c5f9e', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Everyone wants a towel at the spring and nobody brings it back.',
          'The water is warm even in harmattan. My knees thank God for it.',
          'I hang the sheets early — by noon the sun has done my work.',
        ],
        likes: ['miyan-taushe', 'yk-zobo', 'fulani-fan'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'towel-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'towel-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Baba Yusuf at the spring has run out of towels again. Carry this bundle down to him — past the restaurant, where the trees open.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'towel-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,000 from Baba Yusuf, and ₦600 more if you’re there in thirty seconds — people are dripping.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'towel-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go, go — the spring is on the right, after the restaurant.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you, my dear. The next load is still drying.',
            options: [{ label: 'Later then', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'baba-yusuf',
      name: 'Baba Yusuf',
      role: 'Spring attendant',
      personality: 'Has watched over the spring for thirty years; knows every swimmer’s face.',
      position: [5.4, -10.6],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#5a3420', top: '#e8e6e0', bottom: '#4a5a2e', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#e8e6e0', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [6, 22],
      social: {
        lines: [
          'Thirty-one degrees, morning or midnight. The spring does not change.',
          'Swim, then rest. The water takes the road out of your bones.',
          'Elephants? Once one came to drink right here at night. Only once.',
        ],
        likes: ['yk-zobo', 'guinea-fowl', 'wood-elephant'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'towel-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome to Wikki. The steps are on the left — the water is warm. Swim as long as you like.',
            options: [{ label: 'Thank you', action: { kind: 'close' } }],
          },
          report: {
            text: 'Towels! Asabe has saved me. Put them here.',
            options: [
              { label: 'Hand over the towels', action: { kind: 'deliverJob', jobId: 'towel-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-saratu',
      name: 'Mama Saratu',
      role: 'Cook',
      personality: 'Feeds rangers, drivers and tourists alike; proud of her miyan taushe.',
      position: [5.2, -18],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#8a3a2a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#8a3a2a', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [7, 21],
      social: {
        lines: [
          'Miyan taushe — pumpkin and groundnut. In Bauchi we make it sweet and strong.',
          'Guinea fowl from the villages outside the reserve. Never from inside — the rangers would kill me!',
          'Eat before the drive. Two hours is long on an empty stomach.',
        ],
        likes: ['wood-elephant', 'kunu-zaki', 'fulani-fan'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Tuwo and miyan taushe, grilled guinea fowl, cold zobo. Sit!',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'wikki-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'malam-sani',
      name: 'Malam Sani',
      role: 'Curio seller',
      personality: 'Carves elephants between customers and never stops talking while he does.',
      position: [-5.2, -19],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#7a3b72', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', facialHair: 'goatee', headwear: 'kufi', headColor: '#7a3b72', height: 1.75 },
      promptVerb: 'Bargain with',
      hours: [8, 19],
      social: {
        lines: [
          'This elephant took me two days. For you, a special price — but not too special.',
          'The fans are woven by Fulani women near the gate.',
          'Everyone buys the T-shirt. Be different: buy the elephant.',
        ],
        likes: ['guinea-fowl', 'miyan-taushe', 'kano-sandals'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Carved elephants, woven fans, Yankari T-shirts. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'sani-curios' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mallam-haruna',
      name: 'Mallam Haruna',
      role: 'Bus conductor',
      personality: 'Drives the Bauchi line and fills every seat before he moves.',
      position: [-4.8, 31.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#c0392b', height: 1.78 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Bauchi, then Jos. Five hours if the road is kind.',
          'The reserve road is forty kilometres of bush. Sometimes we stop for elephants.',
          'Last bus leaves when it is full. It is always full.',
        ],
        likes: ['guinea-fowl', 'yk-zobo', 'kunu-zaki'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Bauchi! Jos! Enter, enter — two seats left!',
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
    { id: 'yw-1', look: { gender: 'female', skin: '#7a4a2e', top: '#f2b705', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids', headwear: 'cap', headColor: '#4a5a2e' }, path: [[-5.6, 28], [-5.6, -12], [-5.6, 28]], speed: 0.95, stops: [{ at: 1, activity: 'photo', seconds: 8, face: 0 }] },
    { id: 'yw-2', look: { gender: 'male', skin: '#5b3622', top: '#5b6b3a', bottom: '#5b6b3a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#5b6b3a' }, path: [[3.6, 26], [3.6, -14], [3.6, 26]], speed: 1.0 },
  ],

  events: [
    {
      id: 'game-drive',
      name: 'Game drive',
      kind: 'safari',
      venue: 'Ranger post, Wikki Camp',
      description: 'Ride in the back of an open truck out of the camp gate, through the savanna and along the Gaji River, then back to camp — about two hours. Baboons, kob, buffalo, warthogs and hippos are often seen; elephants come to the river mostly in the dry season. Nothing is guaranteed.',
      hours: [7, 17],
      everyDays: 1,
      price: 7000,
      joy: 26,
      energy: 8,
      ride: {
        vehicle: 'safari-truck',
        track: TRACK,
        speed: 3.2,
        minutes: 120,
        sightings: [
          { id: 'yk-baboons', name: 'Baboons', blurb: 'Olive baboons — a troop forages at the edge of camp every morning.', position: [-2, -58], radius: 9 },
          { id: 'yk-kob', name: 'Kob', blurb: 'Western kob, the reserve’s commonest antelope, grazing in the open grass.', position: [-27, -56], radius: 11 },
          { id: 'yk-elephants', name: 'Elephants', blurb: 'Yankari holds one of the largest elephant herds left in West Africa; they drink at the Gaji in the dry season.', position: [-53, -86], radius: 13 },
          { id: 'yk-hippos', name: 'Hippos', blurb: 'Hippos spend the day in the Gaji River and come out to graze at night.', position: [-6, -93], radius: 12 },
          { id: 'yk-buffalo', name: 'Buffalo', blurb: 'West African savanna buffalo — smaller and redder than their East African cousins.', position: [30, -68], radius: 13 },
          { id: 'yk-warthogs', name: 'Warthogs', blurb: 'Warthogs trot away with their tails straight up like aerials.', position: [22, -56], radius: 9 },
        ],
      },
    },
  ],
  spots: [
    { id: 'yk-drive-gate', kind: 'event', position: [5.8, -26.4], label: 'Game drive', verb: 'Go to', eventId: 'game-drive' },
    { id: 'yk-swim', kind: 'swim', position: [6.2, -3], label: 'the warm spring', verb: 'Swim in', joy: 16 },
    { id: 'yk-bench', kind: 'bench', position: [5.6, 27], label: 'Bench by the chalets', verb: 'Rest on' },
    { id: 'wikki-chalet-door', kind: 'home', position: [6.2, 9], label: 'Wikki Chalets', verb: 'Check', homeId: 'wikki-chalet' },
  ],
  homes: [
    { id: 'wikki-chalet', name: 'Wikki chalet', description: 'A round-roofed chalet a short walk from the spring; baboons on the roof at dawn. Pay once for your stay — or buy it.', moveInCost: 9500, buyPrice: 90000 },
  ],

  businesses: [
    {
      id: 'wikki-kitchen',
      name: 'Wikki Restaurant',
      kind: 'food',
      ownerNpcId: 'mama-saratu',
      greeting: 'From Mama Saratu’s pots.',
      stock: [
        { itemId: 'miyan-taushe', price: 2200 },
        { itemId: 'guinea-fowl', price: 4500 },
        { itemId: 'yk-zobo', price: 500 },
      ],
    },
    {
      id: 'sani-curios',
      name: 'Yankari Curios',
      kind: 'market',
      ownerNpcId: 'malam-sani',
      greeting: 'Carved by hand.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'wood-elephant', price: 6500 },
        { itemId: 'fulani-fan', price: 2500 },
        { itemId: 'yankari-tee', price: 5000 },
      ],
    },
  ],

  items: [
    { id: 'miyan-taushe', name: 'Tuwo & miyan taushe', category: 'food', basePrice: 2200, consumable: true, nutrition: 46, icon: 'plate', description: 'Tuwo with miyan taushe — a pumpkin, spinach and groundnut soup from Bauchi and Gombe.' },
    { id: 'guinea-fowl', name: 'Grilled guinea fowl', category: 'food', basePrice: 4500, consumable: true, nutrition: 52, icon: 'plate', description: 'Half a guinea fowl, spiced and grilled, with jollof rice.' },
    { id: 'yk-zobo', name: 'Zobo', category: 'drink', basePrice: 500, consumable: true, nutrition: 6, icon: 'cup', description: 'Chilled hibiscus drink with ginger.' },
    { id: 'wood-elephant', name: 'Carved elephant', category: 'souvenir', basePrice: 6500, icon: 'bag', description: 'A wooden elephant, trunk raised, carved at the camp.' },
    { id: 'fulani-fan', name: 'Woven fan', category: 'souvenir', basePrice: 2500, icon: 'bag', description: 'A round fan woven from grass and leather by Fulani women near the reserve gate.' },
    { id: 'yankari-tee', name: 'Yankari T-shirt', category: 'clothing', basePrice: 5000, icon: 'bag', description: 'Olive green, with an elephant on the front.' },
  ],

  jobs: [
    {
      id: 'towel-run',
      title: 'Towel Run',
      summary: 'Carry a bundle of fresh towels from Mama Asabe’s laundry down to Baba Yusuf at the warm spring.',
      giverNpcId: 'mama-asabe',
      dropoffNpcId: 'baba-yusuf',
      cargo: 'Bundle of towels',
      timeLimitMs: 60_000,
      reward: 2000,
      bonus: { underMs: 30_000, amount: 600 },
      cooldownMs: 25_000,
    },
  ],

  startingMoney: 0,
};
