import type { Region } from './types';

/**
 * Jos (Plateau State): the city centre around Terminus, up on the cool Jos Plateau, with the National Museum and the
 * Shere Hills to the east. Reached by intercity bus from Abuja (see intercity.ts).
 */
export const PLATEAU: Region = {
  id: 'jos',
  name: 'Jos',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'jos-terminus', district: 'Terminus', known: 'Museum, highland farms & granite hills', map: [50, 50] }],
  routes: [],
};
