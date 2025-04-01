import { dataFiles, lastVersions } from '~/data';

export const useDataFile = async () => {
  const route = useRoute();
  const [routeVersionType] = [route.params.versionType].flat();
  const [routeVersion] = [route.params.version].flat();

  const versionType = inject('fetchVersionType', routeVersionType || 'og');
  const version = inject('fetchVersion', routeVersion || 'latest');

  const { data, error } = await useAsyncData(
    `data-file-${versionType}-${version}`,
    () => {
      const versionTypeList = dataFiles[versionType];
      if (!versionTypeList) {
        throw new Error('unknown version type');
      }

      let findVersion = version;
      if (findVersion === 'latest') {
        findVersion = lastVersions[versionType];
      }

      const importFn = versionTypeList[findVersion];
      if (!importFn) {
        throw new Error('unknown version');
      }
      return importFn();
    }
  );

  const value = data.value;

  if (error.value) {
    throw createError(error.value ?? '');
  }

  return data;
};
