<template>
  <div class="misc-container">
    <CCard title="Shrine timings">
      <div class="pa-2">
        <div class="text-h5 my-2">
          <span class="text-green">Tier 1 [Q]</span>: 00:00
        </div>
        <div class="text-h5 my-2">
          <span class="text-yellow">Tier 2 [E]</span>: 20:00
        </div>
        <div class="text-h5 my-2">
          <span class="text-red">Tier 3 [W]</span>: 40:00
        </div>
      </div>
    </CCard>
    <CCard
      v-for="hotkey in shrinesOrder"
      :key="hotkey"
      :title="`Shrine abilities [${hotkey}]`"
      class="d-flex align-center flex-column"
    >
      <WarGrid :items="shrines[hotkey]" skip-hotkey v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import type { IBaseObject } from '~/data/types';
import type { IconBoundaries } from './GameIcon.vue';

interface Props {
  data: IBaseObject[];
  icons: string;
  iconProps(id: string): IconBoundaries | IconBoundaries[];
}

const { data, icons, iconProps } = defineProps<Props>();

const shrines = computed(() =>
  data.reduce<Record<string, IBaseObject[]>>((acc, item) => {
    const hotkey = capitalize(item.hotkey || 'unknown');
    if (hotkey.toLocaleLowerCase() === 'r') {
      // Ultimates are temporal disabled
      return acc;
    }
    if (!(hotkey in acc)) {
      acc[hotkey] = [item];
    } else {
      acc[hotkey].push(item);
    }
    return acc;
  }, {})
);

const shrinesOrder = computed(() =>
  ['Q', 'E', 'W', 'R', 'Other'].filter((key) => key in shrines.value)
);
</script>

<style lang="css" scoped>
.misc-container {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}
.misc-container > * {
  flex-shrink: 0;
  flex-grow: 0;
  margin: 8px 16px;
}
</style>
