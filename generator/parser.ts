import {
  abilitiesParser,
  unitsParser,
  unitWeapons,
  upgradesParser,
  upgradeData,
  unitBalance,
} from './objects';
import { alliances } from './constants';
import { W3Object } from './utils';
import { hotkeys } from '~/utils/constants';
import { scriptParser } from './script';
import { ImageProcessor } from './images';
import { writeFile, copyFile } from 'fs/promises';
import { resolve } from 'path';
import type {
  IBuildingObject,
  IRaceData,
  IRacePickerObject,
  IRawRace,
  IUpgradeObject,
} from '~/data/types';
import { isNotNil } from '~/utils/guards';
import { mapObject } from '~/utils/object';

export const raceParser = async () => {
  const alliancesIDs = alliances
    .map((all) => unitsParser.findIDByKey('nam', all))
    .filter(isNotNil);

  const racesMap = await scriptParser.getRaceIDs(alliancesIDs);

  const imagePaths = Object.values(racesMap)
    .flat()
    .reduce((acc, raceID) => {
      const raceDesc = unitsParser.getById(raceID);
      if (!raceDesc) return acc;
      const path = raceDesc.getValueByKey('ico');
      if (path) {
        acc[raceID] = path;
      }
      return acc;
    }, {} as Record<string, string>);

  const imgProcessor = new ImageProcessor(resolve(process.cwd(), 'dataMap'));

  const racesCoords = await imgProcessor.processImages(imagePaths, 'races');

  const racesData = await alliancesIDs.reduce(
    async (allianceAcc, allianceID) => {
      const prevAllianceAcc = await allianceAcc;
      const allianceName = alliances[alliancesIDs.indexOf(allianceID)];
      prevAllianceAcc[allianceName] = await racesMap[allianceID].reduce(
        async (racesAcc, raceId) => {
          const prevRacesAcc = await racesAcc;

          const raceObj = unitsParser.getById(raceId);

          const description = raceObj?.getValueByKey('tub');
          const rawRaceData = scriptParser.getRaceData(raceId);
          if (!rawRaceData) return prevRacesAcc;
          const [raceData, raceIcons] = tokenizeRaceData(
            rawRaceData,
            description
          );

          const raceIconsCoords = await imgProcessor.processImages(
            raceIcons,
            `${raceData.key}`
          );

          await writeFile(
            resolve(process.cwd(), 'dataGenerated', `${raceData.key}.json`),
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

  await copyFile(
    resolve(process.cwd(), 'generator', 'index.ts.example'),
    resolve(process.cwd(), 'dataGenerated', 'index.ts')
  );
};

const getUpgradeCost = (upgrade: W3Object, skipLast = false) => {
  let basePrice = Number(upgrade.getValueByKey('glb')) ?? 0;

  if (!basePrice) {
    const baseData = upgradeData.find(
      ({ upgradeid }) => upgradeid === upgrade.id
    );
    basePrice = Number(baseData?.goldbase ?? 0);
  }

  const addiction = Number(upgrade.getValueByKey('glm'));
  return Array.from(
    {
      length: upgrade.getMaxLevel() - (skipLast ? 1 : 0),
    },
    (_, idx) => basePrice + idx * addiction
  );
};

const getBuilding = (id: string): IBuildingObject => {
  return unitsParser.getById(id)?.withInstance((instance) => {
    const attackType = instance.getValueByKey('a1t');
    if (attackType) {
      return {
        attackType: instance.getValueByKey('a1t'),
      };
    }
    const origId = instance.getValueByKey('origId') ?? id;
    const originalUnit = unitWeapons.find(
      ({ unitWeaponID }) => unitWeaponID === origId
    );
    return {
      attackType: originalUnit?.atkType1 ?? '',
    };
  })!;
};

export const tokenizeRaceData = (data: IRawRace, description: string) => {
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
        name: instance.getValueByKey('nam'),
        cost: getUpgradeCost(instance),
        hotkey: instance.getValueByKey('hk1'),
        description: instance.getValueByKey('ub1'),
        iconsCount: upgradeIcons.length,
      };
    })!;
  };

  abilitiesParser.getById(data.ulti)?.withInstance((instance) => {
    const icon = instance.getIcon();
    if (icon) {
      icons[data.ulti] = icon;
    }
  });

  const output: IRaceData = {
    id: data.id,
    key: data.key,
    name: data.name,
    description,
    ultimateId: data.ulti,
    auras: data.auras
      .map((auraId, idx) =>
        abilitiesParser.getById(auraId)?.withInstance((instance) => {
          icons[auraId] = instance.getIcon();
          return {
            id: auraId,
            name: instance.getValueByKey('nam'),
            description: instance.getValueByKey('ub1'),
            hotkey: hotkeys[idx],
          };
        })
      )
      .filter(isNotNil),
    bonuses: data.bonuses
      .map((bonusID) =>
        unitsParser.getById(bonusID)?.withInstance((instance) => {
          icons[bonusID] = instance.getIcon();
          return {
            id: bonusID,
            hotkey: instance.getValueByKey('hot'),
            name: instance.getValueByKey('tip'),
            description: instance.getValueByKey('tub'),
            buildingName: instance.getValueByKey('nam'),
          };
        })
      )
      .filter(isNotNil),
    towerUpgrades: data.upgrades
      .map((upgradeID) =>
        upgradesParser.getById(upgradeID)?.withInstance((instance) => {
          icons[upgradeID] = instance.getIcon();

          return {
            id: upgradeID,
            hotkey: instance.getValueByKey('hk1'),
            name: instance.getValueByKey('nam'),
            description: instance.getValueByKey('ub1'),
            cost: getUpgradeCost(instance, true),
          };
        })
      )
      .filter(isNotNil),
    t1spell: abilitiesParser.getById(data.t1spell)?.withInstance((instance) => {
      icons[data.t1spell] = instance.getIcon();
      return {
        id: data.t1spell,
        name: instance.getValueByKey('nam'),
        description: instance.getValueByKey('ub1'),
        hotkey: instance.getValueByKey('hky'),
      };
    })!,
    t2spell: abilitiesParser.getById(data.t2spell)?.withInstance((instance) => {
      icons[data.t2spell] = instance.getIcon();
      return {
        id: data.t2spell,
        name: instance.getValueByKey('nam'),
        description: instance.getValueByKey('ub1'),
        hotkey: instance.getValueByKey('hky'),
      };
    })!,
    buildings: mapObject(data.buildings, getBuilding),
    heroes: data.heroes.map((slotHeroes, slotIdx) =>
      slotHeroes
        .map((heroId) =>
          unitsParser.getById(heroId)?.withInstance((instance) => {
            icons[heroId] = instance.getValueByKey('ssi') ?? instance.getIcon();
            return {
              id: heroId,
              name: instance.getValueByKey('nam'),
              fullName: instance.getValueByKey('pro'),
              hotkey: instance.getValueByKey('hot') ?? hotkeys[slotIdx],
              description: instance.getValueByKey('tub'),
              cost: instance.getValueByKey('gol'),
            };
          })
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
          name:
            instance.getValueByKey('tp1', level) ??
            instance.getValueByKey('nam'),
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
    baseUpgrades: mapObject(data.baseUpgrades, getUpgrade),
    bonusUpgrades: Object.entries(data.bonusUpgrades).reduce(
      (acc, [bonusID, upgrades]) => {
        acc[bonusID] = upgrades.map(getUpgrade);
        return acc;
      },
      {} as Record<string, IUpgradeObject[]>
    ),
    units: mapObject(
      data.units,
      (unitID) =>
        unitsParser.getById(unitID)?.withInstance((instance) => {
          const icon = instance.getIcon();
          if (icon) {
            icons[unitID] = icon;
          }

          let atkType = instance.getValueByKey('a1t');
          if (!atkType) {
            const weaponObj = unitWeapons.find(
              ({ unitWeaponID }) => unitWeaponID === unitID
            );
            atkType = weaponObj?.atkType1 ?? '';
          }
          let defType = instance.getValueByKey('def');
          if (!defType) {
            const balanceObj = unitBalance.find(
              ({ unitBalanceID }) => unitBalanceID === unitID
            );
            defType = balanceObj?.defType ?? '';
          }

          return {
            id: unitID,
            name: instance.getValueByKey('nam'),
            hotkey: instance.getValueByKey('hot'),
            description: instance.getValueByKey('tub'),
            cost: instance.getValueByKey('gol'),
            atkType,
            defType,
          };
        })!
    ),
  };

  return [output, icons] as const;
};
