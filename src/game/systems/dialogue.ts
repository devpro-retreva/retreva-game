import type { DialogueCondition, DialogueDef } from '../content/types';

export interface DialogueContext {
  jobAvailable(jobId: string): boolean;
  jobActive(jobId: string): boolean;
  isDropoff(jobId: string): boolean;
  jobCompletedBefore(jobId: string): boolean;
  /** Ticket stage relative to the airport you're at. */
  tripStage(): 'none' | 'booked' | 'checked-in' | 'cleared' | 'elsewhere';
  carryingLiquids(): boolean;
}

export function checkCondition(c: DialogueCondition, ctx: DialogueContext): boolean {
  switch (c.kind) {
    case 'jobAvailable': return ctx.jobAvailable(c.jobId);
    case 'jobActive': return ctx.jobActive(c.jobId);
    case 'isDropoff': return ctx.isDropoff(c.jobId);
    case 'jobCompletedBefore': return ctx.jobCompletedBefore(c.jobId);
    case 'trip': return ctx.tripStage() === c.stage;
    case 'carryingLiquids': return ctx.carryingLiquids();
  }
}

/** Picks the opening node for an NPC given the current game state. */
export function resolveEntry(def: DialogueDef, ctx: DialogueContext): string {
  for (const e of def.entries) {
    if (!e.when || checkCondition(e.when, ctx)) return e.node;
  }
  return Object.keys(def.nodes)[0];
}
