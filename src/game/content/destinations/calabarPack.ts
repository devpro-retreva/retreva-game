/**
 * The Calabar city pack: the Marina and Margaret Ekpang airport. Loaded on demand as its own chunk (listed in
 * dist/packs.json with sizes and hashes); Settings → Cities can keep it for offline play.
 */
import { calabar } from './calabar';
import { calabarAirport } from './calabarAirport';

export const CALABAR_PACKS = [calabar, calabarAirport];
