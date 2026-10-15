import type { Region, RegionArea } from './types';

/**
 * Lagos State: the areas you can travel between by danfo, placed on a
 * schematic map (0–100 on both axes, north up) for the Travel app.
 * The airport is a hub: you get there by taxi, and fly abroad from it.
 */
export const LAGOS_AREAS: RegionArea[] = [
  { id: 'ikeja-village', district: 'Ikeja', known: 'Phones & gadgets', map: [34, 20] },
  { id: 'lagos-adeniyi', district: 'Yaba', known: 'Bukas & barbers', map: [40, 50] },
  { id: 'lagos-island', district: 'Lagos Island', known: 'Fabric markets', map: [36, 74] },
  { id: 'lekki-beach', district: 'Lekki', known: 'Beach & coconut', map: [76, 82] },
  { id: 'lagos-airport', district: 'Airport', known: 'Flights abroad', map: [20, 9], hub: 'airport' },
];

export const LAGOS: Region = {
  id: 'lagos',
  name: 'Lagos',
  country: 'Nigeria',
  transit: 'Danfo',
  areas: LAGOS_AREAS,
  map: 'lagos',
};

export const HOME_AREA = 'lagos-adeniyi';
