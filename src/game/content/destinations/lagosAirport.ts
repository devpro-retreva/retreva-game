import { makeAirport } from './airport';

/** Lagos International — departures for Accra, Dubai, Abuja and Calabar (fictional terminal, generic signage). */
export const lagosAirport = makeAirport({
  id: 'lagos-airport',
  city: 'Lagos',
  country: 'Nigeria',
  tagline: 'Departures — check in, clear security, and Nigeria or the world is a gate away.',
  brand: { primary: '#1f6f4a', accent: '#f2b705' },
  gatesSign: 'GATES A1 – A6',
  greeting: 'Good afternoon!',
  staff: {
    checkIn: { id: 'ifeoma', name: 'Ifeoma', look: { gender: 'female', skin: '#6b4026', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', headwear: 'wrap', headColor: '#f2b705', accessory: 'earrings', height: 1.66 } },
    security: { id: 'officer-musa', name: 'Officer Musa', look: { gender: 'male', skin: '#4a2c1c', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#2b3a4a', height: 1.84 } },
    gate: { id: 'bisola', name: 'Bisola', look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'top-trousers', hair: 'braids', accessory: 'earrings', height: 1.7 } },
    shop: {
      id: 'obinna', name: 'Obinna', shopName: 'Skyway Mart', greeting: 'Last naira before you fly? Meat pie, water, something to remember Lagos by.',
      look: { gender: 'male', skin: '#5b3622', top: '#f2b705', bottom: '#2a2a2a', outfit: 'shirt', hair: 'hightop', height: 1.76 },
    },
    porter: {
      id: 'mrs-adebayo', name: 'Mrs. Adebayo',
      line: 'Please, my dear — my bag is too heavy and the check-in desk closes soon. Can you carry it to the Gulf Coast desk? I will pay you.',
      look: { gender: 'female', skin: '#6b4026', top: '#7a3b72', bottom: '#7a3b72', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#7a3b72', accessory: 'earrings', height: 1.64 },
    },
    taxi: {
      id: 'uncle-sunday', name: 'Uncle Sunday', line: 'Taxi! Ikeja, Yaba, Island, Lekki — I know every road. Where we dey go?',
      look: { gender: 'male', skin: '#4a2c1c', top: '#e8e6e0', bottom: '#4a5a72', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#1f6f4a', height: 1.74 },
    },
  },
  items: [
    { id: 'meat-pie', name: 'Meat pie', category: 'food', basePrice: 1200, nutrition: 30, consumable: true, icon: 'snack', description: 'Flaky, peppery, airport-priced.' },
    { id: 'bottled-water', name: 'Bottled water', category: 'drink', basePrice: 500, nutrition: 8, consumable: true, icon: 'bottle', description: 'Drink it before security.' },
    { id: 'travel-pillow', name: 'Travel pillow', category: 'goods', basePrice: 3500, icon: 'bag', description: 'For naps at 33,000 feet.' },
    { id: 'naija-keyring', name: 'Green-white-green keyring', category: 'souvenir', basePrice: 1500, icon: 'key', description: 'A little Nigeria for your keys.' },
  ],
  walkers: [
    { id: 'law-1', look: { gender: 'male', skin: '#3f2516', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.35, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'law-2', look: { gender: 'female', skin: '#e0b48f', top: '#f4f0e6', bottom: '#2b2f3a', outfit: 'top-trousers', hair: 'long', hairColor: '#6b4a2a', height: 1.68 }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.2, stops: [{ at: 1, activity: 'photo', seconds: 6, face: -Math.PI / 2 }] },
    { id: 'law-3', look: { gender: 'male', skin: '#a8714f', top: '#e8e6e0', bottom: '#4a5a72', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#e8e6e0' }, path: [[6.2, 20], [6.2, -6], [6.2, 20]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
    { id: 'law-4', look: { gender: 'female', skin: '#5a3420', top: '#d8452b', bottom: '#2a2a2a', outfit: 'dress', hair: 'braids' }, path: [[-5.4, -34], [-5.4, 34]], speed: 1.4 },
  ],
  hotelSign: 'SKYLINE AIRPORT HOTEL',
  taxiColor: '#f2b705',
  palette: { sky: '#e6d3ad', fog: '#dccaa8', ground: '#9c8a70', road: '#3a3a3a', roadLine: '#f4f0e6', sidewalk: '#c4bfb4', gutter: '#4f4a45', sun: '#ffdcae' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#f2b705' }, { kind: 'car', color: '#1d1d1f' }, { kind: 'danfo' }, { kind: 'car', color: '#e8e6e0' }],
    speed: [3.5, 5.5],
  },
});
