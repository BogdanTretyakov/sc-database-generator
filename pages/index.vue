<template>
  <CCard title="">
    <template #title>
      <h1>Survival Chaos Database</h1>
    </template>
    <p>
      Welcome to Survival chaos database site. Here you may look to races
      bonuses, upgrades and units
    </p>
    <p>Info available for Sur5ial and OZEdition version of the map</p>
  </CCard>
</template>
<script setup lang="ts">
import { defaultVersionType } from '~/data';

const versionType = useVersionType();
useHead({
  meta: [
    {
      'http-equiv': 'refresh',
      content: `0; url=/${
        versionType.value === defaultVersionType ? '' : `${versionType.value}/`
      }races`,
    },
  ],
});
useSeoMeta({
  title: 'Survival Chaos Database',
  titleTemplate: '',
  description:
    'Survival Chaos database site. All information about game aspects for advanced players',
  ogDescription:
    'Survival Chaos database site. All information about game aspects for advanced players',
});
</script>
