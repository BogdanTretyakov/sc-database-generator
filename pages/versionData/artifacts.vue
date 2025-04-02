<template>
  <div>
    <div class="text-center d-none">
      <h1 class="text-h2 font-bold title mb-6">Artifacts</h1>
    </div>
    <CCard title="">
      <div class="d-flex align-center justify-end">
        <v-checkbox
          label="Disable tooltips"
          true-value="true"
          false-value="false"
          v-model="disabledTooltips"
          class="mx-4"
        />
        <v-checkbox
          label="Always show path"
          true-value="true"
          false-value="false"
          v-model="showPath"
        />
      </div>
      <div class="container" :ref="containerRef">
        <div class="items-container" :style="styles">
          <template v-for="n in maxLevel">
            <div
              :class="[`level${maxLevel + 1 - n}`, 'text-h5', 'text-no-wrap']"
            >
              Lvl {{ n }}
            </div>
          </template>
          <div
            v-for="item in renderItems.concat(statsItems)"
            :class="[
              `level${maxLevel + 1 - item.level}`,
              'cursor-pointer',
              {
                depressed: activePath.length && !activePath.includes(item.id),
                selected: selected === item.id,
              },
            ]"
            :ref="itemRef(item.id)"
            @click="
              () => (selected = selected === item.id ? undefined : item.id)
            "
            @mouseenter="() => !selected && calcActivePath(item.id)"
            @mouseout="() => !selected && (activePath = [])"
          >
            <WarTooltip
              :src="iconsSrc"
              :description="item.description"
              :coords="iconProps(item.id)"
              :disabled="
                disabledTooltips === 'true' || globalTooltips === 'true'
              "
              :width="+iconSize * 0.75"
            >
              <template #tooltip>
                <div v-html="item.name" />
              </template>
            </WarTooltip>
          </div>
        </div>
        <div
          :class="[
            'path-container',
            { hidden: showPath !== 'true' && !activePath.length },
          ]"
        >
          <template
            v-for="(innerVariants, parentId) in artiData.combineMap"
            :key="`node-${parentId}`"
          >
            <div
              :ref="boundRef(parentId, 'connect', 'inner')"
              :data-debug="`${parentId}-connect-inner`"
              :class="{
                depressed: activePath.length && !activePath.includes(parentId),
                pathNode: true,
              }"
            />
            <template
              v-for="(childsArr, innerIdx) in innerVariants"
              :key="`node-${parentId}-${innerIdx}`"
            >
              <template v-for="innerId in childsArr">
                <div
                  :ref="boundRef(parentId, 'connect', innerId)"
                  :data-debug="`${parentId}-connect-${innerId}`"
                  :class="{
                    depressed:
                      activePath.length &&
                      ![parentId, innerId].every((id) =>
                        activePath.includes(id)
                      ),
                    pathNode: true,
                    optionalNode: innerIdx !== 0,
                  }"
                />
                <div
                  :ref="boundRef(parentId, 'child', innerId)"
                  :data-debug="`${parentId}-${innerId}`"
                  :class="{
                    depressed:
                      activePath.length &&
                      ![parentId, innerId].every((id) =>
                        activePath.includes(id)
                      ),
                    pathNode: true,
                    optionalNode: innerIdx !== 0,
                  }"
                />
              </template>
            </template>
          </template>
        </div>
      </div>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { IArtifactData, IArtifactObject } from '~/data/types';

const compare = new Intl.Collator('en').compare;

const showPath = useStorageValue('artiShowPath', 'false');
const disabledTooltips = useStorageValue('artiDisabledTooltips', 'false');
const globalTooltips = useStorageValue('tooltipsDisabled', 'false');

const {
  raceData: artiData,
  iconProps,
  iconsSrc,
  version,
} = await useRaceData<IArtifactData>('artifacts');
const iconSize = useStorageValue('iconSize');

const items = computed(() => artiData?.items ?? []);

const statsItems = computed(() => {
  const low = items.value
    .filter(({ level, id }) => level > 1 && !(id in artiData.combineMap))
    .map(({ id }) => id);
  const high = Object.entries(artiData.combineMap)
    .filter(([, value]) => value.flat().every((id) => low.includes(id)))
    .map(([id]) => id);
  return low
    .concat(high)
    .map((id) => items.value.find((item) => item.id === id))
    .filter(isNotNil);
});

const maxLevel = computed(() =>
  Math.max(...items.value.map(({ level }) => level), 0)
);

const maxSameLvl = computed(() =>
  Math.max(
    ...items.value.reduce(
      (acc, { level }) => {
        if (!acc[level]) {
          acc[level] = 0;
        }
        ++acc[level];
        return acc;
      },
      [0]
    )
  )
);

const { boundRef, containerRef, itemRef } = useArtifactsBounds({
  colorsCount: maxSameLvl,
  combineMap: artiData.combineMap,
  stroke: 6,
});

const renderItems = computed(() => {
  const copy = items.value
    .filter(({ id }) => !statsItems.value.some((item) => item.id === id))
    .sort(({ level: l1, hotkey: h1 }, { level: l2, hotkey: h2 }) => {
      if (l2 !== l1) return l2 - l1;
      return compare(h1, h2);
    });
  const output = Array<IArtifactObject[]>();
  do {
    const endLevelIdx = copy.findIndex(({ level }, idx, arr) => {
      return arr[idx + 1]?.level !== level;
    });
    if (endLevelIdx < 0) continue;
    const currLevelArr = copy.splice(0, endLevelIdx + 1);
    const lastLevelArr = output[output.length - 1];
    if (!lastLevelArr) {
      output.push(currLevelArr);
      continue;
    }
    currLevelArr.sort(({ id }) => {
      if (statsItems.value.some((item) => item?.id === id)) return 1;
      return artiData.combineMap[lastLevelArr[0].id][0].includes(id) ? -1 : 0;
    });
    output.push(currLevelArr);
  } while (copy.length);

  return output.flat();
});

const styles = computed<CSSProperties>(() => {
  return {
    gridTemplateColumns: `repeat(${maxSameLvl.value + 1}, 1fr)`,
    gridTemplateRows: `repeat(${maxLevel.value}, 1fr)`,
  };
});

const selected = useHashValue();

const activePath = ref(Array<string>());

const calcActivePath = (calcId: string) => {
  const output = Array<string>();
  const addNode = (id: string, ignoreParent: boolean, ignoreChild: boolean) => {
    if (output.includes(id)) return;
    output.push(id);
    const child = artiData.combineMap[id];
    if (child && !ignoreChild) {
      child.forEach((iArr) => iArr.forEach((i) => addNode(i, true, false)));
    }
    if (!ignoreParent) {
      Object.entries(artiData.combineMap)
        .filter(([, values]) => values.some((value) => value.includes(id)))
        .forEach(([key]) => addNode(key, false, true));
    }
  };
  addNode(calcId, false, false);
  activePath.value = output;
};

watch(selected, (val) => {
  if (val) calcActivePath(val);
});

onNuxtReady(() => {
  if (selected.value) calcActivePath(selected.value);
});

useSeoMeta({
  title: `Artifacts v${version}`,
  description: 'Artifacts of Survival Chaos: all heroes combined artifacts',
});

definePageMeta({
  name: 'ArtifactsIndex',
});
</script>

<style lang="css" scoped>
.container {
  position: relative;
}
.items-container {
  display: grid;
  gap: 6vw 16px;
}
.items-container > * {
  max-width: 48px;
  aspect-ratio: 1;
  margin: auto;
  transition: 150ms linear opacity;
}
.path-container div {
  z-index: 0;
  position: absolute;
  background: black;
  transition: 150ms linear opacity;
}
.path-container.hidden div {
  opacity: 0;
}

.path-container .depressed {
  opacity: 0;
}
.level1 {
  grid-row: 1;
}
.level2 {
  grid-row: 2;
}
.level3 {
  grid-row: 3;
}
.level4 {
  grid-row: 4;
}
.level5 {
  grid-row: 5;
}
.level6 {
  grid-row: 6;
}
.depressed {
  opacity: 0.25;
}
.selected {
  outline: 4px solid #ffd428;
}
.pathNode {
  border-style: solid;
}
.pathNode.optionalNode {
  border-style: dashed;
}
</style>
