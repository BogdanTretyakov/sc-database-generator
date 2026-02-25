<template>
  <div class="full-height pb-16">
    <CCard title="" id="match-detail" class="mb-4">
      <template v-if="pending">
        <div class="d-flex align-center justify-center pa-8">
          <v-progress-circular indeterminate size="60" />
        </div>
      </template>
      <template v-else-if="error || !matchData">
        <div class="text-center pa-8">
          <v-icon size="64" color="warning" class="mb-4">{{ mdiAlertRhombus }}</v-icon>
          <h2 class="text-h5 mb-2">Match Not Found</h2>
          <p class="text-body-1 text-medium-emphasis">
            The requested match could not be found. It is possible that the match has not been processed by the server yet, or the ID is incorrect.
          </p>
          <v-btn class="mt-6" color="primary" variant="text" to="/matches">
            Back to Matches
          </v-btn>
        </div>
      </template>
      <template v-else>
        <MatchDetail
          :item="matchData"
          :versionType="matchData.type"
          :version="matchData.version"
        />
      </template>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import { mdiAlertRhombus } from '@mdi/js';
import type { MatchInfo } from '~/types/statistic';
import MatchDetail from '~/components/statistic/parts/MatchDetail.vue';

const route = useRoute();
const config = useRuntimeConfig();

const platform = route.params.platform as string;
const id = route.params.id as string;

const { data: matchData, pending, error } = useFetch<MatchInfo>(
  `/match/get/${platform}/${id}`,
  {
    baseURL: config.public.backendUrl,
  }
);

useSeoMeta({
  title: `Match ${id} details`,
  description: 'Survival Chaos match details',
});
</script>
