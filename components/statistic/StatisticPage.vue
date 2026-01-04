<template>
  <RacesPlacesGraph
    :data="statsData?.racesData ?? []"
    :icons-coords="raceIconsCoords"
    :icons-src="iconsSrc"
    :races-data="raceData"
  >
    <MatchesByQuantileChart :data="statsData?.matchesByQuantile ?? []" />
  </RacesPlacesGraph>

  <CCard title="Data by race" class="mt-4">
    <template #appendHead>
      <div class="d-flex align-center mr-6">
        <span class="text-caption">Metrics</span>
        <v-switch
          v-model="showPlaces"
          hide-details
          class="mx-1"
          :true-value="true"
          :false-value="''"
        />
        <span class="text-caption">Places</span>
      </div>
    </template>
    <v-slide-group
      :model-value="selectedRace"
      center-active
      show-arrows
      class="mx-8"
      mandatory="force"
    >
      <v-slide-group-item
        v-for="race in racesList"
        :value="race.key"
        :key="race.id"
        v-slot="{ isSelected }"
      >
        <div
          class="race-wrapper"
          :class="{ selected: isSelected, 'cursor-pointer': true }"
          @click.capture="() => (selectedRace = race.key)"
        >
          <WarTooltip
            :coords="iconProps(race.id)"
            :src="iconsSrc"
            description=""
            :width="iconSize"
          >
            <template #tooltip>
              <div v-html="race.name" />
            </template>
          </WarTooltip>
        </div>
      </v-slide-group-item>
    </v-slide-group>
    <div class="my-2" />
    <Suspense>
      <StatisticRaceBlock
        v-if="allFilters && allFilters.type"
        :filters="allFilters"
        :race="selectedRace"
        :key="selectedRace"
      />
      <template #fallback>
        <div class="d-flex align-center">
          <v-progress-circular indeterminate size="60" class="mx-auto my-8" />
        </div>
      </template>
    </Suspense>
  </CCard>
</template>

<script setup lang="ts">
import type { AllFilters, StatisticPatchRaces } from '~/types/statistic';
import RacesPlacesGraph from './RacesPlacesGraph.vue';
import MatchesByQuantileChart from './MatchesByQuantileChart.vue';
import type { IRacePickerObject } from '~/data/types';

const iconSize = useStorageValue('iconSize');
const showPlaces = useStorageValue('showPlaces', false, Boolean);

const { filters } = defineProps<{
  filters: AllFilters;
}>();

const allFilters = computed(() => filters);

const { raceData, iconsSrc, iconProps, raceIconsCoords } = await useRaceData<
  Record<string, IRacePickerObject[]>
>('races', filters.type, filters.version);

const { data: statsData } = await useFetch<StatisticPatchRaces>(
  '/analytic/races',
  {
    baseURL: useRuntimeConfig().public.backendUrl,
    server: false,
    query: allFilters,
    watch: [allFilters],
    deep: false,
  }
);

const racesList = computed(() => Object.values(raceData).flat());

const selectedRace = ref(racesList.value[0].key);
</script>

<style scoped>
.race-wrapper {
  width: 48px;
  position: relative;
  margin: 0 8px;
  opacity: 0.4;
  transition: opacity 0.3s linear;
  user-select: none;
}

.race-wrapper.selected {
  opacity: 1;
}

.race-wrapper:hover {
  opacity: 0.8;
}
</style>
