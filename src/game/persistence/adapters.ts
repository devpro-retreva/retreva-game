import type { SaveAdapter, SaveData } from './types';

// Storage keys keep the original project id so existing saves still load after the rename to Retreva.
const DB_NAME = 'retriever';
const STORE = 'saves';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

/** Durable local saves. Primary adapter for the offline-first build. */
export class IndexedDbSaveAdapter implements SaveAdapter {
  readonly id = 'indexeddb';
  private db: Promise<IDBDatabase> | null = null;

  private getDb() {
    if (!this.db) this.db = openDb();
    return this.db;
  }

  private async tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.getDb();
    return new Promise<T>((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  }

  async load(slot: string): Promise<SaveData | null> {
    const v = await this.tx('readonly', (s) => s.get(slot) as IDBRequest<SaveData | undefined>);
    return v ?? null;
  }
  async save(slot: string, data: SaveData): Promise<void> {
    await this.tx('readwrite', (s) => s.put(data, slot));
  }
  async remove(slot: string): Promise<void> {
    await this.tx('readwrite', (s) => s.delete(slot));
  }

  static isSupported(): boolean {
    try {
      return typeof indexedDB !== 'undefined' && indexedDB !== null;
    } catch {
      return false;
    }
  }
}

/** Fallback when IndexedDB is unavailable (some private-browsing modes). */
export class LocalStorageSaveAdapter implements SaveAdapter {
  readonly id = 'localstorage';
  private k(slot: string) {
    return `retriever:save:${slot}`;
  }
  async load(slot: string) {
    const raw = localStorage.getItem(this.k(slot));
    return raw ? (JSON.parse(raw) as SaveData) : null;
  }
  async save(slot: string, data: SaveData) {
    localStorage.setItem(this.k(slot), JSON.stringify(data));
  }
  async remove(slot: string) {
    localStorage.removeItem(this.k(slot));
  }
}

/** In-memory adapter for tests. */
export class MemorySaveAdapter implements SaveAdapter {
  readonly id = 'memory';
  store = new Map<string, string>();
  writes = 0;
  async load(slot: string) {
    const raw = this.store.get(slot);
    return raw ? (JSON.parse(raw) as SaveData) : null;
  }
  async save(slot: string, data: SaveData) {
    this.writes++;
    this.store.set(slot, JSON.stringify(data));
  }
  async remove(slot: string) {
    this.store.delete(slot);
  }
}

export async function createDefaultAdapter(): Promise<SaveAdapter> {
  if (IndexedDbSaveAdapter.isSupported()) {
    const idb = new IndexedDbSaveAdapter();
    try {
      await idb.load('__probe__');
      return idb;
    } catch {
      /* fall through */
    }
  }
  return new LocalStorageSaveAdapter();
}
