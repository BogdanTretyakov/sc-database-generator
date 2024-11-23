<template>
  <div v-bind="$attrs">
    <ClientOnly>
      <v-tooltip location="right top" activator="parent" width="300">
        <slot name="tooltip:body">
          <slot name="tooltip" />
          <div :class="descriptionClass" v-html="description" />
        </slot>
      </v-tooltip>
    </ClientOnly>
    <GameIcon :src="src" :coords="coords" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { GameIconProps } from './GameIcon.vue';

interface Props extends GameIconProps {
  description: string;
  descriptionClass?: any
}

const { description, descriptionClass, coords, src } = defineProps<Props>()

defineSlots<{
  default?(): any,
  tooltip?(): any,
  'tooltip:body'?(): any
}>()

</script>