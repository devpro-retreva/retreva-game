import type { Region } from './types';

/**
 * Ibadan (Oyo State): Dugbe in the old city centre, and the railway station at Moniya on the northern edge,
 * about 18 km out. A taxi between them is about ₦5,000 and forty minutes (ride-hailing estimate, 2026).
 */
export const OYO: Region = {
  id: 'ibadan',
  name: 'Ibadan',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'ibadan-dugbe', district: 'Dugbe', known: 'Cocoa House & market', map: [50, 56] },
    { id: 'ibadan-station', district: 'Moniya station', known: 'Trains to Lagos', map: [52, 18], hub: 'station' },
  ],
  routes: [{ between: ['ibadan-dugbe', 'ibadan-station'], fare: 5000, minutes: 40 }],
};
