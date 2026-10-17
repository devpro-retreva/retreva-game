import type { Route } from './types';

/**
 * Intercity buses between cities you can reach by road, boarded at a motor park through a conductor, like a danfo.
 * Fares are 2026 park fares for a seat on a bus (naira): Lagos → Abeokuta ₦3,500–4,000 from Ojota, Oshodi or
 * Berger (reported after the fuel subsidy went, up to ₦5,000 at festive times); Abeokuta → Ibadan ₦1,200–2,500;
 * Lagos → Ibadan ₦3,000–6,000 on the regular lines (more on the luxury ones); Ibadan → Osogbo ₦3,000–4,000 (about
 * 90 km on the Ibadan–Ife–Osogbo road). Times include the expressway traffic.
 * In the game every bus to or from Lagos uses the Ojota park, next to Ikeja.
 */
export const COACH_NAME = 'Intercity bus';

export const COACHES: Route[] = [
  { between: ['ikeja-village', 'abeokuta-itoku'], fare: 4000, minutes: 120, via: 'from Ojota park, Lagos–Abeokuta Expressway' },
  { between: ['abeokuta-itoku', 'ibadan-dugbe'], fare: 2500, minutes: 100, via: 'via Odeda' },
  { between: ['ikeja-village', 'ibadan-dugbe'], fare: 6000, minutes: 150, via: 'from Ojota park, Lagos–Ibadan Expressway' },
  { between: ['ibadan-dugbe', 'osogbo-oja-oba'], fare: 3500, minutes: 110, via: 'via Ikire and Ikirun junction' },
  // the long road east: luxury lines run Lagos–Benin for about ₦25,000–27,000 (GIGM online fares, October 2026)
  { between: ['ikeja-village', 'benin-kings-square'], fare: 26000, minutes: 360, via: 'from Ojota park, via Ore' },
  // Benin → Enugu (about 250 km over the Niger at Onitsha): no 2026 fare was published for this leg, so this is an
  // estimate scaled by distance from the Lagos–Benin fare
  { between: ['benin-kings-square', 'enugu-ogui'], fare: 15000, minutes: 300, via: 'via Asaba and the Niger Bridge' },
  // Enugu → Port Harcourt: 2026 guides list ₦6,500–11,000 one way and ₦10,000–14,000 the other
  { between: ['enugu-ogui', 'ph-waterfront'], fare: 10000, minutes: 270, via: 'via Aba' },
];

/** Where each city sits on the south-west map drawn for bus and train trips (0–100 × 0–60). */
export const SOUTH_WEST_MAP: Record<string, [number, number]> = {
  lagos: [8, 52],
  abeokuta: [28, 30],
  ibadan: [52, 20],
  osogbo: [88, 10],
};

/** Cities on the map of Nigeria (same frame as the domestic flight chart), for bus trips beyond the south-west. */
export const NIGERIA_MAP: Record<string, [number, number]> = {
  lagos: [14, 47],
  benin: [36, 44],
  enugu: [50, 45],
  'port-harcourt': [55, 52],
};
