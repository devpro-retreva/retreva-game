import type { Region, RegionArea, Route } from './types';

/**
 * Lagos State: the areas you can travel between by danfo, placed on a
 * schematic map (0–100 on both axes, north up) for the Travel app.
 * The airport is a hub: you get there by taxi, and fly abroad from it. The railway station at Ebute Metta is a hub
 * too (trains to Ibadan), a short danfo ride from Yaba.
 */
export const LAGOS_AREAS: RegionArea[] = [
  { id: 'ikeja-village', district: 'Ikeja', known: 'Phones & gadgets', map: [34, 20] },
  { id: 'lagos-adeniyi', district: 'Yaba', known: 'Bukas & barbers', map: [40, 50] },
  { id: 'lagos-island', district: 'Lagos Island', known: 'Fabric markets', map: [36, 74] },
  { id: 'lekki-beach', district: 'Lekki', known: 'Beach & coconut', map: [76, 82], dock: [72, 71] },
  { id: 'badagry-marina', district: 'Badagry', known: 'Heritage & lagoon', map: [11, 58], dock: [13, 66.5] },
  { id: 'lagos-airport', district: 'Airport', known: 'Flights abroad', map: [20, 9], hub: 'airport' },
  { id: 'lagos-station', district: 'Ebute Metta', known: 'Trains to Ibadan', map: [27, 44], hub: 'station' },
];

/**
 * What a trip really costs and how long it takes (2025–26 estimates, naira). Danfo fares are the sum of the
 * legs a commuter actually rides (Yaba → Lekki is Yaba–CMS, then CMS–Lekki; Badagry is via Mile 2): short
 * hops run ₦300–500 and long cross-town trips ₦1,500–2,000 (crowd-sourced fare guides; fares move with fuel
 * prices). Airport trips are ride-hailing taxi prices. Times include ordinary Lagos traffic.
 */
const ROUTES: Route[] = [
  { between: ['lagos-adeniyi', 'lagos-island'], fare: 400, minutes: 35 },
  { between: ['lagos-adeniyi', 'ikeja-village'], fare: 600, minutes: 50 },
  { between: ['lagos-adeniyi', 'lekki-beach'], fare: 1000, minutes: 75, via: 'via CMS' },
  { between: ['lagos-adeniyi', 'badagry-marina'], fare: 1800, minutes: 120, via: 'via Mile 2' },
  { between: ['lagos-island', 'ikeja-village'], fare: 700, minutes: 60 },
  { between: ['lagos-island', 'lekki-beach'], fare: 700, minutes: 50 },
  { between: ['lagos-island', 'badagry-marina'], fare: 1600, minutes: 110, via: 'via Mile 2' },
  { between: ['ikeja-village', 'lekki-beach'], fare: 1500, minutes: 105, via: 'via CMS' },
  { between: ['ikeja-village', 'badagry-marina'], fare: 1900, minutes: 120, via: 'via Mile 2' },
  { between: ['lekki-beach', 'badagry-marina'], fare: 2500, minutes: 150, via: 'via CMS and Mile 2' },
  // taxis to and from the airport
  { between: ['lagos-airport', 'ikeja-village'], fare: 5000, minutes: 25 },
  { between: ['lagos-airport', 'lagos-adeniyi'], fare: 9000, minutes: 50 },
  { between: ['lagos-airport', 'lagos-island'], fare: 12000, minutes: 65 },
  { between: ['lagos-airport', 'lekki-beach'], fare: 18000, minutes: 90 },
  { between: ['lagos-airport', 'badagry-marina'], fare: 20000, minutes: 100 },
  // Mobolaji Johnson Station, Ebute Metta: by danfo (it's next to Yaba); a taxi from the airport
  { between: ['lagos-station', 'lagos-adeniyi'], fare: 300, minutes: 15 },
  { between: ['lagos-station', 'lagos-island'], fare: 400, minutes: 30 },
  { between: ['lagos-station', 'ikeja-village'], fare: 600, minutes: 45 },
  { between: ['lagos-station', 'lekki-beach'], fare: 1100, minutes: 80, via: 'via CMS' },
  { between: ['lagos-station', 'badagry-marina'], fare: 1800, minutes: 115, via: 'via Mile 2' },
  { between: ['lagos-station', 'lagos-airport'], fare: 8000, minutes: 45 },
];

/**
 * Boats on the lagoon. The state ferry lists ₦1,500 for Badagry – CMS/Marina; Lekki is a second leg from CMS,
 * so the through trip is two fares. Quicker than the road, which crawls through Mile 2 and CMS.
 */
const BOATS: Route[] = [
  { between: ['badagry-marina', 'lekki-beach'], fare: 3000, minutes: 110, via: 'via CMS/Marina' },
];

export const LAGOS: Region = {
  id: 'lagos',
  name: 'Lagos',
  country: 'Nigeria',
  transit: 'Danfo',
  areas: LAGOS_AREAS,
  map: 'lagos',
  routes: ROUTES,
  boats: BOATS,
  boatName: 'Ferry',
};

export const HOME_AREA = 'lagos-adeniyi';
