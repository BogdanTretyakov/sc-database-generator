import type { IRaceDataFile } from "./types"

export interface VersionIndexFile {
  racesIcons: Record<string, string>;
  racesData: Record<string, () => Promise<IRaceDataFile>>;
}

export const versions = Object.entries(import.meta.glob(
  './**/index.ts',
  { import: 'default' }
)).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\//g)
  const version = path[path.length - 2]
  // @ts-expect-error
  acc[version] = value
  return acc
}, {} as Record<string, () => Promise<VersionIndexFile>>)


export const lastVersion = "4.24";
