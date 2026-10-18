import type { Region } from './types';

/**
 * Ikogosi (Ekiti State): the warm springs resort in the hills at the edge of the town, where a warm spring and a
 * cold spring meet. Reached by intercity bus from Erin-Ijesha, over the hills past Efon (see intercity.ts).
 */
export const IKOGOSI: Region = {
  id: 'ikogosi',
  name: 'Ikogosi',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'ikogosi-springs', district: 'Warm Springs', known: 'Where a warm spring meets a cold one', map: [50, 50] }],
  routes: [],
};
