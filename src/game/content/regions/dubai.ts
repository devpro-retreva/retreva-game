import type { Region } from './types';

/** Dubai: the creek by Al Fahidi, and the airport you fly in and out of. */
export const DUBAI: Region = {
  id: 'dubai',
  name: 'Dubai',
  country: 'United Arab Emirates',
  transit: 'Taxi',
  areas: [
    { id: 'dubai-creek', district: 'Dubai Creek', known: 'Spice souk & water taxis', map: [44, 58] },
    { id: 'dubai-airport', district: 'Airport', known: 'Flights home', map: [66, 36], hub: 'airport' },
  ],
};
