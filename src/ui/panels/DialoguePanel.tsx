import { useEffect, useMemo, useRef, useState } from 'react';
import { findNpc } from '../../game/content';
import { findFlight, flightText, flightsFrom } from '../../game/content/flights';
import type { DialogueNode, NpcDef } from '../../game/content/types';
import { regardTier } from '../../game/systems/life';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';

/**
 * The node to show. People you can get to know (npc.social) also offer "Chat a while" and
 * "Give a gift" on the line they open with; a chat or gift reply is a one-off line ('__social').
 */
function socialNode(npc: NpcDef, d: { nodeId: string; opening?: string; line?: string }): DialogueNode | undefined {
  if (d.nodeId === '__social') {
    return {
      text: d.line ?? '',
      options: [
        ...(d.opening ? [{ label: 'Back', action: { kind: 'goto' as const, node: d.opening } }] : []),
        { label: 'Bye', action: { kind: 'close' as const } },
      ],
    };
  }
  const node = npc.dialogue.nodes[d.nodeId];
  if (!node || !npc.social || d.nodeId !== d.opening) return node;
  const extra = [
    { label: 'Chat a while', action: { kind: 'chat' as const } },
    { label: 'Give a gift', action: { kind: 'gift' as const } },
  ];
  const last = node.options[node.options.length - 1];
  const closes = last?.action.kind === 'close';
  return { ...node, options: closes ? [...node.options.slice(0, -1), ...extra, last] : [...node.options, ...extra] };
}

/** Conversation panel: speaker tag, typed line, numbered choices (1–4 or tap). */
export function DialoguePanel() {
  const pack = usePack();
  const dialogue = useGame((s) => s.dialogue);
  const choose = useGame((s) => s.chooseOption);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const npc = dialogue ? findNpc(pack, dialogue.npcId) : undefined;
  const regard = useGame((s) => (dialogue ? s.life.regard[dialogue.npcId] ?? 0 : 0));
  const node = useMemo(() => (npc && dialogue ? socialNode(npc, dialogue) : undefined), [npc, dialogue]);
  // airport and station staff talk about *your* trip: {flight}, {gate}, {entry}, {departs}… come from your ticket (or the first route from here)
  const ticketRoute = useGame((s) => s.travel.ticket?.routeId);
  const route = (ticketRoute ? findFlight(ticketRoute) : undefined) ?? flightsFrom(pack.id)[0];
  const now = useGame((s) => s.world.time ?? 0);
  const text = flightText(node?.text ?? '', route, now);
  // Progress is tied to the exact line, so switching nodes can never briefly
  // report the previous line as "finished".
  const [typed, setTyped] = useState<{ text: string; n: number }>({ text: '', n: 0 });
  const shown = reduced ? text.length : typed.text === text ? typed.n : 0;
  const setShown = (n: number) => setTyped({ text, n });
  const first = useRef<HTMLButtonElement>(null);
  const done = shown >= text.length;

  useEffect(() => {
    if (reduced) return;
    let n = 0;
    setTyped({ text, n: 0 });
    const id = setInterval(() => {
      n += 3;
      setTyped((t) => (t.text === text ? { text, n: Math.max(t.n, n) } : t));
      if (n >= text.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, reduced]);

  useEffect(() => {
    if (done) first.current?.focus({ preventScroll: true });
  }, [done]);

  useEffect(() => {
    if (!node) return;
    const onKey = (e: KeyboardEvent) => {
      if (!done && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) {
        e.preventDefault();
        setShown(text.length);
        return;
      }
      const n = Number(e.key);
      if (done && n >= 1 && n <= node.options.length) {
        e.preventDefault();
        choose(node.options[n - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [node, done, text, choose]);

  if (!npc || !node) return null;

  return (
    <section className="dialogue" role="dialog" aria-label={`Talking to ${npc.name}`} onClick={() => !done && setShown(text.length)}>
      <div className="tag cut-sm">
        <b>{npc.name}</b>
        <span>{npc.role}</span>
        {npc.social && (
          <span className="regard" aria-label={`${regardTier(regard)}, regard ${Math.round(regard)} of 100`}>
            {regardTier(regard)}
          </span>
        )}
      </div>
      <div className="body">
        <p className="line" aria-live="polite">
          {text.slice(0, shown)}
          <span style={{ visibility: 'hidden' }}>{text.slice(shown)}</span>
        </p>
        <ul className="choices" style={{ visibility: done ? 'visible' : 'hidden' }}>
          {node.options.map((o, i) => (
            <li key={o.label}>
              <button ref={i === 0 ? first : undefined} className="choice" onClick={() => choose(o)} tabIndex={done ? 0 : -1}>
                <span className="key">{i + 1}</span>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
