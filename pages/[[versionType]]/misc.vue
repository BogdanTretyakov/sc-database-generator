<template>
  <v-row class="misc-page">
    <v-col cols="12" sm="6" md="4">
      <CCard title="Damage types">
        <DamageTable :damage="damage" />
      </CCard>
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <CCard title="Units bounty">
        <BountyTable :bounty="bounty" />
      </CCard>
    </v-col>
    <v-col cols="12" sm="6" md="4">
      <CCard title="Triggers">
        <TriggerContent :type="versionType" :version="''" />
      </CCard>
    </v-col>
    <v-col cols="12">
      <CCard title="Neutral buildings">
        <div class="d-flex flex-wrap justify-space-between">
          <NeutralItem
            v-for="neutral in neutrals"
            :key="neutral.id"
            :neutral="neutral"
            :icons="iconsSrc"
            :icon-props="iconProps"
            class="mx-2"
          />
        </div>
      </CCard>
    </v-col>
    <v-col cols="12" v-if="!!shrines">
      <ShrinesBlock :data="shrines" :icons="iconsSrc" :icon-props="iconProps" />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import TriggerContent from '~/components/triggers/TriggerContent';
import type { IMiscData } from '~/data/types';

const route = useRoute();

const versionType = computed(() => {
  const type = [route.params.versionType].flat()[0];
  return type === 'oz' ? 'oz' : 'w3c';
});

const {
  iconProps,
  raceData: { damage, neutrals, shrines, bounty, commonBonuses },
  iconsSrc,
  version,
} = await useRaceData<IMiscData>('misc');

useSeoMeta({
  title: `Misc data v${version}`,
  description:
    'Additional information in Survival Chaos: damage types, units bounty, shrines',
  ogDescription:
    'Additional information in Survival Chaos: damage types, units bounty, shrines',
});
definePageMeta({
  name: 'MiscIndex',
});
</script>

<style lang="css" scoped>
.misc-page:deep(.v-table) {
  background-color: transparent;
}
</style>
