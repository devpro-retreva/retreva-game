import type { Region } from './types';

/**
 * Osogbo (Osun State): Oja Oba, the market in front of the Ataoja's palace, with the Osun-Osogbo Sacred Grove at
 * the edge of town. Reached by intercity bus from Ibadan (see intercity.ts).
 */
export const OSUN: Region = {
  id: 'osogbo',
  name: 'Osogbo',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'osogbo-oja-oba', district: 'Oja Oba', known: 'Palace, art & the sacred grove', map: [50, 50] }],
  routes: [],
};
