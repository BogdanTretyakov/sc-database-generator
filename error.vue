<template>
  <div />
</template>

<script setup lang="tsx">
import type { NuxtError } from '#app';
const route = useRoute();

const { error } = defineProps<{ error: NuxtError }>();

console.error(error);

if (error.statusCode === 404) {
  navigateTo({
    name: 'RaceSelection',
    params: { versionType: route.params.versionType },
  });
} else if (route.path !== '/') {
  navigateTo('/');
}
</script>
