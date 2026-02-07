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
          <MatchesList :filters="filters" />
        </v-col>
      </v-row>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import SearchPlayersFilters from '~/components/statistic/SearchPlayersFilters.vue';
import MatchesList from '~/components/statistic/MatchesList.vue';
import type { SearchPlayersFilters as SearchFilters } from '~/types/statistic';

const statsMeta = await useStatisticMeta();

const typeSelection = useStorageValue('preferredVersion', 'og');

const filters = ref<SearchFilters>({
  type: typeSelection.value ?? 'og',
  version: '',
  filters: [{}],
  withLeavers: true,
});

watch(
  typeSelection,
  (newType) => {
    filters.value.type = newType ?? 'og';
  },
  { immediate: true },
);

useSeoMeta({
  title: 'Match Search',
  description: 'Search Survival Chaos matches by player, race, and more',
});
</script>
