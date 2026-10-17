import type { DestinationPack } from '../types';

/**
 * Ile-Ife — Enuwa, the square before the Ooni's palace (fictional businesses and people; the palace, Enuwa, the
 * National Museum with its Ife heads, Opa Oranmiyan, Ife's old glass-bead making and the Olojo festival are real).
 * The palace's long wall fills the west side; the museum is across the square; at the north end, in a grove, stands
 * Opa Oranmiyan. Iya Ronke trades beads and needs a calabash of them taken to Baba Ayinde's workshop; once you have,
 * he teaches you to string them; Sola sells beads, carved Ifa trays and small cast heads (bargain); Damilola, home
 * from London, wants a guide. Buses to Osogbo and Ibadan leave from the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const WALL = '#d8c6a4';
const ROOF = '#6a4a34';

export const ife: DestinationPack = {
  id: 'ife-enuwa',
  name: 'Ile-Ife',
  area: 'Enuwa',
  tagline: 'Enuwa — the Ooni’s palace, the Ife heads in the museum, bead makers, and Opa Oranmiyan standing in its grove.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e2d9c4',
    fog: '#d8cdb6',
    ground: '#9a6a46',
    road: '#3c3a37',
    roadLine: '#efe6d0',
    sidewalk: '#cdbfa6',
    gutter: '#55493e',
    sun: '#fff0d2',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.4, crowd: 0.55, horns: 2 },
  vista: 'north',
  vistaStyle: 'forest',
  landmarks: [
    { id: 'ife-palace', name: 'The Ooni’s palace', blurb: 'The palace of the Ooni of Ife, at Enuwa in the heart of the old city — Ife is held in Yoruba tradition to be where the world was created.', position: [-4.6, 12], radius: 4 },
    { id: 'ife-museum', name: 'National Museum, Ile-Ife', blurb: 'Home of the Ife heads: naturalistic portraits in copper alloy and terracotta, made between about the 12th and 15th centuries.', position: [4.6, -1], radius: 4 },
    { id: 'ife-enuwa', name: 'Enuwa Square', blurb: 'The open square before the palace, where Ife gathers — above all for Olojo, when the Ooni comes out in the Are crown.', position: [0, 22], radius: 5 },
    { id: 'ife-oranmiyan', name: 'Opa Oranmiyan', blurb: 'A granite staff more than five metres tall, studded with iron nails, said to mark where Oranmiyan — a founder of the Oyo and Benin dynasties — was buried.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Baba Ayinde', text: 'E kaabo si Ile-Ife! I make beads by the museum, as Ife hands have for a thousand years. Help Iya Ronke bring me glass and I’ll teach you.' },

  buildings: [
    { id: 'f-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#e2d6bc', trim: '#5b3a24', roof: ROOF, storeys: 2 },
    { id: 'f-e2', position: [E, -23.6], size: [10.4, 3.4, D], facing: 'west', wall: '#e8dcc0', trim: '#1d5f7a', roof: ROOF, storeys: 1,
      awning: '#1d5f7a', businessId: 'ayinde-beads', sign: { text: 'AYINDE BEADS', sub: 'GLASS · CORAL · STONE', bg: '#1d5f7a', fg: '#ffffff' } },
    { id: 'f-e3', position: [E, -12.6], size: [10.4, 3.4, D], facing: 'west', wall: '#dccaa6', trim: '#7a3b72', roof: ROOF, storeys: 1,
      awning: '#7a3b72', businessId: 'sola-crafts', sign: { text: 'SOLA CRAFTS', sub: 'BEADS · OPON IFA · CASTS', bg: '#7a3b72', fg: '#ffffff' } },
    { id: 'f-e4', position: [E, -1.4], size: [12, 6.4, D], facing: 'west', wall: '#efe8d8', trim: '#3d5f3a', roof: '#5f5a52', storeys: 2,
      sign: { text: 'NATIONAL MUSEUM', sub: 'ILE-IFE', bg: '#3d5f3a', fg: '#f6efe2' } },
    { id: 'f-e5', position: [E, 11], size: [10.4, 9.4, D], facing: 'west', wall: '#ebe2d0', trim: '#4a5a72', roof: ROOF, storeys: 3, balcony: true,
      sign: { text: 'ENUWA ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#4a5a72' } },
    { id: 'f-e6', position: [E, 23], size: [10.4, 6.4, D], facing: 'west', wall: '#d6c7a8', trim: '#5b3a24', roof: ROOF, storeys: 2 },
    { id: 'f-e7', position: [E, 34], size: [10.4, 6.4, D], facing: 'west', wall: '#e2d6bc', trim: '#5b3a24', roof: ROOF, storeys: 2 },

    { id: 'f-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#d9cbb0', trim: '#5b3a24', roof: ROOF, storeys: 2 },
    { id: 'f-w2', position: [W, -21], size: [14, 3.4, D], facing: 'east', wall: '#e0cfae', trim: '#8a3a2a', roof: ROOF, storeys: 1,
      awning: '#c9583b', sign: { text: 'ENUWA MARKET', sub: 'BEADS · KOLA · CLOTH', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'f-w3', position: [W, -6], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: ROOF, storeys: 1,
      awning: '#1f6f4a', businessId: 'tinuke-buka', sign: { text: 'MAMA TINUKE', sub: 'EWA · DODO IKIRE · ZOBO', bg: '#1f6f4a', fg: '#fff6e0' } },
    // the palace: a long, high wall with a gatehouse
    { id: 'f-w4', position: [W, 12], size: [16, 6.4, D], facing: 'east', wall: WALL, trim: '#8a6a2a', roof: '#4a3a2c', storeys: 2,
      sign: { text: 'THE OONI’S PALACE', sub: 'ENUWA · ILE-IFE', bg: '#8a6a2a', fg: '#fff6e0' } },
    { id: 'f-w5', position: [W, 27], size: [10.4, 6.4, D], facing: 'east', wall: '#ddd0b6', trim: '#5b3a24', roof: ROOF, storeys: 2 },
    { id: 'f-w6', position: [W, 37.5], size: [8.6, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: ROOF, storeys: 1,
      sign: { text: 'BUSES', sub: 'OSOGBO · IBADAN', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    { id: 'oranmiyan', kind: 'staff', position: [0, -46.5], collide: true },
    { id: 'stall-ronke', kind: 'stall', position: [-6.1, -24], rotation: Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'crates-1', kind: 'crates', position: [-6.4, -16.6], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.6, -9.6], color: '#1f6f4a' },
    { id: 'tree-1', kind: 'tree', position: [6.3, 4.8], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.2, 30], collide: true },
    { id: 'bench-1', kind: 'bench', position: [6.3, 28], collide: true },
    { id: 'pole-1', kind: 'pole', position: [6.6, -30] },
    { id: 'pole-2', kind: 'pole', position: [6.6, -8] },
    { id: 'pole-3', kind: 'pole', position: [6.6, 16] },
  ],

  npcs: [
    {
      id: 'iya-ronke',
      name: 'Iya Ronke',
      role: 'Bead trader',
      personality: 'Has traded beads at Enuwa since she was a girl carrying her mother’s tray.',
      position: [-5.0, -26.2],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1d5f7a', bottom: '#1d5f7a', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Ife made glass beads long before anyone here had heard of Venice. The old furnaces are in the ground at Olokun.',
          'Coral for chiefs, glass for brides, stone for everyone.',
          'My mother’s tray, and her mother’s. Beads outlive us all.',
        ],
        likes: ['ewa-riro', 'ife-zobo', 'dodo-ikire'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'bead-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'bead-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Baba Ayinde is waiting for this calabash of glass beads. Carry it across to his workshop — the blue sign, by the crafts shop.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'bead-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Baba Ayinde, and ₦700 more if you’re quick — under thirty seconds. Don’t drop it!',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'bead-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Across the road — the blue sign. Gently!',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'E se. The next calabash is still being sorted.',
            options: [{ label: 'Later then', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'baba-ayinde',
      name: 'Baba Ayinde',
      role: 'Bead maker',
      personality: 'Patient, precise, with reading glasses on a bead chain; strings as he talks.',
      position: [5.0, -21.6],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#1d5f7a', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#c0392b', accessory: 'glasses', height: 1.74 },
      promptVerb: 'Talk to',
      hours: [8, 19],
      social: {
        lines: [
          'Look at the Ife heads in the museum — the lines on their faces, the beads on their crowns. Ife has always worn beads.',
          'Sort first, then string. Hurry the sorting and the necklace tells on you.',
          'A good strand hangs like water.',
        ],
        likes: ['ewa-riro', 'opon-ifa', 'kunu-zaki'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'bead-run' }, node: 'report' },
          { when: { kind: 'meets', target: 'bead-workshop' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome. This is a bead workshop — glass, coral, stone, all strung by hand. Help Iya Ronke bring me glass and I will teach you.',
            options: [
              { label: 'See your beads', action: { kind: 'openShop', businessId: 'ayinde-beads' } },
              { label: 'I will', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Iya Ronke’s glass! Not one cracked. Set it down here.',
            options: [
              { label: 'Hand over the beads', action: { kind: 'deliverJob', jobId: 'bead-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          teach: {
            text: 'Sit, then. Three strands: sort, measure, string, knot, finish — in that order, every time.',
            options: [
              { label: 'String some beads', action: { kind: 'startRepair', repairId: 'bead-workshop' } },
              { label: 'See your beads', action: { kind: 'openShop', businessId: 'ayinde-beads' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'sola',
      name: 'Sola',
      role: 'Craft seller',
      personality: 'Quick-talking art graduate from the university up the road; sells and explains in one breath.',
      position: [5.0, -10.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'The casts are new — made in the old style. The real heads stay in the museum, as they should.',
          'An opon Ifa is a divination tray. Ifa began here, they say. Every carver adds his own border.',
          'I studied fine art at Ife. Now I sell it. That is also art.',
        ],
        likes: ['dodo-ikire', 'ife-zobo', 'adire-wrapper'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Bead necklaces, carved opon Ifa, small heads cast in the old style. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'sola-crafts' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-tinuke',
      name: 'Mama Tinuke',
      role: 'Cook',
      personality: 'Feeds the palace guards and the market women; her beans are slow-cooked since dawn.',
      position: [-5.0, -4.0],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [7, 21],
      social: {
        lines: [
          'Dodo Ikire comes from just down the road — overripe plantain, fried dark and sweet.',
          'Ewa riro with palm oil and pepper. Eat it with bread or with your hands.',
          'Olojo week I cook for a thousand people. Pray for me.',
        ],
        likes: ['opon-ifa', 'ife-beads', 'kola-nut'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Ewa riro, dodo Ikire, cold zobo. Sit down, sit down.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'tinuke-buka' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'damilola',
      name: 'Damilola',
      role: 'Visitor',
      personality: 'Grew up in London, back for her grandmother’s birthday; wants to see the Ife she heard stories about.',
      position: [-4.8, 24],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long', accessory: 'glasses', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'My grandmother says every Yoruba story starts in Ife. I believe her now.',
          'I saw an Ife head in a museum in London once. Seeing them here is different.',
          'Everyone keeps asking if I can speak Yoruba. A little. Small small.',
        ],
        likes: ['ife-beads', 'dodo-ikire', 'ife-head'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'enuwa-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'enuwa-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'enuwa-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'enuwa-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — Damilola. My grandmother is from here but I grew up in London. Will you show me? The museum, the palace, and Opa Oranmiyan.',
            options: [
              { label: 'Guide Damilola', action: { kind: 'acceptJob', jobId: 'enuwa-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 — and ₦1,250 more if we’re back before Grandma’s lunch.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'enuwa-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows Enuwa — the museum, the palace, Opa Oranmiyan. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m right behind you.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'The heads, the palace, Oranmiyan’s staff… Grandma is going to quiz me and I’ll know every answer. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'enuwa-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! E se gan.',
            options: [{ label: 'You’re welcome', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'conductor-tunde',
      name: 'Tunde',
      role: 'Bus conductor',
      personality: 'Calls the towns like a praise singer and never runs out of breath.',
      position: [-4.8, 31.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#c0392b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#c0392b', height: 1.77 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Osogbo one hour, Ibadan an hour and a half — if the Ikire road behaves.',
          'Buy dodo at Ikire when we stop. Everybody does.',
          'Ife to anywhere. Anywhere to Ife. That is my life.',
        ],
        likes: ['dodo-ikire', 'ife-zobo', 'ewa-riro'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Osogbo! Ibadan! Enter, enter — we are going now now!',
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
    { id: 'fw-1', look: { gender: 'male', skin: '#6b4026', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', headwear: 'kufi', headColor: '#7a3b72' }, path: [[-5.4, 30], [-5.4, -30], [-5.4, 30]], speed: 1.0 },
    { id: 'fw-2', look: { gender: 'female', skin: '#7a4a2e', top: '#c0392b', bottom: '#c0392b', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#f2b705' }, path: [[3.4, 28], [3.4, -26], [3.4, 28]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'olojo',
      name: 'Olojo at Enuwa',
      kind: 'festival',
      venue: 'Enuwa Square',
      description: 'Drums, chiefs in white and the crowd at Enuwa as the Ooni comes out in the Are crown. In the game Olojo comes round every few days; the real festival is once a year, usually in September or October, and watching is free.',
      hours: [15, 19],
      everyDays: 3,
      price: 2000,
      joy: 30,
      energy: 6,
    },
  ],
  spots: [
    { id: 'olojo-gate', kind: 'event', position: [-5.6, 20.6], label: 'Olojo at Enuwa', verb: 'Go to', eventId: 'olojo' },
    { id: 'enuwa-bench', kind: 'bench', position: [5.6, 28], label: 'Bench under the tree', verb: 'Rest on' },
    { id: 'enuwa-room-door', kind: 'home', position: [6.2, 11], label: 'Enuwa Rooms', verb: 'Check', homeId: 'enuwa-room' },
  ],
  homes: [
    { id: 'enuwa-room', name: 'Enuwa room', description: 'A room above the square, the palace drums carrying across at dawn. Pay once for your stay — or buy it.', moveInCost: 6000, buyPrice: 65000 },
  ],

  businesses: [
    {
      id: 'tinuke-buka',
      name: 'Mama Tinuke',
      kind: 'food',
      ownerNpcId: 'mama-tinuke',
      greeting: 'Cooked since dawn.',
      stock: [
        { itemId: 'ewa-riro', price: 1800 },
        { itemId: 'dodo-ikire', price: 800 },
        { itemId: 'ife-zobo', price: 500 },
      ],
    },
    {
      id: 'sola-crafts',
      name: 'Sola Crafts',
      kind: 'market',
      ownerNpcId: 'sola',
      greeting: 'Made in Ife.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'ife-beads', price: 6000 },
        { itemId: 'opon-ifa', price: 9000 },
        { itemId: 'ife-head', price: 15000 },
      ],
    },
    {
      id: 'ayinde-beads',
      name: 'Ayinde Beads',
      kind: 'fashion',
      ownerNpcId: 'baba-ayinde',
      greeting: 'Strung by hand.',
      stock: [
        { itemId: 'kola-nut', price: 600 },
      ],
    },
  ],

  items: [
    { id: 'ewa-riro', name: 'Ewa riro', category: 'food', basePrice: 1800, consumable: true, nutrition: 40, icon: 'plate', description: 'Beans slow-cooked with palm oil, pepper and onions, with fried plantain on the side.' },
    { id: 'dodo-ikire', name: 'Dodo Ikire', category: 'food', basePrice: 800, consumable: true, nutrition: 18, icon: 'snack', description: 'Overripe plantain mashed with pepper and fried dark — from Ikire, down the road.' },
    { id: 'ife-zobo', name: 'Zobo', category: 'drink', basePrice: 500, consumable: true, nutrition: 6, icon: 'cup', description: 'Chilled hibiscus drink with ginger and pineapple.' },
    { id: 'ife-beads', name: 'Bead necklace', category: 'souvenir', basePrice: 6000, icon: 'bag', description: 'A strand of coral-red and glass beads, strung in Ife.' },
    { id: 'opon-ifa', name: 'Opon Ifa', category: 'souvenir', basePrice: 9000, icon: 'bag', description: 'A carved wooden divination tray, its border full of faces and figures.' },
    { id: 'ife-head', name: 'Small cast head', category: 'souvenir', basePrice: 15000, icon: 'bag', description: 'A small brass head cast in the style of the Ife heads — a new piece, not an antique.' },
    { id: 'kola-nut', name: 'Kola nuts', category: 'food', basePrice: 600, consumable: true, nutrition: 4, icon: 'snack', description: 'Bitter red and white kola, offered to guests and broken in prayer.' },
  ],

  jobs: [
    {
      id: 'bead-run',
      title: 'Bead Run',
      summary: "Carry Iya Ronke's calabash of glass beads from the market across to Baba Ayinde's workshop.",
      giverNpcId: 'iya-ronke',
      dropoffNpcId: 'baba-ayinde',
      cargo: 'Calabash of glass beads',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 700 },
      cooldownMs: 25_000,
    },
    {
      id: 'enuwa-walk',
      kind: 'tour',
      tour: { stops: ['ife-museum', 'ife-palace', 'ife-oranmiyan'] },
      requires: { discovered: ['ife-museum', 'ife-palace', 'ife-oranmiyan'] },
      title: 'Enuwa Walk',
      summary: 'Guide Damilola to the National Museum, the Ooni’s palace and Opa Oranmiyan, in that order. Keep her close.',
      giverNpcId: 'damilola',
      dropoffNpcId: 'damilola',
      cargo: 'Guiding Damilola',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'bead-workshop',
      title: 'Baba Ayinde’s bench',
      npcId: 'baba-ayinde',
      skill: 'beadwork',
      labels: { unit: 'Strand', units: 'strands', done: 'Strung', skill: 'Beadwork', trade: 'Beads', hint: 'Do each step in the right order before the light goes.' },
      devices: [
        { name: 'Coral necklace', fault: 'For a chief', steps: ['Sort the coral', 'Measure the thread', 'String the beads', 'Knot between beads', 'Tie the clasp'] },
        { name: 'Waist beads', fault: 'For a bride', steps: ['Sort the glass', 'Measure the waist', 'String the beads', 'Add the charm', 'Knot the ends'] },
        { name: 'Bead bracelet', fault: 'Three colours', steps: ['Pick the colours', 'Cut the cord', 'String the pattern', 'Close the loop', 'Polish'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 650,
      perfectTip: 500,
      energyCost: 14,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'bead-run', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
