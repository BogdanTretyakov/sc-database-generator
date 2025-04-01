<template>
  <div class="d-flex">
    <v-btn
      variant="text"
      to="/"
      v-if="!versionType"
      density="comfortable"
      class="mx-1"
    >
      Home
    </v-btn>
    <template v-else>
      <v-btn
        v-for="(text, name) in routes"
        :key="name"
        variant="text"
        :to="{
          name,
          params: {
            versionType,
            version: $route.params.version,
          },
        }"
        density="comfortable"
        class="mx-1"
      >
        {{ text }}
      </v-btn>
    </template>
  </div>
  <v-spacer />
  <v-btn
    variant="text"
    density="comfortable"
    class="mx-1"
    :to="{ name: 'CreditsPage' }"
  >
    Credits
  </v-btn>
  <div v-if="$route.params.versionType">
    <VersionSelector />
  </div>
</template>

<script setup lang="ts">
const versionType = useStorageValue('preferredVersion', 'og');

const routes = {
  RaceSelection: 'Races',
  ArtifactsIndex: 'Artifacts',
  UltimatesIndex: 'Ultimates',
  MiscIndex: 'Misc',
};
</script>
