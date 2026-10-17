import type { Region } from './types';

/**
 * Yankari Game Reserve (Bauchi State): Wikki Camp, the tourist camp deep inside the reserve beside the Wikki Warm
 * Spring and the Gaji River. Reached by intercity bus from Jos (see intercity.ts); game drives leave from the camp.
 */
export const BAUCHI: Region = {
  id: 'yankari',
  name: 'Yankari',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'yankari-wikki', district: 'Wikki Camp', known: 'Game drives, elephants & the warm spring', map: [50, 50] }],
  routes: [],
};
