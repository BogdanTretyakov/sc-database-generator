<template>
  <div>
    <CCard title="" class="py-4">
      <template #title>
        <h1>Survival Chaos Wiki / Database</h1>
      </template>
      <p class="text-body-1 text-center">Welcome to Survival Chaos wiki</p>
      <p class="text-body-1 text-center">
        All data and images are parsed from map. There may be mistakes
      </p>
      <p class="text-h3 text-center">Select version you playing</p>
      <v-row class="my-2">
        <v-col cols="12" sm="6" class="py-4">
          <div class="select-version">
            <h4 class="text-h5 font-weight-bold">Original Game</h4>
            <p>
              Original version of the map made by
              <span class="text-purple">Su5ial</span>
            </p>
            <NuxtLink
              :to="{ name: 'RaceSelection', params: { versionType: 'og' } }"
              >Original</NuxtLink
            >
          </div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="select-version">
            <h4 class="text-h5 font-weight-bold">Reborn</h4>
            <p>
              Custom ballance and races made by
              <span class="text-green">Stvel</span>
            </p>
            <NuxtLink
              :to="{ name: 'RaceSelection', params: { versionType: 'oz' } }"
              >Reborn</NuxtLink
            >
          </div>
        </v-col>
      </v-row>
      <p class="text-subtitle-1 text-center">
        You always may change version at the end of site menu
      </p>
    </CCard>
  </div>
</template>
<script setup lang="ts">
import { dataFiles } from '~/data';
const savedPrefVersion = useStorageValue('preferredVersion');

onBeforeRouteLeave((to, from, next) => {
  const [versionType] = [to.params.versionType].flat();
  if (!versionType) return next();
  savedPrefVersion.value = versionType;
  next();
});

onNuxtReady(() => {
  const versionType = storage.get('preferredVersion');
  if (!versionType || !(versionType in dataFiles)) return;
  navigateTo({
    name: 'RaceSelection',
    params: {
      versionType,
    },
  });
});

definePageMeta({
  name: 'Home',
});

useSeoMeta({
  title: 'Survival Chaos Wiki / Database',
  titleTemplate: '',
  ogTitle: 'Survival Chaos Wiki / Database',
  description:
    'Survival Chaos wiki. All information about game aspects for advanced players',
  ogDescription:
    'Survival Chaos wiki. All information about game aspects for advanced players',
  ogImage: '/favicon.png',
});
</script>

<style lang="css" scoped>
.select-version {
  position: relative;
  max-width: 350px;
  margin: 0 auto;
  border-radius: 10px;
  border: 1px solid gold;
  padding: 4px 8px;
  text-align: center;
  background: #3d3f1e;
}
.select-version a {
  color: transparent;
  z-index: 4;
  position: absolute;
  inset: 0;
}
</style>
