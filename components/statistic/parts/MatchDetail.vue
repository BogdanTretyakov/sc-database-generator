<template>
  <div class="match-detail pa-4">
    <!-- Meta information row -->
    <div class="metadata-row d-flex align-center pb-4 mb-4 border-b">
      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Version</div>
        <div class="text-body-1">{{ matchData.type.toLocaleUpperCase() }} {{ matchData.version }}</div>
      </div>
      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Date end</div>
        <div class="text-body-1">{{ formattedDate }}</div>
      </div>

      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Duration</div>
        <div class="text-body-1">{{ formattedDuration }}</div>
      </div>

      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Average Quantile</div>
        <div class="text-body-1">{{ matchData.quantile }}</div>
      </div>

      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Platform</div>
        <div class="text-body-1 d-flex align-center">
          {{ matchData.platform }}
          <v-btn
            v-if="externalMatchUrl"
            variant="text"
            :href="externalMatchUrl"
            target="_blank"
            density="compact"
            class="ml-2"
            icon
          >
            <v-icon size="small">{{ mdiOpenInNew }}</v-icon>
            <v-tooltip activator="parent" location="top">Open in {{ matchData.platform }}</v-tooltip>
          </v-btn>
        </div>
      </div>

      <div class="meta-item mr-6">
        <div class="text-caption text-medium-emphasis">Internal ID</div>
        <div class="text-body-1">{{ matchData.id }}</div>
      </div>

      <v-spacer />

      <div class="meta-item ml-auto" v-if="showLink">
        <v-btn
          variant="text"
          :to="{ name: 'MatchDetails', params: { platform: matchData.platform, id: matchData.platformId } }"
          target="_blank"
          density="compact"
          class="ml-2"
          icon
        >
          <v-icon size="small">{{ mdiOpenInNew }}</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Players columns row -->
    <v-row class="players-row">
      <v-col
        v-for="player in sortedPlayers"
        :key="player.id"
        cols="12"
        sm="3"
        md="3"
      >
        <v-card variant="outlined" class="h-100 player-card">
          <v-card-item>
            <template v-slot:title>
              <div class="d-flex align-center">
                <span class="mr-2 font-weight-bold">#{{ player.place }}</span>
                <span class="text-truncate" :title="player.name">{{ player.name }}</span>
              </div>
            </template>
            <template v-slot:subtitle>
              Quantile: {{ player.quantile }}
            </template>
          </v-card-item>

          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <!-- Race -->
              <div class="d-flex align-center mt-2">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Race:</span>

                <template v-if="getInitialRace(player) && getInitialRace(player) !== player.race">
                  <WarTooltip
                    :src="raceData.iconsSrc"
                    :coords="raceData.iconProps(getInitialRace(player)!)"
                    :description="getRaceName(getInitialRace(player)!)"
                    width="36"
                  />
                  <v-icon size="small" class="mx-1">{{ mdiArrowRight }}</v-icon>
                </template>

                <WarTooltip
                  v-if="racesData[player.race]"
                  :src="raceData.iconsSrc"
                  :coords="raceData.iconProps(player.race)"
                  :description="racesData[player.race].raceData.name"
                  width="36"
                />
              </div>

               <!-- Bonuses -->
              <div class="d-flex align-center mt-2" v-if="player.bonus && player.bonus.length">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Bonuses:</span>
                <div class="d-flex gap-1">
                  <WarTooltip
                    v-for="value in player.bonus"
                    :key="value"
                    :src="racesData[player.race]?.iconsSrc"
                    :coords="racesData[player.race]?.iconProps(value)"
                    :description="getBonusDescription(player.race, value)"
                    width="36"
                    class="mr-1"
                  />
                </div>
              </div>

              <!-- Banned Race -->
              <div class="d-flex align-center mt-2" v-if="getBannedRace(player)">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Banned:</span>
                <WarTooltip
                  :src="raceData.iconsSrc"
                  :coords="raceData.iconProps(getBannedRace(player)!)"
                  :description="getRaceName(getBannedRace(player)!)"
                  width="36"
                />
              </div>



              <!-- Ultimate -->
              <div class="d-flex align-center mt-2" v-if="player.ultimate">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Ultimate:</span>
                <WarTooltip
                  :src="ultimatesData.iconsSrc"
                  :coords="ultimatesData.iconProps(player.ultimate)"
                  :description="getUltimateName(player.ultimate)"
                  width="36"
                />
              </div>

              <!-- Aura -->
              <div class="d-flex align-center mt-2" v-if="player.aura">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Aura:</span>
                <div class="text-body-2">{{ player.aura }}</div>
              </div>

              <!-- Time Alive -->
              <div class="d-flex align-center mt-2">
                <span class="text-caption text-medium-emphasis mr-3 width-label">Time Alive:</span>
                <div class="text-body-2">{{ formatPlayerTimeAlive(player.timeAlive) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Match Progression -->
    <MatchProgression
      v-if="!isLoadingEvents"
      :players="sortedPlayers"
      :races-data="racesData"
      :ultimates-data="ultimatesData"
      :race-data="raceData"
    />

    <div v-else class="timeline-placeholder mt-8 pa-6 bg-surface-variant rounded d-flex align-center justify-center">
      <v-progress-circular indeterminate />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { mdiOpenInNew, mdiArrowRight } from '@mdi/js';
import type { IRacePickerObject, IUltimatesData } from '~/data/types';
import type { MatchInfo, MatchPlayerInfo } from '~/types/statistic';
import MatchProgression from './MatchProgression.vue';

const props = defineProps<{
  item: MatchInfo;
  versionType: string;
  version: string;
  showLink?: boolean;
}>();

const matchData = ref<MatchInfo>(props.item);
const isLoadingEvents = ref(false);

const loadFullMatchData = async () => {
  if (matchData.value.players.some((p) => !p.events)) {
    isLoadingEvents.value = true;
    try {
      const config = useRuntimeConfig();
      const data = await $fetch<MatchInfo>(
        `/match/get/internal/${matchData.value.id}`,
        {
          baseURL: config.public.backendUrl,
        }
      );
      if (data) {
        matchData.value = data;
      }
    } catch (e) {
      console.error('Failed to load full match data', e);
    } finally {
      isLoadingEvents.value = false;
    }
  }
};

watch(
  () => props.item,
  (newItem) => {
    matchData.value = newItem;
    loadFullMatchData();
  },
  { immediate: true }
);

// Fetch races data mappings
const raceData = await useRaceData<Record<string, IRacePickerObject[]>>(
  'races',
  props.versionType,
  props.version
);

const ultimatesData = await useRaceData<IUltimatesData>('ultimates', props.versionType, props.version);

const raceNames = computed(() => {
  const raceIds = matchData.value.players.map(({ race }) => race);
  return Object.values(raceData.raceData)
    .flat()
    .filter(({ id }) => raceIds.includes(id))
    .map(({ key }) => key);
});

const racesData = await useRacesData(raceNames.value, props.versionType, props.version);

const sortedPlayers = computed(() =>
  [...matchData.value.players].sort((a, b) => a.place - b.place)
);

const formattedDate = computed(() => new Date(matchData.value.endAt).toLocaleString());

const formattedDuration = computed(() =>
  formatMillisecondsToHuman(matchData.value.duration)
);

const externalMatchUrl = computed(() => {
  switch (matchData.value.platform) {
    case 'W3Champions':
      return `https://w3champions.com/match/${matchData.value.platformId}`;
    default:
      return '';
  }
});
const formatPlayerTimeAlive = (time: number) =>
  formatMillisecondsToHuman(time);

const getRaceName = (id: string) => {
  return Object.values(raceData.raceData).flat().find((r) => r.id === id)?.name || id;
};

const getBannedRace = (player: MatchPlayerInfo) => {
  if (!player.events) return null;
  const banEvent = player.events.find((e) => e.type === 'BAN_RACE');
  return banEvent ? banEvent.id : null;
};

const getBonusDescription = (race: string, id: string) => {
  const bonus = racesData[race]?.raceData.bonuses.find((b) => b.id === id);
  if (!bonus) return '';
  return bonus.name + '<br/>' + bonus.description;
}

const getInitialRace = (player: MatchPlayerInfo) => {
  if (!player.events) return null;
  const initEvent = player.events.find((e) => e.type === 'INITIAL_RACE');
  return initEvent ? initEvent.id : null;
};

const getUltimateName = (id: string) => {
  const item = ultimatesData.raceData.pickers.find((p) => p.id === id);
  return item?.name ?? ''
}
</script>

<style scoped>
.match-detail {
  width: 100%;
}

.width-label {
  min-width: 70px;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.player-card {
  transition: box-shadow 0.2s;
}

.player-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.timeline-placeholder {
  min-height: 200px;
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);
}
</style>
