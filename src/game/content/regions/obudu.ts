import type { Region } from './types';

/**
 * Obudu (Cross River): the Obudu Plateau, about 1,600 m up near the Cameroon border. The base station sits in the
 * rainforest at the foot of the escarpment; the ranch resort is on top. Between them run the cable car (about 4 km,
 * climbing some 870 m) and the 11 km hairpin road. Neither fare is published: both are estimates, and the cable car
 * has had long breakdowns in real life. Reached by intercity bus from Calabar (see intercity.ts).
 */
export const OBUDU: Region = {
  id: 'obudu',
  name: 'Obudu',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'obudu-base', district: 'Base station', known: 'Rainforest & the cable car up', map: [50, 78] },
    { id: 'obudu-ranch', district: 'The Ranch', known: 'Cattle, mist & mountain air', map: [50, 22] },
  ],
  routes: [{ between: ['obudu-base', 'obudu-ranch'], fare: 2000, minutes: 40, via: 'up the 11 km hairpin road' }],
  cables: [{ between: ['obudu-base', 'obudu-ranch'], fare: 5000, minutes: 25, via: 'over the forest, about 4 km' }],
};
