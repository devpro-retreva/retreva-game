/**
 * Destination content model.
 * A destination pack is pure data: the engine reads it to build the world,
 * spawn NPCs, run dialogue, stock shops and offer jobs. Adding Accra, Dubai
 * or Toronto means writing another pack, not changing the engine.
 */

import type { ShiftDef } from '../systems/life';
import type { RepairDef } from '../systems/repair';
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
  | 'goods'
  | 'furniture';

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  description: string;
  /** Reference price in the destination currency. Shops may override. */
  basePrice: number;
  /** Food and drink can be consumed from the bag. */
  consumable?: boolean;
  /** Fullness restored when eaten or drunk (0–100). Defaults: food 20, drink 8. */
  nutrition?: number;
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
  /** 'glass': a curtain-wall facade (airport terminals, malls) instead of render and louvres. */
  style?: 'glass';
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
  | 'keke'
  // waterfronts
  | 'jetty'
  | 'canoe'
  | 'arch'
  // skylines
  | 'monolith'
  | 'skyscraper'
  | 'hilltower'
  | 'colonnade'
  // railways
  | 'train'
  // markets
  | 'clothline'
  // art
  | 'sculpture'
  | 'statue'
  // airports
  | 'counter'
  | 'scanner'
  | 'gatedesk'
  | 'stanchion'
  | 'car'
  | 'plane';

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
  | { kind: 'jobCompletedBefore'; jobId: string }
  /** Where your flight ticket stands at this airport: none, booked, checked-in, cleared, or 'elsewhere' (it departs from another airport). */
  | { kind: 'trip'; stage: 'none' | 'booked' | 'checked-in' | 'cleared' | 'elsewhere' }
  /** Bottled drinks in your bag (security won't let them through). */
  | { kind: 'carryingLiquids' }
  /** You meet the requirements of a job or repair bench (by id). */
  | { kind: 'meets'; target: string; not?: boolean };

export type DialogueAction =
  | { kind: 'goto'; node: string }
  | { kind: 'close' }
  | { kind: 'acceptJob'; jobId: string }
  | { kind: 'deliverJob'; jobId: string }
  | { kind: 'openShop'; businessId: string }
  /** The travel picker: by road (default), or the boats from this area's jetty. */
  | { kind: 'openTravel'; by?: 'road' | 'boat' | 'coach' }
  | { kind: 'startShift'; shiftId: string }
  /** Airport steps. */
  | { kind: 'checkIn' }
  | { kind: 'security'; liquids?: 'drink' | 'leave' }
  | { kind: 'board' }
  /** Opens the phone's Travel app on the flights section. */
  | { kind: 'openFlights' }
  /** Social: chat a while, or pick something from your bag to give. */
  | { kind: 'chat' }
  | { kind: 'gift' }
  /** Starts a repair session at a repair bench. */
  | { kind: 'startRepair'; repairId: string }
  /** Opens a vehicle dealer (buy / sell). */
  | { kind: 'dealer'; dealerId: string };

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
  /** Hours this person is around, e.g. [7, 22]; outside them they've gone home. Omit for always (staff, conductors). */
  hours?: [number, number];
  /** People you can get to know: things they say when you chat, and what they'd love as a gift (item ids or categories). */
  social?: { lines: string[]; likes: string[] };
}

export type WalkerActivity = 'shop' | 'wait' | 'chat' | 'eat' | 'photo';

export interface WalkerDef {
  id: string;
  look: NpcLook;
  path: Vec2[];
  speed: number;
  /** What this person stops to do at a path point: pose, how long, which way they face (yaw). */
  stops?: { at: number; activity: WalkerActivity; seconds: number; face: number }[];
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

/** What you need before you can take a job, repair or other work. All listed conditions must hold. */
export interface Requirement {
  /** How well you know someone (regard 0–100). */
  regard?: { npcId: string; min: number };
  /** Times you've completed a job. */
  jobsDone?: { jobId: string; count: number };
  /** Landmarks you've discovered. */
  discovered?: string[];
  /** A skill level. */
  skill?: { skill: string; level: number };
}

export interface JobDef {
  id: string;
  /**
   * delivery: carry cargo to the drop-off. collect: pick up items, then report to the drop-off.
   * tour: the giver follows you to each landmark in `tour.stops`, in order, then you end the tour with them.
   */
  kind?: 'delivery' | 'collect' | 'tour';
  tour?: { stops: string[] };
  requires?: Requirement;
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

/** Something in the world you can use: a bench to rest on, the door of a home to rent. */
export interface SpotDef {
  id: string;
  /** bench: rest. home: a home's door (rent/buy, go inside). door: a public place's door (restaurant). jetty: the boat landing. */
  kind: 'bench' | 'home' | 'door' | 'event' | 'jetty';
  /** For an 'event': which show this is the gate of. */
  eventId?: string;
  /** For a 'door': the interior it leads into. */
  interiorId?: string;
  position: Vec2;
  label: string;
  verb: string;
  homeId?: string;
}

/** Moving traffic on the main road: simple lane paths, bounded and data-driven. */
export interface TrafficDef {
  lanes: { x: number; dir: 1 | -1 }[];
  vehicles: { kind: 'danfo' | 'keke' | 'car'; color?: string }[];
  /** Cruising speed range in m/s. */
  speed: [number, number];
}

/** A home the player can rent in this area. */
export interface HomeDef {
  id: string;
  name: string;
  description: string;
  /** One-off payment to move in (rent for your stay). */
  moveInCost: number;
  /** Price to buy it outright, if it's for sale. Owned homes sell back at a valuation (see systems/home). */
  buyPrice?: number;
}

/** A ticketed show at a venue in this area: on at set hours, every day or every few days. */
export interface EventDef {
  id: string;
  name: string;
  kind: 'concert' | 'comedy' | 'festival';
  venue: string;
  description: string;
  /** [start, end] hour; end may pass midnight. */
  hours: [number, number];
  everyDays?: number;
  offsetDays?: number;
  /** Ticket price in the app (naira). */
  price: number;
  /** How much a night out lifts your mood, and what it costs in energy. */
  joy: number;
  energy: number;
  /** A stage to draw (and walk around) at the venue, if it's outdoors. */
  stage?: { position: Vec2; size: [number, number]; facing: number; color: string; accent: string };
  /** Who is on stage (looks for the performers). */
  performers?: CharacterLookLite[];
}

export interface CharacterLookLite {
  gender: 'male' | 'female';
  skin: string;
  top: string;
  bottom: string;
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
  /** Where you step off a boat (areas with a jetty and boats in their region's `boats`). */
  dock?: { position: Vec2; facing: number };
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
  /** The area's soundscape (synthesised, see src/audio/ambience.ts): traffic, crowd, horns/min, waves, chimes/min. */
  ambience?: { traffic: number; crowd: number; horns: number; waves?: number; chimes?: number };
  /** How many walkers stay out after dark (default 2). */
  nightWalkers?: number;
  /** What lies behind the street: city blocks (default), an airfield with parked planes, or railway tracks with a waiting train beyond the north end. */
  backdrop?: 'city' | 'airfield' | 'railway';
  /** Leave one street end open (no closing row of buildings) so a distant landmark can be seen. */
  vista?: 'north';
  /** What the open end shows: low savanna (default), a sea of rust-brown roofs over the hills (old Ibadan), deep forest (a sacred grove), an old city moat (Benin), a pine-topped escarpment (Enugu's Milliken Hill), or granite boulder hills (the Jos Plateau). */
  vistaStyle?: 'savanna' | 'roofs' | 'forest' | 'moat' | 'escarpment' | 'boulders';
  /** The local currency, shown next to wallet prices as a guide (₦ per 1 local unit). The wallet itself stays in naira. */
  localCurrency?: { code: string; symbol: string; perUnit: number };
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
  /** Skill-based shift work (different mechanic from delivery jobs). */
  shifts?: ShiftDef[];
  spots?: SpotDef[];
  traffic?: TrafficDef;
  homes?: HomeDef[];
  /** Ticketed shows here (Events app; the gate is a spot with kind 'event'). */
  events?: EventDef[];
  /** Repair benches: put the steps of each repair in the right order before time runs out. */
  repairs?: RepairDef[];
  /** People who sell (and buy back) vehicles here. A new vehicle is parked at `parkAt`. */
  dealers?: { id: string; name: string; npcId: string; stock: { vehicleId: string; price: number }[]; parkAt: { position: Vec2; yaw: number } }[];
  startingMoney: number;
}
