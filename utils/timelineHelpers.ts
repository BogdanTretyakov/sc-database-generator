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
