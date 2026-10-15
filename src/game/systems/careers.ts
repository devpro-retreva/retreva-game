/** Career progression for running errands: deliveries and collections done build a courier rank that pays more. */
import type { JobsState } from './jobs';

export const COURIER_RANKS = [
  { name: 'Rookie runner', from: 0, bonus: 0 },
  { name: 'Regular', from: 5, bonus: 0.1 },
  { name: 'Pro courier', from: 15, bonus: 0.2 },
] as const;

export function courierRuns(jobs: JobsState, isCourierJob: (jobId: string) => boolean): number {
  return jobs.history.filter((h) => h.outcome === 'completed' && isCourierJob(h.jobId)).length;
}

export function courierRank(runs: number) {
  let r: (typeof COURIER_RANKS)[number] = COURIER_RANKS[0];
  for (const x of COURIER_RANKS) if (runs >= x.from) r = x;
  const next = COURIER_RANKS.find((x) => x.from > runs);
  return { ...r, runs, next: next ? { name: next.name, at: next.from } : null };
}

/** Extra pay for a courier's rank, rounded to ₦50. */
export function rankBonus(base: number, runs: number): number {
  return Math.round((base * courierRank(runs).bonus) / 50) * 50;
}
