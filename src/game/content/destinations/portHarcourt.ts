import type { DestinationPack } from '../types';

/**
 * Port Harcourt — the waterfront by Kolabi Creek (fictional businesses; the Tourist Beach on Kolabi Creek, Mile One
 * Market, Isaac Boro Park and the creek boats are real). The road runs along the water: the town on the west, the creek
 * and a jetty to the east, where canoes bring fish in from the islands. Boma lands the morning catch and needs it
 * carried to Mama Bole's grill; Pa Ebiye smokes fish the Niger Delta way and lets helpers work his kiln; Ibinabo
 * sells Kalabari cloth (bargain); Bisi, just posted here from Ibadan, wants a guide; sunset cruises leave from the
 * jetty. Ibim drives to the airport, or to the Enugu bus.
 */

const W = -11.2;
const D = 8;

export const portHarcourt: DestinationPack = {
  id: 'ph-waterfront',
  name: 'Port Harcourt',
  area: 'Waterfront',
  tagline: 'The Garden City’s waterfront — bole and fish, the creek boats, and sunsets over Kolabi Creek.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  // the road and the creekside strip, plus the jetty out over the water (the strips overlap so you can walk on)
  walkable: [[-6.9, -42, 9.2, 42], [6.5, -9.1, 16.2, -6.9]],
  walls: [],
  palette: {
    sky: '#dcd4b2',
    fog: '#cec8a6',
    ground: '#7f7a50',
    road: '#383735',
    roadLine: '#f4f0e6',
    sidewalk: '#c6bfac',
    gutter: '#4f4a45',
    sun: '#ffe2b0',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.45, crowd: 0.5, horns: 3, waves: 0.35 },
  sea: { fromX: 9.8 },
  landmarks: [
    { id: 'phc-beach', name: 'Tourist Beach, Kolabi Creek', blurb: 'The city’s waterfront on Kolabi Creek: sunsets, roasted fish and the boats heading out to the islands.', position: [7.6, 14], radius: 4 },
    { id: 'phc-mileone', name: 'Mile One Market', blurb: 'One of Port Harcourt’s busiest markets — foodstuff, fish, cloth and everything the creeks bring in.', position: [-6, -22], radius: 4 },
    { id: 'phc-boro', name: 'Isaac Boro Park', blurb: 'A green park in the old township, named after Isaac Adaka Boro, the Ijaw activist of the 1960s.', position: [-6, 4], radius: 4 },
    { id: 'phc-jetty', name: 'The creek jetty', blurb: 'Canoes and speedboats tie up here — fish in from the islands in the morning, cruises out at sunset.', position: [11, -8], radius: 3 },
  ],
  welcome: { from: 'Mama Bole', text: 'Welcome to the Garden City! My bole grill is on the waterfront — roast plantain, roast fish, pepper sauce. Come and eat, or come and work.' },

  buildings: [
    { id: 'p-w1', position: [W, -34], size: [11, 6.4, D], facing: 'east', wall: '#e6dfcf', trim: '#1d5f7a', roof: '#62564a', storeys: 2 },
    { id: 'p-w2', position: [W, -22], size: [12, 3.4, D], facing: 'east', wall: '#d9b88a', trim: '#8d3b2a', roof: '#6a3a26', storeys: 1,
      awning: '#c9583b', sign: { text: 'MILE ONE MARKET', sub: 'FISH · FOODSTUFF · CLOTH', bg: '#c9583b', fg: '#fff6e0' } },
    { id: 'p-w3', position: [W, -10], size: [10.4, 3.4, D], facing: 'east', wall: '#c8b49a', trim: '#7a3b72', roof: '#62564a', storeys: 1,
      awning: '#7a3b72', businessId: 'ibinabo-cloth', sign: { text: 'IBINABO KALABARI CLOTH', sub: 'INJIRI · PELETE BITE · BEADS', bg: '#7a3b72', fg: '#ffffff' } },
    // the park's gate and railings
    { id: 'p-w4', position: [W, 4], size: [12, 3.4, D], facing: 'east', wall: '#a8c4a0', trim: '#f4f0e6', roof: '#4f6a46', storeys: 1,
      sign: { text: 'ISAAC BORO PARK', sub: 'OLD TOWNSHIP', bg: '#2f6b3a', fg: '#ffffff' } },
    { id: 'p-w5', position: [W, 16.4], size: [10.4, 9.4, D], facing: 'east', wall: '#efe6d4', trim: '#1d5f7a', roof: '#62564a', storeys: 3, balcony: true,
      sign: { text: 'CREEKSIDE ROOMS', sub: 'ROOMS · SHORT STAYS', bg: '#ffffff', fg: '#1d5f7a' } },
    { id: 'p-w6', position: [W, 27.6], size: [10.4, 3.4, D], facing: 'east', wall: '#e9e1cf', trim: '#3a2a1c', roof: '#62564a', storeys: 1,
      sign: { text: 'PA EBIYE SMOKEHOUSE', sub: 'SMOKED FISH · CATFISH · BONGA', bg: '#3a2a1c', fg: '#f2c46a' } },
    { id: 'p-w7', position: [W, 38], size: [8.6, 6.4, D], facing: 'east', wall: '#f4f0e6', trim: '#c0392b', roof: '#62564a', storeys: 2,
      awning: '#c0392b', sign: { text: 'WATERFRONT PARK', sub: 'AIRPORT · ENUGU · ABA', bg: '#c0392b', fg: '#ffffff' } },
  ],

  props: [
    // the creek: the jetty, canoes, and a speedboat for the cruises
    { id: 'jetty', kind: 'jetty', position: [9.2, -8], rotation: Math.PI / 2 },
    { id: 'canoe-1', kind: 'canoe', position: [13, -11.4], rotation: Math.PI / 2 },
    { id: 'canoe-2', kind: 'canoe', position: [18, 2], rotation: 1.1 },
    { id: 'canoe-3', kind: 'canoe', position: [16, -22], rotation: 2.2, color: '#e9e6df' },
    { id: 'palm-1', kind: 'palm', position: [8.6, -34], collide: true },
    { id: 'palm-2', kind: 'palm', position: [8.4, 4], collide: true },
    { id: 'palm-3', kind: 'palm', position: [8.6, 24], collide: true },
    { id: 'palm-4', kind: 'palm', position: [8.6, 36], collide: true },
    // Mama Bole's grill on the waterfront, and benches facing the sunset
    { id: 'grill-bole', kind: 'grill', position: [7.6, 18.6], rotation: -Math.PI / 2, collide: true },
    { id: 'um-1', kind: 'umbrella', position: [7.4, 15.2], color: '#f2b705' },
    { id: 'bench-1', kind: 'bench', position: [8.0, 9], collide: true },
    // street side
    { id: 'stall-mileone', kind: 'stall', position: [-6.1, -19.4], rotation: Math.PI / 2, color: '#c9583b', collide: true },
    { id: 'kiln-1', kind: 'drum', position: [-6.4, 30.2], color: '#3a2a1c', collide: true },
    { id: 'tree-1', kind: 'tree', position: [-6.2, 10], collide: true },
  ],

  npcs: [
    {
      id: 'boma',
      name: 'Boma',
      role: 'Fisherman',
      personality: 'Out on the creek before dawn; talks to his canoe more than to people.',
      position: [7.2, -5.4],
      facing: Math.PI,
      look: { gender: 'male', skin: '#3f2516', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', headwear: 'cap', headColor: '#f2b705', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [6, 17],
      social: {
        lines: [
          'The creek gives what it wants. Today it wanted to give croaker.',
          'My grandfather fished from Bonny. The fish were bigger then — so he said.',
          'At sunset the water goes gold. Then the mosquitoes come.',
        ],
        likes: ['bole-fish', 'ph-malt', 'pelete-bite'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'catch-to-grill' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'catch-to-grill' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'Mama Bole is waiting for this fish for her grill. Carry the basket up the waterfront to her — the yellow umbrella.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'catch-to-grill' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,400 from Mama Bole. Reach her inside thirty seconds and she adds ₦800 — fresh fish, fresh money.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'catch-to-grill' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go! Up the waterfront, the yellow umbrella.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          rest: {
            text: 'The next canoe is still out on the creek — come back later.',
            options: [{ label: 'Will do', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'mama-bole',
      name: 'Mama Bole',
      role: 'Bole seller',
      personality: 'Fans her grill like a conductor; the best pepper sauce on the waterfront.',
      position: [6.0, 17.2],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#4a2c1c', top: '#f2b705', bottom: '#1d5f7a', outfit: 'top-skirt', hair: 'short', headwear: 'wrap', headColor: '#c9583b', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Buy from',
      hours: [9, 22],
      social: {
        lines: [
          'Bole is plantain roasted on the fire — but the fish and the pepper sauce make it Port Harcourt.',
          'Everybody passes my grill. Governors, students, fishermen. Same plate.',
          'Native soup with fresh fish — come on Sunday and taste it.',
        ],
        likes: ['injiri-wrapper', 'ph-malt', 'smoked-catfish'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'catch-to-grill' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'Bole and fish? Native soup? Periwinkle? Sit down — the plantain is just right.',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'bole-grill' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          report: {
            text: 'Boma’s fish! Still shining. Bring it to the fire.',
            options: [
              { label: 'Hand over the basket', action: { kind: 'deliverJob', jobId: 'catch-to-grill' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'pa-ebiye',
      name: 'Pa Ebiye',
      role: 'Fish smoker',
      personality: 'Smells permanently of smoke and is proud of it.',
      position: [-5.0, 27.6],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#e8e6e0', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#1d5f7a', height: 1.72 },
      promptVerb: 'Talk to',
      hours: [7, 19],
      social: {
        lines: [
          'Smoked fish keeps for weeks. That is how the creeks fed the cities before fridges.',
          'Gut, wash, lay, fire, turn. Skip one and the fish tells you.',
          'My kiln is older than my children. Older than me, maybe.',
        ],
        likes: ['native-soup', 'bole-fish', 'mini-canoe'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'meets', target: 'fish-kiln' }, node: 'teach' },
          { node: 'hello' },
        ],
        nodes: {
          hello: {
            text: 'This is a smokehouse — fish from the creeks, smoked the old way. Help Boma bring in his catch and I’ll show you the kiln.',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          teach: {
            text: 'You helped with Boma’s catch — come to the kiln. Three racks: gut, wash, lay, fire, turn. In that order.',
            options: [
              { label: 'Work the kiln', action: { kind: 'startRepair', repairId: 'fish-kiln' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ibinabo',
      name: 'Ibinabo',
      role: 'Cloth seller',
      personality: 'Elegant, unhurried; knows which family wore which pattern to which wedding.',
      position: [-5.0, -8],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#7a3b72', bottom: '#c9583b', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#7a3b72', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Bargain with',
      hours: [9, 19],
      social: {
        lines: [
          'Pelete bite: we cut threads out of the cloth, one by one, to make the pattern. Kalabari women’s work.',
          'Injiri is the checked cloth our men wear. Every family has its favourite.',
          'You bargain like Mile One. I like it.',
        ],
        likes: ['bole-fish', 'coral-necklace', 'ph-postcard'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Kalabari cloth — pelete bite, injiri, beads. Real things from the Delta. Make me an offer.',
            options: [
              { label: 'Let me see', action: { kind: 'openShop', businessId: 'ibinabo-cloth' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'bisi-ph',
      name: 'Bisi',
      role: 'Visitor',
      personality: 'Just posted to Port Harcourt from Ibadan; determined to like it.',
      position: [-4.8, 20],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long', accessory: 'glasses', height: 1.67 },
      promptVerb: 'Talk to',
      hours: [9, 18],
      social: {
        lines: [
          'In Ibadan we have hills. Here they have water everywhere. I’m adjusting.',
          'Everyone told me: eat bole first. I ate bole first. They were right.',
          'My office is in Trans-Amadi. My heart is on this waterfront now.',
        ],
        likes: ['bole-fish', 'pelete-bite', 'abula'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'garden-city-walk' }, node: 'end' },
          { when: { kind: 'jobActive', jobId: 'garden-city-walk' }, node: 'touring' },
          { when: { kind: 'meets', target: 'garden-city-walk', not: true }, node: 'locked' },
          { when: { kind: 'jobAvailable', jobId: 'garden-city-walk' }, node: 'offer' },
          { node: 'thanks' },
        ],
        nodes: {
          offer: {
            text: 'Hi — Bisi, just posted here from Ibadan. Will you show me round? Mile One, Isaac Boro Park, then the beach on the creek.',
            options: [
              { label: 'Guide Bisi', action: { kind: 'acceptJob', jobId: 'garden-city-walk' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦4,200 — and ₦1,300 more if we make the beach before sunset. Walk, I’m still learning the roads.',
            options: [
              { label: "Let's go", action: { kind: 'acceptJob', jobId: 'garden-city-walk' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          locked: {
            text: 'I need someone who knows the waterfront — Mile One, Isaac Boro Park, the beach. Find them first, then come back for me?',
            options: [{ label: 'I will', action: { kind: 'close' } }],
          },
          touring: {
            text: 'Lead on — I’m saving every place in my phone.',
            options: [{ label: 'Follow me', action: { kind: 'close' } }],
          },
          end: {
            text: 'Look at that creek. Okay — I think I can live here. Thank you!',
            options: [
              { label: 'Finish the walk', action: { kind: 'deliverJob', jobId: 'garden-city-walk' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          thanks: {
            text: 'Thank you again! This weekend: the sunset cruise.',
            options: [{ label: 'Enjoy', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'driver-ibim',
      name: 'Ibim',
      role: 'Taxi driver',
      personality: 'Knows every shortcut around Ikwerre Road’s traffic — and every story.',
      position: [-4.8, 32.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'The airport is at Omagwa — far, fifty minutes. Leave early.',
          'Enugu by bus is four and a half hours, through Aba. Buy okpa at the stop.',
          'They call it the Garden City. Old Port Harcourt was all gardens.',
        ],
        likes: ['bole-fish', 'ph-plantain-chips', 'ph-malt'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Airport? Fifty minutes to Omagwa. Or the Enugu bus is right there — four and a half hours.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Take the bus to Enugu', action: { kind: 'openTravel', by: 'coach' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'pw-1', look: { gender: 'male', skin: '#3f2516', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low' }, path: [[6.0, 28], [6.0, -28], [6.0, 28]], speed: 1.0, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'pw-2', look: { gender: 'female', skin: '#5a3420', top: '#f4f0e6', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#7a3b72' }, path: [[-5.4, -30], [-5.4, 34]], speed: 0.95 },
  ],

  events: [
    {
      id: 'creek-cruise',
      name: 'Sunset creek cruise',
      kind: 'festival',
      venue: 'The creek jetty',
      description: 'An hour on Kolabi Creek in an open boat as the sun goes down — mangroves, fishing canoes, and the city lights coming on behind you.',
      hours: [17, 19],
      price: 4500,
      joy: 30,
      energy: 6,
    },
  ],
  spots: [
    { id: 'creek-cruise-gate', kind: 'event', position: [7.6, -4.2], label: 'Sunset creek cruise', verb: 'Go to', eventId: 'creek-cruise' },
    { id: 'waterfront-bench', kind: 'bench', position: [7.2, 9], label: 'Bench by the creek', verb: 'Rest on' },
    { id: 'creek-room-door', kind: 'home', position: [-6.2, 16.4], label: 'Creekside Rooms', verb: 'Check', homeId: 'creek-room' },
  ],
  homes: [
    { id: 'creek-room', name: 'Creekside room', description: 'A room over the waterfront, the boats’ engines in the morning and the sunset in the window. Pay once for your stay — or buy it.', moveInCost: 9000, buyPrice: 120000 },
  ],

  businesses: [
    {
      id: 'bole-grill',
      name: 'Mama Bole',
      kind: 'food',
      ownerNpcId: 'mama-bole',
      greeting: 'Bole, fish, pepper sauce.',
      stock: [
        { itemId: 'bole-fish', price: 2500 },
        { itemId: 'native-soup', price: 3200 },
        { itemId: 'periwinkle-pepper', price: 1500 },
      ],
    },
    {
      id: 'ibinabo-cloth',
      name: 'Ibinabo Kalabari Cloth',
      kind: 'market',
      ownerNpcId: 'ibinabo',
      greeting: 'From the Delta.',
      haggle: { floor: 0.7, patience: 3 },
      stock: [
        { itemId: 'pelete-bite', price: 9000 },
        { itemId: 'injiri-wrapper', price: 7000 },
        { itemId: 'smoked-catfish', price: 3500 },
      ],
    },
  ],

  items: [
    { id: 'bole-fish', name: 'Bole & fish', category: 'food', basePrice: 2500, consumable: true, nutrition: 48, icon: 'plate', description: 'Roasted plantain with grilled fish and hot pepper sauce — the Port Harcourt classic.' },
    { id: 'native-soup', name: 'Native soup & fufu', category: 'food', basePrice: 3200, consumable: true, nutrition: 52, icon: 'plate', description: 'Kalabari native soup, rich with fresh fish and seafood.' },
    { id: 'periwinkle-pepper', name: 'Pepper periwinkle', category: 'food', basePrice: 1500, consumable: true, nutrition: 22, icon: 'snack', description: 'Little sea snails in a hot pepper sauce, picked out with a toothpick.' },
    { id: 'pelete-bite', name: 'Pelete bite cloth', category: 'souvenir', basePrice: 9000, icon: 'bag', description: 'Kalabari cut-thread cloth: threads removed one by one to make the pattern.' },
    { id: 'injiri-wrapper', name: 'Injiri wrapper', category: 'clothing', basePrice: 7000, icon: 'bag', description: 'The checked cloth Kalabari men wear for big days.' },
    { id: 'smoked-catfish', name: 'Smoked catfish', category: 'goods', basePrice: 3500, icon: 'bag', description: 'From Pa Ebiye’s kiln — keeps for weeks, perfect for soup back home.' },
  ],

  jobs: [
    {
      id: 'catch-to-grill',
      title: 'Catch to the Grill',
      summary: "Carry Boma's basket of fresh fish from the jetty up the waterfront to Mama Bole's grill while it still shines.",
      giverNpcId: 'boma',
      dropoffNpcId: 'mama-bole',
      cargo: 'Basket of fresh fish',
      timeLimitMs: 60_000,
      reward: 2400,
      bonus: { underMs: 30_000, amount: 800 },
      cooldownMs: 25_000,
    },
    {
      id: 'garden-city-walk',
      kind: 'tour',
      tour: { stops: ['phc-mileone', 'phc-boro', 'phc-beach'] },
      requires: { discovered: ['phc-mileone', 'phc-boro', 'phc-beach'] },
      title: 'Garden City Walk',
      summary: 'Guide Bisi to Mile One Market, Isaac Boro Park and the beach on Kolabi Creek, in that order. She’s still learning the roads — don’t lose her.',
      giverNpcId: 'bisi-ph',
      dropoffNpcId: 'bisi-ph',
      cargo: 'Guiding Bisi',
      timeLimitMs: 220_000,
      reward: 4200,
      bonus: { underMs: 160_000, amount: 1300 },
      cooldownMs: 120_000,
    },
  ],

  repairs: [
    {
      id: 'fish-kiln',
      title: 'Pa Ebiye’s smokehouse',
      npcId: 'pa-ebiye',
      skill: 'smoking',
      labels: { unit: 'Rack', units: 'racks', done: 'Smoked', skill: 'Fish smoking', trade: 'Smokehouse', hint: 'Do each step in the right order before the fire dies down.' },
      devices: [
        { name: 'Catfish rack', fault: 'Slow smoke', steps: ['Gut the fish', 'Wash in salt water', 'Lay on the rack', 'Feed the fire', 'Turn and smoke'] },
        { name: 'Bonga rack', fault: 'Small fish', steps: ['Wash in salt water', 'Lay on the rack', 'Feed the fire', 'Turn and smoke', 'Pack in baskets'] },
        { name: 'Croaker rack', fault: 'Big fish', steps: ['Gut the fish', 'Score the sides', 'Lay on the rack', 'Feed the fire', 'Turn and smoke'] },
      ],
      perSession: 3,
      seconds: 11,
      perLevel: 1.2,
      payPerDevice: 650,
      perfectTip: 500,
      energyCost: 14,
      minEnergy: 20,
      requires: { jobsDone: { jobId: 'catch-to-grill', count: 1 } },
    },
  ],

  traffic: {
    lanes: [{ x: 2, dir: 1 }, { x: -2, dir: -1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d5f7a' }],
    speed: [4, 6.5],
  },
  startingMoney: 0,
};
