<template>
  <v-card class="patched-bg" :height="fullHeight ? '100%' : undefined">
    <v-card-title class="title">
      <slot name="title">
        <div v-html="title" />
      </slot>
    </v-card-title>
    <v-card-text v-bind="attrs">
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  fullHeight?: boolean;
}

const { title, fullHeight = true } = defineProps<Props>();
const attrs = useAttrs();

defineSlots<{
  title(): any;
  default(): any;
}>();
</script>

<style lang="css" scoped>
.title {
  text-align: center;
  font-weight: bold;
  font-size: 1.6rem;
  color: #ffd428;
}
</style>
