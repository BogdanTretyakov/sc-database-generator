<template>
  <v-app class="app">
    <AppHeaderMobile v-model="showMenu" />

    <v-app-bar
      density="compact"
      class="patched-bg"
      :floating="false"
      scroll-behavior="elevate"
    >
      <v-btn
        v-if="$route.params.versionType"
        @click="showMenu = !showMenu"
        :icon="mdiMenu"
        class="d-md-none"
      ></v-btn>
      <AppHeader />
    </v-app-bar>
    <v-main>
      <div class="overflow-y-auto fill-height scroll-offset position-relative">
        <v-container fluid>
          <v-fade-transition leave-absolute>
            <NuxtPage :page-key="(route) => route.path" />
          </v-fade-transition>
        </v-container>
        <v-overlay
          absolute
          :model-value="routeLoading"
          content-class="fill-height d-flex align-center justify-center flex-grow-1"
          class="loading-overlay"
          :close-on-content-click="false"
          :close-on-back="false"
          disabled
          :offset="[48, 0, 0, 0]"
          width="100%"
          scrim="black"
          location-strategy="connected"
        >
          <v-progress-circular size="100" width="6" indeterminate />
        </v-overlay>
      </div>
    </v-main>
    <FloatButtons />
  </v-app>
</template>

<script setup lang="ts">
import { mdiMenu } from '@mdi/js';

const nuxtApp = useNuxtApp();
const routeLoading = ref(false);
const showMenu = ref(false);

nuxtApp.hook('page:start', () => {
  routeLoading.value = true;
});
nuxtApp.hook('page:finish', () => {
  routeLoading.value = false;
});

useSeoMeta({
  keywords: 'survival chaos, ozgame, w3champions, warcraft 3, surv, sc',
  ogImageUrl: '/favicon.png',
});
</script>

<style scoped>
.app {
  background-image: url('/background.webp');
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
.loading-overlay {
  margin-top: 48px;
}
.loading-overlay :deep(.v-overlay__scrim) {
  top: 48px;
}
</style>
