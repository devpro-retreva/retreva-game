import { useEffect, useState } from 'react';
import { findBusiness, findItem, findNpc, formatMoney, localPrice } from '../../game/content';
import { round50 } from '../../game/systems/negotiation';
import { countItem } from '../../game/systems/inventory';
import { useGame } from '../../game/store/gameStore';
import { resaleValue } from '../../game/systems/life';
import { usePack } from '../../scene/worldContext';
import { IconClose, ITEM_ICONS } from '../icons/Icons';

const MOOD_LINES: Record<string, (ask: string) => string> = {
  opening: (ask) => `My price is ${ask}. What will you pay?`,
  counter: (ask) => `Ah, you want to finish me! Okay, ${ask} — last last.`,
  insulted: (ask) => `Ehn?! That is an insult. Price is ${ask}. Talk well o.`,
  final: (ask) => `Final price: ${ask}. Take it or leave it.`,
  deal: () => 'Deal! You bargain well. Enjoy it.',
  walked: () => 'No wahala. Come back when you are ready.',
};

function Haggle() {
  const pack = usePack();
  const h = useGame((s) => s.haggle)!;
  const balance = useGame((s) => s.wallet.balance);
  const offer = useGame((s) => s.offer);
  const accept = useGame((s) => s.acceptHaggle);
  const leave = useGame((s) => s.leaveHaggle);
  const biz = findBusiness(pack, h.businessId);
  const owner = biz && findNpc(pack, biz.ownerNpcId);
  const item = findItem(pack, h.itemId);
  const min = round50(h.listPrice * 0.4);
  const [value, setValue] = useState(() => round50(h.ask * 0.75));

  useEffect(() => {
    // keep the slider below the current ask after a counter-offer
    setValue((v) => Math.min(v, Math.max(min, h.ask - 50)));
  }, [h.ask, min]);

  const askText = formatMoney(pack, h.ask);
  const open = h.status === 'open';
  const done = h.status === 'deal' || h.status === 'walked';

  return (
    <div className="haggle">
      <div className="haggle-item">
        <div className="name">{item?.name}</div>
        <div className="desc num">List price {formatMoney(pack, h.listPrice)}</div>
      </div>
      <div className="haggle-seller">
        <div className="eyelabel">{owner?.name}</div>
        <p className="haggle-line">“{MOOD_LINES[h.mood](askText)}”</p>
        {!done && (
          <div className="haggle-ask">
            <span className="eyelabel">Asking</span>
            <b className="num">{askText}</b>
            <span className="patience" aria-label={`Seller patience ${h.patience}`}>
              {Array.from({ length: Math.max(h.patience, 0) }).map((_, i) => (
                <i key={i} />
              ))}
            </span>
          </div>
        )}
      </div>

      {open && (
        <div className="haggle-offer">
          <label className="eyelabel" htmlFor="offer">
            Your offer <b className="num" style={{ color: 'var(--cream)', marginLeft: 6 }}>{formatMoney(pack, value)}</b>
          </label>
          <input id="offer" type="range" min={min} max={h.ask} step={50} value={value} onChange={(e) => setValue(Number(e.target.value))} style={{ width: '100%' }} />
          <div className="choicegrid" role="group" aria-label="Quick offers">
            {[0.9, 0.8, 0.7, 0.6].map((k) => (
              <button key={k} type="button" className="pill-btn" onClick={() => setValue(Math.max(min, round50(h.listPrice * k)))}>
                −{Math.round((1 - k) * 100)}%
              </button>
            ))}
          </div>
          <div className="haggle-actions">
            <button className="btn" disabled={value > balance} onClick={() => offer(value)}>
              Offer {formatMoney(pack, value)}
            </button>
            <button className="btn ghost" disabled={h.ask > balance} onClick={accept}>
              Pay {askText}
            </button>
          </div>
        </div>
      )}
      {h.status === 'final' && (
        <div className="haggle-actions">
          <button className="btn" disabled={h.ask > balance} onClick={accept}>
            Pay {askText}
          </button>
          <button className="btn ghost" onClick={leave}>
            Walk away
          </button>
        </div>
      )}
      {(open || h.status === 'final') && h.ask > balance && <div className="desc" style={{ color: 'var(--coral)', marginTop: 8 }}>You have {formatMoney(pack, balance)} — not enough for this price.</div>}
      {open && (
        <button className="link-btn" onClick={leave}>
          Walk away
        </button>
      )}
      {done && (
        <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => useGame.setState({ haggle: null })}>
          Back to the stall
        </button>
      )}
    </div>
  );
}

export function ShopPanel() {
  const pack = usePack();
  const shopId = useGame((s) => s.shopId);
  const balance = useGame((s) => s.wallet.balance);
  const inventory = useGame((s) => s.inventory);
  const haggle = useGame((s) => s.haggle);
  const buy = useGame((s) => s.buy);
  const startHaggle = useGame((s) => s.startHaggle);
  const close = useGame((s) => s.closePanel);
  const sell = useGame((s) => s.sell);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [pending, setPending] = useState<string | null>(null);
  const biz = shopId ? findBusiness(pack, shopId) : undefined;
  if (!biz) return null;
  const buysBack = biz.kind !== 'food';
  const sellable = inventory.entries
    .map((e) => ({ e, item: findItem(pack, e.itemId) }))
    .filter((x) => x.item && resaleValue(x.e.purchasePrice, x.item.category) > 0);
  const owner = findNpc(pack, biz.ownerNpcId);

  return (
    <section className="sheet cut" role="dialog" aria-label={biz.name}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">
            {biz.kind === 'food' ? 'Menu' : biz.haggle ? 'Market stall · bargaining welcome' : 'Shop'} · {owner?.name}
          </div>
          <h2>{biz.name}</h2>
          <p>“{biz.greeting}”</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
        {!haggle && buysBack && (
          <div className="seg tabs" role="tablist" aria-label="Buy or sell" style={{ margin: '4px 0 8px' }}>
            <button role="tab" aria-selected={tab === 'buy'} aria-pressed={tab === 'buy'} onClick={() => setTab('buy')}>
              Buy
            </button>
            <button role="tab" aria-selected={tab === 'sell'} aria-pressed={tab === 'sell'} onClick={() => { setTab('sell'); setPending(null); }}>
              Sell{sellable.length ? ` (${sellable.length})` : ''}
            </button>
          </div>
        )}
        {haggle ? (
          <Haggle />
        ) : tab === 'sell' && buysBack ? (
          sellable.length === 0 ? (
            <p className="muted" style={{ padding: '8px 4px' }}>
              Nothing to sell. {biz.name} buys back bags, clothes, souvenirs and goods at half what you paid. Food and drink can't be resold.
            </p>
          ) : (
            <ul className="rows">
              {sellable.map(({ e, item }) => {
                const Icon = ITEM_ICONS[item!.icon] ?? ITEM_ICONS.bag;
                const value = resaleValue(e.purchasePrice, item!.category);
                const confirming = pending === e.key;
                return (
                  <li key={e.key} className="row-item">
                    <span className="glyph cut-sm">
                      <Icon size={20} />
                    </span>
                    <div>
                      <div className="name">
                        {item!.name} <span className="muted">×{e.quantity}</span>
                      </div>
                      <div className="desc num">
                        You paid {formatMoney(pack, e.purchasePrice)} · they offer {formatMoney(pack, value)}
                      </div>
                    </div>
                    <div className="side">
                      {confirming ? (
                        <>
                          <button className="btn" onClick={() => { sell(e.key); setPending(null); }} aria-label={`Confirm: sell ${item!.name} for ${formatMoney(pack, value)}`}>
                            Confirm
                          </button>
                          <button className="btn ghost" onClick={() => setPending(null)}>
                            Keep
                          </button>
                        </>
                      ) : (
                        <button className="btn ghost" onClick={() => setPending(e.key)} aria-label={`Sell ${item!.name} for ${formatMoney(pack, value)}`}>
                          Sell {formatMoney(pack, value)}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <ul className="rows">
            {biz.stock.map((s) => {
              const item = findItem(pack, s.itemId);
              if (!item) return null;
              const Icon = ITEM_ICONS[item.icon] ?? ITEM_ICONS.bag;
              const owned = countItem(inventory, item.id);
              const afford = balance >= s.price;
              return (
                <li key={s.itemId} className="row-item">
                  <span className="glyph cut-sm">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="name">{item.name}</div>
                    <div className="desc">{item.description}</div>
                    {owned > 0 && <div className="desc" style={{ color: 'var(--cream-2)' }}>In your bag: {owned}</div>}
                  </div>
                  <div className="side">
                    <span className="price num">{formatMoney(pack, s.price)}</span>
                    {localPrice(pack, s.price) && <span className="local-price num">{localPrice(pack, s.price)}</span>}
                    {biz.haggle ? (
                      <button className="btn" onClick={() => startHaggle(biz.id, item.id)} aria-label={`Bargain for ${item.name}`}>
                        Bargain
                      </button>
                    ) : (
                      <button className="btn" disabled={!afford} onClick={() => buy(biz.id, item.id)} aria-label={`Buy ${item.name} for ${formatMoney(pack, s.price)}`}>
                        {afford ? 'Buy' : 'Short'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <footer className="sheet-foot">
        <span>Your money{pack.localCurrency ? ` · ${pack.localCurrency.code} shown as a guide` : ''}</span>
        <b className="num">{formatMoney(pack, balance)}</b>
      </footer>
    </section>
  );
}
