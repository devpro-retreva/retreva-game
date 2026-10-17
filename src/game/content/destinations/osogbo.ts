import type { DestinationPack } from '../types';

/**
 * Osogbo — Oja Oba, the market in front of the Ataoja's palace (fictional businesses; the palace, Oja Oba, the
 * Osogbo art tradition and the Osun-Osogbo Sacred Grove are real). The street runs from the motor park past the
 * market and the artists' studios to the wall of the sacred grove at the north end, where cement sculptures stand
 * at the gate and old forest closes in. The grove is a place of worship and a World Heritage Site: you can see it
 * and learn about it, but no job ever sends you inside. Mama Folake sells yams at Oja Oba and needs a basket carried
 * to Iya Iyan's pounded-yam buka; Yinka, a batik artist, sells work (bargain) and teaches batik once you've helped
 * on the street; Kwame, an art student from Kumasi, wants a guide.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const osogbo: DestinationPack = {
  id: 'osogbo-oja-oba',
  name: 'Osogbo',
  area: 'Oja Oba',
  tagline: 'Oja Oba — the Ataoja’s palace, batik and beadwork, and the sacred grove at the end of the road.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e2d8b4',
    fog: '#d3caa4',
    ground: '#8c7e56',
    road: '#3a3734',
    roadLine: '#efe4c8',
    sidewalk: '#c6bba2',
    gutter: '#4f4a45',
    sun: '#ffe6b6',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.35, crowd: 0.55, horns: 2 },
  vista: 'north',
  vistaStyle: 'forest',
  landmarks: [
    { id: 'osg-palace', name: 'The Ataoja’s palace', blurb: 'Home of the Ataoja, the king of Osogbo, facing Oja Oba. In festival season the drummers gather in front of it.', position: [-4.6, -10], radius: 4 },
    { id: 'osg-ojaoba', name: 'Oja Oba market', blurb: 'The “king’s market” in front of the palace: yams, kola, cloth, and the beads and calabashes for the festival.', position: [4.6, -14], radius: 5 },
    { id: 'osg-artists', name: 'Artists’ street', blurb: 'Since the Oshogbo workshops of the 1960s the town has been a home of Nigerian art — batik, beadwork, painted and hammered-metal panels.', position: [4.6, 20], radius: 4 },
    { id: 'osg-grove', name: 'Gate of the Sacred Grove', blurb: 'Forest along the Osun River, sacred to the goddess Osun and a UNESCO World Heritage Site since 2005, with shrines and sculptures by Susanne Wenger and the New Sacred Art artists.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Yinka', text: 'Welcome to Osogbo! I paint batik on the artists’ street. Help Mama Folake at the market and come and see me — I’ll show you how it’s done.' },

  buildings: [
    { id: 'o-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#d9c7a4', trim: '#3d5f3a', roof: '#7a4a2e', storeys: 2 },
    { id: 'o-e2', position: [E, -23.4], size: [10.4, 3.4, D], facing: 'west', wall: '#e8dcc4', trim: '#8d3b2a', roof: '#7a4a2e', storeys: 1 },
    { id: 'o-e3', position: [E, -12.6], size: [12, 3.4, D], facing: 'west', wall: '#cdb48e', trim: '#8d3b2a', roof: '#7a4a2e', storeys: 1,
      awning: '#c9583b', sign: { text: 'OJA OBA', sub: 'YAMS · KOLA · CLOTH · BEADS', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'o-e4', position: [E, -0.6], size: [10.4, 6.4, D], facing: 'west', wall: '#e4d8c0', trim: '#2c4a7a', roof: '#7a4a2e', storeys: 2,
      sign: { text: 'OSUN ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#2c4a7a' } },
    { id: 'o-e5', position: [E, 11], size: [10.4, 6.4, D], facing: 'west', wall: '#c97b63', trim: '#fff2e2', roof: '#7a4a2e', storeys: 2,
      awning: '#1f6f4a', sign: { text: 'BEADWORK', sub: 'NECKLACES · CROWNS · BAGS', bg: '#1f6f4a', fg: '#ffffff' } },
    { id: 'o-e6', position: [E, 22], size: [10.4, 6.4, D], facing: 'west', wall: '#efe6d4', trim: '#7a3b72', roof: '#7a4a2e', storeys: 2,
      awning: '#7a3b72', businessId: 'yinka-studio', sign: { text: 'YINKA BATIK STUDIO', sub: 'BATIK · PAINTING · LESSONS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'o-e7', position: [E, 35], size: [10, 6.4, D], facing: 'west', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#7a4a2e', storeys: 2 },

    // the palace: long, low and grand, with a deep veranda
    { id: 'o-w1', position: [W, -10], size: [22, 9.4, D], facing: 'east', wall: '#e9dcc0', trim: '#7a3b2a', roof: '#6a3a26', storeys: 3, balcony: true,
      sign: { text: 'ATAOJA’S PALACE', sub: 'OSOGBO', bg: '#7a3b2a', fg: '#f4e2c0' } },
    { id: 'o-w2', position: [W, -32], size: [12, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#1f6f4a', roof: '#7a4a2e', storeys: 2 },
    { id: 'o-w3', position: [W, 7.6], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#7a4a2e', storeys: 1,
      awning: '#1f6f4a', businessId: 'iyan-buka', sign: { text: 'IYA IYAN', sub: 'POUNDED YAM · EFO · ILA', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'o-w4', position: [W, 19], size: [10.4, 6.4, D], facing: 'east', wall: '#d1b48c', trim: '#fdf3df', roof: '#7a4a2e', storeys: 2 },
    { id: 'o-w5', position: [W, 30.2], size: [10.4, 6.4, D], facing: 'east', wall: '#e9e1cf', trim: '#c0392b', roof: '#7a4a2e', storeys: 2,
      awning: '#c0392b', sign: { text: 'OSOGBO MOTOR PARK', sub: 'IBADAN · ILESA · IFE', bg: '#c0392b', fg: '#ffffff' } },
    { id: 'o-w6', position: [W, 40], size: [8, 3.4, D], facing: 'east', wall: '#e8e6e0', trim: '#c0392b', roof: '#7a4a2e', storeys: 1 },
  ],

  props: [
    // Oja Oba spills onto the pavement in front of the palace
    { id: 'stall-folake', kind: 'stall', position: [6.0, -15.6], rotation: -Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'stall-2', kind: 'stall', position: [6.0, -9.4], rotation: -Math.PI / 2, color: '#f2b705', collide: true },
    { id: 'crates-1', kind: 'crates', position: [6.4, -19.4], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [5.6, -5.6], color: '#1f6f4a' },
    // batik drying outside the studio
    { id: 'batik-line', kind: 'clothline', position: [6.3, 26.6], rotation: Math.PI / 2 },
    { id: 'tree-1', kind: 'tree', position: [-6.2, -24], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, 4], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 14], collide: true },
    // the motor park
    { id: 'park-bus', kind: 'danfo', position: [3.9, 33], rotation: 0, color: '#e8e6e0', collide: true },
    { id: 'park-stop', kind: 'busstop', position: [-6.3, 38.4], rotation: Math.PI / 2, collide: true },
    // sculptures at the grove gate, beyond the end of the road
    { id: 'sculpture-1', kind: 'sculpture', position: [-4.6, -46], color: '#b8ab94' },
    { id: 'sculpture-2', kind: 'sculpture', position: [4.8, -46.4], color: '#a99c86' },
    { id: 'sculpture-3', kind: 'sculpture', position: [-8.4, -48], color: '#c2b49c' },
  ],

  npcs: [
    {
      id: 'mama-folake',
      name: 'Mama Folake',
      role: 'Yam seller',
      personality: 'Big laugh, bigger yams; knows every trader in Oja Oba.',
      position: [5.0, -13.0],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#c9583b', bottom: '#f2b705', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'These yams came from the farms past Ikirun this morning.',
          'In August you cannot move in this market — the whole world comes for Osun.',
          'Kabiyesi’s palace is right there. We sell in front of the king.',
        ],
        likes: ['iyan-efo', 'bead-necklace', 'kokoro'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'yam-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'yam-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Iya Iyan is waiting for these yams to pound for lunch. Carry the basket to her buka — across the road, the green awning.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'yam-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,000 from Iya Iyan. Reach her inside thirty seconds and she adds ₦700 — the mortar is already out.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'yam-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, the green awning.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'E se o! The next basket is still on the lorry — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'iya-iyan',
      name: 'Iya Iyan',
      role: 'Buka owner',
      personality: 'Arms like a wrestler from forty years of pounding yam.',
      position: [-5.0, 9.8],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#7a3b72', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#1f6f4a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Iyan from a mortar, not a machine. You can taste the difference.',
          'Efo riro with plenty of locust beans — that is how Osun people like it.',
          'Artists eat here every day. They pay in naira, thank God, not paintings.',
        ],
        likes: ['bead-necklace', 'kokoro', 'abula'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'yam-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Pounded yam and efo riro, ila alasepo with amala, ewa and dodo — sit down.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'iyan-buka' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Mama Folake’s yams! Just in time. Bring them to the mortar.',
            options: [
              { label: 'Hand over the basket', action: { kind: 'deliverJob', jobId: 'yam-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'yinka',
      name: 'Yinka',
      role: 'Batik artist',
      personality: 'Wax on her fingers, a story for every pattern; bargains like it’s a game.',
      position: [5.0, 20],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#f2b705', outfit: 'dress', hair: 'locs', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Talk to',
      hours: [9, 19],
      social: {
        lines: [
          'My teacher learned in the workshops of the sixties. I learned from her.',
          'Batik is patience: wax, dye, crack, boil. Then do it again.',
          'Go to the grove gate in the evening. The sculptures look alive.',
        ],
        likes: ['iyan-efo', 'oniko-scarf', 'ibadan-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'meets', target: 'batik-table' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Batik, beads, hammered aluminium panels — all made on this street. Make me an offer. And help Mama Folake at the market; then I’ll teach you batik.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'yinka-studio' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
          teach: {
            text: 'You helped Mama Folake — come to the table. Three pieces: draw, wax, dye, crack, boil. In order, or the colours run.',
            options: [
              { label: 'Make some batik', action: { kind: 'startRepair', repairId: 'batik-table' } },
              { label: 'Let me see your work', action: { kind: 'openShop', businessId: 'yinka-studio' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'kwame-osogbo',
      name: 'Kwame',
      role: 'Visitor',
      personality: 'An art student from Kumasi with a sketchbook and endless questions.',
      position: [-4.8, 24],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#f2b705', bottom: '#2a2a2a', outfit: 'shirt', hair: 'hightop', accessory: 'glasses', height: 1.78 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'In Kumasi we have kente. Here, batik and beads. West Africa is one big workshop.',
          'I came by bus from Accra to Lagos, then here. My back is still in Lagos.',
          'Susanne Wenger came to Osogbo in the fifties and stayed for life. I understand why.',
        ],
        likes: ['batik-cloth', 'iyan-efo', 'kente-stole'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'osogbo-art-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'osogbo-art-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'osogbo-art-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'osogbo-art-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hey! I’m Kwame — art student, Kumasi. Will you walk me round? The palace, Oja Oba, then the artists’ street.',
            options: [
              { label: 'Guide Kwame', action: { kind: 'acceptJob', jobId: 'osogbo-art-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,500 — and ₦1,100 more if we finish before the light goes. Walk, so I can sketch.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'osogbo-art-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows their way — the palace, Oja Oba, the artists’ street. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m sketching as we go.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Twenty sketches! My lecturer will be so jealous. Thank you.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'osogbo-art-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! If you’re ever in Kumasi, I owe you fufu.',
            options: [{ label: 'Deal', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'conductor-bayo',
      name: 'Bayo',
      role: 'Bus conductor',
      personality: 'Calls out destinations like a praise singer.',
      position: [-4.8, 33.2],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#c0392b', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', headwear: 'cap', headColor: '#f2b705', height: 1.74 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Ibadan! Ibadan! Two hours, smooth road, good driver.',
          'Festival time, we run buses all night.',
          'Osogbo people are calm. Even the traffic is calm.',
        ],
        likes: ['kokoro', 'iyan-efo', 'gala'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Ibadan! Iwo Road! Enter, enter — one chance!',
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
    { id: 'ow-1', look: { gender: 'female', skin: '#5a3420', top: '#f4f0e6', bottom: '#f4f0e6', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#f4f0e6' }, path: [[-5.4, 30], [-5.4, -36], [-5.4, 30]], speed: 0.95, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI }] },
    { id: 'ow-2', look: { gender: 'male', skin: '#4a2c1c', top: '#2c4a7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'osun-festival-night',
      name: 'Festival Night at Oja Oba',
      kind: 'festival',
      venue: 'In front of the Ataoja’s palace',
      description: 'Bata drummers and dancers in front of the palace, the way the town warms up for the Osun-Osogbo Festival. The festival itself — the procession to the grove — is free and once a year, in August.',
      hours: [19, 23],
      everyDays: 3,
      price: 2000,
      joy: 26,
      energy: 8,
    },
  ],
  spots: [
    { id: 'osun-festival-night-gate', kind: 'event', position: [-5.6, -3.4], label: 'Festival Night at Oja Oba', verb: 'Go to', eventId: 'osun-festival-night' },
    { id: 'oja-oba-bench', kind: 'bench', position: [-5.6, 14], label: 'Bench by the buka', verb: 'Rest on' },
    { id: 'osun-room-door', kind: 'home', position: [6.2, -0.6], label: 'Osun Rooms', verb: 'Check', homeId: 'osun-room' },
  ],
  homes: [
    { id: 'osun-room', name: 'Osun room', description: 'A plain, cool room over Oja Oba, the palace drums in the evening and the grove’s trees at the end of the road. Pay once for your stay — or buy it.', moveInCost: 5500, buyPrice: 60000 },
  ],

  businesses: [
    {
      id: 'iyan-buka',
      name: 'Iya Iyan',
      kind: 'food',
      ownerNpcId: 'iya-iyan',
      greeting: 'Pounded in a mortar.',
      stock: [
        { itemId: 'iyan-efo', price: 2500 },
        { itemId: 'ila-amala', price: 2000 },
        { itemId: 'ewa-dodo', price: 1500 },
      ],
    },
    {
      id: 'yinka-studio',
      name: 'Yinka Batik Studio',
      kind: 'market',
      ownerNpcId: 'yinka',
      greeting: 'Made on this street.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'batik-cloth', price: 6500 },
        { itemId: 'bead-necklace', price: 4000 },
        { itemId: 'metal-panel', price: 9000 },
        { itemId: 'osogbo-postcard', price: 600 },
      ],
    },
  ],

  items: [
    { id: 'iyan-efo', name: 'Pounded yam & efo riro', category: 'food', basePrice: 2500, consumable: true, nutrition: 55, icon: 'plate', description: 'Iyan pounded in a mortar, with spinach stew rich with locust beans.' },
    { id: 'ila-amala', name: 'Amala & ila alasepo', category: 'food', basePrice: 2000, consumable: true, nutrition: 45, icon: 'plate', description: 'Amala with okra soup cooked the Osun way, with fish and meat.' },
    { id: 'ewa-dodo', name: 'Ewa & dodo', category: 'food', basePrice: 1500, consumable: true, nutrition: 38, icon: 'plate', description: 'Soft brown beans with fried plantain.' },
    { id: 'batik-cloth', name: 'Batik cloth', category: 'souvenir', basePrice: 6500, icon: 'bag', description: 'Wax-resist batik in deep blues and browns, from the artists’ street.' },
    { id: 'bead-necklace', name: 'Beaded necklace', category: 'clothing', basePrice: 4000, icon: 'key', description: 'Glass beads strung in the Osogbo style.' },
    { id: 'metal-panel', name: 'Hammered aluminium panel', category: 'souvenir', basePrice: 9000, icon: 'key', description: 'A small embossed metal picture — a market scene, beaten out by hand.' },
    { id: 'osogbo-postcard', name: 'Osogbo postcard', category: 'souvenir', basePrice: 600, icon: 'key', description: 'The grove’s sculptures among the trees, on card.' },
  ],

  jobs: [
    {
      id: 'yam-run',
      title: 'Yam Run',
      summary: "Carry Mama Folake's basket of yams across Oja Oba to Iya Iyan's buka before lunch.",
      giverNpcId: 'mama-folake',
      dropoffNpcId: 'iya-iyan',
      cargo: 'Basket of yams',
      timeLimitMs: 60_000,
      reward: 2000,
      bonus: { underMs: 30_000, amount: 700 },
      cooldownMs: 25_000,
    },
    {
      id: 'osogbo-art-walk',
      kind: 'tour',
      tour: { stops: ['osg-palace', 'osg-ojaoba', 'osg-artists'] },
      requires: { discovered: ['osg-palace', 'osg-ojaoba', 'osg-artists'] },
      title: 'Osogbo Art Walk',
      summary: 'Guide Kwame to the Ataoja’s palace, Oja Oba and the artists’ street, in that order. He sketches as he goes — don’t lose him.',
      giverNpcId: 'kwame-osogbo',
      dropoffNpcId: 'kwame-osogbo',
      cargo: 'Guiding Kwame',
      timeLimitMs: 220_000,
      reward: 3500,
      bonus: { underMs: 160_000, amount: 1100 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'batik-table',
      title: 'Batik table at Yinka’s',
      npcId: 'yinka',
      skill: 'batik',
      labels: { unit: 'Piece', units: 'pieces', done: 'Finished', skill: 'Batik', trade: 'Batik', hint: 'Do each step in the right order before the wax sets.' },
      devices: [
        { name: 'Market-day wrapper', fault: 'Two colours', steps: ['Draw the design', 'Wax the lines', 'Dip in yellow', 'Wax again', 'Dip in indigo'] },
        { name: 'Crackle panel', fault: 'Cracked-wax look', steps: ['Draw the design', 'Wax it all', 'Crack the wax', 'Dip in indigo', 'Boil off the wax'] },
        { name: 'Drummer cushion', fault: 'Fine lines', steps: ['Stretch the cloth', 'Draw the design', 'Wax the lines', 'Dip in brown', 'Boil off the wax'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 600,
      perfectTip: 450,
      energyCost: 12,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'yam-run', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
