import { emptyLife, type LifeState } from '../systems/life';
import { emptyTravel, type Ticket, type TravelState } from '../systems/travel';
import { findFlight } from '../content/flights';
import { findVehicle } from '../content/vehicles';
import { SAVE_SCHEMA_VERSION, emptyWorld, type SaveAdapter, type SaveData } from './types';
import { sanitizeLook, upgradeAvatarV1 } from '../core/avatarPresets';

export const MAIN_SLOT = 'main';
/** A rolling copy of a known-good save (written at most once a minute). */
export const BACKUP_SLOT = 'backup';
/** Where an unreadable save is kept untouched, so a new game never silently erases it. */
export const QUARANTINE_SLOT = 'unreadable';
const BACKUP_EVERY_MS = 60_000;

/** What happened on the last load, for the title screen. */
export type LoadNotice =
  | { kind: 'restored-backup'; savedAt: number }
  | { kind: 'unreadable-kept' }
  | null;

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
    // v5 → v6: social records, owned vehicles, riding. Vehicles naming an unknown model are dropped.
    social: l.social && typeof l.social === 'object' ? { ...l.social } : {},
    vehicles: Array.isArray(l.vehicles)
      ? l.vehicles.filter((v) => v && typeof v.uid === 'string' && typeof v.paid === 'number' && !!findVehicle(v.vehicleId))
      : [],
    riding: null,
  };
  // riding is only kept if that vehicle still exists
  if (typeof l.riding === 'string' && life.vehicles.some((v) => v.uid === l.riding)) life.riding = l.riding;
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
  lastBackupAt = 0;
  notice: LoadNotice = null;

  constructor(
    private adapter: SaveAdapter,
    private snapshot: () => Omit<SaveData, 'revision' | 'updatedAt' | 'schemaVersion' | 'deviceId'> | null,
    private deviceId = 'dev-unknown',
    private slot = MAIN_SLOT,
  ) {}

  get adapterId() {
    return this.adapter.id;
  }

  /**
   * Loads the main save. If it exists but can't be read (corrupt, or from a newer version of the game),
   * it is copied aside untouched and the backup is used instead — progress is never silently erased.
   */
  async load(): Promise<SaveData | null> {
    this.notice = null;
    let raw: unknown = null;
    let readFailed = false;
    try {
      raw = await this.adapter.load(this.slot);
    } catch (e) {
      this.lastError = String(e);
      readFailed = true;
    }
    const data = migrate(raw);
    if (data) {
      this.revision = data.revision;
      return data;
    }
    if (!raw && !readFailed) return null; // a fresh start: nothing saved yet
    if (raw) {
      try {
        if (!(await this.adapter.load(QUARANTINE_SLOT))) await this.adapter.save(QUARANTINE_SLOT, raw as SaveData);
      } catch {
        /* keeping the copy is best effort; the original is still in the main slot */
      }
    }
    try {
      const backup = migrate(await this.adapter.load(BACKUP_SLOT));
      if (backup) {
        this.revision = Math.max(backup.revision, typeof (raw as SaveData | null)?.revision === 'number' ? (raw as SaveData).revision : 0);
        this.notice = { kind: 'restored-backup', savedAt: backup.updatedAt };
        return backup;
      }
    } catch {
      /* no usable backup */
    }
    this.notice = { kind: 'unreadable-kept' };
    // keep revisions moving forward so a later save sorts after the unreadable one
    if (typeof (raw as SaveData | null)?.revision === 'number') this.revision = (raw as SaveData).revision;
    return null;
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
        if (doc.updatedAt - this.lastBackupAt >= BACKUP_EVERY_MS) {
          await this.adapter.save(BACKUP_SLOT, doc);
          this.lastBackupAt = doc.updatedAt;
        }
      } catch (e) {
        this.lastError = String(e);
      }
    });
    this.chain = run;
    return run;
  }

  /** "Start over" (confirmed in Settings): removes the save and its backup. An unreadable copy, if any, is kept. */
  async wipe(): Promise<void> {
    await this.chain;
    await this.adapter.remove(this.slot);
    await this.adapter.remove(BACKUP_SLOT);
    this.revision = 0;
    this.lastBackupAt = 0;
  }

  /** The current game as a JSON file's text (saves first so it's up to date). */
  async exportJson(): Promise<string | null> {
    await this.saveNow();
    const doc = await this.adapter.load(this.slot);
    return doc ? JSON.stringify(doc) : null;
  }

  /**
   * Restores a save from an exported file. The file is validated and upgraded first; the save it
   * replaces is kept as the backup. Throws a readable message if the file isn't a Retreva save.
   */
  async importJson(text: string): Promise<SaveData> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('That file isn’t a Retreva save.');
    }
    const data = migrate(parsed);
    if (!data) throw new Error(((parsed as SaveData | null)?.schemaVersion ?? 0) > SAVE_SCHEMA_VERSION ? 'That save is from a newer version of Retreva.' : 'That file isn’t a Retreva save.');
    await this.chain;
    const current = await this.adapter.load(this.slot).catch(() => null);
    if (current) await this.adapter.save(BACKUP_SLOT, current);
    const doc: SaveData = { ...data, revision: Math.max(this.revision, data.revision) + 1, updatedAt: Date.now(), deviceId: this.deviceId };
    await this.adapter.save(this.slot, doc);
    this.revision = doc.revision;
    this.lastSavedAt = doc.updatedAt;
    return doc;
  }
}
