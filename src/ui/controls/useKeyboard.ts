import { useEffect } from 'react';
import { input, clearInput } from '../../game/core/input';
import { useGame } from '../../game/store/gameStore';

/** Global keyboard routing for gameplay and panels. */
export function useKeyboard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const typing = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && (t as HTMLInputElement).type !== 'checkbox' && (t as HTMLInputElement).type !== 'range';
    };
    const down = (e: KeyboardEvent) => {
      if (typing(e)) return;
      const s = useGame.getState();
      input.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) && s.ui === 'play') e.preventDefault();
      if (e.repeat) return;
      switch (e.code) {
        case 'KeyE':
        case 'Enter':
          if (s.ui === 'play') {
            e.preventDefault();
            s.interact();
          }
          break;
        case 'Escape':
          s.togglePause();
          break;
        case 'KeyP':
          if (s.ui === 'phone') s.closePanel();
          else s.openPhone();
          break;
        case 'KeyI':
          if (s.ui === 'play' || s.ui === 'phone') s.openPhone('bag');
          break;
        case 'KeyM':
          if (s.ui === 'play' || s.ui === 'phone') s.openPhone('map');
          break;
      }
    };
    const up = (e: KeyboardEvent) => input.keys.delete(e.code);
    const blur = () => clearInput();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [active]);
}
