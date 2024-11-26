<template>
  <img v-bind="$attrs" :src="src" class="icon" :style="styles" />
</template>

<script setup lang="ts">
export interface IconBoundaries {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameIconProps {
  src: string;
  coords: IconBoundaries | IconBoundaries[];
  padding?: [top: number, right: number, bottom: number, left: number];
}

const { coords, src, padding = [0, 0, 0, 0] } = defineProps<GameIconProps>();
const idx = ref(0);

const styles = computed(() => {
  const [pt, pr, pb, pl] = padding;
  const {
    x = 0,
    y = 0,
    width = 1,
    height = 1,
  } = Array.isArray(coords) ? coords[idx.value] ?? {} : coords ?? {};
  return {
    'object-view-box': `xywh(${x + pl}px ${y + pt}px ${width - pr - pl}px ${
      height - pb - pt
    }px)`,
  };
});

watchEffect((onCleanup) => {
  if (!Array.isArray(coords)) return;
  const destroy = timerEmitter(() => {
    idx.value = idx.value + 1 >= coords.length ? 0 : idx.value + 1;
  });
  onCleanup(destroy);
});
</script>

<style scoped>
.icon {
  object-fit: cover;
  aspect-ratio: 1;
}
.icon:not([width]) {
  width: 100%;
}
</style>
