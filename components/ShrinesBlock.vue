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
        <div class="text-h5 my-2 d-none">
          <span class="text-purple">Ultimate</span>: 60:00
        </div>
      </div>
      <v-divider/>
      <v-text-field
        class="mt-4"
        v-model="shrineAbilitySearch"
        clearable
        label="Search ability"
        variant="outlined"
        @click:clear="shrineAbilitySearch = ''"
      />
    </CCard>
    <CCard
      v-for="hotkey in shrinesOrder"
      :key="hotkey"
      :title="shrinesTitles[hotkey] || shrinesTitles.Other"
      class="d-flex align-center flex-column"
    >
      <WarGrid :items="shrines[hotkey]" skip-hotkey v-slot="{ item }">
        <DetailsTooltip
          :item="item"
          :src="icons"
          :coords="iconProps(item.id, item.iconsCount)"
          :class="{
            depressed: !!shrineAbilitySearch && !item.name.toLocaleLowerCase().includes(shrineAbilitySearch.toLocaleLowerCase())
          }"
        />
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
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}

const { data, icons, iconProps } = defineProps<Props>();
const shrineAbilitySearch = ref('')

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

const shrinesTitles: Record<string, string> = {
  Q: 'Tier 1 [Q]',
  E: 'Tier 2 [E]',
  W: 'Tier 3 [W]',
  R: 'Ultimate [R]',
  Other: 'Unknown tier',
};

const shrinesOrder = computed(() =>
  ['Q', 'E', 'W', 'R', 'Other'].filter((key) => key in shrines.value)
);
</script>

<style lang="css" scoped>
.depressed {
  opacity: 0.2;
}
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
