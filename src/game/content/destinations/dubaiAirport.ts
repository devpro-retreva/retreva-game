import { makeAirport } from './airport';

/** Dubai International — departures home to Lagos (fictional terminal, generic signage). */
export const dubaiAirport = makeAirport({
  id: 'dubai-airport',
  city: 'Dubai',
  country: 'United Arab Emirates',
  tagline: 'Marhaba and safe travels — flights home to Lagos leave from here.',
  brand: { primary: '#1f5f6f', accent: '#c98a2a' },
  gatesSign: 'GATES C1 – C6',
  greeting: 'Marhaba, good evening.',
  localCurrency: { code: 'AED', symbol: 'AED ', perUnit: 365 },
  staff: {
    checkIn: { id: 'hessa', name: 'Hessa', look: { gender: 'female', skin: '#c48a62', top: '#1f5f6f', bottom: '#1d1d1f', outfit: 'dress', hair: 'bun', headwear: 'wrap', headColor: '#1d1d1f', height: 1.66 } },
    security: { id: 'officer-salem', name: 'Officer Salem', look: { gender: 'male', skin: '#b07a52', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'short', facialHair: 'beard', headwear: 'cap', headColor: '#2b3a4a', height: 1.8 } },
    gate: { id: 'khalid', name: 'Khalid', look: { gender: 'male', skin: '#a8714f', top: '#1f5f6f', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', height: 1.78 } },
    shop: {
      id: 'priya', name: 'Priya', shopName: 'Creekside Duty Free', greeting: 'Dates for the family? Karak for the plane? Last chance for a little Dubai.',
      look: { gender: 'female', skin: '#9a6440', top: '#c98a2a', bottom: '#1d1d1f', outfit: 'top-trousers', hair: 'long', accessory: 'earrings', height: 1.62 },
    },
    porter: {
      id: 'mr-dsouza', name: 'Mr. D’Souza',
      line: 'Excuse me — my back is bad and this suitcase is full of gifts for my daughter’s wedding. Could you carry it to the check-in desk before it closes?',
      look: { gender: 'male', skin: '#8a5636', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'bald', facialHair: 'moustache', accessory: 'glasses', height: 1.7 },
    },
    taxi: {
      id: 'imran', name: 'Imran', line: 'Taxi! Dubai Creek, Al Fahidi — twenty minutes. Come.',
      look: { gender: 'male', skin: '#8a5636', top: '#e8e2d0', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', height: 1.75 },
    },
  },
  items: [
    { id: 'dates-maamoul', name: 'Date maamoul', category: 'food', basePrice: 2500, nutrition: 25, consumable: true, icon: 'snack', description: 'Shortbread filled with dates — perfect with coffee.' },
    { id: 'karak-cup', name: 'Karak (cup)', category: 'drink', basePrice: 1500, nutrition: 12, consumable: true, icon: 'bottle', description: 'Hot karak in a lidded cup — finish it before security.' },
    { id: 'dhow-magnet', name: 'Dhow fridge magnet', category: 'souvenir', basePrice: 2000, icon: 'key', description: 'A little wooden boat, the kind that still crosses the creek.' },
    { id: 'camel-plush', name: 'Toy camel', category: 'souvenir', basePrice: 5000, icon: 'bag', description: 'Soft, smiling and very huggable.' },
  ],
  walkers: [
    { id: 'daw-1', look: { gender: 'female', skin: '#c48a62', top: '#1d1d1f', bottom: '#1d1d1f', outfit: 'dress', hair: 'bun', headwear: 'wrap', headColor: '#1d1d1f' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'daw-2', look: { gender: 'male', skin: '#f0c9a8', top: '#2c5f9e', bottom: '#c9b28a', outfit: 'tee-shorts', hair: 'short', hairColor: '#8a6a3a', height: 1.84 }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.25, stops: [{ at: 1, activity: 'photo', seconds: 6, face: -Math.PI / 2 }] },
    { id: 'daw-3', look: { gender: 'male', skin: '#5a3420', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[6.2, 20], [6.2, -6], [6.2, 20]], speed: 1.15, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
    { id: 'daw-4', look: { gender: 'male', skin: '#b07a52', top: '#f4f0e6', bottom: '#f4f0e6', outfit: 'kaftan', hair: 'short', headwear: 'kufi', headColor: '#f4f0e6' }, path: [[-5.4, -34], [-5.4, 34]], speed: 1.4 },
  ],
  hotelSign: 'CREEKSIDE AIRPORT HOTEL',
  taxiColor: '#e8e2d0',
  palette: { sky: '#f1dcb2', fog: '#ead6ae', ground: '#c8a57a', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#d1c6b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e2d0' }, { kind: 'car', color: '#f4f0e6' }, { kind: 'car', color: '#1d1d1f' }, { kind: 'car', color: '#9aa3ad' }],
    speed: [4, 6.5],
  },
});
