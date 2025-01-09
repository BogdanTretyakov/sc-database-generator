import { W3Object, W3Parser, W3Slk } from './utils';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { isNotNil } from '~/utils/guards';

const defaultArts = ['art', 'art:sd', 'art:hd'] as const;

class Units extends W3Parser {
  override skins = getSkinsData('unitskin.txt', [
    ...defaultArts,
    'file',
    'file:sd',
    'file:hd',
  ]);
  override iconID = 'ico';
  private ballance = new W3Slk('unitbalance.slk', 'unitBalanceID');
  private weapons = new W3Slk('unitweapons.slk', 'unitWeapID');
  private unitData = new W3Slk('unitdata.slk', 'unitID');
  private strings = {
    ...getSkinsData('neutralunitstrings.txt', ['name', 'propernames']),
    ...getSkinsData('humanunitstrings.txt', ['name', 'propernames']),
    ...getSkinsData('nightelfunitstrings.txt', ['name', 'propernames']),
    ...getSkinsData('orcunitstrings.txt', ['name', 'propernames']),
    ...getSkinsData('undeadunitstrings.txt', ['name', 'propernames']),
    ...getSkinsData('unitskinstrings.txt', ['name', 'propernames']),
  };

  override getName(data: W3Object<Units>): string {
    const name = data.getValueByKey('nam');
    if (name) {
      return name;
    }
    return this.strings[data.id]?.name ?? this.strings[data.wc3id]?.name ?? '';
  }

  getFullName(data: W3Object<Units>): string {
    const name = data.getValueByKey('pro');
    if (name) return name;
    const props =
      this.strings[data.id]?.propernames ??
      this.strings[data.wc3id]?.propernames ??
      '';
    return props.split(',')[0]?.trim();
  }

  getAttackType(data: W3Object<Units>): string {
    return this.getWithSlkFallback(data, 'a1t', this.weapons, 'atkType1');
  }

  getAttack(data: W3Object<Units>): string {
    const attackBase = Number(
      this.getWithSlkFallback(data, 'a1b', this.weapons, 'dmgplus1')
    );
    const attackDice = Number(
      this.getWithSlkFallback(data, 'a1d', this.weapons, 'dice1')
    );
    const attackSide = Number(
      this.getWithSlkFallback(data, 'a1s', this.weapons, 'sides1')
    );
    const startDamage = attackBase + attackDice;
    const endDamage = attackBase + attackDice * (attackSide || 1);
    return `${startDamage}-${endDamage}`;
  }

  getDefendType(data: W3Object<Units>): string {
    return this.getWithSlkFallback(data, 'dty', this.ballance, 'defType');
  }

  getDefend(data: W3Object<Units>): string {
    return this.getWithSlkFallback(data, 'def', this.ballance, 'def');
  }

  getModel(data: W3Object<Units>): string {
    const model = data.getValueByKey('mdl');
    if (model) return model;
    const skin = this.skins[data.id];
    if (skin) {
      return skin.file ?? skin['file:sd'] ?? skin['file:hd'];
    }
    const origSkin = this.skins[data.wc3id];
    return origSkin.file ?? origSkin['file:sd'] ?? origSkin['file:hd'];
  }

  getPoints(data: W3Object<Units>): string {
    const points = data.getValueByKey('poi');
    if (points) return Number(points).toFixed();
    return (this.unitData.data[data.id] ?? this.unitData.data[data.wc3id])
      .points;
  }
}
export class Upgrades extends W3Parser {
  override skins = {
    ...getSkinsData('upgradeskin.txt', defaultArts),
    ...getSkinsData('humanupgradefunc.txt', defaultArts),
    ...getSkinsData('neutralupgradefunc.txt', defaultArts),
    ...getSkinsData('nightelfupgradefunc.txt', defaultArts),
    ...getSkinsData('orcupgradefunc.txt', defaultArts),
    ...getSkinsData('undeadupgradefunc.txt', defaultArts),
  };
  override iconID = 'ar1';
  private upgrades = new W3Slk('upgradedata.slk', 'upgradeid');

  getBaseCost(data: W3Object<Upgrades>) {
    const val = Number(
      this.getWithSlkFallback(data, 'glb', this.upgrades, 'goldbase')
    );
    if (isNaN(val)) {
      console.warn(`Nan cost at ${data.id}`);
      return 0;
    }
    return val;
  }

  getModifierCost(data: W3Object<Upgrades>) {
    const val = Number(
      this.getWithSlkFallback(data, 'glm', this.upgrades, 'goldmod')
    );
    if (isNaN(val)) {
      console.warn(`Nan goldmod at ${data.id}`);
      return 0;
    }
    return val;
  }
}
class Abilities extends W3Parser {
  override skins = getSkinsData('abilityskin.txt', defaultArts);
  override iconID = 'art';

  override getName(data: W3Object<this>): string {
    return data.getRawValue('tp1');
  }
}
class Items extends W3Parser {
  override skins = getSkinsData('itemfunc.txt', defaultArts);
  override iconID = 'ico';
}

function getSkinsData<const T extends string[] | readonly string[]>(
  skinsFileName: string,
  neededKeys?: T
) {
  const fileContent = readFileSync(
    resolve(process.cwd(), 'generator', 'skinsData', skinsFileName),
    { encoding: 'utf8' }
  ).replace(/\r\n/g, '\n');

  return Array.from(
    fileContent.matchAll(/\[(?<id>\w+)\]\s*?$\r?\n(?<content>[\s\S]+?)^$/gm)
  ).reduce((acc, { groups: blockGroups }) => {
    if (!blockGroups) return acc;
    const { id, content } = blockGroups;
    const entries = Array.from(content.matchAll(/^(?<key>.+)=(?<value>.+)$/gm))
      .map(({ groups }) => groups)
      .filter(isNotNil)
      .map(({ key, value }) => [key.toLocaleLowerCase(), value] as const)
      .filter(([key]) => !neededKeys || neededKeys.includes(key));

    // @ts-expect-error
    acc[id] = Object.fromEntries(entries);
    return acc;
  }, {} as Record<string, Record<T[number], string>>);
}

export const unitsParser = new Units('w3u', 'units');
export const upgradesParser = new Upgrades('w3q', 'upgrades');
export const abilitiesParser = new Abilities('w3a', 'abilities');
export const itemsParser = new Items('w3t', 'items');
