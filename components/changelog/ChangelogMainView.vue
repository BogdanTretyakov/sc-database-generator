<template>
  <template v-if="data.newRaces && data.newRaces.length">
    <CCard title="New races!" class="my-4">
      <div class="d-flex flex-wrap justify-center px-2">
        <v-btn
          v-for="item in data.newRaces"
          class="my-1 mx-2"
          variant="text"
          size="large"
          :to="{
            name: 'RaceIndex',
            params: { versionType: data.type, race: item.key },
          }"
        >
          <span v-html="item.name" />
        </v-btn>
      </div>
    </CCard>
  </template>
  <div
    v-for="(item, raceId, idx) in changes"
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
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';

interface Props {
  changelog: IDataFile<IChangelog>;
}

const { changelog } = defineProps<Props>();
const { data } = changelog;
// TODO: Выпилить
const changes = computed(() =>
  pickBy(
    mapValues(data.changes, (item) => {
      const result = omit(item, ['t1spell', 't2spell', 'buildings']);
      return Object.keys(result).length > 1 ? result : null;
    }),
    Boolean
  )
);

const getIcon = (id: string): IconBoundaries => {
  const [x, y, width, height] = changelog.icons[id] ?? [0, 0, 1, 1];
  return { x, y, width, height };
};
</script>

<style lang="css" scoped></style>
