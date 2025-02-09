import {
  abilitiesParser,
  itemsParser,
  unitsParser,
  Upgrades,
  upgradesParser,
} from './objects';
import { getError, W3Object } from './utils';
import { hotkeys } from '~/utils/constants';
import { ImageProcessor } from './images';
import { writeFile, readFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  IArtifactData,
  IArtifactObject,
  IBaseObject,
  IBaseUltimateObject,
  IBounty,
  IBuildingObject,
  IDamageTuple,
  IDataFile,
  IMiscData,
  INeutralData,
  IPatchDamage,
  IRaceData,
  IRacePickerObject,
  IRawPatchData,
  IRawRace,
  ISpellObject,
  IUltimateObject,
  IUltimatesData,
  IUpgradeObject,
} from '~/data/types';
import { isNotNil } from '~/utils/guards';
import { mapObject } from '~/utils/object';
import capitalize from 'lodash/capitalize';
import { W3Model } from './model';

const outputDir = resolve(process.cwd(), 'dataGenerated');

const imgProcessor = new ImageProcessor(
  resolve(process.cwd(), 'dataMap'),
  outputDir
);

export class SurvivalChaosParser {
  constructor(private data: IRawPatchData, private isOZ = false) {}

  async generate() {
    await this.parseRaces();
    await this.parseUltimates();
    await this.parseArtifacts();
    await this.parseMisc();
  }

  private get pickersParser() {
    return this.isOZ ? abilitiesParser : unitsParser;
  }

  private async parseRaces() {
    const racesMap = this.data.pickers;

    const imagePaths = Object.values(racesMap)
      .flat()
      .reduce((acc, raceID) => {
        const raceDesc = this.pickersParser.getById(raceID);
        if (!raceDesc) return acc;
        const path = raceDesc.getIcon();
        if (path) {
          acc[raceID] = path;
        }
        return acc;
      }, {} as Record<string, string>);

    const racesData = await Object.keys(racesMap).reduce(
      async (allianceAcc, allianceID) => {
        const prevAllianceAcc = await allianceAcc;
        const allianceName =
          this.pickersParser.getById(allianceID)?.getName() ?? '';
        prevAllianceAcc[allianceName] = await racesMap[allianceID].reduce(
          async (racesAcc, raceId) => {
            const prevRacesAcc = await racesAcc;

            const raceObj = this.pickersParser.getById(raceId);

            const description = this.isOZ
              ? raceObj?.getName() + '<br/>' + raceObj?.getValueByKey('ub1')
              : raceObj?.getValueByKey('tub');
            const rawRaceData = this.data.races.find(({ id }) => id === raceId);
            if (!rawRaceData) return prevRacesAcc;
            const [raceData, raceIcons] = this.tokenizeRaceData(
              rawRaceData,
              description
            );

            await this.writeData(raceData.key, raceData, raceIcons);

            prevRacesAcc.push({
              id: raceId,
              description,
              key: raceData.key,
              name: raceData.name,
              hotkey: raceObj?.getValueByKey('hot'),
            });

            return prevRacesAcc;
          },
          Promise.resolve([]) as Promise<IRacePickerObject[]>
        );
        return prevAllianceAcc;
      },
      Promise.resolve({}) as Promise<Record<string, IRacePickerObject[]>>
    );

    await this.writeData('races', racesData, imagePaths);
  }

  private getUpgradeCost(upgrade: W3Object<Upgrades>, skipLast = false) {
    const basePrice = upgrade.parser.getBaseCost(upgrade);
    const addiction = upgrade.parser.getModifierCost(upgrade);
    return Array.from(
      {
        length: upgrade.getMaxLevel() - (skipLast ? 1 : 0),
      },
      (_, idx) => basePrice + idx * addiction
    );
  }

  private getBuilding(id: string): IBuildingObject {
    return unitsParser.getById(id)?.withInstance((instance) => {
      return {
        attackType: instance.parser.getAttackType(instance),
      };
    })!;
  }

  private prepareBuildings(bonuses: string[]) {
    const models: Record<string, IBaseObject> = {};
    const buildingsMap = bonuses.reduce((acc, bonusID) => {
      const instance = unitsParser.getById(bonusID);
      if (!instance) return acc;

      const modelId = new W3Model(instance).modelHash;
      if (modelId in models) {
        acc[bonusID] = models[modelId].id;
        return acc;
      }
      acc[bonusID] = modelId;
      models[modelId] = {
        id: modelId,
        name: instance.getName(),
        description: '',
        hotkey: '',
      };
      return acc;
    }, {} as Record<string, string>);
    const bonusBuildings = Object.fromEntries(
      Object.values(models).map((item) => [item.id, item])
    );

    return { bonusBuildings, buildingsMap };
  }

  private tokenizeRaceData(data: IRawRace, description: string) {
    const icons: Record<string, string> = {};

    const towerUpgradesRecs = Object.fromEntries(
      data.upgrades
        .map((id) => [id, upgradesParser.getById(id)] as const)
        .filter(([, u]) => isNotNil(u))
        .map(([id, upgrade]) => [id, upgrade?.getAllValuesByKey('req') ?? []])
    );

    const getUpgrade = (id: string): IUpgradeObject => {
      return upgradesParser.getById(id)?.withInstance((instance) => {
        const maxLvl = instance.getMaxLevel();
        const upgradeIcons = instance
          .getAllValuesByKey('ar1', ({ level }) => level <= maxLvl)
          .filter(isNotNil)
          .filter((val, idx, arr) => arr.indexOf(val) === idx);

        if (upgradeIcons.length > 1) {
          upgradeIcons.forEach((ico, idx) => {
            icons[`${id}-${idx + 1}`] = ico;
          });
        } else {
          icons[id] = upgradeIcons[0] ?? instance.getIcon();
        }

        return {
          id,
          name: instance.getName(),
          cost: this.getUpgradeCost(instance),
          hotkey: instance.getValueByKey('hk1'),
          description: instance.getValueByKey('ub1'),
          iconsCount: upgradeIcons.length,
        };
      })!;
    };

    abilitiesParser.getById(data.ulti ?? '')?.withIcon(icons);

    const { bonusBuildings, buildingsMap } = this.prepareBuildings(
      data.bonuses
    );

    const output: IRaceData = {
      id: data.id,
      key: data.key,
      name: data.name,
      description,
      ultimateId: data.ulti,
      bonusBuildings,
      auras: data.auras
        .map((auraId, idx) =>
          abilitiesParser
            .getById(auraId)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: auraId,
              name: instance.getName(),
              description: instance.getValueByKey('ub1'),
              hotkey: hotkeys[idx],
            }))
        )
        .filter(isNotNil),
      bonuses: data.bonuses
        .map((bonusID) =>
          unitsParser
            .getById(bonusID)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: bonusID,
              hotkey: instance.getValueByKey('hot'),
              name: instance.getValueByKey('tip'),
              description: instance.getValueByKey('tub'),
              buildingId: buildingsMap[bonusID],
            }))
        )
        .filter(isNotNil),
      towerUpgrades: data.upgrades
        .map((upgradeID) =>
          upgradesParser
            .getById(upgradeID)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: upgradeID,
              hotkey: instance.getValueByKey('hk1'),
              name: instance.getName(),
              description: instance.getValueByKey('ub1'),
              cost: this.getUpgradeCost(instance, true),
              relatedUpgrades: Object.entries(towerUpgradesRecs)
                .filter(([, reqs]) => reqs.includes(upgradeID))
                .map(([id]) => id),
            }))
        )
        .filter(isNotNil),
      ...mapObject(
        { t1spell: data.t1spell, t2spell: data.t2spell },
        (id) =>
          abilitiesParser
            .getById(id)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id,
              name: instance.getName(),
              description: instance.getValueByKey('ub1'),
              hotkey: instance.getValueByKey('hky'),
            }))!
      ),
      buildings: mapObject(data.buildings, this.getBuilding),
      heroes: data.heroes.map(
        (heroId, slotIdx) =>
          unitsParser
            .getById(heroId)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: heroId,
              name: instance.getName(),
              fullName: instance.parser.getFullName(instance),
              hotkey: hotkeys[slotIdx],
              description: instance.getValueByKey('tub'),
              cost: instance.getValueByKey('gol'),
              atkType: instance.parser.getAttackType(instance),
              defType: instance.parser.getDefendType(instance),
              atk: instance.parser.getAttack(instance),
              def: instance.parser.getDefend(instance),
            }))!
      ),
      magic: upgradesParser.getById(data.magic)?.withInstance((instance) => {
        // Process icons
        const { cost, iconsCount } = getUpgrade(data.magic);

        return Array.from({ length: instance.getMaxLevel() }, (_, idx) => {
          const level = idx + 1;
          return {
            id: data.magic,
            name: instance.getValueByKey('tp1', level) ?? instance.getName(),
            description:
              instance.getValueByKey('ub1', level) ??
              instance.getValueByKey('ub1'),
            hotkey: instance.getValueByKey('hk1'),
            cost: [cost[idx]],
            level,
            iconsCount,
          };
        });
      })!,
      baseUpgrades: mapObject(data.baseUpgrades, (id) => getUpgrade(id)),
      bonusUpgrades: Object.entries(data.bonusUpgrades).reduce(
        (acc, [bonusID, upgrades]) => {
          const setUpgrades = upgrades
            .map(([id, baseLevel]) => {
              const upgrade = getUpgrade(id);
              upgrade?.cost.splice(0, baseLevel);
              return upgrade;
            })
            .filter(isNotNil);
          if (setUpgrades) {
            acc[bonusID] = setUpgrades;
          }
          return acc;
        },
        {} as Record<string, IUpgradeObject[]>
      ),
      units: mapObject(
        data.units,
        (unitID) =>
          unitsParser
            .getById(unitID)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: unitID,
              name: instance.getName(),
              hotkey: instance.getValueByKey('hot'),
              description: instance.getValueByKey('tub'),
              cost: instance.getValueByKey('gol'),
              atkType: instance.parser.getAttackType(instance),
              defType: instance.parser.getDefendType(instance),
              atk: instance.parser.getAttack(instance),
              def: instance.parser.getDefend(instance),
            }))!
      ),
      bonusHeroes: data.bonusHeroes
        .map((bonusHero) =>
          unitsParser
            .getById(bonusHero.id)
            ?.withIcon(icons)
            .withInstance((instance) => ({
              id: bonusHero.id,
              name: instance.getName(),
              fullName: instance.parser.getFullName(instance),
              hotkey: hotkeys[bonusHero.slot],
              description: instance.getValueByKey('tub'),
              cost: instance.getValueByKey('gol'),
              atkType: instance.parser.getAttackType(instance),
              defType: instance.parser.getDefendType(instance),
              atk: instance.parser.getAttack(instance),
              def: instance.parser.getDefend(instance),
              items: Object.entries(bonusHero.items)
                .map(([level, itemId]) =>
                  itemsParser
                    .getById(itemId)
                    ?.withIcon(icons)
                    .withInstance((itemInstance) => ({
                      id: itemId,
                      name: itemInstance.getName(),
                      description: itemInstance.getValueByKey('tub'),
                      level: Number(level),
                      hotkey: '',
                    }))
                )
                .filter(isNotNil),
            }))
        )
        .filter(isNotNil),
    };

    if (output.towerUpgrades.length !== data.upgrades.length) {
      const notFound = data.upgrades.filter(
        (upgrId) => !output.towerUpgrades.some(({ id }) => id === upgrId)
      );

      getError(`upgrades ${notFound.join(',')} for race ${data.name}`);
    }

    return [output, icons] as const;
  }

  private async parseArtifacts() {
    const { combineMap, list } = this.data.artifacts;

    const icons = {} as Record<string, string>;

    const items: IArtifactObject[] = list.map(
      (artId) =>
        itemsParser
          .getById(artId)
          ?.withIcon(icons)
          .withInstance((instance) => {
            let level =
              instance.getValueByKey('lvo') ?? instance.getValueByKey('lev');
            // OZ fix
            if (instance.id === 'I034') {
              level = 2;
            }
            return {
              id: artId,
              name: instance.getName(),
              description: instance.getValueByKey('tub'),
              level,
              hotkey: instance.getRawValue('nam'),
            };
          })!
    );

    await this.writeData<IArtifactData>(
      'artifacts',
      {
        items,
        combineMap,
      },
      icons
    );
  }

  private async parseUltimates() {
    const rawData = this.data.ultimates;

    const icons: Record<string, string> = {};
    const requires: Record<string, string> = {};

    const getItemRequires = (data: W3Object) => {
      const reqIdArr = data.getArrayValue('req');
      const reqValArr = data.getArrayValue('rqa').map(Number);

      return reqIdArr.reduce((acc, id, idx) => {
        if (!(id in requires)) {
          const name = String(upgradesParser.getById(id)?.getRawValue('nam', 1))
            .replace(/\(.*?\)/g, '')
            .replace(/lv\d+/gm, '')
            .trim();
          requires[id] = name;
        }
        acc[id] = reqValArr[idx] ?? 0;
        return acc;
      }, {} as Record<string, number>);
    };

    const pickers: IBaseUltimateObject[] = rawData.pickers.map(
      (pickerID) =>
        abilitiesParser
          .getById(pickerID)
          ?.withIcon(icons)
          .withInstance((instance) => ({
            id: pickerID,
            name: instance.getValueByKey('tp1') ?? instance.getName(),
            description: instance.getValueByKey('ub1'),
            hotkey: instance.getValueByKey('hky'),
            requires: getItemRequires(instance),
          }))!
    );

    const spells: Record<string, IUltimateObject[]> = mapObject(
      rawData.spells,
      (spells) =>
        spells.map(
          (spellId) =>
            abilitiesParser
              .getById(spellId)
              ?.withIcon(icons)
              .withInstance((instance) => ({
                id: spellId,
                hotkey: instance.getValueByKey('hky'),
                name: instance.getValueByKey('tp1', 1) ?? instance.getName(),
                description: instance.getValueByKey('ub1', 1),
                cooldown: instance.getValueByKey('cdn', 1),
                manaCost: instance.getValueByKey('mcs', 1),
                requires: getItemRequires(instance),
              }))!
        )
    );

    await this.writeData<IUltimatesData>(
      'ultimates',
      {
        pickers,
        spells,
        requires,
      },
      icons
    );
  }

  async parseMisc() {
    const [shrines, shrineIcons] = this.parseShrines();
    const [neutrals, neutralIcons] = this.parseNeutrals();
    const [commonBonuses, commonBonusesIcons] = this.getCommonBonuses();

    const data: IMiscData = {
      damage: await this.getDamage(),
      shrines,
      neutrals,
      bounty: this.getBounty(),
      commonBonuses,
    };

    await this.writeData('misc', data, {
      ...shrineIcons,
      ...neutralIcons,
      ...commonBonusesIcons,
    });
  }

  private parseNeutrals(): [INeutralData[], Record<string, string>] {
    const icons: Record<string, string> = {};
    const neutrals: INeutralData[] = this.data.misc.neutrals
      .map((neutralId) =>
        unitsParser.getById(neutralId)?.withInstance((neutralInstance) => ({
          id: neutralInstance.id,
          name: neutralInstance.getName(),
          skills: neutralInstance
            .getArrayValue('abi')
            .map((id) => abilitiesParser.getById(id))
            .filter(isNotNil)
            .map((instance) => {
              instance.withIcon(icons);
              return {
                id: instance.id,
                name: instance.getName().replace(/\(\w+\)$/, ''),
                description: instance
                  .getAllValuesByKey(
                    'ub1',
                    ({ level }) => level > 0 && level <= 3
                  )
                  .map(String)
                  .join('<hr/>'),
                hotkey: instance.getValueByKey('hky'),
              };
            }),
        }))
      )
      .filter(isNotNil);

    return [neutrals, icons];
  }

  private parseShrines() {
    const icons: Record<string, string> = {};
    const shrines = this.data.misc.shrines
      ?.map((shrineSkillId) =>
        abilitiesParser
          .getById(shrineSkillId)
          ?.withIcon(icons)
          .withInstance((instance) => ({
            id: instance.id,
            name: instance.getName(),
            hotkey: instance.getValueByKey('hky'),
            description: instance.getValueByKey('ub1'),
          }))
      )
      .filter(isNotNil);

    return [shrines, icons] as const;
  }

  private async getDamage(): Promise<IPatchDamage> {
    const miscData: Record<string, string> = Object.fromEntries(
      (
        await readFile(
          resolve(
            process.cwd(),
            'dataMap',
            globalThis.mapVersion ?? 'w3c',
            'war3mapMisc.txt'
          ),
          'utf8'
        )
      )
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter((s) => s.includes('='))
        .map((s) => s.split('='))
    );

    return (
      [
        'chaos',
        'hero',
        'magic',
        'normal',
        'pierce',
        'siege',
        'spells',
      ] as Array<keyof IPatchDamage>
    ).reduce((acc, key) => {
      const rawDamage = (miscData[`DamageBonus${capitalize(key)}`] ?? '').split(
        ','
      );
      rawDamage.length = 8;
      acc[key] = rawDamage.map((val) => {
        const numberValue = Number(val ?? '1.00');
        if (isNaN(numberValue)) return 100;
        return Number(((numberValue || 1) * 100).toFixed());
      }) as IDamageTuple;
      return acc;
    }, {} as IPatchDamage);
  }

  private getBounty(): Record<string, IBounty> {
    const getPointById = (id: string) => {
      const value =
        unitsParser
          .getById(id)
          ?.withInstance((instance) => instance.parser.getPoints(instance)) ??
        '0';
      return value;
    };

    return Object.fromEntries(
      this.data.races.map((raceData) => {
        const barracksIDs = [raceData.buildings.barrack];

        let [lowerBarrack] = unitsParser.findIDByKey(
          'upt',
          raceData.buildings.barrack
        );
        while (!!lowerBarrack) {
          barracksIDs.unshift(lowerBarrack);
          [lowerBarrack] = unitsParser.findIDByKey('upt', lowerBarrack);
        }
        let nextBarrack = unitsParser
          .getById(raceData.buildings.barrack)
          ?.getValueByKey('upt');
        while (!!nextBarrack) {
          barracksIDs.push(nextBarrack);
          nextBarrack = unitsParser.getById(nextBarrack)?.getValueByKey('upt');
        }

        return [
          raceData.id,
          {
            ...mapObject(raceData.units, (id) => getPointById(id)),
            hero: getPointById(raceData.heroes[0]),
            su: getPointById(raceData.heroes[3]),
            tower: getPointById(raceData.buildings.tower),
            fort: getPointById(raceData.buildings.fort),
            barracks: barracksIDs.map((id) => getPointById(id)),
          },
        ] as const;
      })
    );
  }

  private getCommonBonuses() {
    const tempDisable = true;
    if (this.isOZ || tempDisable) return [undefined, {}] as const;

    const raceData = Object.fromEntries(
      this.data.races.map(({ id: raceId, bonuses }) => {
        const bonusData = Object.fromEntries(
          bonuses
            .map((id) => unitsParser.getById(id))
            .filter(isNotNil)
            .map((instance) => [instance.id, instance.getArrayValue('abi')])
        );

        return [raceId, bonusData];
      })
    );

    const abilityMap = new Map<string, { bonusID: string; raceID: string }[]>();

    for (const [raceID, bonuses] of Object.entries(raceData)) {
      for (const [bonusID, abilityIDs] of Object.entries(bonuses)) {
        const key = JSON.stringify(abilityIDs);
        if (!abilityMap.has(key)) {
          abilityMap.set(key, []);
        }
        abilityMap.get(key)!.push({ bonusID, raceID });
      }
    }

    const result: string[] = [];

    for (const [key, entries] of abilityMap.entries()) {
      const uniqueRaceIDs = new Set(entries.map((entry) => entry.raceID));

      if (uniqueRaceIDs.size > 1) {
        result.push(entries[0].bonusID);
      }
    }

    const icons: Record<string, string> = {};

    const data: Array<Array<ISpellObject | IUpgradeObject>> = result
      .map((id) => unitsParser.getById(id))
      .filter(isNotNil)
      .map((bonusInstance) => {
        const abilities: ISpellObject[] = bonusInstance
          .getArrayValue('abi')
          .map((abilityId) =>
            abilitiesParser
              .getById(abilityId)
              ?.withIcon(icons)
              .withInstance((instance) => ({
                id: abilityId,
                name: instance.getName(),
                description: instance.getValueByKey('ub1'),
                hotkey: instance.getValueByKey('hky'),
                cooldown: instance.getValueByKey('cdn'),
              }))
          )
          .filter(isNotNil);

        const upgrades: IUpgradeObject[] = bonusInstance
          .getArrayValue('upt')
          .map((upgradeId) =>
            upgradesParser
              .getById(upgradeId)
              ?.withIcon(icons)
              .withInstance((instance) => ({
                id: upgradeId,
                name: instance.getName(),
                hotkey: instance.getValueByKey('hk1'),
                description: instance.getValueByKey('ub1'),
                cost: this.getUpgradeCost(instance),
              }))
          )
          .filter(isNotNil);

        return abilities.concat(upgrades);
      });

    return [data, icons] as const;
  }

  private async writeData<T>(
    name: string,
    data: T,
    icons: Record<string, string>
  ) {
    const iconsCoors = await imgProcessor.processImages(icons, name);

    const output: IDataFile<T> = {
      data,
      icons: iconsCoors,
    };

    await writeFile(
      resolve(outputDir, `${name}.json`),
      JSON.stringify(output),
      { encoding: 'utf8' }
    );
  }
}
