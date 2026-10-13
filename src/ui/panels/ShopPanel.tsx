import { findBusiness, findItem, findNpc, formatMoney } from '../../game/content';
import { countItem } from '../../game/systems/inventory';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';
import { IconClose, ITEM_ICONS } from '../icons/Icons';

export function ShopPanel() {
  const pack = usePack();
  const shopId = useGame((s) => s.shopId);
  const balance = useGame((s) => s.wallet.balance);
  const inventory = useGame((s) => s.inventory);
  const buy = useGame((s) => s.buy);
  const close = useGame((s) => s.closePanel);
  const biz = shopId ? findBusiness(pack, shopId) : undefined;
  if (!biz) return null;
  const owner = findNpc(pack, biz.ownerNpcId);

  return (
    <section className="sheet cut" role="dialog" aria-label={biz.name}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">{biz.kind === 'food' ? 'Menu' : 'Shop'} · {owner?.name}</div>
          <h2>{biz.name}</h2>
          <p>“{biz.greeting}”</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
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
                  <button className="btn" disabled={!afford} onClick={() => buy(biz.id, item.id)} aria-label={`Buy ${item.name} for ${formatMoney(pack, s.price)}`}>
                    {afford ? 'Buy' : 'Short'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <footer className="sheet-foot">
        <span>Your money</span>
        <b className="num">{formatMoney(pack, balance)}</b>
      </footer>
    </section>
  );
}
