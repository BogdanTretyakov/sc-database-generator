<template>
  <CCard
    title="Towers"
    :full-height="false"
    class="d-flex flex-column"
    style="grid-row: span 2"
    id="upgrades"
  >
    <template #prependHead>
      <AttackDefend
        key="tower-attack"
        class="ml-1"
        :type="race.buildings.tower.atkType"
      />
    </template>
    <template #appendHead>
      <CombineCost key="tower-cost" :items="race.towerUpgrades" :count="3">
        Total cost (Lv3)
      </CombineCost>
    </template>
    <WarGrid
      class="mx-auto"
      :items="race.towerUpgrades"
      :restrictedSlots="['Q', 'W']"
      v-slot="{ item }"
    >
      <WarTooltip
        :description="item.description ?? ''"
        :src="icons"
        :coords="iconProps(item.id)"
        :class="[
          'selectable-item',
          {
            depressed: hover && !hover.includes(item.id),
          },
        ]"
        @mouseover="() => setHover(item)"
        @mouseout="() => (hover = undefined)"
      >
        <template #tooltip>
          <div class="text-subtitle-1" v-html="item.name" />
          <WarCost :cost="item.cost" />
        </template>
      </WarTooltip>
    </WarGrid>
  </CCard>
</template>

<script setup lang="ts">
import type { IRaceData, IUpgradeObject } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';

interface Props {
  race: IRaceData;
  icons: string;
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}
const { race, icons, iconProps } = defineProps<Props>();

const hover = inject<Ref<undefined | string[]>>('hover', ref());

const upgrades = computed(() =>
  Object.fromEntries(race.towerUpgrades.map((item) => [item.id, item]))
);
const relatedBonuses = computed(() =>
  Object.values(race.bonuses).reduce((acc, { id, relatedID }) => {
    relatedID.forEach((i) => {
      acc[i] = id;
    });
    return acc;
  }, {} as Record<string, string>)
);

const setHover = (item: IUpgradeObject) => {
  hover.value = [item.id, relatedBonuses.value[item.id]];
};
</script>
