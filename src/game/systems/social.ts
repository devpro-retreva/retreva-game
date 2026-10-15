/**
 * Social life: chatting and gifts raise how much someone likes you (regard, 0–100, see life.ts);
 * friends give you a better price. Pure functions — the store applies them and saves.
 */
import { addRegard, regardTier, type LifeState } from './life';

export interface SocialRecord {
  lastChat: number;
  lastGift: number;
  gifts: number;
}

/** A proper chat once every few minutes; chatting again sooner is just small talk. */
export const CHAT_COOLDOWN_MS = 4 * 60_000;
export const CHAT_GAIN = 3;
export const GIFT_LIKED = 8;
export const GIFT_OK = 3;

const rec = (life: LifeState, npcId: string): SocialRecord => life.social[npcId] ?? { lastChat: 0, lastGift: 0, gifts: 0 };

export function chatReady(life: LifeState, npcId: string, now: number): boolean {
  const last = rec(life, npcId).lastChat;
  return last === 0 || now - last >= CHAT_COOLDOWN_MS;
}

export function chat(life: LifeState, npcId: string, now: number): { life: LifeState; gain: number } {
  if (!chatReady(life, npcId, now)) return { life, gain: 0 };
  const r = rec(life, npcId);
  return {
    life: { ...life, regard: addRegard(life.regard, npcId, CHAT_GAIN), social: { ...life.social, [npcId]: { ...r, lastChat: now } } },
    gain: CHAT_GAIN,
  };
}

/** How much a gift means: something they like is worth more; a second gift in quick succession counts for little. */
export function giftGain(life: LifeState, npcId: string, liked: boolean, now: number): number {
  const base = liked ? GIFT_LIKED : GIFT_OK;
  const last = rec(life, npcId).lastGift;
  return last !== 0 && now - last < CHAT_COOLDOWN_MS ? 1 : base;
}

export function giveGift(life: LifeState, npcId: string, liked: boolean, now: number): { life: LifeState; gain: number } {
  const gain = giftGain(life, npcId, liked, now);
  const r = rec(life, npcId);
  return {
    life: { ...life, regard: addRegard(life.regard, npcId, gain), social: { ...life.social, [npcId]: { ...r, lastGift: now, gifts: r.gifts + 1 } } },
    gain,
  };
}

/** Friends get 10% off at their shop, close friends 15%. */
export function friendDiscount(regard: number): number {
  return regard >= 60 ? 0.15 : regard >= 30 ? 0.1 : 0;
}

/** Discounted price, rounded to ₦50 (never below ₦50). */
export function friendPrice(price: number, regard: number): number {
  const pct = friendDiscount(regard);
  if (!pct) return price;
  return Math.max(50, Math.round((price * (1 - pct)) / 50) * 50);
}

/** True when a regard change crosses into a warmer tier (used for "you're friends now" moments). */
export function tierUp(before: number, after: number): string | null {
  const a = regardTier(before);
  const b = regardTier(after);
  return a !== b && after > before ? b : null;
}
