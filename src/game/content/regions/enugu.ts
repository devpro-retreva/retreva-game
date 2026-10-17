import type { Region } from './types';

/**
 * Enugu (Enugu State): Ogui, by Ogbete Main Market and the old Coal Camp, under Milliken Hill; and Akanu Ibiam
 * airport east of the city (taxi about ₦6,000 and half an hour, estimate). Reached by domestic flight from Lagos or by
 * the intercity bus from Benin City (see intercity.ts).
 */
export const ENUGU: Region = {
  id: 'enugu',
  name: 'Enugu',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'enugu-ogui', district: 'Ogui', known: 'Coal City market & Milliken Hill', map: [46, 50] },
    { id: 'enugu-airport', district: 'Airport', known: 'Flights to Lagos', map: [70, 30], hub: 'airport' },
  ],
  routes: [{ between: ['enugu-ogui', 'enugu-airport'], fare: 6000, minutes: 30 }],
};
