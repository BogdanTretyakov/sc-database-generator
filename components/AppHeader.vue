<template>
  <div class="d-none d-md-flex align-center flex-grow-1">
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
          v-for="(text, name) in MENU_ROUTES"
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
      v-if="!!statsMeta"
      variant="text"
      density="comfortable"
      class="mx-1"
      to="/matches"
    >
      Matches
    </v-btn>
    <v-badge color="warning" dot :model-value="statsMeta?.hasPatches ?? false">
      <v-btn
        v-if="!!statsMeta"
        variant="text"
        density="comfortable"
        class="mx-1"
        :to="{ name: 'Statistic' }"
      >
        Statistic
      </v-btn>
    </v-badge>

    <v-btn
      variant="text"
      density="comfortable"
      class="mx-1"
      :to="{ name: 'Changelog' }"
    >
      Changelogs
    </v-btn>
    <v-btn
      variant="text"
      density="comfortable"
      class="mx-1"
      :to="{ name: 'CreditsPage' }"
    >
      Contacts
    </v-btn>
    <div v-if="$route.params.versionType">
      <VersionSelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MENU_ROUTES } from '~/consts';

const statsMeta = await useStatisticMeta();

const versionType = useStorageValue('preferredVersion', 'og');
</script>
