<template>
  <v-col cols="12" sm="4" md="4">
    <player-search v-model="filters.playerId" />
  </v-col>
  <v-fade-transition>
    <v-col cols="12" sm="4" md="4" v-if="stats.seasons.length > 1">
      <v-select
        v-model="filters.season"
        :items="stats.seasons"
        label="Season"
        hide-details
        density="compact"
        variant="outlined"
        item-title="season"
        item-value="season"
        clearable
      >
        <template #item="{ props, item }">
          <v-list-item
            v-bind="props"
            :title="`${item.raw.platform} ${item.raw.season}`"
          />
        </template>
      </v-select>
    </v-col>
  </v-fade-transition>
  <v-col cols="12" sm="4" md="4">
    <v-checkbox
      label="Include matches with leavers"
      hide-details
      v-model="filters.withLeavers"
    />
  </v-col>
  <v-col cols="12" sm="6" md="6" class="pt-6 px-4">
    <v-range-slider
      v-model="quantileRange"
      strict
      hide-details
      :min="0"
      :max="100"
      color="primary"
      label="Average Quantile"
      thumb-label="always"
      step="1"
    >
      <template #label>
        <span class="v-label">Avg percentile</span>
        <v-tooltip>
          <template #activator="{ props }">
            <v-icon v-bind="props" size="x-small">
              {{ mdiInformation }}
            </v-icon>
          </template>
          <p>
            Percentile — shows how MMR compares to all players (e.g., 90 =
            better than 90% of players)
          </p>
        </v-tooltip>
      </template>
    </v-range-slider>
  </v-col>
  <v-col cols="12" sm="6" md="6" class="pt-6 px-4">
    <!-- <v-range-slider
      v-model="durationRange"
      strict
      hide-details
      :min="stats.filters.duration[0] ?? 0"
      :max="stats.filters.duration[1] ?? 0"
      color="primary"
      label="Match duration"
      thumb-label="always"
      :step="60 * 1000"
    >
      <template #thumb-label="{ modelValue }">
        {{ Math.round(modelValue / 1000 / 60) }}&nbsp;min
      </template>
    </v-range-slider> -->
  </v-col>
</template>

<script setup lang="ts">
import { mdiInformation } from '@mdi/js';
import { DEFAULT_STAT_FILTERS, type RestFilters, type StatisticPatchMeta } from '~/types/statistic';
import PlayerSearch from './parts/PlayerSearch.vue';

interface Props {
  stats: StatisticPatchMeta;
}

const { stats } = defineProps<Props>();
const emit = defineEmits<{
  (e: 'change', filters: RestFilters): void;
}>();

const filters = reactive<RestFilters>({});
watch(
  () => stats.filters,
  () => {
    Object.assign(filters, {
      date_from: new Date(stats.filters.endAt[0] ?? ''),
      date_to: new Date(stats.filters.endAt[1] ?? ''),
      duration_from: stats.filters.duration[0] ?? 0,
      duration_to: stats.filters.duration[1] ?? 0,
      quantile_from: 0,
      quantile_to: 100,
      withLeavers: false,
      // TODO: multiplatform
      platform: 'W3Champions',
      season: undefined,
      ...DEFAULT_STAT_FILTERS,
    });
  },
  {
    deep: true,
    immediate: true,
  },
);

const quantileRange = computed({
  get() {
    return [filters.quantile_from, filters.quantile_to] as [number, number];
  },
  set([quantile_from, quantile_to]: [number, number]) {
    filters.quantile_from = quantile_from;
    filters.quantile_to = quantile_to;
  },
});
const durationRange = computed({
  get() {
    return [filters.duration_from, filters.duration_to] as [number, number];
  },
  set([duration_from, duration_to]: [number, number]) {
    if (duration_from) filters.duration_from = duration_from;
    if (duration_to) filters.duration_to = duration_to;
  },
});

const getFilters = () => {
  const filtersValue = filters;
  const output: RestFilters = {};
  // if (
  //   filtersValue.date_from &&
  //   filtersValue.date_from.toString() !== stats.filters.endAt[0]
  // ) {
  //   output.date_from = filtersValue.date_from;
  // }
  // if (
  //   filtersValue.date_to &&
  //   filtersValue.date_to.toString() !== stats.filters.endAt[1]
  // ) {
  //   output.date_to = filtersValue.date_to;
  // }
  if (filtersValue.withLeavers) {
    output.withLeavers = filtersValue.withLeavers;
  }
  if (filtersValue.quantile_from !== 0) {
    output.quantile_from = filtersValue.quantile_from;
  }
  if (filtersValue.quantile_to !== 100) {
    output.quantile_from = filtersValue.quantile_to;
  }
  if (filtersValue.duration_from !== stats.filters.duration[0]) {
    output.duration_from = filtersValue.duration_from;
  }
  if (filtersValue.duration_to !== stats.filters.duration[1]) {
    output.duration_to = filtersValue.duration_to;
  }
  if (filtersValue.playerId) {
    output.playerId = filtersValue.playerId;
  }
  if (filtersValue.season) {
    output.platform = filtersValue.platform;
    output.season = filtersValue.season;
  }
  return output;
};

let timeout: ReturnType<typeof setTimeout>;
watch(
  () => filters,
  () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      emit('change', getFilters());
    }, 1000);
  },
  { deep: true },
);
</script>
