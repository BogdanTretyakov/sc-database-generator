<template>
  <div class="d-flex align-center attackIcons">
    <ClientOnly>
      <v-tooltip location="top">
        <template #activator="{ props }">
          <GameIcon
            :src="assets"
            :width="size"
            :coords="coords"
            :padding="[0, 8, 8, 0]"
            class="my-1"
            v-bind="props"
          />
        </template>
        <span v-html="text" />
      </v-tooltip>
    </ClientOnly>
    <div class="ml-1" v-if="value !== undefined">
      {{ value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IconBoundaries } from './GameIcon.vue';

interface Props {
  isDefend?: boolean;
  type?: string;
  value?: number | string;
  size?: number;
}

const [assets, assetsCoords] = useAssets();

const { isDefend, type, value, size = 24 } = defineProps<Props>();

const attackTypes: Record<string, string> = {
  siege: '<span style="color: #ffbfbf">Siege</span>',
  chaos: '<span style="color: #2fd43c">Chaos</span>',
  magic: '<span style="color: #2c67dc">Magic</span>',
  pierce: '<span style="color: #d4e143">Pierce</span>',
  hero: '<span style="color: #d4e143">Hero</span>',
  normal: '<span style="color: #51ded8">Normal</span>',
};

const defendTypes: Record<string, string> = {
  hero: 'Hero',
  divine: 'Divine',
  none: 'Unarmored',
  small: 'Light',
  large: 'Heavy',
  medium: 'Normal',
  flesh: 'Unarmored',
  fort: 'Fortified',
};

const text = computed(() => {
  const map = isDefend ? defendTypes : attackTypes;
  return map[type] ?? '';
});

const attackIcons: Record<string, IconBoundaries> = {
  siege: assetsCoords.siege,
  chaos: assetsCoords.chaos,
  magic: assetsCoords.magic,
  pierce: assetsCoords.pierce,
  normal: assetsCoords.normal,
  hero: assetsCoords.ahero,
};

const defendIcons: Record<string, IconBoundaries> = {
  divine: assetsCoords.divine,
  none: assetsCoords.unarmored,
  small: assetsCoords.light,
  hero: assetsCoords.dhero,
  large: assetsCoords.heavy,
  medium: assetsCoords.medium,
  flesh: assetsCoords.unarmored,
  fort: assetsCoords.fortified,
};

const coords = computed(() => {
  const map = isDefend ? defendIcons : attackIcons;
  return (
    map[type ?? (isDefend ? 'medium' : 'normal')] ?? {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    }
  );
});
</script>

<style lang="css" scoped>
.attackIcons {
  font-size: 0.8em;
}
</style>
