<template>
  <div class="full-height pb-16">
    <CCard title="Statistic" id="statistic" class="mb-4">
      <template #prependHead>
        <div class="d-flex ga-4 ml-2">
          <v-tooltip v-if="statsMeta">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                density="comfortable"
                flat
                variant="text"
              >
                <v-icon>{{ mdiInformation }}</v-icon>
              </v-btn>
            </template>
            <div>
              <p>Total matches parsed: {{ statsMeta.matchesCount }}</p>
              <p>
                Last parsed match time:
                {{ new Date(statsMeta.lastMatchTime).toLocaleString() }}
              </p>
            </div>
          </v-tooltip>
          <v-tooltip v-if="statsMeta?.dumpUpdateAt">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                density="comfortable"
                flat
                variant="text"
                :href="`${config.public.backendUrl}/analytic/dump`"
              >
                <v-icon>{{ mdiDownload }}</v-icon>
              </v-btn>
            </template>
            <p>
              <span>Download dataset dump (CSV)</span>
              <br />
              <span
                >Last update:
                {{ new Date(statsMeta.dumpUpdateAt).toLocaleString() }}</span
              >
            </p>
          </v-tooltip>
        </div>
      </template>
      <template #appendHead>
        <v-tooltip v-if="statsMeta?.hasPatches">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              density="comfortable"
              color="warning"
              flat
              variant="text"
            >
              <v-icon>{{ mdiAlert }}</v-icon>
            </v-btn>
          </template>
          <p>New version available, but not parsed. Please, contact author</p>
        </v-tooltip>
      </template>
      <v-row>
        <v-col cols="12" md="7">
          <v-row>
            <v-col cols="12" sm="4" md="4">
              <v-select
                v-model="version"
                :items="items"
                density="compact"
                variant="outlined"
                label="Map version"
                class="flex-grow-0"
                hide-details
                :list-props="{
                  density: 'comfortable',
                }"
                bg-color="transparent"
                flat
                min-width="min-content"
                :key="typeSelection"
              >
                <template #prepend-item>
                  <div class="full-width d-flex my-1">
                    <v-btn-toggle
                      class="mx-auto"
                      density="compact"
                      size="small"
                      v-model="typeSelection"
                      mandatory
                    >
                      <v-btn
                        v-for="(_, key) in versions"
                        density="compact"
                        size="small"
                        :value="key"
                        :key="key"
                      >
                        {{ versionTypeTitles[key] }}
                      </v-btn>
                    </v-btn-toggle>
                  </div>
                </template>
              </v-select>
            </v-col>
            <StatisticFilters
              v-if="statsMetaPatch && status !== 'pending'"
              :stats="statsMetaPatch"
              :key="typeSelection + version"
              @change="filters = $event"
            />
          </v-row>
        </v-col>
        <v-col cols="12" md="5" class="pl-8">
          <PatchStatistic :filters="allFilters" />
        </v-col>
      </v-row>
    </CCard>
    <ClientOnly>
      <Suspense>
        <StatisticPage :key="typeSelection + version + 'data'" />
        <template #fallback>
          <div class="d-flex align-center">
            <v-progress-circular indeterminate size="60" class="mx-auto my-8" />
          </div>
        </template>
      </Suspense>
    </ClientOnly>
    <v-fab
      :icon="mdiArrowUp"
      color="primary"
      class="toTopBtn"
      href="#statistic"
    />
  </div>
</template>

<script setup lang="ts">
import { sortVersionObjCb } from '#imports';
import { mdiAlert, mdiArrowUp, mdiDownload, mdiInformation } from '@mdi/js';
import PatchStatistic from '~/components/statistic/PatchStatistic.vue';
import { dataFiles } from '~/data';
import type { RestFilters, StatisticPatchMeta } from '~/types/statistic';
const config = useRuntimeConfig();
const statsMeta = await useStatisticMeta();

const versionTypeTitles: Record<string, string> = {
  og: 'Original',
  oz: 'Reborn',
};

const versions = computed(() => {
  const result = (statsMeta.value?.filters.maps ?? []).reduce((acc, filter) => {
    const [mapType, mapVersion] = filter.split('_');
    if (!(mapType in dataFiles)) return acc;
    if (!acc[mapType]) acc[mapType] = [];
    if (!dataFiles[mapType][mapVersion]) return acc;
    acc[mapType].push(mapVersion);
    return acc;
  }, {} as Record<string, string[]>);
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [
      key,
      value
        .map((value) => ({
          value,
          title: value,
        }))
        .sort(sortVersionObjCb('title')),
    ])
  );
});

const typeSelection = useStorageValue('preferredVersion', 'og');

const items = computed(() => {
  return versions.value[typeSelection.value] ?? [];
});

const version = ref(items.value[0]?.value);

watch(
  () => items.value,
  () => {
    version.value = items.value[0]?.value;
  },
  { immediate: true }
);

const filters = ref<RestFilters>({});

const allFilters = computed(() => ({
  type: typeSelection.value,
  version: version.value,
  ...filters.value,
}));

provide('filters', allFilters);

const { data: statsMetaPatch, status } = useFetch<StatisticPatchMeta>(
  '/analytic/meta-patch',
  {
    baseURL: config.public.backendUrl,
    server: false,
    query: {
      type: typeSelection,
      version: version,
    },
    watch: [typeSelection, version],
    immediate: !!typeSelection.value && !!version.value,
    lazy: !!typeSelection.value && !version.value,
  }
);

useSeoMeta({
  title: 'Statistic',
  description: 'Survival Chaos matches statistic and analytic',
  ogDescription:
    'Survival Chaos matches statistic and analytic. All information about matches, races, bonuses and more',
  ogImage: '/favicon.png',
});
</script>

<style lang="css" scoped>
.toTopBtn {
  position: fixed;
  bottom: 10px;
  left: 10px;
  z-index: 50;
}
</style>
