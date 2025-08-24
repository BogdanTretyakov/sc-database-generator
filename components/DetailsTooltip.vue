<template>
  <WarTooltip :src="src" :coords="coords" :description="item.description">
    <template #tooltip>
      <DetailsTooltipBody :item="item" />
    </template>
  </WarTooltip>
</template>

<script setup lang="ts">
import type { IBaseObject } from '~/data/types';
import type { IconBoundaries } from './GameIcon.vue';

interface Props {
  item: IBaseObject;
  src: string;
  coords: IconBoundaries | IconBoundaries[];
}

const { item, src, coords } = defineProps<Props>();
</script>
