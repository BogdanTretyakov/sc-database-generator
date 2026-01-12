<template>
  <template v-if="statsData">
    <div class="text-caption">
      Matches tracked: {{ statsData.matchesCount }}
    </div>
    <RaceBonusesGraph
      :data="statsData.bonuses ?? []"
      :races-data="raceData"
      :icons-coords="raceIconsCoords"
      :icons-src="iconsSrc"
    />
    <RaceVsRaceGraph
      class="mt-4"
      :data="statsData.winrateVsRaces"
      :races-data="allRaces.raceData"
      :icons-coords="allRaces.raceIconsCoords"
      :icons-src="allRaces.iconsSrc"
    />
  </template>
</template>

<script setup lang="ts">
import type { AllFilters, StatisticRace } from '~/types/statistic';
import RaceBonusesGraph from './RaceBonusesGraph.vue';
import RaceVsRaceGraph from './RaceVsRaceGraph.vue';
import type { IRacePickerObject } from '~/data/types';

const { race, filters } = defineProps<{
  race: string;
  filters: AllFilters;
}>();

const allRaces = await useRaceData<Record<string, IRacePickerObject[]>>(
  'races',
  filters.type,
  filters.version
);

const { iconsSrc, raceData, raceIconsCoords } = await useRaceData(
  race,
  filters.type,
  filters.version
);

const raceFilters = computed(() => ({
  ...filters,
  race: raceData.id,
}));

const { data: statsData } = await useFetch<StatisticRace>('/analytic/race', {
  baseURL: useRuntimeConfig().public.backendUrl,
  server: false,
  query: raceFilters,
  watch: [raceFilters],
  deep: false,
});
</script>
