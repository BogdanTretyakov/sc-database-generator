<template>
  <v-app class="app">
    <v-app-bar
      density="compact"
      class="patched-bg"
      :floating="false"
      scroll-behavior="elevate"
    >
      <AppHeader />
    </v-app-bar>
    <v-main>
      <div class="overflow-y-scroll fill-height scroll-offset">
        <v-container fluid>
          <NuxtPage />
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { lastVersion, versions } from '~/data';

const [version] = [useRoute().params.version].flat()
const versionRef = ref(version ?? lastVersion)
provide('version', versionRef)
</script>

<style scoped>
  .app {
    background-image: url('~/assets/background.webp');
    background-position: center center;
    background-repeat: repeat;
    background-size: cover;
  }
  main {
    padding-top: 48px;
    max-height: 100vh;
    /* overflow: auto; */
  }
  .scroll-offset {
    scroll-padding-top: 48px;
  }
</style>
