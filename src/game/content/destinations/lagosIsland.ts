import type { DestinationPack } from '../types';

/**
 * Lagos Island — a market lane near Balogun Market (fictional businesses).
 * A narrow paved lane lined with old three- and four-storey buildings,
 * trading stalls along both edges, and a fabric seller who expects you to bargain.
 */

const E = 9.4;
const W = -9.4;
const D = 8;

export const lagosIsland: DestinationPack = {
  id: 'lagos-island',
  name: 'Lagos',
  area: 'Lagos Island',
  tagline: 'Balogun market lane — fabric, lace and the art of the bargain.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [0, 35], facing: Math.PI },
  arrival: { position: [0.4, 35], facing: Math.PI },
  walkable: [[-5.2, -40, 5.2, 40]],
  walls: [],
  palette: {
    sky: '#f0c995',
    fog: '#e6cba4',
    ground: '#8f6b52',
    road: '#9a8f80',
    roadLine: '#e8d9b0',
    sidewalk: '#b7aa96',
    gutter: '#5d554c',
    sun: '#ffdcaa',
  },
  road: { halfWidth: 2.8, sidewalk: 2.4, length: 82, style: 'paved' },
  landmarks: [
    { id: 'island-lane', name: 'Balogun market lane', blurb: 'Bolts of cloth stacked to the sky and a hundred prices.', position: [0, 8], radius: 4.5 },
    { id: 'island-asooke', name: "Aso-oke weavers' corner", blurb: 'Hand-woven cloth for owambe season.', position: [3.5, -12], radius: 3.5 },
    { id: 'island-stop', name: 'Marina keke stop', blurb: 'Kekes and danfos back to the mainland.', position: [3.4, 37], radius: 3 },
  ],
  welcome: { from: 'Sade', text: 'Welcome to the Island! Alhaja Kudi sells the best wax prints — but never pay the first price o.' },

  buildings: [
    { id: 'i-e1', position: [E, -34], size: [10, 12.5, D], facing: 'west', wall: '#d9b38c', trim: '#f4ead8', roof: '#6c5c4d', storeys: 4, balcony: true,
      awning: '#2c5f9e', sign: { text: 'BAYO STITCHES', sub: 'TAILOR · ALTERATIONS', bg: '#f4ead8', fg: '#2c5f9e' } },
    { id: 'i-e2', position: [E, -23.6], size: [10, 9.4, D], facing: 'west', wall: '#a7c4b5', trim: '#f4ead8', roof: '#62564a', storeys: 3, balcony: true },
    { id: 'i-e3', position: [E, -12.8], size: [10.8, 9.4, D], facing: 'west', wall: '#e4c9a8', trim: '#7a3b2e', roof: '#655749', storeys: 3,
      awning: '#7a3b72', sign: { text: 'ROYAL ASO-OKE', sub: 'HAND WOVEN · CAPS · GELE', bg: '#7a3b72', fg: '#fff2e2' } },
    { id: 'i-e4', position: [E, -1.6], size: [10.8, 12.5, D], facing: 'west', wall: '#c97b63', trim: '#f4ead8', roof: '#5f5246', storeys: 4, balcony: true },
    { id: 'i-e5', position: [E, 9.6], size: [10.8, 9.4, D], facing: 'west', wall: '#9fb4c9', trim: '#f4ead8', roof: '#61554a', storeys: 3,
      awning: '#d8452b', sign: { text: 'EKO PROVISIONS', sub: 'WHOLESALE · RETAIL', bg: '#d8452b', fg: '#fff6e0' } },
    { id: 'i-e6', position: [E, 20.8], size: [10.8, 12.5, D], facing: 'west', wall: '#e8dcc0', trim: '#2e7d4f', roof: '#685a4c', storeys: 4, balcony: true },
    { id: 'i-e7', position: [E, 31.6], size: [10, 9.4, D], facing: 'west', wall: '#d9a06b', trim: '#f4ead8', roof: '#6c5c4d', storeys: 3 },

    { id: 'i-w1', position: [W, -33.6], size: [10.6, 9.4, D], facing: 'east', wall: '#e2cfae', trim: '#8d3b2a', roof: '#6a5a4b', storeys: 3, balcony: true },
    { id: 'i-w2', position: [W, -22.6], size: [10.6, 12.5, D], facing: 'east', wall: '#b9876a', trim: '#f4ead8', roof: '#5f5246', storeys: 4,
      awning: '#1f6f4a', sign: { text: 'OLOWO TEXTILES', sub: 'LACE · GEORGE · VOILE', bg: '#1f6f4a', fg: '#fff7e3' } },
    { id: 'i-w3', position: [W, -11.4], size: [10.6, 9.4, D], facing: 'east', wall: '#c4d0b0', trim: '#5a3a2c', roof: '#61554a', storeys: 3, balcony: true },
    { id: 'i-w4', position: [W, -0.2], size: [10.6, 9.4, D], facing: 'east', wall: '#e8c26a', trim: '#4a3a2c', roof: '#6e5f50', storeys: 3,
      awning: '#f2b705', sign: { text: 'ISALE EKO SHOES', sub: 'LEATHER · SLIPPERS', bg: '#2a1d14', fg: '#f2b705' } },
    { id: 'i-w5', position: [W, 11], size: [10.6, 12.5, D], facing: 'east', wall: '#d79f8b', trim: '#f4ead8', roof: '#62564a', storeys: 4, balcony: true },
    { id: 'i-w6', position: [W, 22.2], size: [10.6, 9.4, D], facing: 'east', wall: '#f0dcc0', trim: '#c9583b', roof: '#655749', storeys: 3,
      awning: '#c9583b', sign: { text: "ALHAJA KUDI", sub: 'WAX PRINTS · ADIRE', bg: '#fff1d0', fg: '#c9583b' } },
    { id: 'i-w7', position: [W, 33.2], size: [10.6, 9.4, D], facing: 'east', wall: '#a9b8a0', trim: '#f4ead8', roof: '#5f5246', storeys: 3 },
  ],

  props: [
    // stalls along both edges of the lane
    { id: 's-1', kind: 'stall', position: [-3.7, 28], rotation: Math.PI / 2, color: '#d8452b', collide: true },
    { id: 's-2', kind: 'stall', position: [-3.7, 18.4], rotation: Math.PI / 2, color: '#f2b705', collide: true },
    { id: 's-3', kind: 'stall', position: [-3.7, 4], rotation: Math.PI / 2, color: '#1d7f86', collide: true },
    { id: 's-4', kind: 'stall', position: [-3.7, -8], rotation: Math.PI / 2, color: '#7a3b72', collide: true },
    { id: 's-5', kind: 'stall', position: [-3.7, -26], rotation: Math.PI / 2, color: '#2c5f9e', collide: true },
    { id: 's-6', kind: 'stall', position: [3.7, 22], rotation: -Math.PI / 2, color: '#1f6f4a', collide: true },
    { id: 's-7', kind: 'stall', position: [3.7, 12], rotation: -Math.PI / 2, color: '#e4572e', collide: true },
    { id: 's-8', kind: 'stall', position: [3.7, -4], rotation: -Math.PI / 2, color: '#f2b705', collide: true },
    { id: 's-9', kind: 'stall', position: [3.7, -18], rotation: -Math.PI / 2, color: '#c9583b', collide: true },
    { id: 's-10', kind: 'stall', position: [-3.7, -36], rotation: Math.PI / 2, color: '#d8452b', collide: true },
    { id: 'u-1', kind: 'umbrella', position: [-1.4, -16], color: '#2c5f9e' },
    { id: 'crates-1', kind: 'crates', position: [4.4, 6], collide: true },
    { id: 'crates-2', kind: 'crates', position: [-4.4, -20], collide: true },
    { id: 'drum-1', kind: 'drum', position: [4.5, -30], color: '#1d7f86', collide: true },
    { id: 'gen-1', kind: 'generator', position: [-4.5, 10], collide: true },
    { id: 'bus', kind: 'busstop', position: [4.5, 37.6], rotation: -Math.PI / 2, collide: true },
    { id: 'keke-1', kind: 'keke', position: [-3.2, 37.4], rotation: 0.2, collide: true },
    { id: 'pole-1', kind: 'pole', position: [-4.9, 30] },
    { id: 'pole-2', kind: 'pole', position: [-4.9, 6] },
    { id: 'pole-3', kind: 'pole', position: [-4.9, -18] },
  ],

  npcs: [
    {
      id: 'alhaja-kudi',
      name: 'Alhaja Kudi',
      role: 'Fabric seller',
      personality: 'Shrewd, funny, respects a good bargainer.',
      position: [-2.3, 16.6],
      facing: Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#c9583b', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.64 },
      promptVerb: 'Bargain with',
      idle: 'busy',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Fine customer! Come and see original wax prints, adire, lace. My price is fair — but I will hear your own price too.',
            options: [
              { label: 'Show me your cloth', action: { kind: 'openShop', businessId: 'alhaja-kudi' } },
              { label: 'How does bargaining work?', action: { kind: 'goto', node: 'how' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          how: {
            text: 'I tell you my price, you make an offer. If it is too low, I counter. Do not insult me too many times — my patience is not unlimited!',
            options: [
              { label: "Let's bargain", action: { kind: 'openShop', businessId: 'alhaja-kudi' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'femi',
      name: 'Femi',
      role: 'Market porter',
      personality: 'Strong, quick-witted, always rushing.',
      position: [2.3, 27],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#4a2c1c', top: '#e4572e', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', facialHair: 'none', height: 1.8 },
      promptVerb: 'Talk to',
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'bale-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'bale-run' }, node: 'offer' },
          { node: 'rest' },
        ],
        nodes: {
          offer: {
            text: 'My back don tire! Bayo the tailor needs this fabric bale for a wedding order. Carry it to his shop at the far end — before his client arrives.',
            options: [
              { label: "I'll carry it", action: { kind: 'acceptJob', jobId: 'bale-run' } },
              { label: "What's the pay?", action: { kind: 'goto', node: 'pay' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
          pay: {
            text: '₦2,200 from Bayo. Get there in under 35 seconds and he adds ₦800 — his client is very impatient.',
            options: [
              { label: 'Deal', action: { kind: 'acceptJob', jobId: 'bale-run' } },
              { label: 'Maybe later', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Oya go! Bayo Stitches — north end of the lane, right side.',
            options: [{ label: 'Going', action: { kind: 'close' } }],
          },
          rest: {
            text: 'Thank you, my friend. Next bale is coming from the warehouse — check back soon.',
            options: [{ label: 'See you', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'bayo',
      name: 'Bayo',
      role: 'Tailor',
      personality: 'Precise, calm, proud of his stitching.',
      position: [3.3, -32],
      facing: -Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#f4ead8', bottom: '#2c5f9e', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#2c5f9e', accessory: 'glasses', height: 1.74 },
      promptVerb: 'Talk to',
      idle: 'sway',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'bale-run' }, node: 'delivery' },
          { node: 'hello' },
        ],
        nodes: {
          delivery: {
            text: 'Ah, the bale from Femi! Perfect timing — my client is almost here.',
            options: [
              { label: 'Hand over the bale', action: { kind: 'deliverJob', jobId: 'bale-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          hello: {
            text: 'Bayo Stitches — agbada, iro and buba, anything. Bring good fabric and I will make you look like royalty.',
            options: [{ label: 'Good to know', action: { kind: 'close' } }],
          },
        },
      },
    },
    {
      id: 'sade',
      name: 'Sade',
      role: 'Keke rider',
      personality: 'Cheerful, knows every shortcut.',
      position: [2.9, 36.2],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#6b4026', top: '#1d7f86', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids', headwear: 'cap', headColor: '#f2b705', height: 1.66 },
      promptVerb: 'Talk to',
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Marina stop! I fit carry you go Yaba, Lekki or Ikeja. Where we dey go?',
            options: [
              { label: 'Take a ride', action: { kind: 'openTravel' } },
              { label: 'Later', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
  ],

  walkers: [
    { id: 'iw-1', look: { gender: 'female', skin: '#5a3420', top: '#f2b705', bottom: '#2c5f9e', outfit: 'top-skirt', hair: 'puff' }, path: [[-1.2, 34], [-1.2, -36]], speed: 1.2 },
    { id: 'iw-2', look: { gender: 'male', skin: '#3f2516', top: '#2d3f8f', bottom: '#c7b38a', outfit: 'kaftan', hair: 'low', headwear: 'kufi', headColor: '#f4f0e6' }, path: [[1.3, -34], [1.3, 33]], speed: 1.35 },
    { id: 'iw-3', look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#2b2b33', outfit: 'dress', hair: 'long', headwear: 'wrap', headColor: '#7a3b72' }, path: [[0.2, 20], [0.2, -20]], speed: 1.0 },
  ],

  businesses: [
    {
      id: 'alhaja-kudi',
      name: "Alhaja Kudi's Wax Prints",
      kind: 'market',
      ownerNpcId: 'alhaja-kudi',
      greeting: 'Touch it — feel the quality.',
      haggle: { floor: 0.68, patience: 3 },
      stock: [
        { itemId: 'ankara-6yd', price: 9000 },
        { itemId: 'adire-scarf', price: 4500 },
        { itemId: 'lace-fabric', price: 16000 },
        { itemId: 'aso-oke-cap', price: 3500 },
      ],
    },
  ],

  items: [
    { id: 'ankara-6yd', name: 'Ankara wax print (6 yards)', category: 'clothing', basePrice: 9000, icon: 'bag', description: 'Bold yellow-and-indigo print, enough for a full outfit.' },
    { id: 'adire-scarf', name: 'Adire indigo scarf', category: 'clothing', basePrice: 4500, icon: 'bag', description: 'Hand-dyed tie-and-dye cotton from Abeokuta.' },
    { id: 'lace-fabric', name: 'Lace fabric (5 yards)', category: 'clothing', basePrice: 16000, icon: 'bag', description: 'Party lace for the next owambe.' },
    { id: 'aso-oke-cap', name: 'Aso-oke cap', category: 'clothing', basePrice: 3500, icon: 'bag', description: 'Hand-woven fila in deep purple.' },
  ],

  jobs: [
    {
      id: 'bale-run',
      title: 'Bale Run',
      summary: "Carry Femi's fabric bale to Bayo the tailor before his client arrives.",
      giverNpcId: 'femi',
      dropoffNpcId: 'bayo',
      cargo: 'Fabric bale',
      timeLimitMs: 70_000,
      reward: 2200,
      bonus: { underMs: 35_000, amount: 800 },
      cooldownMs: 25_000,
    },
  ],

  startingMoney: 0,
};
