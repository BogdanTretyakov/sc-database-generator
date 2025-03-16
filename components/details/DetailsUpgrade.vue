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
    <v-expansion-panel v-if="spells?.length" title="Spells" value="spells">
      <v-expansion-panel-text>
        <div class="d-flex justify-center">
          <WarGrid :items="spells" disable-details skip-hotkey #="{ item }">
            <DetailsTooltip
              :item="item"
              :src="icons"
              :coords="iconProps(item.id, item.iconsCount)"
            />
          </WarGrid>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel
      v-for="summon in summons"
      :title="`Summon: ${summon.name}`"
      :value="`summon-${summon.id}`"
    >
      <v-expansion-panel-text>
        <DetailsUnit :item="summon" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel v-if="affects.length" title="Affects" value="affects">
      <v-expansion-panel-text>
        <div class="d-flex justify-center">
          <WarGrid :items="affects" disable-details skip-hotkey #="{ item }">
            <DetailsTooltip
              :item="item"
              :src="icons"
              :coords="iconProps(item.id, item.iconsCount)"
            />
          </WarGrid>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import type { IUpgradeObject } from '~/data/types';

interface Props {
  item: IUpgradeObject;
}

const panels = ref(['spells', 'summons', 'affects']);

const { raceData, iconProps } = await useRaceData();
const icons = await useRaceIcons();

const { item } = defineProps<Props>();

const summons = computed(
  () =>
    item.spells
      ?.map((spell) => spell.summonUnit)
      .flat()
      .filter(isNotNil)
      .filter(uniqById) ?? []
);

const spells = computed(() => item.spells);

const affects = computed(() => {
  const mainUnits = Object.values(raceData.units).filter(({ upgrades }) =>
    upgrades?.includes(item.id)
  );
  const replaceUnits = raceData.bonuses
    .map(({ units }) => units ?? [])
    .flat()
    .filter(({ upgrades }) => upgrades?.includes(item.id))
    .map((unit) => {
      const id =
        raceData.bonuses.find(({ units }) =>
          units?.some(({ id }) => id === unit.id)
        )?.id ?? '';
      return {
        ...unit,
        id,
      };
    });
  return [...mainUnits, ...replaceUnits];
});
</script>
