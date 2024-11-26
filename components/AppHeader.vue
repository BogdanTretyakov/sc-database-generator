<template>
  <div class="d-flex">
    <v-btn
      v-for="(text, name) in routes"
      :key="name"
      variant="text"
      :to="{ name }"
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
      hide-details
      :list-props="{
        density: 'compact',
      }"
      bg-color="transparent"
      flat
      :width="100"
    />
  </div>
</template>

<script setup lang="ts">
import { versions } from '~/data';

const version = useVersion();

const versionList = Object.keys(versions);

const routes = {
  RaceSelection: 'Races',
  ArtifactsIndex: 'Artifacts',
  UltimatesIndex: 'Ultimates',
};
</script>
