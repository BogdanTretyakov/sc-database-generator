<template>
  <client-only>
    <v-tooltip location="top">
      <template #activator="{ props }">
        <v-btn
          :href="link"
          v-bind="props"
          variant="plain"
          rel="nofollow"
          target="_blank"
        >
          <v-icon v-if="typeof icon === 'string'" :icon="icon" />
          <font-awesome-icon v-else :icon="icon" />
        </v-btn>
      </template>
      <span><slot /></span>
    </v-tooltip>
  </client-only>
</template>

<script setup lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface Props {
  icon: string | IconDefinition;
  link: string;
}

const { icon, link } = defineProps<Props>();
</script>
