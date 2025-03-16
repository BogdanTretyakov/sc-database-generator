<template>
  <div />
</template>

<script setup lang="ts">
import type { ISpellObject } from '~/data/types';

interface Props {
  item: ISpellObject;
}

const { item } = defineProps<Props>();
</script>
