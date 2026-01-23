export interface BaseFilters {
  type: string;
  version: string;
}

export interface RestFilters {
  date_from?: Date;
  date_to?: Date;
  duration_from?: number;
  duration_to?: number;
  quantile_from?: number;
  quantile_to?: number;
  withLeavers?: boolean;
  playerId?: number;
  platform?: string;
  season?: string;
}

export interface PlayerFilter {
  playerId?: number;
  race?: string;
  bonus?: string;
  place?: number;
}

export interface AllFilters extends BaseFilters, RestFilters {}

export interface SearchPlayersFilters extends AllFilters {
  filters: PlayerFilter[];
}

export interface MapTypeObject {
  mapType: string;
  mapVersion: string;
}

export interface StatisticMeta {
  lastMatchTime: string;
  filters: {
    maps: string[];
  };
  matchesCount: number;
  hasPatches: boolean;
  dumpUpdateAt: string | null;
}

export interface SeasonMeta {
  platform: string;
  season: string;
  matches: number;
}

export interface StatisticPatchMeta {
  matchesCount: number;
  filters: {
    duration: [from: number | null, to: number | null];
    endAt: [from: string | null, to: string | null];
    avgMmr: [from: number | null, to: number | null];
  };
  races: string[];
  avgMmr: number;
  avgDuration: number;
  seasons: SeasonMeta[];
}

export interface RaceCommonStatistic {
  race: string;
  totalMatches: number;
  pickrate: number;
  winrate: number;
  repickrate: number;
  banrate: number;
  places: Record<number, number>;
}

export interface RaceGroupedWinrate {
  race: string;
  winrate: number[];
  quantile: number[];
  totalMatches: number[];
}

export interface StatisticPatchRaces {
  racesData: RaceCommonStatistic[];
  matchesByQuantile: [quantile: number | null, count: number][];
  ultimatesData: {
    id: string;
    pickrate: number;
    winrate: number;
  }[];
  leaverRate: [number | null, number][];
  matchDurations?: Record<number, number>;
  matchesByHour: [number, number][];
  matchesByDay: [number, number][];
  playerPlaces: {
    place: number;
    pct: number;
    matchesCount: number;
  }[];
}

export interface RaceHeroStatistic {
  hero: string;
  avgCount: number;
  avgFirstBuy: number | null;
}

export interface RaceBonusStatistic {
  bonus: string;
  matchesCount: number;
  pickrate: number;
  winrate: number;
  places: Record<number, number>;
}

export interface StatisticRace {
  matchesCount: number;
  upgrades: Record<string, Record<number, number>>;
  towerUpgrades: Record<string, Record<number, number>>;
  buildings: Record<string, Record<number, number>>;
  heroes: RaceHeroStatistic[];
  bonuses: RaceBonusStatistic[];
  winrateVsRaces: {
    race: string;
    winrate: number;
    matchesCount: number;
  }[];
}

export interface MatchInfo {
  id: number;
  platform: string;
  platformId: string;
  type: string;
  version: string;
  duration: number;
  endAt: string;
  quantile: number;
  players: MatchPlayerInfo[];
}

export interface MatchPlayerInfo {
  id: number;
  name: string;
  place: number;
  quantile: number;
  race: string;
  timeAlive: number;
  bonus: string[];
  ultimate: string;
  aura: string;
  events: MatchEvent[];
}

export interface MatchEvent {
  id: string;
  type: PlayerEvents;
  time: number;
}

export const PlayerEvents = {
  INITIAL_RACE: 'INITIAL_RACE',
  BAN_RACE: 'BAN_RACE',
  REPICK_RACE: 'REPICK_RACE',
  HERO_BUY: 'HERO_BUY',
  BASE_UPGRADE: 'BASE_UPGRADE',
  TOWER_UPGRADE: 'TOWER_UPGRADE',
  UP_FORT2: 'UP_FORT2',
  UP_FORT3: 'UP_FORT3',
  UP_BARRACK2: 'UP_BARRACK2',
  UP_BARRACK3: 'UP_BARRACK3',
  UP_BARRACK4: 'UP_BARRACK4',
  USE_ULTIMATE: 'USE_ULTIMATE',
};

export type PlayerEvents = (typeof PlayerEvents)[keyof typeof PlayerEvents];

export const DEFAULT_STAT_FILTERS: RestFilters = {
  withLeavers: true,
};
