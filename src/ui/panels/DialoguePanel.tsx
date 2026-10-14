import { useEffect, useRef, useState } from 'react';
import { findNpc } from '../../game/content';
import { useGame } from '../../game/store/gameStore';
import { usePack } from '../../scene/worldContext';

/** Conversation panel: speaker tag, typed line, numbered choices (1–4 or tap). */
export function DialoguePanel() {
  const pack = usePack();
  const dialogue = useGame((s) => s.dialogue);
  const choose = useGame((s) => s.chooseOption);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const npc = dialogue ? findNpc(pack, dialogue.npcId) : undefined;
  const node = npc && dialogue ? npc.dialogue.nodes[dialogue.nodeId] : undefined;
  const text = node?.text ?? '';
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
