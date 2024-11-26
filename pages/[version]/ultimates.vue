<template>
  <div class="text-center">
    <h1 class="text-h2 font-bold title mb-6">Ultimates {{ version }}</h1>
  </div>
  <div class="container">
    <div class="picker">
      <CCard title="">
        <WarGrid :items="pickers" #default="{ item }">
          <WarTooltip
            :class="['picker-item', picked === item.id && 'selected']"
            :description="item.description"
            :src="icons"
            :coords="iconProps(item.id)"
            @click="() => (picked = item.id)"
          >
            <template #tooltip>
              <div class="text-subtitle-1" v-html="item.name" />
              <SpellRequires
                :requires="item.requires"
                :requires-names="requires"
              />
            </template>
          </WarTooltip>
        </WarGrid>
      </CCard>
    </div>
    <div v-for="n in 2">
      <v-fade-transition>
        <CCard v-if="selectedSpells[n - 1]" title="">
          <template #title>
            <div class="d-flex align-center justify-space-between">
              <div v-html="selectedSpells[n - 1].name" />
              <GameIcon
                class="ml-2"
                width="48"
                :src="icons"
                :coords="iconProps(selectedSpells[n - 1].id)"
              />
            </div>
          </template>

          <div class="d-flex align-start">
            <div class="flex-grow-1">
              <SpellRequires
                :requires="selectedSpells[n - 1].requires"
                :requires-names="requires"
              />
            </div>
            <div
              class="d-flex align-center"
              v-if="selectedSpells[n - 1].manaCost"
            >
              <GameIcon
                :src="assetsIcons"
                :coords="mana"
                width="16"
                class="mr-1"
              />
              <span class="color-blue">
                {{ selectedSpells[n - 1].manaCost }}
              </span>
            </div>
          </div>
          <div v-html="selectedSpells[n - 1].description" />
        </CCard>
      </v-fade-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUltimatesData } from '~/data/types';

const [assetsIcons, { mana }] = useAssets();

const version = useVersion();

const icons = await useRaceIcons('ultimates');
const {
  iconProps,
  raceData: { pickers, requires, spells },
} = await useRaceData<IUltimatesData>('ultimates');

const picked = useHashValue(pickers[0]?.id);

const selectedSpells = computed(
  () => (!!picked.value && spells[picked.value]) || []
);

useSeoMeta({
  title: `Ultimates ${version.value}`,
});
definePageMeta({
  name: 'UltimatesIndex',
});
</script>

<style lang="css" scoped>
.container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(auto, 350px));
  justify-content: center;
}
.picker {
  grid-column: -2;
  grid-row: 1;
  margin-left: auto;
}
.picker:deep(> div) {
  max-height: min-content;
}
.picker-item {
  cursor: pointer;
}
.picker-item.selected {
  outline: 4px solid #ffd428;
}
.color-blue {
  color: #4481f2;
}
</style>
