<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props }">
      <div class="float-button d-flex flex-column align-end">
        <v-btn
          v-bind="props"
          :icon="mdiCog"
          color="primary"
          density="comfortable"
        >
        </v-btn>
      </div>
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
import { mdiCog, mdiCash } from '@mdi/js';
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
  right: 22px;
  z-index: 100;
}

.donate-button {
  color: white;
  animation: shockwaveJump 1s ease-out infinite;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    animation: shockwave 1s 0.65s ease-out infinite;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 50%;
    animation: shockwave 1s 0.5s ease-out infinite;
  }
}

@keyframes shockwaveJump {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.13);
  }
  50% {
    transform: scale(0.98);
  }
  55% {
    transform: scale(1.07);
  }
  60% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shockwave {
  0% {
    transform: scale(1);
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.15), inset 0 0 1px rgba(0, 0, 0, 0.15);
  }
  95% {
    box-shadow: 0 0 50px rgba(0, 0, 0, 0), inset 0 0 30px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(2.25);
  }
}
</style>
