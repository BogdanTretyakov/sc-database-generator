<template>
  <CCard :title="changelog.name" class="changelogCard">
    <template #prependHead v-if="racesData && currentRace">
      <GameIcon :src="racesData.iconsSrc" :coords="raceIcon" width="48" />
    </template>
    <template #title>
      <v-btn
        size="large"
        color="yellow"
        variant="text"
        class="text-h4"
        :to="{
          name: 'RaceIndex',
          params: { versionType, version, race: currentRace?.key },
        }"
        >{{ changelog.name }}</v-btn
      >
    </template>
  </CCard>

  <div class="d-flex flex-wrap raceWrapper py-4">
    <template v-if="changelog.description">
      <RaceDescription
        title="Before"
        class="changelogDescription"
        :race="{ name: changelog.name, description: changelog.description[1] }"
      />
      <RaceDescription
        title="After"
        class="changelogDescription"
        :race="{ name: changelog.name, description: changelog.description[2] }"
      />
    </template>
    <CCard
      v-if="changelog.auras || changelog.upgrades || changelog.magic"
      title="Fortress"
      class="d-flex flex-column align-center"
    >
      <template v-if="changelog.auras">
        <DividerLabel class="mb-2 mt-n6">
          <span class="mx-2 text-caption text-grey">Auras</span>
        </DividerLabel>
        <ChangelogGrid
          :items="changelog.auras"
          clear-rows
          :get-icon="getIcon"
        />
      </template>
      <template v-if="preparedUpgrades.length">
        <DividerLabel class="mb-1">
          <span class="mx-2 text-caption text-grey">Upgrades</span>
        </DividerLabel>
        <ChangelogGrid
          :items="preparedUpgrades"
          :get-icon="getIcon"
          clear-rows
        />
      </template>
    </CCard>
    <CCard
      v-if="changelog.towerUpgrades"
      title="Towers"
      class="d-flex flex-column align-center"
    >
      <ChangelogGrid :items="changelog.towerUpgrades" :get-icon="getIcon" />
    </CCard>
    <CCard
      v-if="changelog.bonuses"
      title="Bonuses"
      class="d-flex flex-column align-center"
    >
      <ChangelogGrid :items="changelog.bonuses" :get-icon="getIcon" />
    </CCard>
    <CCard
      v-if="changelog.units || changelog.heroes"
      title="Barracks"
      class="d-flex flex-column align-center"
    >
      <template v-if="preparedUnits.length">
        <DividerLabel class="mb-1">
          <span class="mx-2 text-caption text-grey">Units</span>
        </DividerLabel>
        <ChangelogGrid :items="preparedUnits" :get-icon="getIcon" clear-rows />
      </template>
      <template v-if="changelog.heroes">
        <DividerLabel class="mb-1">
          <span class="mx-2 text-caption text-grey">Heroes</span>
        </DividerLabel>
        <ChangelogGrid
          :items="changelog.heroes"
          :get-icon="getIcon"
          clear-rows
        />
      </template>
    </CCard>
  </div>
</template>

<script lang="ts" setup>
import type { IBaseObject, IChangelogRace } from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import RaceDescription from '../racePage/RaceDescription.vue';
import values from 'lodash/values';
import mapValues from 'lodash/mapValues';

interface Props {
  changelog: IChangelogRace;
  getIcon(id: string): IconBoundaries;
  raceKey: string;
  versionType: string;
  version: string;
}

const unitsHotkeys: Record<string, string> = {
  melee: 'A',
  range: 'S',
  mage: 'D',
  siege: 'F',
  air: 'E',
  catapult: 'R',
};

const { changelog, getIcon, raceKey } = defineProps<Props>();

const racesData = inject<
  Ref<{
    races: Array<IBaseObject & { key: string }>;
    icons: Record<string, number[]>;
    iconsSrc: string;
  }>
>('racesData');

const currentRace = computed(() =>
  racesData?.value?.races.find((race) => race.key === raceKey)
);
const raceIcon = computed<IconBoundaries>(() => {
  const [x, y, width, height] =
    racesData?.value?.icons[currentRace?.value?.id ?? ''] ?? [];
  return { x, y, width, height };
});

const preparedUpgrades = computed(() => {
  return (changelog.magic ?? []).concat(changelog.upgrades ?? []);
});
const preparedUnits = computed(() =>
  values(
    mapValues(changelog.units ?? {}, ([changeType, oldObj, newObj], type) => {
      oldObj.hotkey = newObj.hotkey = unitsHotkeys[type];
      return [changeType, oldObj, newObj] as const;
    })
  )
);
</script>

<style lang="css" scoped>
.changelogCard:deep(.v-card-text) {
  padding-block: 0;
}
.changelogCard {
  position: sticky !important;
  top: 4px;
  z-index: 10;
}
.raceWrapper {
  gap: 16px;
}
.raceWrapper > * {
  flex: 270px 0 1;
}
.changelogDescription:deep(.v-card-text) {
  font-size: 0.72rem !important;
}
.changelogDescription :deep(.text-h3) {
  display: none;
}
</style>
