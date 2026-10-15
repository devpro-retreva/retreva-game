/**
 * Owning a vehicle: buy, ride, park where you get off, sell back. Pure functions; money moves through
 * the wallet ledger in the store (`vehicle:<uid>` on purchase, `sellvehicle:<uid>` on sale, so neither can repeat).
 */
export interface Parked {
  areaId: string;
  x: number;
  z: number;
  yaw: number;
}

export interface OwnedVehicle {
  uid: string;
  vehicleId: string;
  paid: number;
  parked: Parked | null;
}

export function addVehicle(list: OwnedVehicle[], uid: string, vehicleId: string, paid: number, at: Parked): OwnedVehicle[] {
  return [...list, { uid, vehicleId, paid, parked: at }];
}

/** Getting on: only a vehicle parked here, within reach. */
export function canMount(v: OwnedVehicle | undefined, areaId: string, x: number, z: number, reach = 1.9): boolean {
  return !!v?.parked && v.parked.areaId === areaId && Math.hypot(v.parked.x - x, v.parked.z - z) <= reach;
}

export function mount(list: OwnedVehicle[], uid: string): OwnedVehicle[] {
  return list.map((v) => (v.uid === uid ? { ...v, parked: null } : v));
}

export function park(list: OwnedVehicle[], uid: string, at: Parked): OwnedVehicle[] {
  return list.map((v) => (v.uid === uid ? { ...v, parked: at } : v));
}

export function removeVehicle(list: OwnedVehicle[], uid: string): OwnedVehicle[] {
  return list.filter((v) => v.uid !== uid);
}

/** A used vehicle sells for half what you paid, rounded down to ₦50. */
export function vehicleResale(paid: number): number {
  return Math.floor((paid * 0.5) / 50) * 50;
}
