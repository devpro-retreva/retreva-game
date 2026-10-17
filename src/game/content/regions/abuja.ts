import type { Region } from './types';

/**
 * Abuja (FCT): Wuse, and Nnamdi Azikiwe airport, about 40 km out on the airport road.
 * Green-and-white taxis do most of the work; the airport run is about ₦12,000 by ride-hailing (estimate).
 */
export const ABUJA: Region = {
  id: 'abuja',
  name: 'Abuja',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [
    { id: 'abuja-wuse', district: 'Wuse', known: 'Market & suya', map: [50, 46] },
    { id: 'abuja-airport', district: 'Airport', known: 'Flights to Lagos', map: [30, 72], hub: 'airport' },
  ],
  routes: [{ between: ['abuja-wuse', 'abuja-airport'], fare: 12000, minutes: 40 }],
};
