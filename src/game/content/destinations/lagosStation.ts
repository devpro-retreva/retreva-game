import { makeStation } from './station';

/** Mobolaji Johnson Station, Ebute Metta — trains to Ibadan (generic signage; the rail operator is fictional). */
export const lagosStation = makeStation({
  id: 'lagos-station',
  city: 'Lagos',
  stationName: 'Mobolaji Johnson Station',
  locality: 'EBUTE METTA',
  tagline: 'Trains to Ibadan — ticket check, bag scan, platform, and the Ogun countryside rolls by.',
  brand: { primary: '#1f6f4a', accent: '#f2b705' },
  greeting: 'Good morning!',
  staff: {
    inspector: { id: 'mr-ogunleye', name: 'Mr. Ogunleye', look: { gender: 'male', skin: '#4a2c1c', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#1f6f4a', accessory: 'glasses', height: 1.76 } },
    security: { id: 'officer-bisi', name: 'Officer Bisi', look: { gender: 'female', skin: '#5a3420', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'top-trousers', hair: 'bun', headwear: 'cap', headColor: '#2b3a4a', height: 1.7 } },
    guard: { id: 'guard-femi', name: 'Guard Femi', look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#1f6f4a', outfit: 'shirt', hair: 'hightop', headwear: 'cap', headColor: '#1f6f4a', height: 1.8 } },
    shop: {
      id: 'mama-tope', name: 'Mama Tope', shopName: 'Platform Provisions', greeting: 'Something for the journey? Gala, puff-puff, cold zobo — Ibadan is two and a half hours.',
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#7a3b72', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#7a3b72', accessory: 'earrings', height: 1.62 },
    },
    porter: {
      id: 'baba-agba', name: 'Baba Agba',
      line: 'My child, this bag of yams is for my daughter in Ibadan and my back is not young. Carry it to the ticket barrier for me?',
      look: { gender: 'male', skin: '#4a2c1c', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#7a3b72', height: 1.7 },
    },
    ride: {
      id: 'conductor-wale', name: 'Sola', kind: 'danfo', color: '#f2b705',
      line: 'Yaba! Oyingbo! CMS! Ikeja, Lekki, Badagry — enter, we dey go now now!',
      look: { gender: 'male', skin: '#3f2516', top: '#d8452b', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', height: 1.74 },
    },
  },
  items: [
    { id: 'gala', name: 'Gala sausage roll', category: 'food', basePrice: 400, nutrition: 15, consumable: true, icon: 'snack', description: 'The roadside classic, sold on every Nigerian journey.' },
    { id: 'ls-puff-puff', name: 'Puff-puff', category: 'food', basePrice: 500, nutrition: 18, consumable: true, icon: 'snack', description: 'Sweet fried dough balls in a paper bag.' },
    { id: 'ls-zobo', name: 'Zobo', category: 'drink', basePrice: 600, nutrition: 8, consumable: true, icon: 'bottle', description: 'Chilled hibiscus drink with ginger — fine on the train.' },
    { id: 'rail-keyring', name: 'Little train keyring', category: 'souvenir', basePrice: 1200, icon: 'key', description: 'A green-and-white standard-gauge train for your keys.' },
  ],
  walkers: [
    { id: 'lsw-1', look: { gender: 'male', skin: '#3f2516', top: '#2c5f9e', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.3, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'lsw-2', look: { gender: 'female', skin: '#5a3420', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#f2b705' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  palette: { sky: '#e9d7ad', fog: '#dccaa2', ground: '#8f8558', road: '#3b3936', roadLine: '#f4f0e6', sidewalk: '#c8c0ae', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'danfo', color: '#f2b705' }, { kind: 'car', color: '#e8e6e0' }],
    speed: [3.5, 6],
  },
});
