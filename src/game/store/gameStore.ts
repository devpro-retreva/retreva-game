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
import { GOALS, TIPS, newlyCompleted, type PhoneMessage, type TipDef } from '../systems/progress';
import {
  addRegard,
  canRun,
  drainNeeds,
  eat,
  emptyLife,
  LOW,
  orderSeconds,
  resaleValue,
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
import { fareBetween, findArea, LAGOS_AREAS } from '../content/regions/lagosState';
import { runtime, resetRuntime } from '../core/runtime';
import { clearInput, input } from '../core/input';

export type Phase = 'boot' | 'title' | 'create' | 'loading' | 'playing';
export type UiMode = 'play' | 'dialogue' | 'shop' | 'phone' | 'pause' | 'wardrobe' | 'travel' | 'transit' | 'shift' | 'home' | 'resting';
export type PhoneApp = 'home' | 'jobs' | 'bag' | 'wallet' | 'map' | 'profile' | 'settings' | 'messages' | 'travel';

export interface Toast {
  id: string;
  kind: 'money' | 'item' | 'info' | 'warn' | 'discover' | 'goal' | 'message';
  title: string;
  detail?: string;
}

export interface Nearby {
  id: string;
  kind: 'npc' | 'spot';
  label: string;
  verb: string;
}

export const DEFAULT_SETTINGS: Settings = {
  cameraSensitivity: 1,
  invertY: false,
  reducedMotion: false,
  textScale: 1,
  shadows: 'auto',
  showFps: false,
  tips: true,
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
  dialogue: { npcId: string; nodeId: string } | null;
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
  resting: { at: 'bench' | 'home'; until: number; to: number } | null;
  /** Home panel: which home door the player is at. */
  homeId: string | null;
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
  updateSettings(patch: Partial<Settings>): void;
}

const pack = (): DestinationPack => getDestination(useGame.getState().destinationId);

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
      else {
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
      };
      set({ ui: 'dialogue', dialogue: { npcId, nodeId: resolveEntry(npc.dialogue, ctx) } });
      setUiMode('dialogue');
    },

    chooseOption(o) {
      const a = o.action;
      switch (a.kind) {
        case 'goto': {
          const d = get().dialogue;
          if (d) set({ dialogue: { ...d, nodeId: a.node } });
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
      }
    },

    openShop(id) {
      set({ ui: 'shop', shopId: id, dialogue: null, haggle: null });
      setUiMode('shop');
      if (findBusiness(pack(), id)?.haggle) get().showTip('haggle');
    },

    openPhone(app = 'home') {
      const ui = get().ui;
      if (ui === 'dialogue' || ui === 'shop' || ui === 'travel' || ui === 'transit' || ui === 'shift' || ui === 'resting' || ui === 'home') return;
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
      if (ui === 'transit' || ui === 'shift' || ui === 'resting') return;
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
      if (ui0 === 'transit' || ui0 === 'shift' || ui0 === 'resting') return;
      set({ ui: 'play', dialogue: null, shopId: null, phoneApp: 'home', haggle: null, homeId: null });
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
      if (!area || areaId === from || s.jobs.active) return;
      const fare = fareBetween(from, areaId);
      const p = pack();
      const r = debit(s.wallet, { id: makeId('ride'), amount: fare, reason: `Danfo · ${p.area} → ${area.district}`, at: Date.now(), destinationId: from });
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough for the fare', detail: `You need ${formatMoney(p, fare - s.wallet.balance)} more. Every area has work.` });
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
        {
          jobs: s.jobs,
          jobArea: (id) => areaOfJob(id)?.id,
          visited: s.world.visited,
          discovered: s.world.discovered,
          inventory: s.inventory,
          bestBargain: s.world.bestBargain,
          rides: s.world.rides,
          totalAreas: LAGOS_AREAS.length,
        },
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
      if (s.ui === 'pause' || s.ui === 'transit' || s.ui === 'wardrobe') return;
      const patch: Partial<GameState> = { playTimeMs: s.playTimeMs + dtMs };
      if (s.ui === 'play') {
        const pl = runtime.player;
        const activity = !pl.moving ? 'idle' : pl.speed > 4 ? 'run' : 'walk';
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
      const stock = findBusiness(pack(), businessId)?.stock.find((x) => x.itemId === itemId);
      if (!stock) return false;
      return purchase(businessId, itemId, stock.price);
    },

    startHaggle(businessId, itemId) {
      const biz = findBusiness(pack(), businessId);
      const stock = biz?.stock.find((x) => x.itemId === itemId);
      if (!biz?.haggle || !stock) return;
      set({ haggle: { ...startHaggleFn(itemId, stock.price, biz.haggle), businessId } });
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
        get().pushToast({ kind: 'warn', title: 'Too tired to work', detail: 'Rest first — the bench at the okada park is free.' });
        return;
      }
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
      if (at === 'home' && !s.life.home) return;
      const to = at === 'home' ? 100 : 70;
      if (s.life.needs.energy >= to - 1) {
        get().pushToast({ kind: 'info', title: 'You are already rested', detail: at === 'bench' ? 'A bench only gets you so far — a bed at home restores you fully.' : undefined });
        return;
      }
      set({ ui: 'resting', homeId: null, resting: { at, to, until: Date.now() + (at === 'home' ? 3200 : 2600) } });
      setUiMode('resting');
    },

    finishRest() {
      const s = get();
      const r = s.resting;
      if (!r) return;
      const needs = rest(s.life.needs, r.to);
      set({ resting: null, ui: 'play', life: { ...s.life, needs }, critical: s.critical + 1 });
      setUiMode('play');
      get().pushToast({ kind: 'info', title: r.at === 'home' ? 'You slept well' : 'You caught your breath', detail: `Energy ${Math.round(needs.energy)}` });
    },

    rentHome(homeId) {
      const p = pack();
      const home = p.homes?.find((h) => h.id === homeId);
      const s = get();
      if (!home || s.life.home === homeId) return false;
      const r = debit(s.wallet, { id: `home:${homeId}`, amount: home.moveInCost, reason: `Move-in · ${home.name}`, at: Date.now(), destinationId: p.id });
      if (!r.ok) {
        get().pushToast({ kind: 'warn', title: 'Not enough money', detail: `You need ${formatMoney(p, home.moveInCost - s.wallet.balance)} more` });
        return false;
      }
      set({ wallet: r.wallet, life: { ...s.life, home: homeId }, critical: s.critical + 1 });
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
    settings: s.settings,
    player: { position: [runtime.player.x, runtime.player.z] as [number, number], yaw: runtime.player.yaw },
    stats: { playTimeMs: s.playTimeMs },
  };
}
