<template>
  <div>
    <v-slide-group :model-value="$route.params.race" center-active show-arrows>
      <v-slide-group-item
        v-for="race in raceItems"
        :value="race.key"
        :key="race.key"
        v-slot="{ isSelected }"
      >
        <WarTooltip
          class="race-wrapper"
          :class="{ selected: isSelected }"
          :coords="iconProps(race.id)"
          :src="iconsSrc"
          description=""
        >
          <template #tooltip>
            <div v-html="race.name" />
          </template>
          <NuxtLink
            :to="{
              name: 'RaceIndex',
              params: { ...$route.params, race: race.key },
            }"
          >
            {{ race.name }}
          </NuxtLink>
        </WarTooltip>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script setup lang="ts">
import type { IRacePickerObject } from '~/data/types';

const iconsSrc = await useRaceIcons('races');
const { raceData, iconProps } = await useRaceData<
  Record<string, IRacePickerObject[]>
>('races');

const raceItems = computed(() => Object.values(raceData).flat());
</script>

<style scoped>
.race-wrapper {
  width: 48px;
  position: relative;
  margin: 0 8px;
  opacity: 0.5;
  transition: opacity 0.3s linear;
  user-select: none;
}

.race-wrapper.selected {
  opacity: 1;
}

.race-wrapper:hover {
  opacity: 1;
}

.race-wrapper a {
  position: absolute;
  inset: 0;
  color: transparent;
}
</style>
