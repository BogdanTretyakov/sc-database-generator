import { W3Object, W3Parser, W3Slk } from './utils';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { isNotNil } from '~/utils/guards';

const defaultArts = ['art', 'art:sd', 'art:hd'];

class Units extends W3Parser {
  override skins = getSkinsData(
    'unitskin.txt',
    defaultArts.concat('file', 'file:sd', 'file:hd')
  );
  override iconID = 'ico';
  private ballance = new W3Slk('unitbalance.slk', 'unitBalanceID');
  private weapons = new W3Slk('unitweapons.slk', 'unitWeapID');
  private strings = {
    ...getSkinsData('neutralunitstrings.txt', ['name']),
    ...getSkinsData('humanunitstrings.txt', ['name']),
    ...getSkinsData('nightelfunitstrings.txt', ['name']),
    ...getSkinsData('orcunitstrings.txt', ['name']),
    ...getSkinsData('undeadunitstrings.txt', ['name']),
    ...getSkinsData('unitskinstrings.txt', ['name']),
  };

  override getName(data: W3Object<Units>): string {
    const name = data.getValueByKey('nam');
    if (name) {
      return name;
    }
    return this.strings[data.id]?.name ?? this.strings[data.wc3id]?.name ?? '';
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
}
export class Upgrades extends W3Parser {
  override skins = getSkinsData('upgradeskin.txt', defaultArts);
  override iconID = 'ar1';
  private upgrades = new W3Slk('upgradedata.slk', 'upgradeid');

  getBaseCost(data: W3Object<Upgrades>) {
    return Number(
      this.getWithSlkFallback(data, 'glb', this.upgrades, 'goldbase')
    );
  }
}
class Abilities extends W3Parser {
  override skins = getSkinsData('abilityskin.txt', defaultArts);
  override iconID = 'art';
}
class Items extends W3Parser {
  override skins = getSkinsData('itemfunc.txt', defaultArts);
  override iconID = 'ico';
}

function getSkinsData(skinsFileName: string, neededKeys?: string[]) {
  const fileContent = readFileSync(
    resolve(process.cwd(), 'generator', 'skinsData', skinsFileName),
    { encoding: 'utf8' }
  ).replace(/\r\n/g, '\n');

  return Array.from(
    fileContent.matchAll(/^\[(?<id>\w+)\]\s*?$\r?\n(?<content>[\s\S]+?)^$/gm)
  ).reduce((acc, { groups: blockGroups }) => {
    if (!blockGroups) return acc;
    const { id, content } = blockGroups;
    const entries = Array.from(content.matchAll(/^(?<key>.+)=(?<value>.+)$/gm))
      .map(({ groups }) => groups)
      .filter(isNotNil)
      .map(({ key, value }) => [key.toLocaleLowerCase(), value] as const)
      .filter(([key]) => !neededKeys || neededKeys.includes(key));

    acc[id] = Object.fromEntries(entries);
    return acc;
  }, {} as Record<string, Record<string, string>>);
}

export const unitsParser = new Units('war3map.w3u', 'units');
export const upgradesParser = new Upgrades('war3map.w3q', 'upgrades');
export const abilitiesParser = new Abilities('war3map.w3a', 'abilities');
export const itemsParser = new Items('war3map.w3t', 'items');
