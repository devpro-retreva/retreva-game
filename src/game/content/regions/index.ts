/**
 * Regions group the areas you can ride between without flying.
 * Fares and trip times are listed per region (`routes`, and `boats` between areas with a jetty); a pair nobody has
 * priced yet falls back to a map-distance estimate. The everyday ride (danfo, tro-tro…) links ordinary areas and
 * railway stations, a taxi any trip to or from an airport.
 */
import { LAGOS } from './lagosState';
import { ACCRA } from './greaterAccra';
import { DUBAI } from './dubai';
import { ABUJA } from './abuja';
import { CALABAR } from './calabar';
import { OYO } from './oyo';
import { ABEOKUTA } from './abeokuta';
import { OSUN } from './osun';
import { BENIN } from './benin';
import { ENUGU } from './enugu';
import { COACHES, COACH_NAME } from './intercity';
import type { Region, RegionArea, Route, TravelBy } from './types';

export type { Region, RegionArea, Route, TravelBy } from './types';
export { LAGOS_AREAS, HOME_AREA } from './lagosState';
export { COACHES, COACH_NAME, NIGERIA_MAP, SOUTH_WEST_MAP } from './intercity';

export const REGIONS: Region[] = [LAGOS, ACCRA, DUBAI, ABUJA, CALABAR, OYO, ABEOKUTA, OSUN, BENIN, ENUGU];
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

function routeIn(list: Route[] | undefined, a: string, b: string): Route | undefined {
  return list?.find((r) => (r.between[0] === a && r.between[1] === b) || (r.between[0] === b && r.between[1] === a));
}

/** The listed trip between two areas: of the same region by road or by boat, or between cities by intercity bus. */
export function routeBetween(fromId: string, toId: string, by: TravelBy = 'road'): Route | undefined {
  if (by === 'coach') return fromId === toId ? undefined : routeIn(COACHES, fromId, toId);
  const region = regionOf(fromId);
  if (!region || region !== regionOf(toId) || fromId === toId) return undefined;
  return routeIn(by === 'boat' ? region.boats : region.routes, fromId, toId);
}

/** Areas you can reach by boat from here (none if this area has no jetty). */
export function boatsFrom(areaId: string): RegionArea[] {
  const region = regionOf(areaId);
  return (region?.areas ?? []).filter((a) => a.id !== areaId && !!routeIn(region?.boats, areaId, a.id));
}

/** Areas in other cities you can reach by intercity bus from here (none unless this area has a motor park). */
export function coachesFrom(areaId: string): RegionArea[] {
  return ALL_AREAS.filter((a) => a.id !== areaId && !!routeIn(COACHES, areaId, a.id));
}

/** How you get between two areas of the same region. */
export function modeBetween(fromId: string, toId: string, by: TravelBy = 'road'): string {
  if (by === 'coach') return COACH_NAME;
  if (by === 'boat') return regionOf(fromId)?.boatName ?? 'Boat';
  const a = findArea(fromId);
  const b = findArea(toId);
  if (a?.hub === 'airport' || b?.hub === 'airport') return 'Taxi';
  return regionOf(fromId)?.transit ?? 'Danfo';
}

/**
 * Fare in naira: the region's listed fare for the trip, or (for a pair nobody has priced yet) an estimate from
 * map distance rounded to ₦50. 0 for the same area, across regions (that needs a flight) or a boat that doesn't run.
 */
export function fareBetween(fromId: string, toId: string, by: TravelBy = 'road'): number {
  if (by === 'coach') return routeBetween(fromId, toId, 'coach')?.fare ?? 0;
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b || a.id === b.id || regionOf(a.id) !== regionOf(b.id)) return 0;
  const listed = routeBetween(fromId, toId, by);
  if (listed) return listed.fare;
  if (by === 'boat') return 0;
  const d = distance(a, b);
  const taxi = a.hub === 'airport' || b.hub === 'airport' || regionOf(a.id)?.transit === 'Taxi';
  return Math.round((taxi ? 3000 + d * 200 : 300 + d * 30) / 50) * 50;
}

/** Trip time in game minutes, traffic included. */
export function minutesBetween(fromId: string, toId: string, by: TravelBy = 'road'): number {
  const listed = routeBetween(fromId, toId, by);
  if (listed) return listed.minutes;
  const a = findArea(fromId);
  const b = findArea(toId);
  if (!a || !b) return 0;
  return Math.round(15 + distance(a, b) * 1.5);
}
