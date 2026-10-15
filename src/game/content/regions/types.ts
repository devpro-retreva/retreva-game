export interface RegionArea {
  /** Destination pack id. */
  id: string;
  district: string;
  /** Short label for the travel card. */
  known: string;
  /** Position on the region's schematic map (0–100, north up). */
  map: [number, number];
  /** Transport hubs (airports) are reached by taxi and don't count toward "visit every area". */
  hub?: 'airport';
}

export interface Region {
  id: string;
  name: string;
  country: string;
  /** Everyday ride between areas, e.g. "Danfo" in Lagos. Trips to and from hubs are always by taxi. */
  transit: string;
  areas: RegionArea[];
  /** Which drawn map the Travel panel shows (regions without one show a list only). */
  map?: 'lagos';
}
