/**
 * City packs. A city is a travel region (Lagos, Accra…). Lagos is built into the game; other cities are
 * separate chunks that load when needed — when you fly there, or when a save refers to them — and can
 * be kept on the device for offline play (Settings → Cities; see `cityStore.ts`).
 * The small index here (areas, event and home ids) lets the game know which city a reference belongs to
 * without loading it; a unit test keeps it in step with the packs themselves.
 */
import { isAreaLoaded, registerPacks } from './index';
import { REGIONS } from './regions';
import { findFlight } from './flights';
import type { DestinationPack } from './types';
import type { SaveData } from '../persistence/types';

export interface CityPack {
  id: string;
  builtIn: boolean;
  /** Ids of things in this city that a save can point at. */
  eventIds: string[];
  homeIds: string[];
  load?: () => Promise<DestinationPack[]>;
}

export const CITY_PACKS: CityPack[] = [
  { id: 'lagos', builtIn: true, eventIds: ['beach-highlife', 'glover-laughs'], homeIds: ['yaba-room'] },
  {
    id: 'accra',
    builtIn: false,
    eventIds: ['osu-night-jam'],
    homeIds: ['osu-guesthouse'],
    load: () => import('./destinations/accraPack').then((m) => m.ACCRA_PACKS),
  },
  {
    id: 'dubai',
    builtIn: false,
    eventIds: ['creek-lights'],
    homeIds: ['creek-studio'],
    load: () => import('./destinations/dubaiPack').then((m) => m.DUBAI_PACKS),
  },
];

export const findCity = (id: string) => CITY_PACKS.find((c) => c.id === id);
export const cityAreas = (id: string) => REGIONS.find((r) => r.id === id)?.areas.map((a) => a.id) ?? [];
export const cityOfArea = (areaId: string) => CITY_PACKS.find((c) => cityAreas(c.id).includes(areaId));
export const cityName = (id: string) => REGIONS.find((r) => r.id === id)?.name ?? id;
export const isCityLoaded = (id: string) => cityAreas(id).every(isAreaLoaded);

const loading = new Map<string, Promise<void>>();
const failures = new Map<string, number>();

/**
 * After a failed load (offline), browsers remember the failed module for the rest of the page's life,
 * so a retry imports the same file under a fresh URL, found in packs.json. Not used in dev/tests.
 */
async function retryImport(id: string, attempt: number): Promise<DestinationPack[]> {
  const res = await fetch(new URL('packs.json', document.baseURI).href, { cache: 'no-cache' });
  const m = (await res.json()) as { cities: Record<string, { files: { path: string }[] }> };
  const file = m.cities[id]?.files[0]?.path;
  if (!file) throw new Error(`no pack file for ${id}`);
  const mod = (await import(/* @vite-ignore */ `${new URL(file, document.baseURI).href}?retry=${attempt}`)) as Record<string, unknown>;
  const packs = Object.values(mod).find(Array.isArray) as DestinationPack[] | undefined;
  if (!packs) throw new Error(`bad pack file for ${id}`);
  return packs;
}

/** Load a city's packs (from the network or the offline copy). Safe to call repeatedly; retries after a failure. */
export function loadCity(id: string): Promise<void> {
  const c = findCity(id);
  if (!c || c.builtIn || isCityLoaded(id)) return Promise.resolve();
  let p = loading.get(id);
  if (!p) {
    const tries = failures.get(id) ?? 0;
    p = (tries && typeof document !== 'undefined' ? retryImport(id, tries) : c.load!()).then(registerPacks);
    p.catch(() => {
      loading.delete(id); // let a later attempt retry (e.g. back online)
      failures.set(id, tries + 1);
    });
    loading.set(id, p);
  }
  return p;
}

export async function ensureAreas(areaIds: (string | undefined | null)[]): Promise<{ ok: true } | { ok: false; city: string }> {
  const cities = new Set(areaIds.filter(Boolean).map((a) => cityOfArea(a!)?.id).filter(Boolean) as string[]);
  for (const id of cities) {
    try {
      await loadCity(id);
    } catch {
      return { ok: false, city: id };
    }
  }
  return { ok: true };
}

/** Every city a save refers to: where you are, where you've been, your ticket, homes, show tickets. */
export function citiesInSave(save: Pick<SaveData, 'destinationId' | 'world' | 'travel' | 'life' | 'inventory'>): string[] {
  const areas = [save.destinationId, ...(save.world?.visited ?? []), save.world?.inside?.from.areaId, ...(save.inventory?.entries ?? []).map((e) => e.destinationId)];
  const ids = new Set(areas.filter(Boolean).map((a) => cityOfArea(a!)?.id).filter(Boolean) as string[]);
  const t = save.travel?.ticket;
  const route = t ? findFlight(t.routeId) : undefined;
  if (route) for (const a of [route.from, route.to, route.arriveAt]) { const c = cityOfArea(a); if (c) ids.add(c.id); }
  for (const tk of save.world?.tickets ?? []) {
    const c = CITY_PACKS.find((x) => x.eventIds.includes(tk.eventId));
    if (c) ids.add(c.id);
  }
  for (const h of save.life?.homes ?? []) {
    const c = CITY_PACKS.find((x) => x.homeIds.includes(h));
    if (c) ids.add(c.id);
  }
  return [...ids];
}

export const cityMissing = (id: string) =>
  `This game is in ${cityName(id)}, which isn't on this device yet. Connect to the internet once so it can download — or download it in Settings → Cities while online.`;

/** Load everything a save needs before it is opened. Fails (with the city's name) if a city can't be loaded. */
export async function ensureForSave(save: SaveData): Promise<{ ok: true } | { ok: false; city: string }> {
  for (const id of citiesInSave(save)) {
    try {
      await loadCity(id);
    } catch {
      return { ok: false, city: id };
    }
  }
  return { ok: true };
}
