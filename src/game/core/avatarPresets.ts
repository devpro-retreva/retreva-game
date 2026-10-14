import type { Accessory, AvatarLook, FacialHair, Gender, HairStyle, Headwear, OutfitStyle } from '../persistence/types';

/**
 * Avatar options. Gender picks the body model and which style sets are
 * offered; colours, skin, build and glasses are shared by everyone.
 * `sanitizeLook` keeps any look (old saves, a gender switch) valid.
 */

export const GENDERS: { id: Gender; name: string }[] = [
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' },
];

export const SKIN_TONES = ['#c99a74', '#a8734d', '#8d5a3b', '#6b4026', '#5a3420', '#4a2c1c', '#3a2216'];

export const HAIR_COLORS = [
  { id: '#17110c', name: 'Black' },
  { id: '#3b2414', name: 'Dark brown' },
  { id: '#6b3a1f', name: 'Auburn' },
  { id: '#b08a4a', name: 'Honey' },
  { id: '#9a9590', name: 'Silver' },
];

export const COLOURWAYS: { id: string; name: string; top: string; bottom: string }[] = [
  { id: 'sun', name: 'Sunshine', top: '#f2b705', bottom: '#1f3a5f' },
  { id: 'lagoon', name: 'Lagoon', top: '#1d7f86', bottom: '#e9dcc0' },
  { id: 'sunset', name: 'Sunset', top: '#e4572e', bottom: '#2a2a2a' },
  { id: 'forest', name: 'Forest', top: '#1f6f4a', bottom: '#f4f0e6' },
  { id: 'indigo', name: 'Indigo', top: '#2d3f8f', bottom: '#c7b38a' },
  { id: 'plum', name: 'Plum', top: '#7a3b72', bottom: '#2b2b33' },
  { id: 'cloud', name: 'Cloud', top: '#f4f0e6', bottom: '#4a5a72' },
];

export const HEAD_COLORS = ['#f4f0e6', '#d8452b', '#f2b705', '#6b3f8f', '#1f6f4a', '#2c5f9e', '#15130f'];

export const BUILDS: { id: AvatarLook['build']; name: string }[] = [
  { id: 'slim', name: 'Slim' },
  { id: 'regular', name: 'Regular' },
  { id: 'broad', name: 'Broad' },
];

type Opt<T> = { id: T; name: string };

export const OPTIONS: Record<Gender, {
  hair: Opt<HairStyle>[];
  facialHair: Opt<FacialHair>[];
  outfit: Opt<OutfitStyle>[];
  headwear: Opt<Headwear>[];
  accessory: Opt<Accessory>[];
}> = {
  male: {
    hair: [
      { id: 'low', name: 'Low cut' },
      { id: 'hightop', name: 'High top' },
      { id: 'afro', name: 'Afro' },
      { id: 'locs', name: 'Locs' },
      { id: 'bald', name: 'Bald' },
    ],
    facialHair: [
      { id: 'none', name: 'Clean' },
      { id: 'moustache', name: 'Moustache' },
      { id: 'goatee', name: 'Goatee' },
      { id: 'beard', name: 'Full beard' },
    ],
    outfit: [
      { id: 'shirt', name: 'Shirt & trousers' },
      { id: 'kaftan', name: 'Kaftan' },
      { id: 'tee-shorts', name: 'Tee & shorts' },
    ],
    headwear: [
      { id: 'none', name: 'None' },
      { id: 'cap', name: 'Cap' },
      { id: 'kufi', name: 'Fila' },
    ],
    accessory: [
      { id: 'none', name: 'None' },
      { id: 'glasses', name: 'Glasses' },
    ],
  },
  female: {
    hair: [
      { id: 'puff', name: 'Afro puff' },
      { id: 'braids', name: 'Braids' },
      { id: 'long', name: 'Long' },
      { id: 'bun', name: 'Bun' },
      { id: 'short', name: 'Short' },
    ],
    facialHair: [{ id: 'none', name: 'None' }],
    outfit: [
      { id: 'dress', name: 'Dress' },
      { id: 'top-skirt', name: 'Top & skirt' },
      { id: 'top-trousers', name: 'Top & trousers' },
    ],
    headwear: [
      { id: 'none', name: 'None' },
      { id: 'gele', name: 'Gele' },
      { id: 'wrap', name: 'Headwrap' },
      { id: 'cap', name: 'Cap' },
    ],
    accessory: [
      { id: 'none', name: 'None' },
      { id: 'earrings', name: 'Earrings' },
      { id: 'glasses', name: 'Glasses' },
    ],
  },
};

export function defaultLookFor(gender: Gender): AvatarLook {
  return gender === 'female'
    ? { gender, skin: SKIN_TONES[3], hair: 'puff', hairColor: '#17110c', facialHair: 'none', outfit: 'dress', top: COLOURWAYS[4].top, bottom: COLOURWAYS[4].bottom, headwear: 'none', headColor: '#d8452b', accessory: 'earrings', build: 'regular' }
    : { gender, skin: SKIN_TONES[3], hair: 'low', hairColor: '#17110c', facialHair: 'none', outfit: 'shirt', top: COLOURWAYS[0].top, bottom: COLOURWAYS[0].bottom, headwear: 'none', headColor: '#f4f0e6', accessory: 'none', build: 'regular' };
}

export const DEFAULT_AVATAR = defaultLookFor('male');

/** Default heights in metres; the body model scales from these. */
export const HEIGHT: Record<Gender, number> = { male: 1.78, female: 1.68 };

const has = <T,>(opts: Opt<T>[], v: unknown): v is T => opts.some((o) => o.id === v);

/** Returns a look where every option is valid for its gender (unknown values fall back to that gender's defaults). */
export function sanitizeLook(input: Partial<AvatarLook> & { gender?: Gender }): AvatarLook {
  const gender: Gender = input.gender === 'female' ? 'female' : 'male';
  const d = defaultLookFor(gender);
  const o = OPTIONS[gender];
  return {
    gender,
    skin: typeof input.skin === 'string' ? input.skin : d.skin,
    hair: has(o.hair, input.hair) ? input.hair : d.hair,
    hairColor: typeof input.hairColor === 'string' ? input.hairColor : d.hairColor,
    facialHair: has(o.facialHair, input.facialHair) ? input.facialHair : 'none',
    outfit: has(o.outfit, input.outfit) ? input.outfit : d.outfit,
    top: typeof input.top === 'string' ? input.top : d.top,
    bottom: typeof input.bottom === 'string' ? input.bottom : d.bottom,
    headwear: has(o.headwear, input.headwear) ? input.headwear : 'none',
    headColor: typeof input.headColor === 'string' ? input.headColor : d.headColor,
    accessory: has(o.accessory, input.accessory) ? input.accessory : 'none',
    build: input.build === 'slim' || input.build === 'broad' ? input.build : 'regular',
  };
}

/** Switching gender keeps shared choices (skin, colours, build) and resets gender-specific ones. */
export function switchGender(look: AvatarLook, gender: Gender): AvatarLook {
  if (look.gender === gender) return look;
  const d = defaultLookFor(gender);
  return sanitizeLook({
    ...d,
    skin: look.skin,
    hairColor: look.hairColor,
    top: look.top,
    bottom: look.bottom,
    headColor: look.headColor,
    build: look.build,
    accessory: look.accessory === 'glasses' ? 'glasses' : d.accessory,
  });
}

/** Upgrades a schema-1 avatar (no gender or hair) to the current shape. */
export function upgradeAvatarV1(old: Record<string, unknown>): AvatarLook {
  const gender: Gender = old.headwear === 'gele' ? 'female' : 'male';
  return sanitizeLook({ ...(old as Partial<AvatarLook>), gender });
}
