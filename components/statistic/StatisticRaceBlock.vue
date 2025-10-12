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

const filters = inject<Ref<AllFilters>>('filters')!;
const { race } = defineProps<{
  race: string;
}>();

const { iconProps, iconsSrc, raceData, raceIconsCoords } = await useRaceData(
  race,
  filters.value.type,
  filters.value.version
);

const raceFilters = computed(() => ({
  ...filters.value,
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
