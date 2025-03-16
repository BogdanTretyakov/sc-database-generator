<template>
  <v-expansion-panels elevation="0" static tile multiple v-model="panels">
    <v-expansion-panel
      v-if="item.description"
      title="Description"
      value="description"
    >
      <v-expansion-panel-text>
        <div class="text-body-2" v-html="item.description" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel v-if="isShowGrid && gridItems.length" value="grid">
      <v-expansion-panel-title width="100%" class="d-flex">
        <span class="mr-auto">Bonus spells/upgrades</span>
        <CombineCost :items="item.upgrades ?? []"> Total cost </CombineCost>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <div class="d-flex justify-center">
          <WarGrid
            v-if="isShowGrid && gridItems.length"
            :items="gridItems"
            disable-details
            show-empty
          >
            <template #default="{ item }">
              <DetailsTooltip
                :src="raceIcons"
                :coords="iconProps(item.id, item.iconsCount)"
                :item="item"
              />
            </template>
          </WarGrid>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel
      v-for="unit in item.units"
      :title="`Unit: ${unit.name}`"
      :value="`unit-${unit.id}`"
    >
      <v-expansion-panel-text>
        <DetailsUnit :item="unit" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel
      v-if="!!openUpgrades.length"
      title="Unlocked upgrades"
      value="opens"
    >
      <v-expansion-panel-text>
        <div class="d-flex justify-center">
          <WarGrid
            :items="openUpgrades"
            disable-details
            skip-hotkey
            #="{ item }"
          >
            <DetailsTooltip
              :src="raceIcons"
              :coords="iconProps(item.id, item.iconsCount)"
              :item="item"
            />
          </WarGrid>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { GetObjectFunction, IBonusObject } from '~/data/types';

interface Props {
  item: IBonusObject;
}

const objFinder = inject<GetObjectFunction>('objFinder')!;
const raceIcons = await useRaceIcons();
const { iconProps } = await useRaceData();

const { item } = defineProps<Props>();

const panels = ref(['grid', 'opens']);

watch(
  () => item,
  (val) => {
    panels.value = ['grid'].concat(
      val.units?.map(({ id }) => `unit-${id}`) ?? []
    );
  }
);

const isShowGrid = computed(() => {
  if ((item.spells?.length ?? 0) > 1) return true;
  return [item.units, item.upgrades].some((arr) => !!arr?.length);
});

const gridItems = computed(() => {
  return [
    ...(item.spells ?? []).filter(({ name }) => !!name),
    ...(item.upgrades ?? []),
  ];
});

const openUpgrades = computed(() => {
  return item.relatedID.map((id) => objFinder('upgrade', id)).filter(isNotNil);
});
</script>
