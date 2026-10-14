/**
 * Destination content model.
 * A destination pack is pure data: the engine reads it to build the world,
 * spawn NPCs, run dialogue, stock shops and offer jobs. Adding Accra, Dubai
 * or Toronto means writing another pack, not changing the engine.
 */

import type { Accessory, FacialHair, Gender, HairStyle, Headwear, OutfitStyle } from '../persistence/types';

/** Ground-plane position: [x, z] in metres. */
export type Vec2 = [number, number];

export type ItemCategory =
  | 'food'
  | 'drink'
  | 'clothing'
  | 'shoes'
  | 'bag'
  | 'souvenir'
  | 'ticket'
  | 'document'
  | 'collectible'
  | 'goods';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  /** Reference price in the destination currency. Shops may override. */
  basePrice: number;
  /** Food and drink can be consumed from the bag. */
  consumable?: boolean;
  /** Short glyph key used by the UI icon set. */
  icon: string;
}

export interface SignDef {
  text: string;
  sub?: string;
  bg: string;
  fg: string;
}

export interface BuildingDef {
  id: string;
  position: Vec2;
  /** width (along street), height, depth */
  size: [number, number, number];
  /** Which side of the building faces the street. */
  facing: 'east' | 'west';
  wall: string;
  trim: string;
  roof: string;
  storeys: number;
  sign?: SignDef;
  awning?: string;
  balcony?: boolean;
  /** Business that operates from this building, if any. */
  businessId?: string;
}

export type PropKind =
  | 'danfo'
  | 'okada'
  | 'kiosk'
  | 'pole'
  | 'generator'
  | 'tree'
  | 'drum'
  | 'bench'
  | 'umbrella'
  | 'crates'
  | 'tank'
  | 'grill'
  | 'palm'
  | 'stall'
  | 'beachhut'
  | 'lifeguard'
  | 'lounger'
  | 'busstop'
  | 'keke';

export interface PropDef {
  id: string;
  kind: PropKind;
  position: Vec2;
  rotation?: number;
  color?: string;
  /** Props with collide=true block the player and camera. */
  collide?: boolean;
}

export interface NpcLook {
  gender: Gender;
  skin: string;
  top: string;
  bottom: string;
  hair?: HairStyle;
  hairColor?: string;
  facialHair?: FacialHair;
  outfit?: OutfitStyle;
  headwear?: Headwear;
  headColor?: string;
  accessory?: Accessory;
  height?: number;
}

/** Conditions let one data file express "what this NPC says right now". */
export type DialogueCondition =
  | { kind: 'jobAvailable'; jobId: string }
  | { kind: 'jobActive'; jobId: string }
  | { kind: 'isDropoff'; jobId: string }
  | { kind: 'jobCompletedBefore'; jobId: string };

export type DialogueAction =
  | { kind: 'goto'; node: string }
  | { kind: 'close' }
  | { kind: 'acceptJob'; jobId: string }
  | { kind: 'deliverJob'; jobId: string }
  | { kind: 'openShop'; businessId: string }
  | { kind: 'openTravel' };

export interface DialogueOption {
  label: string;
  action: DialogueAction;
}

export interface DialogueNode {
  text: string;
  options: DialogueOption[];
}

export interface DialogueDef {
  /** First entry whose condition passes (or has none) is the opening node. */
  entries: { when?: DialogueCondition; node: string }[];
  nodes: Record<string, DialogueNode>;
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  personality: string;
  position: Vec2;
  /** Yaw in radians; 0 faces +z. */
  facing: number;
  look: NpcLook;
  /** Verb shown in the interaction prompt, e.g. "Talk to". */
  promptVerb: string;
  dialogue: DialogueDef;
  /** Optional idle animation flavour. */
  idle?: 'sway' | 'wave' | 'busy';
}

export interface WalkerDef {
  id: string;
  look: NpcLook;
  path: Vec2[];
  speed: number;
}

export interface BusinessDef {
  id: string;
  name: string;
  kind: 'food' | 'provisions' | 'fashion' | 'market';
  ownerNpcId: string;
  stock: { itemId: string; price: number }[];
  greeting: string;
  /**
   * Market stalls let you bargain. `floor` is the lowest fraction of the asking
   * price the seller will ever accept; `patience` is how many offers they hear.
   */
  haggle?: { floor: number; patience: number };
}

/** A place worth finding. Walking within `radius` discovers it once. */
export interface LandmarkDef {
  id: string;
  name: string;
  blurb: string;
  position: Vec2;
  radius: number;
}

export interface JobDef {
  id: string;
  /** delivery: carry cargo to the drop-off. collect: pick up items, then report to the drop-off. */
  kind?: 'delivery' | 'collect';
  collect?: { item: string; spots: Vec2[]; count: number };
  title: string;
  summary: string;
  giverNpcId: string;
  dropoffNpcId: string;
  /** Item the player carries during the job (shown in HUD only, not inventory). */
  cargo: string;
  timeLimitMs: number;
  reward: number;
  bonus: { underMs: number; amount: number };
  /** Cooldown before the job can be taken again. */
  cooldownMs: number;
}

export interface DestinationPack {
  id: string;
  name: string;
  area: string;
  country: string;
  currency: { code: string; symbol: string; locale: string };
  /** One-line description shown on arrival and in the Travel app. */
  tagline: string;
  /** Where new games start (only used by the home area). */
  spawn: { position: Vec2; facing: number };
  /** Where you step off the danfo when travelling here. */
  arrival: { position: Vec2; facing: number };
  /** Union of walkable rectangles: [minX, minZ, maxX, maxZ]. */
  walkable: [number, number, number, number][];
  /** Low boundary walls drawn around open lots: [x0, z0, x1, z1]. */
  walls: [number, number, number, number][];
  palette: {
    sky: string;
    fog: string;
    ground: string;
    road: string;
    roadLine: string;
    sidewalk: string;
    gutter: string;
    sun: string;
  };
  road: { halfWidth: number; sidewalk: number; length: number; style?: 'asphalt' | 'paved' | 'sand' };
  /** Open sea beyond this x (east side), for beach areas. */
  sea?: { fromX: number };
  landmarks: LandmarkDef[];
  /** Text from a local when you first arrive. */
  welcome?: { from: string; text: string };
  buildings: BuildingDef[];
  props: PropDef[];
  npcs: NpcDef[];
  walkers: WalkerDef[];
  businesses: BusinessDef[];
  items: ItemDef[];
  jobs: JobDef[];
  startingMoney: number;
}
