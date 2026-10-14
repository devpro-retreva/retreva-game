/**
 * Market bargaining — pure functions.
 *
 * The seller opens at the list price and has a hidden floor (a fraction of the
 * list price plus a little per-session wobble) and a limited patience.
 * Each offer either closes a deal, earns a counter-offer, or — if insulting —
 * burns extra patience. When patience runs out the seller names a final price:
 * take it or leave it. Negotiation changes what you actually pay.
 */

export interface HaggleConfig {
  floor: number;
  patience: number;
}

export type HaggleStatus = 'open' | 'final' | 'deal' | 'walked';

export interface HaggleState {
  itemId: string;
  listPrice: number;
  /** Seller's current asking price. */
  ask: number;
  /** Lowest price the seller will accept. Hidden from the player. */
  floorPrice: number;
  patience: number;
  status: HaggleStatus;
  dealPrice: number | null;
  lastOffer: number | null;
  /** What the seller says, for the UI. */
  mood: 'opening' | 'counter' | 'insulted' | 'final' | 'deal' | 'walked';
}

export const round50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);

export function startHaggle(itemId: string, listPrice: number, cfg: HaggleConfig, rand: () => number = Math.random): HaggleState {
  const wobble = rand() * 0.08;
  const floorPrice = Math.min(listPrice, round50(listPrice * Math.min(0.95, cfg.floor + wobble)));
  return {
    itemId,
    listPrice,
    ask: listPrice,
    floorPrice,
    patience: Math.max(1, cfg.patience),
    status: 'open',
    dealPrice: null,
    lastOffer: null,
    mood: 'opening',
  };
}

export function makeOffer(s: HaggleState, rawOffer: number): HaggleState {
  if (s.status !== 'open') return s;
  const offer = round50(rawOffer);

  // At or near the asking price: done.
  if (offer >= s.ask || offer >= s.ask * 0.97) {
    const price = Math.min(offer, s.ask);
    return { ...s, lastOffer: offer, status: 'deal', dealPrice: price, mood: 'deal' };
  }

  // Insulting: far below what the cloth is worth.
  if (offer < s.listPrice * 0.4) {
    const patience = s.patience - 2;
    if (patience <= 0) return { ...s, lastOffer: offer, patience: 0, status: 'final', mood: 'final' };
    return { ...s, lastOffer: offer, patience, mood: 'insulted' };
  }

  // A fair offer above the floor: seller meets you, sometimes right there.
  if (offer >= s.floorPrice) {
    const counter = round50((s.ask + offer) / 2);
    if (counter - offer <= s.listPrice * 0.05 || s.patience <= 1) {
      return { ...s, lastOffer: offer, status: 'deal', dealPrice: offer, mood: 'deal' };
    }
    return { ...s, lastOffer: offer, ask: counter, patience: s.patience - 1, mood: 'counter' };
  }

  // Below the floor: seller comes down a little, never under the floor.
  const ask = Math.max(s.floorPrice, round50(s.ask - (s.ask - offer) * 0.35));
  const patience = s.patience - 1;
  if (patience <= 0) return { ...s, lastOffer: offer, ask, patience: 0, status: 'final', mood: 'final' };
  return { ...s, lastOffer: offer, ask, patience, mood: 'counter' };
}

/** Accept the seller's current (or final) price. */
export function acceptAsk(s: HaggleState): HaggleState {
  if (s.status !== 'open' && s.status !== 'final') return s;
  return { ...s, status: 'deal', dealPrice: s.ask, mood: 'deal' };
}

export function walkAway(s: HaggleState): HaggleState {
  if (s.status === 'deal') return s;
  return { ...s, status: 'walked', mood: 'walked' };
}

/** Fraction saved against the list price, 0…1. */
export function savings(s: HaggleState): number {
  if (s.dealPrice === null) return 0;
  return Math.max(0, (s.listPrice - s.dealPrice) / s.listPrice);
}
