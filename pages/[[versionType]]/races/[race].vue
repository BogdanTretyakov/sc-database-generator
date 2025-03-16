<template>
  <div>
    <RaceSelectRibbon style="grid-column: 1 / -1" />
    <DetailsProvider :obj-finder="objFinder">
      <div class="race-container" :style="containerColumnWidth">
        <RaceDescription :race="raceData" style="flex-basis: 300px" />
        <RaceFortress :race="raceData" :icons="icons" :icon-props="iconProps" />
        <RaceTowers :race="raceData" :icons="icons" :icon-props="iconProps" />
        <RaceBonuses :race="raceData" :icons="icons" :icon-props="iconProps" />
        <RaceBarracks :race="raceData" :icons="icons" :icon-props="iconProps" />
      </div>
    </DetailsProvider>
  </div>
</template>

<script setup lang="ts">
import { defaultVersionType, versionIndexes } from '~/data';
import RaceDescription from '~/components/racePage/RaceDescription.vue';
import RaceFortress from '~/components/racePage/RaceFortress.vue';
import RaceTowers from '~/components/racePage/RaceTowers.vue';
import RaceBonuses from '~/components/racePage/RaceBonuses.vue';
import RaceBarracks from '~/components/racePage/RaceBarracks.vue';
import type { GetObjectFunction } from '~/data/types';
import { DEFAULT_ICON_SIZE } from '~/consts';

const version = useVersionIndex();

const icons = await useRaceIcons();
const { raceData, iconProps } = await useRaceData();

// @ts-expect-error
const objFinder: GetObjectFunction = (type, id) => {
  switch (type) {
    case 'upgrade':
      return Object.values(raceData.baseUpgrades)
        .concat(raceData.magic)
        .concat(raceData.towerUpgrades)
        .find((item) => item.id === id);
    case 'unit':
      return Object.values(raceData.units).find((item) => item.id === id);
    case 'bonus':
      return Object.values(raceData.bonuses).find((item) => item.id === id);
    case 'hero':
      return raceData.heroes.find((item) => item.id === id);
    case 'spell':
      return [raceData.t1spell, raceData.t2spell].find(
        (item) => item.id === id
      );
    default:
      return undefined;
  }
};

const iconSize = useStorageValue('iconSize', DEFAULT_ICON_SIZE);
const containerColumnWidth = computed(() => ({
  gridTemplateColumns: `minmax(300px, 1fr) repeat(auto-fill, minmax(${
    +iconSize.value * 5
  }px, 1fr))`,
}));

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
  transition: 200ms opacity ease-in-out;
}
</style>
