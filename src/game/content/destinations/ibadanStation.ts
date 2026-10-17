import { makeStation } from './station';

/** Obafemi Awolowo Station, Moniya — trains back to Lagos (generic signage; the rail operator is fictional). */
export const ibadanStation = makeStation({
  id: 'ibadan-station',
  city: 'Ibadan',
  stationName: 'Obafemi Awolowo Station',
  locality: 'MONIYA',
  tagline: 'Moniya, on the northern edge of Ibadan — the train back to Lagos leaves from here.',
  brand: { primary: '#1f6f4a', accent: '#f2b705' },
  greeting: 'Ẹ káàsán — good afternoon.',
  staff: {
    inspector: { id: 'mrs-oyelaran', name: 'Mrs. Oyelaran', look: { gender: 'female', skin: '#5a3420', top: '#1f6f4a', bottom: '#1d1d1f', outfit: 'top-skirt', hair: 'bun', headwear: 'cap', headColor: '#1f6f4a', accessory: 'glasses', height: 1.66 } },
    security: { id: 'officer-akande', name: 'Officer Akande', look: { gender: 'male', skin: '#3f2516', top: '#2b3a4a', bottom: '#1d1d1f', outfit: 'shirt', hair: 'low', facialHair: 'beard', headwear: 'cap', headColor: '#2b3a4a', height: 1.82 } },
    guard: { id: 'guard-kehinde', name: 'Guard Kehinde', look: { gender: 'female', skin: '#6b4026', top: '#f4f0e6', bottom: '#1f6f4a', outfit: 'top-trousers', hair: 'braids', headwear: 'cap', headColor: '#1f6f4a', height: 1.7 } },
    shop: {
      id: 'mama-ayo', name: 'Mama Ayo', shopName: 'Moniya Kiosk', greeting: 'For the road? Gala, puff-puff, zobo — Lagos is two and a half hours.',
      look: { gender: 'female', skin: '#4a2c1c', top: '#f2b705', bottom: '#1f6f4a', outfit: 'dress', hair: 'short', headwear: 'wrap', headColor: '#1f6f4a', accessory: 'earrings', height: 1.63 },
    },
    porter: {
      id: 'mr-adewale', name: 'Mr. Adewale',
      line: 'Please — this box of books is for my son at UNILAG and I have to buy my ticket. Carry it to the ticket barrier for me?',
      look: { gender: 'male', skin: '#5b3622', top: '#4a5a72', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', accessory: 'glasses', height: 1.76 },
    },
    ride: {
      id: 'driver-ade', name: 'Ade', kind: 'taxi', color: '#d8452b',
      line: 'Taxi! Dugbe, Bodija, UI — forty minutes into town. Enter.',
      look: { gender: 'male', skin: '#3f2516', top: '#e8e6e0', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low', facialHair: 'goatee', height: 1.75 },
    },
  },
  items: [
    { id: 'moniya-gala', name: 'Gala sausage roll', category: 'food', basePrice: 400, nutrition: 15, consumable: true, icon: 'snack', description: 'For the train, or the taxi, or right now.' },
    { id: 'moniya-puff', name: 'Puff-puff', category: 'food', basePrice: 500, nutrition: 18, consumable: true, icon: 'snack', description: 'Still warm, in a paper bag.' },
    { id: 'moniya-zobo', name: 'Zobo', category: 'drink', basePrice: 600, nutrition: 8, consumable: true, icon: 'bottle', description: 'Chilled hibiscus with ginger.' },
    { id: 'ibadan-magnet', name: 'Brown-roof fridge magnet', category: 'souvenir', basePrice: 1000, icon: 'key', description: 'Old Ibadan’s rusty roofs, in miniature.' },
  ],
  walkers: [
    { id: 'isw-1', look: { gender: 'male', skin: '#4a2c1c', top: '#1f6f4a', bottom: '#2a2a2a', outfit: 'shirt', hair: 'low' }, path: [[5.4, 30], [5.4, -18], [5.4, 30]], speed: 1.2, stops: [{ at: 1, activity: 'wait', seconds: 8, face: Math.PI / 2 }] },
    { id: 'isw-2', look: { gender: 'female', skin: '#6b4026', top: '#f2b705', bottom: '#1d1d1f', outfit: 'dress', hair: 'puff' }, path: [[7.2, -30], [7.2, 24], [7.2, -30]], speed: 1.1, stops: [{ at: 1, activity: 'shop', seconds: 7, face: Math.PI / 2 }] },
  ],
  palette: { sky: '#e8d6ab', fog: '#dccaa0', ground: '#94845a', road: '#3a3734', roadLine: '#efe4c8', sidewalk: '#c6b9a2', gutter: '#4f4a45', sun: '#ffe4b0' },
  traffic: {
    lanes: [{ x: 2, dir: -1 }, { x: -2, dir: 1 }],
    vehicles: [{ kind: 'car', color: '#d8452b' }, { kind: 'car', color: '#e8e6e0' }],
    speed: [4, 6.5],
  },
});
