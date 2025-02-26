<template>
  <v-expansion-panels elevation="0" static tile multiple v-model="panels">
    <v-expansion-panel
      v-if="item.description"
      title="Description"
      value="description"
    >
      <v-expansion-panel-text>
        <div v-html="item.description" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel
      v-if="isShowGrid && gridItems.length"
      title="Bonus spells/upgrades"
      value="grid"
    >
      <v-expansion-panel-text>
        <div class="d-flex justify-center">
          <WarGrid
            v-if="isShowGrid && gridItems.length"
            :items="gridItems"
            disable-details
            show-empty
          >
            <template #default="{ item }">
              <WarTooltip
                :src="raceIcons"
                :coords="iconProps(item.id)"
                :description="item.description ?? ''"
              >
                <template #tooltip>
                  <div class="text-subtitle-1" v-html="item.name" />
                </template>
              </WarTooltip>
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
  </v-expansion-panels>

  <v-textarea :model-value="tempData" />
</template>

<script setup lang="ts">
import type { IBonusObject } from '~/data/types';

interface Props {
  item: IBonusObject;
}

const raceIcons = await useRaceIcons();
const { iconProps } = await useRaceData();

const { item } = defineProps<Props>();

const panels = ref(['grid']);

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

const tempData = computed(() => JSON.stringify(item, null, 4));
</script>
