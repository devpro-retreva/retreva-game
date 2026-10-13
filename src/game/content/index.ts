import type { DestinationPack, ItemDef, NpcDef, JobDef, BusinessDef } from './types';
import { lagos } from './destinations/lagos';

/** Registry of destination packs. Future packs (Accra, Dubai…) register here. */
const PACKS: Record<string, DestinationPack> = {
  [lagos.id]: lagos,
};

export const DEFAULT_DESTINATION = lagos.id;

export function getDestination(id: string): DestinationPack {
  return PACKS[id] ?? PACKS[DEFAULT_DESTINATION];
}

export function findItem(pack: DestinationPack, id: string): ItemDef | undefined {
  return pack.items.find((i) => i.id === id);
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

export type { DestinationPack };
