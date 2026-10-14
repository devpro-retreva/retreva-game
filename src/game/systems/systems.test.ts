import { describe, expect, it } from 'vitest';
import { createWallet, credit, debit } from './economy';
import { addItem, countItem, emptyInventory, removeFromStack } from './inventory';
import { acceptJob, deliverJob, emptyJobs, isAvailable, tickJob, DELIVERY_RANGE } from './jobs';
import { resolveEntry } from './dialogue';
import { lagos } from '../content/destinations/lagos';
import { MemorySaveAdapter } from '../persistence/adapters';
import { SaveManager, migrate } from '../persistence/saveManager';
import { emptyWorld, SAVE_SCHEMA_VERSION } from '../persistence/types';
import { acceptAsk, makeOffer, savings, startHaggle } from './negotiation';
import { collectSpot } from './jobs';
import { GOALS, newlyCompleted } from './progress';
import { fareBetween, LAGOS_AREAS } from '../content/regions/lagosState';
import { ALL_PACKS } from '../content';
import { emptyInventory as emptyInv } from './inventory';
import { emptyLife, drainNeeds, eat, canRun, skillLevel, levelProgress, scoreShift, shiftOrders, orderSeconds, resaleValue, regardTier, addRegard, LEVELS } from './life';
import { DEFAULT_AVATAR, OPTIONS, defaultLookFor, sanitizeLook, switchGender, upgradeAvatarV1 } from '../core/avatarPresets';

const job = lagos.jobs[0];

describe('economy', () => {
  it('credits once per transaction id', () => {
    let w = createWallet(2000);
    const a = credit(w, { id: 'job:x:1', amount: 1500, reason: 'test', at: 0 });
    expect(a.ok).toBe(true);
    w = a.wallet;
    const b = credit(w, { id: 'job:x:1', amount: 1500, reason: 'test', at: 0 });
    expect(b.ok).toBe(false);
    expect(b.wallet.balance).toBe(3500);
  });

  it('refuses debits beyond balance and invalid amounts', () => {
    const w = createWallet(500);
    expect(debit(w, { id: 'b1', amount: 700, reason: '', at: 0 }).ok).toBe(false);
    expect(debit(w, { id: 'b2', amount: -5, reason: '', at: 0 }).ok).toBe(false);
    const ok = debit(w, { id: 'b3', amount: 300, reason: '', at: 0 });
    expect(ok.ok && ok.wallet.balance).toBe(200);
  });
});

describe('inventory', () => {
  it('stacks by item, destination and price, and removes safely', () => {
    let inv = emptyInventory();
    const base = { itemId: 'zobo', category: 'drink' as const, quantity: 1, purchasePrice: 500, destinationId: 'lagos', at: 1 };
    inv = addItem(inv, base);
    inv = addItem(inv, base);
    inv = addItem(inv, { ...base, purchasePrice: 400 });
    expect(inv.entries).toHaveLength(2);
    expect(countItem(inv, 'zobo')).toBe(3);
    const key = inv.entries[0].key;
    const r = removeFromStack(inv, key, 2);
    expect(r.ok).toBe(true);
    expect(r.inventory.entries).toHaveLength(1);
    expect(removeFromStack(r.inventory, key, 1).ok).toBe(false);
  });
});

describe('jobs', () => {
  it('pays base + bonus on a fast, in-range delivery and then cools down', () => {
    let s = acceptJob(emptyJobs(), job, 0, 'run-1');
    expect(s.ok).toBe(true);
    s = { ok: true, state: tickJob(s.state, job, 10_000, 10).state };
    const d = deliverJob(s.state, job, { now: 100, distanceToDropoff: 1 });
    expect(d.ok).toBe(true);
    if (!d.ok) return;
    expect(d.payout.total).toBe(job.reward + job.bonus.amount);
    expect(d.payout.txId).toBe('job:jollof-run:run-1');
    expect(isAvailable(d.state, job, 100)).toBe(false);
    expect(isAvailable(d.state, job, 100 + job.cooldownMs)).toBe(true);
    // second delivery attempt on the same state is rejected
    expect(deliverJob(d.state, job, { now: 101, distanceToDropoff: 1 }).ok).toBe(false);
  });

  it('pays no bonus when slow', () => {
    const a = acceptJob(emptyJobs(), job, 0, 'run-2');
    const t = tickJob(a.state, job, job.bonus.underMs + 1000, 0).state;
    const d = deliverJob(t, job, { now: 0, distanceToDropoff: 1 });
    expect(d.ok && d.payout.bonus).toBe(0);
  });

  it('rejects out-of-range delivery and fails when time runs out', () => {
    const a = acceptJob(emptyJobs(), job, 0, 'run-3');
    expect(deliverJob(a.state, job, { now: 0, distanceToDropoff: DELIVERY_RANGE + 0.1 }).ok).toBe(false);
    const t = tickJob(a.state, job, job.timeLimitMs, 0);
    expect(t.failed?.outcome).toBe('failed');
    expect(t.state.active).toBeNull();
    expect(isAvailable(t.state, job, 0)).toBe(true);
  });

  it('end-to-end: replaying a delivery against the wallet never double-pays', () => {
    let wallet = createWallet(2000);
    const a = acceptJob(emptyJobs(), job, 0, 'run-4');
    const d = deliverJob(a.state, job, { now: 0, distanceToDropoff: 1 });
    if (!d.ok) throw new Error('delivery should succeed');
    for (let i = 0; i < 5; i++) {
      wallet = credit(wallet, { id: d.payout.txId, amount: d.payout.total, reason: 'job', at: 0 }).wallet;
    }
    expect(wallet.balance).toBe(2000 + d.payout.total);
  });
});

describe('dialogue', () => {
  it('Mama Titi offers the job when available and nags when active', () => {
    const npc = lagos.npcs.find((n) => n.id === 'mama-titi')!;
    const base = { jobAvailable: () => true, jobActive: () => false, isDropoff: () => false, jobCompletedBefore: () => false };
    expect(resolveEntry(npc.dialogue, base)).toBe('offer');
    expect(resolveEntry(npc.dialogue, { ...base, jobActive: () => true, jobAvailable: () => false })).toBe('waiting');
    expect(resolveEntry(npc.dialogue, { ...base, jobAvailable: () => false })).toBe('cooldown');
  });

  it('every dialogue goto points at a real node', () => {
    for (const npc of lagos.npcs) {
      for (const node of Object.values(npc.dialogue.nodes)) {
        for (const o of node.options) {
          if (o.action.kind === 'goto') expect(npc.dialogue.nodes[o.action.node]).toBeDefined();
        }
      }
      for (const e of npc.dialogue.entries) expect(npc.dialogue.nodes[e.node]).toBeDefined();
    }
  });
});

describe('content integrity', () => {
  it('shop stock and jobs reference real items and NPCs', () => {
    for (const b of lagos.businesses) {
      for (const s of b.stock) expect(lagos.items.find((i) => i.id === s.itemId)).toBeDefined();
    }
    for (const j of lagos.jobs) {
      expect(lagos.npcs.find((n) => n.id === j.giverNpcId)).toBeDefined();
      expect(lagos.npcs.find((n) => n.id === j.dropoffNpcId)).toBeDefined();
    }
  });
});

describe('persistence', () => {
  it('saves, increments revision and reloads', async () => {
    const adapter = new MemorySaveAdapter();
    let balance = 2000;
    const snap = () => ({
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi',
      wallet: { balance, ledger: [] },
      inventory: { entries: [] },
      jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'),
      life: emptyLife(),
      settings: { cameraSensitivity: 1, invertY: false, reducedMotion: false, textScale: 1 as const, shadows: 'auto' as const, showFps: false, tips: true },
      player: { position: [1, 2] as [number, number], yaw: 0 },
      stats: { playTimeMs: 0 },
    });
    const m = new SaveManager(adapter, snap, 'dev-test');
    await m.saveNow();
    balance = 3500;
    await Promise.all([m.saveNow(), m.saveNow()]);
    const reloaded = await new SaveManager(adapter, snap).load();
    expect(reloaded?.wallet.balance).toBe(3500);
    expect(reloaded?.revision).toBe(3);
    expect(reloaded?.deviceId).toBe('dev-test');
  });

  it('rejects corrupt or future-version saves', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate({ schemaVersion: 99 })).toBeNull();
    expect(migrate({ schemaVersion: 1, profile: {} })).toBeNull();
  });
});

import { buildCollisionWorld, isBlocked, resolveMove, segmentHit } from './collision';

describe('collision', () => {
  const w = buildCollisionWorld(lagos);
  it('spawn point is walkable and every NPC can be reached', () => {
    expect(isBlocked(w, lagos.spawn.position[0], lagos.spawn.position[1])).toBe(false);
    for (const n of lagos.npcs) {
      // a spot 1.2m toward the road from each NPC must be free
      const dir = n.position[0] > 0 ? -1 : 1;
      expect(isBlocked(w, n.position[0] + dir * 1.2, n.position[1])).toBe(false);
    }
  });
  it('blocks walking into buildings but slides along them', () => {
    const r = resolveMove(w, 6.0, 0, 9.0, 0.5);
    expect(r.x).toBeLessThan(7);
    expect(r.z).toBeCloseTo(0.5);
  });
  it('camera ray is shortened by walls', () => {
    expect(segmentHit(w, 0, 1.5, 0, 14, 3, 0)).toBeLessThan(0.6);
    expect(segmentHit(w, 0, 1.5, 0, 0, 3, 5)).toBe(1);
  });
});

describe('collision sliding', () => {
  const w = buildCollisionWorld(lagos);
  it('walking straight into a street tree slides around it instead of sticking', () => {
    // tree-2 sits at (6.2, 21); approach from the south along its centre line
    let x = 6.2;
    let z = 23.5;
    for (let i = 0; i < 120; i++) {
      const r = resolveMove(w, x, z, x, z - 0.05);
      x = r.x;
      z = r.z;
    }
    expect(z).toBeLessThan(20);
  });
});

describe('avatar options', () => {
  it('gender defaults only use options offered for that gender', () => {
    for (const g of ['male', 'female'] as const) {
      const d = defaultLookFor(g);
      const o = OPTIONS[g];
      expect(o.hair.some((x) => x.id === d.hair)).toBe(true);
      expect(o.outfit.some((x) => x.id === d.outfit)).toBe(true);
      expect(o.headwear.some((x) => x.id === d.headwear)).toBe(true);
      expect(o.accessory.some((x) => x.id === d.accessory)).toBe(true);
    }
  });

  it('switching gender resets gender-specific choices but keeps skin, colours and build', () => {
    const male = { ...defaultLookFor('male'), skin: '#3a2216', facialHair: 'beard' as const, hair: 'locs' as const, build: 'broad' as const, top: '#7a3b72' };
    const female = switchGender(male, 'female');
    expect(female.gender).toBe('female');
    expect(female.facialHair).toBe('none');
    expect(OPTIONS.female.hair.some((h) => h.id === female.hair)).toBe(true);
    expect(female.skin).toBe('#3a2216');
    expect(female.build).toBe('broad');
    expect(female.top).toBe('#7a3b72');
  });

  it('sanitizeLook rejects options from the other gender', () => {
    const bad = sanitizeLook({ ...defaultLookFor('female'), facialHair: 'beard', outfit: 'kaftan', headwear: 'kufi' });
    expect(bad.facialHair).toBe('none');
    expect(bad.outfit).toBe('dress');
    expect(bad.headwear).toBe('none');
  });

  it('upgrades a schema-1 avatar and keeps its colours', () => {
    const v1 = { skin: '#6b4026', top: '#1d7f86', bottom: '#e9dcc0', headwear: 'gele', headColor: '#d8452b', build: 'slim' };
    const up = upgradeAvatarV1(v1);
    expect(up.gender).toBe('female');
    expect(up.headwear).toBe('gele');
    expect(up.top).toBe('#1d7f86');
    expect(up.build).toBe('slim');
    expect(upgradeAvatarV1({ ...v1, headwear: 'kufi' }).gender).toBe('male');
  });

  it('migrate() upgrades a whole schema-1 save to the current version', () => {
    const v1 = {
      schemaVersion: 1, revision: 4, updatedAt: 0, deviceId: 'd',
      profile: { name: 'Ade', createdAt: 0, avatar: { skin: '#000', top: '#111', bottom: '#222', headwear: 'cap', headColor: '#fff', build: 'regular' } },
      destinationId: 'lagos-adeniyi', wallet: { balance: 900, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 0 },
    };
    const m = migrate(v1);
    expect(m?.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(m?.world.visited).toEqual(['lagos-adeniyi']);
    expect(m?.profile.avatar.gender).toBe('male');
    expect(m?.profile.avatar.headwear).toBe('cap');
    expect(m?.wallet.balance).toBe(900);
  });
});

describe('negotiation', () => {
  const fixed = () => 0; // no floor wobble
  it('a fair offer gets a counter, then a deal below list price', () => {
    let h = startHaggle('ankara-6yd', 9000, { floor: 0.68, patience: 3 }, fixed);
    expect(h.floorPrice).toBe(6100);
    h = makeOffer(h, 6500);
    expect(h.status).toBe('open');
    expect(h.ask).toBeLessThan(9000);
    h = makeOffer(h, 7200);
    expect(h.status).toBe('deal');
    expect(h.dealPrice).toBeLessThan(9000);
    expect(savings(h)).toBeGreaterThan(0.15);
  });
  it('never sells below the floor', () => {
    let h = startHaggle('x', 10000, { floor: 0.7, patience: 5 }, fixed);
    for (let i = 0; i < 6 && h.status === 'open'; i++) h = makeOffer(h, 5000);
    expect(h.ask).toBeGreaterThanOrEqual(h.floorPrice);
    expect(h.status === 'final' || h.status === 'open').toBe(true);
    h = acceptAsk(h);
    expect(h.dealPrice).toBeGreaterThanOrEqual(7000);
  });
  it('insulting offers burn patience twice as fast and end in a final price', () => {
    let h = startHaggle('x', 10000, { floor: 0.7, patience: 3 }, fixed);
    h = makeOffer(h, 1000);
    expect(h.mood).toBe('insulted');
    h = makeOffer(h, 1000);
    expect(h.status).toBe('final');
  });
  it('offering the asking price is an instant deal', () => {
    const h = makeOffer(startHaggle('x', 4000, { floor: 0.7, patience: 3 }, fixed), 4000);
    expect(h.status).toBe('deal');
    expect(h.dealPrice).toBe(4000);
  });
});

describe('collect jobs', () => {
  const lekki = ALL_PACKS.find((p) => p.id === 'lekki-beach')!;
  const job = lekki.jobs.find((j) => j.id === 'beach-cleanup')!;
  it('requires the full count before reporting, and ignores duplicates', () => {
    let st = acceptJob(emptyJobs(), job, 0, 'r1').state;
    expect(deliverJob(st, job, { now: 0, distanceToDropoff: 1 }).ok).toBe(false);
    st = collectSpot(st, job, 0)!;
    expect(collectSpot(st, job, 0)).toBeNull();
    for (let i = 1; i < 6; i++) st = collectSpot(st, job, i)!;
    expect(collectSpot(st, job, 7)).toBeNull(); // already at count
    const d = deliverJob(st, job, { now: 0, distanceToDropoff: 1 });
    expect(d.ok).toBe(true);
  });
});

describe('Lagos travel', () => {
  it('every region area has a pack, an arrival point and at least one job and landmark', () => {
    for (const a of LAGOS_AREAS) {
      const p = ALL_PACKS.find((x) => x.id === a.id);
      expect(p, a.id).toBeDefined();
      expect(p!.jobs.length).toBeGreaterThan(0);
      expect(p!.landmarks.length).toBeGreaterThan(0);
      const w = buildCollisionWorld(p!);
      expect(isBlocked(w, p!.arrival.position[0], p!.arrival.position[1]), `${a.id} arrival`).toBe(false);
    }
  });
  it('fares are symmetric, positive and rounded to ₦50', () => {
    for (const a of LAGOS_AREAS) for (const b of LAGOS_AREAS) {
      if (a.id === b.id) continue;
      const f = fareBetween(a.id, b.id);
      expect(f).toBe(fareBetween(b.id, a.id));
      expect(f % 50).toBe(0);
      expect(f).toBeGreaterThan(200);
      expect(f).toBeLessThan(1500);
    }
  });
  it('every NPC in every area can be reached and every job references real NPCs', () => {
    for (const p of ALL_PACKS) {
      const w = buildCollisionWorld(p);
      for (const n of p.npcs) {
        const dir = n.position[0] > 0 ? -1 : 1;
        expect(isBlocked(w, n.position[0] + dir * 1.2, n.position[1]), `${p.id}/${n.id}`).toBe(false);
      }
      for (const j of p.jobs) {
        expect(p.npcs.find((n) => n.id === j.giverNpcId), j.id).toBeDefined();
        expect(p.npcs.find((n) => n.id === j.dropoffNpcId), j.id).toBeDefined();
        for (const s of j.collect?.spots ?? []) expect(isBlocked(w, s[0], s[1]), `${j.id} spot ${s}`).toBe(false);
      }
      for (const b of p.businesses) for (const st of b.stock) expect(p.items.find((i) => i.id === st.itemId), st.itemId).toBeDefined();
      for (const n of p.npcs) {
        for (const node of Object.values(n.dialogue.nodes)) for (const o of node.options) {
          if (o.action.kind === 'goto') expect(n.dialogue.nodes[o.action.node]).toBeDefined();
          if (o.action.kind === 'openShop') { const id = o.action.businessId; expect(p.businesses.find((b) => b.id === id), id).toBeDefined(); }
        }
      }
    }
  });
});

describe('goals', () => {
  const snap = (over: Partial<Parameters<typeof newlyCompleted>[0]> = {}) => ({
    jobs: emptyJobs(), jobArea: () => undefined, visited: ['lagos-adeniyi'], discovered: [], inventory: emptyInv(), bestBargain: 0, rides: 0, totalAreas: 4, ...over,
  });
  it('nothing is complete at the start', () => {
    expect(newlyCompleted(snap(), [])).toHaveLength(0);
  });
  it('explorer completes once every area is visited, and is not repeated', () => {
    const s = snap({ visited: ['a', 'b', 'c', 'd'], rides: 3 });
    const ids = newlyCompleted(s, []).map((g) => g.id);
    expect(ids).toContain('explorer');
    expect(ids).toContain('first-ride');
    expect(newlyCompleted(s, ids)).toHaveLength(0);
  });
  it('goal rewards pay once through the ledger', () => {
    let w = createWallet(0);
    const g = GOALS[0];
    for (let i = 0; i < 3; i++) w = credit(w, { id: `goal:${g.id}`, amount: g.reward, reason: '', at: 0 }).wallet;
    expect(w.balance).toBe(g.reward);
  });
});


describe('daily life', () => {
  const shift = lagos.shifts![0];
  it('needs drain with effort, faster when starving, and never leave 0–100', () => {
    const n = { energy: 50, fullness: 50 };
    const idle = drainNeeds(n, 60000, 'idle');
    const run = drainNeeds(n, 60000, 'run');
    expect(run.energy).toBeLessThan(idle.energy);
    expect(idle.fullness).toBeCloseTo(49, 5);
    const starving = drainNeeds({ energy: 50, fullness: 0 }, 60000, 'walk');
    expect(50 - starving.energy).toBeCloseTo(2 * (50 - drainNeeds(n, 60000, 'walk').energy), 5);
    expect(drainNeeds({ energy: 0.1, fullness: 0 }, 600000, 'run')).toEqual({ energy: 0, fullness: 0 });
    expect(eat({ energy: 10, fullness: 90 }, 55).fullness).toBe(100);
  });
  it('exhaustion stops running but never stops walking', () => {
    expect(canRun({ energy: 14, fullness: 50 })).toBe(false);
    expect(canRun({ energy: 15, fullness: 50 })).toBe(true);
  });
  it('skill levels follow the XP table', () => {
    expect(skillLevel(0)).toBe(1);
    expect(skillLevel(LEVELS[1])).toBe(2);
    expect(skillLevel(99999)).toBe(LEVELS.length);
    expect(levelProgress(LEVELS[1] / 2)).toBeCloseTo(0.5, 5);
  });
  it('shift orders are deterministic per seed and only use menu dishes', () => {
    const a = shiftOrders(shift, 42);
    expect(a).toEqual(shiftOrders(shift, 42));
    expect(a).toHaveLength(shift.orders);
    expect(a.every((d) => shift.dishes.some((x) => x.id === d))).toBe(true);
    expect(orderSeconds(shift, 3)).toBeCloseTo(shift.seconds + 2 * shift.perLevel, 5);
  });
  it('shift pay rewards accuracy and skill; a perfect shift tips', () => {
    const perfect = scoreShift(shift, Array(shift.orders).fill('served'), 1);
    expect(perfect.pay).toBe(shift.orders * shift.payPerOrder);
    expect(perfect.tip).toBe(shift.perfectTip);
    const half = scoreShift(shift, [...Array(4).fill('served'), ...Array(4).fill('missed')], 1);
    expect(half.pay).toBe(4 * shift.payPerOrder);
    expect(half.tip).toBe(0);
    expect(scoreShift(shift, Array(shift.orders).fill('served'), 3).pay).toBeGreaterThan(perfect.pay);
    expect(scoreShift(shift, Array(shift.orders).fill('wrong'), 1).pay).toBe(0);
  });
  it('resale is half price rounded down to ₦50; food is not resold', () => {
    expect(resaleValue(3500, 'bag')).toBe(1750);
    expect(resaleValue(1199, 'souvenir')).toBe(550);
    expect(resaleValue(2500, 'food')).toBe(0);
  });
  it('regard tiers and caps', () => {
    expect(regardTier(0)).toBe('Stranger');
    expect(regardTier(35)).toBe('Friend');
    expect(addRegard({ x: 98 }, 'x', 10).x).toBe(100);
  });
  it('v3 saves upgrade to v4 with rested defaults and keep everything else', () => {
    const v3 = {
      schemaVersion: 3, revision: 5, updatedAt: 1, deviceId: 'd',
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-island', wallet: { balance: 4321, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'), settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 9 },
    };
    const up = migrate(v3)!;
    expect(up.schemaVersion).toBe(4);
    expect(up.wallet.balance).toBe(4321);
    expect(up.destinationId).toBe('lagos-island');
    expect(up.life).toEqual(emptyLife());
    const v4 = migrate({ ...up, life: { needs: { energy: 500, fullness: -3 }, skills: { cooking: 90 }, regard: { 'mama-titi': 12 }, home: 'yaba-room', shiftsDone: 2 } })!;
    expect(v4.life.needs).toEqual({ energy: 100, fullness: 0 });
    expect(v4.life.home).toBe('yaba-room');
    expect(v4.life.skills.cooking).toBe(90);
  });
  it('every shift, spot and home in every pack is valid', () => {
    for (const p of ALL_PACKS) {
      const w = buildCollisionWorld(p);
      for (const sh of p.shifts ?? []) expect(p.npcs.find((n) => n.id === sh.npcId), sh.id).toBeDefined();
      for (const sp of p.spots ?? []) {
        expect(isBlocked(w, sp.position[0], sp.position[1]), sp.id).toBe(false);
        if (sp.kind === 'home') expect(p.homes?.find((h) => h.id === sp.homeId), sp.id).toBeDefined();
      }
      for (const n of p.npcs) for (const node of Object.values(n.dialogue.nodes)) for (const o of node.options)
        if (o.action.kind === 'startShift') { const id = o.action.shiftId; expect(p.shifts?.find((x) => x.id === id), id).toBeDefined(); }
    }
  });
});
