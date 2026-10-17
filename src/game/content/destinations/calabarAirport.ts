import { makeAirport } from './airport';

/** Margaret Ekpang International, Calabar — flights back to Lagos (fictional terminal, generic signage). */
export const calabarAirport = makeAirport({
  id: 'calabar-airport',
  city: 'Calabar',
  country: 'Nigeria',
  tagline: 'Margaret Ekpang International — flights back to Lagos leave from here.',
  brand: { primary: '#1d5f7a', accent: '#f2b705' },
  gatesSign: 'GATES E1 – E4',
  greeting: 'Abadie? Good afternoon.',
  staff: {
    checkIn: { id: 'eno', name: 'Eno', look: { gender: 'female', skin: '#5a3420', top: '#1d5f7a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', accessory: 'earrings', height: 1.66 } },
    security: { id: 'officer-etim', name: 'Officer Etim', look: { gender: 'male', skin: '#3f2516', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#2b3a4a', height: 1.82 } },
    gate: { id: 'bassey', name: 'Bassey', look: { gender: 'male', skin: '#4a2c1c', top: '#1d5f7a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.78 } },
    shop: {
      id: 'idara', name: 'Idara', shopName: 'Canopy Kiosk', greeting: 'Something for the flight? Meat pie, a cold malt, a little drill monkey for the children.',
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d5f7a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#1d5f7a', height: 1.65 },
    },
    porter: {
      id: 'madam-edet', name: 'Madam Edet',
      line: 'Please, my child — this cooler is full of afang and fish for my son in Lagos and it is too heavy for me. Carry it to the check-in desk?',
      look: { gender: 'female', skin: '#5a3420', top: '#7a3b72', bottom: '#7a3b72', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.62 },
    },
    taxi: {
      id: 'asuquo', name: 'Asuquo', line: 'Taxi! Marina, twenty minutes. Calabar roads are clean and smooth — enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', height: 1.76 },
    },
  },
  items: [
    { id: 'calabar-meatpie', name: 'Meat pie', category: 'food', basePrice: 1500, nutrition: 25, consumable: true, icon: 'snack', description: 'Warm, flaky, filled with minced beef and potato.' },
    { id: 'malt-drink', name: 'Malt drink', category: 'drink', basePrice: 800, nutrition: 10, consumable: true, icon: 'bottle', description: 'Cold, sweet malt — finish it before security.' },
    { id: 'drill-plush', name: 'Toy drill monkey', category: 'souvenir', basePrice: 4000, icon: 'bag', description: 'Soft toy of the rare drill monkey, protected in Cross River.' },
    { id: 'calabar-postcard', name: 'Calabar postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'Carnival costumes on the Marina, on card.' },
  ],
  walkers: [
    { id: 'cbw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'cbw-2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'dress', hair: 'puff' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'MARINA AIRPORT HOTEL',
  taxiColor: '#e8e6e0',
  palette: { sky: '#e6d6ae', fog: '#d8cba6', ground: '#8f8a5c', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#c9c2b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d5f7a' }, { kind: 'car', color: '#1d1d1f' }],
    speed: [4, 6.5],
  },
});
