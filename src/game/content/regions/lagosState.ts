/**
 * Lagos State: the areas you can travel between by danfo, placed on a
 * schematic map (0–100 on both axes, north up) for the Travel app.
 * Fares and trip times come from map distance so new areas price themselves.
 */

export interface RegionArea {
  /** Destination pack id. */
  id: string;
  district: string;
  /** Short label for the travel card. */
  known: string;
  map: [number, number];
}

export const LAGOS_AREAS: RegionArea[] = [
  { id: 'ikeja-village', district: 'Ikeja', known: 'Phones & gadgets', map: [34, 20] },
  { id: 'lagos-adeniyi', district: 'Yaba', known: 'Bukas & barbers', map: [40, 50] },
  { id: 'lagos-island', district: 'Lagos Island', known: 'Fabric markets', map: [36, 74] },
  { id: 'lekki-beach', district: 'Lekki', known: 'Beach & coconut', map: [76, 82] },
];

export const HOME_AREA = 'lagos-adeniyi';

export function findArea(id: string): RegionArea | undefined {
  return LAGOS_AREAS.find((a) => a.id === id);
}

function distance(a: RegionArea, b: RegionArea) {
  return Math.hypot(a.map[0] - b.map[0], a.map[1] - b.map[1]);
}

/** Danfo fare in naira, rounded to the nearest ₦50. */
export function fareBetween(fromId: string, toId: string): number {
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b || a.id === b.id) return 0;
  return Math.round((200 + distance(a, b) * 11) / 50) * 50;
}

/** Rough trip time in minutes of Lagos traffic, for flavour. */
export function minutesBetween(fromId: string, toId: string): number {
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b) return 0;
  return Math.round(15 + distance(a, b) * 0.9);
}
