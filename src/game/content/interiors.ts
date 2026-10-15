/**
 * Interiors: small rooms you walk into (your home, a restaurant). Pure data, in the room's own coordinates
 * (x across, z depth; the door is on the +z wall). The street pack's spot with `homeId`/`interiorId`
 * leads here; leaving puts you back at that spot outside.
 */
import type { Vec2 } from './types';

export type FurnitureCategory = 'bed' | 'seat' | 'table' | 'decor' | 'light' | 'media' | 'storage';

export interface FurnitureDef {
  /** Item id — furniture is bought as an item and placed from the bag. */
  itemId: string;
  category: FurnitureCategory;
  /** Comfort it adds to a home (sleeping in a comfortable home leaves you well rested). */
  comfort: number;
  /** Footprint for collision [x, z] half-extents, and a look. */
  half: [number, number];
  color: string;
  accent: string;
}

export const FURNITURE: FurnitureDef[] = [
  { itemId: 'foam-mattress', category: 'bed', comfort: 0, half: [0.55, 1.0], color: '#d9d2c3', accent: '#7a8aa0' },
  { itemId: 'wooden-bed', category: 'bed', comfort: 3, half: [0.75, 1.1], color: '#7a5432', accent: '#c94f4f' },
  { itemId: 'plastic-chair', category: 'seat', comfort: 1, half: [0.28, 0.28], color: '#2c7fb8', accent: '#2c7fb8' },
  { itemId: 'armchair', category: 'seat', comfort: 2, half: [0.45, 0.45], color: '#a04b2f', accent: '#e8c46a' },
  { itemId: 'side-table', category: 'table', comfort: 1, half: [0.35, 0.35], color: '#8a5e3c', accent: '#c9a57a' },
  { itemId: 'potted-plant', category: 'decor', comfort: 1, half: [0.22, 0.22], color: '#2f7a3a', accent: '#a0522d' },
  { itemId: 'ankara-rug', category: 'decor', comfort: 1, half: [0, 0], color: '#e4572e', accent: '#f2b705' },
  { itemId: 'standing-fan', category: 'media', comfort: 2, half: [0.22, 0.22], color: '#e8e6e0', accent: '#5c6670' },
  { itemId: 'small-tv', category: 'media', comfort: 2, half: [0.45, 0.2], color: '#1d1d1f', accent: '#2c5f9e' },
  { itemId: 'rechargeable-lamp', category: 'light', comfort: 1, half: [0.15, 0.15], color: '#f4f0e6', accent: '#ffd98a' },
  { itemId: 'wall-art', category: 'decor', comfort: 1, half: [0, 0], color: '#1f6f4a', accent: '#e8b21c' },
  // fixtures (not sold): the storage chest, restaurant tables and counter
  { itemId: 'storage-chest', category: 'storage', comfort: 0, half: [0.45, 0.3], color: '#6b4a2e', accent: '#c9a24a' },
  { itemId: 'dining-table', category: 'table', comfort: 0, half: [0.6, 0.6], color: '#8a5e3c', accent: '#f4f0e6' },
  { itemId: 'counter', category: 'table', comfort: 0, half: [2.2, 0.4], color: '#1f6f4a', accent: '#f2b705' },
];

export function findFurniture(itemId: string): FurnitureDef | undefined {
  return FURNITURE.find((f) => f.itemId === itemId);
}

export interface FurnitureSlot {
  id: string;
  label: string;
  position: Vec2;
  /** Yaw of the piece placed here. */
  yaw: number;
  accepts: FurnitureCategory[];
  /** On the wall (art) or the floor. */
  wall?: boolean;
}

export interface InteriorDef {
  id: string;
  name: string;
  kind: 'home' | 'restaurant';
  /** Inner size [width (x), depth (z)] in metres. */
  size: [number, number];
  height: number;
  wall: string;
  floor: string;
  trim: string;
  /** Where you stand after coming in (just inside the door, which is on the +z wall). */
  entry: { position: Vec2; facing: number };
  /** Furniture always there: the storage chest, a basic mattress, restaurant tables… */
  fixed: { itemId: string; position: Vec2; yaw: number; use?: 'sleep' | 'storage' | 'dine' }[];
  /** Places you can put furniture you own (homes only). */
  slots: FurnitureSlot[];
  /** A window on the -z wall, for light. */
  window: boolean;
  /** Opening hours for public places (restaurants). */
  hours?: [number, number];
  /** What a restaurant serves: item, price, and how much a sit-down meal of it lifts your mood. */
  menu?: { itemId: string; price: number; joy: number }[];
}

const smallRoom = (id: string, name: string, wall: string, floor: string): InteriorDef => ({
  id,
  name,
  kind: 'home',
  size: [5, 4.4],
  height: 2.9,
  wall,
  floor,
  trim: '#f4f0e6',
  entry: { position: [1.6, 1.5], facing: Math.PI },
  fixed: [
    { itemId: 'foam-mattress', position: [-1.6, -1.1], yaw: 0, use: 'sleep' },
    { itemId: 'storage-chest', position: [1.85, -1.75], yaw: Math.PI / 2, use: 'storage' },
  ],
  slots: [
    { id: 'bed', label: 'Bed (replaces the mattress)', position: [-1.6, -1.1], yaw: 0, accepts: ['bed'] },
    { id: 'corner', label: 'Corner', position: [-2.05, 1.55], yaw: Math.PI / 4, accepts: ['decor', 'light', 'media', 'seat'] },
    { id: 'seat', label: 'By the window', position: [0.4, -1.55], yaw: 0, accepts: ['seat', 'table', 'media'] },
    { id: 'side', label: 'Bedside', position: [-0.55, -1.75], yaw: 0, accepts: ['table', 'light', 'decor'] },
    { id: 'floor', label: 'Floor (rug)', position: [-0.2, 0.2], yaw: 0, accepts: ['decor'] },
    { id: 'wall', label: 'Wall', position: [-2.47, 0], yaw: Math.PI / 2, accepts: ['decor'], wall: true },
  ],
  window: true,
});

export const INTERIORS: InteriorDef[] = [
  smallRoom('yaba-room', 'Room on Adeniyi Street', '#e9dcc3', '#9b7653'),
  smallRoom('osu-guesthouse', 'Osu Guesthouse room', '#d8e4e0', '#a67c52'),
  smallRoom('creek-studio', 'Creek studio', '#efe4cf', '#b08d64'),
  smallRoom('badagry-room', 'Room by the Marina', '#e3ece6', '#9a7550'),
  {
    id: 'yaba-eatery',
    name: 'Adeniyi Eatery',
    kind: 'restaurant',
    size: [7, 6],
    height: 3.2,
    wall: '#f3e2bd',
    floor: '#6e4f37',
    trim: '#1f6f4a',
    entry: { position: [2.2, 2.2], facing: Math.PI },
    fixed: [
      { itemId: 'dining-table', position: [-1.8, -0.2], yaw: 0, use: 'dine' },
      { itemId: 'dining-table', position: [1.2, -0.2], yaw: 0, use: 'dine' },
      { itemId: 'dining-table', position: [-1.8, 1.9], yaw: 0, use: 'dine' },
      { itemId: 'counter', position: [0, -2.05], yaw: 0 },
      { itemId: 'potted-plant', position: [3.1, -2.6], yaw: 0 },
      { itemId: 'wall-art', position: [-3.47, 0], yaw: Math.PI / 2 },
    ],
    slots: [],
    window: true,
    hours: [10, 23],
    menu: [
      { itemId: 'chapman', price: 1200, joy: 8 },
      { itemId: 'jollof-plate', price: 3000, joy: 14 },
      { itemId: 'pounded-yam-egusi', price: 3500, joy: 16 },
      { itemId: 'grilled-fish', price: 4500, joy: 20 },
    ],
  },
];

export function findInterior(id: string): InteriorDef | undefined {
  return INTERIORS.find((i) => i.id === id);
}

/** Comfort of a home: what's placed in its slots. */
export function comfortOf(placed: Record<string, string>): number {
  return Object.values(placed).reduce((n, itemId) => n + (findFurniture(itemId)?.comfort ?? 0), 0);
}

/** Comfortable enough (≥ 4) to wake up well rested. */
export const WELL_RESTED_COMFORT = 4;
