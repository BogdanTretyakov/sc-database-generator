import type { IDataFile } from './types';

export interface VersionIndexFile {
  racesIcons: Record<string, string>;
  racesData: Record<string, () => Promise<IDataFile>>;
  version: string;
  versionType: string;
}

export const dataFiles = Object.entries(
  import.meta.glob('./**/index.ts', { import: 'default' })
).reduce((acc, [key, value]) => {
  const path = key.split('/');
  const [, type, version] = path;
  if (!acc[type]) {
    acc[type] = {};
  }
  acc[type][version] = value as () => Promise<VersionIndexFile>;
  return acc;
}, {} as Record<string, Record<string, () => Promise<VersionIndexFile>>>);

export const lastVersions = Object.fromEntries(
  Object.entries(dataFiles).map(([type, files]) => {
    const [lastVersion] = sortVersion(Object.keys(files));
    return [type, lastVersion] as const;
  })
);
