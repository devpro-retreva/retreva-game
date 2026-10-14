import type { Wallet } from '../systems/economy';
import type { Inventory } from '../systems/inventory';
import type { JobsState } from '../systems/jobs';
import type { PhoneMessage } from '../systems/progress';

export const SAVE_SCHEMA_VERSION = 3;

export type Gender = 'male' | 'female';
export type HairStyle = 'low' | 'hightop' | 'afro' | 'locs' | 'bald' | 'puff' | 'braids' | 'long' | 'bun' | 'short';
export type FacialHair = 'none' | 'moustache' | 'goatee' | 'beard';
export type OutfitStyle = 'shirt' | 'kaftan' | 'tee-shorts' | 'dress' | 'top-skirt' | 'top-trousers';
export type Headwear = 'none' | 'cap' | 'kufi' | 'gele' | 'wrap';
export type Accessory = 'none' | 'glasses' | 'earrings';

export interface AvatarLook {
  gender: Gender;
  skin: string;
  hair: HairStyle;
  hairColor: string;
  facialHair: FacialHair;
  outfit: OutfitStyle;
  /** Main garment colour (shirt, top, dress, kaftan). */
  top: string;
  /** Trousers, shorts or skirt colour. */
  bottom: string;
  headwear: Headwear;
  headColor: string;
  accessory: Accessory;
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
  /** Show first-time tip cards. */
  tips: boolean;
}

/** Exploration and social progress across all areas. */
export interface WorldProgress {
  visited: string[];
  discovered: string[];
  goalsDone: string[];
  seenTips: string[];
  messages: PhoneMessage[];
  bestBargain: number;
  rides: number;
}

export const emptyWorld = (home: string): WorldProgress => ({
  visited: [home],
  discovered: [],
  goalsDone: [],
  seenTips: [],
  messages: [],
  bestBargain: 0,
  rides: 0,
});

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
  world: WorldProgress;
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
