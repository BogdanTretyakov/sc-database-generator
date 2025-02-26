<template>
  <CCard
    title="Fortress"
    class="d-flex flex-column justify-start"
    style="grid-row: span 2"
    :full-height="false"
    id="fortress"
  >
    <template #prependHead>
      <AttackDefend
        key="fort-attack"
        class="ml-1"
        :type="race.buildings.fort.atkType"
      />
    </template>
    <template #appendHead>
      <CombineCost key="fort-cost" class="mr-1" :items="researches" />
    </template>
    <WarGrid class="mx-auto" :items="race.auras" v-slot="{ item }">
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
          <div class="text-subtitle-1" v-html="item.name" />
        </template>
      </WarTooltip>
    </WarGrid>

    <v-divider class="my-3 w-100" />
    <WarGrid class="mx-auto" :items="researches" v-slot="{ item }">
      <WarTooltip
        :description="item.description ?? ''"
        :src="icons"
        :coords="
          !('level' in item) || (item.iconsCount ?? 0) <= 1
            ? iconProps(item.id, item.iconsCount)
            : iconProps(`${item.id}-${item.level}`)
        "
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
          <WarCost :cost="'level' in item ? item.cost[0] : item.cost" />
        </template>
      </WarTooltip>
    </WarGrid>

    <v-divider class="my-3 w-100" />

    <WarGrid class="mx-auto" :items="spells" v-slot="{ item }">
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
          <div class="text-subtitle-1" v-html="item.name" />
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

const spells = computed(() => {
  const spells = [race.t1spell, race.t2spell];
  if (race.ultimateId) {
    spells.push({
      type: 'spell',
      hotkey: 'V',
      id: race.ultimateId,
      name: 'Precision UW Icon',
      description: '',
    });
  }
  return spells;
});

const researches = computed<Array<IUpgradeObject>>(() => {
  return race.magic
    .map((magic, idx) => ({
      ...magic,
      hotkey: hotkeys[idx],
    }))
    .concat(...Object.values(race.baseUpgrades));
});

const setHover = (item: IUpgradeObject) => {
  const units = Object.values(race.units)
    .filter(({ upgrades }) => upgrades?.includes(item.id))
    .map(({ id }) => id);
  hover.value = [item.id, ...units];
};
</script>
