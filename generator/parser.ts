import {
  abilitiesParser,
  itemsParser,
  unitsParser,
  Upgrades,
  upgradesParser,
} from './objects';
import { W3Object, W3Parser } from './utils';
import { hotkeys } from '~/utils/constants';
import { ImageProcessor } from './images';
import { writeFile, copyFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  IArtifactData,
  IArtifactObject,
  IBaseObject,
  IBaseUltimateObject,
  IBuildingObject,
  IDataFile,
  IRaceData,
  IRacePickerObject,
  IRawPatchData,
  IRawRace,
  IUltimateObject,
  IUltimatesData,
  IUpgradeObject,
} from '~/data/types';
import { isNotNil } from '~/utils/guards';
import { mapObject } from '~/utils/object';
import { v4 as uuid } from 'uuid';

const outputDir = resolve(process.cwd(), 'dataGenerated');

const imgProcessor = new ImageProcessor(
  resolve(process.cwd(), 'dataMap'),
  outputDir
);

export class SurvivalChaosParser {
  constructor(private data: IRawPatchData, private pickersParser: W3Parser) {}

  async generate() {
    await this.parseRaces();
    await this.parseUltimates();
    await this.parseArtifacts();
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

    const racesCoords = await imgProcessor.processImages(imagePaths, 'races');

    const racesData = await Object.keys(racesMap).reduce(
      async (allianceAcc, allianceID) => {
        const prevAllianceAcc = await allianceAcc;
        const allianceName =
          this.pickersParser.getById(allianceID)?.getName() ?? '';
        prevAllianceAcc[allianceName] = await racesMap[allianceID].reduce(
          async (racesAcc, raceId) => {
            const prevRacesAcc = await racesAcc;

            const raceObj = this.pickersParser.getById(raceId);

            const description =
              raceObj?.getValueByKey('tub') || raceObj?.getValueByKey('ub1');
            const rawRaceData = this.data.races.find(({ id }) => id === raceId);
            if (!rawRaceData) return prevRacesAcc;
            const [raceData, raceIcons] = this.tokenizeRaceData(
              rawRaceData,
              description
            );

            const raceIconsCoords = await imgProcessor.processImages(
              raceIcons,
              `${raceData.key}`
            );

            await writeFile(
              resolve(outputDir, `${raceData.key}.json`),
              JSON.stringify({ data: raceData, icons: raceIconsCoords }),
              { encoding: 'utf8' }
            );

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

    await writeFile(
      resolve(process.cwd(), 'dataGenerated', 'races.json'),
      JSON.stringify({ data: racesData, icons: racesCoords }),
      { encoding: 'utf8' }
    );
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
      let model = instance?.parser.getModel(instance);
      const modelName = model
        ?.split(/[\\\/\.]/g)
        .at(-2)
        ?.toLocaleLowerCase();
      if (!modelName || !instance) return acc;
      if (modelName in models) {
        acc[bonusID] = models[modelName].id;
        return acc;
      }
      const id = uuid();
      acc[bonusID] = id;
      models[modelName] = {
        id,
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
          icons[id] = upgradeIcons[0];
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
      heroes: data.heroes.map((slotHeroes, slotIdx) =>
        slotHeroes
          .map((heroId) =>
            unitsParser
              .getById(heroId)
              ?.withIcon(icons)
              .withInstance((instance) => ({
                id: heroId,
                name: instance.getName(),
                fullName: instance.parser.getFullName(instance),
                hotkey: instance.getValueByKey('hot') ?? hotkeys[slotIdx],
                description: instance.getValueByKey('tub'),
                cost: instance.getValueByKey('gol'),
                atkType: instance.parser.getAttackType(instance),
                defType: instance.parser.getDefendType(instance),
                atk: instance.parser.getAttack(instance),
                def: instance.parser.getDefend(instance),
              }))
          )
          .filter(isNotNil)
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
    };

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
          .withInstance((instance) => ({
            id: artId,
            name: instance.getName(),
            description: instance.getValueByKey('tub'),
            level:
              instance.getValueByKey('lvo') ?? instance.getValueByKey('lev'),
            hotkey: instance.getRawValue('nam'),
          }))!
    );

    const coords = await imgProcessor.processImages(icons, 'artifacts');

    const output: IDataFile<IArtifactData> = {
      data: {
        items,
        combineMap,
      },
      icons: coords,
    };

    await writeFile(
      resolve(outputDir, `artifacts.json`),
      JSON.stringify(output),
      { encoding: 'utf8' }
    );
  }

  private async parseUltimates() {
    const rawData = this.data.ultimates;

    const icons: Record<string, string> = {};
    const requires: Record<string, string> = {};

    const getItemRequires = (data: W3Object) => {
      const reqIdArr = String(data.getValueByKey('req'))
        .split(',')
        .map((a) => a.trim());
      const reqValArr = String(data.getValueByKey('rqa'))
        .split(',')
        .map((a) => Number(a.trim()));

      return reqIdArr.reduce((acc, id, idx) => {
        if (!(id in requires)) {
          const name = String(upgradesParser.getById(id)?.getRawValue('nam', 1))
            .replace(/\(.*?\)/g, '')
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

    const iconsCoors = await imgProcessor.processImages(icons, 'ultimates');

    const output: IDataFile<IUltimatesData> = {
      data: {
        pickers,
        spells,
        requires,
      },
      icons: iconsCoors,
    };

    await writeFile(
      resolve(outputDir, `ultimates.json`),
      JSON.stringify(output),
      { encoding: 'utf8' }
    );
  }
}
