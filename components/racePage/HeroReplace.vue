<template>
  <div class="d-flex align-center justify-space-between">
    <div class="flex-shrink-0">
      <WarTooltip
        :description="hero.description"
        :src="icons"
        :coords="iconProps(hero.id)"
      >
        <template #tooltip>
          <div class="text-h6" v-html="hero.fullName" />
          <div class="text-subtitle-1" v-html="hero.name" />
          <WarCost :cost="hero.cost" />
        </template>
      </WarTooltip>
    </div>
    <div class="flex-shrink-1 ml-n6">
      <WarGrid :items="items" :size="0.5">
        <template #default="{ item }">
          <WarTooltip
            :src="icons"
            :coords="iconProps(item.id)"
            :description="item.description ?? ''"
          >
            <template #tooltip>
              <div class="text-subtitle-1" v-html="item.name" />
              <div class="text-caption">
                Obtain at
                <span class="text-level">{{ item.level }}</span> level
              </div>
            </template>
          </WarTooltip>
        </template>
      </WarGrid>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { IBonusHero } from '~/data/types';

interface Props {
  hero: IBonusHero;
}

const icons = await useRaceIcons();
const { iconProps, raceData } = await useRaceData();

const heroesHotkeys = ['Q', 'W', 'E', 'R'];

const hotkeys = ['E', 'R', 'D', 'F', 'C', 'V'];

const { hero } = defineProps<Props>();

const originalHero = computed(
  () => raceData.heroes[heroesHotkeys.indexOf(hero.hotkey)]
);

const items = computed(() =>
  hero.items.map((item, idx) => ({
    ...item,
    hotkey: hotkeys[idx],
  }))
);
</script>

<style lang="css" scoped>
.text-level {
  color: #d8d347;
}
</style>
