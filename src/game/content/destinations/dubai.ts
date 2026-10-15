import type { DestinationPack } from '../types';

/**
 * Dubai Creek, by the old Al Fahidi quarter — a paved creekside promenade (fictional businesses).
 * Sand-coloured souk buildings on the west, the creek and its water taxis to the east.
 * Rashid sells spices (bargain with him), Maryam runs a karak tea café that needs hands,
 * and Chef Ngozi from Lagos cooks jollof for homesick Nigerians — the spice run links them.
 * Prices are in the one wallet (naira); shops show the dirham equivalent as a guide.
 */

const W = -11;
const D = 8;

export const dubai: DestinationPack = {
  id: 'dubai-creek',
  name: 'Dubai',
  area: 'Dubai Creek',
  tagline: 'Spice souk lanes, karak tea and water taxis on the creek.',
  country: 'United Arab Emirates',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  localCurrency: { code: 'AED', symbol: 'AED ', perUnit: 400 },
  spawn: { position: [0, 36], facing: Math.PI },
  arrival: { position: [0, 36], facing: Math.PI },
  walkable: [[-6.8, -42, 8.6, 42]],
  walls: [],
  palette: {
    sky: '#f1dcb2',
    fog: '#ead6ae',
    ground: '#c8a57a',
    road: '#cdb48e',
    roadLine: '#f4ead2',
    sidewalk: '#d9c4a0',
    gutter: '#8a7356',
    sun: '#fff0cf',
  },
  road: { halfWidth: 3.2, sidewalk: 2.8, length: 86, style: 'paved' },
  sea: { fromX: 9.4 },
  ambience: { traffic: 0.15, crowd: 0.7, horns: 1, waves: 0.35 },
  landmarks: [
    { id: 'dubai-creek-front', name: 'The creek front', blurb: 'Wooden water taxis cross the creek all day for a few dirhams.', position: [7, 10], radius: 4 },
    { id: 'dubai-spice-lane', name: 'Spice lane', blurb: 'Sacks of saffron, cardamom, dried lemons and frankincense — follow your nose.', position: [-4.5, -6], radius: 3.5 },
    { id: 'dubai-wind-towers', name: 'Wind-tower houses', blurb: 'Old coral-stone houses cooled by tall wind towers, long before air conditioning.', position: [-4.5, -34], radius: 4 },
  ],
  welcome: { from: 'Chef Ngozi', text: 'Ah, a Lagos face in Dubai! Welcome, my dear. Come and eat at my kitchen on the creek — and if you need work, Rashid at the spice house always has errands.' },

  buildings: [
    { id: 'd-w1', position: [W, -34], size: [10.4, 9.4, D], facing: 'east', wall: '#e3cfa9', trim: '#8a6a44', roof: '#b89a72', storeys: 3, balcony: true,
      sign: { text: 'AL FAHIDI HERITAGE HOUSE', sub: 'GALLERY · COURTYARD · TEA', bg: '#8a6a44', fg: '#f4ead2' } },
    { id: 'd-w2', position: [W, -23], size: [10.4, 6.4, D], facing: 'east', wall: '#d9c09a', trim: '#5c3d22', roof: '#a88c66', storeys: 2,
      awning: '#1f5f6f', sign: { text: 'SOUK TEXTILES', sub: 'PASHMINA · SILK · TAILORING', bg: '#1f5f6f', fg: '#f4ead2' } },
    { id: 'd-w3', position: [W, -12], size: [10.4, 6.4, D], facing: 'east', wall: '#e8d4ae', trim: '#9c3b22', roof: '#b0916a', storeys: 2,
      awning: '#9c3b22', businessId: 'rashid-spices', sign: { text: 'AL FAHIDI SPICE HOUSE', sub: 'SAFFRON · CARDAMOM · FRANKINCENSE', bg: '#9c3b22', fg: '#f6e3b0' } },
    { id: 'd-w4', position: [W, -1], size: [10.4, 9.4, D], facing: 'east', wall: '#d6bf96', trim: '#3d5f6a', roof: '#a5896a', storeys: 3, balcony: true },
    { id: 'd-w5', position: [W, 10], size: [10.4, 6.4, D], facing: 'east', wall: '#f0e2c4', trim: '#6b3f6a', roof: '#b39572', storeys: 2,
      awning: '#6b3f6a', businessId: 'creek-karak', sign: { text: 'CREEK KARAK CAFÉ', sub: 'KARAK · LUQAIMAT · SANDWICHES', bg: '#6b3f6a', fg: '#f6e3b0' } },
    { id: 'd-w6', position: [W, 21], size: [10.4, 6.4, D], facing: 'east', wall: '#2f7a52', trim: '#f2b705', roof: '#7c6a58', storeys: 2,
      awning: '#f2b705', businessId: 'ngozi-kitchen', sign: { text: "CHEF NGOZI'S NAIJA KITCHEN", sub: 'JOLLOF · SUYA · PUFF-PUFF', bg: '#f2b705', fg: '#15130f' } },
    { id: 'd-w7', position: [W, 32], size: [10.4, 9.4, D], facing: 'east', wall: '#e9dcc2', trim: '#4a5a72', roof: '#a88e6c', storeys: 3, balcony: true,
      sign: { text: 'CREEK STUDIOS', sub: 'FURNISHED · MONTHLY · TO BUY', bg: '#ffffff', fg: '#4a5a72' } },
  ],

  props: [
    { id: 'palm-1', kind: 'palm', position: [7.4, 32], collide: true },
    { id: 'palm-2', kind: 'palm', position: [7.4, 18], collide: true },
    { id: 'palm-3', kind: 'palm', position: [7.4, -2], collide: true },
    { id: 'palm-4', kind: 'palm', position: [7.4, -18], collide: true },
    { id: 'palm-5', kind: 'palm', position: [7.4, -36], collide: true },
    { id: 'stall-1', kind: 'stall', position: [-5.4, -9], rotation: Math.PI / 2, color: '#9c3b22', collide: true },
    { id: 'stall-2', kind: 'stall', position: [-5.4, -16], rotation: Math.PI / 2, color: '#c98a2a', collide: true },
    { id: 'crates-1', kind: 'crates', position: [-5.9, -20], collide: true },
    { id: 'um-1', kind: 'umbrella', position: [4.6, 6], color: '#6b3f6a' },
    { id: 'um-2', kind: 'umbrella', position: [4.6, 26], color: '#2f7a52' },
    { id: 'bench-1', kind: 'bench', position: [7.6, 6], rotation: Math.PI / 2, collide: true },
    { id: 'bench-2', kind: 'bench', position: [7.6, -10], rotation: Math.PI / 2, collide: true },
    { id: 'pole-1', kind: 'pole', position: [8.4, 26] },
    { id: 'pole-2', kind: 'pole', position: [8.4, 0] },
    { id: 'pole-3', kind: 'pole', position: [8.4, -28] },
  ],

  npcs: [
    {
      id: 'rashid',
      name: 'Rashid',
      role: 'Spice merchant',
      personality: 'Courteous, patient, enjoys a long bargain over tea.',
      position: [-5.2, -12],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#b07a52', top: '#f4f0e6', bottom: '#f4f0e6', outfit: 'kaftan', hair: 'short', facialHair: 'beard', headwear: 'kufi', headColor: '#f4f0e6', height: 1.76 },
      promptVerb: 'Talk to',
      hours: [9, 22],
      social: { lines: ['Smell this cardamom — from my cousin in Kerala, the best there is.', 'In Dubai everyone is from somewhere. That is what makes it Dubai.', 'Saffron is worth more than gold by weight. Handle it gently!'], likes: ['dates-box', 'karak-tea', 'kente-stole'] },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'spice-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'spice-run' }, node: 'offer' },
          { node: 'shop' },
        ],
        nodes: {
          offer: {
            text: 'Marhaba, my friend! Chef Ngozi at the Naija kitchen ordered suya spice and crayfish for tonight, and my boy is at the souk. Will you run it up the promenade to her?',
            options: [
              { label: "I'll run it", action: { kind: 'acceptJob', jobId: 'spice-run' } },
              { label: 'Show me your spices', action: { kind: 'openShop', businessId: 'rashid-spices' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Chef Ngozi — the green kitchen at the north end. She is waiting to start her pepper.',
            options: [{ label: 'On my way', action: { kind: 'close' } }],
          },
          shop: {
            text: 'Saffron, cardamom, frankincense, dried lemons… Sit, have some tea. The price is a conversation.',
            options: [
              { label: 'Show me', action: { kind: 'openShop', businessId: 'rashid-spices' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'ngozi',
      name: 'Chef Ngozi',
      role: 'Nigerian kitchen owner',
      personality: 'Warm, loud, calls every Nigerian in Dubai “my child”.',
      position: [-5.2, 21],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#2f7a52', bottom: '#f2b705', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.68 },
      promptVerb: 'Talk to',
      hours: [10, 23],
      social: { lines: ['I left Surulere twelve years ago. My jollof did not leave me.', 'The Emiratis love my puff-puff. Everybody loves puff-puff.', 'When you go back to Lagos, greet my mother in Yaba for me.'], likes: ['zobo', 'chin-chin', 'saffron-pouch'] },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'spice-run' }, node: 'delivery' },
          { node: 'hello' },
        ],
        nodes: {
          delivery: {
            text: 'My suya spice! God bless Rashid — and God bless you. Tonight the whole creek will smell like Lagos.',
            options: [
              { label: 'Hand over the spices', action: { kind: 'deliverJob', jobId: 'spice-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          hello: {
            text: 'My child! Jollof, suya, puff-puff — a taste of home in the desert. What will you eat?',
            options: [
              { label: 'Show me the food', action: { kind: 'openShop', businessId: 'ngozi-kitchen' } },
              { label: 'Later, Chef', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'maryam',
      name: 'Maryam',
      role: 'Café owner',
      personality: 'Quick, organised, remembers every regular’s order.',
      position: [-5.2, 10],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#c48a62', top: '#6b3f6a', bottom: '#1d1d1f', outfit: 'dress', hair: 'long', headwear: 'wrap', headColor: '#1d1d1f', height: 1.64 },
      promptVerb: 'Talk to',
      hours: [7, 23],
      social: { lines: ['Karak is black tea, milk, cardamom and patience.', 'My grandmother made luqaimat for Ramadan. I make it every day.', 'The water taxis start before sunrise. So do I.'], likes: ['dates-box', 'saffron-pouch', 'shea-butter'] },
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Welcome to the Creek Karak Café! Tea? Or — you look capable — help me behind the counter? The evening rush is serious.',
            options: [
              { label: 'Help at the café (shift)', action: { kind: 'startShift', shiftId: 'karak-cafe' } },
              { label: 'Show me the menu', action: { kind: 'openShop', businessId: 'creek-karak' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'sami',
      name: 'Sami',
      role: 'Taxi driver',
      personality: 'Knows every shortcut and every cricket score.',
      position: [-4.6, 37],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#8a5636', top: '#e8e2d0', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', height: 1.74 },
      promptVerb: 'Talk to',
      social: { lines: ['Airport in twenty minutes, inshallah — unless it is rush hour.', 'I drive here nine years. My family is in Kerala.', 'Lagos? My passenger yesterday was from Lagos! Small world.'], likes: ['karak-tea', 'luqaimat', 'puff-puff-bowl'] },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Taxi? Airport, no problem — I know the fast way.',
            options: [
              { label: 'Take a taxi', action: { kind: 'openTravel' } },
              { label: 'Not yet', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'dw-1', look: { gender: 'male', skin: '#c48a62', top: '#f4f0e6', bottom: '#f4f0e6', outfit: 'kaftan', hair: 'short', headwear: 'kufi', headColor: '#f4f0e6' }, path: [[2, 30], [2, -30], [2, 30]], speed: 1.2, stops: [{ at: 1, activity: 'photo', seconds: 7, face: Math.PI / 2 }] },
    { id: 'dw-2', look: { gender: 'female', skin: '#f0c9a8', top: '#2c7fb8', bottom: '#c9b28a', outfit: 'top-trousers', hair: 'long', hairColor: '#c49a5a', accessory: 'glasses', height: 1.72 }, path: [[5.5, -34], [5.5, 30], [5.5, -34]], speed: 1.1, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI / 2 }] },
    { id: 'dw-3', look: { gender: 'male', skin: '#6b4026', top: '#2f7a52', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[-2, 30], [-2, -10], [-2, 30]], speed: 1.3, stops: [{ at: 1, activity: 'shop', seconds: 9, face: -Math.PI / 2 }] },
    { id: 'dw-4', look: { gender: 'female', skin: '#a8714f', top: '#1d1d1f', bottom: '#1d1d1f', outfit: 'dress', hair: 'bun', headwear: 'wrap', headColor: '#1d1d1f' }, path: [[-1, -34], [-1, 20], [-1, -34]], speed: 1.15, stops: [{ at: 1, activity: 'eat', seconds: 8, face: Math.PI / 2 }] },
    { id: 'dw-5', look: { gender: 'male', skin: '#3f2516', top: '#e4572e', bottom: '#2c3e50', outfit: 'tee-shorts', hair: 'hightop' }, path: [[4, 34], [4, -34]], speed: 1.45 },
  ],

  businesses: [
    {
      id: 'rashid-spices',
      name: 'Al Fahidi Spice House',
      kind: 'market',
      ownerNpcId: 'rashid',
      greeting: 'Everything by weight, everything fresh.',
      haggle: { floor: 0.8, patience: 3 },
      stock: [
        { itemId: 'saffron-pouch', price: 6000 },
        { itemId: 'spice-box', price: 8000 },
        { itemId: 'dates-box', price: 4000 },
      ],
    },
    {
      id: 'creek-karak',
      name: 'Creek Karak Café',
      kind: 'food',
      ownerNpcId: 'maryam',
      greeting: 'Sit, the tea is coming.',
      stock: [
        { itemId: 'karak-tea', price: 1200 },
        { itemId: 'luqaimat', price: 2000 },
        { itemId: 'falafel-wrap', price: 2800 },
      ],
    },
    {
      id: 'ngozi-kitchen',
      name: "Chef Ngozi's Naija Kitchen",
      kind: 'food',
      ownerNpcId: 'ngozi',
      greeting: 'Eat like you are at home.',
      stock: [
        { itemId: 'party-jollof', price: 4500 },
        { itemId: 'suya-plate', price: 3500 },
        { itemId: 'puff-puff-bowl', price: 800 },
        { itemId: 'creek-chapman', price: 1200 },
      ],
    },
  ],

  items: [
    { id: 'karak-tea', name: 'Karak tea', category: 'drink', basePrice: 1200, nutrition: 12, consumable: true, icon: 'cup', description: 'Strong milky tea with cardamom — the creek’s favourite.' },
    { id: 'luqaimat', name: 'Luqaimat', category: 'food', basePrice: 2000, nutrition: 25, consumable: true, icon: 'snack', description: 'Crisp dumplings drizzled with date syrup and sesame.' },
    { id: 'falafel-wrap', name: 'Falafel wrap', category: 'food', basePrice: 2800, nutrition: 45, consumable: true, icon: 'plate', description: 'Hot falafel, pickles and tahini in flatbread.' },
    { id: 'dates-box', name: 'Box of dates', category: 'food', basePrice: 4000, nutrition: 20, consumable: true, icon: 'bag', description: 'Soft, sweet dates in a gift box — a classic present to take home.' },
    { id: 'party-jollof', name: 'Party jollof & chicken', category: 'food', basePrice: 4500, nutrition: 55, consumable: true, icon: 'plate', description: 'Smoky party jollof, fried plantain and chicken — Lagos, by the creek.' },
    { id: 'suya-plate', name: 'Suya plate', category: 'food', basePrice: 3500, nutrition: 40, consumable: true, icon: 'plate', description: 'Spiced grilled beef with onions — the spice came from Rashid.' },
    { id: 'puff-puff-bowl', name: 'Puff-puff (bowl)', category: 'food', basePrice: 800, nutrition: 20, consumable: true, icon: 'snack', description: 'Warm, sugary, gone in a minute.' },
    { id: 'creek-chapman', name: 'Chapman', category: 'drink', basePrice: 1200, nutrition: 10, consumable: true, icon: 'cup', description: 'The Nigerian classic, made the way Chef Ngozi’s mother did.' },
    { id: 'saffron-pouch', name: 'Saffron pouch', category: 'souvenir', basePrice: 6000, icon: 'bag', description: 'A small pouch of deep-red threads.' },
    { id: 'spice-box', name: 'Spice box', category: 'souvenir', basePrice: 8000, icon: 'bag', description: 'Cardamom, cinnamon, dried lemon and za’atar in a wooden box.' },
  ],

  jobs: [
    {
      id: 'spice-run',
      title: 'Spice Run',
      summary: "Carry Rashid's suya spice and crayfish up the promenade to Chef Ngozi's kitchen.",
      giverNpcId: 'rashid',
      dropoffNpcId: 'ngozi',
      cargo: 'Spice parcel',
      timeLimitMs: 60_000,
      reward: 4000,
      bonus: { underMs: 26_000, amount: 1200 },
      cooldownMs: 30_000,
    },
  ],

  shifts: [
    {
      id: 'karak-cafe',
      title: 'Karak café shift',
      npcId: 'maryam',
      skill: 'cooking',
      dishes: [
        { id: 'karak-tea', name: 'Karak tea', icon: 'cup' },
        { id: 'luqaimat', name: 'Luqaimat', icon: 'snack' },
        { id: 'falafel-wrap', name: 'Falafel wrap', icon: 'plate' },
        { id: 'dates', name: 'Dates and coffee', icon: 'cup' },
      ],
      orders: 8,
      seconds: 5,
      perLevel: 0.6,
      payPerOrder: 450,
      perfectTip: 900,
      energyCost: 18,
      minEnergy: 20,
      staffMeal: 40,
    },
  ],

  events: [
    {
      id: 'creek-lights',
      name: 'Creek Lights Night Market',
      kind: 'festival',
      venue: 'Dubai Creek promenade',
      description: 'Lanterns over the water, an oud-and-percussion band on a little stage, and food stalls till late.',
      hours: [19, 23],
      price: 6000,
      joy: 32,
      energy: 8,
      stage: { position: [-3.6, -26], size: [4, 3.4], facing: Math.PI / 2, color: '#3a2f28', accent: '#c98a2a' },
      performers: [
        { gender: 'male', skin: '#b07a52', top: '#f4f0e6', bottom: '#1d1d1f' },
        { gender: 'female', skin: '#8a5636', top: '#6b3f6a', bottom: '#1d1d1f' },
        { gender: 'male', skin: '#5a3420', top: '#c98a2a', bottom: '#2a2a2a' },
      ],
    },
  ],
  spots: [
    { id: 'creek-lights-gate', kind: 'event', position: [0.4, -26], label: 'Creek Lights Night Market', verb: 'Go to', eventId: 'creek-lights' },
    { id: 'creek-bench', kind: 'bench', position: [6.0, 6], label: 'Bench', verb: 'Rest on' },
    { id: 'creek-studio-door', kind: 'home', position: [-6.2, 29], label: 'Creek Studios', verb: 'Check', homeId: 'creek-studio' },
  ],
  homes: [
    { id: 'creek-studio', name: 'Creek studio', description: 'A small furnished studio above the promenade, with a window on the water taxis. Rest free while you stay — or buy it.', moveInCost: 15000, buyPrice: 150000 },
  ],
  startingMoney: 0,
};
