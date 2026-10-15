import type { DestinationPack, ItemDef, NpcDef, JobDef, BusinessDef } from './types';
import { lagos } from './destinations/lagos';
import { lagosIsland } from './destinations/lagosIsland';
import { lekki } from './destinations/lekki';
import { ikeja } from './destinations/ikeja';
import { lagosAirport } from './destinations/lagosAirport';
import { accra } from './destinations/accra';
import { accraAirport } from './destinations/accraAirport';

/** Registry of destination packs. Future packs (Accra, Dubai…) register here. */
const PACKS: Record<string, DestinationPack> = {
  [lagos.id]: lagos,
  [lagosIsland.id]: lagosIsland,
  [lekki.id]: lekki,
  [ikeja.id]: ikeja,
  [lagosAirport.id]: lagosAirport,
  [accra.id]: accra,
  [accraAirport.id]: accraAirport,
};

export const ALL_PACKS: DestinationPack[] = Object.values(PACKS);

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
