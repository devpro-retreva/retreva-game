import { makeAirport } from './airport';

/** Benin Airport — flights back to Lagos (fictional terminal, generic signage). */
export const beninAirport = makeAirport({
  id: 'benin-airport',
  city: 'Benin City',
  country: 'Nigeria',
  tagline: 'Benin Airport — flights back to Lagos leave from here.',
  brand: { primary: '#8a3a2a', accent: '#f2b705' },
  gatesSign: 'GATES B1 – B3',
  greeting: 'Kóyo! Good afternoon.',
  staff: {
    checkIn: { id: 'ivie', name: 'Ivie', look: { gender: 'female', skin: '#5a3420', top: '#8a3a2a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', accessory: 'earrings', height: 1.66 } },
    security: { id: 'officer-osaro', name: 'Officer Osaro', look: { gender: 'male', skin: '#3f2516', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#2b3a4a', height: 1.82 } },
    gate: { id: 'omoruyi', name: 'Omoruyi', look: { gender: 'male', skin: '#4a2c1c', top: '#8a3a2a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.78 } },
    shop: {
      id: 'imade', name: 'Imade', shopName: 'Ring Road Kiosk', greeting: 'Something for the flight? Chin-chin, a cold malt, a little bronze for your shelf.',
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#8a3a2a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#8a3a2a', height: 1.65 },
    },
    porter: {
      id: 'mama-ehi', name: 'Mama Ehi',
      line: 'My child, this bag of garri and plantain is for my daughter in Lagos and my knees are tired. Carry it to the check-in desk for me?',
      look: { gender: 'female', skin: '#5a3420', top: '#7a3b72', bottom: '#7a3b72', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.62 },
    },
    taxi: {
      id: 'driver-izevbigie', name: 'Izevbigie', line: 'Taxi! King’s Square, Ring Road — twenty minutes. Enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', height: 1.76 },
    },
  },
  items: [
    { id: 'bni-chin-chin', name: 'Chin-chin', category: 'food', basePrice: 800, nutrition: 15, consumable: true, icon: 'snack', description: 'Crunchy fried dough bites, in a sealed pack.' },
    { id: 'benin-malt', name: 'Malt drink', category: 'drink', basePrice: 800, nutrition: 10, consumable: true, icon: 'bottle', description: 'Cold, sweet malt — finish it before security.' },
    { id: 'mini-bronze', name: 'Little bronze leopard', category: 'souvenir', basePrice: 5000, icon: 'key', description: 'A palm-sized brass leopard from Igun Street.' },
    { id: 'benin-postcard', name: 'Benin City postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'King’s Square and its statues, on card.' },
  ],
  walkers: [
    { id: 'bnw-a1', look: { gender: 'male', skin: '#4a2c1c', top: '#8a3a2a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'bnw-a2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'dress', hair: 'puff' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'RING ROAD AIRPORT HOTEL',
  taxiColor: '#e8e6e0',
  palette: { sky: '#e4d4ac', fog: '#d6c7a2', ground: '#8f7a52', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#c9c2b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#8a3a2a' }],
    speed: [4, 6.5],
  },
});
