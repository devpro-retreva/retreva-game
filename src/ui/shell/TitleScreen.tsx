import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { SaveData } from '../../game/persistence/types';
import { formatDuration } from '../hooks';
import car from '../../assets/splash/car.svg';
import dubai from '../../assets/splash/dubai.svg';
import globe from '../../assets/splash/globe.svg';
import heroes from '../../assets/splash/heroes.svg';
import horizon from '../../assets/splash/horizon.svg';
import jet from '../../assets/splash/jet.svg';
import jewelry from '../../assets/splash/jewelry.svg';
import maldives from '../../assets/splash/maldives.svg';
import newyork from '../../assets/splash/newyork.svg';
import paris from '../../assets/splash/paris.svg';
import santorini from '../../assets/splash/santorini.svg';
import tokyo from '../../assets/splash/tokyo.svg';
import villa from '../../assets/splash/villa.svg';

/*
 * The title screen is the game's cover art. The art lives on a fixed design "stage"
 * (1920×1080 for landscape screens, 1080×2080 for portrait phones) that is scaled to fit
 * the screen; the sky, globe glow and skyline bleed past it so any aspect ratio is filled.
 * Positions below are in stage units: `u(n)` turns a design pixel into a CSS length.
 */
const u = (n: number) => `calc(var(--u) * ${n})`;
const at = (x: number, y: number, w: number, extra: CSSProperties = {}): CSSProperties => ({ left: u(x), top: u(y), width: u(w), ...extra });

type Card = { src: string; label: string; alt: string; pin?: boolean };
const CARDS: Record<string, Card> = {
  paris: { src: paris, label: 'Paris', alt: 'Paris at dusk with the Eiffel Tower lit gold', pin: true },
  tokyo: { src: tokyo, label: 'Tokyo', alt: 'Mount Fuji at sunrise with a pagoda and cherry blossom', pin: true },
  dubai: { src: dubai, label: 'Dubai', alt: 'Dubai skyline with palms and the sea', pin: true },
  newyork: { src: newyork, label: 'New York', alt: 'New York skyline at night', pin: true },
  santorini: { src: santorini, label: 'Santorini', alt: 'Santorini houses and blue domes at sunset', pin: true },
  maldives: { src: maldives, label: 'Maldives', alt: 'Overwater villas on a turquoise lagoon', pin: true },
  villa: { src: villa, label: 'Your dream home', alt: 'Modern villa with an infinity pool' },
  jewelry: { src: jewelry, label: 'Treat yourself', alt: 'Diamond necklace, ring and gold watch' },
};

type Placed = [key: keyof typeof CARDS, x: number, y: number, rot: number];
const LAYOUT = {
  land: {
    w: 1920,
    h: 1080,
    cardW: 250,
    globe: [880, 110, 960],
    jet: [1446, 300, 280],
    car: [650, 840, 560],
    heroes: [1020, 206, 640],
    chip: [1594, 978, 300] as [number, number, number] | null,
    cards: [
      ['paris', 760, 64, -7], ['tokyo', 1046, 30, 4], ['dubai', 1336, 52, -3], ['newyork', 1626, 98, 7],
      ['santorini', 812, 392, -5], ['maldives', 1642, 424, 5], ['villa', 1652, 716, -4], ['jewelry', 800, 640, 6],
    ] as Placed[],
  },
  port: {
    w: 1080,
    h: 2080,
    cardW: 290,
    globe: [40, 640, 1000],
    jet: [806, 14, 260],
    car: [-60, 1386, 600],
    heroes: [180, 716, 720],
    chip: null,
    cards: [
      ['paris', 30, 476, -8], ['tokyo', 395, 458, 3], ['dubai', 760, 484, -4],
      ['newyork', 14, 800, -6], ['maldives', 776, 806, 6],
      ['santorini', 22, 1112, 4], ['villa', 770, 1116, -4], ['jewelry', 774, 1378, 5],
    ] as Placed[],
  },
} as const;

function useOrientation(): 'land' | 'port' {
  const query = '(min-aspect-ratio: 1/1)';
  const get = () => (typeof matchMedia === 'undefined' || matchMedia(query).matches ? 'land' : 'port');
  const [o, setO] = useState<'land' | 'port'>(get);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setO(mq.matches ? 'land' : 'port');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return o;
}

const Pin = () => (
  <svg className="sp-pin" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

function Postcard({ card, keyName, x, y, rot, w }: { card: Card; keyName: string; x: number; y: number; rot: number; w: number }) {
  return (
    <figure className={`sp-card k-${keyName}`} style={at(x, y, w, { transform: `rotate(${rot}deg)`, padding: `${u(w * 0.04)} ${u(w * 0.04)} 0` })}>
      <img src={card.src} alt={card.alt} draggable={false} />
      <figcaption style={{ height: u(w * 0.184), fontSize: u(w * 0.112) }}>
        {card.pin && <Pin />}
        {card.label}
      </figcaption>
    </figure>
  );
}

const STEPS: { label: string; icon: ReactNode }[] = [
  { label: 'Hustle', icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" /></> },
  { label: 'Earn', icon: <><circle cx="12" cy="12" r="9" /><path d="M8.5 16V8l7 8V8M7 11h10M7 13h10" /></> },
  { label: 'Live large', icon: <path d="M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l3 18M15 3l-3 18" /> },
  { label: 'See the world', icon: <path d="M2.5 13.5l19-8-6 15-3.5-6.5zM12 14l9.5-8.5" /> },
];

function Journey() {
  return (
    <div className="sp-journey" aria-label="Hustle, earn, live large, see the world">
      {STEPS.map((s, i) => (
        <span key={s.label} className="sp-step">
          {i > 0 && <span className="sp-dash" aria-hidden="true" />}
          <svg viewBox="0 0 24 24" aria-hidden="true">{s.icon}</svg>
          {s.label}
        </span>
      ))}
    </div>
  );
}

export function TitleScreen({ save, onContinue, onNew }: { save: SaveData | null; onContinue: () => void; onNew: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const o = useOrientation();
  const L = LAYOUT[o];

  return (
    <main className={`screen-full splash is-${o}`}>
      <div className="sp-sky" aria-hidden="true" />
      <img className="sp-horizon" src={horizon} alt="" aria-hidden="true" draggable={false} />
      <div className="sp-shade" aria-hidden="true" />

      <div className={`sp-stage ${o}`}>
        <img className="sp-abs" src={globe} alt="" aria-hidden="true" style={at(L.globe[0], L.globe[1], L.globe[2])} draggable={false} />
        {L.cards.map(([key, x, y, rot]) => (
          <Postcard key={key} keyName={key} card={CARDS[key]} x={x} y={y} rot={rot} w={L.cardW} />
        ))}
        <img className="sp-abs" src={jet} alt="Private jet climbing into the sky" style={at(L.jet[0], L.jet[1], L.jet[2])} draggable={false} />
        <img className="sp-abs" src={car} alt="Red luxury sports car" style={at(L.car[0], L.car[1], L.car[2])} draggable={false} />
        <img
          className="sp-abs"
          src={heroes}
          alt="A stylish woman in an emerald dress with a passport and phone, beside a man in a cream linen suit with a luxury suitcase"
          style={at(L.heroes[0], L.heroes[1], L.heroes[2])}
          draggable={false}
        />
        {L.chip && (
          <div className="sp-chip" aria-hidden="true" style={at(L.chip[0], L.chip[1], L.chip[2])}>
            <span className="sp-chip-ico">
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <span className="sp-chip-txt">
              <b>+₦1,500</b>
              <span>Jollof Run complete</span>
            </span>
          </div>
        )}

        <div className="sp-copy">
          <div className="sp-kicker">A lifestyle &amp; travel adventure</div>
          <h1 className="wordmark">
            Retr<em>e</em>va
          </h1>
          <p className="tagline">Build a virtual lifestyle and travel to places of your dreams.</p>
          {save && (
            <p className="continue-meta num">
              {save.profile.name} · ₦{save.wallet.balance.toLocaleString('en-NG')} · played {formatDuration(save.stats.playTimeMs)}
            </p>
          )}
          <div className="sp-bottom">
          <div className="title-actions">
            {save ? (
              <button className="sp-btn primary cta-shine" onClick={onContinue} autoFocus>
                Continue
              </button>
            ) : (
              <button className="sp-btn primary cta-shine" onClick={onNew} autoFocus>
                Start a new life
              </button>
            )}
            {save &&
              (confirm ? (
                <button className="sp-btn danger" onClick={onNew}>
                  Replace my save
                </button>
              ) : (
                <button className="sp-btn ghost" onClick={() => setConfirm(true)}>
                  New life
                </button>
              ))}
          </div>
          <Journey />
          <div className="sp-story">Your story starts from your city.</div>
          <div className="title-foot">Saves on this device · No account needed</div>
          </div>
        </div>
      </div>
    </main>
  );
}
