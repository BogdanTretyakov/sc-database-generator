<template>
  <v-select
    v-model="selectValue"
    :items="items"
    return-object
    density="compact"
    variant="solo"
    label="Version"
    hide-details
    :list-props="{
      density: 'comfortable',
    }"
    bg-color="transparent"
    flat
    min-width="min-content"
    @update:menu="handleMenu"
    :key="route.path"
  >
    <template #prepend-item>
      <v-list-item
        v-for="(_, key) in dataFiles"
        @click="selectValue = { type: key, value: '', title: '' }"
        density="compact"
        :active="
          selectValue.type === key && selectValue.value === lastVersions[key]
        "
      >
        {{ versionTypeTitles[key] }} latest (v{{ lastVersions[key] }})
      </v-list-item>
      <div class="full-width d-flex my-1">
        <v-btn-toggle
          class="mx-auto"
          density="compact"
          size="small"
          v-model="typeSelection"
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
    <template #item="{ props, item }">
      <v-list-item v-bind="props" density="compact"> </v-list-item>
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import { dataFiles, lastVersions } from '~/data';
const savedPrefVersion = useStorageValue('preferredVersion');

const versionTypeTitles: Record<string, string> = {
  og: 'Original',
  oz: 'OZGame',
};

const route = useRoute();

const routeVersionType = computed(() => [route.params.versionType].flat()[0]);
const typeSelection = ref('');
watch(
  () => routeVersionType.value,
  () => {
    typeSelection.value = routeVersionType.value;
  },
  { immediate: true }
);

const handleMenu = (ue: boolean) => {
  if (ue) return;
  typeSelection.value = routeVersionType.value;
};

const selectValue = computed({
  get: () => {
    const [versionType] = [route.params.versionType].flat();
    let [version] = [route.params.version].flat();

    if (!version || version === 'latest') {
      version = lastVersions[versionType];
    }

    return {
      type: versionType,
      value: version,
      title: `${versionTypeTitles[versionType]} v${version}`,
    };
  },
  set: ({ value, type }: { value?: string; type: string }) => {
    let toVersion: string | undefined = value;
    if (value === 'latest' || value === lastVersions[type]) {
      toVersion = undefined;
    }

    savedPrefVersion.value = type;

    const name =
      route.name === 'RaceIndex' && type !== route.params.versionType
        ? 'RaceSelection'
        : route.name;

    navigateTo(
      {
        name,
        params: {
          versionType: type,
          version: toVersion,
        },
      },
      { replace: true }
    );
  },
});

const items = computed(() => {
  return sortVersion(Object.keys(dataFiles[typeSelection.value] ?? {}))
    .map((v) => ({
      value: v,
      type: typeSelection.value,
      title: `v${v}`,
    }))
    .filter(({ value }) => value !== lastVersions[typeSelection.value]);
});
</script>
