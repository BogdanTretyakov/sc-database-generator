<template>
  <client-only>
    <v-navigation-drawer
      v-model="showDetails"
      location="left"
      temporary
      disable-resize-watcher
      elevation="4"
      class="pa-2"
      width="350"
      disable-route-watcher
    >
      <div
        v-if="item"
        class="d-flex align-center justify-space-between panel-header pb-2 elevation-1 mb-2"
      >
        <v-chip density="compact" size="small" class="flex-shrink-0"
          >ID: {{ item.id }}</v-chip
        >
        <span v-html="item.name" class="text-h6 mx-2" />
        <v-btn density="comfortable" icon flat @click="setShowingItems(null)">
          <v-icon icon="$close" />
        </v-btn>
      </div>
      <div class="panel-details">
        <DetailsRenderer :item="item" />
      </div>
    </v-navigation-drawer>
  </client-only>
  <slot />
</template>

<script setup lang="ts">
import type { GetObjectFunction, IBaseObject } from '~/data/types';

interface Props {
  objFinder: GetObjectFunction;
}

const { objFinder } = defineProps<Props>();

const item = ref<IBaseObject | null>(null);
const hashValue = useHashValue();
const showDetails = computed({
  get: () => !!item.value,
  set: (val) => {
    if (val) return;
    item.value = null;
  },
});

onMounted(() => {
  if (!hashValue.value) return;
  (['bonus', 'spell', 'unit', 'hero', 'upgrade'] as const).forEach((type) => {
    if (!hashValue.value || item.value?.id === hashValue.value) return;
    const foundItem = objFinder(type, hashValue.value);
    if (foundItem) {
      item.value = foundItem;
    }
  });
});

watch(
  () => item.value,
  (value) => (hashValue.value = value?.id)
);

const setShowingItems = (val: null | IBaseObject) => {
  item.value = val;
};

provide('detailsSet', setShowingItems);
provide('objFinder', objFinder);
</script>

<style lang="css" scoped>
.panel-details ::v-deep(.v-expansion-panel-title) {
  padding: 16px 8px;
  min-height: auto;
}
.panel-details ::v-deep(.v-expansion-panel-text__wrapper) {
  padding: 8px 4px;
}
.panel-header {
  position: sticky;
  top: 0;
  background-color: rgb(var(--v-theme-surface));
  z-index: 6;
}
.v-navigation-drawer__scrim {
  position: fixed;
  opacity: 0.5;
}
</style>
