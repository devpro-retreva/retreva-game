import type { DestinationPack, Vec2 } from '../types';

/**
 * Obudu — the base station at the foot of the Obudu Plateau (fictional businesses and people; the plateau, the
 * cable car, the rainforest at its foot and the waterfalls on the escarpment are real). A short road ends at the
 * lower station; beyond it the cable runs straight up the forested slope to the ranch, lost in mist at the top.
 * Oko sells the cable car (or a taxi up the hairpin road); Mama Agbo roasts corn and ube by the road; Etim's bus
 * goes back to Calabar from the south end.
 */

const E = 11.2;
const W = -11.2;
const D = 8;

/** The cable: straight north up the slope from the lower station (cabin floor heights in metres). */
const TRACK: Vec2[] = [[2.5, -38], [2.5, -46], [2.5, -62], [2.5, -78], [2.5, -94], [2.5, -104]];
const HEIGHTS = [0.3, 3.5, 15, 29, 43, 50];

export const obuduBase: DestinationPack = {
  id: 'obudu-base',
  name: 'Obudu',
  area: 'Base station',
  tagline: 'The foot of the Obudu Plateau — rainforest, waterfalls on the escarpment, and the cable car climbing into the mist.',
  country: 'Nigeria',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  spawn: { position: [-3.8, 36], facing: Math.PI },
  arrival: { position: [-3.8, 36], facing: Math.PI },
  walkable: [[-6.9, -42, 6.9, 42]],
  // the lower station's pillars on the street
  walls: [[0.6, -35.75, 0.6, -35.25], [0.6, -40.75, 0.6, -40.25]],
  // wet, green light under a white sky
  palette: {
    sky: '#d9e2dc',
    fog: '#cfd8d2',
    ground: '#6b7a4a',
    road: '#3b3d3a',
    roadLine: '#e9e6d8',
    sidewalk: '#c2c0b2',
    gutter: '#4a4d48',
    sun: '#f6f4e6',
  },
  road: { halfWidth: 4, sidewalk: 3, length: 86, style: 'asphalt' },
  ambience: { traffic: 0.1, crowd: 0.3, horns: 0.5 },
  vista: 'north',
  backdrop: 'rainforest',
  landmarks: [
    { id: 'ob-escarpment', name: 'The Obudu escarpment', blurb: 'The plateau rises almost a kilometre above the forest here; its top is often in cloud, and the ranch up there is cool enough for cattle and strawberries.', position: [0, -32], radius: 5 },
  ],
  welcome: { from: 'Oko', text: 'Welcome to the foot of the mountain! The cable car goes up from my station at the end of the road — or take the road, if you like hairpins.' },

  buildings: [
    { id: 'ob-w1', position: [W, -33], size: [12, 3.4, D], facing: 'east', wall: '#e2ddd0', trim: '#c0392b', roof: '#6a5a4a', storeys: 1,
      awning: '#c0392b', sign: { text: 'CABLE CAR', sub: 'TICKETS · UP TO THE RANCH', bg: '#c0392b', fg: '#ffffff' } },
    { id: 'ob-w2', position: [W, -18], size: [10.4, 3.4, D], facing: 'east', wall: '#d8cdb4', trim: '#3d5f3a', roof: '#6a5a4a', storeys: 1 },
    { id: 'ob-w3', position: [W, -4], size: [10.4, 6.4, D], facing: 'east', wall: '#e8e2d0', trim: '#3d5f3a', roof: '#6a5a4a', storeys: 2,
      sign: { text: 'MOUNTAIN VIEW', sub: 'GUEST HOUSE', bg: '#ffffff', fg: '#3d5f3a' } },
    { id: 'ob-w4', position: [W, 34], size: [10, 3.4, D], facing: 'east', wall: '#e8e2d4', trim: '#1d5f7a', roof: '#6a5a4a', storeys: 1,
      sign: { text: 'BUSES', sub: 'OGOJA · IKOM · CALABAR', bg: '#1d5f7a', fg: '#ffffff' } },
    { id: 'ob-e1', position: [E, -20], size: [10.4, 3.4, D], facing: 'west', wall: '#f0c75e', trim: '#2a2a2a', roof: '#6a5a4a', storeys: 1,
      awning: '#1f6f4a', businessId: 'agbo-corn', sign: { text: 'MAMA AGBO', sub: 'CORN · UBE · PALM WINE', bg: '#1f6f4a', fg: '#fff6e0' } },
    { id: 'ob-e2', position: [E, 2], size: [10.4, 3.4, D], facing: 'west', wall: '#d6cbb2', trim: '#7a3b72', roof: '#6a5a4a', storeys: 1 },
    { id: 'ob-e3', position: [E, 22], size: [10.4, 3.4, D], facing: 'west', wall: '#e0d8c4', trim: '#5b3a24', roof: '#6a5a4a', storeys: 1 },
  ],

  props: [
    { id: 'palm-1', kind: 'palm', position: [6.4, -10], collide: true },
    { id: 'palm-2', kind: 'palm', position: [-6.3, 12], collide: true },
    { id: 'tree-1', kind: 'tree', position: [6.3, 12], collide: true },
    { id: 'bench-1', kind: 'bench', position: [-6.3, 22], collide: true },
    { id: 'stall-agbo', kind: 'grill', position: [6.2, -17], rotation: -Math.PI / 2, collide: true },
    { id: 'bus-1', kind: 'danfo', position: [-3.6, 28], rotation: 0, color: '#e9e6df', collide: true },
  ],

  npcs: [
    {
      id: 'oko-attendant',
      name: 'Oko',
      role: 'Cable car attendant',
      personality: 'Has run the lower station for years and tells every nervous rider the same joke about the view.',
      position: [-1.8, -36.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#5b3622', top: '#c0392b', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#c0392b', height: 1.78 },
      promptVerb: 'Talk to',
      hours: [7, 18],
      social: {
        lines: [
          'From here to the ranch is about four kilometres of rope. Don’t count the pylons — it makes people nervous.',
          'Some days the top is in cloud and you ride straight into it. Like flying.',
          'When the cable car is down for repairs we all take the road. The road never breaks — it just bends.',
        ],
        likes: ['corn-ube', 'ranch-yoghurt', 'becheve-honey'],
      },
      idle: 'wave',
      dialogue: {
        entries: [
          { when: { kind: 'isDropoff', jobId: 'corn-run' }, node: 'report' },
          { node: 'hello' },
        ],
        nodes: {
          report: {
            text: 'Mama Agbo’s corn! I have been smelling it all morning. Thank you, thank you.',
            options: [
              { label: 'Hand over the corn', action: { kind: 'deliverJob', jobId: 'corn-run' } },
              { label: 'One moment', action: { kind: 'close' } },
            ],
          },
          hello: {
            text: 'Up to the ranch? The cable car is ₦5,000 — you pay at the top. Or a taxi up the hairpin road, ₦2,000, forty minutes of bends.',
            options: [
              { label: 'Ride the cable car', action: { kind: 'openTravel', by: 'cable' } },
              { label: 'Take the road up', action: { kind: 'openTravel' } },
              { label: 'Not now', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'mama-agbo',
      name: 'Mama Agbo',
      role: 'Roadside cook',
      personality: 'Roasts corn and ube for every bus that stops; knows the weather on the mountain before the radio does.',
      position: [5.2, -19.4],
      facing: -Math.PI / 2,
      look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#f2b705', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.62 },
      promptVerb: 'Buy from',
      hours: [7, 20],
      social: {
        lines: [
          'Corn and ube — the pear goes soft on the coals. You eat them together.',
          'If the top is white this morning, it will rain by four.',
          'Bring a sweater up there. People from Calabar always forget.',
        ],
        likes: ['ranch-yoghurt', 'ranch-scarf', 'edikang-ikong'],
      },
      idle: 'busy',
      dialogue: {
        entries: [
          { when: { kind: 'jobActive', jobId: 'corn-run' }, node: 'waiting' },
          { when: { kind: 'jobAvailable', jobId: 'corn-run' }, node: 'hello' },
          { node: 'busy' },
        ],
        nodes: {
          hello: {
            text: 'Roast corn with ube, fresh palm wine — eat before you climb! And if you’re going to the station, Oko’s lunch is ready.',
            options: [
              { label: 'Take Oko his lunch', action: { kind: 'acceptJob', jobId: 'corn-run' } },
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'agbo-corn' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
          waiting: {
            text: 'Go, before it gets cold — the station is at the end of the road.',
            options: [{ label: 'On it', action: { kind: 'close' } }],
          },
          busy: {
            text: 'Roast corn with ube, fresh palm wine — eat before you climb!',
            options: [
              { label: 'What do you have?', action: { kind: 'openShop', businessId: 'agbo-corn' } },
              { label: 'Just looking', action: { kind: 'close' } },
            ],
          },
        },
      },
    },
    {
      id: 'conductor-etim',
      name: 'Etim',
      role: 'Bus conductor',
      personality: 'Shouts every town between here and the sea, in order.',
      position: [-4.8, 31.4],
      facing: Math.PI / 2,
      look: { gender: 'male', skin: '#6b4026', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', headwear: 'cap', headColor: '#1d5f7a', height: 1.76 },
      promptVerb: 'Talk to',
      social: {
        lines: [
          'Ogoja, Ikom, Calabar! Six hours if the bridges are good.',
          'Calabar people come up for the cold. We go down for the fish.',
          'Sit on the left going down — you see the river.',
        ],
        likes: ['corn-ube', 'becheve-honey', 'afia-efere'],
      },
      idle: 'wave',
      dialogue: {
        entries: [{ node: 'hello' }],
        nodes: {
          hello: {
            text: 'Calabar! Calabar! Enter, one chance!',
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
    { id: 'obw-1', look: { gender: 'female', skin: '#7a4a2e', top: '#e4572e', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'braids' }, path: [[-5.4, 26], [-5.4, -26], [-5.4, 26]], speed: 1.0, stops: [{ at: 1, activity: 'photo', seconds: 8, face: Math.PI }] },
  ],

  spots: [{ id: 'ob-base-bench', kind: 'bench', position: [-5.6, 22], label: 'Bench under the palm', verb: 'Rest on' }],

  businesses: [
    {
      id: 'agbo-corn',
      name: 'Mama Agbo',
      kind: 'food',
      ownerNpcId: 'mama-agbo',
      greeting: 'Hot from the coals.',
      stock: [
        { itemId: 'corn-ube', price: 800 },
        { itemId: 'ob-palm-wine', price: 700 },
      ],
    },
  ],

  items: [
    { id: 'corn-ube', name: 'Roast corn & ube', category: 'food', basePrice: 800, consumable: true, nutrition: 22, icon: 'snack', description: 'Roast corn with ube — African pear, softened on the coals.' },
    { id: 'ob-palm-wine', name: 'Palm wine', category: 'drink', basePrice: 700, consumable: true, nutrition: 8, icon: 'cup', description: 'Fresh, sweet and cloudy, tapped this morning.' },
  ],

  jobs: [
    {
      id: 'corn-run',
      title: 'Corn Run',
      summary: 'Carry Oko’s lunch — hot roast corn and ube — from Mama Agbo’s roadside grill up to the cable car station.',
      giverNpcId: 'mama-agbo',
      dropoffNpcId: 'oko-attendant',
      cargo: 'Roast corn, wrapped in leaves',
      timeLimitMs: 60_000,
      reward: 1800,
      bonus: { underMs: 30_000, amount: 600 },
      cooldownMs: 25_000,
    },
  ],

  cable: {
    to: 'obudu-ranch',
    ride: {
      vehicle: 'cable-car',
      track: TRACK,
      heights: HEIGHTS,
      speed: 1.6,
      minutes: 25,
      sightings: [
        { id: 'ob-canopy', name: 'Over the canopy', blurb: 'Below the cabin the rainforest closes over the slope — the edge of the Afi and Mbe mountain forests, home to rare primates.', position: [2.5, -56], radius: 4 },
        { id: 'ob-waterfall', name: 'A waterfall', blurb: 'Streams fall off the escarpment all down this side of the plateau — fuller in the rains.', position: [-11.5, -66], radius: 15 },
        { id: 'ob-mist', name: 'Into the mist', blurb: 'The top of the plateau is often in cloud: the cabin rides up into it and out onto the grassland.', position: [2.5, -96], radius: 4 },
      ],
    },
  },

  startingMoney: 0,
};
