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
  </template>
</template>

<script setup lang="ts">
import type { AllFilters, StatisticRace } from '~/types/statistic';
import RaceBonusesGraph from './RaceBonusesGraph.vue';

const { race, filters } = defineProps<{
  race: string;
  filters: AllFilters;
}>();

const { iconProps, iconsSrc, raceData, raceIconsCoords } = await useRaceData(
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
