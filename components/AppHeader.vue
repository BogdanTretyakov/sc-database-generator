<template>
  <div class="d-flex">
    <v-btn
      v-for="(text, name) in routes"
      :key="name"
      variant="text"
      :to="{ name, params: $route.params }"
      density="comfortable"
      class="mx-1"
    >
      {{ text }}
    </v-btn>
  </div>
  <v-spacer />
  <div>
    <v-select
      v-model="version"
      :items="versionList"
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
    >
      <template #selection="{ item }">
        {{ item.title }}
      </template>
    </v-select>
  </div>
</template>

<script setup lang="ts">
import { defaultVersionType, versionIndexes } from '~/data';
const route = useRoute();
const userVersion = useCookie('defaultVersion', { maxAge: 2147483647 });

const routes = {
  RaceSelection: 'Races',
  ArtifactsIndex: 'Artifacts',
  UltimatesIndex: 'Ultimates',
  MiscIndex: 'Misc',
};

const versionList = [
  {
    title: `W3C ${versionIndexes.w3c.version}`,
    value: 'w3c',
  },
  {
    title: `OZEdition ${versionIndexes.oz.version}`,
    value: 'oz',
  },
];

const version = computed({
  get() {
    const [versionType] = [route.params.versionType].flat();
    return versionType || defaultVersionType;
  },
  set(versionType) {
    userVersion.value = versionType;
    navigateTo(
      { name: 'RaceSelection', params: { versionType } },
      { replace: true }
    );
  },
});
</script>
