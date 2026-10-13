import { useRef, useState } from 'react';
import { input } from '../../game/core/input';
import { useGame } from '../../game/store/gameStore';
import { IconRun } from '../icons/Icons';

const RADIUS = 52;

/**
 * Mobile controls.
 * Left side: a floating joystick that appears where the thumb lands.
 * Right side: drag to look. Bottom-right: contextual action button + run toggle.
 */
export function TouchControls() {
  const ui = useGame((s) => s.ui);
  const nearby = useGame((s) => s.nearby);
  const interact = useGame((s) => s.interact);
  const [joy, setJoy] = useState<{ x: number; y: number } | null>(null);
  const knob = useRef<HTMLElement>(null);
  const joyId = useRef<number | null>(null);
  const lookId = useRef<{ id: number; x: number; y: number } | null>(null);
  const [sprint, setSprint] = useState(false);

  if (ui !== 'play') return null;

  const onJoyDown = (e: React.PointerEvent) => {
    if (joyId.current !== null) return;
    joyId.current = e.pointerId;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setJoy({ x: e.clientX, y: e.clientY });
  };
  const onJoyMove = (e: React.PointerEvent) => {
    if (joyId.current !== e.pointerId || !joy) return;
    let dx = e.clientX - joy.x;
    let dy = e.clientY - joy.y;
    const len = Math.hypot(dx, dy);
    if (len > RADIUS) {
      dx = (dx / len) * RADIUS;
      dy = (dy / len) * RADIUS;
    }
    input.joy.x = dx / RADIUS;
    input.joy.y = -dy / RADIUS;
    if (knob.current) knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const onJoyUp = (e: React.PointerEvent) => {
    if (joyId.current !== e.pointerId) return;
    joyId.current = null;
    input.joy.x = 0;
    input.joy.y = 0;
    setJoy(null);
  };

  const onLookDown = (e: React.PointerEvent) => {
    if (lookId.current) return;
    lookId.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const onLookMove = (e: React.PointerEvent) => {
    const l = lookId.current;
    if (!l || l.id !== e.pointerId) return;
    input.look.dx += (e.clientX - l.x) * 1.35;
    input.look.dy += (e.clientY - l.y) * 1.35;
    l.x = e.clientX;
    l.y = e.clientY;
  };
  const onLookUp = (e: React.PointerEvent) => {
    if (lookId.current?.id === e.pointerId) lookId.current = null;
  };

  const toggleSprint = () => {
    input.sprintToggle = !sprint;
    setSprint(!sprint);
  };

  return (
    <>
      <div className="touch-zone left" onPointerDown={onJoyDown} onPointerMove={onJoyMove} onPointerUp={onJoyUp} onPointerCancel={onJoyUp} aria-hidden="true">
        <div className={`joy ${joy ? '' : 'idle'}`} style={joy ? { left: joy.x, top: joy.y - (window.innerHeight * 0.3) } : undefined}>
          <i ref={knob} style={joy ? undefined : { transform: 'none' }} />
        </div>
      </div>
      <div className="touch-zone right" onPointerDown={onLookDown} onPointerMove={onLookMove} onPointerUp={onLookUp} onPointerCancel={onLookUp} aria-hidden="true" />
      <div className="touch-actions">
        <button className="sprint-btn" aria-pressed={sprint} aria-label="Toggle run" onClick={toggleSprint}>
          <IconRun size={24} />
        </button>
        {nearby && (
          <button className="action-btn" onClick={interact} aria-label={`${nearby.verb} ${nearby.label}`}>
            <span>
              <small>{nearby.verb}</small>
              {nearby.label}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
