import type { Wallet } from '../systems/economy';
import type { Inventory } from '../systems/inventory';
import type { JobsState } from '../systems/jobs';

export const SAVE_SCHEMA_VERSION = 1;

export interface AvatarLook {
  skin: string;
  top: string;
  bottom: string;
  headwear: 'none' | 'cap' | 'kufi' | 'gele';
  headColor: string;
  build: 'slim' | 'regular' | 'broad';
}

export interface Profile {
  name: string;
  avatar: AvatarLook;
  createdAt: number;
}

export interface Settings {
  cameraSensitivity: number; // 0.4 – 2
  invertY: boolean;
  reducedMotion: boolean;
  textScale: 1 | 1.15 | 1.3;
  shadows: 'auto' | 'on' | 'off';
  showFps: boolean;
}

export interface SaveData {
  schemaVersion: number;
  /** Increments on every save. Future cloud sync compares revisions + updatedAt. */
  revision: number;
  updatedAt: number;
  /** Identifies the device that wrote this save, for future conflict resolution. */
  deviceId: string;
  profile: Profile;
  destinationId: string;
  wallet: Wallet;
  inventory: Inventory;
  jobs: JobsState;
  settings: Settings;
  player: { position: [number, number]; yaw: number };
  stats: { playTimeMs: number };
}

/**
 * Game systems → SaveAdapter → (Local today, Local + Cloud later).
 * Adapters only move opaque save documents; they never interpret game rules.
 */
export interface SaveAdapter {
  readonly id: string;
  load(slot: string): Promise<SaveData | null>;
  save(slot: string, data: SaveData): Promise<void>;
  remove(slot: string): Promise<void>;
}
