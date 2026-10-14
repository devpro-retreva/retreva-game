import type { Inventory } from './inventory';
import type { JobsState } from './jobs';

/**
 * Goals, tips and phone messages.
 * Goals are checked against a snapshot of progress; each pays once through
 * the wallet ledger (transaction id `goal:<id>`).
 */

export interface ProgressSnapshot {
  jobs: JobsState;
  /** jobId → area id, for "jobs in different areas". */
  jobArea: (jobId: string) => string | undefined;
  visited: string[];
  discovered: string[];
  inventory: Inventory;
  bestBargain: number; // fraction saved, 0…1
  rides: number;
  totalAreas: number;
}

export interface GoalDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  /** Returns progress as [current, target]. */
  progress: (p: ProgressSnapshot) => [number, number];
}

const completed = (p: ProgressSnapshot) => p.jobs.history.filter((h) => h.outcome === 'completed');

export const GOALS: GoalDef[] = [
  { id: 'first-job', title: 'First naira', description: 'Complete your first job.', reward: 300,
    progress: (p) => [Math.min(1, completed(p).length), 1] },
  { id: 'first-ride', title: 'One chance!', description: 'Take a danfo to another part of Lagos.', reward: 200,
    progress: (p) => [Math.min(1, p.rides), 1] },
  { id: 'bargain', title: 'Sharp bargainer', description: 'Win at least 15% off in a bargain.', reward: 500,
    progress: (p) => [p.bestBargain >= 0.15 ? 1 : 0, 1] },
  { id: 'beach-clean', title: 'Beach guardian', description: 'Finish a beach clean-up in Lekki.', reward: 600,
    progress: (p) => [Math.min(1, completed(p).filter((h) => h.jobId === 'beach-cleanup').length), 1] },
  { id: 'landmarks-5', title: 'Sightseer', description: 'Discover 5 landmarks.', reward: 800,
    progress: (p) => [Math.min(5, p.discovered.length), 5] },
  { id: 'souvenirs-3', title: 'Souvenir hunter', description: 'Own 3 souvenirs or pieces of clothing.', reward: 500,
    progress: (p) => [Math.min(3, p.inventory.entries.filter((e) => e.category === 'souvenir' || e.category === 'clothing').reduce((n, e) => n + e.quantity, 0)), 3] },
  { id: 'hustler', title: 'Lagos hustler', description: 'Complete jobs in 3 different areas.', reward: 1000,
    progress: (p) => [Math.min(3, new Set(completed(p).map((h) => p.jobArea(h.jobId)).filter(Boolean)).size), 3] },
  { id: 'explorer', title: 'Lagos explorer', description: 'Visit every area of Lagos.', reward: 1500,
    progress: (p) => [Math.min(p.totalAreas, p.visited.length), p.totalAreas] },
];

/** Goals newly completed in this snapshot that are not yet marked done. */
export function newlyCompleted(p: ProgressSnapshot, done: string[]): GoalDef[] {
  return GOALS.filter((g) => {
    if (done.includes(g.id)) return false;
    const [cur, target] = g.progress(p);
    return cur >= target;
  });
}

// ── tips ────────────────────────────────────────────────────────────────

export interface TipDef {
  id: string;
  title: string;
  text: string;
}

export const TIPS: Record<string, TipDef> = {
  welcome: { id: 'welcome', title: 'Welcome to Lagos', text: 'A yellow diamond floats over anyone with work for you. Walk up to Mama Titi and talk to her to earn your first naira.' },
  'job-started': { id: 'job-started', title: 'Beat the clock', text: 'The timer is top-left. Follow the yellow ring on your minimap — deliver early for a speed bonus.' },
  'first-money': { id: 'first-money', title: 'You got paid', text: 'Open your phone to see your Wallet, Bag and Goals. Goals pay extra naira when you finish them.' },
  travel: { id: 'travel', title: 'See more of Lagos', text: 'Danfo conductors at the bus stop can take you to Lagos Island, Lekki and Ikeja. In Yaba, talk to Kunle by the yellow bus.' },
  'new-area': { id: 'new-area', title: 'A new part of town', text: 'Every area has its own people, prices and work. Walk around to discover landmarks — they count toward your goals.' },
  haggle: { id: 'haggle', title: 'Price na talk', text: 'Offer less than the asking price. A fair offer gets a counter; an insulting one burns the seller’s patience. Run out, and you get a final price.' },
  collect: { id: 'collect', title: 'Clean-up', text: 'Walk over the glowing bottles to pick them up. Collect six, then report back to Tolu before the timer ends.' },
  message: { id: 'message', title: 'New text', text: 'People you meet send messages. Open the Messages app on your phone to read them.' },
  discover: { id: 'discover', title: 'Landmark found', text: 'Discoveries are saved in your Map app. Find five for the Sightseer goal.' },
  'low-money': { id: 'low-money', title: 'Running low', text: 'Short on cash? Every area has a job — look for the yellow diamond.' },
};

// ── messages ────────────────────────────────────────────────────────────

export interface PhoneMessage {
  id: string;
  from: string;
  text: string;
  at: number;
  read: boolean;
}
