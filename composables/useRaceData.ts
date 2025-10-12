import type { IconBoundaries } from '~/components/GameIcon.vue';
import type { IRaceData, IDataFile } from '~/data/types';
import { dataFiles, lastVersions, type VersionIndexFile } from '~/data';
import type { GetIconPropsFn } from '~/types/app';

type RaceCacheEntry<T> = {
  raceDataFile: IDataFile<T>;
  versionIndex: VersionIndexFile;
};

// Глобальный кэш на уровне модуля (для повторного рендеринга компонентов на клиенте)
const globalRaceCache = new Map<string, RaceCacheEntry<any>>();

export const useRaceData = async <T = IRaceData>(
  raceName: string,
  type?: string,
  version?: string
) => {
  const route = useRouter().currentRoute.value;

  const versionType = type ?? (route.params.versionType as string) ?? 'og';
  let versionStr = version ?? (route.params.version as string) ?? 'latest';

  const versionTypeFiles = dataFiles[versionType];
  if (!versionTypeFiles) throw createError('unknown version type');

  if (versionStr === 'latest') {
    versionStr = lastVersions[versionType];
  }

  const cacheKey = `${versionType}-${versionStr}-${raceName}`;

  // useState обеспечивает кэш на уровне SSR + клиентская гидрация
  const cachedState = useState<RaceCacheEntry<T> | null>(
    `race-cache-${cacheKey}`,
    () => null
  );

  let raceDataFile: IDataFile<T>;
  let versionIndex: VersionIndexFile;

  if (cachedState.value) {
    ({ raceDataFile, versionIndex } = cachedState.value);
  } else if (globalRaceCache.has(cacheKey)) {
    ({ raceDataFile, versionIndex } = globalRaceCache.get(cacheKey)!);
    cachedState.value = { raceDataFile, versionIndex };
  } else {
    // Загрузка JSON-данных
    const importFn = versionTypeFiles[versionStr];
    if (!importFn) throw createError('unknown version');

    versionIndex = await importFn();

    if (!(raceName in versionIndex.racesData)) {
      throw createError('No race found');
    }

    raceDataFile = (await versionIndex.racesData[raceName]()) as IDataFile<T>;

    cachedState.value = { raceDataFile, versionIndex };
    globalRaceCache.set(cacheKey, { raceDataFile, versionIndex });
  }

  // Функция iconProps остаётся чисто клиентской
  const iconProps = ((id: string, count?: number) => {
    if (!count || count === 1) {
      const [x, y, width, height] = raceDataFile.icons[id] ?? [0, 0, 1, 1];
      return { x, y, width, height };
    }
    return Array.from({ length: count }, (_, idx) => {
      const countedId = `${id}-${idx + 1}`;
      const [x, y, width, height] = raceDataFile.icons[countedId] ?? [
        0, 0, 1, 1,
      ];
      return { x, y, width, height };
    });
  }) as GetIconPropsFn;

  return {
    raceData: raceDataFile.data,
    raceIconsCoords: raceDataFile.icons,
    iconProps,
    iconsSrc: versionIndex.racesIcons[raceName],
    version: versionIndex.version,
    versionType: versionIndex.versionType,
  };
};
