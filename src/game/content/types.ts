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
  | 'grill';

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
  | { kind: 'openShop'; businessId: string };

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
}

export interface JobDef {
  id: string;
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
  spawn: { position: Vec2; facing: number };
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
  road: { halfWidth: number; sidewalk: number; length: number };
  buildings: BuildingDef[];
  props: PropDef[];
  npcs: NpcDef[];
  walkers: WalkerDef[];
  businesses: BusinessDef[];
  items: ItemDef[];
  jobs: JobDef[];
  startingMoney: number;
}
