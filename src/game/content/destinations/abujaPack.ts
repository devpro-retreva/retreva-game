/**
 * The Abuja city pack: Wuse and Nnamdi Azikiwe airport. Loaded on demand as its own chunk (listed in
 * dist/packs.json with sizes and hashes); Settings → Cities can keep it for offline play.
 */
import { abuja } from './abuja';
import { abujaAirport } from './abujaAirport';

export const ABUJA_PACKS = [abuja, abujaAirport];
