import type { Region } from './types';

/** Greater Accra: Osu, and the airport you fly in and out of. */
export const ACCRA: Region = {
  id: 'accra',
  name: 'Accra',
  country: 'Ghana',
  transit: 'Taxi',
  areas: [
    { id: 'accra-osu', district: 'Osu', known: 'Oxford Street & chop bars', map: [58, 72] },
    { id: 'accra-airport', district: 'Airport', known: 'Flights home', map: [52, 34], hub: 'airport' },
  ],
};
