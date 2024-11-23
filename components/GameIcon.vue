<template>
   <img :src="src" class="icon" :style="styles">
</template>

<script setup lang="ts">
import type { StyleValue } from 'vue';

export interface IconBoundaries {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameIconProps {
  src: string;
  coords: IconBoundaries|IconBoundaries[]
}

const { coords, src } = defineProps<GameIconProps>()
const idx = ref(0)

const styles = computed(() => {
  const { x, y, width, height } = Array.isArray(coords)
    ? coords[idx.value]
    : coords
  return {
    'object-view-box': `xywh(${x}px ${y}px ${width}px ${height}px)`,
  }
})

watchEffect(onCleanup => {
  if (!Array.isArray(coords)) return
  const destroy = timerEmitter(() => {
    idx.value = idx.value + 1 >= coords.length ? 0 : idx.value + 1
  })
  onCleanup(destroy)
})


</script>

<style scoped>
.icon {
  object-fit: cover;
  aspect-ratio: 1;
  width: 100%;
}
</style>