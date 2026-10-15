/** Requirements for work: checked against the player's state, with a plain-language list of what's missing. */
import type { Requirement } from '../content/types';
import { completedCount, type JobsState } from './jobs';
import { regardTier, skillLevel } from './life';

export interface RequirementContext {
  regard: Record<string, number>;
  jobs: JobsState;
  discovered: string[];
  skills: Record<string, number>;
  /** Display names for NPCs, jobs and landmarks. */
  name: (id: string) => string;
}

export function meets(req: Requirement | undefined, c: RequirementContext): { ok: boolean; missing: string[] } {
  if (!req) return { ok: true, missing: [] };
  const missing: string[] = [];
  if (req.regard && (c.regard[req.regard.npcId] ?? 0) < req.regard.min)
    missing.push(`Be at least ${regardTier(req.regard.min)} with ${c.name(req.regard.npcId)}`);
  if (req.jobsDone && completedCount(c.jobs, req.jobsDone.jobId) < req.jobsDone.count)
    missing.push(`Finish ${c.name(req.jobsDone.jobId)}${req.jobsDone.count > 1 ? ` ${req.jobsDone.count} times` : ''}`);
  const notFound = (req.discovered ?? []).filter((id) => !c.discovered.includes(id));
  if (notFound.length) missing.push(`Discover ${notFound.map(c.name).join(', ')}`);
  if (req.skill && skillLevel(c.skills[req.skill.skill]) < req.skill.level) missing.push(`Reach ${req.skill.skill} level ${req.skill.level}`);
  return { ok: missing.length === 0, missing };
}
