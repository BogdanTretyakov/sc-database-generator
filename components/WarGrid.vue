<template>
  <div class="container" :style="containerStyles">
    <div
      class="grid-item"
      v-for="(item, index) in sortedItems"
      :key="item?.id ?? index"
      :class="{
        'empty-item': showEmpty && !item,
      }"
    >
      <template v-if="item">
        <DetailsWrapper v-if="!disableDetails" :item="item">
          <slot :item="item" />
        </DetailsWrapper>
        <slot v-else :item="item" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends IBaseObject">
import type { StyleValue } from 'vue';
import { DEFAULT_ICON_SIZE } from '~/consts';
import type { IBaseObject } from '~/data/types';
import { hotkeys } from '~/utils/constants';

interface Props {
  items: MaybeRef<T[]>;
  size?: MaybeRef<number>;
  skipHotkey?: boolean;
  restrictedSlots?: string[];
  disableDetails?: boolean;
  showEmpty?: boolean;
}

const {
  items,
  size = 1,
  skipHotkey = false,
  restrictedSlots = [],
  disableDetails = false,
  showEmpty = false,
} = defineProps<Props>();

const iconSizeData = useStorageValue('iconSize', DEFAULT_ICON_SIZE);
const iconSize = computed(() => {
  const numSize = Number(iconSizeData.value);
  return (isNaN(numSize) ? +DEFAULT_ICON_SIZE : numSize) * toValue(size);
});

const sortedItems = computed(() => {
  if (skipHotkey) {
    return toValue(items);
  }
  const itemsCopy = toValue(items).slice();
  const output = Array<T | undefined | null>(hotkeys.length).fill(undefined);

  restrictedSlots
    .map((s) => s.toLocaleUpperCase())
    .forEach((key) => {
      const idx = hotkeys.indexOf(key);
      if (idx >= 0) output[idx] = null;
    });

  const unkeyed = Array<T>();
  const competitors = Array<T>();
  while (itemsCopy.length) {
    const item = itemsCopy.shift();
    if (!item) continue;
    if (!item.hotkey) {
      unkeyed.push(item);
      continue;
    }
    let idx = hotkeys.indexOf(item.hotkey.toLocaleUpperCase());
    if (idx < 0) {
      unkeyed.push(item);
      continue;
    }
    if (output[idx] !== undefined) {
      competitors.push(item);
      continue;
    }
    output[idx] = item;
  }
  competitors.forEach((item) => {
    let idx = hotkeys.indexOf(item.hotkey) % 4;
    while (output[idx] !== undefined) {
      idx += 4;
    }
    output[idx] = item;
  });
  unkeyed.forEach((item) => {
    const idx = output.findIndex((v) => v === undefined);
    if (idx < 0) {
      output.push(item);
    } else {
      output[idx] = item;
    }
  });

  let rows = Math.ceil(output.length / 4);

  for (let row = 0; row < rows; row++) {
    const offset = row * 4;
    const idxArr = [0, 1, 2, 3].map((idx) => idx + offset);
    if (idxArr.every((idx) => !output[idx])) {
      --rows;
      --row;
      output.splice(idxArr[0], 4);
    }
  }

  return output;
});

const containerStyles = computed<StyleValue>(() => ({
  gridTemplateColumns: `repeat(4, ${toValue(iconSize.value)}px)`,
  gridTemplateRows: `repeat(auto-fill, ${toValue(iconSize.value)}px)`,
}));

defineSlots<{
  default(props: { item: T }): any;
}>();
</script>
<style lang="css" scoped>
.container {
  display: grid;
  gap: 8px;
}

.grid-item {
  aspect-ratio: 1;
}
.empty-item {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
