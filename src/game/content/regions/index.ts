/**
 * Regions group the areas you can ride between without flying.
 * Fares and trip times come from map distance, so new areas price themselves:
 * the everyday ride (danfo, tro-tro…) for ordinary areas, a taxi for trips to or from a hub.
 */
import { LAGOS } from './lagosState';
import { ACCRA } from './greaterAccra';
import type { Region, RegionArea } from './types';

export type { Region, RegionArea } from './types';
export { LAGOS_AREAS, HOME_AREA } from './lagosState';

export const REGIONS: Region[] = [LAGOS, ACCRA];
export const ALL_AREAS: RegionArea[] = REGIONS.flatMap((r) => r.areas);

export function findArea(id: string): RegionArea | undefined {
  return ALL_AREAS.find((a) => a.id === id);
}

export function regionOf(areaId: string): Region | undefined {
  return REGIONS.find((r) => r.areas.some((a) => a.id === areaId));
}

/** Areas that count toward "visit every area" in a region (hubs excluded). */
export function districts(region: Region): RegionArea[] {
  return region.areas.filter((a) => !a.hub);
}

function distance(a: RegionArea, b: RegionArea) {
  return Math.hypot(a.map[0] - b.map[0], a.map[1] - b.map[1]);
}

/** How you get between two areas of the same region. */
export function modeBetween(fromId: string, toId: string): string {
  const a = findArea(fromId);
  const b = findArea(toId);
  if (a?.hub || b?.hub) return 'Taxi';
  return regionOf(fromId)?.transit ?? 'Danfo';
}

/** Fare in naira, rounded to the nearest ₦50. 0 for the same area or across regions (that needs a flight). */
export function fareBetween(fromId: string, toId: string): number {
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b || a.id === b.id || regionOf(a.id) !== regionOf(b.id)) return 0;
  const d = distance(a, b);
  const taxi = !!(a.hub || b.hub) || regionOf(a.id)?.transit === 'Taxi';
  return Math.round((taxi ? 1200 + d * 25 : 200 + d * 11) / 50) * 50;
}

/** Rough trip time in minutes of traffic, for flavour. */
export function minutesBetween(fromId: string, toId: string): number {
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b) return 0;
  return Math.round(15 + distance(a, b) * 0.9);
}
