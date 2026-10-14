import { useEffect } from 'react';
import { getDestination, formatMoney } from '../../game/content';
import { LAGOS_AREAS, fareBetween, findArea, minutesBetween } from '../../game/content/regions/lagosState';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';
import { IconClose } from '../icons/Icons';
import { LagosMap } from './LagosMap';

/** Choose where to go: fare, trip time, and whether you have been before. */
export function TravelPanel() {
  const pack = usePack();
  const current = useGame((s) => s.destinationId);
  const visited = useGame((s) => s.world.visited);
  const balance = useGame((s) => s.wallet.balance);
  const travelTo = useGame((s) => s.travelTo);
  const close = useGame((s) => s.closePanel);
  const here = findArea(current);

  return (
    <section className="sheet travel-sheet cut" role="dialog" aria-label="Choose a destination">
      <header className="sheet-head">
        <div>
          <div className="eyelabel">Danfo · from {here?.district}</div>
          <h2>Where to?</h2>
          <p>Pay the fare and ride to another part of Lagos.</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="sheet-body">
        <div className="travel-map cut-sm">
          <LagosMap current={current} visited={visited} />
        </div>
        <ul className="rows">
          {LAGOS_AREAS.filter((a) => a.id !== current).map((a) => {
            const dest = getDestination(a.id);
            const fare = fareBetween(current, a.id);
            const afford = balance >= fare;
            const seen = visited.includes(a.id);
            return (
              <li key={a.id} className="row-item travel-row">
                <div>
                  <div className="name">
                    {a.district} {!seen && <span className="chip live" style={{ marginLeft: 6 }}>New</span>}
                  </div>
                  <div className="desc">{dest.tagline}</div>
                  <div className="desc num" style={{ color: 'var(--cream-2)' }}>
                    {a.known} · about {minutesBetween(current, a.id)} min
                  </div>
                </div>
                <div className="side">
                  <span className="price num">{formatMoney(pack, fare)}</span>
                  <button className="btn" disabled={!afford} onClick={() => travelTo(a.id)} aria-label={`Ride to ${a.district} for ${formatMoney(pack, fare)}`}>
                    {afford ? 'Ride' : 'Short'}
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

/** The ride itself: a short animated trip across the map, then arrival. */
export function TransitOverlay() {
  const transit = useGame((s) => s.transit);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const arrive = useGame((s) => s.arrive);
  const duration = reduced ? 1200 : 3000;

  useEffect(() => {
    if (!transit) return;
    const id = setTimeout(arrive, duration + 300);
    return () => clearTimeout(id);
  }, [transit, arrive, duration]);

  if (!transit) return null;
  const from = findArea(transit.from);
  const to = findArea(transit.to);
  const dest = getDestination(transit.to);
  return (
    <div className="transit" role="status" aria-live="polite">
      <div className="transit-card">
        <div className="eyelabel">On the danfo</div>
        <h2>
          {from?.district} <span aria-hidden="true">→</span> {to?.district}
        </h2>
        <div className="transit-map cut">
          <LagosMap current={transit.from} highlight={transit.to} route={{ from: transit.from, to: transit.to }} durationMs={duration} />
        </div>
        <p className="transit-line">{dest.tagline}</p>
        <div className="transit-meta num">
          Fare paid {formatMoney(dest, transit.fare)} · {transit.firstVisit ? 'First visit' : 'Welcome back'}
        </div>
      </div>
    </div>
  );
}

/** Area title card on arrival. */
export function AreaBanner() {
  const banner = useGame((s) => s.banner);
  const clear = useGame((s) => s.clearBanner);
  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(clear, 3800);
    return () => clearTimeout(id);
  }, [banner, clear]);
  if (!banner) return null;
  return (
    <div className="area-banner" key={banner.key} role="status" aria-live="polite">
      <div className="eyelabel">Now in</div>
      <div className="area-title">{banner.title}</div>
      <div className="area-tag">{banner.tagline}</div>
      <div className="stripes" style={{ width: 72, margin: '10px auto 0' }} />
    </div>
  );
}

/** First-time tip card: dismissible, never shown twice. */
export function TipCard() {
  const tip = useGame((s) => s.tip);
  const dismiss = useGame((s) => s.dismissTip);
  const updateSettings = useGame((s) => s.updateSettings);
  const ui = useGame((s) => s.ui);
  const banner = useGame((s) => s.banner);
  // Tips wait for free play and for the arrival title card, so they never cover a conversation, a panel or each other.
  if (!tip || ui !== 'play' || banner) return null;
  return (
    <aside className="tip-card cut" role="note" aria-label={`Tip: ${tip.title}`} key={tip.id}>
      <div className="tip-head">
        <span className="tip-badge" aria-hidden="true">i</span>
        <b>{tip.title}</b>
      </div>
      <p>{tip.text}</p>
      <div className="tip-actions">
        <button className="btn" onClick={dismiss}>
          Got it
        </button>
        <button className="btn ghost" onClick={() => updateSettings({ tips: false })}>
          Hide tips
        </button>
      </div>
    </aside>
  );
}
