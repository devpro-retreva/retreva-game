import type { Region } from './types';

/**
 * Port Harcourt (Rivers State): the waterfront by Kolabi Creek, near Mile One Market and Isaac Boro Park; and the
 * international airport at Omagwa, north of the city (taxi about ₦12,000 and fifty minutes, estimate). Reached by
 * domestic flight from Lagos or by the intercity bus from Enugu (see intercity.ts).
 */
export const RIVERS: Region = {
  id: 'port-harcourt',
  name: 'Port Harcourt',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'ph-waterfront', district: 'Waterfront', known: 'Creek, fish & the Garden City', map: [50, 58] },
    { id: 'ph-airport', district: 'Airport', known: 'Flights to Lagos', map: [40, 16], hub: 'airport' },
  ],
  routes: [{ between: ['ph-waterfront', 'ph-airport'], fare: 12000, minutes: 50 }],
};
