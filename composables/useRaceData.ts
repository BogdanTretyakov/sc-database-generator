import type { IRaceData, IDataFile } from '~/data/types';
import { dataFiles, lastVersions, type VersionIndexFile } from '~/data';
import type { GetIconPropsFn } from '~/types/app';

type IRaceDataReturn<T = unknown> = {
  raceData: T;
  raceIconsCoords: IDataFile['icons'];
  iconProps: GetIconPropsFn;
  iconsSrc: string;
  version: string;
  versionType: string;
};

const internalUseRaceData = async (
  raceName: string,
  type: string,
  version: string
) => {
  const versionTypeFiles = dataFiles[type];

  // Загрузка JSON-данных
  const importFn = versionTypeFiles[version];
  if (!importFn) throw createError('unknown version');

  const versionIndex = await importFn();

  if (!(raceName in versionIndex.racesData)) {
    throw createError('No race found');
  }

  const raceDataFile = (await versionIndex.racesData[raceName]()) as IDataFile;

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
  } satisfies IRaceDataReturn;
};

const cache = new Map<string, IRaceDataReturn>();

export const useRaceData = async <T = IRaceData>(
  raceName: string,
  type?: string,
  version?: string
) => {
  const route = useRouter().currentRoute.value;

  const versionType = type ?? (route.params.versionType as string) ?? 'og';
  let versionStr = version ?? ((route.params.version as string) || 'latest');

  if (versionStr === 'latest') {
    versionStr = lastVersions[versionType];
  }
  const versionTypeFiles = dataFiles[versionType];
  if (!versionTypeFiles) throw createError('unknown version type');

  const key = `${raceName}-${versionType}-${versionStr}`;
  if (cache.has(key)) {
    return cache.get(key) as IRaceDataReturn<T>;
  }
  const data = await internalUseRaceData(raceName, versionType, versionStr);
  cache.set(key, data);
  return data as IRaceDataReturn<T>;
};
