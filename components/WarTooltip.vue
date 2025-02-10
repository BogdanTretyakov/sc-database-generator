<template>
  <div v-bind="$attrs">
    <ClientOnly>
      <v-tooltip
        location="right top"
        activator="parent"
        max-width="350"
        close-on-content-click
        :transition="{
          component: VFadeTransition,
        }"
        :disabled="disabled && !!globalDisabled"
        class="tooltip-opacity"
      >
        <slot name="tooltip:body">
          <slot name="tooltip" />
          <div :class="descriptionClass" v-html="description" />
        </slot>
      </v-tooltip>
    </ClientOnly>
    <GameIcon :src="src" :coords="coords" :padding="padding" v-bind="$attrs" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { VFadeTransition } from 'vuetify/components';
import type { GameIconProps } from './GameIcon.vue';

interface Props extends GameIconProps {
  description: string;
  descriptionClass?: any;
  disabled?: boolean;
}

const { description, descriptionClass, coords, src, disabled, padding } =
  defineProps<Props>();

const globalDisabled = useStorageValue('tooltipsDisabled');

defineSlots<{
  default?(): any;
  tooltip?(): any;
  'tooltip:body'?(): any;
}>();
</script>

<style lang="css" scoped>
div {
  height: 100%;
}
.tooltip-opacity {
  opacity: 0.9;
}
</style>
