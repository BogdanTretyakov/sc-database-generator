<template>
  <div class="match-economy rounded">
    <!-- Time Slider -->
    <div class="mb-6 pa-4">
      <div class="d-flex align-center gap-4">
        <v-slider
          v-model="timeSlider"
          :max="maxTimeMinutes"
          :min="0"
          :step="1"
          hide-details
          thumb-label="always"
          color="primary"
          track-color="surface-variant"
          class="mt-4"
        >
          <template v-slot:thumb-label="{ modelValue }">
            {{ modelValue }}:00
          </template>
        </v-slider>
      </div>
    </div>

    <!-- Players columns row -->
    <v-row class="players-row">
      <v-col
        v-for="player in players"
        :key="player.id"
        cols="12"
        sm="3"
        md="3"
      >
        <MatchEconomyColumn
          :player="player"
          :race-data="racesData[player.race].raceData"
          :race-icons-src="racesData[player.race].iconsSrc"
          :icon-props="racesData[player.race].iconProps"
          :economy="playersEconomy[player.id]"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { IRaceData } from '~/data/types';
import type { MatchPlayerInfo } from '~/types/statistic';
import {
  calculatePlayerEconomy,
  mapPlayerEventsToTimeline,
} from '~/utils/timelineHelpers';
import MatchEconomyColumn from './MatchEconomyColumn.vue';

const props = defineProps<{
  racesData: Record<string, IRaceDataReturn<IRaceData>>;
  players: MatchPlayerInfo[];
}>();

// Map all events without filters so we can calculate full economy
const allEvents = computed(() => {
  return mapPlayerEventsToTimeline(
    props.players,
    props.racesData,
    [
      'UNIT_BUY',
      'HERO_BUY',
      'BASE_UPGRADE',
      'FORT_UPGRADE',
      'TOWER_UPGRADE',
      'CANCEL_UPGRADE',
    ] // We include every event type that matters for economy
  );
});

const maxTimeMinutes = computed(() => {
  if (allEvents.value.length === 0) return 0;
  const lastEvent = allEvents.value[allEvents.value.length - 1];
  return Math.ceil(lastEvent.time / 60000);
});

const timeSlider = ref(0);

// Set default time slider to the max time
setTimeout(() => {
  timeSlider.value = maxTimeMinutes.value;
}, 0);

// Calculate economy for each player based on current slider value
const playersEconomy = computed(() => {
  const result: Record<number, ReturnType<typeof calculatePlayerEconomy>> = {};
  const targetTimeMs = timeSlider.value * 60000;

  props.players.forEach((p) => {
    // Filter events only for this player
    const pEvents = allEvents.value.filter((e) => e.playerId === p.id);
    result[p.id] = calculatePlayerEconomy(
      pEvents,
      props.racesData[p.race].raceData,
      targetTimeMs
    );
  });

  return result;
});
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
