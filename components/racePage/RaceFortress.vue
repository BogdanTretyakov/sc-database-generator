<template>
  <CCard
    title="Fortress"
    class="d-flex flex-column justify-start"
    style="grid-row: span 2"
    :full-height="false"
    id="fortress"
  >
    <template #title>
      <DetailsWrapper hide-dot :item="race.buildings.fort">
        <v-btn size="large" class="mx-auto" variant="text" color="yellow">
          <b>Fortress</b>
        </v-btn>
      </DetailsWrapper>
    </template>
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

    <v-divider class="my-3 w-100" />
    <WarGrid class="mx-auto" :items="researches" v-slot="{ item }">
      <DetailsTooltip
        :item="item"
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
      />
    </WarGrid>

    <v-divider class="my-3 w-100" />

    <WarGrid class="mx-auto" :items="spells" v-slot="{ item }">
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
import type { IRaceData, IUpgradeObject } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import { DetailsTooltip } from '#components';

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
