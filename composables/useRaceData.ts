import type { IconBoundaries } from '~/components/GameIcon.vue';
import type { IRaceData, IDataFile } from '~/data/types';

export const useRaceData = async <T = IRaceData>(raceName?: string) => {
  const [routeRace] = [useRoute().params.race].flat();
  const versionIndex = useVersionIndex();

  const race = raceName ?? routeRace;
  const { data } = await useAsyncData(
    `race-${versionIndex.value.version}-${race}`,
    async () => {
      if (!(race in versionIndex.value.racesData)) {
        throw new Error('No race found');
      }
      return versionIndex.value.racesData[race]() as Promise<IDataFile<T>>;
    },
    {
      default: () => ({} as IDataFile<T>),
      deep: false,
    }
  );

  function iconProps(
    id: string,
    count?: number
  ): IconBoundaries | IconBoundaries[] {
    if (!count || count === 1) {
      const [x, y, width, height] = data.value.icons[id] ?? [0, 0, 1, 1];
      return { x, y, width, height };
    }
    return Array.from({ length: count }, (_, idx) => {
      const countedId = `${id}-${idx + 1}`;
      const [x, y, width, height] = data.value.icons[countedId] ?? [0, 0, 1, 1];
      return { x, y, width, height };
    });
  }

  return {
    raceData: data.value.data,
    raceIconsCoords: data.value.icons,
    iconProps,
  };
};
