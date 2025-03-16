import icons from '~/assets/icons.webp';
import coords from '~/assets/icons.json';
import type { IconBoundaries } from '~/components/GameIcon.vue';

const mappedCoords = mapObject(
  coords,
  ([x, y, width, height]): IconBoundaries => ({
    x,
    y,
    width,
    height,
  })
);

export type AssetsIconKey = keyof typeof coords;

export const useAssets = () => {
  return [icons, mappedCoords] as const;
};
