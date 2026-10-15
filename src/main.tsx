import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/caveat/latin-700.css';
import './ui/theme.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline play: once the game has loaded online, a service worker keeps every file for offline launches.
// Production only; failures (unsupported browser, sandboxed preview) are harmless — the game still runs.
declare const __BUILD_ID__: string;
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`./sw.js?v=${__BUILD_ID__}`).catch(() => undefined);
  });
}
