import type { ItemCategory } from '../content/types';

/**
 * Inventory — pure functions.
 * Stacks are keyed by item + where it was acquired + what was paid, so the
 * bag remembers provenance ("bought in Lagos for ₦1,200") for souvenirs,
 * tickets and travel history later on.
 */

export interface InventoryEntry {
  key: string;
  itemId: string;
  category: ItemCategory;
  quantity: number;
  /** Unit price paid; 0 for gifts or rewards. */
  purchasePrice: number;
  destinationId: string;
  acquiredAt: number;
  owner: 'player';
  metadata?: Record<string, string | number | boolean>;
}

export interface Inventory {
  entries: InventoryEntry[];
}

export interface AddItemInput {
  itemId: string;
  category: ItemCategory;
  quantity: number;
  purchasePrice: number;
  destinationId: string;
  at: number;
  metadata?: InventoryEntry['metadata'];
}

export const emptyInventory = (): Inventory => ({ entries: [] });

const stackKey = (i: { itemId: string; destinationId: string; purchasePrice: number }) =>
  `${i.itemId}@${i.destinationId}#${i.purchasePrice}`;

export function addItem(inv: Inventory, input: AddItemInput): Inventory {
  if (input.quantity <= 0) return inv;
  const key = stackKey(input);
  const existing = inv.entries.find((e) => e.key === key);
  if (existing) {
    return {
      entries: inv.entries.map((e) => (e.key === key ? { ...e, quantity: e.quantity + input.quantity } : e)),
    };
  }
  const entry: InventoryEntry = {
    key,
    itemId: input.itemId,
    category: input.category,
    quantity: input.quantity,
    purchasePrice: input.purchasePrice,
    destinationId: input.destinationId,
    acquiredAt: input.at,
    owner: 'player',
    metadata: input.metadata,
  };
  return { entries: [...inv.entries, entry] };
}

/** Removes from a specific stack. Returns ok=false if not enough. */
export function removeFromStack(inv: Inventory, key: string, quantity = 1): { ok: boolean; inventory: Inventory } {
  const entry = inv.entries.find((e) => e.key === key);
  if (!entry || entry.quantity < quantity || quantity <= 0) return { ok: false, inventory: inv };
  const entries = inv.entries
    .map((e) => (e.key === key ? { ...e, quantity: e.quantity - quantity } : e))
    .filter((e) => e.quantity > 0);
  return { ok: true, inventory: { entries } };
}

export function countItem(inv: Inventory, itemId: string): number {
  return inv.entries.filter((e) => e.itemId === itemId).reduce((n, e) => n + e.quantity, 0);
}

export function totalItems(inv: Inventory): number {
  return inv.entries.reduce((n, e) => n + e.quantity, 0);
}
