import { useEffect } from 'react';
import { getDestination } from '../game/content';
import { useGame } from '../game/store/gameStore';
import { audio } from './ambience';
import { findInterior } from '../game/content/interiors';
import { onNow } from '../game/systems/events';
import { runtime } from '../game/core/runtime';

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
    audio.apply({ ambience: settings.ambienceVolume ?? 0.7, effects: settings.effectsVolume ?? 0.8, muted: settings.muted ?? false, music: settings.musicVolume ?? 0.4 });
  }, [settings.ambienceVolume, settings.effectsVolume, settings.muted, settings.musicVolume]);

  // Music: a quiet radio in the street, warmer in a restaurant, the full band near a live stage.
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = useGame.getState();
      if (s.phase === 'title' || s.phase === 'create') {
        audio.setMusic(true, 0.5);
        return;
      }
      if (s.phase !== 'playing' || s.ui === 'flight' || s.ui === 'transit') {
        audio.setMusic(s.phase === 'playing', 0.15);
        return;
      }
      let intensity = 0.2;
      if (s.world.inside) intensity = findInterior(s.world.inside.interiorId)?.kind === 'restaurant' ? 0.45 : 0.25;
      else {
        const t = s.world.time ?? 480;
        for (const ev of getDestination(s.destinationId).events ?? []) {
          if (!ev.stage || onNow(ev, t) === null) continue;
          const d = Math.hypot(runtime.player.x - ev.stage.position[0], runtime.player.z - ev.stage.position[1]);
          intensity = Math.max(intensity, 1 - Math.min(1, d / 30) * 0.8);
        }
      }
      if (s.resting?.at === 'event') intensity = 1;
      audio.setMusic(true, intensity);
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (phase === 'playing') audio.setArea(destinationId, getDestination(destinationId).ambience);
    else if (phase === 'title' || phase === 'create') audio.setArea('', undefined);
  }, [phase, destinationId]);

  const inside = useGame((s) => !!s.world.inside);
  useEffect(() => {
    // behind menus — and indoors, where the street is behind a wall — the city is quieter
    audio.setDucked(ui !== 'play' || inside);
    if (ui === 'flight') audio.takeoff();
  }, [ui, inside]);

  useEffect(
    () =>
      useGame.subscribe((s, prev) => {
        if (s.wallet.balance > prev.wallet.balance && s.phase === 'playing') audio.coin();
        if (s.life.riding && !prev.life.riding) audio.bell();
      }),
    [],
  );
}
