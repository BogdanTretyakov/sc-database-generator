<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="float-button"
        :icon="mdiCog"
        color="primary"
        density="comfortable"
      >
      </v-btn>
    </template>
    <v-list density="comfortable">
      <v-list-item>
        <div text-subtitle-2>Icons size</div>
        <div class="d-flex justify-space-between mt-1">
          <v-btn
            icon
            density="compact"
            flat
            :disabled="iconSize <= 32"
            @click="iconSize -= 4"
            >-</v-btn
          >
          <div>{{ iconSize }}</div>
          <v-btn
            icon
            density="compact"
            flat
            :disabled="iconSize >= 96"
            @click="iconSize += 4"
            >+</v-btn
          >
        </div>
      </v-list-item>
      <v-list-item>
        <div class="d-flex align-center pr-2">
          <span class="mr-2 text-subtitle-2">Tooltips:</span>
          <v-switch
            true-value="false"
            false-value="true"
            v-model="tooltips"
            hide-details
            density="comfortable"
            color="primary"
          />
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { mdiCog } from '@mdi/js';
import { DEFAULT_ICON_SIZE } from '~/consts';

const tooltips = useStorageValue('tooltipsDisabled', 'false');
const iconSizeData = useStorageValue('iconSize', DEFAULT_ICON_SIZE);

const iconSize = computed({
  get() {
    return isNaN(Number(iconSizeData.value))
      ? +DEFAULT_ICON_SIZE
      : Number(iconSizeData.value);
  },
  set(value: number) {
    iconSizeData.value = String(value);
  },
});
</script>

<style lang="css" scoped>
.float-button {
  position: fixed;
  bottom: 12px;
  right: 12px;
}
</style>
