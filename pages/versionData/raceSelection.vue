<template>
  <div>
    <div class="text-center">
      <h1 class="text-h2 font-bold title mb-6">
        Survival Chaos {{ versionType === 'oz' ? 'Reborn' : '' }} v{{ version }}
        races
      </h1>
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

const { raceData, version, versionType, iconsSrc } = await useRaceData<
  Record<string, IRacePickerObject[]>
>('races');

definePageMeta({
  name: 'RaceSelection',
});

useSeoMeta({
  title: `Races v${version}${versionType === 'oz' ? ' Reborn' : ''}`,
  description: `Survival Chaos races list in version ${version}`,
  ogDescription: `Survival Chaos races list in version ${version}`,
  ogImage: iconsSrc,
});
</script>
