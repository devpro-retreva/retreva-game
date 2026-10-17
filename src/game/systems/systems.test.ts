import { describe, expect, it } from 'vitest';
import { createWallet, credit, debit } from './economy';
import { addItem, countItem, emptyInventory, removeFromStack } from './inventory';
import { acceptJob, deliverJob, emptyJobs, isAvailable, tickJob, DELIVERY_RANGE } from './jobs';
import { resolveEntry } from './dialogue';
import { lagos } from '../content/destinations/lagos';
import { MemorySaveAdapter } from '../persistence/adapters';
import { BACKUP_SLOT, MAIN_SLOT, QUARANTINE_SLOT, SaveManager, migrate } from '../persistence/saveManager';
import { emptyWorld, SAVE_SCHEMA_VERSION } from '../persistence/types';
import { acceptAsk, makeOffer, savings, startHaggle } from './negotiation';
import { collectSpot } from './jobs';
import { GOALS, newlyCompleted } from './progress';
import { ALL_AREAS, boatsFrom, cablesFrom, coachesFrom, COACHES, fareBetween, findArea, LAGOS_AREAS, minutesBetween, modeBetween, regionOf, REGIONS, routeBetween } from '../content/regions';
import { FLIGHTS, findFlight, flightText, isRail, nextDeparture } from '../content/flights';
import { CHAT_COOLDOWN_MS, CHAT_GAIN, chat, chatReady, friendDiscount, friendPrice, giveGift, GIFT_LIKED, GIFT_OK, tierUp } from './social';
import { addVehicle, canMount, mount, park, removeVehicle, vehicleResale } from './vehicles';
import { VEHICLES, findVehicle } from '../content/vehicles';
import { advance, afterSleep, dayOf, daylight, formatClock, isOpen, phaseOf, START_TIME } from './clock';
import { npcPresent, progressSnapshot } from '../store/gameStore';
import { benchLabels, repairQueue, scoreRepair, shuffledSteps, tapStep } from './repair';
import { meets as meetsReq } from './requirements';
import { courierRank, rankBonus } from './careers';
import { findFurniture, findInterior, INTERIORS, WELL_RESTED_COMFORT } from '../content/interiors';
import { belongings, comfort, emptyProperty, fits, homeValuation, place, store, take, unplace } from './home';
import { buildInteriorWorld, interiorPieces } from './collision';
import { cheer } from './life';
import { benchText, summarize } from '../core/benchmark';
import { gatePrice, nextShowing, onNow, showsOn, ticketState, ticketTxId } from './events';
import { visitStop } from './jobs';
import { lagosIsland } from '../content/destinations/lagosIsland';
import { ikeja } from '../content/destinations/ikeja';
import { bookFlight, canBoard, checkIn, clearSecurity, completeFlight, emptyTravel, liquidsIn, tripBudget } from './travel';
import { ALL_PACKS, localPrice as localPriceOf, registerPacks } from '../content';
import { ACCRA_PACKS } from '../content/destinations/accraPack';
import { DUBAI_PACKS } from '../content/destinations/dubaiPack';
import { ABUJA_PACKS } from '../content/destinations/abujaPack';
import { CALABAR_PACKS } from '../content/destinations/calabarPack';
import { IBADAN_PACKS } from '../content/destinations/ibadanPack';
import { ABEOKUTA_PACKS } from '../content/destinations/abeokutaPack';
import { OSOGBO_PACKS } from '../content/destinations/osogboPack';
import { BENIN_PACKS } from '../content/destinations/beninPack';
import { ENUGU_PACKS } from '../content/destinations/enuguPack';
import { PORT_HARCOURT_PACKS } from '../content/destinations/portHarcourtPack';
import { JOS_PACKS } from '../content/destinations/josPack';
import { KANO_PACKS } from '../content/destinations/kanoPack';
import { YANKARI_PACKS } from '../content/destinations/yankariPack';
import { OBUDU_PACKS } from '../content/destinations/obuduPack';
import { CITY_PACKS, cityAreas, citiesInSave } from '../content/cities';
import { distanceToTrack, heightAlong, poseAlong, ridePose, ridePose3, rideSeconds, sightingsBetween, trackLength } from './drive';
import type { Vec2 } from '../content/types';
// content checks cover every city pack, so register the ones that normally load on demand
registerPacks(ACCRA_PACKS);
registerPacks(DUBAI_PACKS);
registerPacks(ABUJA_PACKS);
registerPacks(CALABAR_PACKS);
registerPacks(IBADAN_PACKS);
registerPacks(ABEOKUTA_PACKS);
registerPacks(OSOGBO_PACKS);
registerPacks(BENIN_PACKS);
registerPacks(ENUGU_PACKS);
registerPacks(PORT_HARCOURT_PACKS);
registerPacks(JOS_PACKS);
registerPacks(KANO_PACKS);
registerPacks(YANKARI_PACKS);
registerPacks(OBUDU_PACKS);
import { emptyInventory as emptyInv } from './inventory';
import { emptyLife, shiftLabels, drainNeeds, eat, canRun, skillLevel, levelProgress, scoreShift, shiftOrders, orderSeconds, resaleValue, regardTier, addRegard, LEVELS } from './life';
import { TIERS, resolveTier } from '../core/quality';
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
    const base = { jobAvailable: () => true, jobActive: () => false, isDropoff: () => false, jobCompletedBefore: () => false, tripStage: () => 'none' as const, carryingLiquids: () => false };
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
      travel: emptyTravel(),
      settings: { cameraSensitivity: 1, invertY: false, reducedMotion: false, textScale: 1 as const, shadows: 'auto' as const, graphics: 'auto' as const, showFps: false, tips: true },
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

  it('keeps a backup, restores it when the main save is unreadable, and never overwrites the unreadable copy', async () => {
    const adapter = new MemorySaveAdapter();
    let balance = 2000;
    const snap = () => ({
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi', wallet: { balance, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'), life: emptyLife(), travel: emptyTravel(),
      settings: { cameraSensitivity: 1, invertY: false, reducedMotion: false, textScale: 1 as const, shadows: 'auto' as const, graphics: 'auto' as const, showFps: false, tips: true },
      player: { position: [1, 2] as [number, number], yaw: 0 }, stats: { playTimeMs: 0 },
    });
    const m = new SaveManager(adapter, snap);
    await m.saveNow(); // first save also writes the backup
    expect(adapter.store.has(BACKUP_SLOT)).toBe(true);
    // the main save gets corrupted (e.g. written by a newer version)
    adapter.store.set(MAIN_SLOT, JSON.stringify({ schemaVersion: 99, junk: true }));
    const m2 = new SaveManager(adapter, snap);
    const loaded = await m2.load();
    expect(loaded?.wallet.balance).toBe(2000);
    expect(m2.notice?.kind).toBe('restored-backup');
    expect(JSON.parse(adapter.store.get(QUARANTINE_SLOT)!).schemaVersion).toBe(99);
    // no backup at all: nothing loads, the unreadable save is kept, and saving a new game leaves the copy alone
    const lonely = new MemorySaveAdapter();
    lonely.store.set(MAIN_SLOT, '{"schemaVersion":99}');
    const m3 = new SaveManager(lonely, snap);
    expect(await m3.load()).toBeNull();
    expect(m3.notice?.kind).toBe('unreadable-kept');
    balance = 50;
    await m3.saveNow();
    expect(JSON.parse(lonely.store.get(QUARANTINE_SLOT)!).schemaVersion).toBe(99);
  });

  it('exports and imports a save file; import validates and keeps the replaced game as the backup', async () => {
    const adapter = new MemorySaveAdapter();
    let balance = 1234;
    const snap = () => ({
      profile: { name: 'Bimpe', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lekki-beach', wallet: { balance, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'), life: emptyLife(), travel: emptyTravel(),
      settings: { cameraSensitivity: 1, invertY: false, reducedMotion: false, textScale: 1 as const, shadows: 'auto' as const, graphics: 'auto' as const, showFps: false, tips: true },
      player: { position: [0, 0] as [number, number], yaw: 0 }, stats: { playTimeMs: 5 },
    });
    const m = new SaveManager(adapter, snap);
    const file = (await m.exportJson())!;
    expect(JSON.parse(file).wallet.balance).toBe(1234);
    balance = 99;
    await m.saveNow();
    const restored = await m.importJson(file);
    expect(restored.wallet.balance).toBe(1234);
    expect(restored.revision).toBeGreaterThan(JSON.parse(file).revision);
    expect(JSON.parse(adapter.store.get(BACKUP_SLOT)!).wallet.balance).toBe(99);
    await expect(m.importJson('not json')).rejects.toThrow('isn’t a Retreva save');
    await expect(m.importJson(JSON.stringify({ schemaVersion: 99, profile: {}, wallet: { balance: 1, ledger: [] }, inventory: {}, jobs: {} }))).rejects.toThrow('newer version');
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
    for (const a of ALL_AREAS) {
      const p = ALL_PACKS.find((x) => x.id === a.id);
      expect(p, a.id).toBeDefined();
      expect(p!.jobs.length).toBeGreaterThan(0);
      expect(p!.landmarks.length).toBeGreaterThan(0);
      const w = buildCollisionWorld(p!);
      expect(isBlocked(w, p!.arrival.position[0], p!.arrival.position[1]), `${a.id} arrival`).toBe(false);
    }
  });
  it('every pair of areas in a region has a listed, symmetric fare and time; danfo fares are real-world sized', () => {
    for (const r of REGIONS) for (const a of r.areas) for (const b of r.areas) {
      if (a.id === b.id) continue;
      expect(routeBetween(a.id, b.id), `${a.id} ↔ ${b.id} priced`).toBeDefined();
      expect(fareBetween(a.id, b.id)).toBe(fareBetween(b.id, a.id));
      expect(minutesBetween(a.id, b.id)).toBe(minutesBetween(b.id, a.id));
      expect(fareBetween(a.id, b.id) % 50).toBe(0);
    }
    const streets = LAGOS_AREAS.filter((a) => !a.hub);
    for (const a of streets) for (const b of streets) {
      if (a.id === b.id) continue;
      // a short hop is ₦300–500, the longest cross-town trip a few thousand
      expect(fareBetween(a.id, b.id)).toBeGreaterThanOrEqual(300);
      expect(fareBetween(a.id, b.id)).toBeLessThanOrEqual(3000);
    }
    expect(fareBetween('lagos-adeniyi', 'lagos-island')).toBeLessThan(fareBetween('lagos-adeniyi', 'badagry-marina'));
  });
  it('boats only run between areas with a jetty: a landing spot and a dock on each end', () => {
    for (const r of REGIONS) for (const route of r.boats ?? []) {
      for (const id of route.between) {
        const p = ALL_PACKS.find((x) => x.id === id)!;
        expect(p.dock, `${id} dock`).toBeDefined();
        expect(findArea(id)?.dock, `${id} map dock`).toBeDefined();
        expect((p.spots ?? []).some((s) => s.kind === 'jetty'), `${id} jetty spot`).toBe(true);
        expect(isBlocked(buildCollisionWorld(p), p.dock!.position[0], p.dock!.position[1]), `${id} dock clear`).toBe(false);
      }
    }
    // and you can actually walk there: step from the waterfront out to the end of each jetty
    for (const id of ['badagry-marina', 'lekki-beach']) {
      const p = ALL_PACKS.find((x) => x.id === id)!;
      const w = buildCollisionWorld(p);
      let x = 7.4;
      const z = p.dock!.position[1];
      for (let i = 0; i < 80; i++) x = resolveMove(w, x, z, x + 0.1, z).x;
      expect(x, `${id}: walked out to x=${x.toFixed(2)}`).toBeGreaterThan(14);
    }
    expect(boatsFrom('badagry-marina').map((a) => a.id)).toEqual(['lekki-beach']);
    expect(boatsFrom('lekki-beach').map((a) => a.id)).toEqual(['badagry-marina']);
    expect(boatsFrom('lagos-adeniyi')).toEqual([]);
    expect(fareBetween('badagry-marina', 'lekki-beach', 'boat')).toBe(3000);
    expect(fareBetween('lagos-adeniyi', 'lekki-beach', 'boat')).toBe(0);
    expect(modeBetween('badagry-marina', 'lekki-beach', 'boat')).toBe('Ferry');
    // the boat beats the road through Mile 2 and CMS
    expect(minutesBetween('badagry-marina', 'lekki-beach', 'boat')).toBeLessThan(minutesBetween('badagry-marina', 'lekki-beach'));
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

describe('regions and taxis', () => {
  it('taxis serve the airports and cost more than the danfo; no fare across regions', () => {
    const yabaIkeja = fareBetween('lagos-adeniyi', 'ikeja-village');
    const yabaAirport = fareBetween('lagos-adeniyi', 'lagos-airport');
    expect(modeBetween('lagos-adeniyi', 'ikeja-village')).toBe('Danfo');
    expect(modeBetween('lagos-adeniyi', 'lagos-airport')).toBe('Taxi');
    expect(yabaAirport).toBeGreaterThan(yabaIkeja);
    expect(yabaAirport % 50).toBe(0);
    expect(fareBetween('accra-osu', 'accra-airport')).toBeGreaterThan(0);
    expect(fareBetween('lagos-adeniyi', 'accra-osu')).toBe(0);
    expect(regionOf('accra-osu')?.country).toBe('Ghana');
    // every city can be reached: through an airport, a railway station, or a motor park on the intercity bus network
    for (const r of REGIONS) expect(r.areas.some((a) => !!a.hub || coachesFrom(a.id).length > 0), r.id).toBe(true);
    for (const r of REGIONS) expect(r.areas.filter((a) => a.hub === 'airport').length).toBeLessThanOrEqual(1);
  });
  it('every flight connects two airports (every train two stations) and arrives in a real area of the destination region', () => {
    for (const f of FLIGHTS) {
      const hub = f.mode === 'rail' ? 'station' : 'airport';
      expect(ALL_AREAS.find((a) => a.id === f.from)?.hub, f.id).toBe(hub);
      expect(ALL_AREAS.find((a) => a.id === f.to)?.hub, f.id).toBe(hub);
      expect(regionOf(f.arriveAt), f.id).toBe(regionOf(f.to));
      expect(findFlight(f.returnId)?.from, f.id).toBe(f.to);
      // airlines discount a return; the railway sells two singles
      if (f.mode === 'rail') expect(f.roundTrip).toBe(f.ticket * 2);
      else expect(f.roundTrip).toBeLessThan(f.ticket * 2);
      expect(ALL_PACKS.find((p) => p.id === f.arriveAt), f.arriveAt).toBeDefined();
    }
  });
});

describe('flying abroad', () => {
  const out = findFlight('los-acc')!;
  it('trip budget lists taxi, ticket, stay and getting around; only the ticket is due now', () => {
    const b = tripBudget(out, { taxiToAirport: 2300, roundTrip: true, hasStay: false });
    expect(b.lines.map((l) => l.key)).toEqual(['taxi', 'ticket', 'stay', 'around']);
    expect(b.dueNow).toBe(out.roundTrip);
    expect(b.total).toBe(2300 + out.roundTrip + out.budget.stay.cost + out.budget.gettingAround);
    const there = tripBudget(out, { taxiToAirport: 0, roundTrip: false, hasStay: true });
    expect(there.lines.map((l) => l.key)).toEqual(['ticket', 'stay', 'around']);
    expect(there.lines.find((l) => l.key === 'stay')!.amount).toBe(0);
    expect(there.dueNow).toBe(out.ticket);
  });
  it('airport steps run in order: check-in, security, gate — no skipping, no repeats', () => {
    let t = emptyTravel();
    expect(checkIn(t, undefined, 'lagos-airport').ok).toBe(false);
    const booked = bookFlight(t, out, true, 'T1', 0);
    expect(booked.ok).toBe(true);
    if (!booked.ok) return;
    t = booked.state;
    expect(bookFlight(t, out, false, 'T2', 0).ok).toBe(false); // one ticket at a time
    expect(clearSecurity(t).ok).toBe(false); // security before check-in
    expect(canBoard(t, out, 'lagos-airport')).toBe('not-checked-in');
    const wrong = checkIn(t, out, 'accra-airport');
    expect(wrong.ok || wrong.reason).toBe('wrong-airport');
    const ci = checkIn(t, out, 'lagos-airport');
    if (!ci.ok) throw new Error('check-in failed');
    t = ci.state;
    expect(checkIn(t, out, 'lagos-airport').ok).toBe(false);
    expect(canBoard(t, out, 'lagos-airport')).toBe('not-cleared');
    const sec = clearSecurity(t);
    if (!sec.ok) throw new Error('security failed');
    t = sec.state;
    expect(canBoard(t, out, 'lagos-airport')).toBe(true);
  });
  it('landing uses the ticket once; a round trip leaves the paid return ticket', () => {
    let t = emptyTravel();
    for (const step of [
      (x: typeof t) => bookFlight(x, out, true, 'T1', 0),
      (x: typeof t) => checkIn(x, out, 'lagos-airport'),
      (x: typeof t) => clearSecurity(x),
    ]) {
      const r = step(t);
      if (!r.ok) throw new Error('step failed');
      t = r.state;
    }
    const landed = completeFlight(t, out, 5);
    if (!landed.ok) throw new Error('landing failed');
    expect(landed.state.history).toEqual([{ routeId: 'los-acc', ticketId: 'T1', at: 5 }]);
    expect(landed.state.ticket).toMatchObject({ routeId: 'acc-los', stage: 'booked', paid: 0, roundTrip: false });
    expect(completeFlight(landed.state, out, 6).ok).toBe(false); // can't land twice
    // one-way: nothing left after landing
    let o = bookFlight(emptyTravel(), out, false, 'T9', 0);
    if (!o.ok) throw new Error();
    o = checkIn(o.state, out, 'lagos-airport') as typeof o;
    o = clearSecurity((o as { state: typeof t }).state) as typeof o;
    const l2 = completeFlight((o as { state: typeof t }).state, out, 1);
    expect(l2.ok && l2.state.ticket).toBe(null);
  });
  it('bottled drinks count as liquids at security; food does not', () => {
    let inv = emptyInv();
    inv = addItem(inv, { itemId: 'zobo', category: 'drink', quantity: 2, purchasePrice: 300, destinationId: 'x', at: 0 });
    inv = addItem(inv, { itemId: 'puff-puff', category: 'food', quantity: 1, purchasePrice: 300, destinationId: 'x', at: 0 });
    expect(liquidsIn(inv).map((e) => e.itemId)).toEqual(['zobo']);
  });
  it('v4 saves upgrade to v5: a home becomes a list, travel starts empty, bad tickets are dropped', () => {
    const v4 = {
      schemaVersion: 4, revision: 2, updatedAt: 1, deviceId: 'd',
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi', wallet: { balance: 900, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'), settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 1 },
      life: { needs: { energy: 50, fullness: 50 }, skills: {}, regard: {}, home: 'yaba-room', shiftsDone: 1 },
    };
    const up = migrate(v4)!;
    expect(up.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(up.life.homes).toEqual(['yaba-room']);
    expect(up.travel).toEqual(emptyTravel());
    expect(up.wallet.balance).toBe(900);
    const withTicket = migrate({ ...up, travel: { ticket: { id: 'T', routeId: 'los-acc', stage: 'cleared', paid: 9000, roundTrip: false, bookedAt: 0 }, history: [] } })!;
    expect(withTicket.travel.ticket?.stage).toBe('cleared');
    const bogus = migrate({ ...up, travel: { ticket: { id: 'T', routeId: 'nowhere', stage: 'booked' }, history: [{ nope: 1 }] } })!;
    expect(bogus.travel).toEqual(emptyTravel());
  });
  it('airport and Accra content: desks, a porter job and the Osu shift all resolve', () => {
    for (const id of ['lagos-airport', 'accra-airport']) {
      const p = ALL_PACKS.find((x) => x.id === id)!;
      const actions = p.npcs.flatMap((n) => Object.values(n.dialogue.nodes).flatMap((node) => node.options.map((o) => o.action.kind)));
      for (const k of ['checkIn', 'security', 'board', 'openTravel', 'openFlights']) expect(actions, `${id} ${k}`).toContain(k);
      expect(p.jobs).toHaveLength(1);
    }
    const osu = ALL_PACKS.find((x) => x.id === 'accra-osu')!;
    expect(osu.localCurrency?.code).toBe('GHS');
    expect(osu.shifts?.[0].dishes.length).toBe(4);
    expect(osu.homes?.[0].id).toBe('osu-guesthouse');
  });
  it('dialogue routes the airport desks by ticket stage and liquids', () => {
    const lagosAirportPack = ALL_PACKS.find((x) => x.id === 'lagos-airport')!;
    const desk = lagosAirportPack.npcs.find((n) => n.id === 'ifeoma')!;
    const sec = lagosAirportPack.npcs.find((n) => n.id === 'officer-musa')!;
    const gate = lagosAirportPack.npcs.find((n) => n.id === 'bisola')!;
    const ctx = (stage: 'none' | 'booked' | 'checked-in' | 'cleared' | 'elsewhere', liquids = false) => ({
      jobAvailable: () => false, jobActive: () => false, isDropoff: () => false, jobCompletedBefore: () => false,
      tripStage: () => stage, carryingLiquids: () => liquids,
    });
    expect(resolveEntry(desk.dialogue, ctx('none'))).toBe('noticket');
    expect(resolveEntry(desk.dialogue, ctx('booked'))).toBe('checkin');
    expect(resolveEntry(desk.dialogue, ctx('elsewhere'))).toBe('elsewhere');
    expect(resolveEntry(sec.dialogue, ctx('checked-in'))).toBe('scan');
    expect(resolveEntry(sec.dialogue, ctx('checked-in', true))).toBe('liquids');
    expect(resolveEntry(sec.dialogue, ctx('cleared', true))).toBe('done');
    expect(resolveEntry(gate.dialogue, ctx('cleared'))).toBe('board');
    expect(resolveEntry(gate.dialogue, ctx('checked-in'))).toBe('security-first');
  });
});

describe('goals', () => {
  const snap = (over: Partial<Parameters<typeof newlyCompleted>[0]> = {}) => ({
    jobs: emptyJobs(), jobArea: () => undefined, visited: ['lagos-adeniyi'], discovered: [], inventory: emptyInv(), bestBargain: 0, rides: 0, totalAreas: 4, ...over,
  });
  it('nothing is complete at the start', () => {
    expect(newlyCompleted(snap(), [])).toHaveLength(0);
  });
  it('the first flight completes "Wheels up"', () => {
    expect(newlyCompleted(snap({ flights: 1 }), []).map((g) => g.id)).toContain('first-flight');
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
    const n = { energy: 50, fullness: 50, joy: 70 };
    const idle = drainNeeds(n, 60000, 'idle');
    const run = drainNeeds(n, 60000, 'run');
    expect(run.energy).toBeLessThan(idle.energy);
    expect(idle.fullness).toBeCloseTo(49, 5);
    const starving = drainNeeds({ energy: 50, fullness: 0, joy: 70 }, 60000, 'walk');
    expect(50 - starving.energy).toBeCloseTo(2 * (50 - drainNeeds(n, 60000, 'walk').energy), 5);
    expect(drainNeeds({ energy: 0.1, fullness: 0, joy: 3 }, 600000, 'run')).toEqual({ energy: 0, fullness: 0, joy: 0 });
    expect(eat({ energy: 10, fullness: 90, joy: 50 }, 55).fullness).toBe(100);
  });
  it('exhaustion stops running but never stops walking', () => {
    expect(canRun({ energy: 14, fullness: 50, joy: 50 })).toBe(false);
    expect(canRun({ energy: 15, fullness: 50, joy: 50 })).toBe(true);
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
    expect(up.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(up.wallet.balance).toBe(4321);
    expect(up.destinationId).toBe('lagos-island');
    expect(up.life).toEqual(emptyLife());
    const v4 = migrate({ ...up, life: { needs: { energy: 500, fullness: -3 }, skills: { cooking: 90 }, regard: { 'mama-titi': 12 }, home: 'yaba-room', shiftsDone: 2 } })!;
    expect(v4.life.needs).toEqual({ energy: 100, fullness: 0, joy: 70 });
    expect(v4.life.homes).toEqual(['yaba-room']);
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

describe('living city data', () => {
  it('traffic lanes sit inside the road and walker stops point at real path points', () => {
    for (const p of ALL_PACKS) {
      for (const l of p.traffic?.lanes ?? []) expect(Math.abs(l.x) + 0.9, `${p.id} lane`).toBeLessThanOrEqual(p.road.halfWidth);
      if (p.traffic) expect(p.traffic.speed[0]).toBeLessThanOrEqual(p.traffic.speed[1]);
      for (const w of p.walkers) for (const st of w.stops ?? []) {
        expect(st.at, `${w.id}`).toBeGreaterThanOrEqual(0);
        expect(st.at, `${w.id}`).toBeLessThan(w.path.length);
        expect(st.seconds).toBeGreaterThan(0);
      }
    }
  });
  it('every area has people of more than one appearance', () => {
    for (const p of ALL_PACKS) {
      const skins = new Set([...p.npcs.map((n) => n.look.skin), ...p.walkers.map((w) => w.look.skin)]);
      expect(skins.size, p.id).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('graphics tiers', () => {
  it('auto picks low for low-memory or few-core phones, medium for phones, high for desktops', () => {
    expect(resolveTier('auto', { coarse: true, deviceMemory: 2 })).toBe('low');
    expect(resolveTier('auto', { coarse: true, cores: 4 })).toBe('low');
    expect(resolveTier('auto', { coarse: true, deviceMemory: 6, cores: 8 })).toBe('medium');
    expect(resolveTier('auto', { coarse: false, deviceMemory: 8, cores: 8 })).toBe('high');
    expect(resolveTier('high', { coarse: true, deviceMemory: 1 })).toBe('high');
  });
  it('lower tiers never cost more than higher ones', () => {
    const order = ['low', 'medium', 'high'] as const;
    for (let i = 1; i < order.length; i++) {
      const a = TIERS[order[i - 1]], b = TIERS[order[i]];
      expect(a.dpr[1]).toBeLessThanOrEqual(b.dpr[1]);
      expect(a.maxVehicles).toBeLessThanOrEqual(b.maxVehicles);
      expect(a.maxWalkers).toBeLessThanOrEqual(b.maxWalkers);
      expect(a.lodFar).toBeLessThanOrEqual(b.lodFar);
      expect(a.viewDistance).toBeLessThanOrEqual(b.viewDistance);
    }
    expect(TIERS.low.shadows).toBe(false);
  });
});


describe('social life', () => {
  it('a chat raises regard once per cooldown; gifts count more when liked, little when repeated', () => {
    let life = emptyLife();
    const a = chat(life, 'mama-titi', 1_000_000);
    expect(a.gain).toBe(CHAT_GAIN);
    life = a.life;
    expect(chatReady(life, 'mama-titi', 1_000_000 + 1000)).toBe(false);
    expect(chat(life, 'mama-titi', 1_000_000 + 1000).gain).toBe(0);
    expect(chatReady(life, 'mama-titi', 1_000_000 + CHAT_COOLDOWN_MS)).toBe(true);
    const g1 = giveGift(life, 'mama-titi', true, 2_000_000);
    expect(g1.gain).toBe(GIFT_LIKED);
    const g2 = giveGift(g1.life, 'mama-titi', true, 2_000_000 + 10);
    expect(g2.gain).toBe(1);
    expect(giveGift(emptyLife(), 'x', false, 0).gain).toBe(GIFT_OK);
    expect(g2.life.social['mama-titi'].gifts).toBe(2);
  });
  it('friends get 10% off, close friends 15%, rounded to ₦50', () => {
    expect(friendDiscount(29)).toBe(0);
    expect(friendDiscount(30)).toBe(0.1);
    expect(friendDiscount(60)).toBe(0.15);
    expect(friendPrice(2500, 10)).toBe(2500);
    expect(friendPrice(2500, 35)).toBe(2250);
    expect(friendPrice(8000, 70)).toBe(6800);
    expect(friendPrice(300, 70)).toBe(250);
    expect(tierUp(28, 31)).toBe('Friend');
    expect(tierUp(31, 33)).toBeNull();
  });
  it('people who can be befriended have lines and likes; NPC ids are unique across every area', () => {
    const ids = ALL_PACKS.flatMap((p) => p.npcs.map((n) => n.id));
    expect(new Set(ids).size).toBe(ids.length);
    const social = ALL_PACKS.flatMap((p) => p.npcs).filter((n) => n.social);
    expect(social.length).toBeGreaterThanOrEqual(15);
    for (const n of social) {
      expect(n.social!.lines.length, n.id).toBeGreaterThan(0);
      expect(n.social!.likes.length, n.id).toBeGreaterThan(0);
    }
  });
});

describe('vehicles', () => {
  const at = { areaId: 'lagos-adeniyi', x: -8.2, z: -8.4, yaw: 0 };
  it('buy → ride → park elsewhere → get back on; resale is half price', () => {
    let list = addVehicle([], 'v1', 'bicycle', 8000, at);
    expect(canMount(list[0], 'lagos-adeniyi', -8, -8)).toBe(true);
    expect(canMount(list[0], 'lagos-adeniyi', 0, 0)).toBe(false);
    expect(canMount(list[0], 'lekki-beach', -8.2, -8.4)).toBe(false);
    list = mount(list, 'v1');
    expect(list[0].parked).toBeNull();
    list = park(list, 'v1', { areaId: 'lagos-adeniyi', x: 3, z: 20, yaw: 1 });
    expect(canMount(list[0], 'lagos-adeniyi', 3.5, 20)).toBe(true);
    expect(vehicleResale(8000)).toBe(4000);
    expect(vehicleResale(7230)).toBe(3600);
    expect(removeVehicle(list, 'v1')).toEqual([]);
  });
  it('riding is faster than walking and less tiring; every dealer sells real vehicles from a reachable spot', () => {
    for (const v of VEHICLES) {
      expect(v.speed).toBeGreaterThan(3.4);
      expect(v.effort).toBeLessThan(1);
    }
    for (const p of ALL_PACKS) {
      const w = buildCollisionWorld(p);
      for (const d of p.dealers ?? []) {
        expect(p.npcs.find((n) => n.id === d.npcId), d.id).toBeDefined();
        for (const st of d.stock) expect(findVehicle(st.vehicleId), st.vehicleId).toBeDefined();
        expect(isBlocked(w, d.parkAt.position[0], d.parkAt.position[1]), `${d.id} parking`).toBe(false);
      }
      for (const n of p.npcs) for (const node of Object.values(n.dialogue.nodes)) for (const o of node.options)
        if (o.action.kind === 'dealer') { const id = o.action.dealerId; expect(p.dealers?.find((d) => d.id === id), id).toBeDefined(); }
    }
  });
  it('v5 saves upgrade to v6 with no vehicles and no social history; unknown vehicles are dropped', () => {
    const v5 = {
      schemaVersion: 5, revision: 3, updatedAt: 1, deviceId: 'd',
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi', wallet: { balance: 700, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: emptyWorld('lagos-adeniyi'), settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 1 },
      life: { needs: { energy: 60, fullness: 40 }, skills: { cooking: 10 }, regard: { tunde: 12 }, homes: ['yaba-room'], shiftsDone: 1 },
      travel: emptyTravel(),
    };
    const up = migrate(v5)!;
    expect(up.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(up.life.vehicles).toEqual([]);
    expect(up.life.social).toEqual({});
    expect(up.life.riding).toBeNull();
    expect(up.life.regard.tunde).toBe(12);
    const odd = migrate({ ...up, life: { ...up.life, vehicles: [{ uid: 'a', vehicleId: 'bicycle', paid: 8000, parked: null }, { uid: 'b', vehicleId: 'hoverboard', paid: 1, parked: null }], riding: 'b' } })!;
    expect(odd.life.vehicles.map((v) => v.uid)).toEqual(['a']);
    expect(odd.life.riding).toBeNull();
    const riding = migrate({ ...up, life: { ...up.life, vehicles: [{ uid: 'a', vehicleId: 'bicycle', paid: 8000, parked: null }], riding: 'a' } })!;
    expect(riding.life.riding).toBe('a');
  });
});


describe('time of day', () => {
  it('a game hour passes in two real minutes; days roll over', () => {
    expect(advance(START_TIME, 120_000) - START_TIME).toBeCloseTo(60, 5);
    expect(formatClock(START_TIME)).toBe('08:00');
    expect(dayOf(1440 + 5)).toBe(2);
    expect(formatClock(1440 + 7 * 60 + 5)).toBe('07:05');
  });
  it('daylight: full by day, none at night, easing through dawn and dusk', () => {
    expect(daylight(12 * 60)).toBe(1);
    expect(daylight(23 * 60)).toBe(0);
    expect(daylight(19 * 60)).toBeGreaterThan(0);
    expect(daylight(19 * 60)).toBeLessThan(1);
    expect(phaseOf(21 * 60)).toBe('night');
    expect(phaseOf(6 * 60)).toBe('dawn');
  });
  it('opening hours, including hours that pass midnight', () => {
    expect(isOpen([7, 22], 21 * 60)).toBe(true);
    expect(isOpen([7, 22], 22 * 60 + 5)).toBe(false);
    expect(isOpen([20, 3], 1 * 60)).toBe(true);
    expect(isOpen(undefined, 3 * 60)).toBe(true);
  });
  it('sleeping at night wakes you at 07:00 the next day; by day it is a nap', () => {
    expect(formatClock(afterSleep(22 * 60))).toBe('07:00');
    expect(dayOf(afterSleep(22 * 60))).toBe(2);
    expect(dayOf(afterSleep(1440 + 2 * 60))).toBe(2);
    expect(formatClock(afterSleep(1440 + 2 * 60))).toBe('07:00');
    expect(afterSleep(13 * 60)).toBe(15 * 60);
  });
  it('people go home outside their hours, but never mid-job', () => {
    const titi = lagos.npcs.find((n) => n.id === 'mama-titi')!;
    const kunle = lagos.npcs.find((n) => n.id === 'kunle')!;
    const night = { world: { ...emptyWorld('lagos-adeniyi'), time: 23 * 60 }, jobs: emptyJobs(), shift: null };
    expect(npcPresent(titi, night, lagos)).toBe(false);
    expect(npcPresent(kunle, night, lagos)).toBe(true);
    const mid = { ...night, jobs: acceptJob(emptyJobs(), lagos.jobs[0], 0, 'r').state };
    expect(npcPresent(titi, mid, lagos)).toBe(true);
    expect(npcPresent(titi, { ...night, world: { ...night.world, time: 12 * 60 } }, lagos)).toBe(true);
  });
  it('v6 saves upgrade to v7 at 08:00 on day 1; a bad clock value falls back', () => {
    const v6 = {
      schemaVersion: 6, revision: 1, updatedAt: 1, deviceId: 'd',
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi', wallet: { balance: 1, ledger: [] }, inventory: { entries: [] }, jobs: emptyJobs(),
      world: { visited: ['lagos-adeniyi'], discovered: [], goalsDone: [], seenTips: [], messages: [], bestBargain: 0, rides: 0 },
      settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 1 }, life: emptyLife(), travel: emptyTravel(),
    };
    expect(migrate(v6)!.world.time).toBe(START_TIME);
    expect(migrate({ ...v6, world: { ...v6.world, time: 5000 } })!.world.time).toBe(5000);
    expect(migrate({ ...v6, world: { ...v6.world, time: -3 } })!.world.time).toBe(START_TIME);
  });
});


describe('more kinds of work', () => {
  const bench = ikeja.repairs![0];
  it('repair: steps must go in order; shuffled buttons never give the order away', () => {
    const steps = bench.devices[0].steps;
    expect(shuffledSteps(steps, 3)).not.toEqual(steps);
    expect([...shuffledSteps(steps, 3)].sort()).toEqual([...steps].sort());
    expect(tapStep(steps, 0, steps[1])).toEqual({ progress: 0, correct: false });
    expect(tapStep(steps, 0, steps[0])).toEqual({ progress: 1, correct: true });
    expect(repairQueue(bench, 9)).toEqual(repairQueue(bench, 9));
    expect(repairQueue(bench, 9)).toHaveLength(bench.perSession);
  });
  it('repair scoring: one slip still counts, two do not; a clean session tips; skill pays more', () => {
    const clean = scoreRepair(bench, [{ mistakes: 0, done: true }, { mistakes: 0, done: true }, { mistakes: 0, done: true }], 1);
    expect(clean.fixed).toBe(3);
    expect(clean.pay).toBe(3 * bench.payPerDevice);
    expect(clean.tip).toBe(bench.perfectTip);
    const messy = scoreRepair(bench, [{ mistakes: 1, done: true }, { mistakes: 2, done: true }, { mistakes: 0, done: false }], 1);
    expect(messy.fixed).toBe(1);
    expect(messy.tip).toBe(0);
    expect(scoreRepair(bench, [{ mistakes: 0, done: true }], 3).pay).toBeGreaterThan(bench.payPerDevice);
  });
  it('requirements say plainly what is missing', () => {
    const ctx = { regard: {}, jobs: emptyJobs(), discovered: ['island-lane'], skills: {}, name: (id: string) => id.toUpperCase() };
    const tour = lagosIsland.jobs.find((j) => j.id === 'island-tour')!;
    const r = meetsReq(tour.requires, ctx);
    expect(r.ok).toBe(false);
    expect(r.missing[0]).toContain('ISLAND-ASOOKE');
    expect(meetsReq(tour.requires, { ...ctx, discovered: ['island-lane', 'island-asooke', 'island-brazilian'] }).ok).toBe(true);
    expect(meetsReq(bench.requires, ctx).missing[0]).toContain('PHONE-RUN');
    expect(meetsReq({ regard: { npcId: 'tobi', min: 30 } }, ctx).missing[0]).toContain('Friend');
  });
  it('a tour visits its stops in order, and only then can be finished', () => {
    const tour = lagosIsland.jobs.find((j) => j.id === 'island-tour')!;
    let st = acceptJob(emptyJobs(), tour, 0, 't1').state;
    expect(visitStop(st, tour, 1)).toBeNull(); // out of order
    st = visitStop(st, tour, 0)!;
    expect(deliverJob(st, tour, { now: 0, distanceToDropoff: 1 }).ok).toBe(false);
    st = visitStop(visitStop(st, tour, 1)!, tour, 2)!;
    expect(visitStop(st, tour, 2)).toBeNull();
    expect(deliverJob(st, tour, { now: 0, distanceToDropoff: 1 }).ok).toBe(true);
    for (const id of tour.tour!.stops) expect(lagosIsland.landmarks.find((l) => l.id === id), id).toBeDefined();
  });
  it('courier ranks: Rookie → Regular at 5 errands → Pro at 15, with bigger pay', () => {
    expect(courierRank(0).name).toBe('Rookie runner');
    expect(courierRank(5).name).toBe('Regular');
    expect(courierRank(15).next).toBeNull();
    expect(rankBonus(1500, 0)).toBe(0);
    expect(rankBonus(1500, 5)).toBe(150);
    expect(rankBonus(1500, 20)).toBe(300);
  });
});

describe('homes, furniture and storage', () => {
  const room = findInterior('yaba-room')!;
  it('every home in a pack with an interior has a matching room, and every door leads somewhere real', () => {
    for (const p of ALL_PACKS) {
      for (const sp of p.spots ?? []) if (sp.kind === 'door') expect(findInterior(sp.interiorId!), sp.id).toBeTruthy();
      for (const h of p.homes ?? []) if (h.buyPrice) expect(findInterior(h.id), h.id).toBeTruthy();
    }
    // all furniture sold in shops has a definition (so it can be placed and drawn)
    const sold = ALL_PACKS.flatMap((p) => p.items.filter((i) => i.category === 'furniture').map((i) => i.id));
    expect(sold.length).toBeGreaterThan(5);
    for (const id of sold) expect(findFurniture(id), id).toBeTruthy();
  });
  it('furniture only fits slots that accept its kind; placing returns what was there', () => {
    expect(fits(room, 'bed', 'wooden-bed')).toBe(true);
    expect(fits(room, 'bed', 'small-tv')).toBe(false);
    expect(fits(room, 'wall', 'wall-art')).toBe(true);
    let p = emptyProperty('rent', 6000);
    const a = place(p, 'corner', 'potted-plant');
    expect(a.replaced).toBeNull();
    const b = place(a.property, 'corner', 'standing-fan');
    expect(b.replaced).toBe('potted-plant');
    p = b.property;
    expect(comfort(p)).toBe(2);
    const u = unplace(p, 'corner');
    expect(u.removed).toBe('standing-fan');
    expect(comfort(u.property)).toBe(0);
  });
  it('comfort reaches the well-rested threshold with a bed and a couple of pieces', () => {
    let p = emptyProperty('own', 45000);
    p = place(p, 'bed', 'wooden-bed').property;
    expect(comfort(p)).toBe(3);
    p = place(p, 'side', 'rechargeable-lamp').property;
    expect(comfort(p)).toBeGreaterThanOrEqual(WELL_RESTED_COMFORT);
  });
  it('the chest keeps provenance and stacks; taking out more than is there fails', () => {
    let p = emptyProperty('rent', 0);
    const e = { itemId: 'zobo', category: 'drink' as const, destinationId: 'yaba', purchasePrice: 500 };
    p = store(store(p, e), e);
    expect(p.storage).toHaveLength(1);
    expect(p.storage[0].quantity).toBe(2);
    p = store(p, { ...e, purchasePrice: 400 });
    expect(p.storage).toHaveLength(2);
    const t = take(p, 0)!;
    expect(t.item.purchasePrice).toBe(500);
    expect(t.property.storage[0].quantity).toBe(1);
    expect(take(p, 5)).toBeNull();
  });
  it('owned homes are valued at 85% (rounded down to ₦500); rentals are worth nothing', () => {
    expect(homeValuation({ ...emptyProperty('own', 45000) })).toBe(38000);
    expect(homeValuation({ ...emptyProperty('own', 38000) })).toBe(32000);
    expect(homeValuation(emptyProperty('rent', 6000))).toBe(0);
    const p = place(store(emptyProperty('own', 1), { itemId: 'zobo', category: 'drink', destinationId: 'y', purchasePrice: 5 }), 'bed', 'wooden-bed').property;
    expect(belongings(p).furniture).toEqual(['wooden-bed']);
    expect(belongings(p).stored[0].itemId).toBe('zobo');
  });
  it('room collision: walls stop you, furniture blocks you, the entry point is clear, a placed bed replaces the mattress', () => {
    for (const def of INTERIORS) {
      const w = buildInteriorWorld(def, {});
      expect(isBlocked(w, def.entry.position[0], def.entry.position[1]), def.id).toBe(false);
      expect(isBlocked(w, def.size[0] / 2 + 0.1, 0)).toBe(true);
    }
    const w0 = buildInteriorWorld(room, {});
    const w1 = buildInteriorWorld(room, { bed: 'wooden-bed', corner: 'armchair' });
    expect(isBlocked(w0, -1.6, -1.1)).toBe(true);
    expect(w1.boxes.length).toBe(w0.boxes.length + 1); // bed swapped for mattress, plus the armchair
    expect(interiorPieces(room, { bed: 'wooden-bed' }).some((x) => x.itemId === 'foam-mattress')).toBe(false);
  });
  it('restaurants keep opening hours; meals lift joy', () => {
    const eatery = findInterior('yaba-eatery')!;
    expect(isOpen(eatery.hours, 12 * 60)).toBe(true);
    expect(isOpen(eatery.hours, 23 * 60 + 30)).toBe(false);
    expect(cheer({ energy: 50, fullness: 50, joy: 95 }, 20).joy).toBe(100);
  });
  it('v7 saves gain a property record per rented home (rent paid read from the ledger)', () => {
    const v7 = {
      schemaVersion: 7, revision: 1, updatedAt: 1, deviceId: 'd',
      profile: { name: 'Ade', avatar: DEFAULT_AVATAR, createdAt: 0 },
      destinationId: 'lagos-adeniyi',
      wallet: { balance: 4000, ledger: [{ id: 'home:yaba-room', amount: -6000, reason: 'Move-in', at: 1, destinationId: 'lagos-adeniyi' }] },
      inventory: { entries: [] }, jobs: emptyJobs(),
      world: { visited: ['lagos-adeniyi'], discovered: [], goalsDone: [], seenTips: [], messages: [], bestBargain: 0, rides: 0, time: 600 },
      settings: {}, player: { position: [0, 0], yaw: 0 }, stats: { playTimeMs: 1 },
      life: { needs: { energy: 50, fullness: 50 }, skills: {}, regard: {}, homes: ['yaba-room'] }, travel: emptyTravel(),
    };
    const old = v7;
    const m = migrate(old)!;
    expect(m.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(m.life.property['yaba-room']).toMatchObject({ tenure: 'rent', paid: 6000, placed: {}, storage: [] });
    expect(m.world.inside).toBeNull();
    expect(m.life.needs.joy).toBeGreaterThan(0);
  });
});

describe('ticketed events', () => {
  const concert = ALL_PACKS.flatMap((p) => p.events ?? []).find((e) => e.id === 'beach-highlife')!;
  const comedy = ALL_PACKS.flatMap((p) => p.events ?? []).find((e) => e.id === 'glover-laughs')!;
  it('every event has a gate spot in its area that is clear to stand at, and stages do not block people', () => {
    for (const p of ALL_PACKS) {
      const w = buildCollisionWorld(p);
      for (const ev of p.events ?? []) {
        const gate = (p.spots ?? []).find((s) => s.kind === 'event' && s.eventId === ev.id);
        expect(gate, ev.id).toBeTruthy();
        expect(isBlocked(w, gate!.position[0], gate!.position[1]), `${ev.id} gate`).toBe(false);
      }
      for (const sp of p.spots ?? []) if (sp.kind === 'event') expect((p.events ?? []).some((e) => e.id === sp.eventId), sp.id).toBe(true);
    }
  });
  it('showings follow the clock: nightly vs every other day, on-now, next showing', () => {
    expect(showsOn(concert, 1)).toBe(true);
    expect(showsOn(concert, 7)).toBe(true);
    expect(showsOn(comedy, 1)).toBe(true);
    expect(showsOn(comedy, 2)).toBe(false);
    expect(showsOn(comedy, 3)).toBe(true);
    // day 1, 08:00: the next concert is tonight 19:00–22:00
    const n = nextShowing(concert, 480)!;
    expect([n.day, n.start, n.end]).toEqual([1, 19 * 60, 22 * 60]);
    expect(onNow(concert, 480)).toBeNull();
    expect(onNow(concert, 20 * 60)).toBe(1);
    // day 2 at 21:00: comedy isn't on (odd days only) — next is day 3
    expect(onNow(comedy, 1440 + 21 * 60)).toBeNull();
    expect(nextShowing(comedy, 1440 + 21 * 60)!.day).toBe(3);
  });
  it('tickets: upcoming → on now → used or missed; one ledger id per showing; the gate costs more', () => {
    const t = { id: ticketTxId(concert.id, 1), eventId: concert.id, day: 1, paid: concert.price, status: 'booked' as const };
    expect(t.id).toBe('ticket:beach-highlife:d1');
    expect(ticketState(t, concert, 600)).toBe('upcoming');
    expect(ticketState(t, concert, 20 * 60)).toBe('on-now');
    expect(ticketState(t, concert, 23 * 60)).toBe('missed');
    expect(ticketState({ ...t, status: 'used' }, concert, 23 * 60)).toBe('used');
    expect(gatePrice(concert)).toBeGreaterThan(concert.price);
    const w = createWallet(20000);
    const a = debit(w, { id: t.id, amount: 5000, reason: 'x', at: 1, destinationId: 'lekki' });
    expect(a.ok).toBe(true);
    if (a.ok) expect(debit(a.wallet, { id: t.id, amount: 5000, reason: 'x', at: 2, destinationId: 'lekki' }).ok).toBe(false);
  });
  it('the Night out goal counts shows attended', () => {
    const g = GOALS.find((x) => x.id === 'night-out')!;
    expect(g.progress({ shows: 0 } as never)).toEqual([0, 1]);
    expect(g.progress({ shows: 2 } as never)).toEqual([1, 1]);
  });
});

describe('performance benchmark', () => {
  const extra = { at: 0, drawCalls: 40, triangles: 90000, tier: 'medium', dpr: 1, device: { cores: 4, memoryGb: 4, screen: '', ua: '' } };
  it('a steady 60 fps run is smooth', () => {
    const r = summarize(Array(600).fill(1000 / 60), extra);
    expect(r.avgFps).toBeCloseTo(60, 0);
    expect(r.low1Fps).toBeCloseTo(60, 0);
    expect(r.suggest).toBe('high');
    expect(r.frames).toBe(600);
  });
  it('spikes drag down the 1% low and the verdict even when the average looks fine', () => {
    const frames = [...Array(594).fill(1000 / 60), ...Array(6).fill(120)];
    const r = summarize(frames, extra);
    expect(r.avgFps).toBeGreaterThan(50);
    expect(r.low1Fps).toBeLessThan(10);
    expect(r.maxMs).toBe(120);
    expect(r.suggest).toBe('low');
  });
  it('slow devices are told to use Low; bad samples are ignored', () => {
    const r = summarize([...Array(100).fill(80), NaN, -5, 0], extra);
    expect(r.frames).toBe(100);
    expect(r.avgFps).toBeCloseTo(12.5, 1);
    expect(r.suggest).toBe('low');
    expect(r.verdict).toMatch(/Struggling/);
    expect(benchText(r)).toMatch(/Average 12.5 fps/);
  });
});

describe('city packs', () => {
  it('each city pack index matches its packs (areas, events, homes)', () => {
    for (const c of CITY_PACKS) {
      const packs = ALL_PACKS.filter((p) => cityAreas(c.id).includes(p.id));
      expect(packs.map((p) => p.id).sort(), c.id).toEqual([...cityAreas(c.id)].sort());
      expect(packs.flatMap((p) => (p.events ?? []).map((e) => e.id)).sort()).toEqual([...c.eventIds].sort());
      expect(packs.flatMap((p) => (p.homes ?? []).map((h) => h.id)).sort()).toEqual([...c.homeIds].sort());
      if (!c.builtIn) expect(c.load, c.id).toBeTruthy();
    }
  });
  it('a save names the cities it needs: where you are, visited, items, homes, tickets, flights', () => {
    const base = { destinationId: 'lagos-adeniyi', world: emptyWorld('lagos-adeniyi'), travel: emptyTravel(), life: emptyLife(), inventory: emptyInv() };
    expect(citiesInSave(base)).toEqual(['lagos']);
    expect(citiesInSave({ ...base, destinationId: 'accra-osu' })).toContain('accra');
    expect(citiesInSave({ ...base, world: { ...base.world, tickets: [{ id: 'x', eventId: 'osu-night-jam', day: 1, paid: 1, status: 'booked' }] } })).toContain('accra');
    expect(citiesInSave({ ...base, life: { ...base.life, homes: ['osu-guesthouse'] } })).toContain('accra');
    expect(citiesInSave({ ...base, travel: { ticket: { id: 't', routeId: FLIGHTS[0].id, stage: 'booked', paid: 1, roundTrip: false, bookedAt: 0 }, history: [] } })).toContain('accra');
    const inv = addItem(emptyInv(), { itemId: 'kente-strip', category: 'souvenir', quantity: 1, purchasePrice: 1, destinationId: 'accra-osu', at: 0 });
    expect(citiesInSave({ ...base, inventory: inv })).toContain('accra');
  });
});

describe('Dubai', () => {
  it('Lagos flies to Accra and Dubai; every route has a way back and lands somewhere real', () => {
    expect(FLIGHTS.filter((f) => f.from === 'lagos-airport').map((f) => f.to).sort()).toEqual(['abuja-airport', 'accra-airport', 'benin-airport', 'calabar-airport', 'dubai-airport', 'enugu-airport', 'kano-airport', 'ph-airport']);
    for (const f of FLIGHTS.filter((r) => !isRail(r))) {
      expect(findFlight(f.returnId)?.returnId, f.id).toBe(f.id);
      expect(ALL_PACKS.some((p) => p.id === f.arriveAt), f.id).toBe(true);
      expect(f.roundTrip).toBeLessThan(f.ticket * 2);
    }
  });
  it('airport staff talk about the flight on your ticket', () => {
    const line = "Passport, please… {entry} You're on {flight}, gate {gate}.";
    expect(flightText(line, findFlight('los-dxb'))).toBe("Passport, please… Your UAE visa is on file with the booking — all set. You're on Dubai (GC 571), gate A5.");
    expect(flightText(line, findFlight('los-acc'))).toContain('ECOWAS — no visa needed');
    expect(flightText('no tokens', undefined)).toBe('no tokens');
  });
  it('Dubai prices show dirhams as a guide; the studio can be rented, bought and furnished', () => {
    const creek = ALL_PACKS.find((p) => p.id === 'dubai-creek')!;
    expect(localPriceOf(creek, 3650)).toBe('≈ AED 10'); // ₦365 per dirham (pegged to the dollar)
    expect(creek.homes![0].buyPrice).toBeGreaterThan(creek.homes![0].moveInCost);
    expect(findInterior('creek-studio')?.slots.length).toBeGreaterThan(3);
  });
  it('Globetrotter counts cities visited', () => {
    const g = GOALS.find((x) => x.id === 'globetrotter')!;
    expect(g.progress({ cities: 1 } as never)).toEqual([1, 3]);
    expect(g.progress({ cities: 3 } as never)).toEqual([3, 3]);
  });
});

describe('Badagry', () => {
  const pack = ALL_PACKS.find((p) => p.id === 'badagry-marina')!;
  const w = buildCollisionWorld(pack);
  it('is a built-in Lagos district you reach by danfo, counted by the explorer goal', () => {
    expect(pack).toBeDefined();
    expect(regionOf('badagry-marina')?.id).toBe('lagos');
    expect(modeBetween('lagos-adeniyi', 'badagry-marina')).toBe('Danfo');
    expect(fareBetween('lagos-adeniyi', 'badagry-marina')).toBe(1800);
    expect(LAGOS_AREAS.filter((a) => !a.hub).map((a) => a.id)).toContain('badagry-marina');
    expect(cityAreas('lagos')).toContain('badagry-marina');
  });
  it('the heritage walk visits real landmarks in order, and each stop can be walked to', () => {
    const job = pack.jobs.find((j) => j.id === 'heritage-walk')!;
    expect(job.kind).toBe('tour');
    expect(job.requires?.discovered).toEqual(job.tour!.stops);
    for (const id of job.tour!.stops) {
      const lm = pack.landmarks.find((l) => l.id === id);
      expect(lm, id).toBeDefined();
      expect(isBlocked(w, lm!.position[0], lm!.position[1]), id).toBe(false);
    }
  });
  it('the jetty is walkable out over the lagoon, but the water beside it is not', () => {
    expect(isBlocked(w, 14, -28)).toBe(false);
    expect(isBlocked(w, 14, -32)).toBe(true);
  });
  it('the room by the marina and the drums are in the Lagos city index', () => {
    const lagosCity = CITY_PACKS.find((c) => c.id === 'lagos')!;
    expect(lagosCity.homeIds).toContain('badagry-room');
    expect(lagosCity.eventIds).toContain('heritage-drums');
    expect(findInterior('badagry-room')?.kind).toBe('home');
  });
});

describe('stages', () => {
  it('a stage blocks the footprint it is drawn with, whichever way it faces', () => {
    const base = ALL_PACKS.find((p) => p.id === 'badagry-marina')!;
    const ev = base.events![0];
    const turned = (facing: number) => buildCollisionWorld({ ...base, events: [{ ...ev, stage: { ...ev.stage!, position: [0, 0], size: [4, 2], facing } }] });
    // facing the street the long side (4 m) runs along x; a quarter turn puts it along z
    expect(isBlocked(turned(Math.PI / 2), 1.8, 0, 0.01)).toBe(true);
    expect(isBlocked(turned(Math.PI / 2), 0, 1.8, 0.01)).toBe(false);
    expect(isBlocked(turned(0), 0, 1.8, 0.01)).toBe(true);
    expect(isBlocked(turned(0), 1.8, 0, 0.01)).toBe(false);
  });
});

describe('saving for a first flight', () => {
  const fund = GOALS.find((g) => g.id === 'flight-fund')!;
  const base = { jobs: emptyJobs(), jobArea: () => undefined, visited: [], discovered: [], inventory: emptyInventory(), bestBargain: 0, rides: 0, totalAreas: 5 };
  const cheapest = Math.min(...FLIGHTS.filter((f) => f.from === 'lagos-airport').map((f) => f.roundTrip));
  it('counts the money you hold towards the cheapest return flight from Lagos, and is done once you can afford it', () => {
    expect(cheapest).toBe(210000); // Lagos–Benin City return, the cheapest flight
    expect(fund.money).toBe(true);
    expect(fund.progress({ ...base, balance: 5000, flightFund: cheapest })).toEqual([5000, cheapest]);
    expect(newlyCompleted({ ...base, balance: cheapest - 1, flightFund: cheapest }, []).map((g) => g.id)).not.toContain('flight-fund');
    expect(newlyCompleted({ ...base, balance: cheapest, flightFund: cheapest }, []).map((g) => g.id)).toContain('flight-fund');
  });
  it('is complete for anyone who has already flown, whatever they hold now', () => {
    expect(newlyCompleted({ ...base, balance: 0, flights: 1, flightFund: cheapest }, []).map((g) => g.id)).toContain('flight-fund');
  });
  it('a new life in Lagos starts with ₦5,000 — a few rides and meals, nowhere near a flight', () => {
    expect(lagos.startingMoney).toBe(5000);
    expect(lagos.startingMoney).toBeLessThan(cheapest / 40);
  });
});

describe('Abuja and domestic flights', () => {
  const out = findFlight('los-abv')!;
  const back = findFlight('abv-los')!;
  it('Lagos ↔ Abuja is a domestic route at real fares, with an ID card instead of a passport', () => {
    expect(out.domestic && back.domestic).toBe(true);
    expect(out.ticket).toBe(140000);
    expect(out.roundTrip).toBe(270000);
    expect(out.roundTrip).toBeLessThan(findFlight('los-acc')!.roundTrip);
    expect(out.returnId).toBe('abv-los');
    expect(back.returnId).toBe('los-abv');
    expect(out.chart).toBe('nigeria');
    expect(flightText('{papers}, please… {entry}', out)).toBe('ID card, please… Domestic flight — your national ID card is all you need.');
    expect(flightText('{papers}, please…', findFlight('los-acc'))).toBe('Passport, please…');
    for (const f of FLIGHTS) expect(f.papers, f.id).toBeTruthy();
  });
  it('lands you in Wuse, a separate city pack with its own airport and a taxi between them', () => {
    expect(out.arriveAt).toBe('abuja-wuse');
    expect(regionOf('abuja-wuse')?.id).toBe('abuja');
    expect(regionOf('abuja-airport')?.areas.find((a) => a.id === 'abuja-airport')?.hub).toBe('airport');
    expect(modeBetween('abuja-wuse', 'abuja-airport')).toBe('Taxi');
    expect(fareBetween('abuja-wuse', 'abuja-airport')).toBe(12000);
    expect(CITY_PACKS.find((c) => c.id === 'abuja')?.builtIn).toBe(false);
    expect(cityAreas('abuja').sort()).toEqual(['abuja-airport', 'abuja-wuse']);
  });
  it('the Capital Walk visits real landmarks in order, and the check-in desk asks for ID on this route', () => {
    const wuse = ALL_PACKS.find((p) => p.id === 'abuja-wuse')!;
    const walk = wuse.jobs.find((j) => j.id === 'capital-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(wuse.landmarks.some((l) => l.id === id), id).toBe(true);
    const airport = ALL_PACKS.find((p) => p.id === 'abuja-airport')!;
    const desk = airport.npcs.find((n) => n.role === 'Check-in agent')!;
    expect(flightText(desk.dialogue.nodes.checkin.text, back)).toContain('ID card, please');
  });
});

describe('Calabar', () => {
  const out = findFlight('los-cbq')!;
  const marina = ALL_PACKS.find((p) => p.id === 'calabar-marina')!;
  it('Lagos ↔ Calabar is domestic at real fares, on the Nigeria map, landing on the Marina', () => {
    expect(out.domestic && findFlight('cbq-los')!.domestic).toBe(true);
    expect([out.ticket, out.roundTrip]).toEqual([150000, 285000]);
    expect(out.chart).toBe('nigeria');
    expect(out.arriveAt).toBe('calabar-marina');
    expect(flightText('{papers}, please…', out)).toBe('ID card, please…');
    expect(fareBetween('calabar-marina', 'calabar-airport')).toBe(5000);
    expect(CITY_PACKS.find((c) => c.id === 'calabar')?.builtIn).toBe(false);
  });
  it('the Marina Walk visits real landmarks in order; the boardwalk is walkable out over the river', () => {
    const walk = marina.jobs.find((j) => j.id === 'marina-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(marina.landmarks.some((l) => l.id === id), id).toBe(true);
    const w = buildCollisionWorld(marina);
    let x = 7.4;
    for (let i = 0; i < 80; i++) x = resolveMove(w, x, -20, x + 0.1, -20).x;
    expect(x).toBeGreaterThan(14);
  });
});

describe('Ibadan and the train', () => {
  const classes = ['s', 'b', 'f'].map((k) => findFlight(`los-ibd-${k}`)!);
  const dugbe = ALL_PACKS.find((p) => p.id === 'ibadan-dugbe')!;
  it('the Lagos–Ibadan train has three classes at the railway’s published fares, two singles for a return', () => {
    expect(classes.map((r) => r.rail?.cls)).toEqual(['Standard', 'Business', 'First']);
    expect(classes.map((r) => r.ticket)).toEqual([3600, 6500, 13000]);
    for (const r of classes) {
      expect(r.mode).toBe('rail');
      expect(r.from).toBe('lagos-station');
      expect(r.arriveAt).toBe('ibadan-station');
      expect(findFlight(r.returnId)?.arriveAt).toBe('lagos-station');
      expect(r.rail?.stops[0]).toBe('Ebute Metta');
      expect(r.rail?.stops[r.rail.stops.length - 1]).toBe('Moniya');
    }
    expect(classes[2].rail!.joy).toBeGreaterThan(classes[0].rail!.joy);
    expect(isRail(findFlight('los-abv'))).toBe(false);
  });
  it('trains keep a timetable: 8:00 and 16:00, and the next one rolls over to tomorrow', () => {
    const r = classes[0];
    const day2 = 1440;
    expect(nextDeparture(r, day2 + 7 * 60)).toEqual({ at: day2 + 8 * 60, label: '08:00' });
    expect(nextDeparture(r, day2 + 8 * 60)).toEqual({ at: day2 + 8 * 60, label: '08:00' });
    expect(nextDeparture(r, day2 + 9 * 60).label).toBe('16:00');
    expect(nextDeparture(r, day2 + 17 * 60)).toEqual({ at: 2 * 1440 + 8 * 60, label: '08:00 tomorrow' });
    expect(flightText('Next train {departs}, {class} class, platform {gate}', r, day2 + 9 * 60)).toBe('Next train 16:00, Standard class, platform 2');
    expect(nextDeparture(findFlight('los-abv')!, 500)).toEqual({ at: 500, label: 'now' });
  });
  it('the station is a danfo ride from Yaba; Moniya is a taxi from Dugbe; the flight fund ignores trains', () => {
    expect(fareBetween('lagos-adeniyi', 'lagos-station')).toBe(300);
    expect(modeBetween('lagos-adeniyi', 'lagos-station')).toBe('Danfo');
    expect(modeBetween('lagos-station', 'lagos-airport')).toBe('Taxi');
    expect(fareBetween('ibadan-dugbe', 'ibadan-station')).toBe(5000);
    expect(CITY_PACKS.find((c) => c.id === 'ibadan')?.builtIn).toBe(false);
    const snap = progressSnapshot({ jobs: emptyJobs(), world: { ...emptyWorld('lagos-adeniyi'), visited: ['lagos-station'] }, inventory: emptyInventory(), wallet: createWallet(0), travel: { ticket: null, history: [{ routeId: 'los-ibd-s', ticketId: 't1', at: 1 }] } } as never);
    expect(snap.flights).toBe(0);
    expect(snap.trains).toBe(1);
    expect(snap.flightFund).toBe(210000);
    expect(snap.totalAreas).toBe(5);
  });
  it('a rail trip budget shows the ride to the station and the taxi on into town; no return discount', () => {
    const b = tripBudget(classes[1], { taxiToAirport: 300, roundTrip: true, hasStay: false });
    expect(b.lines.map((l) => l.key)).toEqual(['taxi', 'ticket', 'onward', 'stay', 'around']);
    expect(b.lines[0].label).toBe('Ride to the station');
    expect(b.dueNow).toBe(13000);
    expect(b.lines.find((l) => l.key === 'onward')?.amount).toBe(5000);
  });
  it('the Grandfather’s City tour visits real landmarks in order', () => {
    const walk = dugbe.jobs.find((j) => j.id === 'dugbe-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(dugbe.landmarks.some((l) => l.id === id), id).toBe(true);
  });
});

describe('content ids', () => {
  it('item ids are unique across every area, so a bag entry always means one thing', () => {
    const ids = ALL_PACKS.flatMap((p) => p.items.map((i) => i.id));
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });
});

describe('Abeokuta and the intercity bus', () => {
  const itoku = ALL_PACKS.find((p) => p.id === 'abeokuta-itoku')!;
  it('buses link Lagos (Ojota, by Ikeja), Abeokuta and Ibadan at 2026 park fares, in both directions', () => {
    expect(fareBetween('ikeja-village', 'abeokuta-itoku', 'coach')).toBe(4000);
    expect(fareBetween('abeokuta-itoku', 'ikeja-village', 'coach')).toBe(4000);
    expect(fareBetween('abeokuta-itoku', 'ibadan-dugbe', 'coach')).toBe(2500);
    expect(fareBetween('ikeja-village', 'ibadan-dugbe', 'coach')).toBe(6000);
    expect(minutesBetween('ikeja-village', 'abeokuta-itoku', 'coach')).toBe(120);
    expect(modeBetween('ikeja-village', 'abeokuta-itoku', 'coach')).toBe('Intercity bus');
    expect(coachesFrom('ikeja-village').map((a) => a.id).sort()).toEqual(['abeokuta-itoku', 'benin-kings-square', 'ibadan-dugbe']);
    expect(coachesFrom('lagos-adeniyi')).toEqual([]);
    // the danfo still doesn't cross cities, and no bus runs where none is listed
    expect(fareBetween('ikeja-village', 'abeokuta-itoku')).toBe(0);
    expect(fareBetween('lagos-adeniyi', 'abeokuta-itoku', 'coach')).toBe(0);
    for (const r of COACHES) expect(regionOf(r.between[0])).not.toBe(regionOf(r.between[1]));
  });
  it('every motor park has a conductor who opens the bus, and Abeokuta is a separate city pack', () => {
    const parks = [...new Set(COACHES.flatMap((r) => r.between))];
    for (const id of parks) {
      const p = ALL_PACKS.find((x) => x.id === id)!;
      expect(p, id).toBeDefined();
      expect(p.npcs.some((n) => Object.values(n.dialogue.nodes).some((node) => node.options.some((o) => o.action.kind === 'openTravel' && o.action.by === 'coach'))), id).toBe(true);
    }
    expect(CITY_PACKS.find((c) => c.id === 'abeokuta')?.builtIn).toBe(false);
  });
  it('the dye pit is a bench in its own words, unlocked by the Indigo Run; the tour visits real landmarks in order', () => {
    const pit = itoku.repairs!.find((r) => r.id === 'adire-pit')!;
    expect(benchLabels(pit).unit).toBe('Cloth');
    expect(benchLabels(ALL_PACKS.find((p) => p.id === 'ikeja-village')!.repairs![0]).unit).toBe('Phone');
    expect(pit.requires?.jobsDone?.jobId).toBe('indigo-run');
    for (const d of pit.devices) expect(new Set(d.steps).size).toBe(d.steps.length);
    const walk = itoku.jobs.find((j) => j.id === 'under-the-rock')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(itoku.landmarks.some((l) => l.id === id), id).toBe(true);
  });
  it('bus rides count for "Road trip" (each fare is one coach- ledger entry)', () => {
    const wallet = { ...createWallet(0), ledger: [{ id: 'coach-abc-1', amount: -4000, reason: 'Intercity bus', at: 1, destinationId: 'ikeja-village' }] };
    const snap = progressSnapshot({ jobs: emptyJobs(), world: emptyWorld('lagos-adeniyi'), inventory: emptyInventory(), wallet, travel: { ticket: null, history: [] } } as never);
    expect(snap.buses).toBe(1);
  });
});

describe('Osogbo', () => {
  const oja = ALL_PACKS.find((p) => p.id === 'osogbo-oja-oba')!;
  it('the bus from Ibadan (₦3,500) is the way in; Osogbo is a separate city pack', () => {
    expect(fareBetween('ibadan-dugbe', 'osogbo-oja-oba', 'coach')).toBe(3500);
    expect(coachesFrom('osogbo-oja-oba').map((a) => a.id)).toEqual(['ibadan-dugbe']);
    expect(coachesFrom('ibadan-dugbe').map((a) => a.id).sort()).toEqual(['abeokuta-itoku', 'ikeja-village', 'osogbo-oja-oba']);
    expect(CITY_PACKS.find((c) => c.id === 'osogbo')?.builtIn).toBe(false);
  });
  it('the sacred grove is seen, never worked in: no job, tour or delivery goes to it', () => {
    const grove = oja.landmarks.find((l) => l.id === 'osg-grove')!;
    expect(grove).toBeDefined();
    for (const j of oja.jobs) expect(j.tour?.stops ?? [], j.id).not.toContain('osg-grove');
    // nothing to collect or deliver near the grove gate at the north end of the street
    for (const n of oja.npcs) expect(n.position[1], n.id).toBeGreaterThan(-30);
  });
  it('the art walk visits real landmarks in order; the batik table is unlocked by the Yam Run', () => {
    const walk = oja.jobs.find((j) => j.id === 'osogbo-art-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(oja.landmarks.some((l) => l.id === id), id).toBe(true);
    const table = oja.repairs!.find((r) => r.id === 'batik-table')!;
    expect(benchLabels(table).skill).toBe('Batik');
    expect(table.requires?.jobsDone?.jobId).toBe('yam-run');
  });
});

describe('Benin City', () => {
  const sq = ALL_PACKS.find((p) => p.id === 'benin-kings-square')!;
  it('is reached by a domestic flight (now the cheapest return from Lagos) or the six-hour bus from Ojota', () => {
    const out = findFlight('los-bni')!;
    expect([out.ticket, out.roundTrip]).toEqual([110000, 210000]);
    expect(out.domestic && out.chart === 'nigeria' && out.arriveAt === 'benin-kings-square').toBe(true);
    expect(findFlight('bni-los')!.arriveAt).toBe('ikeja-village');
    expect(fareBetween('ikeja-village', 'benin-kings-square', 'coach')).toBe(26000);
    expect(minutesBetween('ikeja-village', 'benin-kings-square', 'coach')).toBe(360);
    expect(fareBetween('benin-kings-square', 'benin-airport')).toBe(4000);
    expect(CITY_PACKS.find((c) => c.id === 'benin')?.builtIn).toBe(false);
  });
  it('the casting house works the lost-wax method, unlocked by the Charcoal Run; the tour visits real landmarks in order', () => {
    const shop = sq.repairs!.find((r) => r.id === 'bronze-workshop')!;
    expect(benchLabels(shop).skill).toBe('Bronze casting');
    expect(shop.requires?.jobsDone?.jobId).toBe('charcoal-run');
    for (const d of shop.devices) expect(d.steps).toContain('Pour the bronze');
    const walk = sq.jobs.find((j) => j.id === 'kings-square-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(sq.landmarks.some((l) => l.id === id), id).toBe(true);
  });
});

describe('Enugu', () => {
  const ogui = ALL_PACKS.find((p) => p.id === 'enugu-ogui')!;
  it('is a domestic flight from Lagos (Benin City stays the cheapest) or a bus from Benin City', () => {
    const out = findFlight('los-enu')!;
    expect([out.ticket, out.roundTrip]).toEqual([115000, 215000]);
    expect(out.domestic && out.chart === 'nigeria' && out.arriveAt === 'enugu-ogui').toBe(true);
    expect(Math.min(...FLIGHTS.filter((f) => f.from === 'lagos-airport').map((f) => f.roundTrip))).toBe(210000);
    expect(fareBetween('benin-kings-square', 'enugu-ogui', 'coach')).toBe(15000);
    expect(coachesFrom('enugu-ogui').map((a) => a.id).sort()).toEqual(['benin-kings-square', 'ph-waterfront']);
    expect(fareBetween('enugu-ogui', 'enugu-airport')).toBe(6000);
    expect(CITY_PACKS.find((c) => c.id === 'enugu')?.builtIn).toBe(false);
  });
  it('the abacha stall is a cooking shift; the walk visits real landmarks in order', () => {
    const shift = ogui.shifts!.find((x) => x.id === 'abacha-stall')!;
    expect(shift.skill).toBe('cooking');
    expect(shift.dishes.map((d) => d.name)).toContain('Abacha');
    const walk = ogui.jobs.find((j) => j.id === 'coal-city-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(ogui.landmarks.some((l) => l.id === id), id).toBe(true);
  });
});

describe('Port Harcourt', () => {
  const wf = ALL_PACKS.find((p) => p.id === 'ph-waterfront')!;
  it('is a domestic flight from Lagos or the bus from Enugu; Benin City stays the cheapest flight', () => {
    const out = findFlight('los-phc')!;
    expect([out.ticket, out.roundTrip]).toEqual([135000, 255000]);
    expect(out.domestic && out.chart === 'nigeria' && out.arriveAt === 'ph-waterfront').toBe(true);
    expect(Math.min(...FLIGHTS.filter((f) => f.from === 'lagos-airport').map((f) => f.roundTrip))).toBe(210000);
    expect(fareBetween('enugu-ogui', 'ph-waterfront', 'coach')).toBe(10000);
    expect(minutesBetween('enugu-ogui', 'ph-waterfront', 'coach')).toBe(270);
    expect(fareBetween('ph-waterfront', 'ph-airport')).toBe(12000);
    expect(CITY_PACKS.find((c) => c.id === 'port-harcourt')?.builtIn).toBe(false);
  });
  it('the jetty is walkable out over the creek; the cruise leaves from it', () => {
    const w = buildCollisionWorld(wf);
    let x = 7.4;
    for (let i = 0; i < 80; i++) x = resolveMove(w, x, -8, x + 0.1, -8).x;
    expect(x).toBeGreaterThan(14);
    expect(wf.spots?.find((s) => s.eventId === 'creek-cruise')).toBeDefined();
  });
  it('the smokehouse is unlocked by the catch; the walk visits real landmarks in order', () => {
    const kiln = wf.repairs!.find((r) => r.id === 'fish-kiln')!;
    expect(benchLabels(kiln).skill).toBe('Fish smoking');
    expect(kiln.requires?.jobsDone?.jobId).toBe('catch-to-grill');
    const walk = wf.jobs.find((j) => j.id === 'garden-city-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(wf.landmarks.some((l) => l.id === id), id).toBe(true);
  });
});

describe('Jos', () => {
  const j = ALL_PACKS.find((p) => p.id === 'jos-terminus')!;
  it('is the bus from Abuja (₦6,000, 4 h 30); Mallam Garba in Wuse offers it; Jos is a separate city pack', () => {
    expect(fareBetween('abuja-wuse', 'jos-terminus', 'coach')).toBe(6000);
    expect(minutesBetween('abuja-wuse', 'jos-terminus', 'coach')).toBe(270);
    expect(coachesFrom('jos-terminus').map((a) => a.id)).toEqual(['abuja-wuse', 'yankari-wikki']);
    expect(CITY_PACKS.find((c) => c.id === 'jos')?.builtIn).toBe(false);
  });
  it('the produce stall is a trading shift in its own words; the walk visits real landmarks in order', () => {
    const stall = j.shifts!.find((x) => x.id === 'produce-stall')!;
    expect(shiftLabels(stall).skill).toBe('Market trading');
    expect(shiftLabels({}).skill).toBe('Cooking');
    const walk = j.jobs.find((x) => x.id === 'plateau-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(j.landmarks.some((l) => l.id === id), id).toBe(true);
  });
});

describe('Kano', () => {
  const k = ALL_PACKS.find((p) => p.id === 'kano-kurmi')!;
  it('is a domestic flight from Lagos; Benin City stays the cheapest; Kano is a separate city pack', () => {
    const out = findFlight('los-kan')!;
    expect([out.ticket, out.roundTrip]).toEqual([140000, 265000]);
    expect(out.domestic && out.chart === 'nigeria' && out.arriveAt === 'kano-kurmi').toBe(true);
    expect(findFlight('kan-los')!.arriveAt).toBe('ikeja-village');
    expect(Math.min(...FLIGHTS.filter((f) => f.from === 'lagos-airport').map((f) => f.roundTrip))).toBe(210000);
    expect(fareBetween('kano-kurmi', 'kano-airport')).toBe(5000);
    expect(CITY_PACKS.find((c) => c.id === 'kano')?.builtIn).toBe(false);
  });
  it('the leather workshop is unlocked by the Hide Run; the Durbar card is honest about Sallah; the walk is real', () => {
    const shop = k.repairs!.find((r) => r.id === 'leather-workshop')!;
    expect(benchLabels(shop).skill).toBe('Leatherwork');
    expect(shop.requires?.jobsDone?.jobId).toBe('hide-run');
    expect(k.events!.find((e) => e.id === 'kano-durbar')!.description).toMatch(/real Durbar rides out at the two Sallah festivals/);
    const walk = k.jobs.find((j) => j.id === 'old-city-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
    for (const id of walk.tour!.stops) expect(k.landmarks.some((l) => l.id === id), id).toBe(true);
    expect(k.buildings.filter((b) => b.style === 'adobe').length).toBeGreaterThan(5);
  });
});

describe('Yankari and the game drive', () => {
  const y = ALL_PACKS.find((p) => p.id === 'yankari-wikki')!;
  const drive = y.events!.find((e) => e.id === 'game-drive')!;
  const ride = drive.ride!;
  it('is a bus ride from Jos (an estimate) and a separate city pack', () => {
    expect(coachesFrom('jos-terminus').map((a) => a.id)).toContain('yankari-wikki');
    expect(coachesFrom('yankari-wikki').map((a) => a.id)).toEqual(['jos-terminus']);
    expect([fareBetween('jos-terminus', 'yankari-wikki', 'coach'), minutesBetween('jos-terminus', 'yankari-wikki', 'coach')]).toEqual([12000, 300]);
    expect(CITY_PACKS.find((c) => c.id === 'yankari')?.builtIn).toBe(false);
  });
  it('the drive boards and ends on the camp road, and leaves it in between', () => {
    const [x0, z0, x1, z1] = y.walkable[0];
    const inside = ([x, z]: Vec2) => x > x0 && x < x1 && z > z0 && z < z1;
    expect(inside(ride.track[0]) && inside(ride.track[ride.track.length - 1])).toBe(true);
    expect(ride.track.some((p) => !inside(p))).toBe(true);
    // everything stays on the ground plane (±110 m)
    for (const [x, z] of ride.track) expect(Math.max(Math.abs(x), Math.abs(z))).toBeLessThan(100);
    const secs = rideSeconds(ride);
    expect(secs).toBeGreaterThan(50);
    expect(secs).toBeLessThan(120);
  });
  it('every sighting is passed on the way, and none of the animals stand on the track', () => {
    expect(sightingsBetween(ride, 0, trackLength(ride.track)).sort()).toEqual(ride.sightings.map((v) => v.id).sort());
    const wild = y.props.filter((p) => ['elephant', 'antelope', 'baboon', 'warthog', 'buffalo', 'hippo', 'baobab', 'acacia'].includes(p.kind) && p.position[1] < -44);
    expect(wild.length).toBeGreaterThan(6);
    for (const p of wild) expect(distanceToTrack(ride.track, p.position[0], p.position[1]), p.id).toBeGreaterThan(5);
    // sightings are named for what is there: each has an animal group close by
    for (const v of ride.sightings) expect(wild.some((p) => Math.hypot(p.position[0] - v.position[0], p.position[1] - v.position[1]) < 2), v.id).toBe(true);
  });
  it('the truck turns smoothly and the pose follows the clock', () => {
    const a = ridePose(ride, 0);
    expect([a.x, a.z]).toEqual(ride.track[0]);
    const end = ridePose(ride, rideSeconds(ride) * 1000 + 5000);
    expect([end.x, end.z]).toEqual(ride.track[ride.track.length - 1]);
    let maxTurn = 0;
    for (let s = 1; s < trackLength(ride.track); s += 0.5) {
      let d = Math.abs(poseAlong(ride.track, s).yaw - poseAlong(ride.track, s - 0.5).yaw) % (Math.PI * 2);
      if (d > Math.PI) d = Math.PI * 2 - d;
      maxTurn = Math.max(maxTurn, d);
    }
    expect(maxTurn).toBeLessThan(0.45);
  });
  it('the drive is a daily ticketed event; the spring is a swim', () => {
    expect([drive.kind, drive.everyDays, drive.price, ride.minutes]).toEqual(['safari', 1, 7000, 120]);
    expect(y.spots!.find((s) => s.kind === 'swim')?.joy).toBeGreaterThan(0);
  });
});

describe('Obudu and the cable car', () => {
  const base = ALL_PACKS.find((p) => p.id === 'obudu-base')!;
  const ranch = ALL_PACKS.find((p) => p.id === 'obudu-ranch')!;
  const ride = base.cable!.ride;
  it('is a bus from Calabar (an estimate) to the base station; Obudu is a separate city pack', () => {
    expect([fareBetween('calabar-marina', 'obudu-base', 'coach'), minutesBetween('calabar-marina', 'obudu-base', 'coach')]).toEqual([10000, 345]);
    expect(coachesFrom('calabar-marina').map((a) => a.id)).toEqual(['obudu-base']);
    expect(CITY_PACKS.find((c) => c.id === 'obudu')?.builtIn).toBe(false);
  });
  it('the cable car and the hairpin road join the base and the ranch, both ways', () => {
    expect(cablesFrom('obudu-base').map((a) => a.id)).toEqual(['obudu-ranch']);
    expect(cablesFrom('obudu-ranch').map((a) => a.id)).toEqual(['obudu-base']);
    expect([fareBetween('obudu-ranch', 'obudu-base', 'cable'), minutesBetween('obudu-base', 'obudu-ranch', 'cable')]).toEqual([5000, 25]);
    expect(fareBetween('obudu-base', 'obudu-ranch')).toBe(2000);
    expect(cablesFrom('calabar-marina')).toEqual([]);
    expect(base.cable!.to).toBe('obudu-ranch');
    expect(ranch.cable).toBeUndefined();
  });
  it('the cable runs dead straight up the slope from a station on the street, climbing all the way', () => {
    const [x0, z0, x1, z1] = base.walkable[0];
    const [sx, sz] = ride.track[0];
    expect(sx > x0 && sx < x1 && sz > z0 && sz < z1).toBe(true);
    expect(new Set(ride.track.map(([x]) => x)).size).toBe(1);
    const h = ride.heights!;
    expect(h.length).toBe(ride.track.length);
    for (let i = 1; i < h.length; i++) expect(h[i]).toBeGreaterThan(h[i - 1]);
    expect(heightAlong(ride, trackLength(ride.track))).toBe(h[h.length - 1]);
    const secs = rideSeconds(ride);
    expect(secs).toBeGreaterThan(25);
    expect(secs).toBeLessThan(70);
    expect(sightingsBetween(ride, 0, trackLength(ride.track)).sort()).toEqual(ride.sightings.map((v) => v.id).sort());
  });
  it('going down rides the same track backwards, from the top to the station', () => {
    const top = ridePose3(ride, 0, true);
    expect([top.x, top.z, top.y]).toEqual([...ride.track[ride.track.length - 1], ride.heights![ride.heights!.length - 1]]);
    const end = ridePose3(ride, rideSeconds(ride) * 1000 + 1000, true);
    expect([end.x, end.z]).toEqual(ride.track[0]);
    expect(end.y).toBeCloseTo(ride.heights![0]);
  });
  it('the ranch: you step off the cable car on the street, and the ground ends beyond it at the plateau edge', () => {
    const [x0, z0, x1, z1] = ranch.walkable[0];
    const [cx, cz] = ranch.cableStation!.position;
    expect(cx > x0 && cx < x1 && cz > z0 && cz < z1).toBe(true);
    expect(ranch.groundEdge!).toBeLessThan(z0);
    const walk = ranch.jobs.find((j) => j.id === 'ranch-walk')!;
    expect(walk.requires?.discovered).toEqual(walk.tour!.stops);
  });
});
