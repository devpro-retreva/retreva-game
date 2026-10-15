import { emptyLife, type LifeState } from '../systems/life';
import { emptyTravel, type Ticket, type TravelState } from '../systems/travel';
import { findFlight } from '../content/flights';
import { SAVE_SCHEMA_VERSION, emptyWorld, type SaveAdapter, type SaveData } from './types';
import { sanitizeLook, upgradeAvatarV1 } from '../core/avatarPresets';

export const MAIN_SLOT = 'main';

/** Validates and upgrades a loaded document. Returns null if it is unusable. */
export function migrate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as Partial<SaveData>;
  if (typeof d.schemaVersion !== 'number' || d.schemaVersion > SAVE_SCHEMA_VERSION) return null;
  if (!d.profile || !d.wallet || !d.inventory || !d.jobs) return null;
  if (typeof d.wallet.balance !== 'number' || !Array.isArray(d.wallet.ledger)) return null;
  // v1 → v2: avatars gained gender, hair, facial hair, outfit style and accessory.
  // Every save also passes through sanitizeLook so bad values can't reach the renderer.
  const avatar = d.schemaVersion < 2
    ? upgradeAvatarV1(d.profile.avatar as unknown as Record<string, unknown>)
    : sanitizeLook(d.profile.avatar ?? {});
  // v2 → v3: exploration progress (areas, landmarks, goals, tips, messages).
  const w = (d.world ?? {}) as Partial<SaveData['world']>;
  const home = d.destinationId ?? 'lagos-adeniyi';
  const base = emptyWorld(home);
  const world: SaveData['world'] = {
    visited: Array.isArray(w.visited) && w.visited.length ? w.visited : base.visited,
    discovered: Array.isArray(w.discovered) ? w.discovered : [],
    goalsDone: Array.isArray(w.goalsDone) ? w.goalsDone : [],
    seenTips: Array.isArray(w.seenTips) ? w.seenTips : [],
    messages: Array.isArray(w.messages) ? w.messages.slice(-60) : [],
    bestBargain: typeof w.bestBargain === 'number' ? w.bestBargain : 0,
    rides: typeof w.rides === 'number' ? w.rides : 0,
  };
  // v3 → v4: daily life (needs, skills, regard, rented home). Older saves start rested and fed.
  const l = (d.life ?? {}) as Partial<LifeState>;
  const base4 = emptyLife();
  const num = (v: unknown, dflt: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : dflt);
  const life: LifeState = {
    needs: { energy: num(l.needs?.energy, base4.needs.energy), fullness: num(l.needs?.fullness, base4.needs.fullness) },
    skills: l.skills && typeof l.skills === 'object' ? { ...l.skills } : {},
    regard: l.regard && typeof l.regard === 'object' ? { ...l.regard } : {},
    // v4 → v5: one rented home became a list (a room in Lagos and a guesthouse in Accra can both be yours)
    homes: Array.isArray(l.homes)
      ? l.homes.filter((h): h is string => typeof h === 'string')
      : typeof (l as { home?: unknown }).home === 'string' ? [(l as { home: string }).home] : [],
    shiftsDone: typeof l.shiftsDone === 'number' ? l.shiftsDone : 0,
  };
  // v4 → v5: flights. Drop a ticket that names an unknown route rather than crash on it.
  const t = (d.travel ?? {}) as Partial<TravelState>;
  const rawTicket = t.ticket as Partial<Ticket> | null | undefined;
  const ticket: Ticket | null =
    rawTicket && typeof rawTicket.id === 'string' && typeof rawTicket.routeId === 'string' && findFlight(rawTicket.routeId)
      ? {
          id: rawTicket.id,
          routeId: rawTicket.routeId,
          stage: rawTicket.stage === 'checked-in' || rawTicket.stage === 'cleared' ? rawTicket.stage : 'booked',
          paid: typeof rawTicket.paid === 'number' ? rawTicket.paid : 0,
          roundTrip: rawTicket.roundTrip === true,
          bookedAt: typeof rawTicket.bookedAt === 'number' ? rawTicket.bookedAt : 0,
        }
      : null;
  const travel: TravelState = {
    ...emptyTravel(),
    ticket,
    history: Array.isArray(t.history) ? t.history.filter((h) => h && typeof h.routeId === 'string' && typeof h.ticketId === 'string') : [],
  };
  return { ...(d as SaveData), schemaVersion: SAVE_SCHEMA_VERSION, profile: { ...d.profile, avatar }, world, life, travel };
}

export function getDeviceId(): string {
  try {
    const k = 'retriever:device';
    let id = localStorage.getItem(k);
    if (!id) {
      id = `dev-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    return 'dev-unknown';
  }
}

/**
 * Serialises writes so they never race, and keeps a monotonically
 * increasing revision on every document it writes.
 */
export class SaveManager {
  private chain: Promise<unknown> = Promise.resolve();
  private revision = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  lastSavedAt = 0;
  lastError: string | null = null;

  constructor(
    private adapter: SaveAdapter,
    private snapshot: () => Omit<SaveData, 'revision' | 'updatedAt' | 'schemaVersion' | 'deviceId'> | null,
    private deviceId = 'dev-unknown',
    private slot = MAIN_SLOT,
  ) {}

  get adapterId() {
    return this.adapter.id;
  }

  async load(): Promise<SaveData | null> {
    try {
      const data = migrate(await this.adapter.load(this.slot));
      if (data) this.revision = data.revision;
      return data;
    } catch (e) {
      this.lastError = String(e);
      return null;
    }
  }

  /** Debounced save for frequent, low-stakes changes. */
  schedule(delayMs = 800) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.saveNow(), delayMs);
  }

  /** Immediate save for money, purchases and job outcomes. */
  saveNow(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const run = this.chain.then(async () => {
      const snap = this.snapshot();
      if (!snap) return;
      const doc: SaveData = {
        ...snap,
        schemaVersion: SAVE_SCHEMA_VERSION,
        revision: this.revision + 1,
        updatedAt: Date.now(),
        deviceId: this.deviceId,
      };
      try {
        await this.adapter.save(this.slot, doc);
        this.revision = doc.revision;
        this.lastSavedAt = doc.updatedAt;
        this.lastError = null;
      } catch (e) {
        this.lastError = String(e);
      }
    });
    this.chain = run;
    return run;
  }

  async wipe(): Promise<void> {
    await this.chain;
    await this.adapter.remove(this.slot);
    this.revision = 0;
  }
}
