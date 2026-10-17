import type { Region } from './types';

/**
 * Erin-Ijesha (Osun State): the town at the foot of the Olumirin Waterfalls, in the hills beyond Ilesa. Reached by
 * intercity bus from Ile-Ife or Osogbo (see intercity.ts); the falls are climbed on foot from the gate.
 */
export const ERIN: Region = {
  id: 'erin',
  name: 'Erin-Ijesha',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'erin-olumirin', district: 'Olumirin Falls', known: 'The seven-level waterfall climb', map: [50, 50] }],
  routes: [],
};
