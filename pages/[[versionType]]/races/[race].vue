<template>
  <div class="race-container">
    <RaceSelectRibbon style="grid-column: 1 / -1" />
    <RaceDescription :race="raceData" />
    <RaceFortress :race="raceData" :icons="icons" :icon-props="iconProps" />
    <RaceTowers :race="raceData" :icons="icons" :icon-props="iconProps" />
    <RaceBonuses :race="raceData" :icons="icons" :icon-props="iconProps" />
    <RaceBarracks :race="raceData" :icons="icons" :icon-props="iconProps" />
  </div>
</template>

<script setup lang="ts">
import { defaultVersionType, versionIndexes } from '~/data';
import HeroReplace from '~/components/racePage/HeroReplace.vue';
import RaceDescription from '~/components/racePage/RaceDescription.vue';
import RaceFortress from '~/components/racePage/RaceFortress.vue';
import RaceTowers from '~/components/racePage/RaceTowers.vue';
import RaceBonuses from '~/components/racePage/RaceBonuses.vue';
import RaceBarracks from '~/components/racePage/RaceBarracks.vue';

const version = useVersionIndex();

const icons = await useRaceIcons();
const { raceData, iconProps } = await useRaceData();

provide('hover', ref<undefined | string[]>());

useSeoMeta({
  title: `${raceData.name} v${version.value.version}`,
  description: `${raceData.name} of Survival Chaos v${version.value.version}: race info, bonuses, upgrades, units and heroes`,
  ogDescription: `${raceData.name} of Survival Chaos v${version.value.version}: race info, bonuses, upgrades, units and heroes`,
});

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: icons,
    },
  ],
});

definePageMeta({
  name: 'RaceIndex',
  middleware(to) {
    const [versionType] = [to.params.versionType].flat();
    const versionIndex = versionIndexes[versionType || defaultVersionType];
    const [race] = [to.params.race].flat();
    if (!(race in versionIndex.racesData)) {
      return navigateTo({ name: 'RaceSelection' });
    }
  },
});
</script>
<style lang="css" scoped>
.title {
  text-shadow: #000000 0px 0px 5px, #000000 0px 0px 5px;
}
.race-container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}
.row-span-2 {
  grid-row: span 2;
}
.selected {
  outline: 4px solid #ffd428;
}
</style>

<style lang="css">
.depressed {
  opacity: 0.4;
}
.selectable-item {
  transition: 150ms opacity linear;
}
</style>
