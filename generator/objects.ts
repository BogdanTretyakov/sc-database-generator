import { W3Parser } from './utils';
import XLSX from 'xlsx';
import { resolve } from 'path';

class Units extends W3Parser {}
class Upgrades extends W3Parser {}
class Abilities extends W3Parser {}

export const unitsParser = new Units('war3map.w3u', 'units', 'unitskin.txt');
export const upgradesParser = new Upgrades(
  'war3map.w3q',
  'upgrades',
  'upgradeskin.txt',
  'ar1'
);
export const abilitiesParser = new Abilities(
  'war3map.w3a',
  'abilities',
  'abilityskin.txt',
  'art'
);

const unitWeaponsBook = XLSX.readFile(
  resolve(process.cwd(), 'generator/skinsData/unitweapons.slk')
);
const unitWeaponsSheet = unitWeaponsBook.Sheets[unitWeaponsBook.SheetNames[0]];

export const unitWeapons: Record<string, string>[] =
  XLSX.utils.sheet_to_json(unitWeaponsSheet);

const unitBalanceBook = XLSX.readFile(
  resolve(process.cwd(), 'generator/skinsData/unitbalance.slk')
);
const unitBalanceSheet = unitBalanceBook.Sheets[unitBalanceBook.SheetNames[0]];

export const unitBalance: Record<string, string>[] =
  XLSX.utils.sheet_to_json(unitBalanceSheet);

const upgradeBook = XLSX.readFile(
  resolve(process.cwd(), 'generator/skinsData/upgradedata.slk')
);
const upgradeSheet = upgradeBook.Sheets[upgradeBook.SheetNames[0]];

export const upgradeData: Record<string, string>[] =
  XLSX.utils.sheet_to_json(upgradeSheet);
