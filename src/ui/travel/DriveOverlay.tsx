import { useEffect, useState } from 'react';
import { findEvent } from '../../game/content';
import { useGame } from '../../game/store/gameStore';
import { rideSeconds } from '../../game/systems/drive';

/**
 * Riding on the game drive: a small card at the foot of the screen (the view stays on the bush) with what you've
 * spotted so far and how far round the track you are. The drive ends by itself back at camp, or "Head back" ends it now.
 */
export function DriveOverlay() {
  const drive = useGame((s) => s.drive);
  const finish = useGame((s) => s.finishDrive);
  const ev = drive ? findEvent(drive.eventId) : undefined;
  const ride = ev?.ride;
  const [k, setK] = useState(0);

  useEffect(() => {
    if (!drive || !ride) return;
    const total = rideSeconds(ride) * 1000;
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - drive.startedAt) / total);
      setK(p);
      if (p >= 1) {
        clearInterval(id);
        setTimeout(() => useGame.getState().finishDrive(), 600);
      }
    }, 250);
    return () => clearInterval(id);
  }, [drive?.startedAt, ride]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!drive || !ev || !ride) return null;
  return (
    <div className="drive-hud" role="status" aria-live="polite" data-spotted={drive.spotted.length}>
      <div className="drive-card cut">
        <div className="drive-head">
          <div>
            <div className="eyelabel">Game drive · {ev.venue}</div>
            <b>{k < 0.08 ? 'Setting off…' : k > 0.94 ? 'Back into camp' : 'Watch the bush on both sides'}</b>
          </div>
          <button className="btn ghost" onClick={finish}>
            Head back
          </button>
        </div>
        <div className="drive-bar" aria-hidden>
          <i style={{ width: `${Math.round(k * 100)}%` }} />
        </div>
        <ul className="drive-list" aria-label={`Spotted ${drive.spotted.length} of ${ride.sightings.length}`}>
          {ride.sightings.map((v) => (
            <li key={v.id} data-sighting={v.id} className={drive.spotted.includes(v.id) ? 'seen' : ''}>
              {drive.spotted.includes(v.id) ? '✓ ' : ''}
              {v.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
