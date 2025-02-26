<template>
  <CCard
    title="Barracks"
    :full-height="false"
    class="d-flex flex-column"
    style="grid-row: span 2"
    id="units"
  >
    <template #prependHead>
      <AttackDefend
        key="barrack-attack"
        class="ml-1"
        :type="race.buildings.barrack.atkType"
      />
    </template>
    <WarGrid class="mx-auto" :items="units" v-slot="{ item }">
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
        @mouseenter="() => setHover(item)"
        @mouseout="() => (hover = undefined)"
      >
        <template #tooltip>
          <div class="text-subtitle-1" v-html="item.name" />
          <WarCost :cost="item.cost" />
          <div class="d-flex flex-no-wrap my-1">
            <AttackDefend
              :type="item.atkType"
              :value="item.atk"
              :size="24"
              class="flex-grow-1"
            />
            <AttackDefend
              :type="item.defType"
              :value="item.def"
              is-defend
              :size="24"
              class="flex-grow-1"
            />
          </div>
        </template>
      </WarTooltip>
    </WarGrid>

    <v-divider class="my-3 w-100" />

    <WarGrid class="mx-auto" :items="race.heroes" v-slot="{ item }">
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
      >
        <template #tooltip>
          <div class="text-h6" v-html="item.fullName" />
          <div class="text-subtitle-1" v-html="item.name" />
          <WarCost :cost="item.cost" />
        </template>
      </WarTooltip>
    </WarGrid>
  </CCard>
</template>

<script setup lang="ts">
import type { IRaceData, IUnitObject } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';

interface Props {
  race: IRaceData;
  icons: string;
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}
const { race, icons, iconProps } = defineProps<Props>();

const hover = inject<Ref<undefined | string[]>>('hover', ref());

const unitsHotkeys: Record<string, string> = {
  melee: 'A',
  range: 'S',
  mage: 'D',
  siege: 'F',
  air: 'E',
  catapult: 'R',
};

const units = computed(() =>
  Object.entries(race.units).map(([key, value]) => ({
    ...value,
    hotkey: unitsHotkeys[key],
  }))
);

const setHover = (item: IUnitObject) => {
  hover.value = [item.id, ...(item.upgrades ?? [])];
};
</script>
