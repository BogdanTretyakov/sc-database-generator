<template>
  <div
    class="d-flex flex-wrap align-center"
    style="gap: 12px 48px"
    v-if="!!statsMetaPatch && statsMetaPatch.filters"
  >
    <div>
      <div class="text-subtitle-1">Matches count</div>
      <div>
        {{ statsMetaPatch.matchesCount }}
      </div>
    </div>
    <div>
      <div class="text-subtitle-1">First match time</div>
      <div>
        {{ new Date(statsMetaPatch.filters.endAt[0] ?? '').toLocaleString() }}
      </div>
    </div>
    <div>
      <div class="text-subtitle-1">Last match time</div>
      <div>
        {{ new Date(statsMetaPatch.filters.endAt[1] ?? '').toLocaleString() }}
      </div>
    </div>
    <v-spacer />
    <div>
      <div class="text-subtitle-1">Average match MMR</div>
      <div>
        {{ statsMetaPatch.avgMmr }}
      </div>
    </div>
    <div>
      <div class="text-subtitle-1">Average match duration</div>
      <div>
        {{ formatMillisecondsToHuman(statsMetaPatch.avgDuration) }}
      </div>
    </div>
  </div>
  <v-circular-progress indeterminate v-else></v-circular-progress>
</template>

<script lang="ts" setup>
import type { AllFilters, StatisticPatchMeta } from '~/types/statistic';

interface Props {
  filters: AllFilters;
}

const { filters } = defineProps<Props>();
const computedFilters = computed(() => filters);

const { data: statsMetaPatch } = await useFetch<StatisticPatchMeta>(
  '/analytic/meta-patch',
  {
    key: 'filteredStatisticMetaPatch',
    baseURL: useRuntimeConfig().public.backendUrl,
    server: false,
    query: computedFilters,
    watch: [computedFilters],
  }
);
</script>
