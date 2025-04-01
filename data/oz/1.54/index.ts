import type { IDataFile } from '~/data/types';
import type { VersionIndexFile } from '~/data';

const racesData = Object.entries(
  import.meta.glob('./*.json', { import: 'default', eager: false })
).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\/|\./g);
  const name = path[path.length - 2];
  acc[name] = value as () => Promise<IDataFile>;
  return acc;
}, {} as Record<string, () => Promise<IDataFile>>);

const racesIcons = Object.entries(
  import.meta.glob('./*.webp', { import: 'default', eager: true })
).reduce((acc, [key, value]) => {
  const path = key.split(/\\|\/|\./g);
  const name = path[path.length - 2];
  acc[name] = value as string;
  return acc;
}, {} as Record<string, string>);

const version = '1.54';
const versionType = 'oz';

export default {
  racesData,
  racesIcons,
  version,
  versionType,
} as VersionIndexFile;
