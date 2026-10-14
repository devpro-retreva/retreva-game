import type { JobDef } from '../content/types';

/**
 * Jobs — a small state machine, pure functions.
 *
 *   idle ──accept──▶ active ──deliver (in range, in time)──▶ completed → cooldown → idle
 *                      └──── timer runs out ────▶ failed → idle (retry allowed)
 *
 * The timer counts down by game time (dt), so pausing pauses it and a reload
 * resumes from the saved remaining time instead of resetting it.
 */

export interface ActiveJob {
  jobId: string;
  runId: string;
  remainingMs: number;
  acceptedAt: number;
  /** For collect jobs: indices of the spots already picked up. */
  collected?: number[];
}

export interface JobRecord {
  jobId: string;
  runId: string;
  outcome: 'completed' | 'failed';
  at: number;
  elapsedMs: number;
  payout: number;
}

export interface JobsState {
  active: ActiveJob | null;
  /** Wall-clock epoch ms until each job can be accepted again. */
  cooldownUntil: Record<string, number>;
  history: JobRecord[];
}

export const emptyJobs = (): JobsState => ({ active: null, cooldownUntil: {}, history: [] });

/** Delivery must happen within this distance of the drop-off NPC. */
export const DELIVERY_RANGE = 3.2;

export function isAvailable(state: JobsState, job: JobDef, now: number): boolean {
  if (state.active) return false;
  return (state.cooldownUntil[job.id] ?? 0) <= now;
}

export function completedCount(state: JobsState, jobId: string): number {
  return state.history.filter((h) => h.jobId === jobId && h.outcome === 'completed').length;
}

export type AcceptResult = { ok: true; state: JobsState } | { ok: false; state: JobsState; reason: 'busy' | 'cooldown' };

export function acceptJob(state: JobsState, job: JobDef, now: number, runId: string): AcceptResult {
  if (state.active) return { ok: false, state, reason: 'busy' };
  if ((state.cooldownUntil[job.id] ?? 0) > now) return { ok: false, state, reason: 'cooldown' };
  return {
    ok: true,
    state: { ...state, active: { jobId: job.id, runId, remainingMs: job.timeLimitMs, acceptedAt: now, collected: job.kind === 'collect' ? [] : undefined } },
  };
}

/** Distance within which a collect item is picked up by walking over it. */
export const PICKUP_RANGE = 1.1;

/** Picks up one collect spot. Returns null when nothing changed. */
export function collectSpot(state: JobsState, job: JobDef, spotIndex: number): JobsState | null {
  const a = state.active;
  if (!a || a.jobId !== job.id || job.kind !== 'collect' || !job.collect) return null;
  if (spotIndex < 0 || spotIndex >= job.collect.spots.length) return null;
  const got = a.collected ?? [];
  if (got.includes(spotIndex) || got.length >= job.collect.count) return null;
  return { ...state, active: { ...a, collected: [...got, spotIndex] } };
}

export function collectedCount(state: JobsState): number {
  return state.active?.collected?.length ?? 0;
}

/** Advance the job timer. Returns the record if the job just failed. */
export function tickJob(state: JobsState, job: JobDef | undefined, dtMs: number, now: number):
  { state: JobsState; failed: JobRecord | null } {
  const a = state.active;
  if (!a || !job || dtMs <= 0) return { state, failed: null };
  const remainingMs = a.remainingMs - dtMs;
  if (remainingMs > 0) return { state: { ...state, active: { ...a, remainingMs } }, failed: null };
  const failed: JobRecord = { jobId: a.jobId, runId: a.runId, outcome: 'failed', at: now, elapsedMs: job.timeLimitMs, payout: 0 };
  return { state: { ...state, active: null, history: [...state.history, failed] }, failed };
}

export interface Payout {
  txId: string;
  base: number;
  bonus: number;
  total: number;
  elapsedMs: number;
}

export type DeliverResult =
  | { ok: true; state: JobsState; payout: Payout }
  | { ok: false; state: JobsState; reason: 'no-job' | 'wrong-job' | 'expired' | 'too-far' | 'already-paid' | 'incomplete' };

export function deliverJob(
  state: JobsState,
  job: JobDef,
  ctx: { now: number; distanceToDropoff: number },
): DeliverResult {
  const a = state.active;
  if (!a) return { ok: false, state, reason: 'no-job' };
  if (a.jobId !== job.id) return { ok: false, state, reason: 'wrong-job' };
  if (a.remainingMs <= 0) return { ok: false, state, reason: 'expired' };
  if (ctx.distanceToDropoff > DELIVERY_RANGE) return { ok: false, state, reason: 'too-far' };
  if (state.history.some((h) => h.runId === a.runId)) return { ok: false, state, reason: 'already-paid' };
  if (job.kind === 'collect' && (a.collected?.length ?? 0) < (job.collect?.count ?? 0)) return { ok: false, state, reason: 'incomplete' };

  const elapsedMs = job.timeLimitMs - a.remainingMs;
  const bonus = elapsedMs <= job.bonus.underMs ? job.bonus.amount : 0;
  const payout: Payout = { txId: `job:${job.id}:${a.runId}`, base: job.reward, bonus, total: job.reward + bonus, elapsedMs };
  const record: JobRecord = { jobId: job.id, runId: a.runId, outcome: 'completed', at: ctx.now, elapsedMs, payout: payout.total };

  return {
    ok: true,
    payout,
    state: {
      active: null,
      cooldownUntil: { ...state.cooldownUntil, [job.id]: ctx.now + job.cooldownMs },
      history: [...state.history, record].slice(-50),
    },
  };
}
