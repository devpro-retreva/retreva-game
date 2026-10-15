import { makeAirport } from './airport';

/** Accra International — departures home to Lagos (fictional terminal, generic signage). */
export const accraAirport = makeAirport({
  id: 'accra-airport',
  city: 'Accra',
  country: 'Ghana',
  tagline: 'Akwaaba and safe travels — flights home leave from here.',
  brand: { primary: '#8d1f2b', accent: '#e8b21c' },
  gatesSign: 'GATES B1 – B4',
  greeting: 'Good afternoon, you are welcome.',
  localCurrency: { code: 'GHS', symbol: 'GH₵', perUnit: 100 },
  staff: {
    checkIn: { id: 'abena', name: 'Abena', look: { gender: 'female', skin: '#5a3420', top: '#8d1f2b', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', accessory: 'earrings', height: 1.66 } },
    security: { id: 'officer-mensah', name: 'Officer Mensah', look: { gender: 'male', skin: '#3f2516', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'goatee', headwear: 'cap', headColor: '#2b3a4a', height: 1.8 } },
    gate: { id: 'yaw', name: 'Yaw', look: { gender: 'male', skin: '#4a2c1c', top: '#8d1f2b', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.78 } },
    shop: {
      id: 'adwoa', name: 'Adwoa', shopName: 'Sankofa Express', greeting: 'Small chop for the road? Sausage roll, sobolo, a kente keyring to remember Accra.',
      look: { gender: 'female', skin: '#6b4026', top: '#e8b21c', bottom: '#1f6f4a', outfit: 'dress', hair: 'puff', headwear: 'wrap', headColor: '#1f6f4a', height: 1.64 },
    },
    porter: {
      id: 'mr-boateng', name: 'Mr. Boateng',
      line: 'Charley, please help me — this suitcase is full of gifts for my grandchildren and the desk closes soon. Carry it to the check-in for me?',
      look: { gender: 'male', skin: '#4a2c1c', top: '#2f7a52', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', accessory: 'glasses', height: 1.7 },
    },
    taxi: {
      id: 'kwabena', name: 'Kwabena', line: 'Taxi! Osu, Oxford Street — I will take you. Hop in.',
      look: { gender: 'male', skin: '#5b3622', top: '#e8b21c', bottom: '#2a2a2a', outfit: 'tee-shorts', hair: 'low', headwear: 'cap', headColor: '#8d1f2b', height: 1.74 },
    },
  },
  items: [
    { id: 'sausage-roll', name: 'Sausage roll', category: 'food', basePrice: 1000, nutrition: 25, consumable: true, icon: 'snack', description: 'Warm pastry, a Ghanaian favourite for the road.' },
    { id: 'sobolo-bottle', name: 'Sobolo (bottle)', category: 'drink', basePrice: 600, nutrition: 10, consumable: true, icon: 'bottle', description: 'Hibiscus and ginger — finish it before security.' },
    { id: 'kente-keyring', name: 'Kente keyring', category: 'souvenir', basePrice: 1800, icon: 'key', description: 'A strip of woven kente pattern on a keyring.' },
    { id: 'shea-butter', name: 'Shea butter tin', category: 'souvenir', basePrice: 2500, icon: 'bag', description: 'Smooth, northern-Ghana shea, a classic gift.' },
  ],
  walkers: [
    { id: 'aaw-1', look: { gender: 'female', skin: '#4a2c1c', top: '#e8b21c', bottom: '#1f6f4a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#1f6f4a' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'aaw-2', look: { gender: 'male', skin: '#f0c9a8', top: '#2c5f9e', bottom: '#c9b28a', outfit: 'tee-shorts', hair: 'short', hairColor: '#8a6a3a', height: 1.84 }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.25, stops: [{ at: 1, activity: 'photo', seconds: 6, face: -Math.PI / 2 }] },
    { id: 'aaw-3', look: { gender: 'male', skin: '#5a3420', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[6.2, 20], [6.2, -6], [6.2, 20]], speed: 1.15, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
    { id: 'aaw-4', look: { gender: 'female', skin: '#a8714f', top: '#7a3b72', bottom: '#2a2a2a', outfit: 'top-trousers', hair: 'long', height: 1.66 }, path: [[-5.4, -34], [-5.4, 34]], speed: 1.4 },
  ],
  hotelSign: 'COASTLINE AIRPORT HOTEL',
  taxiColor: '#d9a31c',
  palette: { sky: '#e3d6b4', fog: '#d8cdb0', ground: '#a08a6a', road: '#383838', roadLine: '#f4f0e6', sidewalk: '#c7c0b2', gutter: '#4f4a45', sun: '#ffe2b4' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#d9a31c' }, { kind: 'car', color: '#9aa3ad' }, { kind: 'danfo', color: '#e8e6e0' }, { kind: 'car', color: '#8d1f2b' }],
    speed: [3.5, 5.5],
  },
});
