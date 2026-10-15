import { create } from 'zustand';
import { getDestination, findItem, findJob, findNpc, findBusiness, formatMoney, DEFAULT_DESTINATION, areaOfJob, ALL_PACKS } from '../content';
import type { DestinationPack, DialogueOption } from '../content/types';
import { createWallet, credit, debit, makeId, type Wallet } from '../systems/economy';
import { addItem, emptyInventory, removeFromStack, type Inventory } from '../systems/inventory';
import {
  acceptJob as acceptJobFn,
  collectSpot,
  completedCount,
  deliverJob as deliverJobFn,
  emptyJobs,
  isAvailable,
  tickJob,
  type JobsState,
} from '../systems/jobs';
import { resolveEntry, type DialogueContext } from '../systems/dialogue';
import { acceptAsk, makeOffer, savings, startHaggle as startHaggleFn, walkAway, type HaggleState } from '../systems/negotiation';
import { GOALS, TIPS, newlyCompleted, type PhoneMessage, type ProgressSnapshot, type TipDef } from '../systems/progress';
import {
  addRegard,
  canRun,
  drainNeeds,
  eat,
  emptyLife,
  LOW,
  orderSeconds,
  resaleValue,
  regardTier,
  rest,
  scoreShift,
  shiftOrders,
  skillLevel,
  spend,
  type LifeState,
  type OrderResult,
  type ShiftDef,
  type ShiftOutcome,
} from '../systems/life';
import { emptyWorld, type AvatarLook, type Profile, type SaveData, type Settings, type WorldProgress } from '../persistence/types';
import { sanitizeLook } from '../core/avatarPresets';
import { districts, fareBetween, findArea, modeBetween, regionOf, REGIONS } from '../content/regions';
import { findFlight } from '../content/flights';
import { findVehicle } from '../content/vehicles';
import { chat as chatFn, chatReady, friendPrice, giveGift as giveGiftFn, tierUp } from '../systems/social';
import { addVehicle, canMount, mount as mountFn, park as parkFn, removeVehicle, vehicleResale } from '../systems/vehicles';
import {
  bookFlight as bookFlightFn,
  canBoard,
  checkIn as checkInFn,
  clearSecurity,
  completeFlight,
  emptyTravel,
  liquidsIn,
  type TravelState,
} from '../systems/travel';
import { runtime, resetRuntime } from '../core/runtime';
import { clearInput, input } from '../core/input';

export type Phase = 'boot' | 'title' | 'create' | 'loading' | 'playing';
export type UiMode = 'play' | 'dialogue' | 'shop' | 'phone' | 'pause' | 'wardrobe' | 'travel' | 'transit' | 'shift' | 'home' | 'resting' | 'flight' | 'gift' | 'dealer';
export type PhoneApp = 'home' | 'jobs' | 'bag' | 'wallet' | 'map' | 'profile' | 'settings' | 'messages' | 'travel';

export interface Toast {
  id: string;
  kind: 'money' | 'item' | 'info' | 'warn' | 'discover' | 'goal' | 'message';
  title: string;
  detail?: string;
}

export interface Nearby {
  id: string;
  kind: 'npc' | 'spot' | 'vehicle' | 'dismount';
  label: string;
  verb: string;
}

export const DEFAULT_SETTINGS: Settings = {
  cameraSensitivity: 1,
  invertY: false,
  reducedMotion: false,
  textScale: 1,
  shadows: 'auto',
  graphics: 'auto',
  showFps: false,
  tips: true,
  ambienceVolume: 0.7,
  effectsVolume: 0.8,
  muted: false,
};

interface GameState {
  phase: Phase;
  hasSave: boolean;
  profile: Profile | null;
  destinationId: string;
  wallet: Wallet;
  inventory: Inventory;
  jobs: JobsState;
  world: WorldProgress;
  settings: Settings;
  playTimeMs: number;

  ui: UiMode;
  /** The conversation: which node, the node it opened on (where Chat/Gift are offered), and a one-off line (chat replies). */
  dialogue: { npcId: string; nodeId: string; opening?: string; line?: string } | null;
  /** Vehicle dealer panel. */
  dealerId: string | null;
  shopId: string | null;
  phoneApp: PhoneApp;
  nearby: Nearby | null;
  toasts: Toast[];
  tip: TipDef | null;
  tipQueue: string[];
  banner: { key: number; title: string; tagline: string } | null;
  haggle: (HaggleState & { businessId: string }) | null;
  transit: { from: string; to: string; fare: number; firstVisit: boolean } | null;
  /** Set during travel; handled once the new area has rendered. */
  arrival: { firstVisit: boolean } | null;
  life: LifeState;
  shift: ShiftRun | null;
  /** Resting overlay: where and until when (ms timestamp). */
  resting: { at: 'bench' | 'home'; until: number; to: number; from?: { x: number; z: number } } | null;
  /** Home panel: which home door the player is at. */
  homeId: string | null;
  /** Flight ticket + history (saved). */
  travel: TravelState;
  /** The flight in progress (not saved: a reload mid-flight puts you back at the gate with your ticket). */
  flight: { routeId: string; firstVisit: boolean } | null;
  dirty: number;
  critical: number;

  // lifecycle
  setPhase(p: Phase): void;
  setHasSave(v: boolean): void;
  startNewGame(profile: Profile): void;
  hydrate(save: SaveData): void;
  resetAll(): void;

  // ui
  setNearby(n: Nearby | null): void;
  interact(): void;
  openDialogue(npcId: string): void;
  chooseOption(o: DialogueOption): void;
  openShop(id: string): void;
  openPhone(app?: PhoneApp): void;
  setPhoneApp(app: PhoneApp): void;
  togglePause(): void;
  openWardrobe(): void;
  saveProfile(name: string, avatar: AvatarLook): void;
  closePanel(): void;
  pushToast(t: Omit<Toast, 'id'>): void;
  dismissToast(id: string): void;
  showTip(id: string): void;
  dismissTip(): void;
  clearBanner(): void;

  // travel
  openTravel(): void;
  travelTo(areaId: string): void;
  arrive(): void;
  bookFlight(routeId: string, roundTrip: boolean): boolean;
  checkIn(): void;
  passSecurity(liquids?: 'drink' | 'leave'): void;
  board(): void;
  land(): void;

  // world
  discover(landmarkId: string): void;
  collect(spotIndex: number): void;
  sendMessage(from: string, text: string): void;
  markMessagesRead(): void;
  checkGoals(): void;

  // gameplay
  acceptJob(jobId: string): void;
  deliverJob(jobId: string): void;
  tick(dtMs: number): void;
  buy(businessId: string, itemId: string): boolean;
  startHaggle(businessId: string, itemId: string): void;
  offer(amount: number): void;
  acceptHaggle(): void;
  leaveHaggle(): void;
  consume(stackKey: string): void;
  sell(stackKey: string): boolean;
  startShift(shiftId: string): void;
  serveDish(dishId: string | null): void;
  closeShift(): void;
  startRest(at: 'bench' | 'home'): void;
  finishRest(): void;
  rentHome(homeId: string): boolean;
  // social
  chat(): void;
  openGift(): void;
  giveGift(stackKey: string): void;
  // vehicles
  openDealer(dealerId: string): void;
  buyVehicle(dealerId: string, vehicleId: string): boolean;
  sellVehicle(uid: string): boolean;
  mountVehicle(uid: string): void;
  dismount(): void;
  /** Gets off and parks if riding (called before travel, shifts, resting…). */
  parkIfRiding(): void;
  /** Price at a shop, with a friend's discount from the owner. */
  priceAt(businessId: string, itemId: string): number | null;
  updateSettings(patch: Partial<Settings>): void;
}

const pack = (): DestinationPack => getDestination(useGame.getState().destinationId);
const lagosDistricts = districts(REGIONS[0]).map((a) => a.id);

const regardLabel = (v: number) => `${regardTier(v)} (${Math.round(v)}/100)`;

/** When someone starts to see you as an acquaintance, friend or close friend: a toast and a text from them. */
function announceTier(npcId: string, before: number, after: number) {
  const tier = tierUp(before, after);
  if (!tier) return;
  const npc = ALL_PACKS.flatMap((p) => p.npcs).find((n) => n.id === npcId);
  if (!npc) return;
  const owns = ALL_PACKS.some((p) => p.businesses.some((b) => b.ownerNpcId === npcId) || p.dealers?.some((d) => d.npcId === npcId));
  const perk = owns && tier === 'Friend' ? ' Friends get 10% off at my place.' : owns && tier === 'Close friend' ? ' For you, 15% off — always.' : '';
  const text =
    tier === 'Acquaintance' ? `Good to see you around. Come and say hello anytime.${perk}` : tier === 'Friend' ? `You're a real friend now, you know that?${perk}` : `You're family now. Anything you need, just ask.${perk}`;
  useGame.getState().pushToast({ kind: 'goal', title: `${npc.name}: ${tier}`, detail: 'Your friendship grew.' });
  setTimeout(() => useGame.getState().sendMessage(npc.name, text), 1800);
}

/** What goals measure. "Visit every area" is about Lagos districts; airports and other cities don't count toward it. */
export function progressSnapshot(s: Pick<GameState, 'jobs' | 'world' | 'inventory' | 'travel'>): ProgressSnapshot {
  return {
    jobs: s.jobs,
    jobArea: (id) => areaOfJob(id)?.id,
    visited: s.world.visited.filter((id) => lagosDistricts.includes(id)),
    discovered: s.world.discovered,
    inventory: s.inventory,
    bestBargain: s.world.bestBargain,
    rides: s.world.rides,
    totalAreas: lagosDistricts.length,
    flights: s.travel.history.length,
  };
}

export interface ShiftRun {
  shiftId: string;
  runId: string;
  orders: string[];
  index: number;
  results: OrderResult[];
  /** When the current order runs out (ms timestamp). */
  deadline: number;
  seconds: number;
  level: number;
  outcome: (ShiftOutcome & { levelUp: boolean; paid: boolean }) | null;
}

export const findShift = (p: DestinationPack, id: string): ShiftDef | undefined => p.shifts?.find((x) => x.id === id);
export { canRun };

function setUiMode(ui: UiMode) {
  input.enabled = ui === 'play';
  if (ui !== 'play') clearInput();
}

export const useGame = create<GameState>()((set, get): GameState => {
  /** Debits the wallet and adds one item; shared by fixed-price buys and bargains. */
  const purchase = (businessId: string, itemId: string, price: number, label?: string): boolean => {
    const p = pack();
    const biz = findBusiness(p, businessId);
    const item = findItem(p, itemId);
    if (!biz || !item) return false;
    const r = debit(get().wallet, { id: makeId('buy'), amount: price, reason: `${item.name} · ${biz.name}`, at: Date.now(), destinationId: p.id });
    if (!r.ok) {
      get().pushToast({ kind: 'warn', title: 'Not enough money', detail: `You need ${formatMoney(p, price - get().wallet.balance)} more` });
      return false;
    }
    const inventory = addItem(get().inventory, { itemId, category: item.category, quantity: 1, purchasePrice: price, destinationId: p.id, at: Date.now() });
    set({ wallet: r.wallet, inventory, critical: get().critical + 1 });
    get().pushToast({ kind: 'item', title: `${item.name} added to bag`, detail: label ?? `−${formatMoney(p, price)}` });
    if (r.wallet.balance < 300) get().showTip('low-money');
    get().checkGoals();
    return true;
  };

  return {
    phase: 'boot',
    hasSave: false,
    profile: null,
    destinationId: DEFAULT_DESTINATION,
    wallet: createWallet(0),
    inventory: emptyInventory(),
    jobs: emptyJobs(),
    world: emptyWorld(DEFAULT_DESTINATION),
    settings: DEFAULT_SETTINGS,
    playTimeMs: 0,

    ui: 'play',
    dialogue: null,
    shopId: null,
    phoneApp: 'home',
    nearby: null,
    toasts: [],
    tip: null,
    tipQueue: [],
    banner: null,
    haggle: null,
    transit: null,
    arrival: null,
    life: emptyLife(),
    shift: null,
    resting: null,
    homeId: null,
    dealerId: null,
    travel: emptyTravel(),
    flight: null,
    dirty: 0,
    critical: 0,

    setPhase(phase) {
      const prev = get().phase;
      set({ phase });
      if (phase !== 'playing' || prev === 'playing') return;
      // Entering the world: title card for the area, plus first-visit extras after travel.
      const p = pack();
      set({ banner: { key: Date.now(), title: p.area, tagline: p.tagline } });
      const arrival = get().arrival;
      if (arrival) {
        set({ arrival: null });
        if (arrival.firstVisit) {
          if (p.welcome) setTimeout(() => get().sendMessage(p.welcome!.from, p.welcome!.text), 2600);
          get().showTip('new-area');
        }
        get().checkGoals();
      } else {
        get().showTip('welcome');
      }
    },
    setHasSave: (hasSave) => set({ hasSave }),

    startNewGame(profile) {
      const p = getDestination(DEFAULT_DESTINATION);
      resetRuntime(p.spawn.position[0], p.spawn.position[1], p.spawn.facing);
      set({
        profile: { ...profile, avatar: sanitizeLook(profile.avatar) },
        destinationId: p.id,
        wallet: createWallet(p.startingMoney),
        inventory: emptyInventory(),
        jobs: emptyJobs(),
        world: emptyWorld(p.id),
        life: emptyLife(),
        travel: emptyTravel(),
        flight: null,
        shift: null,
        resting: null,
        homeId: null,
        playTimeMs: 0,
        ui: 'play',
        dialogue: null,
        shopId: null,
        nearby: null,
        toasts: [],
        tip: null,
        tipQueue: [],
        haggle: null,
        transit: null,
        arrival: null,
        hasSave: true,
        critical: get().critical + 1,
      });
      setUiMode('play');
    },

    hydrate(save) {
      const p = getDestination(save.destinationId);
      resetRuntime(save.player.position[0], save.player.position[1], save.player.yaw);
      set({
        profile: save.profile,
        destinationId: p.id,
        wallet: save.wallet,
        inventory: save.inventory,
        jobs: save.jobs,
        world: save.world ?? emptyWorld(p.id),
        life: save.life ?? emptyLife(),
        travel: save.travel ?? emptyTravel(),
        flight: null,
        shift: null,
        resting: null,
        homeId: null,
        settings: { ...DEFAULT_SETTINGS, ...save.settings },
        playTimeMs: save.stats?.playTimeMs ?? 0,
        ui: 'play',
        dialogue: null,
        shopId: null,
        tip: null,
        tipQueue: [],
        haggle: null,
        transit: null,
        arrival: null,
        hasSave: true,
      });
      setUiMode('play');
    },

    resetAll() {
      set({
        phase: 'title',
        hasSave: false,
        profile: null,
        destinationId: DEFAULT_DESTINATION,
        wallet: createWallet(0),
        inventory: emptyInventory(),
        jobs: emptyJobs(),
        world: emptyWorld(DEFAULT_DESTINATION),
        life: emptyLife(),
        travel: emptyTravel(),
        flight: null,
        shift: null,
        resting: null,
        homeId: null,
        ui: 'play',
        dialogue: null,
        shopId: null,
        toasts: [],
        tip: null,
        tipQueue: [],
        haggle: null,
      });
    },

    setNearby(nearby) {
      if (get().nearby?.id === nearby?.id) return;
      set({ nearby });
    },

    interact() {
      const { ui, nearby } = get();
      if (ui !== 'play' || !nearby) return;
      if (nearby.kind === 'npc') get().openDialogue(nearby.id);
      else if (nearby.kind === 'vehicle') get().mountVehicle(nearby.id);
      else if (nearby.kind === 'dismount') get().dismount();
      else {
        get().parkIfRiding();
        const spot = pack().spots?.find((x) => x.id === nearby.id);
        if (spot?.kind === 'bench') get().startRest('bench');
        else if (spot?.kind === 'home' && spot.homeId) {
          set({ ui: 'home', homeId: spot.homeId });
          setUiMode('home');
        }
      }
    },

    openDialogue(npcId) {
      const p = pack();
      const npc = findNpc(p, npcId);
      if (!npc) return;
      const s = get();
      const now = Date.now();
      const ctx: DialogueContext = {
        jobAvailable: (id) => {
          const j = findJob(p, id);
          return !!j && isAvailable(s.jobs, j, now);
        },
        jobActive: (id) => s.jobs.active?.jobId === id,
        isDropoff: (id) => {
          const j = findJob(p, id);
          if (!j || s.jobs.active?.jobId !== id || j.dropoffNpcId !== npcId) return false;
          return j.kind !== 'collect' || (s.jobs.active.collected?.length ?? 0) >= (j.collect?.count ?? 0);
        },
        jobCompletedBefore: (id) => completedCount(s.jobs, id) > 0,
        tripStage: () => {
          const t = s.travel.ticket;
          if (!t) return 'none';
          return findFlight(t.routeId)?.from === p.id ? t.stage : 'elsewhere';
        },
        carryingLiquids: () => liquidsIn(s.inventory).length > 0,
      };
      const opening = resolveEntry(npc.dialogue, ctx);
      set({ ui: 'dialogue', dialogue: { npcId, nodeId: opening, opening } });
      setUiMode('dialogue');
    },

    chooseOption(o) {
      const a = o.action;
      switch (a.kind) {
        case 'goto': {
          const d = get().dialogue;
          if (d) set({ dialogue: { ...d, nodeId: a.node, line: undefined } });
          return;
        }
        case 'close':
          get().closePanel();
          return;
        case 'acceptJob':
          get().acceptJob(a.jobId);
          get().closePanel();
          return;
        case 'deliverJob':
          get().deliverJob(a.jobId);
          get().closePanel();
          return;
        case 'openShop':
          get().openShop(a.businessId);
          return;
        case 'openTravel':
          get().openTravel();
          return;
        case 'startShift':
          get().startShift(a.shiftId);
          return;
        case 'checkIn':
          get().checkIn();
          return;
        case 'security':
          get().passSecurity(a.liquids);
          return;
        case 'board':
          get().board();
          return;
        case 'openFlights':
          get().closePanel();
          get().openPhone('travel');
          return;
        case 'chat':
          get().chat();
          return;
        case 'gift':
          get().openGift();
          return;
        case 'dealer':
          get().openDealer(a.dealerId);
          return;
      }
    },

    openShop(id) {
      set({ ui: 'shop', shopId: id, dialogue: null, haggle: null });
      setUiMode('shop');
      if (findBusiness(pack(), id)?.haggle) get().showTip('haggle');
    },

    openPhone(app = 'home') {
      const ui = get().ui;
      if (ui === 'dialogue' || ui === 'shop' || ui === 'travel' || ui === 'transit' || ui === 'shift' || ui === 'resting' || ui === 'home' || ui === 'flight' || ui === 'gift' || ui === 'dealer') return;
      set({ ui: 'phone', phoneApp: app });
      setUiMode('phone');
      if (app === 'messages') get().markMessagesRead();
    },

    setPhoneApp(phoneApp) {
      set({ phoneApp });
      if (phoneApp === 'messages') get().markMessagesRead();
    },

    togglePause() {
      const ui = get().ui;
      if (ui === 'transit' || ui === 'shift' || ui === 'resting' || ui === 'flight') return;
      if (ui === 'pause') {
        set({ ui: 'play' });
        setUiMode('play');
      } else if (ui === 'play') {
        set({ ui: 'pause' });
        setUiMode('pause');
      } else {
        get().closePanel();
      }
    },

    openWardrobe() {
      set({ ui: 'wardrobe', dialogue: null, shopId: null });
      setUiMode('wardrobe');
    },

    saveProfile(name, avatar) {
      const cur = get().profile;
      if (!cur) return;
      const clean = name.trim().slice(0, 18);
      if (clean.length < 2) return;
      set({ profile: { ...cur, name: clean, avatar: sanitizeLook(avatar) }, critical: get().critical + 1 });
      get().closePanel();
      get().pushToast({ kind: 'info', title: 'Look updated', detail: 'Saved to your profile.' });
    },

    closePanel() {
      const ui0 = get().ui;
      if (ui0 === 'transit' || ui0 === 'shift' || ui0 === 'resting' || ui0 === 'flight') return;
      set({ ui: 'play', dialogue: null, shopId: null, phoneApp: 'home', haggle: null, homeId: null, dealerId: null });
      setUiMode('play');
    },

    pushToast(t) {
      const toast = { ...t, id: makeId('t') };
      set({ toasts: [...get().toasts.slice(-2), toast] });
    },
    dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

    showTip(id) {
      const s = get();
      const tip = TIPS[id];
      if (!tip || !s.settings.tips || s.world.seenTips.includes(id)) return;
      if (s.tip?.id === id || s.tipQueue.includes(id)) return;
      if (!s.tip) set({ tip });
      else set({ tipQueue: [...s.tipQueue, id] });
    },

    dismissTip() {
      const s = get();
      if (!s.tip) return;
      const seenTips = [...s.world.seenTips, s.tip.id];
      // job-specific tips are only useful while that kind of job is running
      const relevant = (id: string) => {
        if (id === 'collect' || id === 'job-started') return !!s.jobs.active;
        return true;
      };
      const [next, ...rest] = s.tipQueue.filter((id) => !seenTips.includes(id) && relevant(id));
      set({ world: { ...s.world, seenTips }, tip: next && s.settings.tips ? TIPS[next] : null, tipQueue: rest, dirty: s.dirty + 1 });
    },

    clearBanner: () => set({ banner: null }),

    openTravel() {
      if (get().jobs.active) {
        get().closePanel();
        get().pushToast({ kind: 'warn', title: 'Finish your job first', detail: 'You can travel once the current job is done.' });
        return;
      }
      set({ ui: 'travel', dialogue: null });
      setUiMode('travel');
    },

    travelTo(areaId) {
      const s = get();
      const from = s.destinationId;
      const area = findArea(areaId);
      if (!area || areaId === from || s.jobs.active || regionOf(areaId) !== regionOf(from)) return;
      get().parkIfRiding();
      const fare = fareBetween(from, areaId);
      const p = pack();
      const r = debit(s.wallet, { id: makeId('ride'), amount: fare, reason: `${modeBetween(from, areaId)} · ${p.area} → ${area.district}`, at: Date.now(), destinationId: from });
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough for the fare', detail: `You need ${formatMoney(p, fare - s.wallet.balance)} more. Every area has work — ask around.` });
        return;
      }
      set({
        wallet: r.wallet,
        transit: { from, to: areaId, fare, firstVisit: !s.world.visited.includes(areaId) },
        ui: 'transit',
        dialogue: null,
        nearby: null,
        critical: s.critical + 1,
      });
      setUiMode('transit');
    },

    arrive() {
      const s = get();
      const t = s.transit;
      if (!t) return;
      const dest = getDestination(t.to);
      resetRuntime(dest.arrival.position[0], dest.arrival.position[1], dest.arrival.facing);
      const visited = s.world.visited.includes(t.to) ? s.world.visited : [...s.world.visited, t.to];
      set({
        destinationId: dest.id,
        world: { ...s.world, visited, rides: s.world.rides + 1 },
        transit: null,
        arrival: { firstVisit: t.firstVisit },
        ui: 'play',
        nearby: null,
        phase: 'loading',
        critical: s.critical + 1,
      });
      setUiMode('play');
    },

    bookFlight(routeId, roundTrip) {
      const s = get();
      const p = pack();
      const route = findFlight(routeId);
      if (!route) return false;
      if (regionOf(route.from) !== regionOf(s.destinationId)) {
        get().pushToast({ kind: 'warn', title: 'Not from here', detail: `That flight leaves from ${findArea(route.from)?.district ?? 'another airport'}.` });
        return false;
      }
      const id = makeId('trip');
      const r = bookFlightFn(s.travel, route, roundTrip, id, Date.now());
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'You already have a ticket', detail: 'Use it first — your boarding pass is in the Travel app.' });
        return false;
      }
      const price = r.state.ticket!.paid;
      const pay = debit(s.wallet, {
        id: `flight:${route.id}:${id}`,
        amount: price,
        reason: `${route.carrier} ${route.code} · ${roundTrip ? 'return' : 'one-way'} to ${route.cityName}`,
        at: Date.now(),
        destinationId: s.destinationId,
      });
      if (!pay.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough for the ticket', detail: `You need ${formatMoney(p, price - s.wallet.balance)} more. Shifts and jobs pay — every area has work.` });
        return false;
      }
      set({ wallet: pay.wallet, travel: r.state, critical: s.critical + 1 });
      get().pushToast({ kind: 'item', title: `Ticket booked · ${route.code}`, detail: `To ${route.cityName}. Get to the airport and check in.` });
      get().showTip('flight');
      return true;
    },

    checkIn() {
      const s = get();
      const route = s.travel.ticket ? findFlight(s.travel.ticket.routeId) : undefined;
      const r = checkInFn(s.travel, route, pack().id);
      get().closePanel();
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: r.reason === 'wrong-airport' ? 'Wrong airport for this ticket' : r.reason === 'no-ticket' ? 'No ticket' : 'Already checked in' });
        return;
      }
      set({ travel: r.state, critical: s.critical + 1 });
      get().pushToast({ kind: 'info', title: 'Checked in', detail: `Next: security, then gate ${route!.gate}.` });
    },

    passSecurity(liquids) {
      const s = get();
      const drinks = liquidsIn(s.inventory);
      get().closePanel();
      if (drinks.length && !liquids) return; // the officer asks about them first
      const r = clearSecurity(s.travel);
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: r.reason === 'not-checked-in' ? 'Check in first' : r.reason === 'no-ticket' ? 'No ticket' : 'Already through security' });
        return;
      }
      let inventory = s.inventory;
      let needs = s.life.needs;
      let n = 0;
      for (const e of drinks) {
        const item = findItem(pack(), e.itemId);
        for (let i = 0; i < e.quantity; i++) if (liquids === 'drink') needs = eat(needs, item?.nutrition ?? 8);
        n += e.quantity;
        const rm = removeFromStack(inventory, e.key, e.quantity);
        if (rm.ok) inventory = rm.inventory;
      }
      const route = findFlight(r.state.ticket!.routeId);
      set({ travel: r.state, inventory, life: { ...s.life, needs }, critical: s.critical + 1 });
      const note = n === 0 ? '' : liquids === 'drink' ? ` You finished ${n} drink${n > 1 ? 's' : ''}.` : ` You left ${n} drink${n > 1 ? 's' : ''} behind.`;
      get().pushToast({ kind: 'info', title: 'Through security', detail: `Gate ${route?.gate} is at the end of the concourse.${note}` });
    },

    board() {
      const s = get();
      const route = s.travel.ticket ? findFlight(s.travel.ticket.routeId) : undefined;
      const ok = canBoard(s.travel, route, pack().id);
      if (ok !== true || !route) {
        get().closePanel();
        get().pushToast({ kind: 'warn', title: ok === 'not-cleared' ? 'Security first' : ok === 'not-checked-in' ? 'Check in first' : 'No boarding pass' });
        return;
      }
      get().parkIfRiding();
      set({ ui: 'flight', flight: { routeId: route.id, firstVisit: !s.world.visited.includes(route.arriveAt) }, dialogue: null, nearby: null });
      setUiMode('flight');
    },

    land() {
      const s = get();
      const f = s.flight;
      const route = f && findFlight(f.routeId);
      if (!f || !route) return;
      const r = completeFlight(s.travel, route, Date.now());
      if (!r.ok) {
        set({ flight: null, ui: 'play' });
        setUiMode('play');
        return;
      }
      const dest = getDestination(route.arriveAt);
      resetRuntime(dest.arrival.position[0], dest.arrival.position[1], dest.arrival.facing);
      const visited = s.world.visited.includes(dest.id) ? s.world.visited : [...s.world.visited, dest.id];
      set({
        destinationId: dest.id,
        travel: r.state,
        flight: null,
        life: { ...s.life, needs: eat(s.life.needs, route.snack.fullness) },
        world: { ...s.world, visited },
        arrival: { firstVisit: f.firstVisit },
        ui: 'play',
        nearby: null,
        phase: 'loading',
        critical: s.critical + 1,
      });
      setUiMode('play');
      if (r.state.ticket) setTimeout(() => get().pushToast({ kind: 'info', title: 'Return ticket ready', detail: `${findFlight(r.state.ticket!.routeId)?.code} home is in your Travel app.` }), 4200);
    },

    chat() {
      const s = get();
      const d = s.dialogue;
      const npc = d && findNpc(pack(), d.npcId);
      if (!d || !npc?.social) return;
      const now = Date.now();
      if (!chatReady(s.life, npc.id, now)) {
        set({ dialogue: { ...d, nodeId: '__social', line: `${npc.name} smiles. “We just talked! Come and gist again in a little while — I have customers.”` } });
        return;
      }
      const before = s.life.regard[npc.id] ?? 0;
      const r = chatFn(s.life, npc.id, now);
      const said = npc.social.lines[(Math.floor(now / 1000) + (r.life.social[npc.id]?.lastChat ?? 0)) % npc.social.lines.length];
      set({ life: r.life, dialogue: { ...d, nodeId: '__social', line: `“${said}”` }, critical: s.critical + 1 });
      get().pushToast({ kind: 'info', title: `You chatted with ${npc.name}`, detail: `+${r.gain} · ${regardLabel(r.life.regard[npc.id] ?? 0)}` });
      announceTier(npc.id, before, r.life.regard[npc.id] ?? 0);
    },

    openGift() {
      const d = get().dialogue;
      if (!d) return;
      set({ ui: 'gift' });
      setUiMode('gift');
    },

    giveGift(stackKey) {
      const s = get();
      const d = s.dialogue;
      const npc = d && findNpc(pack(), d.npcId);
      const entry = s.inventory.entries.find((e) => e.key === stackKey);
      const item = entry && findItem(pack(), entry.itemId);
      if (!d || !npc?.social || !entry || !item) return;
      const r0 = removeFromStack(s.inventory, stackKey, 1);
      if (!r0.ok) return;
      const liked = npc.social.likes.includes(item.id) || npc.social.likes.includes(item.category);
      const now = Date.now();
      const before = s.life.regard[npc.id] ?? 0;
      const r = giveGiftFn(s.life, npc.id, liked, now);
      const line = liked ? `“For me? Ah, ${item.name.toLowerCase()}! You know me well. Thank you!”` : `“Thank you, that's kind of you.”`;
      set({ inventory: r0.inventory, life: r.life, ui: 'dialogue', dialogue: { ...d, nodeId: '__social', line }, critical: s.critical + 1 });
      setUiMode('dialogue');
      get().pushToast({ kind: 'info', title: `You gave ${npc.name} ${item.name.toLowerCase()}`, detail: `+${r.gain}${liked ? ' · they loved it' : ''} · ${regardLabel(r.life.regard[npc.id] ?? 0)}` });
      announceTier(npc.id, before, r.life.regard[npc.id] ?? 0);
    },

    openDealer(dealerId) {
      if (!pack().dealers?.some((x) => x.id === dealerId)) return;
      set({ ui: 'dealer', dealerId, dialogue: null });
      setUiMode('dealer');
    },

    buyVehicle(dealerId, vehicleId) {
      const s = get();
      const p = pack();
      const dealer = p.dealers?.find((x) => x.id === dealerId);
      const stock = dealer?.stock.find((x) => x.vehicleId === vehicleId);
      const def = findVehicle(vehicleId);
      if (!dealer || !stock || !def) return false;
      const price = friendPrice(stock.price, s.life.regard[dealer.npcId] ?? 0);
      const uid = makeId('veh');
      const r = debit(s.wallet, { id: `vehicle:${uid}`, amount: price, reason: `${def.name} · ${dealer.name}`, at: Date.now(), destinationId: p.id });
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough money', detail: `You need ${formatMoney(p, price - s.wallet.balance)} more` });
        return false;
      }
      const at = { areaId: p.id, x: dealer.parkAt.position[0], z: dealer.parkAt.position[1], yaw: dealer.parkAt.yaw };
      set({ wallet: r.wallet, life: { ...s.life, vehicles: addVehicle(s.life.vehicles, uid, vehicleId, price, at) }, critical: s.critical + 1 });
      get().pushToast({ kind: 'goal', title: `You own a ${def.name.toLowerCase()}`, detail: 'It’s parked by the lot — walk up to it to ride.' });
      get().checkGoals();
      return true;
    },

    sellVehicle(uid) {
      const s = get();
      const p = pack();
      const v = s.life.vehicles.find((x) => x.uid === uid);
      const dealer = p.dealers?.find((x) => x.id === s.dealerId);
      const here = v && (s.life.riding === uid || v.parked?.areaId === p.id);
      if (!v || !dealer || !here) return false;
      const value = vehicleResale(v.paid);
      const pay = credit(s.wallet, { id: `sellvehicle:${uid}`, amount: value, reason: `Sold ${findVehicle(v.vehicleId)?.name ?? 'vehicle'} · ${dealer.name}`, at: Date.now(), destinationId: p.id });
      set({
        wallet: pay.wallet,
        life: { ...s.life, vehicles: removeVehicle(s.life.vehicles, uid), riding: s.life.riding === uid ? null : s.life.riding },
        critical: s.critical + 1,
      });
      get().pushToast({ kind: 'money', title: `+${formatMoney(p, value)}`, detail: `Sold to ${dealer.name}` });
      return true;
    },

    mountVehicle(uid) {
      const s = get();
      const p = pack();
      const v = s.life.vehicles.find((x) => x.uid === uid);
      if (s.life.riding || !canMount(v, p.id, runtime.player.x, runtime.player.z)) return;
      runtime.player.x = v!.parked!.x;
      runtime.player.z = v!.parked!.z;
      set({ life: { ...s.life, vehicles: mountFn(s.life.vehicles, uid), riding: uid }, nearby: null, critical: s.critical + 1 });
      get().showTip('riding');
    },

    dismount() {
      const s = get();
      const uid = s.life.riding;
      if (!uid) return;
      const p = runtime.player;
      set({ life: { ...s.life, vehicles: parkFn(s.life.vehicles, uid, { areaId: s.destinationId, x: p.x, z: p.z, yaw: p.yaw }), riding: null }, nearby: null, critical: s.critical + 1 });
    },

    parkIfRiding() {
      if (!get().life.riding) return;
      get().dismount();
      const v = get().life.vehicles.find((x) => x.parked?.areaId === get().destinationId);
      if (v) get().pushToast({ kind: 'info', title: `${findVehicle(v.vehicleId)?.name ?? 'Vehicle'} parked`, detail: `Left in ${pack().area}. It'll be here when you come back.` });
    },

    discover(landmarkId) {
      const s = get();
      if (s.world.discovered.includes(landmarkId)) return;
      const lm = pack().landmarks.find((l) => l.id === landmarkId);
      if (!lm) return;
      set({ world: { ...s.world, discovered: [...s.world.discovered, landmarkId] }, critical: s.critical + 1 });
      get().pushToast({ kind: 'discover', title: `Discovered: ${lm.name}`, detail: lm.blurb });
      get().showTip('discover');
      get().checkGoals();
    },

    collect(spotIndex) {
      const s = get();
      const a = s.jobs.active;
      const job = a && findJob(pack(), a.jobId);
      if (!job || job.kind !== 'collect' || !job.collect) return;
      const next = collectSpot(s.jobs, job, spotIndex);
      if (!next) return;
      set({ jobs: next, dirty: s.dirty + 1 });
      const n = next.active?.collected?.length ?? 0;
      const giver = findNpc(pack(), job.dropoffNpcId);
      if (n >= job.collect.count) get().pushToast({ kind: 'info', title: `All ${n} collected`, detail: `Take them back to ${giver?.name}.` });
      else get().pushToast({ kind: 'item', title: `Picked up a ${job.collect.item}`, detail: `${n} of ${job.collect.count}` });
    },

    sendMessage(from, text) {
      const s = get();
      const msg: PhoneMessage = { id: makeId('m'), from, text, at: Date.now(), read: false };
      set({ world: { ...s.world, messages: [...s.world.messages, msg].slice(-60) }, dirty: s.dirty + 1 });
      get().pushToast({ kind: 'message', title: `New message from ${from}`, detail: text.length > 70 ? `${text.slice(0, 68)}…` : text });
      get().showTip('message');
    },

    markMessagesRead() {
      const s = get();
      if (!s.world.messages.some((m) => !m.read)) return;
      set({ world: { ...s.world, messages: s.world.messages.map((m) => ({ ...m, read: true })) }, dirty: s.dirty + 1 });
    },

    checkGoals() {
      const s = get();
      const fresh = newlyCompleted(
        progressSnapshot(s),
        s.world.goalsDone,
      );
      if (!fresh.length) return;
      let wallet = s.wallet;
      for (const g of fresh) {
        const r = credit(wallet, { id: `goal:${g.id}`, amount: g.reward, reason: `Goal · ${g.title}`, at: Date.now(), destinationId: s.destinationId });
        wallet = r.wallet;
      }
      set({ wallet, world: { ...s.world, goalsDone: [...s.world.goalsDone, ...fresh.map((g) => g.id)] }, critical: s.critical + 1 });
      const p = pack();
      fresh.forEach((g, i) => setTimeout(() => get().pushToast({ kind: 'goal', title: `Goal complete: ${g.title}`, detail: `+${formatMoney(p, g.reward)} · ${g.description}` }), 900 * (i + 1)));
    },

    acceptJob(jobId) {
      const p = pack();
      const job = findJob(p, jobId);
      if (!job) return;
      const r = acceptJobFn(get().jobs, job, Date.now(), makeId('run'));
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: r.reason === 'busy' ? 'Finish your current job first' : 'Not ready yet' });
        return;
      }
      const dropoff = findNpc(p, job.dropoffNpcId);
      set({ jobs: r.state, critical: get().critical + 1 });
      if (job.kind === 'collect' && job.collect) {
        get().pushToast({ kind: 'info', title: `${job.title} started`, detail: `Pick up ${job.collect.count} ${job.collect.item}s, then report to ${dropoff?.name}` });
        get().showTip('collect');
      } else {
        get().pushToast({ kind: 'info', title: `${job.title} started`, detail: `Take the ${job.cargo.toLowerCase()} to ${dropoff?.name}` });
        get().showTip('job-started');
      }
    },

    deliverJob(jobId) {
      const p = pack();
      const job = findJob(p, jobId);
      const npc = job && findNpc(p, job.dropoffNpcId);
      if (!job || !npc) return;
      const live = runtime.actors.get(npc.id) ?? { x: npc.position[0], z: npc.position[1] };
      const distance = Math.hypot(runtime.player.x - live.x, runtime.player.z - live.z);
      const firstTime = completedCount(get().jobs, job.id) === 0;
      const r = deliverJobFn(get().jobs, job, { now: Date.now(), distanceToDropoff: distance });
      if (!r.ok) {
        const msg: Record<string, string> = {
          'too-far': `Get closer to ${npc.name}`,
          expired: 'Too late — time ran out',
          'no-job': 'No job in progress',
          'wrong-job': 'That is not for this person',
          'already-paid': 'Already delivered',
          incomplete: `You still need more ${job.collect?.item ?? 'items'}s`,
        };
        get().pushToast({ kind: 'warn', title: msg[r.reason] });
        return;
      }
      const pay = credit(get().wallet, {
        id: r.payout.txId,
        amount: r.payout.total,
        reason: `${job.title}${r.payout.bonus ? ' + speed bonus' : ''}`,
        at: Date.now(),
        destinationId: p.id,
      });
      // Job state advances regardless; money only moves if this tx id is new.
      set({ jobs: r.state, wallet: pay.wallet, critical: get().critical + 1 });
      // drop job-specific tips that are no longer useful
      const cur = get();
      const stale = (id: string) => id === 'collect' || id === 'job-started';
      if (cur.tip && stale(cur.tip.id)) {
        const [next, ...rest] = cur.tipQueue.filter((id) => !stale(id));
        set({ tip: next ? TIPS[next] : null, tipQueue: rest, world: { ...cur.world, seenTips: [...cur.world.seenTips, cur.tip.id] } });
      } else {
        set({ tipQueue: cur.tipQueue.filter((id) => !stale(id)) });
      }
      if (pay.ok) {
        const secs = (r.payout.elapsedMs / 1000).toFixed(1);
        get().pushToast({
          kind: 'money',
          title: `+${formatMoney(p, r.payout.total)}`,
          detail: r.payout.bonus ? `Done in ${secs}s — includes ${formatMoney(p, r.payout.bonus)} speed bonus` : `Done in ${secs}s`,
        });
        get().showTip('first-money');
        get().showTip('travel');
        get().checkGoals();
        if (firstTime) {
          const giver = findNpc(p, job.giverNpcId);
          if (giver) setTimeout(() => get().sendMessage(giver.name, `Thank you for the ${job.title.toLowerCase()}! You did well — come back anytime, there is always more work.`), 3200);
        }
      }
    },

    tick(dtMs) {
      const s = get();
      if (s.phase !== 'playing') return;
      if (s.ui === 'pause' || s.ui === 'transit' || s.ui === 'wardrobe' || s.ui === 'flight') return;
      const patch: Partial<GameState> = { playTimeMs: s.playTimeMs + dtMs };
      if (s.ui === 'play') {
        const pl = runtime.player;
        const activity = !pl.moving ? 'idle' : s.life.riding ? 'ride' : pl.speed > 4 ? 'run' : 'walk';
        const before = s.life.needs;
        const needs = drainNeeds(before, dtMs, activity);
        patch.life = { ...s.life, needs };
        patch.dirty = s.dirty + 1;
        const crossed = (k: 'energy' | 'fullness', at: number) => before[k] >= at && needs[k] < at;
        if (crossed('energy', 40)) get().showTip('tired');
        if (crossed('energy', LOW)) get().pushToast({ kind: 'warn', title: 'Exhausted', detail: 'You can only walk now. Rest on a bench or at home.' });
        if (crossed('fullness', 40)) get().showTip('hungry');
        if (crossed('fullness', LOW)) get().pushToast({ kind: 'warn', title: 'Starving', detail: 'Eat something — an empty stomach tires you twice as fast.' });
      }
      if (s.jobs.active) {
        const p = pack();
        const job = findJob(p, s.jobs.active.jobId);
        const r = tickJob(s.jobs, job, dtMs, Date.now());
        patch.jobs = r.state;
        if (r.failed && job) {
          patch.critical = s.critical + 1;
          set(patch);
          const giver = findNpc(p, job.giverNpcId);
          get().pushToast({ kind: 'warn', title: `${job.title} failed`, detail: `Time ran out. Talk to ${giver?.name ?? 'them'} to try again.` });
          return;
        }
      }
      set(patch);
    },

    buy(businessId, itemId) {
      const price = get().priceAt(businessId, itemId);
      if (price === null) return false;
      return purchase(businessId, itemId, price);
    },

    priceAt(businessId, itemId) {
      const biz = findBusiness(pack(), businessId);
      const stock = biz?.stock.find((x) => x.itemId === itemId);
      if (!biz || !stock) return null;
      return friendPrice(stock.price, get().life.regard[biz.ownerNpcId] ?? 0);
    },

    startHaggle(businessId, itemId) {
      const biz = findBusiness(pack(), businessId);
      const stock = biz?.stock.find((x) => x.itemId === itemId);
      if (!biz?.haggle || !stock) return;
      set({ haggle: { ...startHaggleFn(itemId, get().priceAt(businessId, itemId) ?? stock.price, biz.haggle), businessId } });
    },

    offer(amount) {
      const h = get().haggle;
      if (!h) return;
      const next = makeOffer(h, amount);
      set({ haggle: { ...next, businessId: h.businessId } });
      if (next.status === 'deal') finishDeal({ ...next, businessId: h.businessId });
    },

    acceptHaggle() {
      const h = get().haggle;
      if (!h) return;
      const next = acceptAsk(h);
      set({ haggle: { ...next, businessId: h.businessId } });
      if (next.status === 'deal') finishDeal({ ...next, businessId: h.businessId });
    },

    leaveHaggle() {
      const h = get().haggle;
      if (!h) return;
      set({ haggle: h.status === 'deal' ? null : { ...walkAway(h), businessId: h.businessId } });
    },

    consume(stackKey) {
      const p = pack();
      const entry = get().inventory.entries.find((e) => e.key === stackKey);
      const item = entry && findItem(p, entry.itemId);
      if (!entry || !item?.consumable) return;
      const r = removeFromStack(get().inventory, stackKey, 1);
      if (!r.ok) return;
      const gain = item.nutrition ?? (item.category === 'drink' ? 8 : 20);
      const life = get().life;
      const needs = eat(life.needs, gain);
      set({ inventory: r.inventory, life: { ...life, needs }, critical: get().critical + 1 });
      runtime.player.eatUntil = performance.now() + 2200;
      get().pushToast({
        kind: 'info',
        title: item.category === 'drink' ? `You drank the ${item.name.toLowerCase()}` : `You ate the ${item.name.toLowerCase()}`,
        detail: `Fullness +${Math.round(needs.fullness - life.needs.fullness)} (now ${Math.round(needs.fullness)})`,
      });
    },

    sell(stackKey) {
      const p = pack();
      const s = get();
      const entry = s.inventory.entries.find((e) => e.key === stackKey);
      const item = entry && findItem(p, entry.itemId);
      const biz = s.shopId ? findBusiness(p, s.shopId) : undefined;
      if (!entry || !item || !biz) return false;
      const value = resaleValue(entry.purchasePrice, item.category);
      if (value <= 0) return false;
      const r = removeFromStack(s.inventory, stackKey, 1);
      if (!r.ok) return false;
      const pay = credit(s.wallet, { id: makeId('sell'), amount: value, reason: `Sold ${item.name} · ${biz.name}`, at: Date.now(), destinationId: p.id });
      set({ inventory: r.inventory, wallet: pay.wallet, critical: s.critical + 1 });
      get().pushToast({ kind: 'money', title: `+${formatMoney(p, value)}`, detail: `Sold ${item.name} to ${biz.name}` });
      return true;
    },

    startShift(shiftId) {
      const p = pack();
      const def = findShift(p, shiftId);
      const s = get();
      if (!def) return;
      if (s.jobs.active) {
        get().closePanel();
        get().pushToast({ kind: 'warn', title: 'Finish your current job first' });
        return;
      }
      if (s.life.needs.energy < def.minEnergy) {
        get().closePanel();
        get().pushToast({ kind: 'warn', title: 'Too tired to work', detail: 'Rest first — benches are free, and a bed at home restores you fully.' });
        return;
      }
      get().parkIfRiding();
      const level = skillLevel(s.life.skills[def.skill]);
      const seconds = orderSeconds(def, level);
      const runId = makeId('shift');
      const seed = Array.from(runId).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
      set({
        ui: 'shift',
        dialogue: null,
        shift: { shiftId, runId, orders: shiftOrders(def, seed), index: 0, results: [], deadline: Date.now() + seconds * 1000 + 1200, seconds, level, outcome: null },
      });
      setUiMode('shift');
      get().showTip('shift');
    },

    serveDish(dishId) {
      const s = get();
      const run = s.shift;
      if (!run || run.outcome) return;
      const want = run.orders[run.index];
      const late = Date.now() > run.deadline;
      const result: OrderResult = dishId === null || late ? 'missed' : dishId === want ? 'served' : 'wrong';
      const results = [...run.results, result];
      const index = run.index + 1;
      if (index < run.orders.length) {
        set({ shift: { ...run, results, index, deadline: Date.now() + run.seconds * 1000 } });
        return;
      }
      // shift over: pay, skill, regard, staff meal, energy
      const p = pack();
      const def = findShift(p, run.shiftId)!;
      const o = scoreShift(def, results, run.level);
      const total = o.pay + o.tip;
      const pay = total > 0
        ? credit(s.wallet, { id: `shift:${def.id}:${run.runId}`, amount: total, reason: `${def.title}${o.tip ? ' + perfect tip' : ''}`, at: Date.now(), destinationId: p.id })
        : { ok: false, wallet: s.wallet };
      const xp = (s.life.skills[def.skill] ?? 0) + o.xp;
      const levelUp = skillLevel(xp) > run.level;
      const needs = eat(spend(s.life.needs, def.energyCost), def.staffMeal);
      const life: LifeState = {
        ...s.life,
        needs,
        skills: { ...s.life.skills, [def.skill]: xp },
        regard: addRegard(s.life.regard, def.npcId, o.regard),
        shiftsDone: s.life.shiftsDone + 1,
      };
      set({ wallet: pay.wallet, life, shift: { ...run, results, index, outcome: { ...o, levelUp, paid: pay.ok } }, critical: s.critical + 1 });
      announceTier(def.npcId, s.life.regard[def.npcId] ?? 0, life.regard[def.npcId] ?? 0);
      get().checkGoals();
    },

    closeShift() {
      const run = get().shift;
      if (run && !run.outcome) return;
      set({ shift: null, ui: 'play' });
      setUiMode('play');
      const o = run?.outcome;
      if (o?.levelUp) {
        const def = findShift(pack(), run!.shiftId);
        get().pushToast({ kind: 'goal', title: `Cooking skill up: level ${skillLevel(get().life.skills[def?.skill ?? 'cooking'])}`, detail: 'More time per order and better pay per plate.' });
      }
    },

    startRest(at) {
      const s = get();
      if (at === 'home' && !s.life.homes.length) return;
      const to = at === 'home' ? 100 : 70;
      if (s.life.needs.energy >= to - 1) {
        get().pushToast({ kind: 'info', title: 'You are already rested', detail: at === 'bench' ? 'A bench only gets you so far — a bed at home restores you fully.' : undefined });
        return;
      }
      // on a bench, sit on it (facing the way you came) and stand back up where you were afterwards
      let from: { x: number; z: number } | undefined;
      if (at === 'bench') {
        const p = runtime.player;
        const bench = pack()
          .props.filter((x) => x.kind === 'bench')
          .map((x) => ({ x: x.position[0], z: x.position[1], d: Math.hypot(x.position[0] - p.x, x.position[1] - p.z) }))
          .sort((a, b) => a.d - b.d)[0];
        if (bench && bench.d < 2.2) {
          from = { x: p.x, z: p.z };
          p.yaw = Math.atan2(p.x - bench.x, p.z - bench.z);
          p.x = bench.x;
          p.z = bench.z;
        }
      }
      set({ ui: 'resting', homeId: null, resting: { at, to, until: Date.now() + (at === 'home' ? 3200 : 2600), from } });
      setUiMode('resting');
    },

    finishRest() {
      const s = get();
      const r = s.resting;
      if (!r) return;
      const needs = rest(s.life.needs, r.to);
      if (r.from) {
        runtime.player.x = r.from.x;
        runtime.player.z = r.from.z;
      }
      set({ resting: null, ui: 'play', life: { ...s.life, needs }, critical: s.critical + 1 });
      setUiMode('play');
      get().pushToast({ kind: 'info', title: r.at === 'home' ? 'You slept well' : 'You caught your breath', detail: `Energy ${Math.round(needs.energy)}` });
    },

    rentHome(homeId) {
      const p = pack();
      const home = p.homes?.find((h) => h.id === homeId);
      const s = get();
      if (!home || s.life.homes.includes(homeId)) return false;
      const r = debit(s.wallet, { id: `home:${homeId}`, amount: home.moveInCost, reason: `Move-in · ${home.name}`, at: Date.now(), destinationId: p.id });
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough money', detail: `You need ${formatMoney(p, home.moveInCost - s.wallet.balance)} more` });
        return false;
      }
      set({ wallet: r.wallet, life: { ...s.life, homes: [...s.life.homes, homeId] }, critical: s.critical + 1 });
      get().pushToast({ kind: 'goal', title: 'You have a home', detail: `${home.name} is yours to rest in.` });
      get().checkGoals();
      return true;
    },

    updateSettings(patch) {
      const next = { ...get().settings, ...patch };
      set({ settings: next, dirty: get().dirty + 1, ...(patch.tips === false ? { tip: null, tipQueue: [] } : {}) });
    },
  };

  function finishDeal(h: HaggleState & { businessId: string }) {
    const p = pack();
    const saved = savings(h);
    const label = saved > 0 ? `Paid ${formatMoney(p, h.dealPrice!)} — saved ${Math.round(saved * 100)}%` : undefined;
    const ok = purchase(h.businessId, h.itemId, h.dealPrice!, label);
    if (!ok) {
      set({ haggle: { ...h, status: 'final', dealPrice: null } });
      return;
    }
    const s = get();
    if (saved > s.world.bestBargain) set({ world: { ...s.world, bestBargain: saved }, dirty: s.dirty + 1 });
    get().checkGoals();
  }
});

/** Ids of every goal, for the Goals list. */
export const GOAL_IDS = GOALS.map((g) => g.id);
export const AREA_COUNT = ALL_PACKS.length;

/** Builds the persistent snapshot used by the save manager. */
export function snapshotForSave() {
  const s = useGame.getState();
  if (!s.profile || s.phase !== 'playing') return null;
  return {
    profile: s.profile,
    destinationId: s.destinationId,
    wallet: s.wallet,
    inventory: s.inventory,
    jobs: s.jobs,
    world: s.world,
    life: s.life,
    travel: s.travel,
    settings: s.settings,
    player: { position: [runtime.player.x, runtime.player.z] as [number, number], yaw: runtime.player.yaw },
    stats: { playTimeMs: s.playTimeMs },
  };
}
