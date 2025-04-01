<template>
  <ClientOnly>
    <v-navigation-drawer
      v-model="showMenu"
      location="left"
      temporary
      elevation="4"
    >
      <div class="fill-height d-flex flex-column">
        <v-list>
          <v-list-item
            v-for="(name, routeName) in MENU_ROUTES"
            :key="routeName"
            :to="{
              name: routeName,
              params: {
                versionType: versionType,
                version: $route.params.version,
              },
            }"
          >
            {{ name }}
          </v-list-item>
          <v-divider />
          <v-list-item
            :to="{
              name: 'CreditsPage',
            }"
          >
            Credits
          </v-list-item>
        </v-list>
        <div class="mt-auto py-2">
          <VersionSelector />
        </div>
      </div>
    </v-navigation-drawer>
  </ClientOnly>
</template>

<script setup lang="ts">
import { MENU_ROUTES } from '~/consts';
const versionType = useStorageValue('preferredVersion');
const showMenu = defineModel<boolean>();
</script>
