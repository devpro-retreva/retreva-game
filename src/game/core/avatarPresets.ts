import type { AvatarLook } from '../persistence/types';

export const SKIN_TONES = ['#8d5a3b', '#6b4026', '#5a3420', '#4a2c1c', '#3a2216', '#c99a74'];

export const OUTFITS: { id: string; name: string; top: string; bottom: string }[] = [
  { id: 'agbada', name: 'Market day', top: '#f2b705', bottom: '#1f3a5f' },
  { id: 'teal', name: 'Lagoon', top: '#1d7f86', bottom: '#e9dcc0' },
  { id: 'coral', name: 'Sunset', top: '#e4572e', bottom: '#2a2a2a' },
  { id: 'green', name: 'Flag green', top: '#1f6f4a', bottom: '#f4f0e6' },
  { id: 'indigo', name: 'Adire', top: '#2d3f8f', bottom: '#c7b38a' },
];

export const HEADWEAR: { id: AvatarLook['headwear']; name: string }[] = [
  { id: 'none', name: 'None' },
  { id: 'cap', name: 'Cap' },
  { id: 'kufi', name: 'Fila' },
  { id: 'gele', name: 'Gele' },
];

export const BUILDS: { id: AvatarLook['build']; name: string }[] = [
  { id: 'slim', name: 'Slim' },
  { id: 'regular', name: 'Regular' },
  { id: 'broad', name: 'Broad' },
];

export const DEFAULT_AVATAR: AvatarLook = {
  skin: SKIN_TONES[1],
  top: OUTFITS[0].top,
  bottom: OUTFITS[0].bottom,
  headwear: 'none',
  headColor: '#f4f0e6',
  build: 'regular',
};
