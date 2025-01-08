<template>
  <v-row>
    <v-col cols="12" sm="4">
      <CCard title="Damage types">
        <DamageTable :damage="damage" />
      </CCard>
    </v-col>
    <v-col cols="12" sm="8">
      <CCard title="Neutral buildings">
        <div class="d-flex flex-wrap justify-space-between">
          <NeutralItem
            v-for="neutral in neutrals"
            :key="neutral.id"
            :neutral="neutral"
            :icons="icons"
            :icon-props="iconProps"
          />
        </div>
      </CCard>
    </v-col>
    <v-col cols="12" v-if="!!shrines">
      <ShrinesBlock :data="shrines" :icons="icons" :icon-props="iconProps" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import type { IMiscData } from '~/data/types';

const icons = await useRaceIcons('misc');
const {
  iconProps,
  raceData: { damage, neutrals, shrines },
} = await useRaceData<IMiscData>('misc');

useSeoMeta({
  title: `Misc data`,
});
definePageMeta({
  name: 'MiscIndex',
});
</script>

<style lang="css" scoped>
.misc-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
}
.misc-container > * {
  flex-shrink: 0;
  flex-grow: 0;
  margin: 8px 16px;
}
</style>
