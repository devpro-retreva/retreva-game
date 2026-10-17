import { useEffect } from 'react';
import { getDestination, formatMoney } from '../../game/content';
import { boatsFrom, coachesFrom, fareBetween, findArea, minutesBetween, modeBetween, regionOf, routeBetween, type RegionArea, type TravelBy } from '../../game/content/regions';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';
import { IconClose } from '../icons/Icons';
import { LagosMap } from './LagosMap';
import { CoachMap } from './SouthWestMap';
import { useCityReady } from '../panels/CityPanels';

/**
 * Choose where to go: within the region (by road, or by boat from a jetty), or to another city by intercity bus from a
 * motor park — fare, trip time, route, and whether you have been before.
 */
export function TravelPanel() {
  const pack = usePack();
  const current = useGame((s) => s.destinationId);
  const visited = useGame((s) => s.world.visited);
  const balance = useGame((s) => s.wallet.balance);
  const close = useGame((s) => s.closePanel);
  const by = useGame((s) => s.travelBy);
  const here = findArea(current);
  const region = regionOf(current);
  const boat = by === 'boat';
  const coach = by === 'coach';
  const others = boat ? boatsFrom(current) : coach ? coachesFrom(current) : region?.areas.filter((a) => a.id !== current) ?? [];

  return (
    <section className="sheet travel-sheet cut" role="dialog" aria-label="Choose a destination">
      <header className="sheet-head">
        <div>
          <div className="eyelabel">{boat ? region?.boatName ?? 'Boat' : coach ? modeBetween(current, current, 'coach') : here?.hub === 'airport' ? 'Taxi' : region?.transit} · from {here?.district}</div>
          <h2>{boat ? 'Where by boat?' : coach ? 'Which city?' : 'Where to?'}</h2>
          <p>{boat ? 'Pay the fare and take the boat across the lagoon — life jackets on.' : coach ? 'Pay for a seat and the bus leaves when it’s full — it always is.' : `Pay the fare and ride to another part of ${region?.name ?? 'town'}.`}</p>
        </div>
        <button className="icon-btn" onClick={close} aria-label="Close (Esc)">
          <IconClose size={18} />
        </button>
      </header>
      <div className="sheet-body">
        {region?.map === 'lagos' && !coach && (
          <div className="travel-map cut-sm">
            <LagosMap current={current} visited={visited} />
          </div>
        )}
        <ul className="rows">
          {others.map((a) => (
            <TravelRow key={a.id} area={a} by={by} />
          ))}
        </ul>
      </div>
      <footer className="sheet-foot">
        <span>Your money</span>
        <b className="num">{formatMoney(pack, balance)}</b>
      </footer>
    </section>
  );
}

/** One place you can go: what it's like, how you get there, the fare. A bus to another city waits for that city to load. */
function TravelRow({ area: a, by }: { area: RegionArea; by: TravelBy }) {
  const pack = usePack();
  const current = useGame((s) => s.destinationId);
  const visited = useGame((s) => s.world.visited);
  const balance = useGame((s) => s.wallet.balance);
  const travelTo = useGame((s) => s.travelTo);
  const ready = useCityReady(a.id);
  const coach = by === 'coach';
  const dest = getDestination(a.id);
  const fare = fareBetween(current, a.id, by);
  const afford = balance >= fare;
  const seen = visited.includes(a.id);
  const mode = modeBetween(current, a.id, by);
  const via = routeBetween(current, a.id, by)?.via;
  const verb = by === 'boat' ? 'Boat' : coach ? 'Bus' : mode === 'Taxi' ? 'Taxi' : 'Ride';
  const place = coach ? `${regionOf(a.id)?.name} · ${a.district}` : a.district;
  return (
    <li className="row-item travel-row" data-area={a.id}>
      <div>
        <div className="name">
          {place} {!seen && <span className="chip live" style={{ marginLeft: 6 }}>New</span>}
        </div>
        <div className="desc">{ready === 'ready' ? dest.tagline : ready === 'loading' ? 'Getting the city ready…' : 'Not on this device — connect to the internet to go.'}</div>
        <div className="desc num" style={{ color: 'var(--cream-2)' }}>
          {mode}{via ? ` ${via}` : ''} · {a.known} · {tripTime(minutesBetween(current, a.id, by))}
        </div>
      </div>
      <div className="side">
        <span className="price num">{formatMoney(pack, fare)}</span>
        <button className="btn" disabled={!afford || ready !== 'ready'} onClick={() => travelTo(a.id, by)} aria-label={`${verb} to ${coach ? regionOf(a.id)?.name : a.district} for ${formatMoney(pack, fare)}`}>
          {afford ? verb : 'Short'}
        </button>
      </div>
    </li>
  );
}

/** "about 45 min", "about 2 h", "about 1 h 50 min". */
function tripTime(min: number): string {
  if (min < 60) return `about ${min} min`;
  const h = Math.floor(min / 60);
  const m = Math.round((min % 60) / 5) * 5;
  return m ? `about ${h} h ${m} min` : `about ${h} h`;
}

/** The ride itself: a short animated trip across the map, then arrival. */
export function TransitOverlay() {
  const transit = useGame((s) => s.transit);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const arrive = useGame((s) => s.arrive);
  const duration = reduced ? 1200 : transit?.by === 'coach' ? 5000 : 3000;

  useEffect(() => {
    if (!transit) return;
    const id = setTimeout(arrive, duration + 300);
    return () => clearTimeout(id);
  }, [transit, arrive, duration]);

  if (!transit) return null;
  const from = findArea(transit.from);
  const to = findArea(transit.to);
  const dest = getDestination(transit.to);
  const mode = modeBetween(transit.from, transit.to, transit.by);
  const region = regionOf(transit.from);
  const boat = transit.by === 'boat';
  const coach = transit.by === 'coach';
  return (
    <div className={`transit${coach ? ' coach-transit' : ''}`} role="status" aria-live="polite">
      <div className="transit-card">
        <div className="eyelabel">{boat || coach ? `On the ${mode.toLowerCase()} · ${tripTime(minutesBetween(transit.from, transit.to, transit.by))}` : mode === 'Taxi' ? 'In a taxi' : `On the ${mode.toLowerCase()}`}</div>
        <h2>
          {coach ? regionOf(transit.from)?.name : from?.district} <span aria-hidden="true">→</span> {coach ? regionOf(transit.to)?.name : to?.district}
        </h2>
        {coach && (
          <div className="transit-map cut">
            <CoachMap from={transit.from} to={transit.to} durationMs={duration} reduced={reduced} />
          </div>
        )}
        {region?.map === 'lagos' && !coach && transit.by !== 'coach' && (
          <div className="transit-map cut">
            <LagosMap current={transit.from} highlight={transit.to} route={{ from: transit.from, to: transit.to, by: transit.by }} durationMs={duration} />
          </div>
        )}
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
  const ui = useGame((s) => s.ui);
  // only over live play — never through the phone, shop or dialogue
  if (!banner || ui !== 'play') return null;
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
