import type { Region } from './types';

/**
 * Kano (Kano State): the old city around Kurmi Market — the Emir's palace, the Kofar Mata dye pits, the old gates —
 * and Mallam Aminu Kano International, close to town (taxi about ₦5,000 and twenty-five minutes, estimate).
 * Reached by domestic flight from Lagos.
 */
export const KANO: Region = {
  id: 'kano',
  name: 'Kano',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'kano-kurmi', district: 'Old City', known: 'Kurmi Market & the dye pits', map: [50, 56] },
    { id: 'kano-airport', district: 'Airport', known: 'Flights to Lagos', map: [56, 20], hub: 'airport' },
  ],
  routes: [{ between: ['kano-kurmi', 'kano-airport'], fare: 5000, minutes: 25 }],
};
