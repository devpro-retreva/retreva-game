/**
 * Game time. One continuous counter, `world.time`, in game minutes since the start of day 1 at midnight.
 * A game hour passes in two real minutes (a full day is 48 real minutes). Pure functions only.
 */
export const START_TIME = 8 * 60; // new lives begin at 08:00 on day 1
export const GAME_MIN_PER_REAL_MS = 1 / 2000; // 30 game minutes per real minute

export function advance(time: number, realMs: number): number {
  return time + realMs * GAME_MIN_PER_REAL_MS;
}

export function minuteOfDay(time: number): number {
  return ((time % 1440) + 1440) % 1440;
}
export function hourOf(time: number): number {
  return minuteOfDay(time) / 60;
}
export function dayOf(time: number): number {
  return Math.floor(time / 1440) + 1;
}

export function formatClock(time: number): string {
  const m = Math.floor(minuteOfDay(time));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export type DayPhase = 'night' | 'dawn' | 'day' | 'dusk';
export function phaseOf(time: number): DayPhase {
  const h = hourOf(time);
  if (h < 5.5 || h >= 20) return 'night';
  if (h < 7) return 'dawn';
  if (h < 18) return 'day';
  return 'dusk';
}

/** 0 at night, 1 in full daylight, easing through dawn (5:30–7:30) and dusk (18:00–20:00). */
export function daylight(time: number): number {
  const h = hourOf(time);
  const ease = (x: number) => x * x * (3 - 2 * x);
  if (h < 5.5 || h >= 20) return 0;
  if (h < 7.5) return ease((h - 5.5) / 2);
  if (h < 18) return 1;
  return ease(1 - (h - 18) / 2);
}

/** Is a place with these opening hours open now? `[open, close]` in hours; close may pass midnight. */
export function isOpen(hours: [number, number] | undefined, time: number): boolean {
  if (!hours) return true;
  const [o, c] = hours;
  const h = hourOf(time);
  return o <= c ? h >= o && h < c : h >= o || h < c;
}

/** The time after sleeping in a bed: the next 07:00 if it's evening or night, otherwise a 2-hour nap. */
export function afterSleep(time: number): number {
  const h = hourOf(time);
  if (h >= 19 || h < 5) {
    const dayStart = time - minuteOfDay(time);
    return (h >= 19 ? dayStart + 1440 : dayStart) + 7 * 60;
  }
  return time + 120;
}

/** "Opens at 07:00" style label. */
export function opensAt(hours: [number, number]): string {
  return `${String(Math.floor(hours[0])).padStart(2, '0')}:${String(Math.round((hours[0] % 1) * 60)).padStart(2, '0')}`;
}
