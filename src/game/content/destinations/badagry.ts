import type { DestinationPack } from '../types';

/**
 * Badagry — the marina on the lagoon, in the far west of Lagos State (fictional businesses; the public
 * monuments are real). Houses and the town's historic buildings line the west side; palms, the Agia Tree
 * monument and the fishing jetty face the lagoon to the east. Across the water, on Gberefu Island, the
 * Slave Route ends at the Point of No Return. The heritage is presented plainly and with respect: the
 * tour is a visitor learning the history, not a game played at the sites.
 */

const W = -11.2;
const D = 8;

export const badagry: DestinationPack = {
  id: 'badagry-marina',
  name: 'Lagos',
  area: 'Badagry',
  tagline: 'Badagry Marina — coconut palms, the lagoon and centuries of history.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  // the ferry from Lekki ties up at the jetty
  dock: { position: [10.4, -28], facing: -Math.PI / 2 },
  // the street and the lagoon-side strip, plus the jetty out over the water
  walkable: [[-6.9, -42, 9.2, 42], [9.0, -29.1, 16.2, -26.9]],
  walls: [],
  palette: {
    sky: '#f3d6a4',
    fog: '#e8d8bc',
    ground: '#c9ad84',
    road: '#3b3936',
    roadLine: '#e8d9b0',
    sidewalk: '#c2b49a',
    gutter: '#5a524a',
    sun: '#ffe0b0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.35, crowd: 0.4, horns: 3, waves: 0.35 },
  sea: { fromX: 9.8 },
  landmarks: [
    { id: 'bdg-museum', name: 'Heritage Museum', blurb: 'The old colonial District Office now tells the story of the Atlantic slave trade through Badagry.', position: [-6, 16], radius: 4 },
    { id: 'bdg-agia', name: 'Agia Tree monument', blurb: 'Marks where Christianity was first preached in Nigeria, in 1842.', position: [7.4, 3], radius: 3.5 },
    { id: 'bdg-storey', name: 'First Storey Building', blurb: 'Built by missionaries in 1845 — the first storey building in Nigeria.', position: [-6, -8], radius: 4 },
    { id: 'bdg-jetty', name: 'Jetty to Gberefu', blurb: 'Canoes cross the lagoon to Gberefu Island, where the Slave Route ends at the Point of No Return.', position: [9.5, -28], radius: 3.5 },
  ],
  welcome: { from: 'Mr. Hunpatin', text: 'Welcome to Badagry, one of the oldest towns in Nigeria. The Heritage Museum is open till five — come and learn what this marina has seen.' },

  buildings: [
    { id: 'b-w1', position: [W, -34], size: [10, 6.4, D], facing: 'east', wall: '#e9dcc3', trim: '#2f6e5b', roof: '#6b5a49', storeys: 2, balcony: true },
    { id: 'b-w2', position: [W, -23], size: [10.4, 3.4, D], facing: 'east', wall: '#b9d3c7', trim: '#f4f0e6', roof: '#62564a', storeys: 1 },
    { id: 'b-w3', position: [W, -8], size: [13, 6.4, D], facing: 'east', wall: '#f1ece0', trim: '#5b3a24', roof: '#7a4b32', storeys: 2, balcony: true,
      sign: { text: 'FIRST STOREY BUILDING', sub: 'BUILT BY MISSIONARIES · 1845', bg: '#5b3a24', fg: '#f6efe2' } },
    { id: 'b-w4', position: [W, 4.5], size: [9.6, 6.4, D], facing: 'east', wall: '#e3ece6', trim: '#2c5f9e', roof: '#655749', storeys: 2, balcony: true },
    { id: 'b-w5', position: [W, 16], size: [11, 6.4, D], facing: 'east', wall: '#e9e2cf', trim: '#1d3557', roof: '#5f5246', storeys: 2,
      sign: { text: 'HERITAGE MUSEUM', sub: 'BADAGRY · SLAVE TRADE HISTORY', bg: '#1d3557', fg: '#f6efe2' } },
    { id: 'b-w6', position: [W, 27.5], size: [10, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#1f6f4a', roof: '#6e5f50', storeys: 1,
      awning: '#1f6f4a', sign: { text: 'MAMA DOSSOU', sub: 'LAGOON FISH · PEPPER SOUP', bg: '#1f6f4a', fg: '#fff6e0' }, businessId: 'dossou-buka' },
    { id: 'b-w7', position: [W, 37.5], size: [8.6, 6.4, D], facing: 'east', wall: '#ff9f80', trim: '#f4f0e6', roof: '#6c5c4d', storeys: 2, balcony: true },
  ],

  props: [
    { id: 'danfo', kind: 'danfo', position: [-2.1, 30], rotation: 0, collide: true },
    { id: 'bus', kind: 'busstop', position: [-6.3, 38.4], rotation: Math.PI / 2, collide: true },
    // lagoon side
    { id: 'agia', kind: 'tree', position: [8.3, 3], collide: true },
    { id: 'jetty', kind: 'jetty', position: [9.2, -28], rotation: Math.PI / 2 },
    { id: 'canoe-1', kind: 'canoe', position: [12.6, -30.4], rotation: Math.PI / 2 },
    { id: 'ferry', kind: 'canoe', position: [14.6, -25.7], rotation: Math.PI / 2, color: '#e9e6df' },
    { id: 'canoe-2', kind: 'canoe', position: [19, -23], rotation: 1.2 },
    { id: 'canoe-3', kind: 'canoe', position: [14.5, -35], rotation: 2.0 },
    { id: 'gberefu', kind: 'arch', position: [44, -27] },
    { id: 'fish-crates', kind: 'crates', position: [6.6, -31.6], collide: true },
    { id: 'palm-1', kind: 'palm', position: [8.6, -38], collide: true },
    { id: 'palm-2', kind: 'palm', position: [8.4, -16], collide: true },
    { id: 'palm-3', kind: 'palm', position: [8.6, 10], collide: true },
    { id: 'palm-4', kind: 'palm', position: [8.6, 34], collide: true },
    { id: 'palm-5', kind: 'palm', position: [8.4, 27], collide: true },
    { id: 'bench-1', kind: 'bench', position: [8.0, -9], collide: true },
    { id: 'kiosk-1', kind: 'kiosk', position: [6.0, 24.4], rotation: -Math.PI / 2, color: '#2f6e5b', collide: true },
    // street side
    { id: 'craft-stall', kind: 'stall', position: [-6.1, -19], rotation: Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'grill-1', kind: 'grill', position: [-6.2, 23.6], rotation: Math.PI / 2, collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.4, 31.6], color: '#1f6f4a' },
    { id: 'gen-1', kind: 'generator', position: [-6.4, -28], collide: true },
  ],

  npcs: [
    {
      id: 'hunpatin',
      name: 'Mr. Hunpatin',
      role: 'Museum guide',
      personality: 'Quiet, precise, keeps the town’s stories and tells them carefully.',
      position: [-6.0, 12.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'low', facialHair: 'beard', accessory: 'glasses', height: 1.74 },
      promptVerb: 'Talk to',
      hours: [9, 17],
      social: {
        lines: [
          'My grandfather was a fisherman. I became a keeper of stories instead.',
          'Every year the diaspora comes home for the festival. The whole town fills up.',
          'Visitors speak softly in the museum. That is right.',
        ],
        likes: ['heritage-booklet', 'fish-pepper-soup', 'agbon-water'],
      },
      idle: 'sway',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Good day. I look after the stories here. What would you like to know?',
            options: [
              { label: 'Tell me about Badagry', action: { kind: 'goto', node: 'history' } },
              { label: 'What should I see?', action: { kind: 'goto', node: 'see' } },
              { label: 'Thank you', action: { kind: 'close' } },
            ],
          },
          history: {
            text: 'Badagry has traded on this lagoon for centuries. During the Atlantic slave trade, captives were held here, then taken across the water to Gberefu Island — to the Point of No Return, and the ships. The museum keeps their story so it is not forgotten.',
            options: [
              { label: 'What should I see?', action: { kind: 'goto', node: 'see' } },
              { label: 'Thank you', action: { kind: 'close' } },
            ],
          },
          see: {
            text: 'Start in the museum. Then the Agia Tree, where Christianity was first preached in Nigeria in 1842, and the First Storey Building from 1845. End at the jetty and look across the water. Take your time.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'marcus',
      name: 'Marcus',
      role: 'Visitor',
      personality: 'Thoughtful, on a heritage trip from Baltimore, writes everything down.',
      position: [5.6, 31],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#2c5f9e', bottom: '#c9b28a', outfit: 'top-trousers', hair: 'low', facialHair: 'beard', height: 1.82 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'Mr. Hunpatin read names from an old ledger in the museum. I had to sit down for a while.',
          'The coconut candy here is dangerous. I’ve had six.',
          'My grandmother always said our people came from this coast. Now I’ve seen it.',
        ],
        likes: ['heritage-booklet', 'coconut-candy', 'cowrie-bracelet'],
      },
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'heritage-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'heritage-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'heritage-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'heritage-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'I’m Marcus, from Baltimore. My family has always said our people came through this coast. Would you walk me through Badagry — the museum, the Agia Tree, the First Storey Building, and the jetty to the Point of No Return?',
            options: [
              { label: 'Guide Marcus', action: { kind: 'acceptJob', jobId: 'heritage-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,750 for your time, and ₦1,250 more if we reach the jetty before my boat leaves. Walk, though — I don’t want to rush past any of it.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'heritage-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I’m waiting for a guide who knows the museum, the Agia Tree, the First Storey Building and the jetty. Find them first, then come back for me.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on. I want to take all of this in.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Thank you. Standing at that jetty, looking across to Gberefu… I’ll carry this home with me. You’re a good guide.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'heritage-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'I’m staying in Badagry a few more days. Come and find me later — I may want to walk it again.',
            options: [{ label: 'Anytime', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'sewanu',
      name: 'Sewanu',
      role: 'Fisherman',
      personality: 'Cheerful, sunburnt, always in a hurry when the catch is in.',
      position: [8.4, -25.4],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#e4572e', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#1d7f86', height: 1.75 },
      promptVerb: 'Talk to',
      hours: [6, 18],
      social: {
        lines: [
          'In Egun we say the lagoon feeds everybody.',
          'I’ve fished this lagoon since I was twelve.',
          'When the harmattan comes, the water goes flat like glass.',
        ],
        likes: ['coconut-candy', 'agbon-water', 'zobo'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'catch-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'catch-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'The canoes are in! Mama Dossou needs this basket of croaker before the lunch crowd. You fit carry am for me?',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'catch-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,000. Reach her in thirty seconds and she adds ₦750 — fish waits for nobody.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'catch-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go, go! Mama Dossou — the buka with the green sign, up the marina!',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you o! The next canoe comes in soon — check back.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-dossou',
      name: 'Mama Dossou',
      role: 'Buka owner',
      personality: 'Warm and loud, feeds half the marina, remembers everyone’s order.',
      position: [-6.0, 27.5],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.63 },
      promptVerb: 'Buy from',
      hours: [7, 21],
      social: {
        lines: [
          'The secret of pepper soup is patience. And more pepper.',
          'Sewanu brings me the best fish on the lagoon. Don’t tell him I said so.',
          'My mother cooked on this same spot before me.',
        ],
        likes: ['chin-chin', 'zobo', 'raffia-fan'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'catch-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome, my dear! Croaker from this morning’s lagoon, pepper soup that opens your eyes, coconut candy for the road.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'dossou-buka' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Ah, Sewanu’s basket! Still jumping. Bring it here, bring it here.',
            options: [
              { label: 'Hand over the fish', action: { kind: 'deliverJob', jobId: 'catch-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ayaba',
      name: 'Ayaba',
      role: 'Craft seller',
      personality: 'Sharp-eyed and funny, strings cowries while she bargains.',
      position: [-6.2, -16.6],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#c9583b', bottom: '#2d3f8f', outfit: 'top-skirt', hair: 'braids', accessory: 'earrings', height: 1.66 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'Cowries were money here once. Now they are jewellery. Same value to me!',
          'I weave the raffia fans in the evenings, on the veranda.',
          'Visitors from Ghana and Benin Republic bargain the hardest. I respect it.',
        ],
        likes: ['adire-scarf', 'ankara-tote', 'coconut-candy'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Cowrie bracelets, raffia fans, the heritage booklet — all made here in Badagry. Make me an offer!',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'ayaba-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'kayode',
      name: 'Kayode',
      role: 'Danfo conductor',
      personality: 'Hoarse from shouting, knows every pothole between here and Mile 2.',
      position: [-4.8, 35.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f2b705', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'hightop', height: 1.77 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Badagry to Yaba? Na Mile 2 traffic go decide how long.',
          'Seme border is just down the road. Benin Republic, one hour.',
          'Weekends the marina is full of visitors. Good for business!',
        ],
        likes: ['lagoon-croaker', 'zobo', 'chin-chin'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Badagry–Mile 2–Yaba! Ikeja! Island! Lekki! Enter with your change o!',
            options: [
              { label: 'Take a danfo', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  // two passers-by and light traffic: every person is five draw calls, and the six locals with work come first
  walkers: [
    { id: 'bw-1', look: { gender: 'female', skin: '#5a3420', top: '#f4f0e6', bottom: '#1d7f86', outfit: 'dress', hair: 'braids', height: 1.64 }, path: [[5.6, 28], [5.6, -26], [5.6, 28]], speed: 0.95, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'bw-3', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#7a3b72', outfit: 'top-skirt', hair: 'puff', headwear: 'gele', headColor: '#7a3b72' }, path: [[-5.6, -6], [-5.6, 29], [-5.6, -6]], speed: 0.9, stops: [{ at: 1, activity: 'shop', seconds: 9, face: -Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'heritage-drums',
      name: 'Heritage Drums on the Marina',
      kind: 'festival',
      venue: 'Badagry Marina stage',
      description: 'Drummers and dancers by the lagoon, and the old stories of the town told between the songs. Every other evening.',
      hours: [18, 21],
      everyDays: 2,
      offsetDays: 1,
      price: 3000,
      joy: 26,
      energy: 8,
      stage: { position: [8.2, 18], size: [3.6, 2.6], facing: -Math.PI / 2, color: '#3a2a1c', accent: '#f2b705' },
      performers: [
        { gender: 'male', skin: '#3e2416', top: '#f4f0e6', bottom: '#1d1d1f' },
        { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#f2b705' },
        { gender: 'male', skin: '#4a2c1c', top: '#1d7f86', bottom: '#f4f0e6' },
      ],
    },
  ],
  spots: [
    { id: 'heritage-drums-gate', kind: 'event', position: [5.4, 18], label: 'Heritage Drums on the Marina', verb: 'Go to', eventId: 'heritage-drums' },
    { id: 'bdg-ferry', kind: 'jetty', position: [12.2, -28], label: 'ferry', verb: 'Take the' },
    { id: 'bdg-bench', kind: 'bench', position: [7.2, -9], label: 'Bench by the lagoon', verb: 'Rest on' },
    { id: 'badagry-room-door', kind: 'home', position: [-6.2, 4.5], label: 'Room by the Marina', verb: 'Check', homeId: 'badagry-room' },
  ],
  homes: [
    { id: 'badagry-room', name: 'Room by the Marina', description: 'A quiet room upstairs with a view of the lagoon and a breeze at night. Pay once for your stay — rest free whenever you like.', moveInCost: 2500, buyPrice: 30000 },
  ],

  businesses: [
    {
      id: 'dossou-buka',
      name: 'Mama Dossou Buka',
      kind: 'food',
      ownerNpcId: 'mama-dossou',
      greeting: 'Fresh from the lagoon.',
      stock: [
        { itemId: 'lagoon-croaker', price: 2200 },
        { itemId: 'fish-pepper-soup', price: 1800 },
        { itemId: 'coconut-candy', price: 300 },
        { itemId: 'agbon-water', price: 600 },
      ],
    },
    {
      id: 'ayaba-crafts',
      name: 'Ayaba Crafts',
      kind: 'market',
      ownerNpcId: 'ayaba',
      greeting: 'Made in Badagry!',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'cowrie-bracelet', price: 2000 },
        { itemId: 'raffia-fan', price: 1500 },
        { itemId: 'heritage-booklet', price: 1200 },
      ],
    },
  ],

  items: [
    { id: 'lagoon-croaker', name: 'Grilled lagoon croaker', category: 'food', basePrice: 2200, consumable: true, nutrition: 45, icon: 'plate', description: 'Caught this morning, grilled with pepper and onions.' },
    { id: 'fish-pepper-soup', name: 'Fish pepper soup', category: 'food', basePrice: 1800, consumable: true, nutrition: 35, icon: 'plate', description: 'Hot, peppery and full of fresh fish.' },
    { id: 'coconut-candy', name: 'Coconut candy', category: 'food', basePrice: 300, consumable: true, nutrition: 10, icon: 'snack', description: 'Grated coconut cooked in caramel — sweet and chewy.' },
    { id: 'agbon-water', name: 'Green coconut', category: 'drink', basePrice: 600, consumable: true, nutrition: 12, icon: 'cup', description: 'Agbon, straight off the palms that ring the town.' },
    { id: 'cowrie-bracelet', name: 'Cowrie bracelet', category: 'souvenir', basePrice: 2000, icon: 'key', description: 'Cowrie shells, once money on this coast, strung on raffia.' },
    { id: 'raffia-fan', name: 'Raffia hand fan', category: 'goods', basePrice: 1500, icon: 'bag', description: 'Woven raffia — the best air conditioner on the marina.' },
    { id: 'heritage-booklet', name: 'Badagry heritage booklet', category: 'souvenir', basePrice: 1200, icon: 'key', description: 'The town’s history: the museum, the Agia Tree, the First Storey Building and the Slave Route.' },
  ],

  jobs: [
    {
      id: 'heritage-walk',
      kind: 'tour',
      tour: { stops: ['bdg-museum', 'bdg-agia', 'bdg-storey', 'bdg-jetty'] },
      requires: { discovered: ['bdg-museum', 'bdg-agia', 'bdg-storey', 'bdg-jetty'] },
      title: 'Heritage Walk',
      summary: 'Guide Marcus to the Heritage Museum, the Agia Tree, the First Storey Building and the jetty, in that order. He walks — don’t lose him.',
      giverNpcId: 'marcus',
      dropoffNpcId: 'marcus',
      cargo: 'Guiding Marcus',
      timeLimitMs: 240_000,
      reward: 3750,
      bonus: { underMs: 170_000, amount: 1250 },
      cooldownMs: 120_000,
    },
    {
      id: 'catch-run',
      title: 'Catch Run',
      summary: "Carry Sewanu's basket of fresh croaker from the jetty to Mama Dossou's buka before the lunch crowd.",
      giverNpcId: 'sewanu',
      dropoffNpcId: 'mama-dossou',
      cargo: 'Basket of fish',
      timeLimitMs: 60_000,
      reward: 2000,
      bonus: { underMs: 32_000, amount: 750 },
      cooldownMs: 25_000,
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'keke' }, { kind: 'danfo' }],
    speed: [4, 6.5],
  },
  startingMoney: 0,
};
