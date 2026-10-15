/** Vehicles you can own. Data only: speeds, how tiring they are, what they look like. */
export interface VehicleDef {
  id: string;
  name: string;
  description: string;
  /** Riding speed (m/s) and with the "run" control held (if you have the energy). Walking is 3.4, running 6.4. */
  speed: number;
  sprint: number;
  /** Energy drain while riding, relative to walking (1 = same). */
  effort: number;
  color: string;
}

export const VEHICLES: VehicleDef[] = [
  {
    id: 'bicycle',
    name: 'City bicycle',
    description: 'Steel frame, basket, loud bell. Twice as fast as walking and gentler on your legs than running. Park it anywhere on the street.',
    speed: 6.4,
    sprint: 8.2,
    effort: 0.6,
    color: '#1f6f4a',
  },
];

export function findVehicle(id: string): VehicleDef | undefined {
  return VEHICLES.find((v) => v.id === id);
}
