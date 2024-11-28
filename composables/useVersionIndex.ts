import {
  defaultVersionType,
  versionIndexes,
  type VersionIndexFile,
} from '~/data';

export const useVersionIndex = () => {
  const route = useRoute();
  const versionType = computed(
    () => [route.params.versionType].flat()[0] || defaultVersionType
  );

  //@ts-expect-error
  return computed<VersionIndexFile>(() => versionIndexes[versionType.value]);
};
