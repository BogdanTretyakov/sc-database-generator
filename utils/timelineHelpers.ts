import type { IRaceData, IUpgradeObject } from '~/data/types';
import type { MatchPlayerInfo, PlayerEvents, TimelineEvent } from '~/types/statistic';

export const getMappedEventType = (rawType: string): string => {
  if (rawType.startsWith('UP_FORT')) return 'FORT_UPGRADE';
  if (rawType.startsWith('UP_BARRACK')) return 'FORT_UPGRADE';
  if (rawType === 'TOWER_UPGRADE') return 'BASE_UPGRADE';
  return rawType;
};

export const getUpgradeTimer = (raceData: IRaceData | undefined, upgradeId: string, level: number): number => {
  let timer = 0;

  const checkUpgrade = (upg: IUpgradeObject | undefined) => {
    if (upg && upg.id === upgradeId && upg.timers && upg.timers.length >= level) {
      timer = upg.timers[level - 1] * 1000;
      return true;
    }
    return false;
  };

  if (raceData) {
    if (checkUpgrade(raceData.baseUpgrades?.melee)) return timer;
    if (checkUpgrade(raceData.baseUpgrades?.armor)) return timer;
    if (checkUpgrade(raceData.baseUpgrades?.range)) return timer;
    if (checkUpgrade(raceData.baseUpgrades?.wall)) return timer;

    if (raceData.towerUpgrades) {
      for (const upg of raceData.towerUpgrades) {
        if (checkUpgrade(upg)) return timer;
      }
    }

    if (raceData.magic) {
      for (const upg of raceData.magic) {
        if (checkUpgrade(upg)) return timer;
      }
    }
  }

  return 0;
};

export const mapPlayerEventsToTimeline = (
  players: MatchPlayerInfo[],
  racesData: Record<string, any>,
  activeFilters: string[]
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];

  players.forEach(player => {
    const playerRaceData = racesData[player.race]?.raceData as IRaceData | undefined;
    const currentUpgradeLevels: Record<string, number> = {};

    if (player.events) {
      player.events.forEach((event: { type: string, time: number, id: string }) => {
        if (['BAN_RACE', 'INITIAL_RACE'].includes(event.type) && event.time === 0) {
          return;
        }

        const mappedType = getMappedEventType(event.type);
        if (!activeFilters.includes(mappedType)) {
          return;
        }

        let level = 1;
        let timeOffset = 0;

        if (event.type === 'BASE_UPGRADE' || event.type === 'TOWER_UPGRADE') {
          currentUpgradeLevels[event.id] = (currentUpgradeLevels[event.id] || 0) + 1;
          level = currentUpgradeLevels[event.id];
          if (playerRaceData) {
            timeOffset = getUpgradeTimer(playerRaceData, event.id, level);
          }
        } else if (event.type === 'CANCEL_UPGRADE') {
          level = currentUpgradeLevels[event.id] || 1;
          if (currentUpgradeLevels[event.id] && currentUpgradeLevels[event.id] > 0) {
            currentUpgradeLevels[event.id]--;
          }
        } else if (event.type.startsWith('UP_FORT')) {
          level = parseInt(event.type.replace('UP_FORT', ''), 10) || 1;
        } else if (event.type.startsWith('UP_BARRACK')) {
          level = parseInt(event.type.replace('UP_BARRACK', ''), 10) || 1;
        }

        events.push({
          playerId: player.id,
          time: event.time + timeOffset,
          level,
          id: event.id,
          type: event.type as PlayerEvents,
        });
      });
    }
  });

  return events.sort((a, b) => a.time - b.time);
};

export interface PlayerEconomyData {
  unitsCost: number;
  heroesCost: number;
  baseUpgradesCost: number;
  towerUpgradesCost: number;
  buildingsCost: number;

  unitsCount: Record<string, number>;
  heroesCount: Record<string, number>;
  baseUpgradeLevels: Record<string, number>;
  towerUpgradeLevels: Record<string, number>;
  bonusUpgradeLevels: Record<string, number>;
  totalUpgradeLevels: number;
  fortLevel: number;
  barracksLevels: number[];
}

export const calculatePlayerEconomy = (
  events: TimelineEvent[],
  raceData: IRaceData,
  targetTimeMs: number
): PlayerEconomyData => {
  const result: PlayerEconomyData = {
    unitsCost: 0,
    heroesCost: 0,
    baseUpgradesCost: 0,
    towerUpgradesCost: 0,
    buildingsCost: 0,

    unitsCount: {},
    heroesCount: {},
    baseUpgradeLevels: {},
    towerUpgradeLevels: {},
    bonusUpgradeLevels: {},
    totalUpgradeLevels: 0,
    fortLevel: 1,
    barracksLevels: [1, 1, 1],
  };

  const currentUpgradeLevels: Record<string, number> = {};

  const itemsMap = Object.fromEntries([
    ...raceData.heroes,
    ...Object.values(raceData.units),
    ...Object.values(raceData.baseUpgrades),
    ...raceData.towerUpgrades,
    ...raceData.magic,
    ...raceData.bonuses,
    ...raceData.bonuses.flatMap(b => [...(b.units ?? []), ...(b.upgrades ?? [])]),
    ...raceData.buildings.fort,
    raceData.buildings.tower,
    ...raceData.buildings.barrack,
  ].map(item => [item.id, item]));

  for (const event of events) {
    if (event.time > targetTimeMs) {
      break;
    }

    const item = itemsMap[event.id];

    if (event.type === 'UNIT_BUY') {
      result.unitsCount[event.id] = (result.unitsCount[event.id] || 0) + 1;
      if (item && item.type === 'unit') {
        result.unitsCost += (item as any).cost || 0;
      }
    } else if (event.type === 'HERO_BUY') {
      result.heroesCount[event.id] = (result.heroesCount[event.id] || 0) + 1;
      if (item && item.type === 'hero') {
        result.heroesCost += (item as any).cost || 0;
      }
    } else if (event.type === 'BASE_UPGRADE' || event.type === 'TOWER_UPGRADE') {
      currentUpgradeLevels[event.id] = (currentUpgradeLevels[event.id] || 0) + 1;

      if (event.type === 'BASE_UPGRADE') {
        // Find if this is a bonus upgrade instead of a regular base upgrade
        // We consider it a bonus upgrade if it's not in baseUpgrades or magic, but is in bonuses
        const isBonus = !raceData.magic?.some(m => m.id === event.id) &&
                        !Object.values(raceData.baseUpgrades).some(u => u.id === event.id) &&
                        raceData.bonuses.some(b => b.upgrades?.some(u => u.id === event.id) || b.id === event.id);
        if (isBonus) {
          result.bonusUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
        } else {
          result.baseUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
        }
      } else {
        result.towerUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
      }

      const levelIdx = currentUpgradeLevels[event.id] - 1;

      if (item && item.type === 'upgrade') {
        result.totalUpgradeLevels++;

        const upgCost = (item as unknown as { cost: number[] }).cost[levelIdx] || 0;
        if (event.type === 'BASE_UPGRADE') {
          result.baseUpgradesCost += upgCost;
        } else {
          result.towerUpgradesCost += upgCost;
        }
      }
    } else if (event.type === 'CANCEL_UPGRADE') {
      const levelBeforeCancel = currentUpgradeLevels[event.id] || 1;
      if (currentUpgradeLevels[event.id] && currentUpgradeLevels[event.id] > 0) {
        currentUpgradeLevels[event.id]--;
      }

      // Assuming CANCEL_UPGRADE `event.id` refers to the upgrade item that was cancelled
      if (item && item.type === 'upgrade') {
        result.totalUpgradeLevels--;

        // Find which type it was to decrement correctly
        const upgCost = (item as unknown as { cost: number[] }).cost[levelBeforeCancel - 1] || 0;
        const refund = Math.round(upgCost * 0.75);

        // We need to guess if it was base or tower based on raceData arrays, but since we don't know the exact previous event context easily, we can check if it's in towerUpgrades
        const isTower = raceData.towerUpgrades.some(t => t.id === event.id);
        const isBonus = !isTower && !raceData.magic?.some(m => m.id === event.id) && !Object.values(raceData.baseUpgrades).some(u => u.id === event.id) && raceData.bonuses.some(b => b.upgrades?.some(u => u.id === event.id) || b.id === event.id);

        if (isTower) {
          result.towerUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
          result.towerUpgradesCost -= refund;
        } else if (isBonus) {
          result.bonusUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
          result.baseUpgradesCost -= refund; // Bonus upgrades are bundled into baseUpgradesCost
        } else {
          result.baseUpgradeLevels[event.id] = currentUpgradeLevels[event.id];
          result.baseUpgradesCost -= refund;
        }
      }
    } else if (event.type.startsWith('UP_FORT') || event.type.startsWith('UP_BARRACK')) {
      const isFort = event.type.startsWith('UP_FORT');
      const level = parseInt(event.type.replace(isFort ? 'UP_FORT' : 'UP_BARRACK', ''), 10) || 1;

      if (isFort) {
        result.fortLevel = Math.max(result.fortLevel, level);
      } else {
        const idx = result.barracksLevels.findIndex(l => l === level - 1);
        if (idx !== -1) {
          result.barracksLevels[idx] = level;
        } else {
          const fallbackIdx = result.barracksLevels.findIndex(l => l < level);
          if (fallbackIdx !== -1) {
            result.barracksLevels[fallbackIdx] = level;
          }
        }
        result.barracksLevels.sort((a, b) => b - a);
      }

      // Building level 1 is free, index is level - 1
      const buildingArray = isFort ? raceData.buildings.fort : raceData.buildings.barrack;
      if (buildingArray && buildingArray.length >= level) {
         // The cost of the upgrade is the cost of the building at target level
         const bldg = buildingArray[level - 1];
         result.buildingsCost += (bldg as any).cost || 0;
      }
    }
  }

  return result;
};
