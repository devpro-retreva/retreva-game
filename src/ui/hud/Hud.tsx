import { useEffect, useRef, useState } from 'react';
import { findJob, findNpc, formatMoney } from '../../game/content';
import { runtime } from '../../game/core/runtime';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';
import { formatClock, useRaf } from '../hooks';
import { IconChat, IconCoin, IconFlag, IconPause, IconPhone, IconPin } from '../icons/Icons';
import { MapView } from './MapView';

function MoneyChip() {
  const pack = usePack();
  const balance = useGame((s) => s.wallet.balance);
  const prev = useRef(balance);
  const [delta, setDelta] = useState<{ v: number; k: number } | null>(null);

  useEffect(() => {
    const d = balance - prev.current;
    prev.current = balance;
    if (d !== 0) setDelta((x) => ({ v: d, k: (x?.k ?? 0) + 1 }));
  }, [balance]);

  return (
    <div className={`money cut-sm ${delta && delta.v > 0 ? 'bump' : ''}`} key={delta?.k} style={{ position: 'relative' }}>
      <span className="amount num" aria-label={`Balance ${formatMoney(pack, balance)}`}>
        {formatMoney(pack, balance)}
      </span>
      <span className="where">
        {pack.area} · {pack.name}
      </span>
      {delta && (
        <span className={`delta num ${delta.v < 0 ? 'neg' : ''}`} aria-hidden="true">
          {delta.v > 0 ? '+' : ''}
          {formatMoney(pack, delta.v)}
        </span>
      )}
    </div>
  );
}

function Objective() {
  const pack = usePack();
  const active = useGame((s) => s.jobs.active);
  if (!active) return null;
  const job = findJob(pack, active.jobId);
  if (!job) return null;
  const npc = findNpc(pack, job.dropoffNpcId);
  const elapsed = job.timeLimitMs - active.remainingMs;
  const bonusLeft = job.bonus.underMs - elapsed;
  const pct = Math.max(0, active.remainingMs / job.timeLimitMs) * 100;
  const low = active.remainingMs < 10_000;
  const bonusMark = (1 - job.bonus.underMs / job.timeLimitMs) * 100;
  return (
    <div className="objective cut-sm" role="status" aria-live="off">
      <div className="row">
        <span className="title">{job.title}</span>
        <span className={`timer num ${low ? 'low' : ''}`}>{formatClock(active.remainingMs)}</span>
      </div>
      <div className="goal">
        {job.kind === 'collect' && job.collect ? (
          (active.collected?.length ?? 0) >= job.collect.count ? (
            <>Report back to <b>{npc?.name}</b></>
          ) : (
            <>
              <b className="num">{active.collected?.length ?? 0}/{job.collect.count}</b> {job.collect.item}s picked up
            </>
          )
        ) : (
          <>
            Take the {job.cargo.toLowerCase()} to <b>{npc?.name}</b>
          </>
        )}
      </div>
      <div className="bar" aria-hidden="true">
        <i className={low ? 'low' : ''} style={{ width: `${pct}%` }} />
        <b style={{ left: `${bonusMark}%` }} />
      </div>
      <div className="bonus num">
        {bonusLeft > 0 ? `+${formatMoney(pack, job.bonus.amount)} speed bonus · ${formatClock(bonusLeft)}` : 'Speed bonus missed — still deliver it'}
      </div>
    </div>
  );
}

function Fps() {
  const show = useGame((s) => s.settings.showFps);
  const el = useRef<HTMLDivElement>(null);
  const acc = useRef(0);
  useRaf((dt) => {
    acc.current += dt;
    if (acc.current < 0.5 || !el.current) return;
    acc.current = 0;
    el.current.textContent = `${runtime.perf.fps} fps · ${runtime.perf.drawCalls} calls`;
  }, show);
  return show ? <div className="fps num" ref={el} /> : null;
}

export function InteractionPrompt() {
  const nearby = useGame((s) => s.nearby);
  const ui = useGame((s) => s.ui);
  const interact = useGame((s) => s.interact);
  if (!nearby || ui !== 'play') return null;
  return (
    <button className="prompt cut-sm" onClick={interact} aria-label={`${nearby.verb} ${nearby.label}`}>
      <span className="key">E</span>
      <span>
        {nearby.verb} <strong>{nearby.label}</strong>
      </span>
    </button>
  );
}

export function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  useEffect(() => {
    if (!toasts.length) return;
    const t = toasts[0];
    const id = setTimeout(() => dismiss(t.id), t.kind === 'money' ? 3600 : 2800);
    return () => clearTimeout(id);
  }, [toasts, dismiss]);
  return (
    <div className="toasts" aria-live="polite" role="status">
      {toasts.map((t) => (
        <div key={t.id} className={`toast cut-sm is-${t.kind}`}>
          {t.kind === 'money' && <IconCoin size={20} style={{ color: 'var(--danfo)', flex: 'none' }} />}
          {t.kind === 'discover' && <IconPin size={20} style={{ color: 'var(--sky)', flex: 'none' }} />}
          {t.kind === 'goal' && <IconFlag size={20} style={{ color: 'var(--danfo)', flex: 'none' }} />}
          {t.kind === 'message' && <IconChat size={20} style={{ color: 'var(--cream)', flex: 'none' }} />}
          <div>
            <div className="t num">{t.title}</div>
            {t.detail && <div className="d">{t.detail}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ControlsHint({ touch }: { touch: boolean }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setGone(true), 11000);
    return () => clearTimeout(id);
  }, []);
  if (touch) {
    return (
      <div className={`hint cut-sm ${gone ? 'gone' : ''}`} aria-hidden={gone}>
        <span>Left thumb: move</span>
        <span>Right thumb: look</span>
        <span>Push the stick far to run</span>
      </div>
    );
  }
  return (
    <div className={`hint desktop cut-sm ${gone ? 'gone' : ''}`} aria-hidden={gone}>
      <span>
        <span className="key">W</span>
        <span className="key">A</span>
        <span className="key">S</span>
        <span className="key">D</span> move
      </span>
      <span>
        <span className="key">Shift</span> run
      </span>
      <span>Drag to look</span>
      <span>
        <span className="key">E</span> interact
      </span>
      <span>
        <span className="key">P</span> phone
      </span>
      <span>
        <span className="key">Esc</span> pause
      </span>
    </div>
  );
}

export function Hud({ touch }: { touch: boolean }) {
  const pack = usePack();
  const openPhone = useGame((s) => s.openPhone);
  const togglePause = useGame((s) => s.togglePause);
  const unread = useGame((s) => s.world.messages.filter((m) => !m.read).length);
  return (
    <>
      <div className="hud-tl">
        <MoneyChip />
        <Objective />
      </div>
      <div className="hud-tr">
        <div className="stack">
          <button className="icon-btn phone-btn" onClick={() => openPhone()} aria-label="Open phone (P)" title="Phone (P)">
            <IconPhone />
            {unread > 0 && <span className="hud-badge num" aria-label={`${unread} unread messages`}>{unread}</span>}
          </button>
          <button className="icon-btn" onClick={togglePause} aria-label="Pause (Esc)" title="Pause (Esc)">
            <IconPause size={18} />
          </button>
        </div>
        <div className="stack">
          <div className="minimap cut">
            <MapView pack={pack} mode="follow" />
          </div>
          <Fps />
        </div>
      </div>
      <InteractionPrompt />
      <ControlsHint touch={touch} />
    </>
  );
}
