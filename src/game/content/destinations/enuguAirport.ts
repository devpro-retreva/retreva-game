import { makeAirport } from './airport';

/** Akanu Ibiam International, Enugu — flights back to Lagos (fictional terminal, generic signage). */
export const enuguAirport = makeAirport({
  id: 'enugu-airport',
  city: 'Enugu',
  country: 'Nigeria',
  tagline: 'Akanu Ibiam International — flights back to Lagos leave from here.',
  brand: { primary: '#2f6b3a', accent: '#f2b705' },
  gatesSign: 'GATES C1 – C3',
  greeting: 'Nnọọ! Good afternoon.',
  staff: {
    checkIn: { id: 'chiamaka', name: 'Chiamaka', look: { gender: 'female', skin: '#6b4026', top: '#2f6b3a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', accessory: 'earrings', height: 1.67 } },
    security: { id: 'officer-okeke', name: 'Officer Okeke', look: { gender: 'male', skin: '#4a2c1c', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#2b3a4a', height: 1.82 } },
    gate: { id: 'nnamdi', name: 'Nnamdi', look: { gender: 'male', skin: '#5b3622', top: '#2f6b3a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.79 } },
    shop: {
      id: 'adaobi', name: 'Adaobi', shopName: 'Coal City Kiosk', greeting: 'Something for the flight? Meat pie, a cold malt — or a little coal-miner’s lamp for your shelf.',
      look: { gender: 'female', skin: '#5a3420', top: '#f2b705', bottom: '#2f6b3a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#2f6b3a', height: 1.65 },
    },
    porter: {
      id: 'mama-ngozi', name: 'Mama Ngozi',
      line: 'My child, this carton of ugba and stockfish is for my son in Lagos and it is too heavy for me. Carry it to the check-in desk?',
      look: { gender: 'female', skin: '#4a2c1c', top: '#7a3b72', bottom: '#7a3b72', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.62 },
    },
    taxi: {
      id: 'driver-obi', name: 'Obi', line: 'Taxi! Ogui, Okpara Square, Ogbete — thirty minutes into town. Enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', height: 1.76 },
    },
  },
  items: [
    { id: 'enu-meatpie', name: 'Meat pie', category: 'food', basePrice: 1200, nutrition: 25, consumable: true, icon: 'snack', description: 'Flaky, peppery, still warm.' },
    { id: 'enu-malt', name: 'Malt drink', category: 'drink', basePrice: 800, nutrition: 10, consumable: true, icon: 'bottle', description: 'Cold, sweet malt — finish it before security.' },
    { id: 'miner-lamp', name: 'Little miner’s lamp', category: 'souvenir', basePrice: 3500, icon: 'key', description: 'A brass miner’s lamp in miniature — for the Coal City.' },
    { id: 'enugu-postcard', name: 'Enugu postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'Milliken Hill at dusk, on card.' },
  ],
  walkers: [
    { id: 'enw-a1', look: { gender: 'male', skin: '#4a2c1c', top: '#2f6b3a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'enw-a2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'dress', hair: 'puff' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'COAL CITY AIRPORT HOTEL',
  taxiColor: '#e8e6e0',
  palette: { sky: '#e0d6b0', fog: '#d2c9a4', ground: '#86784e', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#c9c2b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#2f6b3a' }],
    speed: [4, 6.5],
  },
});
