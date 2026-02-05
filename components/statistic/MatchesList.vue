<template>
  <div ref="bodyRef">
    <div class="list-body d-flex flex-column">
      <template v-if="status === 'pending'">
        <v-progress-circular indeterminate size="60" class="mx-auto my-8" />
      </template>
      <template v-else-if="data?.data?.length">
        <MatchListItem
          v-for="item in data.data"
          :key="item.id"
          :item="item"
          :version-type="filters.type"
          :version="filters.version"
        />
      </template>
      <template v-else>
        <div class="d-flex flex-column align-center justify-center mt-8 text-medium-emphasis">
          <v-icon size="64" class="mb-4">{{ mdiAlertCircleOutline }}</v-icon>
          <div class="text-h6">No matches found</div>
        </div>
      </template>
    </div>
    <v-pagination v-model="page" :length="totalPages" />
  </div>
</template>

<script setup lang="ts">
import { mdiAlertCircleOutline } from '@mdi/js';
import type { SearchPlayersFilters, MatchInfo } from '~/types/statistic';
import MatchListItem from './parts/MatchListItem.vue';

const { filters, perPage } = defineProps<{
  filters: SearchPlayersFilters;
  perPage?: number;
}>();
const runtimeConfig = useRuntimeConfig();

const bodyRef = ref<HTMLDivElement | null>(null);

const page = ref(1);

watch(
  () => filters,
  () => {
    page.value = 1;
  },
  { deep: true }
);

watch(
  () => page.value,
  () => {
    if (bodyRef.value) {
      bodyRef.value.scrollTo({ top: 0 });
    }
  }
);

const backendFilters = computed(() => {
  return {
    ...filters,
    page: page.value,
    perPage,
  };
});

const { data, status } = await useFetch<{
  total: number;
  perPage: number;
  data: MatchInfo[];
}>('/match/filter', {
  baseURL: runtimeConfig.public.backendUrl,
  server: false,
  method: 'POST',
  body: backendFilters,
  watch: [backendFilters],
  deep: true,
});

const totalPages = computed(() => {
  return Math.ceil((data.value?.total ?? 1) / (data.value?.perPage ?? 10));
});
</script>

<style lang="css" scoped>
.list-body {
  min-height: 300px;
}
</style>
