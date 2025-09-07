<template>
  <component
    :is="tagProps.is"
    :style="style"
    :src="tagProps.src"
    v-bind="attrs"
    class="icon"
    ref="image"
  />
</template>

<script setup lang="ts">
import { useFallbackImage } from '~/composables/useFallbackImage';

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
const attrs = useAttrs();
const imageRef = useTemplateRef<HTMLElement>('image');

const fallBackStyles = useFallbackImage({
  src,
  imageRef,
  coords,
  idx,
  width: attrs.width,
});

const tagProps = computed(() => {
  if (fallBackStyles.value) {
    return {
      is: 'div',
      style: fallBackStyles.value,
    };
  }

  const [pt, pr, pb, pl] = padding;
  const {
    x = 0,
    y = 0,
    width = 1,
    height = 1,
  } = Array.isArray(coords) ? coords[idx.value] ?? {} : coords ?? {};
  return {
    is: 'img',
    src: src,
    style: {
      'object-view-box': `xywh(${x + pl}px ${y + pt}px ${width - pr - pl}px ${
        height - pb - pt
      }px)`,
    },
  };
});

const style = computed(() => {
  const size = isNaN(Number(attrs.width))
    ? attrs.width
    : `${Number(attrs.width)}px`;
  return {
    width: size,
    height: size,
    ...tagProps.value.style,
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
