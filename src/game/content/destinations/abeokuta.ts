import type { DestinationPack } from '../types';

/**
 * Abeokuta — Itoku, the adire market under Olumo Rock (fictional businesses; Olumo Rock, Itoku's adire trade and
 * Centenary Hall at Ake are real). Indigo cloth hangs on lines along the street, the dye compound works in the
 * back, and at the north end the street opens on old roofs and the granite of Olumo. Baba Ogunde brings bundles of
 * elu (indigo) leaves for Iya Alaro's dye pit; once you've helped, she lets you dye cloth yourself (a bench: fold,
 * tie, dip in the right order). Kemi sells adire (bargain); Adaeze, a student from Enugu, wants a guide; Mama Ofada
 * cooks the rice Ogun is famous for. Buses to Lagos and Ibadan leave from the motor park at the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const abeokuta: DestinationPack = {
  id: 'abeokuta-itoku',
  name: 'Abeokuta',
  area: 'Itoku',
  tagline: 'Itoku — adire cloth in every shade of indigo, ofada rice, and Olumo Rock over the roofs.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  // the buses pull in at the motor park at the south end
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e6d6b0',
    fog: '#d9c9a4',
    ground: '#9a7f5a',
    road: '#3b3835',
    roadLine: '#efe4c8',
    sidewalk: '#c9bca4',
    gutter: '#4f4a45',
    sun: '#ffe6b6',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.45, crowd: 0.6, horns: 2.5 },
  vista: 'north',
  vistaStyle: 'roofs',
  landmarks: [
    { id: 'abk-itoku', name: 'Itoku adire market', blurb: 'The home of adire: indigo tie-dye and resist-dyed cloth, made in the dye compounds round the market and sold here.', position: [4.6, -10], radius: 5 },
    { id: 'abk-centenary', name: 'Centenary Hall, Ake', blurb: 'Built in 1930 by the Ake palace to mark a hundred years since the Egba founded Abeokuta.', position: [-4.6, 14], radius: 4 },
    { id: 'abk-olumo', name: 'View to Olumo Rock', blurb: 'The granite outcrop where the Egba sheltered in the wars of the 1800s — Abeokuta means “under the rock”. Steps and a lift take visitors to the top.', position: [0, -38], radius: 5 },
    { id: 'abk-park', name: 'Kuto motor park', blurb: 'Buses to Lagos and Ibadan fill up and leave all day.', position: [-4.6, 36], radius: 3 },
  ],
  welcome: { from: 'Iya Alaro', text: 'Ẹ káàbọ̀ to Abeokuta! I run the dye compound in Itoku. Baba Ogunde brings my indigo leaves — help him and I’ll teach you to dye.' },

  buildings: [
    { id: 'b-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#dcc7a2', trim: '#2c4a7a', roof: '#7a4a2e', storeys: 2, balcony: true },
    { id: 'b-e2', position: [E, -22.6], size: [11.4, 3.4, D], facing: 'west', wall: '#e8dcc4', trim: '#2c4a7a', roof: '#7a4a2e', storeys: 1,
      awning: '#2c4a7a', businessId: 'kemi-adire', sign: { text: 'KEMI ADIRE', sub: 'ONIKO · ELEKO · ALABERE', bg: '#2c4a7a', fg: '#f4f0e6' } },
    { id: 'b-e3', position: [E, -10.6], size: [12, 3.4, D], facing: 'west', wall: '#cdb48e', trim: '#1d3557', roof: '#7a4a2e', storeys: 1,
      awning: '#1d3557', sign: { text: 'ITOKU ADIRE MARKET', sub: 'INDIGO · CLOTH · DYE', bg: '#1d3557', fg: '#ffffff' } },
    { id: 'b-e4', position: [E, 1.6], size: [10.4, 6.4, D], facing: 'west', wall: '#e4d8c0', trim: '#2c4a7a', roof: '#7a4a2e', storeys: 2,
      sign: { text: 'IYA ALARO DYE COMPOUND', sub: 'ADIRE MADE HERE · LESSONS', bg: '#ffffff', fg: '#1d3557' } },
    { id: 'b-e5', position: [E, 13.4], size: [10.4, 9.4, D], facing: 'west', wall: '#efe6d4', trim: '#7a5c3b', roof: '#7a4a2e', storeys: 3, balcony: true,
      sign: { text: 'ITOKU ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#7a5c3b' } },
    { id: 'b-e6', position: [E, 25], size: [10.4, 6.4, D], facing: 'west', wall: '#c97b63', trim: '#fff2e2', roof: '#7a4a2e', storeys: 2 },
    { id: 'b-e7', position: [E, 36], size: [9.6, 6.4, D], facing: 'west', wall: '#f4f0e6', trim: '#c0392b', roof: '#7a4a2e', storeys: 2,
      awning: '#c0392b', sign: { text: 'KUTO MOTOR PARK', sub: 'LAGOS · IBADAN · IJEBU-ODE', bg: '#c0392b', fg: '#ffffff' } },

    { id: 'b-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#1f6f4a', roof: '#7a4a2e', storeys: 2 },
    { id: 'b-w2', position: [W, -23.4], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#7a4a2e', storeys: 1,
      awning: '#1f6f4a', businessId: 'ofada-buka', sign: { text: 'MAMA OFADA', sub: 'OFADA · AYAMASE · LAFUN', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'b-w3', position: [W, -11.2], size: [10.4, 6.4, D], facing: 'east', wall: '#d1b48c', trim: '#fdf3df', roof: '#7a4a2e', storeys: 2 },
    { id: 'b-w4', position: [W, 1.6], size: [10.4, 6.4, D], facing: 'east', wall: '#e9e1cf', trim: '#7a3b72', roof: '#7a4a2e', storeys: 2,
      awning: '#7a3b72', sign: { text: 'EGBA BOOKS', sub: 'BOOKS · PRINTING · EXAMS', bg: '#7a3b72', fg: '#ffffff' } },
    // Centenary Hall at Ake: a cream hall with a red roof and a clock gable
    { id: 'b-w5', position: [W, 14.4], size: [12, 9.4, D], facing: 'east', wall: '#efe4cc', trim: '#8a3a2a', roof: '#8a3a2a', storeys: 3, balcony: true,
      sign: { text: 'CENTENARY HALL', sub: 'AKE · 1930', bg: '#8a3a2a', fg: '#f6efe2' } },
    { id: 'b-w6', position: [W, 27], size: [10.4, 6.4, D], facing: 'east', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#7a4a2e', storeys: 2 },
    { id: 'b-w7', position: [W, 37.6], size: [8.6, 3.4, D], facing: 'east', wall: '#e8e6e0', trim: '#c0392b', roof: '#7a4a2e', storeys: 1,
      sign: { text: 'TICKETS', sub: 'BUSES · PARCELS', bg: '#ffffff', fg: '#c0392b' } },
  ],

  props: [
    // adire on the lines along the market side, and the dye pots outside the compound
    { id: 'line-1', kind: 'clothline', position: [6.3, -16.4], rotation: Math.PI / 2 },
    { id: 'line-2', kind: 'clothline', position: [6.3, -5], rotation: Math.PI / 2 },
    { id: 'pot-1', kind: 'drum', position: [6.4, 5.8], color: '#1d2f5a', collide: true },
    { id: 'pot-2', kind: 'drum', position: [6.4, 7.0], color: '#22386a', collide: true },
    { id: 'stall-kemi', kind: 'stall', position: [6.0, -26.6], rotation: -Math.PI / 2, color: '#2c4a7a', collide: true },
    { id: 'tree-1', kind: 'tree', position: [-6.2, -30], collide: true },
    { id: 'tree-2', kind: 'tree', position: [-6.2, 6], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 20.4], collide: true },
    { id: 'kiosk-1', kind: 'kiosk', position: [-6.3, -17], rotation: Math.PI / 2, collide: true },
    // the motor park: an intercity bus loading on the kerb
    { id: 'park-bus', kind: 'danfo', position: [3.9, 31], rotation: 0, color: '#e8e6e0', collide: true },
    { id: 'park-stop', kind: 'busstop', position: [-6.3, 38.4], rotation: Math.PI / 2, collide: true },
    // Olumo Rock, beyond the roofs to the north
    { id: 'olumo', kind: 'monolith', position: [-10, -84] },
  ],

  npcs: [
    {
      id: 'baba-ogunde',
      name: 'Baba Ogunde',
      role: 'Indigo farmer',
      personality: 'Slow and certain; has grown elu leaves for fifty years.',
      position: [-5.0, -26.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#2c4a7a', bottom: '#2c4a7a', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#1d2f5a', height: 1.7 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'Elu leaves — this is where the blue comes from. No leaves, no adire.',
          'The young ones buy chemical dye now. Iya Alaro still uses mine.',
          'Climb Olumo once in your life. From the top you see all of Egbaland.',
        ],
        likes: ['ofada-ayamase-abk', 'lafun-ewedu', 'oniko-scarf'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'indigo-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'indigo-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Iya Alaro is waiting for these elu leaves for her vats. Carry the bundle to her dye compound — across the road, where the blue pots are.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'indigo-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,000 from Iya Alaro. Reach her inside thirty seconds and she adds ₦700 — the vat goes cold if she waits.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'indigo-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, by the blue pots.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you, my child. The next bundle is still drying — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'iya-alaro',
      name: 'Iya Alaro',
      role: 'Adire dyer',
      personality: 'Indigo to the elbows; strict about the order of things.',
      position: [5.0, 3.8],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#1d2f5a', bottom: '#2c4a7a', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#2c4a7a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [8, 19],
      social: {
        lines: [
          'Fold first, then tie, then the vat. Do it out of order and the cloth tells everyone.',
          'My grandmother dyed for the Alake’s household. My hands are still blue like hers.',
          'Eleko is my favourite — cassava paste, painted by hand, then the indigo.',
        ],
        likes: ['adire-wrapper', 'lafun-ewedu', 'kokoro'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'indigo-run' }, node: 'report' },
          { when: { kind: 'meets', target: 'adire-pit' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Welcome to my compound. Baba Ogunde brings the leaves — help him, and I’ll show you how adire is made.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          report: {
            text: 'Fresh elu! The vat will be strong today. Bring it here.',
            options: [
              { label: 'Hand over the leaves', action: { kind: 'deliverJob', jobId: 'indigo-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          teach: {
            text: 'You brought my leaves — now dye with me. Three cloths: fold or paint, tie or stitch, dip, air, open. Do it in order.',
            options: [
              { label: 'Dye some cloth', action: { kind: 'startRepair', repairId: 'adire-pit' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'kemi',
      name: 'Kemi',
      role: 'Adire seller',
      personality: 'Quick-talking, knows every pattern’s name and who wore it first.',
      position: [5.0, -22.6],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#2c4a7a', bottom: '#f4f0e6', outfit: 'top-skirt', hair: 'braids', headwear: 'gele', headColor: '#2c4a7a', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'This one is Olokun — the sea goddess pattern. Very popular for weddings.',
          'People come from Lagos every weekend for adire. Then they bargain like they are from Kano.',
          'Wear adire to the office now. It is not only for grandmothers.',
        ],
        likes: ['lafun-ewedu', 'kokoro', 'ibadan-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Adire from Itoku — wrappers, scarves, bags. Every one dyed in this street. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'kemi-adire' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-ofada',
      name: 'Mama Ofada',
      role: 'Buka owner',
      personality: 'Generous with ayamase, stingy with compliments.',
      position: [-5.0, -21.2],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Ofada rice comes from here, from Ogun. Lagos people only borrowed it.',
          'Ayamase must be green and hot. If it is red, it is another stew.',
          'Lafun and ewedu on a cold morning — that is Abeokuta.',
        ],
        likes: ['oniko-scarf', 'kokoro', 'abula'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Ofada and ayamase, lafun with ewedu, kokoro for the road. Sit down.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'ofada-buka' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'adaeze',
      name: 'Adaeze',
      role: 'Visitor',
      personality: 'A textile student from Enugu with a notebook full of patterns.',
      position: [-4.8, 24],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#2c4a7a', outfit: 'top-trousers', hair: 'puff', accessory: 'glasses', height: 1.66 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'My project is on indigo across West Africa. Abeokuta is chapter one.',
          'In Enugu we have uli patterns. Adire feels like a cousin.',
          'I have photographed sixty patterns today. My phone is begging me to stop.',
        ],
        likes: ['oniko-scarf', 'ofada-ayamase-abk', 'calabar-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'under-the-rock' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'under-the-rock' }, node: 'touring' },
          { when: { kind: 'meets', target: 'under-the-rock', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'under-the-rock' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi! I’m Adaeze — I study textiles. Will you show me round? Centenary Hall, the adire market, then somewhere I can see Olumo Rock.',
            options: [
              { label: 'Guide Adaeze', action: { kind: 'acceptJob', jobId: 'under-the-rock' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦3,500 from my research grant — and ₦1,100 more if we finish before my bus. Walk, so I can take notes.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'under-the-rock' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows Itoku — Centenary Hall, the market, a view of Olumo. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m taking notes.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Olumo Rock! Under the rock — I finally understand the name. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'under-the-rock' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again — you’re in my acknowledgements now.',
            options: [{ label: 'Anytime', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'conductor-taiwo',
      name: 'Taiwo',
      role: 'Bus conductor',
      personality: 'Never stops shouting destinations, even mid-sentence.',
      position: [-4.8, 32.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#c0392b', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', headwear: 'cap', headColor: '#15130f', height: 1.74 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Lagos! Lagos! — sorry, what were you saying?',
          'The Ibadan road is smooth now. The Lagos road… pray.',
          'One more passenger and we move. Always one more.',
        ],
        likes: ['kokoro', 'ofada-ayamase-abk', 'gala'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Lagos! Ojota! Ibadan! One chance remaining — enter!',
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
    { id: 'abw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#2c4a7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-5.4, 30], [-5.4, -34], [-5.4, 30]], speed: 1.1, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI }] },
    { id: 'abw-2', look: { gender: 'female', skin: '#6b4026', top: '#1d2f5a', bottom: '#f4f0e6', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#1d2f5a' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 0.95, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'adire-runway',
      name: 'Adire Runway',
      kind: 'festival',
      venue: 'Itoku market street',
      description: 'Young designers show adire on a runway down the market street — talking drums, Egba songs, and every shade of blue.',
      hours: [18, 22],
      everyDays: 3,
      price: 3000,
      joy: 26,
      energy: 8,
    },
  ],
  spots: [
    { id: 'adire-runway-gate', kind: 'event', position: [5.6, -1.4], label: 'Adire Runway', verb: 'Go to', eventId: 'adire-runway' },
    { id: 'itoku-bench', kind: 'bench', position: [-5.6, 20.4], label: 'Bench by Centenary Hall', verb: 'Rest on' },
    { id: 'itoku-room-door', kind: 'home', position: [6.2, 13.4], label: 'Itoku Rooms', verb: 'Check', homeId: 'itoku-room' },
  ],
  homes: [
    { id: 'itoku-room', name: 'Itoku room', description: 'A quiet room over the market, with indigo curtains and Olumo Rock out of the back window. Pay once for your stay — or buy it.', moveInCost: 6000, buyPrice: 65000 },
  ],

  businesses: [
    {
      id: 'ofada-buka',
      name: 'Mama Ofada',
      kind: 'food',
      ownerNpcId: 'mama-ofada',
      greeting: 'Ogun cooking.',
      stock: [
        { itemId: 'ofada-ayamase-abk', price: 2300 },
        { itemId: 'lafun-ewedu', price: 1600 },
        { itemId: 'kokoro', price: 300 },
      ],
    },
    {
      id: 'kemi-adire',
      name: 'Kemi Adire',
      kind: 'market',
      ownerNpcId: 'kemi',
      greeting: 'Dyed in Itoku.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'adire-wrapper', price: 8000 },
        { itemId: 'oniko-scarf', price: 3000 },
        { itemId: 'indigo-tote', price: 4500 },
      ],
    },
  ],

  items: [
    { id: 'ofada-ayamase-abk', name: 'Ofada rice & ayamase', category: 'food', basePrice: 2300, consumable: true, nutrition: 48, icon: 'plate', description: 'Local brown rice from Ofada, with green-pepper ayamase stew, in a leaf.' },
    { id: 'lafun-ewedu', name: 'Lafun & ewedu', category: 'food', basePrice: 1600, consumable: true, nutrition: 42, icon: 'plate', description: 'White cassava-flour swallow with ewedu and stew — an Abeokuta favourite.' },
    { id: 'kokoro', name: 'Kokoro', category: 'food', basePrice: 300, consumable: true, nutrition: 10, icon: 'snack', description: 'Crunchy fried corn sticks, sold by the bag for the bus ride.' },
    { id: 'adire-wrapper', name: 'Adire wrapper', category: 'clothing', basePrice: 8000, icon: 'bag', description: 'Two yards of indigo eleko — cassava-paste patterns, hand-painted.' },
    { id: 'oniko-scarf', name: 'Oniko scarf', category: 'souvenir', basePrice: 3000, icon: 'key', description: 'Tie-dyed oniko circles in deep blue.' },
    { id: 'indigo-tote', name: 'Indigo tote bag', category: 'bag', basePrice: 4500, icon: 'bag', description: 'Adire cloth sewn into a bag for market day.' },
  ],

  jobs: [
    {
      id: 'indigo-run',
      title: 'Indigo Run',
      summary: "Carry Baba Ogunde's bundle of elu (indigo) leaves across Itoku to Iya Alaro's dye compound before her vat cools.",
      giverNpcId: 'baba-ogunde',
      dropoffNpcId: 'iya-alaro',
      cargo: 'Bundle of elu leaves',
      timeLimitMs: 60_000,
      reward: 2000,
      bonus: { underMs: 30_000, amount: 700 },
      cooldownMs: 25_000,
    },
    {
      id: 'under-the-rock',
      kind: 'tour',
      tour: { stops: ['abk-centenary', 'abk-itoku', 'abk-olumo'] },
      requires: { discovered: ['abk-centenary', 'abk-itoku', 'abk-olumo'] },
      title: 'Under the Rock',
      summary: 'Guide Adaeze to Centenary Hall, the adire market and the view of Olumo Rock, in that order. She takes notes as she walks — don’t lose her.',
      giverNpcId: 'adaeze',
      dropoffNpcId: 'adaeze',
      cargo: 'Guiding Adaeze',
      timeLimitMs: 220_000,
      reward: 3500,
      bonus: { underMs: 160_000, amount: 1100 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'adire-pit',
      title: 'Dye pit at Iya Alaro’s',
      npcId: 'iya-alaro',
      skill: 'dyeing',
      labels: { unit: 'Cloth', units: 'cloths', done: 'Dyed', skill: 'Adire dyeing', trade: 'Adire', hint: 'Do each step of the pattern in the right order before the vat cools.' },
      devices: [
        { name: 'Oniko wrapper', fault: 'Tied circles', steps: ['Fold the cloth', 'Tie with raffia', 'Dip in indigo', 'Air it out', 'Untie & rinse'] },
        { name: 'Eleko cloth', fault: 'Cassava-paste pattern', steps: ['Stretch the cloth', 'Paint the paste', 'Dry in the sun', 'Dip in indigo', 'Scrape the paste'] },
        { name: 'Alabere scarf', fault: 'Stitched pattern', steps: ['Stitch the pattern', 'Pull threads tight', 'Dip in indigo', 'Air it out', 'Cut the stitches'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 600,
      perfectTip: 450,
      energyCost: 12,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'indigo-run', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'keke' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
