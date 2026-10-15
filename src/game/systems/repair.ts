/**
 * Repair bench work (e.g. phone repairs in Computer Village): each device needs its repair steps done in the
 * right order before its timer runs out. A different skill from cooking — sequencing, not matching.
 * Pure functions; the store runs the session and pays through the wallet ledger (`repair:<id>:<runId>`).
 */
import type { Requirement } from '../content/types';

export interface RepairDef {
  id: string;
  title: string;
  npcId: string;
  skill: string;
  /** Kinds of job that come in, each with its correct order of steps. */
  devices: { name: string; fault: string; steps: string[] }[];
  /** Devices per session. */
  perSession: number;
  /** Seconds per device at level 1, plus `perLevel` per level. */
  seconds: number;
  perLevel: number;
  payPerDevice: number;
  perfectTip: number;
  energyCost: number;
  minEnergy: number;
  requires?: Requirement;
}

export interface DeviceResult {
  mistakes: number;
  done: boolean;
}

const rng = (seed: number) => {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
};

/** Which devices come in this session (deterministic per seed). */
export function repairQueue(def: RepairDef, seed: number): number[] {
  const r = rng(seed);
  return Array.from({ length: def.perSession }, () => Math.floor(r() * def.devices.length));
}

/** The step buttons for a device, shuffled so the order isn't given away (never already in order). */
export function shuffledSteps(steps: string[], seed: number): string[] {
  const r = rng(seed + 7);
  const out = [...steps];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.every((x, i) => x === steps[i]) && out.length > 1) [out[0], out[1]] = [out[1], out[0]];
  return out;
}

/** Tapping a step: correct moves on; wrong counts a mistake (and doesn't advance). */
export function tapStep(steps: string[], progress: number, step: string): { progress: number; correct: boolean } {
  return steps[progress] === step ? { progress: progress + 1, correct: true } : { progress, correct: false };
}

export function repairSeconds(def: RepairDef, level: number): number {
  return def.seconds + (level - 1) * def.perLevel;
}

/**
 * A device counts as fixed if it was finished in time with at most one mistake. Pay grows 15% per skill
 * level; a clean session (every device fixed with no mistakes) earns the tip.
 */
export function scoreRepair(def: RepairDef, results: DeviceResult[], level: number) {
  const fixed = results.filter((r) => r.done && r.mistakes <= 1).length;
  const clean = results.length === def.perSession && results.every((r) => r.done && r.mistakes === 0);
  const pay = fixed * Math.round(def.payPerDevice * (1 + 0.15 * (level - 1)));
  return { fixed, pay, tip: clean ? def.perfectTip : 0, xp: fixed * 15 + (clean ? 25 : 0), regard: clean ? 6 : fixed > 0 ? 3 : 1 };
}
