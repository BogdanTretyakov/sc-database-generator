<template>
  <div>
    <div class="text-center">
      <h1 class="text-h2 font-bold title mb-6">Survival Chaos {{ version }}</h1>
    </div>
    <div class="d-flex flex-wrap justify-space-around align-content-center">
      <div
        v-for="(races, alliance) in raceData"
        :key="alliance"
        class="ma-2 flex-grow-0 flex-shrink-0"
      >
        <RaceBlock :title="alliance" :races="races" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IRacePickerObject } from '~/data/types';

const version = useVersion();
const { raceData } = await useRaceData<Record<string, IRacePickerObject[]>>(
  'races'
);

definePageMeta({
  name: 'RaceSelection',
});

useSeoMeta({
  title: `Races ${version.value}`,
});
</script>
