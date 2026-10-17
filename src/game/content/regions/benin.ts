import type { Region } from './types';

/**
 * Benin City (Edo State): King's Square — the National Museum, Igun Street's bronze casters, Oba Market — and the
 * airport a short drive away (taxi about ₦4,000 and twenty minutes, estimate). Reached by domestic flight from Lagos
 * or by the long intercity bus from Ojota (see intercity.ts).
 */
export const BENIN: Region = {
  id: 'benin',
  name: 'Benin City',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'benin-kings-square', district: 'King’s Square', known: 'Bronze casters & the museum', map: [50, 50] },
    { id: 'benin-airport', district: 'Airport', known: 'Flights to Lagos', map: [40, 24], hub: 'airport' },
  ],
  routes: [{ between: ['benin-kings-square', 'benin-airport'], fare: 4000, minutes: 20 }],
};
