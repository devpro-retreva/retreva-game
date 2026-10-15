/**
 * Homes in detail: placing furniture in slots, the storage chest, comfort, and buying or selling a home.
 * Pure functions; the store moves money through the wallet ledger (`buyhome:<id>`, `sellhome:<id>:<n>`).
 */
import { comfortOf, findFurniture, type InteriorDef } from '../content/interiors';
import type { InventoryEntry } from './inventory';
import type { Property } from './life';

export const emptyProperty = (tenure: Property['tenure'], paid: number): Property => ({ tenure, paid, placed: {}, storage: [] });

/** Can this furniture go in this slot? */
export function fits(interior: InteriorDef, slotId: string, itemId: string): boolean {
  const slot = interior.slots.find((s) => s.id === slotId);
  const f = findFurniture(itemId);
  return !!slot && !!f && slot.accepts.includes(f.category);
}

/** Place a piece (returns what was there before, which goes back to the bag). */
export function place(p: Property, slotId: string, itemId: string): { property: Property; replaced: string | null } {
  const replaced = p.placed[slotId] ?? null;
  return { property: { ...p, placed: { ...p.placed, [slotId]: itemId } }, replaced };
}

export function unplace(p: Property, slotId: string): { property: Property; removed: string | null } {
  const removed = p.placed[slotId] ?? null;
  if (!removed) return { property: p, removed: null };
  const placed = { ...p.placed };
  delete placed[slotId];
  return { property: { ...p, placed }, removed };
}

export const comfort = (p: Property | undefined) => (p ? comfortOf(p.placed) : 0);

type Stored = Property['storage'][number];
const sameStack = (a: Stored, e: Pick<InventoryEntry, 'itemId' | 'destinationId' | 'purchasePrice'>) =>
  a.itemId === e.itemId && a.destinationId === e.destinationId && a.purchasePrice === e.purchasePrice;

/** Put one of a bag stack into the chest (provenance kept, so selling later still knows what you paid). */
export function store(p: Property, e: Pick<InventoryEntry, 'itemId' | 'category' | 'destinationId' | 'purchasePrice'>, qty = 1): Property {
  const hit = p.storage.find((s) => sameStack(s, e));
  const storage = hit
    ? p.storage.map((s) => (s === hit ? { ...s, quantity: s.quantity + qty } : s))
    : [...p.storage, { itemId: e.itemId, category: e.category, quantity: qty, purchasePrice: e.purchasePrice, destinationId: e.destinationId }];
  return { ...p, storage };
}

/** Take one out of the chest; returns null if it isn't there. */
export function take(p: Property, index: number, qty = 1): { property: Property; item: Stored } | null {
  const s = p.storage[index];
  if (!s || s.quantity < qty) return null;
  const storage = s.quantity === qty ? p.storage.filter((_, i) => i !== index) : p.storage.map((x, i) => (i === index ? { ...x, quantity: x.quantity - qty } : x));
  return { property: { ...p, storage }, item: { ...s, quantity: qty } };
}

/** An owned home sells for 85% of what you paid, rounded down to ₦500. */
export function homeValuation(p: Property): number {
  return p.tenure === 'own' ? Math.floor((p.paid * 0.85) / 500) * 500 : 0;
}

/** Everything that comes back to you when you leave a home: placed furniture and stored items. */
export function belongings(p: Property): { furniture: string[]; stored: Stored[] } {
  return { furniture: Object.values(p.placed), stored: p.storage };
}
