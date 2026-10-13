import { useEffect, useRef } from 'react';
import { useGame } from '../../game/store/gameStore';
import { saves } from '../../game/persistence/instance';

export function PauseMenu() {
  const togglePause = useGame((s) => s.togglePause);
  const openPhone = useGame((s) => s.openPhone);
  const closePanel = useGame((s) => s.closePanel);
  const setPhase = useGame((s) => s.setPhase);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);

  const settings = () => {
    closePanel();
    openPhone('settings');
  };
  const quit = async () => {
    await saves.saveNow();
    closePanel();
    setPhase('title');
  };

  return (
    <div className="pause" role="dialog" aria-modal="true" aria-label="Paused">
      <div className="menu panel cut">
        <div className="eyelabel">Game paused · timer stopped</div>
        <h2>Paused</h2>
        <div className="list">
          <button ref={first} className="btn block" onClick={togglePause}>
            Resume
          </button>
          <button className="btn ghost block" onClick={settings}>
            Settings
          </button>
          <button className="btn ghost block" onClick={quit}>
            Save &amp; quit to title
          </button>
        </div>
        <div className="controls-list">
          <span>
            <span className="key">WASD</span>
          </span>
          <span>Move (arrows work too)</span>
          <span>
            <span className="key">Shift</span>
          </span>
          <span>Run</span>
          <span>
            <span className="key">Drag</span>
          </span>
          <span>Look around</span>
          <span>
            <span className="key">E</span>
          </span>
          <span>Talk / interact</span>
          <span>
            <span className="key">1–4</span>
          </span>
          <span>Pick a reply</span>
          <span>
            <span className="key">P</span> <span className="key">I</span> <span className="key">M</span>
          </span>
          <span>Phone · Bag · Map</span>
        </div>
      </div>
    </div>
  );
}
