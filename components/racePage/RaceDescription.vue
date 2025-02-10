<template>
  <CCard title="" id="details" style="grid-row: span 3">
    <template #title>
      <h1 class="text-wrap text-h3" :style="{ color }" v-html="race.name" />
    </template>
    <div v-html="description" />
  </CCard>
</template>

<script setup lang="ts">
import type { IRaceData } from '~/data/types';

interface Props {
  race: IRaceData;
}
const { race } = defineProps<Props>();

const description = computed(() =>
  race.description
    .replace(
      new RegExp(String.raw`^\s*?<span[^>]*?>.*?${race.name}.*?<\/span>`, 'si'),
      ''
    )
    .replace(/\s+?(?:<br\s?\/?>)*/, '')
);
const color = computed(
  () =>
    (race.description.match(
      new RegExp(String.raw`#[a-zA-Z0-9]{6,8}(?=[^<]*?(?:${race.name}))`)
    ) ?? ['white'])[0]
);
</script>
