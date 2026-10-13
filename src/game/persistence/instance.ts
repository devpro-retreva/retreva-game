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
      if (s.critical !== prev.critical) void this.manager?.saveNow();
      else if (s.dirty !== prev.dirty) this.manager?.schedule(600);
      if (s.phase === 'playing' && prev.phase !== 'playing') void this.manager?.saveNow();
    });
    const flush = () => void this.manager?.saveNow();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
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
  async wipe() {
    await this.manager?.wipe();
  }
}

export const saves = new SaveService();
