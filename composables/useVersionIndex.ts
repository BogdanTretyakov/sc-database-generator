import { versionIndexes, type VersionIndexFile } from '~/data';

export const useVersionIndex = () => {
  const route = useRoute();
  const versionType = useVersionType();

  const version = computed(() => {
    let [raw] = [route.params.versionType].flat();
    if (!raw || !(raw in versionIndexes)) return versionType.value;
    return raw;
  });

  return computed<VersionIndexFile>(() => versionIndexes[version.value]);
};
