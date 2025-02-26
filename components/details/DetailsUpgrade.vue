<template>
  <div />
</template>

<script setup lang="ts">
import type { IUpgradeObject } from '~/data/types';

interface Props {
  item: IUpgradeObject;
}

const { item } = defineProps<Props>();
</script>
