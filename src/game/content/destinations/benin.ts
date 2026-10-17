import type { DestinationPack } from '../types';

/**
 * Benin City — King's Square (fictional businesses; the National Museum in King's Square, Igun Street's guild of
 * bronze casters, the Emotan statue at Oba Market and the old city moat are real). The museum and Oba Market are on
 * the west side; Igun Street's workshops on the east, the furnaces glowing at the doors; at the north end the street
 * stops at a cut of the old moat. Mama Osas sells charcoal at Oba Market and needs a sack carried to Pa Osayande's
 * workshop; once you've helped, he lets you cast (lost wax, in order); Eghosa sells bronzes and coral beads
 * (bargain); Nosa, home from Houston after twenty years, wants a guide. Taxis to the airport and the long bus to
 * Lagos leave from the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

export const benin: DestinationPack = {
  id: 'benin-kings-square',
  name: 'Benin City',
  area: 'King’s Square',
  tagline: 'King’s Square — the museum, Igun Street’s bronze casters, black soup and coral beads.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  walls: [],
  palette: {
    sky: '#e6d4aa',
    fog: '#d8c6a0',
    ground: '#8e6a48',
    road: '#3a3734',
    roadLine: '#efe4c8',
    sidewalk: '#c8b8a0',
    gutter: '#4f4a45',
    sun: '#ffe4b0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.5, crowd: 0.6, horns: 3, chimes: 0.6 },
  vista: 'north',
  vistaStyle: 'moat',
  landmarks: [
    { id: 'bnn-museum', name: 'National Museum, King’s Square', blurb: 'In the middle of King’s Square: bronzes, ivories and terracottas from the Benin kingdom and beyond.', position: [-4.6, -8], radius: 4 },
    { id: 'bnn-igun', name: 'Igun Street', blurb: 'Home of the guild of bronze and brass casters, who have worked for the Oba for centuries and still cast by the lost-wax method.', position: [4.6, -12], radius: 5 },
    { id: 'bnn-emotan', name: 'Emotan statue', blurb: 'At Oba Market stands Emotan, a market woman remembered in Edo history for her kindness and her loyalty to Oba Ewuare.', position: [-4.6, 14], radius: 4 },
    { id: 'bnn-moat', name: 'The old city moat', blurb: 'Part of the great earthworks — ditches and banks dug around the city and its villages over centuries. Stretches still cut through Benin today.', position: [0, -38], radius: 5 },
  ],
  welcome: { from: 'Pa Osayande', text: 'Kóyo! Welcome to Benin. I cast bronze on Igun Street, as my father did. Bring me charcoal from Mama Osas and I’ll show you the work.' },

  buildings: [
    { id: 'n-e1', position: [E, -35], size: [10, 6.4, D], facing: 'west', wall: '#d9c0a0', trim: '#5b3a24', roof: '#7a4a2e', storeys: 2 },
    { id: 'n-e2', position: [E, -22.8], size: [11.4, 3.4, D], facing: 'west', wall: '#c99a6a', trim: '#3a2a1c', roof: '#6a3a26', storeys: 1,
      awning: '#5b3a24', sign: { text: 'IGUN STREET', sub: 'GUILD OF BRONZE & BRASS CASTERS', bg: '#5b3a24', fg: '#f2c46a' } },
    { id: 'n-e3', position: [E, -11.2], size: [12, 3.4, D], facing: 'west', wall: '#d0a878', trim: '#3a2a1c', roof: '#6a3a26', storeys: 1,
      awning: '#8a3a2a', businessId: 'eghosa-bronzes', sign: { text: 'EGHOSA BRONZES', sub: 'BRONZE · CORAL · CARVING', bg: '#8a3a2a', fg: '#f6efe2' } },
    { id: 'n-e4', position: [E, 0.4], size: [10.4, 3.4, D], facing: 'west', wall: '#c8a07a', trim: '#3a2a1c', roof: '#6a3a26', storeys: 1,
      sign: { text: 'PA OSAYANDE & SONS', sub: 'CASTING SINCE 1950', bg: '#3a2a1c', fg: '#f2c46a' } },
    { id: 'n-e5', position: [E, 12.4], size: [10.4, 9.4, D], facing: 'west', wall: '#efe6d4', trim: '#8a3a2a', roof: '#7a4a2e', storeys: 3, balcony: true,
      sign: { text: 'KING’S SQUARE ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#8a3a2a' } },
    { id: 'n-e6', position: [E, 24.4], size: [10.4, 6.4, D], facing: 'west', wall: '#d9cbb3', trim: '#2c4a7a', roof: '#7a4a2e', storeys: 2 },
    { id: 'n-e7', position: [E, 36], size: [10, 6.4, D], facing: 'west', wall: '#f4f0e6', trim: '#c0392b', roof: '#7a4a2e', storeys: 2,
      awning: '#c0392b', sign: { text: 'RING ROAD MOTOR PARK', sub: 'LAGOS · AIRPORT · AUCHI', bg: '#c0392b', fg: '#ffffff' } },

    { id: 'n-w1', position: [W, -35], size: [10, 6.4, D], facing: 'east', wall: '#e2d6c0', trim: '#1f6f4a', roof: '#7a4a2e', storeys: 2 },
    // the museum: a broad, low, round-cornered building in the square
    { id: 'n-w2', position: [W, -10], size: [18, 9.4, D], facing: 'east', wall: '#e9e4d8', trim: '#5b3a24', roof: '#6a5a4a', storeys: 2, style: 'glass',
      sign: { text: 'NATIONAL MUSEUM', sub: 'KING’S SQUARE · BENIN CITY', bg: '#5b3a24', fg: '#f2c46a' } },
    { id: 'n-w3', position: [W, 4], size: [10.4, 3.4, D], facing: 'east', wall: '#f0c75e', trim: '#2a2a2a', roof: '#7a4a2e', storeys: 1,
      awning: '#1f6f4a', businessId: 'ivie-kitchen', sign: { text: 'IVIE’S KITCHEN', sub: 'BLACK SOUP · OWO · BANGA', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'n-w4', position: [W, 16], size: [12, 3.4, D], facing: 'east', wall: '#d9b88a', trim: '#8a3a2a', roof: '#6a3a26', storeys: 1,
      awning: '#c9583b', sign: { text: 'OBA MARKET', sub: 'FOODSTUFF · CHARCOAL · CLOTH', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'n-w5', position: [W, 28], size: [10.4, 6.4, D], facing: 'east', wall: '#dfd2bb', trim: '#3d5f8a', roof: '#7a4a2e', storeys: 2 },
    { id: 'n-w6', position: [W, 38.4], size: [8, 3.4, D], facing: 'east', wall: '#e8e6e0', trim: '#c0392b', roof: '#7a4a2e', storeys: 1 },
  ],

  props: [
    // Igun Street: furnaces at the workshop doors and finished pieces out front
    { id: 'furnace-1', kind: 'drum', position: [6.4, -18.6], color: '#3a2a1c', collide: true },
    { id: 'furnace-2', kind: 'drum', position: [6.4, 3.6], color: '#3a2a1c', collide: true },
    { id: 'bronze-1', kind: 'statue', position: [6.6, -6.4], rotation: -Math.PI / 2, color: '#8a6234' },
    { id: 'crates-1', kind: 'crates', position: [6.4, -26.4], collide: true },
    // Emotan at Oba Market
    { id: 'emotan', kind: 'statue', position: [-6.8, 12.4], rotation: Math.PI / 2, color: '#7a5230' },
    { id: 'stall-osas', kind: 'stall', position: [-6.1, 19.4], rotation: Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'um-1', kind: 'umbrella', position: [-5.6, 22.6], color: '#f2b705' },
    { id: 'tree-1', kind: 'tree', position: [-6.2, -24], collide: true },
    { id: 'tree-2', kind: 'tree', position: [6.3, 20], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, -1], collide: true },
    // the motor park: the long-distance bus, and a taxi for the airport
    { id: 'park-bus', kind: 'danfo', position: [3.9, 31], rotation: 0, color: '#e8e6e0', collide: true },
  ],

  npcs: [
    {
      id: 'mama-osas',
      name: 'Mama Osas',
      role: 'Charcoal seller',
      personality: 'Soot on her hands, gold in her laugh; sells to every caster on Igun Street.',
      position: [-5.0, 21.4],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#c9583b', bottom: '#2a2a2a', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'No charcoal, no bronze. The casters forget, but I don’t.',
          'Emotan sold in this market too, five hundred years ago. We still greet her.',
          'Black soup is not black. It is the leaves. Ask Ivie.',
        ],
        likes: ['black-soup', 'coral-necklace', 'bni-chin-chin'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'charcoal-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'charcoal-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Pa Osayande’s furnace is waiting for this charcoal. Carry the sack to his workshop on Igun Street — across the road, the black sign.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'charcoal-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Pa. Reach him inside thirty seconds and he adds ₦750 — the metal is already in the pot.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'charcoal-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Across the road, the black sign.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you! The next sack is still coming from Ekenwan Road — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'pa-osayande',
      name: 'Pa Osayande',
      role: 'Bronze caster',
      personality: 'Quiet hands, loud furnace; four generations of casting behind him.',
      position: [5.0, 1.8],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#e8e6e0', bottom: '#5b3a24', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#8a3a2a', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [8, 19],
      social: {
        lines: [
          'Wax first, then clay, then fire. The wax runs out and the bronze takes its place.',
          'My great-grandfather cast for the palace. I cast for whoever pays — and still for the palace.',
          'Do not rush the mould. A cracked mould is a week gone.',
        ],
        likes: ['black-soup', 'owo-starch', 'benin-postcard'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'charcoal-run' }, node: 'report' },
          { when: { kind: 'meets', target: 'bronze-workshop' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Kóyo. This is a casting house — four generations. Bring Mama Osas’s charcoal and I’ll let you work with me.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          report: {
            text: 'Charcoal! Good — the furnace was getting lazy. Put it down here.',
            options: [
              { label: 'Hand over the sack', action: { kind: 'deliverJob', jobId: 'charcoal-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          teach: {
            text: 'You brought the charcoal — now cast with me. Three pieces, the lost-wax way. Every step in its place.',
            options: [
              { label: 'Cast some bronze', action: { kind: 'startRepair', repairId: 'bronze-workshop' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'eghosa',
      name: 'Eghosa',
      role: 'Bronze and bead seller',
      personality: 'Smooth talker, knows the story behind every piece — and its price.',
      position: [5.0, -11.2],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#8a3a2a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', height: 1.78 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'Every piece here was cast on this street. Look at the chasing — that is handwork.',
          'Coral beads are for chiefs and brides. And for people who bargain well.',
          'Tourists ask me about the old bronzes in London. I tell them: come and see the new ones here.',
        ],
        likes: ['owo-starch', 'mini-bronze', 'adire-wrapper'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Bronze from Igun Street, coral beads, carvings. Cast here, sold here. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'eghosa-bronzes' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ivie-cook',
      name: 'Mama Ivie',
      role: 'Cook',
      personality: 'Feeds half of Ring Road, scolds the other half.',
      position: [-5.0, 6.2],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#1f6f4a', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [8, 21],
      social: {
        lines: [
          'Black soup — omoebe — is many leaves pounded together. That is why it is dark.',
          'Owo soup with starch, that is Edo comfort.',
          'The casters eat here at noon. You can smell the furnace on their clothes.',
        ],
        likes: ['coral-necklace', 'bni-chin-chin', 'kokoro'],
      },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Black soup and pounded yam, owo soup with starch, banga — sit down, my child.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'ivie-kitchen' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'nosa',
      name: 'Nosa',
      role: 'Visitor',
      personality: 'Home from Houston after twenty years; Edo coming back to him word by word.',
      position: [-4.8, 26],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'hightop', accessory: 'glasses', height: 1.82 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'Twenty years in Houston. The first thing I did here was eat black soup.',
          'My kids think Benin is only the bronzes in museums abroad. I’m sending them pictures of the real thing.',
          'My grandmother sold at Oba Market. Right by Emotan.',
        ],
        likes: ['black-soup', 'mini-bronze', 'benin-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'kings-square-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'kings-square-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'kings-square-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'kings-square-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hey — I’m Nosa. I grew up here, then twenty years in Houston. Show me the old places again? The museum, Igun Street, then Emotan.',
            options: [
              { label: 'Guide Nosa', action: { kind: 'acceptJob', jobId: 'kings-square-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,000 — and ₦1,250 more if we’re done before my mother calls me home. Walk, so I can take pictures.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'kings-square-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the square now — the museum, Igun Street, Emotan. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m taking pictures for my kids.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Emotan… my grandmother used to greet her every morning. Thank you. Really.',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'kings-square-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again. If you’re ever in Houston, the jollof is on me — it’s not as good, but it’s on me.',
            options: [{ label: 'Deal', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'driver-uyi',
      name: 'Uyi',
      role: 'Taxi driver',
      personality: 'Drives Ring Road like he built it.',
      position: [-4.8, 32.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Airport is close — twenty minutes, even with Ring Road traffic.',
          'Lagos by road is six hours. By plane, one. Your choice, your pocket.',
          'Benin people are proud. Of the bronzes, the moat, the Oba. And the black soup.',
        ],
        likes: ['black-soup', 'bni-chin-chin', 'benin-malt'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Twenty minutes. Or the Lagos bus is right there — six hours, but cheaper.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Take the bus to Lagos', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'bnw-1', look: { gender: 'female', skin: '#5a3420', top: '#8a3a2a', bottom: '#f4f0e6', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#8a3a2a' }, path: [[-5.4, 30], [-5.4, -34], [-5.4, 30]], speed: 0.95, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI }] },
    { id: 'bnw-2', look: { gender: 'male', skin: '#4a2c1c', top: '#2c4a7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[3.4, 28], [3.4, -24], [3.4, 28]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 9, face: Math.PI / 2 }] },
  ],

  events: [
    {
      id: 'benin-highlife-night',
      name: 'Highlife at King’s Square',
      kind: 'concert',
      venue: 'King’s Square, by the museum',
      description: 'A highlife band under the lights by the museum — Benin has given Nigeria some of its best guitar music, and the square dances to it.',
      hours: [19, 23],
      everyDays: 2,
      price: 3000,
      joy: 26,
      energy: 8,
    },
  ],
  spots: [
    { id: 'benin-highlife-night-gate', kind: 'event', position: [-5.6, -18], label: 'Highlife at King’s Square', verb: 'Go to', eventId: 'benin-highlife-night' },
    { id: 'kings-square-bench', kind: 'bench', position: [-5.6, -1], label: 'Bench by the museum', verb: 'Rest on' },
    { id: 'kings-square-room-door', kind: 'home', position: [6.2, 12.4], label: 'King’s Square Rooms', verb: 'Check', homeId: 'kings-square-room' },
  ],
  homes: [
    { id: 'kings-square-room', name: 'King’s Square room', description: 'A room two floors up, the furnaces of Igun Street glowing below and the museum across the square. Pay once for your stay — or buy it.', moveInCost: 7000, buyPrice: 85000 },
  ],

  businesses: [
    {
      id: 'ivie-kitchen',
      name: 'Ivie’s Kitchen',
      kind: 'food',
      ownerNpcId: 'ivie-cook',
      greeting: 'Edo cooking.',
      stock: [
        { itemId: 'black-soup', price: 2600 },
        { itemId: 'owo-starch', price: 2400 },
        { itemId: 'banga-starch', price: 2600 },
      ],
    },
    {
      id: 'eghosa-bronzes',
      name: 'Eghosa Bronzes',
      kind: 'market',
      ownerNpcId: 'eghosa',
      greeting: 'Cast on Igun Street.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'bronze-plaque', price: 12000 },
        { itemId: 'bronze-bell', price: 6000 },
        { itemId: 'coral-necklace', price: 6500 },
      ],
    },
  ],

  items: [
    { id: 'black-soup', name: 'Black soup & pounded yam', category: 'food', basePrice: 2600, consumable: true, nutrition: 52, icon: 'plate', description: 'Omoebe — a dark soup of pounded leaves, fish and meat, with pounded yam.' },
    { id: 'owo-starch', name: 'Owo soup & starch', category: 'food', basePrice: 2400, consumable: true, nutrition: 48, icon: 'plate', description: 'Palm-oil soup thickened the Edo way, with glossy cassava starch.' },
    { id: 'banga-starch', name: 'Banga soup & starch', category: 'food', basePrice: 2600, consumable: true, nutrition: 50, icon: 'plate', description: 'Rich palm-fruit soup with catfish, and starch on the side.' },
    { id: 'bronze-plaque', name: 'Bronze plaque', category: 'souvenir', basePrice: 12000, icon: 'key', description: 'A new plaque cast on Igun Street in the old court style — a warrior and two attendants.' },
    { id: 'bronze-bell', name: 'Brass bell', category: 'souvenir', basePrice: 6000, icon: 'key', description: 'A small cast bell with a leopard on the handle.' },
    { id: 'coral-necklace', name: 'Coral-bead necklace', category: 'clothing', basePrice: 6500, icon: 'key', description: 'Red coral-style beads, the kind worn at Edo weddings.' },
  ],

  jobs: [
    {
      id: 'charcoal-run',
      title: 'Charcoal Run',
      summary: "Carry Mama Osas's sack of charcoal across the square to Pa Osayande's casting house on Igun Street before his furnace cools.",
      giverNpcId: 'mama-osas',
      dropoffNpcId: 'pa-osayande',
      cargo: 'Sack of charcoal',
      timeLimitMs: 60_000,
      reward: 2200,
      bonus: { underMs: 30_000, amount: 750 },
      cooldownMs: 25_000,
    },
    {
      id: 'kings-square-walk',
      kind: 'tour',
      tour: { stops: ['bnn-museum', 'bnn-igun', 'bnn-emotan'] },
      requires: { discovered: ['bnn-museum', 'bnn-igun', 'bnn-emotan'] },
      title: 'Coming Home',
      summary: 'Guide Nosa to the National Museum, Igun Street and the Emotan statue, in that order. He takes pictures as he goes — don’t lose him.',
      giverNpcId: 'nosa',
      dropoffNpcId: 'nosa',
      cargo: 'Guiding Nosa',
      timeLimitMs: 220_000,
      reward: 4000,
      bonus: { underMs: 160_000, amount: 1250 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'bronze-workshop',
      title: 'Casting house on Igun Street',
      npcId: 'pa-osayande',
      skill: 'casting',
      labels: { unit: 'Casting', units: 'castings', done: 'Cast', skill: 'Bronze casting', trade: 'Bronze', hint: 'Do each step of the lost-wax method in the right order before the metal cools.' },
      devices: [
        { name: 'Small bronze head', fault: 'Lost wax', steps: ['Model in wax', 'Coat in clay', 'Melt out the wax', 'Pour the bronze', 'Break the mould'] },
        { name: 'Court plaque', fault: 'Figures in relief', steps: ['Shape the wax plaque', 'Add the figures', 'Coat in clay', 'Pour the bronze', 'Chase the details'] },
        { name: 'Leopard bell', fault: 'Hollow casting', steps: ['Make the clay core', 'Wax over the core', 'Coat in clay', 'Pour the bronze', 'File and polish'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 650,
      perfectTip: 500,
      energyCost: 14,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'charcoal-run', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#8a3a2a' }],
    speed: [3.5, 6],
  },
  startingMoney: 0,
};
