import { makeAirport } from './airport';

/** Port Harcourt International, Omagwa — flights back to Lagos (fictional terminal, generic signage). */
export const phAirport = makeAirport({
  id: 'ph-airport',
  city: 'Port Harcourt',
  country: 'Nigeria',
  tagline: 'Port Harcourt International — flights back to Lagos leave from here.',
  brand: { primary: '#1d5f7a', accent: '#f2b705' },
  gatesSign: 'GATES D1 – D4',
  greeting: 'Welcome to the Garden City!',
  staff: {
    checkIn: { id: 'ibiere', name: 'Ibiere', look: { gender: 'female', skin: '#5a3420', top: '#1d5f7a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', accessory: 'earrings', height: 1.67 } },
    security: { id: 'officer-amadi', name: 'Officer Amadi', look: { gender: 'male', skin: '#3f2516', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'moustache', headwear: 'cap', headColor: '#2b3a4a', height: 1.83 } },
    gate: { id: 'tamuno', name: 'Tamuno', look: { gender: 'male', skin: '#4a2c1c', top: '#1d5f7a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'hightop', height: 1.79 } },
    shop: {
      id: 'ebiere', name: 'Ebiere', shopName: 'Garden City Kiosk', greeting: 'Something for the flight? Plantain chips, a cold malt — or a little canoe to remember the creeks.',
      look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d5f7a', outfit: 'dress', hair: 'braids', headwear: 'wrap', headColor: '#1d5f7a', height: 1.65 },
    },
    porter: {
      id: 'mama-data', name: 'Mama Data',
      line: 'My child, this cooler of smoked fish and periwinkle is for my daughter in Lagos and it is too heavy for me. Carry it to the check-in desk?',
      look: { gender: 'female', skin: '#4a2c1c', top: '#7a3b72', bottom: '#7a3b72', outfit: 'kaftan', hair: 'short', headwear: 'gele', headColor: '#f2b705', accessory: 'earrings', height: 1.62 },
    },
    taxi: {
      id: 'driver-sotonye', name: 'Sotonye', line: 'Taxi! Town, the waterfront, Mile One — fifty minutes if Ikwerre Road is kind. Enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#f4f0e6', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'beard', height: 1.76 },
    },
  },
  items: [
    { id: 'ph-plantain-chips', name: 'Plantain chips', category: 'food', basePrice: 700, nutrition: 15, consumable: true, icon: 'snack', description: 'Crisp, salty, sold in every Garden City traffic jam.' },
    { id: 'ph-malt', name: 'Malt drink', category: 'drink', basePrice: 800, nutrition: 10, consumable: true, icon: 'bottle', description: 'Cold, sweet malt — finish it before security.' },
    { id: 'mini-canoe', name: 'Carved toy canoe', category: 'souvenir', basePrice: 3500, icon: 'key', description: 'A little dugout canoe with paddler, carved by the creeks.' },
    { id: 'ph-postcard', name: 'Port Harcourt postcard', category: 'souvenir', basePrice: 800, icon: 'key', description: 'Sunset over Kolabi Creek, on card.' },
  ],
  walkers: [
    { id: 'phw-a1', look: { gender: 'male', skin: '#4a2c1c', top: '#1d5f7a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'phw-a2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'dress', hair: 'puff' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  hotelSign: 'OMAGWA AIRPORT HOTEL',
  taxiColor: '#e8e6e0',
  palette: { sky: '#dcd6b4', fog: '#cfc9a8', ground: '#7e7a50', road: '#3a3836', roadLine: '#f4f0e6', sidewalk: '#c9c2b2', gutter: '#4f4a45', sun: '#fff0cf' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#e8e6e0' }, { kind: 'car', color: '#1d5f7a' }],
    speed: [4, 6.5],
  },
});
