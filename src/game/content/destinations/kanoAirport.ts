import { makeAirport } from './airport';

/** Mallam Aminu Kano International — flights back to Lagos (fictional terminal, generic signage). */
export const kanoAirport = makeAirport({
  id: 'kano-airport',
  city: 'Kano',
  country: 'Nigeria',
  tagline: 'Mallam Aminu Kano International — flights back to Lagos leave from here.',
  brand: { primary: '#1f6f4a', accent: '#f2b705' },
  gatesSign: 'GATES F1 – F3',
  greeting: 'Sannu! Good afternoon.',
  staff: {
    checkIn: { id: 'rakiya', name: 'Rakiya', look: { gender: 'female', skin: '#6b4026', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.67 } },
    security: { id: 'officer-lawan', name: 'Officer Lawan', look: { gender: 'male', skin: '#5b3622', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#2b3a4a', height: 1.84 } },
    gate: { id: 'nura', name: 'Nura', look: { gender: 'male', skin: '#6b4026', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', height: 1.8 } },
    shop: {
      id: 'hauwa', name: 'Hauwa', shopName: 'Sahel Kiosk', greeting: 'Something for the flight? Dates, groundnuts, a cold malt — or a little leather pouch from Kurmi.',
      look: { gender: 'female', skin: '#7a4a2e', top: '#f2b705', bottom: '#1f6f4a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#c0392b', height: 1.65 },
    },
    porter: {
      id: 'baba-inuwa', name: 'Baba Inuwa',
      line: 'My son, this sack of groundnuts and dates is for my grandchildren in Lagos and my back is old. Carry it to the check-in desk for me?',
      look: { gender: 'male', skin: '#5b3622', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'bald', facialHair: 'beard', headwear: 'kufi', headColor: '#f4f0e6', height: 1.72 },
    },
    taxi: {
      id: 'driver-kabiru', name: 'Kabiru', line: 'Taxi! The old city, Kurmi Market — twenty-five minutes. Enter.',
      look: { gender: 'male', skin: '#6b4026', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'kaftan', hair: 'low', facialHair: 'goatee', headwear: 'kufi', headColor: '#1f6f4a', height: 1.77 },
    },
  },
  items: [
    { id: 'kano-dates', name: 'Dates', category: 'food', basePrice: 1000, nutrition: 15, consumable: true, icon: 'snack', description: 'A bag of sweet dried dates from the market.' },
    { id: 'kano-malt', name: 'Malt drink', category: 'drink', basePrice: 800, nutrition: 10, consumable: true, icon: 'bottle', description: 'Cold, sweet malt — finish it before security.' },
    { id: 'leather-pouch', name: 'Leather pouch', category: 'souvenir', basePrice: 3500, icon: 'bag', description: 'A small red-and-green tooled leather pouch from Kurmi Market.' },
    { id: 'kano-postcard', name: 'Kano postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'The indigo dye pits of Kofar Mata, on card.' },
  ],
  walkers: [
    { id: 'knw-a1', look: { gender: 'male', skin: '#6b4026', top: '#e8e6e0', bottom: '#e8e6e0', outfit: 'kaftan', hair: 'low', headwear: 'kufi', headColor: '#e8e6e0' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.15, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'knw-a2', look: { gender: 'female', skin: '#7a4a2e', top: '#7a3b72', bottom: '#7a3b72', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#7a3b72' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.05, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'SAHEL AIRPORT HOTEL',
  taxiColor: '#e8e6e0',
  palette: { sky: '#ecdcb4', fog: '#e0cfa6', ground: '#a88a5c', road: '#3b3936', roadLine: '#f4f0e6', sidewalk: '#d0c4ac', gutter: '#4f4a45', sun: '#fff0cc' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1f6f4a' }],
    speed: [4, 6.5],
  },
});
