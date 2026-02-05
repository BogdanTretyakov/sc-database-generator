<template>
  <div>
    <v-row class="mb-4">
      <v-col cols="12" md="12">
        <div class="d-flex align-center flex-wrap gap-4">
          <v-select
            v-model="internalFilters.version"
            :items="items"
            density="compact"
            variant="outlined"
            label="Map version"
            class="flex-grow-0"
            style="min-width: 250px"
            hide-details
            :list-props="{
              density: 'comfortable',
            }"
            bg-color="transparent"
            flat
            :key="internalFilters.type"
          >
            <template #prepend-item>
              <div class="full-width d-flex my-1">
                <v-btn-toggle
                  class="mx-auto"
                  density="compact"
                  size="small"
                  v-model="internalFilters.type"
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
        </div>
      </v-col>
    </v-row>

    <div class="d-flex flex-nowrap align-start">
        <div class="d-flex flex-wrap flex-grow-1" style="margin: 0 -8px">
             <div
                v-for="(player, index) in internalFilters.filters"
                :key="player._uid"
                class="pa-2"
                style="width: 250px"
            >
                <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2">Player {{ index + 1 }}</span>
                <v-btn
                    v-if="internalFilters.filters.length > 1"
                    icon
                    density="comfortable"
                    variant="text"
                    color="error"
                    size="small"
                    @click="removePlayer(index)"
                >
                    <v-icon>{{ mdiDelete }}</v-icon>
                </v-btn>
                </div>

                <div class="d-flex flex-column gap-2">
                    <PlayerFilterItem
                        v-model="internalFilters.filters[index]"
                        :type="internalFilters.type"
                        :version="internalFilters.version"
                    />
                </div>
            </div>


              <div v-if="internalFilters.filters.length < 4"
                  class="d-flex align-center justify-center rounded cursor-pointer transition-swing"
                  @click="addPlayer"
                  style="border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);  width: 200px;"
              >
                    <v-icon size="64" color="medium-emphasis">{{ mdiPlus }}</v-icon>
              </div>

        </div>

        <div class="d-flex flex-column gap-4 mt-auto ml-4" style="width: 150px">
            <v-btn
                color="primary"
                @click="applyFilters"
                block
            >
                Search
            </v-btn>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiDelete, mdiPlus } from '@mdi/js';
import { versionTypeTitles } from '~/types/app';
import type { SearchPlayersFilters, StatisticMeta, PlayerFilter } from '~/types/statistic';
import PlayerFilterItem from './parts/PlayerFilterItem.vue';
import { dataFiles } from '~/data';
import { sortVersionObjCb } from '~/utils/array';

const props = defineProps<{
  modelValue: SearchPlayersFilters;
  statsMeta: StatisticMeta | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: SearchPlayersFilters): void;
}>();

const versions = computed(() => {
  const result = (props.statsMeta?.filters.maps ?? []).reduce(
    (acc, filter) => {
      const [mapType, mapVersion] = filter.split('_');
      if (!(mapType in dataFiles)) return acc;
      if (!acc[mapType]) acc[mapType] = [];
      if (!dataFiles[mapType][mapVersion]) return acc;
      acc[mapType].push(mapVersion);
      return acc;
    },
    {} as Record<string, string[]>,
  );
  return Object.fromEntries(
    Object.entries(result).map(([key, value]) => [
      key,
      value
        .map((value) => ({
          value,
          title: value,
        }))
        .sort(sortVersionObjCb('title')),
    ]),
  );
});

type PlayerFilterWithUid = PlayerFilter & { _uid: number };
interface UiFilters extends Omit<SearchPlayersFilters, 'filters'> {
    filters: PlayerFilterWithUid[];
}

const generateUid = () => Date.now() + Math.random();

// Deep copy implementation to avoid reference issues
const internalFilters = ref<UiFilters>({
  ...props.modelValue,
  withLeavers: true,
  filters: props.modelValue.filters.map((f) => ({ ...f, _uid: generateUid() })),
});

const items = computed(() => {
  return versions.value[internalFilters.value.type] ?? [];
});

const getCleanFilters = (filters: UiFilters): SearchPlayersFilters => {
    return {
        ...filters,
        filters: filters.filters.map(({ _uid, ...rest }) => rest)
    };
};

watch(
  () => items.value,
  () => {
    // Only set default if current version is invalid or empty
    if (!internalFilters.value.version || !items.value.some(i => i.value === internalFilters.value.version)) {
        internalFilters.value.version = items.value[0]?.value ?? '';
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  (newVal) => {
    // Only update if needed to avoid loops
    const currentClean = getCleanFilters(internalFilters.value);

    // We only update if fundamental props change, not just ref updates
    if (JSON.stringify(newVal) !== JSON.stringify(currentClean)) {
       // Preserve existing state if IDs match where possible, else regenerate
       // Actually simpler to just rebuild state if prop forces update
       internalFilters.value = {
        ...newVal,
        withLeavers: true,
        filters: newVal.filters.map((f) => ({ ...f, _uid: generateUid() })),
      };
    }
  },
  { deep: true },
);

watch(
  () => internalFilters.value.type,
  () => {
    internalFilters.value.version = items.value[0]?.value ?? '';
  },
);

watch(
  () => internalFilters.value.version,
  () => {
      internalFilters.value.filters = [{ _uid: generateUid() }];
  },
);

const applyFilters = () => {
  emit('update:modelValue', getCleanFilters(internalFilters.value));
};

const addPlayer = () => {
  if (internalFilters.value.filters.length < 4) {
    internalFilters.value.filters.push({ _uid: generateUid() });
  }
};

const removePlayer = (index: number) => {
  if (internalFilters.value.filters.length > 1) {
    internalFilters.value.filters.splice(index, 1);
  }
};
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
.gap-4 {
    gap: 16px;
}
.transition-swing {
  transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>
