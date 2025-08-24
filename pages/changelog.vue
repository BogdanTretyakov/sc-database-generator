<template>
  <div class="fill-height">
    <v-container fluid>
      <CCard title="Changelog" id="changelog">
        <v-row>
          <v-col cols="12" sm="4">
            <v-select
              v-model="selectValue"
              :items="items"
              return-object
              density="compact"
              variant="outlined"
              label="Compare version"
              class="flex-grow-0"
              hide-details
              :list-props="{
                density: 'comfortable',
              }"
              bg-color="transparent"
              flat
              min-width="min-content"
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
                      v-for="(_, key) in dataFiles"
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
          <v-col cols="12" sm="6" offset-sm="2">
            <p class="flex-grow-0 text-warning ml-auto">
              Attention! This is <b>unofficial</b> changelog, parsed directly
              from game data files. There is superficial comparison of
              <b>some</b> kind of data - only descriptions and base stats
            </p>
          </v-col>
        </v-row>
      </CCard>
    </v-container>
    <v-container style="min-height: 40vh" class="py-0" fluid>
      <template
        v-if="changelogStatus === 'pending' || racesStatus === 'pending'"
      >
        <div class="d-flex align-center justify-center fill-height py-12">
          <v-progress-circular size="100" width="6" indeterminate />
        </div>
      </template>
      <template v-else-if="!!changelog && !!racesData">
        <ChangelogMainView :changelog="changelog" />
      </template>
    </v-container>
    <v-fab
      absolute
      :icon="mdiArrowUp"
      color="primary"
      class="toTopBtn"
      @click="scrollTop"
    />
  </div>
</template>

<script setup lang="ts">
interface ListItem {
  title: string;
  value: string;
}

import ozChangelogs from '~/data/changelogs/oz';
import ogChangelogs from '~/data/changelogs/og';
import type { IChangelog, IDataFile, IBaseObject } from '~/data/types';
import values from 'lodash/values';
import { mdiArrowUp } from '@mdi/js';

const scrollTop = () => {
  document
    .getElementById('scrollContainer')
    ?.scrollTo({ top: 0, behavior: 'smooth' });
};

const dataFiles = {
  og: ogChangelogs.data,
  oz: ozChangelogs.data,
};

const versionTypeTitles: Record<string, string> = {
  og: 'Original',
  oz: 'OZGame',
};
const savedPrefVersion = useStorageValue('preferredVersion');

const typeSelection = ref(savedPrefVersion.value || 'og');
const selectValue = ref<ListItem>();
watch(
  () => typeSelection.value,
  (val, oldVal) => {
    if (val === oldVal || !val) return;
    const [firstValue] = sortVersion(Object.keys(dataFiles[val] ?? {}));
    selectValue.value = {
      title: firstValue
        .replace('-.', '-')
        .replace(/\.(?=\D)/, '')
        .replace('-', ' → '),
      value: firstValue.replace('-.', '-').replace(/\.(?=\D)/, ''),
    };
  },
  { immediate: true }
);

const changelogKey = computed(
  () => `${typeSelection.value}-${selectValue.value?.value ?? ''}`
);
const { data: changelog, status: changelogStatus } = useAsyncData<
  IDataFile<IChangelog>
>(
  changelogKey.value,
  () => {
    const module =
      dataFiles[typeSelection.value][selectValue.value?.value ?? ''];
    return module?.(); //.then((moduleData) => moduleData.default);
  },
  {
    server: false,
    watch: [() => changelogKey.value],
    dedupe: 'defer',
  }
);
const iconsSrc = computed(
  () =>
    (typeSelection.value === 'og' ? ogChangelogs.icons : ozChangelogs.icons)[
      selectValue.value?.value ?? ''
    ]
);
provide('iconsSrc', iconsSrc);

const items = computed(() => {
  return sortVersion(Object.keys(dataFiles[typeSelection.value] ?? {}))
    .map((val) => val.replace('-.', '-').replace(/\.(?=\D)/, ''))
    .map<ListItem>((value) => ({
      value,
      title: value.replace('-', ' → '),
    }));
});

const { data: racesData, status: racesStatus } = useAsyncData<{
  races: Array<IBaseObject & { key: string }>;
  icons: Record<string, string>;
  iconsSrc: string;
}>(
  `race-index-${changelog.value?.data.type ?? ''}-${
    changelog.value?.data.to ?? ''
  }`,
  async () => {
    const module = await import(
      `~/data/${changelog.value?.data.type}/${changelog.value?.data.to}/races.json`
    );
    const iconsSrcModule = await import(
      `~/data/${changelog.value?.data.type}/${changelog.value?.data.to}/races.webp`
    );
    return {
      iconsSrc: iconsSrcModule.default,
      icons: module.default.icons,
      races: values(module.default.data).flat(),
    };
  },
  {
    watch: [() => changelog.value?.data],
    immediate: !!changelog.value?.data,
  }
);

provide('racesData', racesData);

definePageMeta({
  name: 'Changelog',
});

useSeoMeta({
  title: 'Changelogs',
  titleTemplate: '',
  description: 'Survival Chaos versions changelogs',
  ogDescription: 'Survival Chaos versions changelogs',
  ogImage: '/favicon.png',
});
</script>

<style lang="css" scoped>
.toTopBtn {
  position: fixed;
  bottom: 20px;
  left: 60px;
  z-index: 50;
}
</style>
