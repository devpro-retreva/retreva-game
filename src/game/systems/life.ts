import type { SocialRecord } from './social';
import type { OwnedVehicle } from './vehicles';
/**
 * Daily-life rules: needs, skills, regard (relationships), kitchen-shift scoring and resale.
 * Pure functions only — the store applies them; tests exercise them directly.
 */

export interface Needs {
  /** 0 exhausted … 100 fully rested */
  energy: number;
  /** 0 starving … 100 full */
  fullness: number;
}

export interface LifeState {
  needs: Needs;
  /** Skill experience points, keyed by skill id (e.g. 'cooking'). */
  skills: Record<string, number>;
  /** How much each named character likes you, 0–100, keyed by NPC id. */
  regard: Record<string, number>;
  /** Homes the player rents (one per city at most is typical), by home id. */
  homes: string[];
  shiftsDone: number;
  /** Chats and gifts per person (v6). */
  social: Record<string, SocialRecord>;
  /** Vehicles you own and where they're parked (v6). */
  vehicles: OwnedVehicle[];
  /** The vehicle you're riding right now, by uid (v6). */
  riding: string | null;
}

export const emptyLife = (): LifeState => ({
  needs: { energy: 85, fullness: 75 },
  skills: {},
  regard: {},
  homes: [],
  shiftsDone: 0,
  social: {},
  vehicles: [],
  riding: null,
});

const clamp = (v: number) => Math.max(0, Math.min(100, v));

export type Activity = 'idle' | 'walk' | 'run' | 'ride';

/** Per real minute of play. Gentle: a full tank lasts roughly an hour of mixed play. */
export const DRAIN = { energy: { idle: 0.6, walk: 1.1, run: 2.2, ride: 0.7 }, fullness: 1.0 } as const;

export const LOW = 15;

/** Needs fall with time and effort; an empty stomach makes you tire twice as fast. */
export function drainNeeds(n: Needs, dtMs: number, activity: Activity): Needs {
  const min = dtMs / 60000;
  const hungry = n.fullness <= 0;
  return {
    energy: clamp(n.energy - DRAIN.energy[activity] * min * (hungry ? 2 : 1)),
    fullness: clamp(n.fullness - DRAIN.fullness * min),
  };
}

export const eat = (n: Needs, nutrition: number): Needs => ({ ...n, fullness: clamp(n.fullness + nutrition) });
export const rest = (n: Needs, to: number): Needs => ({ ...n, energy: Math.max(n.energy, clamp(to)) });
export const spend = (n: Needs, energy: number): Needs => ({ ...n, energy: clamp(n.energy - energy) });

/** Exhausted players can still walk everywhere — they just can't run. */
export const canRun = (n: Needs) => n.energy >= LOW;

export function needLabel(kind: keyof Needs, v: number): string {
  if (kind === 'energy') return v < LOW ? 'Exhausted' : v < 40 ? 'Tired' : v < 75 ? 'OK' : 'Rested';
  return v < LOW ? 'Starving' : v < 40 ? 'Hungry' : v < 75 ? 'Fine' : 'Full';
}

// ── skills ───────────────────────────────────────────────────────────────────

/** XP needed to reach each level (index = level − 1). */
export const LEVELS = [0, 80, 200, 380, 620];

export function skillLevel(xp = 0): number {
  let lvl = 1;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i]) lvl = i + 1;
  return lvl;
}

/** Progress within the current level, 0–1 (1 at max level). */
export function levelProgress(xp = 0): number {
  const lvl = skillLevel(xp);
  if (lvl >= LEVELS.length) return 1;
  const lo = LEVELS[lvl - 1];
  return (xp - lo) / (LEVELS[lvl] - lo);
}

// ── regard ───────────────────────────────────────────────────────────────────

export function regardTier(v = 0): string {
  return v >= 60 ? 'Close friend' : v >= 30 ? 'Friend' : v >= 10 ? 'Acquaintance' : 'Stranger';
}
export const addRegard = (r: Record<string, number>, npcId: string, amount: number) => ({ ...r, [npcId]: clamp((r[npcId] ?? 0) + amount) });

// ── kitchen shift ────────────────────────────────────────────────────────────

export interface ShiftDef {
  id: string;
  title: string;
  npcId: string;
  skill: string;
  /** Dishes on the menu; each order asks for one of them. */
  dishes: { id: string; name: string; icon: string }[];
  orders: number;
  /** Seconds per order at level 1; each level adds `perLevel` seconds. */
  seconds: number;
  perLevel: number;
  payPerOrder: number;
  /** Extra pay for a perfect shift. */
  perfectTip: number;
  energyCost: number;
  minEnergy: number;
  /** Fullness from the staff meal at the end of any shift. */
  staffMeal: number;
}

export type OrderResult = 'served' | 'wrong' | 'missed';

/** Deterministic order list for a run, so a shift can be replayed and tested. */
export function shiftOrders(def: ShiftDef, seed: number): string[] {
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const out: string[] = [];
  for (let i = 0; i < def.orders; i++) {
    let pick = def.dishes[Math.floor(rnd() * def.dishes.length)].id;
    if (i > 0 && pick === out[i - 1] && rnd() < 0.6) pick = def.dishes[(def.dishes.findIndex((d) => d.id === pick) + 1) % def.dishes.length].id;
    out.push(pick);
  }
  return out;
}

export const orderSeconds = (def: ShiftDef, level: number) => def.seconds + (level - 1) * def.perLevel;

export interface ShiftOutcome {
  served: number;
  pay: number;
  tip: number;
  xp: number;
  regard: number;
}

/** Skill raises the pay per order by 15% a level; a perfect shift earns a tip. */
export function scoreShift(def: ShiftDef, results: OrderResult[], level: number): ShiftOutcome {
  const served = results.filter((r) => r === 'served').length;
  const perOrder = Math.round(def.payPerOrder * (1 + 0.15 * (level - 1)));
  const perfect = served === def.orders;
  const tip = perfect ? def.perfectTip : 0;
  return {
    served,
    pay: served * perOrder,
    tip,
    xp: served * 10 + (perfect ? 20 : 0),
    regard: served >= def.orders * 0.75 ? 6 : served >= def.orders * 0.5 ? 3 : 1,
  };
}

// ── resale ───────────────────────────────────────────────────────────────────

/** Shops buy back used goods at half what you paid, rounded down to ₦50. Food and drink can't be resold. */
export function resaleValue(purchasePrice: number, category: string): number {
  if (category === 'food' || category === 'drink') return 0;
  return Math.floor((purchasePrice * 0.5) / 50) * 50;
}
