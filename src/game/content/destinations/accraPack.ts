/**
 * The Accra city pack: Osu and Kotoka airport. Loaded on demand (its own JS chunk, listed in
 * dist/packs.json with sizes and hashes) so the base game stays small; Settings → Cities can keep it
 * on the device for offline play.
 */
import { accra } from './accra';
import { accraAirport } from './accraAirport';

export const ACCRA_PACKS = [accra, accraAirport];
