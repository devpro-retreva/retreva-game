import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '../../game/content';
import { useGame } from '../../game/store/gameStore';
import { levelProgress, skillLevel } from '../../game/systems/life';
import { benchLabels } from '../../game/systems/repair';
import { usePack } from '../../scene/worldContext';
import { IconBolt, IconHome, IconStar } from '../icons/Icons';

/** Repair bench: tap the repair steps in the right order before the bar runs out. Keys 1–9 tap the buttons. */
export function RepairPanel() {
  const pack = usePack();
  const run = useGame((s) => s.repair);
  const tap = useGame((s) => s.tapRepair);
  const timeout = useGame((s) => s.repairTimeout);
  const close = useGame((s) => s.closeRepair);
  const def = run ? pack.repairs?.find((x) => x.id === run.repairId) : undefined;
  const xp = useGame((s) => (def ? s.life.skills[def.skill] ?? 0 : 0));
  const [now, setNow] = useState(Date.now());
  const [shake, setShake] = useState(0);
  const lastMistakes = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const loop = () => {
      setNow(Date.now());
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  useEffect(() => {
    if (run && !run.outcome && now > run.deadline) timeout();
  }, [now, run, timeout]);
  useEffect(() => {
    if (!run) return;
    if (run.mistakes > lastMistakes.current) setShake((k) => k + 1);
    lastMistakes.current = run.mistakes;
  }, [run]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const r = useGame.getState().repair;
      if (!r) return;
      if (r.outcome && (e.key === 'Enter' || e.key === 'Escape')) close();
      const n = Number(e.key);
      if (!r.outcome && n >= 1 && n <= r.buttons.length) tap(r.buttons[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tap, close]);

  if (!run || !def) return null;
  const owner = pack.npcs.find((n) => n.id === def.npcId);
  const device = def.devices[run.queue[Math.min(run.index, run.queue.length - 1)]];
  const l = benchLabels(def);
  const left = Math.max(0, run.deadline - now);
  const frac = Math.min(1, left / (run.seconds * 1000));
  return (
    <section className="sheet cut shift repair" role="dialog" aria-label={def.title}>
      <header className="sheet-head">
        <div>
          <div className="eyelabel">
            {l.trade} · {owner?.name} · {l.skill} level {run.level}
          </div>
          <h2>{def.title}</h2>
          {!run.outcome && <p>{l.hint}</p>}
        </div>
      </header>
      <div className="stripes" style={{ margin: '0 16px 4px' }} />
      <div className="sheet-body">
        {!run.outcome ? (
          <>
            <div className={`ticket cut-sm ${shake ? 'shake' : ''}`} key={shake} aria-live="polite" data-device={device.name}>
              <div className="ticket-top">
                <span>
                  {l.unit} {run.index + 1} of {run.queue.length} · {device.fault}
                </span>
                <span className="num">{(left / 1000).toFixed(1)}s</span>
              </div>
              <div className="ticket-dish">{device.name}</div>
              <ol className="steps-done" aria-label="Steps done">
                {device.steps.map((st, i) => (
                  <li key={st} className={i < run.progress ? 'done' : i === run.progress ? 'now' : ''}>
                    {i < run.progress ? st : '—'}
                  </li>
                ))}
              </ol>
              <div className="ticket-timer" aria-hidden="true">
                <i style={{ width: `${frac * 100}%` }} className={frac < 0.3 ? 'late' : ''} />
              </div>
            </div>
            <div className="dish-grid repair-grid">
              {run.buttons.map((st, i) => {
                const used = device.steps.indexOf(st) < run.progress;
                return (
                  <button key={st} className="dish cut-sm" data-step={st} disabled={used} onClick={() => tap(st)}>
                    <span>{st}</span>
                    <kbd className="key">{i + 1}</kbd>
                  </button>
                );
              })}
            </div>
            <p className="muted num" aria-live="polite">
              Slips on this {l.unit.toLowerCase()}: {run.mistakes} {run.mistakes > 1 ? '— this one won’t count' : run.mistakes === 1 ? '— one more and it won’t count' : ''}
            </p>
          </>
        ) : (
          <div className="shift-done">
            <div className="big num">+{formatMoney(pack, run.outcome.pay + run.outcome.tip)}</div>
            <p>
              {l.done} {run.outcome.fixed} of {run.queue.length} {l.units}
              {run.outcome.tip ? ` — clean work, ${owner?.name} tipped ${formatMoney(pack, run.outcome.tip)}` : ''}.
            </p>
            <ul className="shift-lines">
              <li>
                <IconStar size={16} /> {l.skill} +{run.outcome.xp} XP{run.outcome.levelUp ? ' — level up!' : ''}
                <span className="xpbar" aria-hidden="true">
                  <i style={{ width: `${levelProgress(xp) * 100}%` }} />
                </span>
                <span className="muted">Level {skillLevel(xp)}</span>
              </li>
              <li>
                <IconBolt size={16} /> Fiddly work: energy −{def.energyCost}
              </li>
              <li>
                <IconHome size={16} /> {owner?.name} trusts you a little more
              </li>
            </ul>
            <button className="btn block" onClick={close} autoFocus>
              Done
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
