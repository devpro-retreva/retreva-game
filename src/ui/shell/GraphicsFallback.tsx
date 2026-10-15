import { Component, type ReactNode } from 'react';
import { useGame } from '../../game/store/gameStore';

/** Shown instead of the 3D world when the browser can't start WebGL. The save is untouched. */
export function GraphicsUnavailable({ detail }: { detail?: string }) {
  return (
    <main className="screen-full gfx-fallback" role="alert" data-gfx="unavailable">
      <div className="gfx-card cut">
        <div className="eyelabel">Retreva</div>
        <h2>3D graphics couldn’t start</h2>
        <p>This browser or device didn’t give Retreva a WebGL graphics context, so the city can’t be drawn. Your saved game is safe on this device.</p>
        <ul>
          <li>Turn on hardware acceleration in the browser settings, then reload.</li>
          <li>Update the browser, or try Chrome, Edge, Safari or Firefox.</li>
          <li>Close other tabs or apps that use a lot of graphics memory.</li>
        </ul>
        {detail && <p className="gfx-detail">{detail}</p>}
        <div className="gfx-actions">
          <button className="btn" onClick={() => location.reload()}>
            Try again
          </button>
          <button className="btn ghost" onClick={() => useGame.getState().setPhase('title')}>
            Back to title
          </button>
        </div>
      </div>
    </main>
  );
}

/** Catches a renderer crash (e.g. context creation failing) and shows the fallback instead of a blank page. */
export class GraphicsBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    return this.state.error ? <GraphicsUnavailable detail={this.state.error} /> : this.props.children;
  }
}
