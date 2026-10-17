import type { Region } from './types';

/**
 * Abeokuta (Ogun State): Itoku, the adire market under Olumo Rock. Reached by intercity bus from Lagos or Ibadan
 * (see intercity.ts) — the buses pull in at the motor park at the end of the street.
 */
export const ABEOKUTA: Region = {
  id: 'abeokuta',
  name: 'Abeokuta',
  country: 'Nigeria',
  transit: 'Taxi',
  areas: [{ id: 'abeokuta-itoku', district: 'Itoku', known: 'Olumo Rock & adire', map: [50, 50] }],
  routes: [],
};
