import { versionIndexes, type VersionIndexFile } from '~/data';

export const useVersionIndex = () => {
  const versionType = useVersionType();

  return computed<VersionIndexFile>(() => versionIndexes[versionType.value]);
};
