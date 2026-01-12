<template>
  <div class="match-block px-2 py-1 my-2" @click="emit('click')">
    <div class="d-flex align-center py-2">
      <div>
        {{ formattedDate }}
      </div>

      <v-spacer />

      <div>{{ item.quantile }} quantile</div>

      <v-spacer />

      <div>
        {{ formattedDuration }}
      </div>

      <v-spacer />

      <v-btn
        variant="text"
        :href="externalMatchUrl"
        target="_blank"
        density="comfortable"
        @click.stop
      >
        <v-icon>{{ mdiOpenInNew }}</v-icon>
      </v-btn>
    </div>

    <div class="players-row d-flex">
      <div
        v-for="player in sortedPlayers"
        :key="player.id"
        class="player-inline d-flex align-center"
      >
        <span
          class="name text-truncate text-subtitle-2 flex-grow-0 flex-shrink-0"
        >
          {{ player.place }}.
          <span :title="player.name">{{ player.name }}</span>
        </span>

        <WarTooltip
          :src="racesIcons"
          :coords="raceIconsCoords(player.race)"
          :description="racesData[player.race].raceData.name"
          width="32"
          class="mx-2"
        />
        <template v-if="player.bonus.length">
          <v-divider vertical />
        </template>
        <WarTooltip
          v-for="value in player.bonus"
          :key="value"
          :src="racesData[player.race].iconsSrc"
          :coords="racesData[player.race].iconProps(value)"
          :description="
            racesData[player.race].raceData.bonuses.find(
              ({ id }) => id === value
            )?.name
          "
          width="32"
          class=""
        />
      </div>
    </div>
  </div>

  <v-divider />
</template>

<script setup lang="ts">
import { mdiOpenInNew } from '@mdi/js';
import type { IRacePickerObject } from '~/data/types';
import type { MatchInfo } from '~/types/statistic';

const { item, version, versionType } = defineProps<{
  item: MatchInfo;
  versionType: string;
  version: string;
}>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();

const {
  raceData,
  iconsSrc: racesIcons,
  iconProps: raceIconsCoords,
} = await useRaceData<Record<string, IRacePickerObject[]>>(
  'races',
  versionType,
  version
);

const raceNames = computed(() => {
  const raceIds = item.players.map(({ race }) => race);
  return Object.values(raceData)
    .flat()
    .filter(({ id }) => raceIds.includes(id))
    .map(({ key }) => key);
});

const racesData = await useRacesData(raceNames.value, versionType, version);

const sortedPlayers = computed(() =>
  [...item.players].sort((a, b) => a.place - b.place)
);

const formattedDate = computed(() => new Date(item.endAt).toLocaleString());

const formattedDuration = computed(() =>
  formatMillisecondsToHuman(item.duration)
);

const externalMatchUrl = computed(() => {
  switch (item.platform) {
    case 'W3Champions':
      return `https://w3champions.com/match/${item.platformId}`;
    default:
      return '';
  }
});
</script>

<style scoped>
.match-block {
  min-height: 0;
  cursor: pointer;
}

.players-row {
  gap: 8px 12px;
}

.player-inline {
  max-width: 25%;
  font-size: 13px;
  line-height: 1.1;
  flex: 0 0 25%;
}

.place {
  margin-right: 2px;
  opacity: 0.9;
}

.name {
  width: 40%;
}

.platform-link {
  text-decoration: none;
  font-size: 12px;
}
</style>
