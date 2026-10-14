import { describe, expect, it } from 'vitest';
import { createWallet, credit, debit } from './economy';
import { addItem, countItem, emptyInventory, removeFromStack } from './inventory';
import { acceptJob, deliverJob, emptyJobs, isAvailable, tickJob, DELIVERY_RANGE } from './jobs';
import { resolveEntry } from './dialogue';
import { lagos } from '../content/destinations/lagos';
import { MemorySaveAdapter } from '../persistence/adapters';
import { SaveManager, migrate } from '../persistence/saveManager';
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
      settings: { cameraSensitivity: 1, invertY: false, reducedMotion: false, textScale: 1 as const, shadows: 'auto' as const, showFps: false },
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
    expect(m?.schemaVersion).toBe(2);
    expect(m?.profile.avatar.gender).toBe('male');
    expect(m?.profile.avatar.headwear).toBe('cap');
    expect(m?.wallet.balance).toBe(900);
  });
});
