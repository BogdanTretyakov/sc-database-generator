<template>
  <div>
    <RaceSelectRibbon class="mb-2" />
    <DetailsProvider :obj-finder="objFinder" :race-name="routeRace">
      <div class="race-container" :style="containerColumnWidth">
        <RaceDescription :race="raceData" style="flex-basis: 300px" />
        <RaceFortress
          :race="raceData"
          :icons="iconsSrc"
          :icon-props="iconProps"
        />
        <RaceTowers
          :race="raceData"
          :icons="iconsSrc"
          :icon-props="iconProps"
        />
        <RaceBonuses
          :race="raceData"
          :icons="iconsSrc"
          :icon-props="iconProps"
        />
        <RaceBarracks
          :race="raceData"
          :icons="iconsSrc"
          :icon-props="iconProps"
        />
      </div>
    </DetailsProvider>
  </div>
</template>

<script setup lang="ts">
import RaceDescription from '~/components/racePage/RaceDescription.vue';
import RaceFortress from '~/components/racePage/RaceFortress.vue';
import RaceTowers from '~/components/racePage/RaceTowers.vue';
import RaceBonuses from '~/components/racePage/RaceBonuses.vue';
import RaceBarracks from '~/components/racePage/RaceBarracks.vue';
import type { GetObjectFunction } from '~/data/types';
import { DEFAULT_ICON_SIZE, IS_TOUCH } from '~/consts';

const app = useNuxtApp();
const [routeRace] = [useRoute().params.race].flat();

const { raceData, iconProps, iconsSrc, version } = await useRaceData(routeRace);

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
  gridTemplateColumns: `repeat(auto-fill, minmax(${
    +iconSize.value * 5
  }px, 1fr))`,
}));

const hoverRef = IS_TOUCH
  ? computed(() => undefined)
  : ref<undefined | string[]>();

provide('hover', hoverRef);

app.runWithContext(() => {
  useSeoMeta({
    title: `${raceData.name} v${version}`,
    description: `${raceData.name} of Survival Chaos v${version}: race info, bonuses, upgrades, units and heroes`,
    ogDescription: `${raceData.name} of Survival Chaos v${version}: race info, bonuses, upgrades, units and heroes`,
  });

  useHead({
    link: [
      {
        rel: 'preload',
        as: 'image',
        href: iconsSrc,
      },
    ],
  });
});

definePageMeta({
  name: 'RaceIndex',
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
