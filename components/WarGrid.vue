<template>
  <div class="container" :style="containerStyles">
    <div
      v-for="(item, index) in sortedItems"
      :key="item?.id ?? index"
    >
      <slot v-if="item" :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends IBaseObject">
import type { StyleValue } from 'vue';
import type { IBaseObject } from '~/data/types';
import { hotkeys } from '~/utils/constants';


interface Props {
  items: MaybeRef<T[]>,
  size?: MaybeRef<number>,
}

const { items, size = 64 } = defineProps<Props>()

const sortedItems = computed(() => {
  const itemsCopy = toValue(items).slice();
  const output = Array<T|undefined>(hotkeys.length).fill(undefined);
  const unkeyed = Array<T>();
  while(itemsCopy.length) {
    const item = itemsCopy.shift()
    if (!item) continue
    if (!item.hotkey) {
      unkeyed.push(item)
      continue
    }
    let idx = hotkeys.indexOf(item.hotkey)
    if (idx < 0) {
      unkeyed.push(item)
      continue
    }
    while(!!output[idx]) {
      idx += 4
    }
    output[idx] = item
  }
  unkeyed.forEach(item => {
    const idx = output.findIndex(v => !v)
    if (idx < 0) {
      output.push(item)
    } else {
      output[idx] = item
    }
  })

  let rows = Math.ceil(output.length / 4)

  for (let row = 0; row < rows; row++) {
    const offset = row * 4;
    const idxArr = [0, 1, 2, 3].map(idx => idx + offset);
    if (idxArr.every(idx => !output[idx])) {
      --rows;
      --row;
      output.splice(idxArr[0], 4)
    }
  }

  return output
})

const containerStyles = computed<StyleValue>(() => ({
  gridTemplateColumns: `repeat(4, ${toValue(size)}px)`,
  gridTemplateRows: `repeat(auto-fill, ${toValue(size)}px)`
}))

defineSlots<{
  default(props: { item: T }): any
}>()
</script>
<style lang="css" scoped>
.container {
  display: grid;
  gap: 8px;
}
</style>
