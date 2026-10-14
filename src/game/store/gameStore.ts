import { create } from 'zustand';
import { getDestination, findItem, findJob, findNpc, findBusiness, formatMoney, DEFAULT_DESTINATION } from '../content';
import type { DialogueOption } from '../content/types';
import { createWallet, credit, debit, makeId, type Wallet } from '../systems/economy';
import { addItem, emptyInventory, removeFromStack, type Inventory } from '../systems/inventory';
import {
  acceptJob as acceptJobFn,
  completedCount,
  deliverJob as deliverJobFn,
  emptyJobs,
  isAvailable,
  tickJob,
  type JobsState,
} from '../systems/jobs';
import { resolveEntry, type DialogueContext } from '../systems/dialogue';
import type { AvatarLook, Profile, SaveData, Settings } from '../persistence/types';
import { sanitizeLook } from '../core/avatarPresets';
import { runtime, resetRuntime } from '../core/runtime';
import { clearInput, input } from '../core/input';

export type Phase = 'boot' | 'title' | 'create' | 'loading' | 'playing';
export type UiMode = 'play' | 'dialogue' | 'shop' | 'phone' | 'pause' | 'wardrobe';
export type PhoneApp = 'home' | 'jobs' | 'bag' | 'wallet' | 'map' | 'profile' | 'settings';

export interface Toast {
  id: string;
  kind: 'money' | 'item' | 'info' | 'warn';
  title: string;
  detail?: string;
}

export interface Nearby {
  id: string;
  kind: 'npc';
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
};

interface GameState {
  phase: Phase;
  hasSave: boolean;
  profile: Profile | null;
  destinationId: string;
  wallet: Wallet;
  inventory: Inventory;
  jobs: JobsState;
  settings: Settings;
  playTimeMs: number;

  ui: UiMode;
  dialogue: { npcId: string; nodeId: string } | null;
  shopId: string | null;
  phoneApp: PhoneApp;
  nearby: Nearby | null;
  toasts: Toast[];
  /** Bumps when a persistent slice changes; the save manager listens to this. */
  dirty: number;
  /** Set when money/items/job outcomes change and must be written immediately. */
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

  // gameplay
  acceptJob(jobId: string): void;
  deliverJob(jobId: string): void;
  tick(dtMs: number): void;
  buy(businessId: string, itemId: string): boolean;
  consume(stackKey: string): void;
  updateSettings(patch: Partial<Settings>): void;
}

const pack = () => getDestination(useGame.getState().destinationId);

function setUiMode(ui: UiMode) {
  input.enabled = ui === 'play';
  if (ui !== 'play') clearInput();
}

export const useGame = create<GameState>((set, get) => ({
  phase: 'boot',
  hasSave: false,
  profile: null,
  destinationId: DEFAULT_DESTINATION,
  wallet: createWallet(0),
  inventory: emptyInventory(),
  jobs: emptyJobs(),
  settings: DEFAULT_SETTINGS,
  playTimeMs: 0,

  ui: 'play',
  dialogue: null,
  shopId: null,
  phoneApp: 'home',
  nearby: null,
  toasts: [],
  dirty: 0,
  critical: 0,

  setPhase: (phase) => set({ phase }),
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
      playTimeMs: 0,
      ui: 'play',
      dialogue: null,
      shopId: null,
      nearby: null,
      toasts: [],
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
      settings: { ...DEFAULT_SETTINGS, ...save.settings },
      playTimeMs: save.stats?.playTimeMs ?? 0,
      ui: 'play',
      dialogue: null,
      shopId: null,
      hasSave: true,
    });
    setUiMode('play');
  },

  resetAll() {
    set({
      phase: 'title',
      hasSave: false,
      profile: null,
      wallet: createWallet(0),
      inventory: emptyInventory(),
      jobs: emptyJobs(),
      ui: 'play',
      dialogue: null,
      shopId: null,
      toasts: [],
    });
  },

  setNearby(nearby) {
    const cur = get().nearby;
    if (cur?.id === nearby?.id) return;
    set({ nearby });
  },

  interact() {
    const { ui, nearby } = get();
    if (ui !== 'play' || !nearby) return;
    if (nearby.kind === 'npc') get().openDialogue(nearby.id);
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
      isDropoff: (id) => s.jobs.active?.jobId === id && findJob(p, id)?.dropoffNpcId === npcId,
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
    }
  },

  openShop(id) {
    set({ ui: 'shop', shopId: id, dialogue: null });
    setUiMode('shop');
  },

  openPhone(app = 'home') {
    if (get().ui === 'dialogue' || get().ui === 'shop') return;
    set({ ui: 'phone', phoneApp: app });
    setUiMode('phone');
  },

  setPhoneApp: (phoneApp) => set({ phoneApp }),

  togglePause() {
    const ui = get().ui;
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
    set({ ui: 'play', dialogue: null, shopId: null, phoneApp: 'home' });
    setUiMode('play');
  },

  pushToast(t) {
    const toast = { ...t, id: makeId('t') };
    set({ toasts: [...get().toasts.slice(-2), toast] });
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

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
    get().pushToast({ kind: 'info', title: `${job.title} started`, detail: `Take the ${job.cargo.toLowerCase()} to ${dropoff?.name}` });
  },

  deliverJob(jobId) {
    const p = pack();
    const job = findJob(p, jobId);
    const npc = job && findNpc(p, job.dropoffNpcId);
    if (!job || !npc) return;
    const live = runtime.actors.get(npc.id) ?? { x: npc.position[0], z: npc.position[1] };
    const distance = Math.hypot(runtime.player.x - live.x, runtime.player.z - live.z);
    const r = deliverJobFn(get().jobs, job, { now: Date.now(), distanceToDropoff: distance });
    if (!r.ok) {
      const msg: Record<string, string> = {
        'too-far': `Get closer to ${npc.name}`,
        expired: 'Too late — the food went cold',
        'no-job': 'No delivery in progress',
        'wrong-job': 'That is not for this person',
        'already-paid': 'Already delivered',
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
    if (pay.ok) {
      const secs = (r.payout.elapsedMs / 1000).toFixed(1);
      get().pushToast({
        kind: 'money',
        title: `+${formatMoney(p, r.payout.total)}`,
        detail: r.payout.bonus
          ? `Delivered in ${secs}s — includes ${formatMoney(p, r.payout.bonus)} speed bonus`
          : `Delivered in ${secs}s`,
      });
    }
  },

  tick(dtMs) {
    const s = get();
    if (s.phase !== 'playing') return;
    const paused = s.ui === 'pause';
    if (paused) return;
    const patch: Partial<GameState> = { playTimeMs: s.playTimeMs + dtMs };
    if (s.jobs.active) {
      const p = pack();
      const job = findJob(p, s.jobs.active.jobId);
      const r = tickJob(s.jobs, job, dtMs, Date.now());
      patch.jobs = r.state;
      if (r.failed) {
        patch.critical = s.critical + 1;
        set(patch);
        get().pushToast({ kind: 'warn', title: 'Delivery failed', detail: 'Time ran out. Talk to Mama Titi to try again.' });
        return;
      }
    }
    set(patch);
  },

  buy(businessId, itemId) {
    const p = pack();
    const biz = findBusiness(p, businessId);
    const stock = biz?.stock.find((s) => s.itemId === itemId);
    const item = findItem(p, itemId);
    if (!biz || !stock || !item) return false;
    const r = debit(get().wallet, { id: makeId('buy'), amount: stock.price, reason: `${item.name} · ${biz.name}`, at: Date.now(), destinationId: p.id });
    if (!r.ok) {
      get().pushToast({ kind: 'warn', title: 'Not enough money', detail: `You need ${formatMoney(p, stock.price - get().wallet.balance)} more` });
      return false;
    }
    const inventory = addItem(get().inventory, {
      itemId,
      category: item.category,
      quantity: 1,
      purchasePrice: stock.price,
      destinationId: p.id,
      at: Date.now(),
    });
    set({ wallet: r.wallet, inventory, critical: get().critical + 1 });
    get().pushToast({ kind: 'item', title: `${item.name} added to bag`, detail: `−${formatMoney(p, stock.price)}` });
    return true;
  },

  consume(stackKey) {
    const p = pack();
    const entry = get().inventory.entries.find((e) => e.key === stackKey);
    const item = entry && findItem(p, entry.itemId);
    if (!entry || !item?.consumable) return;
    const r = removeFromStack(get().inventory, stackKey, 1);
    if (!r.ok) return;
    set({ inventory: r.inventory, critical: get().critical + 1 });
    get().pushToast({ kind: 'info', title: item.category === 'drink' ? `You drank the ${item.name.toLowerCase()}` : `You ate the ${item.name.toLowerCase()}`, detail: 'Refreshed.' });
  },

  updateSettings(patch) {
    set({ settings: { ...get().settings, ...patch }, dirty: get().dirty + 1 });
  },
}));

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
    settings: s.settings,
    player: { position: [runtime.player.x, runtime.player.z] as [number, number], yaw: runtime.player.yaw },
    stats: { playTimeMs: s.playTimeMs },
  };
}
