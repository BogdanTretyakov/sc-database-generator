<template>
  <div
    :style="{ gridRow: `span ${1 + Math.floor(bonusBuildings.length / 5)}` }"
  >
    <CCard
      title="Bonuses"
      :full-height="false"
      class="d-flex flex-column align-center justify-start"
      id="bonuses"
    >
      <template #title>
        <VTooltip
          open-on-click
          :open-on-hover="false"
          :offset="[-4, 0]"
          close-on-back
          location="top"
          :transition="{
            component: VFadeTransition,
          }"
        >
          <template #activator="{ props }">
            <v-btn
              size="large"
              class="mx-auto"
              variant="text"
              color="yellow"
              v-bind="props"
            >
              <b>Bonuses</b>
            </v-btn>
          </template>
          <span>There is no easter eggs</span>
        </VTooltip>
      </template>
      <WarGrid :items="race.bonuses" v-slot="{ item }">
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
      <div class="my-2 text-h6">Buildings</div>
      <div class="d-flex flex-wrap">
        <v-btn
          v-for="item in bonusBuildings"
          class="my-1 mx-2 cursor-default"
          variant="text"
          size="x-small"
          :active="hover && hover.includes(item.id)"
          @mouseover="() => setHover(item)"
          @mouseout="() => (hover = undefined)"
        >
          <span v-html="item.name" />
        </v-btn>
      </div>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import type { IBaseObject, IBonusObject, IRaceData } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import { VFadeTransition } from 'vuetify/components';

interface Props {
  race: IRaceData;
  icons: string;
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}
const { race, icons, iconProps } = defineProps<Props>();
const hover = inject<Ref<undefined | string[]>>('hover', ref());

const collator = new Intl.Collator('en').compare;

const bonusBuildings = computed(() =>
  Object.values(race.bonusBuildings).sort(({ name: n1 }, { name: n2 }) =>
    collator(n1, n2)
  )
);

const setHover = (item: IBaseObject | IBonusObject) => {
  if (!isBonusObject(item)) {
    hover.value = [
      item.id,
      ...race.bonuses
        .filter(({ buildingId }) => buildingId === item.id)
        .map(({ id }) => id),
    ].filter(isNotNil);
    return;
  }
  const unitsReplace = Object.values(race.units)
    .filter(({ hotkey }) => item.units?.some((unit) => unit.hotkey === hotkey))
    .map(({ id }) => id);
  hover.value = [item.id, item.buildingId, ...item.relatedID, ...unitsReplace];
};
</script>
