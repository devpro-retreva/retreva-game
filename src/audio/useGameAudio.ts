import { useEffect } from 'react';
import { getDestination } from '../game/content';
import { useGame } from '../game/store/gameStore';
import { audio } from './ambience';

/**
 * Connects the game to the sound engine: unlocks audio on the first tap/click/key, plays the current
 * area's soundscape, ducks it behind menus, and plays small effects for money, the bike bell and take-off.
 */
export function useGameAudio() {
  const settings = useGame((s) => s.settings);
  const destinationId = useGame((s) => s.destinationId);
  const phase = useGame((s) => s.phase);
  const ui = useGame((s) => s.ui);

  useEffect(() => {
    const unlock = () => {
      audio.unlock();
      const s = useGame.getState();
      if (s.phase === 'playing') audio.setArea(s.destinationId, getDestination(s.destinationId).ambience);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    audio.apply({ ambience: settings.ambienceVolume ?? 0.7, effects: settings.effectsVolume ?? 0.8, muted: settings.muted ?? false });
  }, [settings.ambienceVolume, settings.effectsVolume, settings.muted]);

  useEffect(() => {
    if (phase === 'playing') audio.setArea(destinationId, getDestination(destinationId).ambience);
    else if (phase === 'title' || phase === 'create') audio.setArea('', undefined);
  }, [phase, destinationId]);

  useEffect(() => {
    audio.setDucked(ui !== 'play');
    if (ui === 'flight') audio.takeoff();
  }, [ui]);

  useEffect(
    () =>
      useGame.subscribe((s, prev) => {
        if (s.wallet.balance > prev.wallet.balance && s.phase === 'playing') audio.coin();
        if (s.life.riding && !prev.life.riding) audio.bell();
      }),
    [],
  );
}
