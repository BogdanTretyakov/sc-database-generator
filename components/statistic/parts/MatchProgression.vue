<template>
  <div class="match-progression mt-6 rounded">
    <div class="d-flex">
    <v-btn-toggle
      v-model="viewMode"
      color="primary"
      variant="outlined"
      density="compact"
      mandatory
      class="mx-auto"
    >
      <v-btn value="timeline" >Timeline</v-btn>
      <v-btn value="progression" >Progression</v-btn>
    </v-btn-toggle>
    </div>
    <MatchTimeline
      v-if="viewMode === 'timeline'"
      :races-data="racesData"
      :ultimates-data="ultimatesData"
      :players="players"
      :race-data="raceData"
    />
    <MatchEconomy
      v-if="viewMode === 'progression'"
      :players="players"
      :races-data="racesData"
    />
  </div>
</template>

<script setup lang="ts">
import { type MatchPlayerInfo } from '~/types/statistic';
import type {
  IRaceData,
  IRacePickerObject,
  IUltimatesData,
} from '~/data/types';
import MatchTimeline from './MatchTimeline.vue';
import MatchEconomy from './MatchEconomy.vue';

const props = defineProps<{
  racesData: Record<string, IRaceDataReturn<IRaceData>>;
  ultimatesData: IRaceDataReturn<IUltimatesData>;
  players: MatchPlayerInfo[];
  raceData: IRaceDataReturn<Record<string, IRacePickerObject[]>>;
}>();

const viewMode = useStorageValue<'timeline' | 'progression'>('match-progression-view-mode', 'timeline');

</script>

<style scoped>
.match-progression {
  width: 100%;
}
.gap-2 {
  gap: 8px;
}
</style>
