<template v-if="isShow">
  <div class="text-subtitle-1">Requires:</div>
  <template v-for="(value, id) in requires">
    <div v-if="id in requiresNames" class="require-string">
      {{ requiresNames[id] }} (Lv{{ value }})
    </div>
  </template>
  <br />
</template>

<script setup lang="ts">
interface Props {
  requiresNames: Record<string, string>;
  requires: Record<string, number>;
}

const { requires, requiresNames } = defineProps<Props>();

const isShow = computed(() => !!Object.keys(requires).length);
</script>

<style lang="css" scoped>
.require-string {
  color: #ffd428;
}
</style>
