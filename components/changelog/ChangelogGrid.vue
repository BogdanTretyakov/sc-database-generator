<template>
  <div class="container" :style="containerStyles">
    <div
      class="grid-item"
      v-for="(item, index) in sortedItems"
      :key="index"
      :class="{
        'empty-item': !item,
      }"
    >
      <template v-if="item">
        <div
          :class="[
            'iconsContainer',
            {
              sameIcon: isEqual(
                getIcon(item[1].iconId),
                getIcon(item[2].iconId)
              ),
            },
          ]"
          v-bind="props"
        >
          <div class="old changelogIcon">
            <GameIcon
              :src="iconsSrc"
              :coords="getIcon(item[1].iconId)"
              :width="iconSize"
            />
          </div>
          <div class="new changelogIcon">
            <GameIcon
              :src="iconsSrc"
              :coords="getIcon(item[2].iconId)"
              :width="iconSize"
            />
          </div>
        </div>
        <ClientOnly>
          <v-tooltip
            location="right top"
            activator="parent"
            max-width="700"
            min-width="500"
            close-on-content-click
            :transition="{
              component: VFadeTransition,
            }"
            :disabled="globalDisabled === 'true'"
            class="tooltip-opacity"
          >
            <v-row class="compare-body">
              <v-col cols="6" class="overflow-hidden">
                <div class="text-subtitle-1 text-center text-yellow">
                  Before
                </div>
                <DetailsTooltipBody :item="item[1]" />
                <div
                  v-if="item[1].description"
                  :class="['war-tooltip']"
                  v-html="item[1].description"
                />
              </v-col>
              <v-divider vertical inset />
              <v-col cols="6" class="overflow-hidden">
                <div class="text-subtitle-1 text-center text-yellow">After</div>
                <DetailsTooltipBody :item="item[2]" />
                <div
                  v-if="item[2].description"
                  :class="['war-tooltip']"
                  v-html="item[2].description"
                />
              </v-col>
            </v-row>
          </v-tooltip>
        </ClientOnly>
      </template>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="T extends ChangeTuple<WithIconId<IBaseObject>>"
>
import type { StyleValue } from 'vue';
import { DEFAULT_ICON_SIZE } from '~/consts';
import type { ChangeTuple, IBaseObject, WithIconId } from '~/data/types';
import { hotkeys, extraHotKeys } from '~/utils/constants';
import { VFadeTransition } from 'vuetify/components';
import type { IconBoundaries } from '../GameIcon.vue';
import isEqual from 'lodash/isEqual';

const hotkeysWithExtra = hotkeys.concat(extraHotKeys);

interface Props {
  items: MaybeRef<T[]>;
  getIcon(id: string): IconBoundaries;
  clearRows?: boolean;
}

const { items, clearRows = false } = defineProps<Props>();

const iconsSrc = inject('iconsSrc', ref(png));

const globalDisabled = useStorageValue('tooltipsDisabled', 'false');
const iconSizeData = useStorageValue('iconSize', DEFAULT_ICON_SIZE);
const iconSize = computed(() => {
  const numSize = Number(iconSizeData.value);
  return isNaN(numSize) ? +DEFAULT_ICON_SIZE : numSize;
});

const sortedItems = computed(() => {
  const itemsCopy = toValue(items).slice();
  const output = Array<T | undefined | null>(hotkeys.length).fill(undefined);

  const unkeyed = Array<T>();
  const competitors = Array<T>();
  while (itemsCopy.length) {
    const item = itemsCopy.shift();
    if (!item) continue;
    if (!item[1].hotkey) {
      unkeyed.push(item);
      continue;
    }
    let idx = hotkeysWithExtra.indexOf(item[1].hotkey.toLocaleUpperCase());
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
    let idx = hotkeysWithExtra.indexOf(item[1].hotkey ?? '') % 4;
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

  if (toValue(clearRows)) {
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
.iconsContainer {
  position: relative;
  height: 100%;
}

.iconsContainer .changelogIcon {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.changelogIcon {
  width: 100%;
  height: 100%;
}

.changelogIcon.new {
  z-index: 1;
}

.iconsContainer:not(.sameIcon) .old {
  animation: shrink 6s linear infinite both;
  border-right: 1px solid white;
  will-change: width;
}

.changelogIcon.old {
  z-index: 2;
}

.tooltip-opacity {
  opacity: 0.95;
}

@keyframes shrink {
  from {
    width: 90%;
  }
  50% {
    width: 10%;
  }
  to {
    width: 90%;
  }
}
</style>
<style lang="css">
.compare-body .war-tooltip ::target-text {
  opacity: 0.4;
}
.diff {
  position: relative;
}
.diff:after {
  content: '';
  position: absolute;
  left: -100vw;
  top: -1px;
  bottom: -1px;
  width: 200vw;
}
.diff.added:after {
  background: rgba(30, 113, 30, 0.4);
}
.diff.removed:after {
  background: rgba(149, 48, 48, 0.4);
}
</style>
