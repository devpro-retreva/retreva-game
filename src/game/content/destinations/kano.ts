import type { DestinationPack } from '../types';

/**
 * Kano — the old city around Kurmi Market (fictional businesses; Kurmi Market, the Kofar Mata dye pits, Gidan Rumfa —
 * the Emir's palace — and the old city walls are real). Hausa mud buildings with pinnacles line the street; the dye
 * pits are on the east side; the palace on the west; at the north end the street meets a gate in the old earthen wall.
 * Baba Audu sells hides and needs a bundle carried to Malam Bashir's leather workshop; once you've helped, Malam
 * Bashir lets you work leather with him; Hajiya Binta sells indigo cloth, leather and brass (bargain); Yetunde, a
 * photographer from Lagos, wants a guide. The Durbar parade is a show — its card says when the real one rides.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

const MUD = '#c08a58';
const MUD2 = '#b07a4e';
const MUD3 = '#cc9a68';

export const kano: DestinationPack = {
  id: 'kano-kurmi',
  name: 'Kano',
  area: 'Old City',
  tagline: 'The old city — Kurmi Market, indigo dye pits five centuries old, the Emir’s palace and the gates in the wall.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  // the dry, bright light of the Sahel
  palette: {
    sky: '#ecdcb4',
    fog: '#e0cfa6',
    ground: '#b39468',
    road: '#3d3a36',
    roadLine: '#f0e4c8',
    sidewalk: '#d3c4a6',
    gutter: '#5a4e42',
    sun: '#fff0cc',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.45, crowd: 0.65, horns: 2.5 },
  vista: 'north',
  vistaStyle: 'citywall',
  landmarks: [
    { id: 'kan-kurmi', name: 'Kurmi Market', blurb: 'One of the oldest and biggest markets in Africa, trading since the 1400s: leather, cloth, spices, brass and indigo.', position: [-4.6, -14], radius: 5 },
    { id: 'kan-dyepits', name: 'Kofar Mata dye pits', blurb: 'Indigo vats by the Kofar Mata gate, said to have been dyeing cloth since about 1498 — among the oldest dye pits in West Africa still at work.', position: [4.6, -2], radius: 4 },
    { id: 'kan-palace', name: 'Gidan Rumfa, the Emir’s palace', blurb: 'Built in the 15th century, the oldest building in the old city — and still the home of the Emir of Kano.', position: [-4.6, 12], radius: 4 },
    { id: 'kan-gate', name: 'Gate in the old city wall', blurb: 'The earthen walls once ran for kilometres around Kano. Most are gone now, but gates like this one still stand.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Malam Bashir', text: 'Sannu da zuwa — welcome to Kano! I work leather by Kurmi Market. Help Baba Audu bring me hides and I’ll teach you.' },

  buildings: [
    { id: 'k-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: MUD, trim: '#5b3a24', roof: MUD2, storeys: 2, style: 'adobe' },
    { id: 'k-e2', position: [E, -23.6], size: [10.4, 3.4, D], facing: 'west', wall: MUD3, trim: '#5b3a24', roof: MUD2, storeys: 1, style: 'adobe',
      awning: '#8a3a2a', businessId: 'bashir-leather', sign: { text: 'MALAM BASHIR LEATHER', sub: 'SANDALS · BAGS · POUFFES', bg: '#8a3a2a', fg: '#f6efe2' } },
    { id: 'k-e3', position: [E, -12.6], size: [10.4, 3.4, D], facing: 'west', wall: MUD, trim: '#2c4a7a', roof: MUD2, storeys: 1, style: 'adobe',
      awning: '#2c4a7a', businessId: 'binta-cloth', sign: { text: 'HAJIYA BINTA', sub: 'INDIGO · LEATHER · BRASS', bg: '#2c4a7a', fg: '#ffffff' } },
    { id: 'k-e4', position: [E, -1.4], size: [12, 3.4, D], facing: 'west', wall: '#a8744a', trim: '#1d2f5a', roof: MUD2, storeys: 1, style: 'adobe',
      sign: { text: 'KOFAR MATA DYE PITS', sub: 'INDIGO SINCE THE 1400s', bg: '#1d2f5a', fg: '#e8e2d0' } },
    { id: 'k-e5', position: [E, 9.6], size: [10.4, 9.4, D], facing: 'west', wall: '#e6d6b8', trim: '#5b3a24', roof: MUD2, storeys: 3, balcony: true,
      sign: { text: 'KURMI ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#5b3a24' } },
    { id: 'k-e6', position: [E, 21.6], size: [10.4, 6.4, D], facing: 'west', wall: MUD3, trim: '#3d5f3a', roof: MUD2, storeys: 2, style: 'adobe' },
    { id: 'k-e7', position: [E, 33.6], size: [10.4, 6.4, D], facing: 'west', wall: MUD, trim: '#5b3a24', roof: MUD2, storeys: 2, style: 'adobe' },

    { id: 'k-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: MUD3, trim: '#5b3a24', roof: MUD2, storeys: 2, style: 'adobe' },
    { id: 'k-w2', position: [W, -14], size: [16, 3.4, D], facing: 'east', wall: MUD, trim: '#8a3a2a', roof: MUD2, storeys: 1, style: 'adobe',
      awning: '#c9583b', sign: { text: 'KURMI MARKET', sub: 'LEATHER · CLOTH · SPICES · BRASS', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'k-w3', position: [W, -1], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: MUD2, storeys: 1,
      awning: '#1f6f4a', businessId: 'hadiza-kitchen', sign: { text: 'MAMA HADIZA', sub: 'TUWO · MIYAN KUKA · DAMBU', bg: '#1f6f4a', fg: '#fff6e0' } },
    // the palace: a long, high mud wall with a decorated gateway
    { id: 'k-w4', position: [W, 12], size: [14, 9.4, D], facing: 'east', wall: '#d2a070', trim: '#1f6f4a', roof: MUD2, storeys: 3, style: 'adobe',
      sign: { text: 'GIDAN RUMFA', sub: 'THE EMIR’S PALACE', bg: '#1f6f4a', fg: '#f2e2c0' } },
    { id: 'k-w5', position: [W, 27.4], size: [10.4, 6.4, D], facing: 'east', wall: MUD, trim: '#5b3a24', roof: MUD2, storeys: 2, style: 'adobe' },
    { id: 'k-w6', position: [W, 38], size: [8, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#c0392b', roof: MUD2, storeys: 1,
      sign: { text: 'TAXIS', sub: 'AIRPORT · SABON GARI', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    // the dye pits: indigo vats sunk by the pavement
    { id: 'vat-1', kind: 'drum', position: [6.4, -4.4], color: '#1d2f5a', collide: true },
    { id: 'vat-2', kind: 'drum', position: [6.4, 0.4], color: '#22386a', collide: true },
    { id: 'line-1', kind: 'clothline', position: [6.3, 4.6], rotation: Math.PI / 2 },
    // Kurmi Market spills out
    { id: 'stall-audu', kind: 'stall', position: [-6.1, -19.4], rotation: Math.PI / 2, color: '#8a3a2a', collide: true },
    { id: 'crates-1', kind: 'crates', position: [-6.4, -8.6], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.6, -10.8], color: '#f2b705' },
    { id: 'tree-1', kind: 'tree', position: [6.3, 16], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.2, 22], collide: true },
    { id: 'bench-1', kind: 'bench', position: [6.3, 27], collide: true },
    { id: 'taxi-1', kind: 'car', position: [3.9, 31], rotation: 0, color: '#e8e6e0', collide: true },
  ],

  npcs: [
    {
      id: 'baba-audu',
      name: 'Baba Audu',
      role: 'Hide merchant',
      personality: 'Grey-bearded and shrewd; has bought hides from the same herders for forty years.',
      position: [-5.0, -21.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#2c4a7a', height: 1.74 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Kano leather went across the desert for centuries. In Europe they called it Moroccan leather.',
          'A good hide tells you where the goat has walked.',
          'Kurmi Market was old when my great-grandfather was young.',
        ],
        likes: ['tuwo-kuka', 'indigo-cloth', 'kano-dates'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'hide-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'hide-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Malam Bashir is waiting for these tanned hides. Carry the bundle across to his workshop — the red sign, past the dye pits.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'hide-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Malam Bashir. Reach him inside thirty seconds and he adds ₦750 — he has orders waiting.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'hide-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, the red sign.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Na gode. The next hides are still drying — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'malam-bashir',
      name: 'Malam Bashir',
      role: 'Leatherworker',
      personality: 'Calm, exact, with an awl behind his ear; his father taught him, as his grandfather taught his father.',
      position: [5.0, -21.6],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#2c4a7a', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#8a3a2a', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [8, 19],
      social: {
        lines: [
          'Cut once, stitch a hundred times. That is leatherwork.',
          'The red comes from sorghum stalks, the green from copper. The old ways still work.',
          'People from Lagos buy my pouffes and ask if they are from Morocco. I say: Morocco learnt from us.',
        ],
        likes: ['dambu-nama', 'brass-tray', 'adire-wrapper'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'hide-run' }, node: 'report' },
          { when: { kind: 'meets', target: 'leather-workshop' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Sannu. This is a leather workshop — sandals, bags, pouffes, all by hand. Help Baba Audu bring my hides and I’ll let you work with me.',
            options: [
              { label: 'See your work', action: { kind: 'openShop', businessId: 'bashir-leather' } },
              { label: 'I will', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Baba Audu’s hides! Good leather. Put them on the bench.',
            options: [
              { label: 'Hand over the hides', action: { kind: 'deliverJob', jobId: 'hide-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          teach: {
            text: 'You brought the hides — now work with me. Three pieces: cut, dye, tool, stitch, finish. Each in its place.',
            options: [
              { label: 'Work the leather', action: { kind: 'startRepair', repairId: 'leather-workshop' } },
              { label: 'See your work', action: { kind: 'openShop', businessId: 'bashir-leather' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'hajiya-binta',
      name: 'Hajiya Binta',
      role: 'Cloth and brass seller',
      personality: 'Elegant and unhurried; bargains with a smile that never moves.',
      position: [5.0, -10.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#2c4a7a', bottom: '#2c4a7a', outfit: 'kaftan', hair: 'short', headwear: 'wrap', headColor: '#1d2f5a', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'This indigo came out of the Kofar Mata pits last week. Smell it — that is the real thing.',
          'Brass trays from the smiths behind the market. Polish them and they shine like the sun.',
          'Bargaining is how we become friends. Begin.',
        ],
        likes: ['tuwo-kuka', 'kano-dates', 'oniko-scarf'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Indigo cloth from Kofar Mata, brass from the smiths, leather from Kurmi. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'binta-cloth' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-hadiza',
      name: 'Mama Hadiza',
      role: 'Cook',
      personality: 'Feeds the traders of Kurmi; strict about her miyan kuka.',
      position: [-5.0, 1.0],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Miyan kuka is made from baobab leaves. It is green, it is slippery, it is perfect.',
          'Dambun nama — beef pounded and fried till it is like threads. Kano’s pride.',
          'Kunun gyada in the morning, tuwo at noon. That is the day.',
        ],
        likes: ['brass-tray', 'kano-dates', 'acha-soup'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Tuwo with miyan kuka, dambun nama, kunun gyada — sit, sit.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'hadiza-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'yetunde',
      name: 'Yetunde',
      role: 'Visitor',
      personality: 'A Lagos photographer chasing the colours of the dye pits.',
      position: [-4.8, 24],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long', headwear: 'wrap', headColor: '#2c4a7a', accessory: 'glasses', height: 1.67 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'The blue of those dye pits — no filter can make that.',
          'Kano light is hard and white at noon. I shoot early and late.',
          'Everyone told me to see the Durbar. I want to come back for Sallah.',
        ],
        likes: ['indigo-cloth', 'dambu-nama', 'kano-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'old-city-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'old-city-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'old-city-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'old-city-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — Yetunde, photographer, Lagos. Will you walk me round? The dye pits, Kurmi Market, then the Emir’s palace.',
            options: [
              { label: 'Guide Yetunde', action: { kind: 'acceptJob', jobId: 'old-city-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 — and ₦1,250 more if we finish before the light gets harsh. Walk, so I can shoot.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'old-city-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the old city — the dye pits, Kurmi, the palace. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m shooting as we go.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Indigo, leather, and the palace walls in that light. My best shoot this year. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'old-city-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! I’ll send you the prints.',
            options: [{ label: 'Please do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'driver-musa',
      name: 'Musa',
      role: 'Taxi driver',
      personality: 'Unhurried, polite, knows every gate of the old city by name.',
      position: [-4.8, 32.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'low', facialHair: 'moustache', headwear: 'kufi', headColor: '#f4f0e6', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'The airport is close — twenty-five minutes. Kano is not Lagos.',
          'The old city had fifteen gates once. I can name them all.',
          'At Sallah the horsemen ride to the palace. You must see it once.',
        ],
        likes: ['dambu-nama', 'kano-dates', 'kano-malt'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Mallam Aminu Kano, twenty-five minutes. Enter.',
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
    { id: 'kw-o1', look: { gender: 'male', skin: '#6b4026', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', headwear: 'kufi', headColor: '#7a3b72' }, path: [[-5.4, 30], [-5.4, -34], [-5.4, 30]], speed: 1.05 },
    { id: 'kw-o2', look: { gender: 'female', skin: '#7a4a2e', top: '#c0392b', bottom: '#c0392b', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#2c4a7a' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'kano-durbar',
      name: 'Durbar at the palace',
      kind: 'festival',
      venue: 'Before Gidan Rumfa',
      description: 'Horsemen in bright robes and quilted armour ride to the palace, drummers and trumpets ahead of them. In the game the parade rides every few days; the real Durbar rides out at the two Sallah festivals (Eid) each year.',
      hours: [16, 19],
      everyDays: 3,
      price: 3000,
      joy: 30,
      energy: 6,
    },
  ],
  spots: [
    { id: 'kano-durbar-gate', kind: 'event', position: [-5.6, 18.4], label: 'Durbar at the palace', verb: 'Go to', eventId: 'kano-durbar' },
    { id: 'kurmi-bench', kind: 'bench', position: [5.6, 27], label: 'Bench under the neem', verb: 'Rest on' },
    { id: 'kurmi-room-door', kind: 'home', position: [6.2, 9.6], label: 'Kurmi Rooms', verb: 'Check', homeId: 'kurmi-room' },
  ],
  homes: [
    { id: 'kurmi-room', name: 'Kurmi room', description: 'A cool room behind thick walls, the market’s noise below and the call of the old city at dawn. Pay once for your stay — or buy it.', moveInCost: 6500, buyPrice: 70000 },
  ],

  businesses: [
    {
      id: 'hadiza-kitchen',
      name: 'Mama Hadiza',
      kind: 'food',
      ownerNpcId: 'mama-hadiza',
      greeting: 'Kano cooking.',
      stock: [
        { itemId: 'tuwo-kuka', price: 2000 },
        { itemId: 'dambu-nama', price: 2500 },
        { itemId: 'kunun-gyada', price: 600 },
      ],
    },
    {
      id: 'binta-cloth',
      name: 'Hajiya Binta',
      kind: 'market',
      ownerNpcId: 'hajiya-binta',
      greeting: 'From the old city.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'indigo-cloth', price: 7500 },
        { itemId: 'brass-tray', price: 6000 },
        { itemId: 'leather-pouffe', price: 12000 },
      ],
    },
    {
      id: 'bashir-leather',
      name: 'Malam Bashir Leather',
      kind: 'fashion',
      ownerNpcId: 'malam-bashir',
      greeting: 'Made by hand.',
      stock: [
        { itemId: 'kano-sandals', price: 6500 },
        { itemId: 'leather-bag', price: 9500 },
      ],
    },
  ],

  items: [
    { id: 'tuwo-kuka', name: 'Tuwo & miyan kuka', category: 'food', basePrice: 2000, consumable: true, nutrition: 48, icon: 'plate', description: 'Soft rice tuwo with miyan kuka — the green baobab-leaf soup of the north.' },
    { id: 'dambu-nama', name: 'Dambun nama', category: 'food', basePrice: 2500, consumable: true, nutrition: 30, icon: 'snack', description: 'Beef pounded and fried until it falls into spicy threads — a Kano speciality.' },
    { id: 'kunun-gyada', name: 'Kunun gyada', category: 'drink', basePrice: 600, consumable: true, nutrition: 12, icon: 'cup', description: 'A warm groundnut-and-rice gruel, gently sweet.' },
    { id: 'indigo-cloth', name: 'Kofar Mata indigo cloth', category: 'souvenir', basePrice: 7500, icon: 'bag', description: 'Deep indigo cloth dyed in the Kofar Mata pits, beaten until it shines.' },
    { id: 'brass-tray', name: 'Brass tray', category: 'goods', basePrice: 6000, icon: 'key', description: 'Hammered and engraved by the smiths behind the market.' },
    { id: 'leather-pouffe', name: 'Leather pouffe', category: 'goods', basePrice: 12000, icon: 'bag', description: 'A round Kano pouffe in red and green leather, stitched by hand.' },
    { id: 'kano-sandals', name: 'Leather sandals', category: 'clothing', basePrice: 6500, icon: 'bag', description: 'Hand-stitched sandals, red goatskin with a woven strap.' },
    { id: 'leather-bag', name: 'Tooled leather bag', category: 'bag', basePrice: 9500, icon: 'bag', description: 'A shoulder bag with a tooled design, from Malam Bashir’s bench.' },
  ],

  jobs: [
    {
      id: 'hide-run',
      title: 'Hide Run',
      summary: "Carry Baba Audu's bundle of tanned hides from Kurmi across the street to Malam Bashir's leather workshop.",
      giverNpcId: 'baba-audu',
      dropoffNpcId: 'malam-bashir',
      cargo: 'Bundle of tanned hides',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 750 },
      cooldownMs: 25_000,
    },
    {
      id: 'old-city-walk',
      kind: 'tour',
      tour: { stops: ['kan-dyepits', 'kan-kurmi', 'kan-palace'] },
      requires: { discovered: ['kan-dyepits', 'kan-kurmi', 'kan-palace'] },
      title: 'Old City Walk',
      summary: 'Guide Yetunde to the Kofar Mata dye pits, Kurmi Market and Gidan Rumfa, in that order. She shoots as she walks — don’t lose her.',
      giverNpcId: 'yetunde',
      dropoffNpcId: 'yetunde',
      cargo: 'Guiding Yetunde',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'leather-workshop',
      title: 'Malam Bashir’s workshop',
      npcId: 'malam-bashir',
      skill: 'leatherwork',
      labels: { unit: 'Piece', units: 'pieces', done: 'Made', skill: 'Leatherwork', trade: 'Leather', hint: 'Do each step in the right order before the glue sets.' },
      devices: [
        { name: 'Sandals', fault: 'Red goatskin', steps: ['Cut the soles', 'Cut the straps', 'Stitch the straps', 'Glue the soles', 'Polish'] },
        { name: 'Pouffe', fault: 'Red and green', steps: ['Cut the panels', 'Dye the leather', 'Stitch the pattern', 'Sew it together', 'Stuff and close'] },
        { name: 'Wallet', fault: 'Tooled design', steps: ['Cut the pieces', 'Tool the design', 'Dye the leather', 'Stitch the edges', 'Burnish the edges'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 650,
      perfectTip: 500,
      energyCost: 14,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'hide-run', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
