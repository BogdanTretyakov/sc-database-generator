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
        :disabled="disabled || globalDisabled === 'true'"
        class="tooltip-opacity"
      >
        <slot name="tooltip:body">
          <slot name="tooltip"></slot>
          <div
            v-if="description"
            :class="[descriptionClass, 'war-tooltip']"
            v-html="description"
          />
          <slot name="postfix" />
        </slot>
      </v-tooltip>
    </ClientOnly>
    <GameIcon
      :src="src"
      :coords="coords"
      :padding="padding"
      width="100%"
      v-bind="$attrs"
    />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { VFadeTransition } from 'vuetify/components';
import type { GameIconProps } from './GameIcon.vue';

interface Props extends GameIconProps {
  description?: string;
  descriptionClass?: any;
  disabled?: boolean;
}

const { description, descriptionClass, coords, src, disabled, padding } =
  defineProps<Props>();

const globalDisabled = useStorageValue('tooltipsDisabled', 'false');

defineSlots<{
  default?(): any;
  tooltip?(): any;
  postfix(): any;
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
.war-tooltip::v-deep(hr) {
  opacity: 0.6;
  margin: 4px 0;
}
</style>
