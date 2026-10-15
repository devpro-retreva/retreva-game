import { useState } from 'react';
import { findItem, findNpc, formatMoney } from '../../game/content';
import { findVehicle } from '../../game/content/vehicles';
import { useGame } from '../../game/store/gameStore';
import { regardTier } from '../../game/systems/life';
import { friendDiscount, friendPrice } from '../../game/systems/social';
import { vehicleResale } from '../../game/systems/vehicles';
import { usePack } from '../../scene/worldContext';
import { IconClose, ITEM_ICONS } from '../icons/Icons';

/** Pick something from your bag to give. Liked things are marked; giving asks once to confirm. */
export function GiftPanel() {
  const pack = usePack();
  const dialogue = useGame((s) => s.dialogue);
  const inventory = useGame((s) => s.inventory);
  const regard = useGame((s) => (dialogue ? s.life.regard[dialogue.npcId] ?? 0 : 0));
  const give = useGame((s) => s.giveGift);
  const close = useGame((s) => s.closePanel);
  const [pending, setPending] = useState<string | null>(null);
  const npc = dialogue ? findNpc(pack, dialogue.npcId) : undefined;
  if (!npc?.social) return null;
  const giftable = inventory.entries
    .map((e) => ({ e, item: findItem(pack, e.itemId) }))
    .filter((x) => x.item && x.item.category !== 'ticket' && x.item.category !== 'document');
  const likes = (id: string, cat: string) => npc.social!.likes.includes(id) || npc.social!.likes.includes(cat);
  return (
    <section className="sheet cut" role="dialog" aria-label={`Give ${npc.name} a gift`}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">
            Gift · {npc.name} · {regardTier(regard)}
          </div>
          <h2>Give a gift</h2>
          <p>Something they like means more. Friends get a better price at their shop.</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="sheet-body">
        {giftable.length === 0 ? (
          <p className="muted">Your bag is empty. Buy something first — snacks, drinks, fabric, souvenirs.</p>
        ) : (
          <ul className="rows">
            {giftable.map(({ e, item }) => {
              const Icon = ITEM_ICONS[item!.icon] ?? ITEM_ICONS.bag;
              const loved = likes(item!.id, item!.category);
              return (
                <li key={e.key} className="row-item">
                  <span className="glyph cut-sm">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="name">
                      {item!.name} <span style={{ color: 'var(--muted)', fontWeight: 600 }}>×{e.quantity}</span>
                    </div>
                    <div className="desc">{loved ? `♥ ${npc.name} would love this` : 'A kind thought'}</div>
                  </div>
                  <div className="side">
                    {pending === e.key ? (
                      <>
                        <button className="btn" onClick={() => give(e.key)} aria-label={`Confirm: give ${item!.name}`}>
                          Give it
                        </button>
                        <button className="btn ghost" onClick={() => setPending(null)}>
                          Keep
                        </button>
                      </>
                    ) : (
                      <button className="btn ghost" onClick={() => setPending(e.key)} aria-label={`Give ${item!.name}`}>
                        Give
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

/** A vehicle dealer: buy (price, friend discount, what you get, confirm) and sell back (half price, confirm). */
export function DealerPanel() {
  const pack = usePack();
  const dealerId = useGame((s) => s.dealerId);
  const balance = useGame((s) => s.wallet.balance);
  const vehicles = useGame((s) => s.life.vehicles);
  const riding = useGame((s) => s.life.riding);
  const regardOf = useGame((s) => s.life.regard);
  const buy = useGame((s) => s.buyVehicle);
  const sell = useGame((s) => s.sellVehicle);
  const close = useGame((s) => s.closePanel);
  const [pending, setPending] = useState<string | null>(null);
  const dealer = pack.dealers?.find((d) => d.id === dealerId);
  if (!dealer) return null;
  const regard = regardOf[dealer.npcId] ?? 0;
  const pct = friendDiscount(regard);
  const mineHere = vehicles.filter((v) => riding === v.uid || v.parked?.areaId === pack.id);
  return (
    <section className="sheet cut" role="dialog" aria-label={dealer.name}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">Vehicles · {findNpc(pack, dealer.npcId)?.name}</div>
          <h2>{dealer.name}</h2>
          <p>{pct ? `Friend price: ${Math.round(pct * 100)}% off.` : 'Own it, ride it, park it anywhere. Sell it back any time for half.'}</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="sheet-body">
        <ul className="rows">
          {dealer.stock.map((st) => {
            const def = findVehicle(st.vehicleId);
            if (!def) return null;
            const price = friendPrice(st.price, regard);
            const afford = balance >= price;
            const key = `buy:${def.id}`;
            return (
              <li key={def.id} className="row-item dealer-row">
                <div>
                  <div className="name">{def.name}</div>
                  <div className="desc">{def.description}</div>
                  <div className="desc num" style={{ color: 'var(--cream-2)' }}>
                    {(def.speed / 3.4).toFixed(1)}× walking speed · {Math.round((1 - def.effort) * 100)}% less tiring than walking
                  </div>
                </div>
                <div className="side">
                  {price !== st.price && <s className="num muted">{formatMoney(pack, st.price)}</s>}
                  <span className="price num">{formatMoney(pack, price)}</span>
                  {pending === key ? (
                    <button className="btn" onClick={() => { if (buy(dealer.id, def.id)) setPending(null); }}>
                      Confirm · pay {formatMoney(pack, price)}
                    </button>
                  ) : (
                    <button className="btn" disabled={!afford} onClick={() => setPending(key)} aria-label={`Buy ${def.name} for ${formatMoney(pack, price)}`}>
                      {afford ? 'Buy' : 'Short'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {mineHere.length > 0 && (
          <>
            <div className="eyelabel section-title">Sell yours</div>
            <ul className="rows">
              {mineHere.map((v) => {
                const def = findVehicle(v.vehicleId);
                const value = vehicleResale(v.paid);
                const key = `sell:${v.uid}`;
                return (
                  <li key={v.uid} className="row-item">
                    <div>
                      <div className="name">{def?.name}</div>
                      <div className="desc">
                        You paid {formatMoney(pack, v.paid)} · {riding === v.uid ? 'you are riding it' : 'parked here'}. Selling is final.
                      </div>
                    </div>
                    <div className="side">
                      {pending === key ? (
                        <>
                          <button className="btn danger" onClick={() => { sell(v.uid); setPending(null); }} aria-label={`Confirm: sell ${def?.name} for ${formatMoney(pack, value)}`}>
                            Sell · {formatMoney(pack, value)}
                          </button>
                          <button className="btn ghost" onClick={() => setPending(null)}>
                            Keep
                          </button>
                        </>
                      ) : (
                        <button className="btn ghost" onClick={() => setPending(key)} aria-label={`Sell ${def?.name} for ${formatMoney(pack, value)}`}>
                          Sell {formatMoney(pack, value)}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
      <footer className="sheet-foot">
        <span>Your money</span>
        <b className="num">{formatMoney(pack, balance)}</b>
      </footer>
    </section>
  );
}
