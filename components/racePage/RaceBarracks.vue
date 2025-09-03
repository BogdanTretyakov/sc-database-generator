<template>
  <CCard
    title="Barracks"
    :full-height="false"
    class="d-flex flex-column"
    id="units"
  >
    <template #title>
      <DetailsWrapper hide-dot :item="race.buildings.barrack">
        <v-btn size="large" class="mx-auto" variant="text" color="yellow">
          <b>Barracks</b>
        </v-btn>
      </DetailsWrapper>
    </template>
    <template #prependHead>
      <AttackDefend
        key="barrack-attack"
        class="ml-1"
        :type="race.buildings.barrack.atkType"
      />
    </template>
    <WarGrid class="mx-auto" :items="units" v-slot="{ item }">
      <DetailsTooltip
        :item="item"
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
      />
    </WarGrid>

    <v-divider class="my-3 w-100" />

    <WarGrid class="mx-auto" :items="race.heroes" v-slot="{ item }">
      <DetailsTooltip
        :item="item"
        :src="icons"
        :coords="iconProps(item.id)"
        :class="[
          'selectable-item',
          {
            depressed: hover && !hover.includes(item.id),
          },
        ]"
      />
    </WarGrid>
  </CCard>
</template>

<script setup lang="ts">
import type { GetObjectFunction, IRaceData, IUnitObject } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import { DetailsTooltip } from '#components';

interface Props {
  race: IRaceData;
  icons: string;
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}
const { race, icons, iconProps } = defineProps<Props>();

const hover = inject<Ref<undefined | string[]>>('hover', ref());
const objFinder = inject<GetObjectFunction>('objFinder')!;

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
