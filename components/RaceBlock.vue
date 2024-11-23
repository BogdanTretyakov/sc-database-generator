<template>
  <CCard
    :title="title"
  >
    <WarGrid :items="races" v-slot:default="{ item: race }">
      <WarTooltip
        class="race-wrapper"
        :coords="iconProps(race.id)"
        :src="iconsSrc"
        :description="race.description"
        description-class="war-header"
      >
        <NuxtLink :to="{ name: 'RaceIndex', params: { race: race.key } }">
          {{ race.name }}
        </NuxtLink>
      </WarTooltip>
    </WarGrid>

  </CCard>
</template>

<script setup lang="ts">
import { useRaceIcons } from '~/composables/useRaceIcons';
import type { IRacePickerObject } from '~/data/types';

const { title, races } = defineProps<{ title: string, races: IRacePickerObject[] }>();

const iconsSrc = await useRaceIcons('races')
const { iconProps } = await useRaceData<IRacePickerObject>('races')

</script>

<style lang="css" scoped>
  .race-wrapper {
    position: relative;
  }
  .race-wrapper a {
    position: absolute;
    inset: 0;
    color: transparent;
  }
</style>