/**
 * The Dubai city pack: Dubai Creek (Al Fahidi) and the airport. Loaded on demand as its own chunk
 * (listed in dist/packs.json with sizes and hashes); Settings → Cities can keep it for offline play.
 */
import { dubai } from './dubai';
import { dubaiAirport } from './dubaiAirport';

export const DUBAI_PACKS = [dubai, dubaiAirport];
