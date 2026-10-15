import { useEffect, useMemo, useState } from 'react';
import { useGame } from './game/store/gameStore';
import { saves } from './game/persistence/instance';
import type { Profile, SaveData } from './game/persistence/types';
import { runtime } from './game/core/runtime';
import { GameCanvas, isCoarsePointer } from './scene/GameCanvas';
import { DISPLAY_FONT } from './scene/builders/painters';
import { Hud, Toasts } from './ui/hud/Hud';
import { DialoguePanel } from './ui/panels/DialoguePanel';
import { ShopPanel } from './ui/panels/ShopPanel';
import { PauseMenu } from './ui/panels/PauseMenu';
import { Wardrobe } from './ui/panels/Wardrobe';
import { AreaBanner, TipCard, TransitOverlay, TravelPanel } from './ui/travel/TravelPanels';
import { FlightOverlay } from './ui/travel/FlightOverlay';
import { useGameAudio } from './audio/useGameAudio';
import { audio } from './audio/ambience';
import { DealerPanel, GiftPanel } from './ui/panels/SocialPanels';
import { getDestination } from './game/content';
import { GraphicsBoundary, GraphicsUnavailable } from './ui/shell/GraphicsFallback';
import { webglSupport } from './game/core/webgl';
import { Phone } from './ui/phone/Phone';
import { HomePanel, RestOverlay, ShiftPanel } from './ui/panels/LifePanels';
import { TouchControls } from './ui/controls/TouchControls';
import { useKeyboard } from './ui/controls/useKeyboard';
import { TitleScreen } from './ui/shell/TitleScreen';
import { CreateScreen } from './ui/shell/CreateScreen';

function Loading({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`loading ${done ? 'done' : ''}`} aria-hidden={done} role="status">
      <div className="inner">
        <div className="eyelabel">Retreva</div>
        <h2>{label}</h2>
        <div className="bar">
          <i />
        </div>
      </div>
    </div>
  );
}

function World({ touch }: { touch: boolean }) {
  const ui = useGame((s) => s.ui);
  return (
    <>
      <GraphicsBoundary>
        <GameCanvas />
      </GraphicsBoundary>
      <div className="ui-layer">
        {touch && <TouchControls />}
        <Hud touch={touch} />
        <Toasts />
        {ui === 'dialogue' && <DialoguePanel />}
        {ui === 'shop' && <ShopPanel />}
        {ui === 'phone' && <Phone />}
        {ui === 'pause' && <PauseMenu />}
        {ui === 'wardrobe' && <Wardrobe />}
        {ui === 'travel' && <TravelPanel />}
        {ui === 'transit' && <TransitOverlay />}
        {ui === 'flight' && <FlightOverlay />}
        {ui === 'shift' && <ShiftPanel />}
        {ui === 'home' && <HomePanel />}
        {ui === 'resting' && <RestOverlay />}
        {ui === 'gift' && <GiftPanel />}
        {ui === 'dealer' && <DealerPanel />}
        <AreaBanner />
        <TipCard />
      </div>
    </>
  );
}

export default function App() {
  const phase = useGame((s) => s.phase);
  const settings = useGame((s) => s.settings);
  const [save, setSave] = useState<SaveData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const describeNotice = () => {
    const n = saves.notice;
    if (n?.kind === 'restored-backup')
      return `Your latest save couldn't be read, so your backup from ${new Date(n.savedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} was restored. The unreadable copy is kept on this device.`;
    if (n?.kind === 'unreadable-kept') return "Your saved game couldn't be opened (it may be from a newer version of Retreva). It is kept safe on this device — starting a new life won't erase it.";
    return null;
  };
  const touch = useMemo(isCoarsePointer, []);
  useKeyboard(phase === 'playing');
  useGameAudio();

  // boot: fonts (signboards are painted with them) + local save
  useEffect(() => {
    if (phase !== 'boot') return;
    let cancelled = false;
    const fonts = (document.fonts?.load(`800 40px ${DISPLAY_FONT}`) ?? Promise.resolve()).catch(() => undefined);
    Promise.all([fonts, saves.load()]).then(([, data]) => {
      if (cancelled) return;
      setSave(data);
      setNotice(describeNotice());
      useGame.getState().setHasSave(!!data);
      useGame.getState().setPhase('title');
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  // refresh the save summary whenever we return to the title
  useEffect(() => {
    if (phase === 'title')
      void saves.load().then((d) => {
        setSave(d);
        setNotice(describeNotice());
      });
  }, [phase]);

  // apply accessibility settings globally
  useEffect(() => {
    document.documentElement.style.setProperty('--ts', String(settings.textScale));
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    document.documentElement.classList.toggle('touch', touch);
  }, [settings.textScale, settings.reducedMotion, touch]);

  // expose a small debug/playtest handle (read-only state + store actions)
  useEffect(() => {
    window.__retreva = { store: useGame, runtime, saves, audio };
  }, []);

  const onContinue = async () => {
    const latest = (await saves.load()) ?? save;
    if (!latest) return;
    useGame.getState().hydrate(latest);
    useGame.getState().setPhase('loading');
  };
  const onImport = async (file: File) => {
    try {
      const data = await saves.importJson(await file.text());
      useGame.getState().hydrate(data);
      useGame.getState().setPhase('loading');
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'That file could not be imported.');
    }
  };
  const onCreate = (profile: Profile) => {
    useGame.getState().startNewGame(profile);
    useGame.getState().setPhase('loading');
  };

  const inWorld = phase === 'loading' || phase === 'playing';
  const hasGl = useMemo(() => webglSupport() !== null, []);
  const destinationId = useGame((s) => s.destinationId);
  const here = getDestination(destinationId);
  const arrivingAt = here.area === 'Airport' ? `${here.name} airport` : `${here.area}, ${here.name}`;
  return (
    <>
      {phase === 'boot' && <Loading done={false} label="Opening up…" />}
      {phase === 'title' && <TitleScreen save={save} notice={notice} onImport={onImport} onContinue={onContinue} onNew={() => useGame.getState().setPhase('create')} />}
      {phase === 'create' && <CreateScreen onDone={onCreate} onBack={() => useGame.getState().setPhase('title')} />}
      {inWorld && !hasGl && <GraphicsUnavailable />}
      {inWorld && hasGl && <World touch={touch} />}
      {inWorld && hasGl && <Loading done={phase === 'playing'} label={`Arriving in ${arrivingAt}…`} />}
    </>
  );
}
