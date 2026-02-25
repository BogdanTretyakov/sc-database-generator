<template>
  <div class="full-height pb-16">
    <CCard title="Match Search" id="matches" class="mb-4">
      <v-row>
        <v-col cols="12">
          <SearchPlayersFilters v-model="filters" :stats-meta="statsMeta" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <ClientOnly>
            <Suspense>
              <MatchesList :filters="filters" />
              <template #fallback>
                <div class="d-flex align-center">
                  <v-progress-circular indeterminate size="60" class="mx-auto my-8" />
                </div>
              </template>
            </Suspense>
          </ClientOnly>
        </v-col>
      </v-row>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import SearchPlayersFilters from '~/components/statistic/SearchPlayersFilters.vue';
import MatchesList from '~/components/statistic/MatchesList.vue';
import type { SearchPlayersFilters as SearchFilters } from '~/types/statistic';

const route = useRoute();
const router = useRouter();

const statsMeta = await useStatisticMeta();

const typeSelection = useStorageValue('preferredVersion', 'og');

let initPlayerFilters = [{}];
try {
  if (route.query.filters) {
    initPlayerFilters = JSON.parse(route.query.filters as string);
  }
} catch (e) {
  // ignore parse error
}

const filters = ref<SearchFilters>({
  type: (route.query.type as string) || typeSelection.value || 'og',
  version: (route.query.version as string) || '',
  filters: initPlayerFilters,
  withLeavers: route.query.withLeavers !== 'false',
});

let isInitializing = true;

watch(
  typeSelection,
  (newType) => {
    if (isInitializing && route.query.type) {
      isInitializing = false;
      return;
    }
    isInitializing = false;
    filters.value.type = newType ?? 'og';
  },
  { immediate: true },
);

watch(
  filters,
  (newFilters: SearchFilters) => {
    const query = { ...route.query };

    query.type = newFilters.type;

    if (newFilters.version) {
      query.version = newFilters.version;
    } else {
      delete query.version;
    }

    if (!newFilters.withLeavers) {
      query.withLeavers = 'false';
    } else {
      delete query.withLeavers;
    }

    const hasMeaningfulFilters = newFilters.filters.some(
      (f: any) => Object.keys(f).length > 0
    );
    if (hasMeaningfulFilters) {
      query.filters = JSON.stringify(newFilters.filters);
    } else {
      delete query.filters;
    }

    router.replace({ query });
  },
  { deep: true }
);

useSeoMeta({
  title: 'Match Search',
  description: 'Search Survival Chaos matches by player, race, and more',
});
</script>
