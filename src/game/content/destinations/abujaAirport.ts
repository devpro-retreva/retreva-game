import { makeAirport } from './airport';

/** Nnamdi Azikiwe International, Abuja — flights back to Lagos (fictional terminal, generic signage). */
export const abujaAirport = makeAirport({
  id: 'abuja-airport',
  city: 'Abuja',
  country: 'Nigeria',
  tagline: 'Nnamdi Azikiwe International — flights back to Lagos leave from here.',
  brand: { primary: '#2f7a52', accent: '#e8e6e0' },
  gatesSign: 'GATES D1 – D6',
  greeting: 'Sannu, good afternoon.',
  staff: {
    checkIn: { id: 'zainab', name: 'Zainab', look: { gender: 'female', skin: '#6b4026', top: '#2f7a52', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', headwear: 'wrap', headColor: '#e8e6e0', accessory: 'earrings', height: 1.68 } },
    security: { id: 'officer-bello', name: 'Officer Bello', look: { gender: 'male', skin: '#4a2c1c', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#2b3a4a', height: 1.83 } },
    gate: { id: 'ifeanyi', name: 'Ifeanyi', look: { gender: 'male', skin: '#5a3420', top: '#2f7a52', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.79 } },
    shop: {
      id: 'halima', name: 'Halima', shopName: 'Capital Kiosk', greeting: 'Kilishi for the family in Lagos? Kunun aya for the plane? Everything sealed and ready to fly.',
      look: { gender: 'female', skin: '#5a3420', top: '#e8e6e0', bottom: '#2f7a52', outfit: 'dress', hair: 'long', headwear: 'wrap', headColor: '#2f7a52', height: 1.64 },
    },
    porter: {
      id: 'alhaji-yusuf', name: 'Alhaji Yusuf',
      line: 'Young one, my knees are not what they were and this box is full of kilishi for my grandchildren in Lagos. Could you carry it to the check-in desk for me?',
      look: { gender: 'male', skin: '#4a2c1c', top: '#f4f0e6', bottom: '#f4f0e6', outfit: 'kaftan', hair: 'low', facialHair: 'beard', headwear: 'kufi', headColor: '#e8e6e0', accessory: 'glasses', height: 1.76 },
    },
    taxi: {
      id: 'danjuma', name: 'Danjuma', line: 'Green cab! Wuse, forty minutes on the airport road. Enter, enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#2f7a52', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'moustache', height: 1.77 },
    },
  },
  items: [
    { id: 'kilishi-pack', name: 'Kilishi (sealed pack)', category: 'food', basePrice: 4000, nutrition: 25, consumable: true, icon: 'snack', description: 'Spiced, sun-dried beef from the north — the gift everyone in Lagos asks for.' },
    { id: 'kunun-aya', name: 'Kunun aya', category: 'drink', basePrice: 1200, nutrition: 12, consumable: true, icon: 'bottle', description: 'Creamy tiger-nut drink, chilled — finish it before security.' },
    { id: 'aso-rock-postcard', name: 'Aso Rock postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'The great granite rock at sunset, on card.' },
    { id: 'abuja-keyring', name: 'Green-and-white keyring', category: 'souvenir', basePrice: 1500, icon: 'key', description: 'A little Abuja taxi on a ring.' },
  ],
  walkers: [
    { id: 'abw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'abw-2', look: { gender: 'female', skin: '#6b4026', top: '#2f7a52', bottom: '#1d1d1f', outfit: 'dress', hair: 'braids', headwear: 'gele', headColor: '#2f7a52' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.15, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'CAPITAL AIRPORT HOTEL',
  taxiColor: '#2f7a52',
  palette: { sky: '#e8d9b0', fog: '#dccfa8', ground: '#9c8a64', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#c9c2b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#2f7a52' }, { kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d1d1f' }],
    speed: [4, 6.5],
  },
});
