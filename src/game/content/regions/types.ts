export interface RegionArea {
  /** Destination pack id. */
  id: string;
  district: string;
  /** Short label for the travel card. */
  known: string;
  /** Position on the region's schematic map (0–100, north up). */
  map: [number, number];
  /** Transport hubs don't count toward "visit every area". Airports are reached by taxi; a station by the everyday ride. */
  hub?: 'airport' | 'station';
  /** Where this area's boat landing sits on the region map (on the water), for areas that have boats. */
  dock?: [number, number];
}

/** One trip between two areas: what it costs (naira) and how long it takes (game minutes, traffic included). */
export interface Route {
  between: [string, string];
  fare: number;
  minutes: number;
  /** Shown on the travel card, e.g. "via CMS/Marina". */
  via?: string;
}

/** road: the everyday ride inside a region; boat: between jetties; coach: the intercity bus between cities; cable: a cable car. */
export type TravelBy = 'road' | 'boat' | 'coach' | 'cable';

export interface Region {
  id: string;
  name: string;
  country: string;
  /** Everyday ride between areas, e.g. "Danfo" in Lagos. Trips to and from hubs are always by taxi. */
  transit: string;
  areas: RegionArea[];
  /** Which drawn map the Travel panel shows (regions without one show a list only). */
  map?: 'lagos';
  /** Road fares and times between areas. Pairs not listed fall back to a distance estimate. */
  routes?: Route[];
  /** Boats between areas with a jetty (only these pairs have a boat). */
  boats?: Route[];
  /** What the boats are called here, e.g. "Ferry". */
  boatName?: string;
  /** Cable cars between two areas (only these pairs). The lower area's pack draws it (`DestinationPack.cable`). */
  cables?: Route[];
}
