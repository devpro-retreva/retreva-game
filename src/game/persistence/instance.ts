import { snapshotForSave, useGame } from '../store/gameStore';
import { createDefaultAdapter, LocalStorageSaveAdapter } from './adapters';
import { getDeviceId, SaveManager } from './saveManager';
import type { SaveAdapter } from './types';

/**
 * Lazy singleton wiring the store to the save adapter.
 * Swap or wrap the adapter here to add cloud sync later.
 */
class SaveService {
  private manager: SaveManager | null = null;
  private ready: Promise<SaveManager> | null = null;

  init(): Promise<SaveManager> {
    if (!this.ready) {
      this.ready = createDefaultAdapter()
        .catch((): SaveAdapter => new LocalStorageSaveAdapter())
        .then((adapter) => {
          this.manager = new SaveManager(adapter, snapshotForSave, getDeviceId());
          this.watch();
          return this.manager;
        });
    }
    return this.ready;
  }

  private watch() {
    // money, items and job outcomes are written immediately; settings are debounced
    useGame.subscribe((s, prev) => {
      if (s.critical !== prev.critical) void this.saveAndReport();
      else if (s.dirty !== prev.dirty) this.manager?.schedule(600);
      if (s.phase === 'playing' && prev.phase !== 'playing') {
        void this.saveAndReport();
        void this.requestPersistence();
      }
    });
    const flush = () => void this.manager?.saveNow();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
  }

  private reported: string | null = null;
  /** Saves now; if saving starts failing (storage full, blocked), tell the player once rather than failing silently. */
  private async saveAndReport() {
    const m = this.manager;
    if (!m) return;
    await m.saveNow();
    const err = m.lastError;
    if (err && err !== this.reported) {
      this.reported = err;
      const full = /quota|space|full/i.test(err);
      useGame.getState().pushToast({
        kind: 'warn',
        title: 'Couldn’t save your progress',
        detail: full ? 'This device is out of storage space. Free some space; the game keeps trying.' : 'The browser blocked saving. The game keeps trying — export a backup from Settings to be safe.',
      });
    } else if (!err) this.reported = null;
  }

  async load() {
    const m = await this.init();
    return m.load();
  }

  schedule(delay = 800) {
    this.manager?.schedule(delay);
  }
  saveNow() {
    return this.manager?.saveNow() ?? Promise.resolve();
  }
  get status() {
    return { adapter: this.manager?.adapterId ?? 'none', lastSavedAt: this.manager?.lastSavedAt ?? 0, error: this.manager?.lastError ?? null };
  }
  /** What the last load had to do (restore the backup, or keep an unreadable save aside). */
  get notice() {
    return this.manager?.notice ?? null;
  }
  async exportJson() {
    const m = await this.init();
    return m.exportJson();
  }
  async importJson(text: string) {
    const m = await this.init();
    return m.importJson(text);
  }
  /** Asks the browser not to clear our storage when space runs low (granted silently or not at all; no prompt in Chromium). */
  async requestPersistence(): Promise<boolean> {
    try {
      if (!navigator.storage?.persist) return false;
      if (await navigator.storage.persisted?.()) return true;
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  async storageInfo(): Promise<{ persisted: boolean; usage: number; quota: number } | null> {
    try {
      if (!navigator.storage?.estimate) return null;
      const [est, persisted] = await Promise.all([navigator.storage.estimate(), navigator.storage.persisted?.() ?? Promise.resolve(false)]);
      return { persisted, usage: est.usage ?? 0, quota: est.quota ?? 0 };
    } catch {
      return null;
    }
  }
  async wipe() {
    await this.manager?.wipe();
  }
}

export const saves = new SaveService();
