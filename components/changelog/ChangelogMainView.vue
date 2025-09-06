<template>
  <div class="d-flex flex-wrap mb-2">
    <v-btn
      v-for="item in data.changes"
      class="mb-2 mr-3"
      size="small"
      variant="elevated"
      color=""
      :href="'#' + item.name"
    >
      {{ item.name }}
    </v-btn>
  </div>
  <div class="d-flex commonInfoWrapper pb-4">
    <CCard
      v-if="data.ultimates"
      title="Ultimates"
      class="d-flex flex-column align-center"
    >
      <ChangelogGrid :items="data.ultimates.pickers" :get-icon="getIcon" />
    </CCard>
    <CCard title="New races" v-if="data.newRaces?.length">
      <div class="d-flex flex-wrap justify-center px-2">
        <v-btn
          v-for="item in data.newRaces"
          class="my-1 mx-2"
          variant="text"
          size="x-large"
          :to="{
            name: 'RaceIndex',
            params: { versionType: data.type, race: item.key },
          }"
        >
          <template #prepend>
            <GameIcon
              :src="racesData?.iconsSrc"
              :coords="raceIcon(racesData?.icons[item.id])"
              width="48"
            />
          </template>
          <span>{{ item.name }}</span>
        </v-btn>
      </div>
    </CCard>
  </div>

  <div
    v-for="(item, raceId, idx) in data.changes"
    class="position-relative"
    :key="raceId"
  >
    <v-divider v-if="idx" class="my-4" />
    <ChangelogRace
      :changelog="item"
      :get-icon="getIcon"
      :race-key="raceId"
      :version-type="data.type"
      :version="data.to"
    />
  </div>
</template>

<script setup lang="ts">
import type { IChangelog, IDataFile } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import CCard from '../CCard.vue';
import ChangelogRace from './ChangelogRace.vue';

interface Props {
  changelog: IDataFile<IChangelog>;
}

const { changelog } = defineProps<Props>();
const { data } = changelog;

const racesData = inject<
  Ref<{
    races: Array<IBaseObject & { key: string }>;
    icons: Record<string, number[]>;
    iconsSrc: string;
  }>
>('racesData');

const raceIcon = ([x, y, width, height]: number[]) => {
  return { x, y, width, height };
};

const getIcon = (id: string): IconBoundaries => {
  const [x, y, width, height] = changelog.icons[id] ?? [0, 0, 1, 1];
  return { x, y, width, height };
};
</script>

<style lang="css" scoped>
.commonInfoWrapper {
  gap: 16px;
}
.commonInfoWrapper > * {
  flex: 270px 0 1;
}
</style>
