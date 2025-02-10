import { W3Object, W3Parser, W3Slk } from './utils';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { isNotNil } from '~/utils/guards';
import { uniq } from '~/utils/array';
import type {
  IArtifactObject,
  IHeroObject,
  ISpellObject,
  IUnitObject,
  IUpgradeObject,
} from '~/data/types';

const defaultArts = ['art', 'art:sd', 'art:hd'] as const;

export class Units extends W3Parser {
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

  getPoints(data: W3Object<Units>) {
    return this.getWithSlkFallback(data, 'poi', this.unitData, 'points');
  }

  getUnitObject(data: W3Object<Units>): IUnitObject {
    return {
      type: 'unit',
      id: data.id,
      name: data.getName(),
      hotkey: data.getValueByKey('hot'),
      description: data.getValueByKey('tub'),
      cost: data.getValueByKey('gol'),
      hp: this.getWithSlkFallback(data, 'hpm', this.ballance, 'HP'),
      hpReg: this.getWithSlkFallback(data, 'hpr', this.ballance, 'regenHP'),
      def: this.getWithSlkFallback(data, 'def', this.ballance, 'def'),
      defType: this.getWithSlkFallback(data, 'dty', this.ballance, 'defType'),
      atk: this.getAttack(data),
      atkType: this.getWithSlkFallback(data, 'a1t', this.weapons, 'atkType1'),
      atkRange: this.getWithSlkFallback(data, 'a1r', this.weapons, 'acquire'),
      atkSpeed: this.getWithSlkFallback(data, 'a1c', this.weapons, 'cool1'),
      upgrades: data.getArrayValue('pgr') ?? [],
      tags: String(this.getWithSlkFallback(data, 'typ', this.ballance, 'Type'))
        .replace(/_/g, '')
        .split(',')
        .map((s) => s.trim().toLocaleLowerCase()),
      skills: (data.getArrayValue('hab') ?? data.getArrayValue('abi'))
        ?.map((id) => abilitiesParser.getById(id))
        .filter(isNotNil)
        .map((i) => i.parser.getSpellObject(i))
        .filter(Abilities.filterEmptySpells),
      bounty: this.getPoints(data),
    };
  }

  getHeroObject(data: W3Object<Units>): IHeroObject {
    return {
      ...this.getUnitObject(data),
      type: 'hero',
      fullName: this.getFullName(data),
      skills:
        (data.getArrayValue('hab') ?? data.getArrayValue('abi'))
          ?.map((id) => abilitiesParser.getById(id))
          .filter(isNotNil)
          .map((i) => i.parser.getSpellObject(i))
          .filter(Abilities.filterEmptySpells) ?? [],
      stat: String(
        this.getWithSlkFallback(data, 'pra', this.ballance, 'Primary')
      ).toLocaleLowerCase() as IHeroObject['stat'],
      agi: this.getWithSlkFallback(data, 'agi', this.ballance, 'AGI'),
      str: this.getWithSlkFallback(data, 'str', this.ballance, 'STR'),
      int: this.getWithSlkFallback(data, 'int', this.ballance, 'INT'),
      agiLvl: this.getWithSlkFallback(data, 'agp', this.ballance, 'AGIplus'),
      strLvl: this.getWithSlkFallback(data, 'stp', this.ballance, 'STRplus'),
      intLvl: this.getWithSlkFallback(data, 'inp', this.ballance, 'INTplus'),
    };
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

  private getCostArray(data: W3Object<Upgrades>, skipLast = false) {
    const basePrice = this.getBaseCost(data);
    const addiction = this.getModifierCost(data);
    return Array.from(
      {
        length: data.getMaxLevel() - (skipLast ? 1 : 0),
      },
      (_, idx) => basePrice + idx * addiction
    );
  }

  getUpgradeObject(
    data: W3Object<Upgrades>,
    { level, skipLast }: { level?: number; skipLast?: boolean } = {}
  ): IUpgradeObject {
    const icons = data.getIcons();
    return {
      type: 'upgrade',
      id: data.id,
      hotkey: data.getValueByKey('hk1', level),
      name: data.getName(level),
      iconsCount: icons.length > 1 ? icons.length : undefined,
      description: data.getValueByKey('ub1', level),
      cost: level
        ? [this.getBaseCost(data) + (level - 1) * this.getModifierCost(data)]
        : this.getCostArray(data, skipLast),
    };
  }
}
class Abilities extends W3Parser {
  override skins = getSkinsData('abilityskin.txt', defaultArts);
  override iconID = 'art';

  private summonKeys = ['sf1', 'we1', 'dp1'];

  override getName(data: W3Object<Abilities>): string {
    return data.getRawValue('tp1');
  }

  static filterEmptySpells(item: ISpellObject) {
    const keys: Array<keyof ISpellObject> = [
      'area',
      'cooldown',
      'cost',
      'duration',
    ];
    return keys.every((key) => !(key in item));
  }

  getSummons(data: W3Object<Abilities>) {
    return this.summonKeys
      .map((key) => data.getValueByKey(key))
      .filter(isNotNil)
      .map(String)
      .map((s) => s.split(','))
      .flat()
      .map((s) => s.trim())
      .filter(uniq);
  }

  getSpellObject(
    data: W3Object<Abilities>,
    icons?: Record<string, string>
  ): ISpellObject {
    return {
      type: 'spell',
      id: data.id,
      name: data.getName(),
      hotkey: data.getValueByKey('hky'),
      description: data.getValueByKey('ub1'),
      area: data.getArrayValue('are')?.map(Number),
      cooldown: data.getArrayValue('cdn')?.map(Number),
      cost: data.getArrayValue('mcs')?.map(Number),
      duration: data.getArrayValue('dut')?.map(Number),
      targets: data.getArrayValue('tar'),
      summonUnit: this.getSummons(data)
        .map((id) => unitsParser.getById(id))
        .filter(isNotNil)
        .map((s) => s.withIconSilent(icons ?? {}).parser.getUnitObject(s)),
    };
  }
}
class Items extends W3Parser {
  override skins = getSkinsData('itemfunc.txt', defaultArts);
  override iconID = 'ico';

  getArtifactObject(data: W3Object<this>): Omit<IArtifactObject, 'level'> {
    return {
      type: 'artifact',
      id: data.id,
      name: data.getName(),
      description: data.getValueByKey('tub'),
      hotkey: data.getRawValue('nam'),
    };
  }
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
