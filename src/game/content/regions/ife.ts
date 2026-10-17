import type { Region } from './types';

/**
 * Ile-Ife (Osun State): Enuwa, the square before the Ooni's palace, with the National Museum close by and Opa
 * Oranmiyan a short walk away. Reached by intercity bus from Osogbo or Ibadan (see intercity.ts).
 */
export const IFE: Region = {
  id: 'ife',
  name: 'Ile-Ife',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'ife-enuwa', district: 'Enuwa', known: 'The Ooni’s palace, Ife heads & beads', map: [50, 50] }],
  routes: [],
};
