/**
 * Keeping city packs on the device for offline play (browser only). The build writes `packs.json`:
 * every city pack's files with their size and SHA-256. Installing a city downloads its files, checks each
 * hash, and stores them in their own Cache Storage bucket (`retreva-city-<id>`); the service worker
 * serves city files from there, and never copies them into the main game cache — so removing a city
 * really frees it. Verify re-hashes what is stored. Saves are never touched by any of this.
 */
import { findCity } from './cities';

export interface PackFile {
  path: string;
  bytes: number;
  sha256: string;
}
export interface PackManifest {
  version: string;
  cities: Record<string, { files: PackFile[]; bytes: number }>;
}
export type CityState = 'built-in' | 'installed' | 'update' | 'not-installed' | 'unsupported';

const CACHE_PREFIX = 'retreva-city-';
const META = '__retreva-city-meta.json';
const cacheName = (id: string) => `${CACHE_PREFIX}${id}`;
const abs = (path: string) => new URL(path, document.baseURI).href;

export const offlineSupported = () => typeof window !== 'undefined' && 'caches' in window && !!globalThis.crypto?.subtle && window.isSecureContext;

let manifest: Promise<PackManifest | null> | null = null;
export function getManifest(): Promise<PackManifest | null> {
  if (!manifest)
    manifest = fetch(abs('packs.json'), { cache: 'no-cache' })
      .then((r) => (r.ok ? (r.json() as Promise<PackManifest>) : null))
      .catch(() => null)
      .then((m) => {
        if (!m) manifest = null; // try again later (e.g. back online, or dev server)
        return m;
      });
  return manifest;
}

async function sha256(buf: ArrayBuffer): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function cityStatus(id: string): Promise<{ state: CityState; bytes: number }> {
  const city = findCity(id);
  if (city?.builtIn) return { state: 'built-in', bytes: 0 };
  const m = await getManifest();
  const entry = m?.cities[id];
  if (!offlineSupported() || !entry) return { state: 'unsupported', bytes: entry?.bytes ?? 0 };
  if (!(await caches.has(cacheName(id)))) return { state: 'not-installed', bytes: entry.bytes };
  const cache = await caches.open(cacheName(id));
  const meta = await cache.match(abs(META));
  if (!meta) return { state: 'not-installed', bytes: entry.bytes };
  const saved = (await meta.json()) as { files: string[] };
  const same = saved.files.length === entry.files.length && entry.files.every((f) => saved.files.includes(f.path));
  return { state: same ? 'installed' : 'update', bytes: entry.bytes };
}

/** Download a city's files, check every hash, then store them. Nothing is stored if any file fails. */
export async function installCity(id: string, onProgress?: (done: number, total: number) => void): Promise<{ ok: true } | { ok: false; error: string }> {
  const m = await getManifest();
  const entry = m?.cities[id];
  if (!offlineSupported()) return { ok: false, error: 'This browser can’t keep cities offline here.' };
  if (!entry) return { ok: false, error: 'Couldn’t get the list of city files — are you online?' };
  const got: { url: string; buf: ArrayBuffer; type: string }[] = [];
  let done = 0;
  for (const f of entry.files) {
    let res: Response;
    try {
      res = await fetch(abs(f.path), { cache: 'reload' });
    } catch {
      return { ok: false, error: 'Download failed — check your connection and try again.' };
    }
    if (!res.ok) return { ok: false, error: `Download failed (${res.status}).` };
    const buf = await res.arrayBuffer();
    if ((await sha256(buf)) !== f.sha256) return { ok: false, error: 'A downloaded file didn’t match its checksum, so nothing was saved. Try again.' };
    got.push({ url: abs(f.path), buf, type: res.headers.get('content-type') ?? 'text/javascript' });
    done += f.bytes;
    onProgress?.(done, entry.bytes);
  }
  await caches.delete(cacheName(id));
  const cache = await caches.open(cacheName(id));
  for (const g of got) await cache.put(g.url, new Response(g.buf, { headers: { 'content-type': g.type } }));
  await cache.put(abs(META), new Response(JSON.stringify({ version: m!.version, files: entry.files.map((f) => f.path), at: Date.now() }), { headers: { 'content-type': 'application/json' } }));
  return { ok: true };
}

/** Re-hash every stored file against the manifest. */
export async function verifyCity(id: string): Promise<{ ok: boolean; bad: string[] }> {
  const m = await getManifest();
  const entry = m?.cities[id];
  if (!entry || !offlineSupported() || !(await caches.has(cacheName(id)))) return { ok: false, bad: entry?.files.map((f) => f.path) ?? [] };
  const cache = await caches.open(cacheName(id));
  const bad: string[] = [];
  for (const f of entry.files) {
    const hit = await cache.match(abs(f.path));
    if (!hit || (await sha256(await hit.arrayBuffer())) !== f.sha256) bad.push(f.path);
  }
  return { ok: bad.length === 0, bad };
}

/** Keep a city you're travelling to on the device (quietly; skipped where offline storage isn't available). */
export async function keepOffline(id: string): Promise<void> {
  if (!offlineSupported()) return;
  const st = await cityStatus(id);
  if (st.state === 'not-installed' || st.state === 'update') await installCity(id);
}

export async function removeCity(id: string): Promise<boolean> {
  if (!offlineSupported()) return false;
  return caches.delete(cacheName(id));
}
