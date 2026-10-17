import type { DestinationPack, ItemDef, NpcDef, JobDef, BusinessDef, EventDef } from './types';
import { lagos } from './destinations/lagos';
import { lagosIsland } from './destinations/lagosIsland';
import { lekki } from './destinations/lekki';
import { ikeja } from './destinations/ikeja';
import { badagry } from './destinations/badagry';
import { lagosAirport } from './destinations/lagosAirport';
import { lagosStation } from './destinations/lagosStation';

/**
 * Registry of destination packs. Lagos (the home city) is built in; other cities are city packs that
 * load on demand (see `cities.ts`) and register themselves here. Lookups only see registered packs,
 * so anything that needs a city's content makes sure the city is loaded first (`ensureAreas`).
 */
const PACKS: Record<string, DestinationPack> = {
  [lagos.id]: lagos,
  [lagosIsland.id]: lagosIsland,
  [lekki.id]: lekki,
  [ikeja.id]: ikeja,
  [badagry.id]: badagry,
  [lagosAirport.id]: lagosAirport,
  [lagosStation.id]: lagosStation,
};

/** Every registered pack. A live array: city packs are appended when they load. */
export const ALL_PACKS: DestinationPack[] = Object.values(PACKS);

export function registerPacks(packs: DestinationPack[]) {
  for (const p of packs) {
    if (PACKS[p.id]) continue;
    PACKS[p.id] = p;
    ALL_PACKS.push(p);
  }
}

export const isAreaLoaded = (id: string) => !!PACKS[id];

export const DEFAULT_DESTINATION = lagos.id;

export function getDestination(id: string): DestinationPack {
  return PACKS[id] ?? PACKS[DEFAULT_DESTINATION];
}

/** Looks in the given area first, then everywhere (items travel with you in the bag). */
export function findItem(pack: DestinationPack, id: string): ItemDef | undefined {
  return pack.items.find((i) => i.id === id) ?? ALL_PACKS.flatMap((p) => p.items).find((i) => i.id === id);
}

/** Which area a job belongs to. */
export function areaOfJob(jobId: string): DestinationPack | undefined {
  return ALL_PACKS.find((p) => p.jobs.some((j) => j.id === jobId));
}
/** A ticketed show anywhere, and the area it's in. */
export function findEvent(id: string): EventDef | undefined {
  return ALL_PACKS.flatMap((p) => p.events ?? []).find((e) => e.id === id);
}
export function areaOfEvent(id: string): DestinationPack | undefined {
  return ALL_PACKS.find((p) => (p.events ?? []).some((e) => e.id === id));
}

export function findNpc(pack: DestinationPack, id: string): NpcDef | undefined {
  return pack.npcs.find((n) => n.id === id);
}
export function findJob(pack: DestinationPack, id: string): JobDef | undefined {
  return pack.jobs.find((j) => j.id === id);
}
export function findBusiness(pack: DestinationPack, id: string): BusinessDef | undefined {
  return pack.businesses.find((b) => b.id === id);
}

export function formatMoney(pack: DestinationPack, amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}${pack.currency.symbol}${Math.abs(Math.round(amount)).toLocaleString(pack.currency.locale)}`;
}

/** "≈ GH₵12" next to a naira price in places with their own currency; null at home. */
export function localPrice(pack: DestinationPack, amount: number): string | null {
  const lc = pack.localCurrency;
  if (!lc) return null;
  const v = amount / lc.perUnit;
  return `≈ ${lc.symbol}${v >= 10 ? Math.round(v) : v.toFixed(1)}`;
}

export type { DestinationPack };
