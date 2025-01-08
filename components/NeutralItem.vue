<template>
  <div class="d-flex flex-column align-center my-4">
    <div class="text-h6">{{ neutral.name }}</div>
    <WarGrid :items="neutral.skills" skip-hotkey v-slot="{ item }" :size="48">
      <WarTooltip
        :description="item.description"
        :src="icons"
        :coords="iconProps(item.id)"
      >
        <template #tooltip>
          <div class="text-subtitle-1" v-html="item.name" />
        </template>
      </WarTooltip>
    </WarGrid>
  </div>
</template>

<script setup lang="ts">
import type { INeutralData } from '~/data/types';
import type { IconBoundaries } from './GameIcon.vue';

interface Props {
  neutral: INeutralData;
  icons: string;
  iconProps(id: string): IconBoundaries | IconBoundaries[];
}

const { neutral, icons, iconProps } = defineProps<Props>();
</script>
