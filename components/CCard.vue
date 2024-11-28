<template>
  <v-card
    class="patched-bg position-relative"
    :height="fullHeight ? '100%' : undefined"
  >
    <v-card-title class="title">
      <slot name="title">
        <div v-html="title" />
      </slot>
    </v-card-title>

    <div class="append" v-if="appendHead">
      <slot name="appendHead" />
    </div>

    <div class="prepend" v-if="prependHead">
      <slot name="prependHead" />
    </div>

    <v-card-text v-bind="$attrs">
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

const { appendHead, prependHead } = defineSlots<{
  title(): any;
  default(): any;
  appendHead?(): any;
  prependHead?(): any;
}>();
</script>

<style lang="css" scoped>
.title {
  text-align: center;
  font-weight: bold;
  font-size: 1.6rem;
  color: #ffd428;
}
.append {
  position: absolute;
  right: 5px;
  top: 0px;
  height: 56px;
  display: flex;
  align-items: center;
  z-index: 2;
}
.prepend {
  position: absolute;
  left: 5px;
  top: 0px;
  height: 56px;
  display: flex;
  align-items: center;
  z-index: 2;
}
</style>
