<template>
  <div class="match-progression mt-8 pa-2 rounded">
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="text-h6">Match Progression Analytics</div>

      <!-- View mode switch -->
      <v-btn-toggle
        v-model="viewMode"
        color="primary"
        variant="outlined"
        density="compact"
        mandatory
      >
        <v-btn value="combined">Combined</v-btn>
        <v-btn value="separate">Separate</v-btn>
      </v-btn-toggle>
    </div>

    <!-- Event type filters (Legend) -->
    <div class="d-flex flex-wrap gap-2 mb-6">
      <v-chip
        v-for="row in ROW_FILTERS"
        :key="row.id"
        :color="activeFilters.includes(row.id) ? row.color : 'surface'"
        variant="flat"
        @click="toggleFilter(row.id)"
        class="cursor-pointer"
        density="comfortable"
      >
        <v-icon start size="small">{{ row.icon }}</v-icon>
        {{ row.label }}
      </v-chip>
    </div>

    <!-- Timeline Grid -->
    <div class="timeline-container mt-4">
      <div class="timeline-scroll">
        <table class="timeline-table">
          <thead>
            <tr>
              <th class="sticky-left header-cell bg-surface">Time</th>
              <th v-for="minute in totalMinutes" :key="`header-min-${minute}`" class="time-header-cell bg-surface text-center">
                {{ minute - 1 }}:00
              </th>
            </tr>
          </thead>

          <template v-for="group in displayGroups" :key="group.id">
            <!-- Player Row Label (For Separate View) -->
            <tr v-if="viewMode === 'separate'" class="player-header-row">
              <td class="player-header-cell" :colspan="totalMinutes + 1">
                <div class="player-name-sticky text-primary font-weight-bold">
                  {{ group.name }}
                </div>
              </td>
            </tr>

            <template v-for="row in ROW_FILTERS" :key="row.id">
              <tr v-if="activeFilters.includes(row.id)">
                <td class="sticky-left row-label-cell bg-surface">
                  <div class="d-flex align-center gap-2">
                    <span class="text-caption font-weight-medium">{{ row.label }}</span>
                  </div>
                </td>
                <td v-for="minute in totalMinutes" :key="`cell-${group.id}-${row.id}-${minute}`" class="bucket-cell">
                  <div class="bucket-events">
                    <div
                    v-for="(event, idx) in getBucketEvents(group.id, minute - 1, row.eventTypes)"
                  :key="`${event.id}-${event.time}-${idx}`"
                      class="event-icon-wrapper"
                      :class="{ 'small-icon': event.type === 'UNIT_BUY' }"
                      :style="{ borderColor: getEventColor(event) }"
                    >
                        <WarTooltip
                          :src="getIconSrc(event)"
                          :coords="getIconCoords(event)"
                          :description="getEventTooltip(event)"
                          :width="event.type === 'UNIT_BUY' ? '24' : '36'"
                        />
                        <span v-if="event.level > 1" class="event-level-badge">{{ event.level }}</span>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </table>
      </div>

      <div v-if="mappedTimelineEvents.length === 0" class="text-center text-medium-emphasis my-8">
        No progression events found for this match based on current filters.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  mdiSwordCross,
  mdiHomeLightningBolt,
  mdiShieldHome,
  mdiCastle,
  mdiAccountArrowRight
} from '@mdi/js';
import type { MatchPlayerInfo, TimelineEvent, PlayerEvents } from '~/types/statistic';
import { mapPlayerEventsToTimeline } from '~/utils/timelineHelpers';
import type {  IBaseObject, IRaceData, IUltimatesData } from '~/data/types';

const props = defineProps<{
  racesData: Record<string, IRaceDataReturn<IRaceData>>;
  ultimatesData: IRaceDataReturn<IUltimatesData>;
  players: MatchPlayerInfo[];
}>();

// Row configuration maps filters directly to rows
const ROW_FILTERS = [
  { id: 'units', label: 'Units', eventTypes: ['UNIT_BUY'], color: 'warning', icon: mdiAccountArrowRight },
  { id: 'heroes', label: 'Heroes', eventTypes: ['HERO_BUY'], color: 'error', icon: mdiSwordCross },
  { id: 'upgrades', label: 'Upgrades', eventTypes: ['BASE_UPGRADE'], color: 'info', icon: mdiShieldHome },
  { id: 'buildings_ults', label: 'Buildings & Ultimates', eventTypes: ['FORT_UPGRADE', 'USE_ULTIMATE'], color: 'success', icon: mdiCastle },
];

const defaultFiltersStr = ROW_FILTERS.map(e => e.id).join(',');

// useStorageValue is imported automatically by Nuxt composables
const savedFiltersStr = useStorageValue('matchProgressionFilters', defaultFiltersStr);
const viewMode = useStorageValue<'separate'|'combined'>('matchProgressionViewMode', 'separate');

// Active filters array computation
const activeFilters = computed({
  get: () => savedFiltersStr.value ? savedFiltersStr.value.split(',') : [],
  set: (val: string[]) => {
    savedFiltersStr.value = val.join(',');
  }
});

const toggleFilter = (id: string) => {
  const current = [...activeFilters.value];
  const index = current.indexOf(id);
  if (index === -1) {
    current.push(id);
  } else {
    current.splice(index, 1);
  }
  activeFilters.value = current;
};

const mappedTimelineEvents = computed(() => {
  const mappedActiveTypes: string[] = [];
  ROW_FILTERS.forEach(r => {
    if (activeFilters.value.includes(r.id)) {
      mappedActiveTypes.push(...r.eventTypes);
    }
  });
  return mapPlayerEventsToTimeline(props.players, props.racesData, mappedActiveTypes);
});

const itemsMap = computed(() =>
  Object.fromEntries(Object.values(props.racesData)
  .flatMap(({ raceData: { heroes, units, baseUpgrades, towerUpgrades, magic, bonuses, buildings } }) => [
    heroes,
    ...Object.values(units),
    ...Object.values(baseUpgrades),
    towerUpgrades,
    magic,
    bonuses,
    ...bonuses.flatMap(({ units, upgrades }) => [...(units ?? []), ...(upgrades ?? [])]),
    ...Object.values(buildings)
  ]).flat().map(item => [item.id, item] as const))
)

// UI Logic

// Predefined palette for players in Combined mode
const PLAYER_COLORS = [
  '#f44336', '#2196f3', '#4caf50', '#ff9800',
  '#9c27b0', '#00bcd4', '#795548', '#607d8b'
];

const displayGroups = computed(() => {
  if (viewMode.value === 'combined') {
    return [{ id: 'combined', name: 'All Players' }];
  }
  return props.players.map(p => ({ id: String(p.id), name: p.name }));
});

const totalMinutes = computed(() => {
  let maxTimeMs = 0;
  mappedTimelineEvents.value.forEach(e => {
    if (e.time > maxTimeMs) maxTimeMs = e.time;
  });
  return Math.max(1, Math.ceil(maxTimeMs / 60000));
});

// Cache events by groupId, minute, and mappedType for fast access during render
const bucketedEvents = computed(() => {
  const buckets: Record<string, Record<number, Record<string, TimelineEvent[]>>> = {};

  const initBucket = (gId: string, min: number, type: string) => {
    if (!buckets[gId]) buckets[gId] = {};
    if (!buckets[gId][min]) buckets[gId][min] = {};
    if (!buckets[gId][min][type]) buckets[gId][min][type] = [];
  };

  mappedTimelineEvents.value.forEach(event => {
    const min = Math.floor(event.time / 60000);
    // Find the mapping category for the event.type
    let mappedType = event.type as string;
    if (mappedType.startsWith('UP_FORT') || mappedType.startsWith('UP_BARRACK')) mappedType = 'FORT_UPGRADE';
    if (mappedType === 'TOWER_UPGRADE') mappedType = 'BASE_UPGRADE';

    // Separate mode
    const pId = String(event.playerId);
    initBucket(pId, min, mappedType);
    buckets[pId][min][mappedType].push(event);

    // Combined mode
    initBucket('combined', min, mappedType);
    buckets['combined'][min][mappedType].push(event);
  });

  return buckets;
});

const getBucketEvents = (groupId: string, minute: number, targetTypes: string[]) => {
  let events: TimelineEvent[] = [];
  const minBucket = bucketedEvents.value[groupId]?.[minute];
  if (minBucket) {
    targetTypes.forEach(t => {
      if (minBucket[t]) events.push(...minBucket[t]);
    });
  }
  return events.sort((a, b) => a.time - b.time);
};

const getIconSrc = (event: TimelineEvent) => {
  const player = props.players.find(p => p.id === event.playerId);
  if (!player) return '';

  if (event.type === 'USE_ULTIMATE') {
    return props.ultimatesData.iconsSrc;
  }

  if (['UNIT_BUY', 'HERO_BUY', 'BASE_UPGRADE', 'FORT_UPGRADE', 'TOWER_UPGRADE'].includes(event.type) || event.type.startsWith('UP_')) {
    const pRaceData = props.racesData[player.race];
    return pRaceData?.iconsSrc || '';
  }

  return '';
};

const getItemMaxLvl = (item: IBaseObject) => {
  if (isUpgradeObject(item)) return item.cost.length;
  return 1;
}

const getIconCoords = (event: TimelineEvent) => {
  const player = props.players.find(p => p.id === event.playerId);
  if (!player) return null;

  if (event.type === 'USE_ULTIMATE') {
    return props.ultimatesData.iconProps(event.id);
  }


  const pRaceData = props.racesData[player.race];
  const item = itemsMap.value[event.id];
  if (!pRaceData || !item) return null
  if (!item.iconsCount || item.iconsCount === 1) {
    return pRaceData.iconProps(event.id);
  }
  const levels = getItemMaxLvl(item);
  const index = Math.ceil(event.level / (levels / item.iconsCount));
  return pRaceData.iconProps(`${event.id}-${index}`);
};

const getEventTooltip = (event: TimelineEvent) => {
  const player = props.players.find(p => p.id === event.playerId);
  const pName = player ? player.name : 'Unknown';
  let desc = `[${formatMillisecondsToHuman(event.time)}] `;
  if (viewMode.value === 'combined') {
    desc += `${pName} <br/> `;
  }

  switch (event.type) {
    case 'FORT_UPGRADE2': desc += 'Fortress lvl 2'; break;
    case 'FORT_UPGRADE3': desc += 'Fortress lvl 3'; break;
    case 'UP_BARRACK2': desc += 'Barrack lvl 2'; break;
    case 'UP_BARRACK3': desc += 'Barrack lvl 3'; break;
    case 'UP_BARRACK4': desc += 'Barrack lvl 4'; break;
    case 'HERO_BUY':
    case 'UNIT_BUY': {
      const item = itemsMap.value[event.id];
      if (!item) break;
      desc += `${item.name}`;
      if (isHeroObject(item)) {
        desc += ` - ${item.fullName}`;
      }
      break;
    }
    case 'USE_ULTIMATE': {
      const item = Object.values(props.ultimatesData.raceData.spells).flat().find(s => s.id === event.id);
      if (!item) break;
      desc += `${item.name}`;
      break;
    }
    case 'BASE_UPGRADE':
    case 'TOWER_UPGRADE': {
      const item = itemsMap.value[event.id];
      if (!item) break;
      desc += `${item.name} (Lvl ${event.level})`;
      break;
    }
  }

  return desc;
};

// Simple time formatter for tooltips
const formatMillisecondsToHuman = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getEventColor = () => 'transparent';
</script>

<style scoped>
.match-progression {
  width: 100%;
}
.gap-2 {
  gap: 8px;
}
.timeline-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
  padding-bottom: 8px;
}
.timeline-table {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  min-width: max-content;
  border-left: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.timeline-table th, .timeline-table td {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 8px;
  vertical-align: top;
}
.header-cell, .time-header-cell {
  position: sticky;
  top: 0;
  z-index: 10;
  font-weight: bold;
}
.sticky-left {
  position: sticky;
  left: 0;
  z-index: 20;
  min-width: 130px;
  max-width: 130px;
  background-clip: padding-box;
}
.header-cell.sticky-left {
  z-index: 30; /* corner */
}
.player-header-cell {
  padding: 0 !important;
  border: none !important;
}
.player-name-sticky {
  position: sticky;
  left: 0;
  width: max-content;
  padding: 8px 16px;
  z-index: 20;
}
.bucket-cell {
  min-width: 80px;
}
.bucket-events {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.event-icon-wrapper {
  position: relative;
  display: inline-flex;
  border-radius: 4px;
  border-bottom: 2px solid transparent;
}
.small-icon {
  margin: 2px;
}
.event-level-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background-color: rgba(var(--v-theme-surface), 0.95);
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.8);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  z-index: 2;
}
</style>
