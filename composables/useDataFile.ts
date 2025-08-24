import { dataFiles, lastVersions } from '~/data';

export const useDataFile = async (
  customVersionType?: string,
  customVersion?: string
) => {
  const route = useRoute();
  const [routeVersionType] = [route.params.versionType].flat();
  const [routeVersion] = [route.params.version].flat();

  const versionType = inject('fetchVersionType', routeVersionType || 'og');
  const version = inject('fetchVersion', routeVersion || 'latest');

  const { data, error } = await useAsyncData(
    `data-file-${customVersionType ?? versionType}-${customVersion ?? version}`,
    () => {
      const versionTypeList = dataFiles[customVersionType ?? versionType];
      if (!versionTypeList) {
        throw new Error('unknown version type');
      }

      let findVersion = customVersion ?? version;
      if (findVersion === 'latest') {
        findVersion = lastVersions[versionType];
      }

      const importFn = versionTypeList[findVersion];
      if (!importFn) {
        throw new Error('unknown version');
      }
      return importFn();
    },
    {
      watch: [() => customVersionType, () => customVersion],
    }
  );

  const value = data.value;

  if (error.value) {
    throw createError(error.value ?? '');
  }

  return data;
};
