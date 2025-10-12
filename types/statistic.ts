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
}

export interface AllFilters extends BaseFilters, RestFilters {}

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
  groupedRacesWinrate: RaceGroupedWinrate[];
  matchesByQuantile: [quantile: number | null, count: number][];
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
}
