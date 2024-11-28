import type { IDataFile } from './types';
import w3c from './w3c';
import oz from './oz';

export interface VersionIndexFile {
  racesIcons: Record<string, string>;
  racesData: Record<string, () => Promise<IDataFile>>;
  version: string;
}

export const versionIndexes = { w3c, oz };

export const defaultVersionType = 'w3c';
