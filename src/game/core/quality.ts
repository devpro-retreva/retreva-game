/**
 * Graphics tiers for affordable devices. Pure data + one resolver so it can be unit-tested.
 * "auto" picks low on phones that report little memory, medium on other phones, high on desktops.
 */
export type GraphicsSetting = 'auto' | 'low' | 'medium' | 'high';
export type GraphicsTier = 'low' | 'medium' | 'high';

export interface TierSpec {
  /** Device-pixel-ratio range handed to the renderer. */
  dpr: [number, number];
  antialias: boolean;
  /** Shadows may be on in this tier (the Shadows setting still decides). */
  shadows: boolean;
  maxVehicles: number;
  maxWalkers: number;
  /** Characters beyond this distance use the low-detail body. */
  lodFar: number;
  /** Cheaper flat shading for characters. */
  lambertCharacters: boolean;
  /** Camera far plane / fog end in metres. */
  viewDistance: number;
}

export const TIERS: Record<GraphicsTier, TierSpec> = {
  low: { dpr: [0.85, 1], antialias: false, shadows: false, maxVehicles: 3, maxWalkers: 3, lodFar: 11, lambertCharacters: true, viewDistance: 75 },
  medium: { dpr: [1, 1.5], antialias: false, shadows: true, maxVehicles: 6, maxWalkers: 8, lodFar: 18, lambertCharacters: false, viewDistance: 105 },
  high: { dpr: [1, 2], antialias: true, shadows: true, maxVehicles: 12, maxWalkers: 16, lodFar: 26, lambertCharacters: false, viewDistance: 120 },
};

export function resolveTier(setting: GraphicsSetting, env: { coarse: boolean; deviceMemory?: number; cores?: number }): GraphicsTier {
  if (setting !== 'auto') return setting;
  if (env.deviceMemory !== undefined && env.deviceMemory <= 3) return 'low';
  if (env.coarse && env.cores !== undefined && env.cores <= 4) return 'low';
  return env.coarse ? 'medium' : 'high';
}

export function deviceEnv() {
  const nav = typeof navigator !== 'undefined' ? (navigator as Navigator & { deviceMemory?: number }) : undefined;
  const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  return { coarse, deviceMemory: nav?.deviceMemory, cores: nav?.hardwareConcurrency };
}
