import type { Region } from './types';

/**
 * Calabar (Cross River): the Marina on the Calabar River, and Margaret Ekpang airport in town.
 * The airport is close — a taxi is about ₦5,000 and twenty minutes (estimate).
 */
export const CALABAR: Region = {
  id: 'calabar',
  name: 'Calabar',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'calabar-marina', district: 'Marina', known: 'River front & heritage', map: [56, 50] },
    { id: 'calabar-airport', district: 'Airport', known: 'Flights to Lagos', map: [60, 26], hub: 'airport' },
  ],
  routes: [{ between: ['calabar-marina', 'calabar-airport'], fare: 5000, minutes: 20 }],
};
