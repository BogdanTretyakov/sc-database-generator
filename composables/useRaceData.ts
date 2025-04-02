import type { IconBoundaries } from '~/components/GameIcon.vue';
import type { IRaceData, IDataFile } from '~/data/types';

export const useRaceData = async <T = IRaceData>(raceName: string) => {
  const versionIndex = await useDataFile();

  if (!versionIndex.value) {
    throw createError('no versionIndex');
  }

  const { data } = await useAsyncData(
    `race-${versionIndex.value.version}-${raceName}`,
    () => {
      const versionIndexValue = toValue(versionIndex);
      if (!versionIndexValue || !(raceName in versionIndexValue.racesData)) {
        throw new Error('No race found');
      }
      return versionIndexValue.racesData[raceName]() as Promise<IDataFile<T>>;
    }
  );

  const icon = computed(() => {
    return versionIndex.value?.racesIcons[raceName];
  });

  function iconProps(
    id: string,
    count?: number
  ): IconBoundaries | IconBoundaries[] {
    if (!count || count === 1) {
      const [x, y, width, height] = data.value?.icons[id] ?? [0, 0, 1, 1];
      return { x, y, width, height };
    }
    return Array.from({ length: count }, (_, idx) => {
      const countedId = `${id}-${idx + 1}`;
      const [x, y, width, height] = data.value?.icons[countedId] ?? [
        0, 0, 1, 1,
      ];
      return { x, y, width, height };
    });
  }

  if (!data.value) {
    throw createError('no data loaded');
  }

  return {
    raceData: data.value?.data!,
    raceIconsCoords: data.value?.icons!,
    iconProps,
    iconsSrc: icon.value!,
    version: versionIndex.value.version,
    versionType: versionIndex.value.versionType,
  };
};
