import { useMemo } from 'react';
import { deviceEnv, resolveTier, TIERS, type GraphicsTier, type TierSpec } from '../game/core/quality';
import { useGame } from '../game/store/gameStore';

/** The effective graphics tier (setting resolved against this device). */
export function useTier(): TierSpec & { tier: GraphicsTier } {
  const setting = useGame((s) => s.settings.graphics ?? 'auto');
  return useMemo(() => {
    const tier = resolveTier(setting, deviceEnv());
    return { tier, ...TIERS[tier] };
  }, [setting]);
}
