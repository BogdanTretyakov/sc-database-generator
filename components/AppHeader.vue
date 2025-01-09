<template>
  <div class="d-flex">
    <v-btn
      v-for="(text, name) in routes"
      :key="name"
      variant="text"
      :to="{ name, params: { versionType: userVersion } }"
      density="comfortable"
      class="mx-1"
    >
      {{ text }}
    </v-btn>
  </div>
  <v-spacer />
  <v-btn
    variant="text"
    density="comfortable"
    class="mx-1"
    :to="{ name: 'CreditsPage' }"
  >
    Credits
  </v-btn>
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
import { versionIndexes } from '~/data';
const route = useRoute();
const userVersion = useVersionType();

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

const navigateName = computed(() => {
  switch (route.name) {
    case 'RaceIndex':
      return 'RaceSelection';
    default:
      return route.name;
  }
});

const version = computed({
  get() {
    return userVersion.value;
  },
  set(versionType) {
    userVersion.value = versionType;
    navigateTo(
      { name: navigateName.value, params: { versionType } },
      { replace: true }
    );
  },
});
</script>
