<template>
  <div class="text-center">
    <h1 class="text-h2 font-bold title" :style="{ color: raceComputed.color }">
      {{ raceData.name }}
    </h1>
  </div>

  <div class="race-container">
    <CCard :title="routes.details" id="details" class="row-span-2">
      <div v-html="raceComputed.description" />
    </CCard>

    <CCard :title="routes.buildings" id="buildings">
      <template v-if="raceData.buildings.fort.attackType">
        <div class="text-h6">
          <span>Fortress: </span>
          <span v-html="attackTypes[raceData.buildings.fort.attackType]" />
        </div>
      </template>
      <template v-if="raceData.buildings.barrack.attackType">
        <div class="text-h6">
          <span>Barrack: </span>
          <span v-html="attackTypes[raceData.buildings.barrack.attackType]" />
        </div>
      </template>
      <template v-if="raceData.buildings.tower.attackType">
        <div class="text-h6">
          <span>Tower: </span>
          <span v-html="attackTypes[raceData.buildings.tower.attackType]" />
        </div>
      </template>
    </CCard>

    <CCard
      :title="routes.researches"
      class="d-flex flex-column align-center"
      :full-height="false"
      id="researches"
    >
      <WarGrid :items="researches" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="
            !('level' in item) || (item.iconsCount ?? 0) <= 1
              ? iconProps(item.id, item.iconsCount)
              : iconProps(`${item.id}-${item.level}`)
          "
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
            <WarCost :cost="'level' in item ? item.cost[0] : item.cost" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.spells"
      :full-height="false"
      class="d-flex flex-column align-center"
      id="spells"
    >
      <WarGrid :items="[raceData.t1spell, raceData.t2spell]" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.auras"
      :full-height="false"
      class="d-flex flex-column align-center justify-center"
      id="auras"
    >
      <WarGrid :items="raceData.auras" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.heroes"
      :full-height="false"
      class="d-flex flex-column align-center justify-center"
      id="heroes"
    >
      <WarGrid :items="heroes" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-h6" v-html="item.fullName" />
            <div class="text-subtitle-1" v-html="item.name" />
            <WarCost :cost="item.cost" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.units"
      :full-height="false"
      class="d-flex flex-column align-center justify-center"
      id="units"
    >
      <WarGrid :items="units" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
            <WarCost :cost="item.cost" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.bonuses"
      :full-height="false"
      class="d-flex flex-column align-center justify-center"
      id="bonuses"
    >
      <WarGrid :items="raceData.bonuses" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
    <CCard
      :title="routes.upgrades"
      :full-height="false"
      class="d-flex flex-column align-center justify-center"
      id="upgrades"
    >
      <WarGrid :items="raceData.towerUpgrades" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
            <WarCost :cost="item.cost" />
          </template>
        </WarTooltip>
      </WarGrid>
    </CCard>
  </div>
</template>

<script setup lang="ts">
import type { IMagicObject, IUpgradeObject } from '~/data/types';

const attackTypes: Record<string, string> = {
  siege: '<span style="color: #ffbfbf">Siege</span>',
  chaos: '<span style="color: #2fd43c">Chaos</span>',
  magic: '<span style="color: #2c67dc">Magic</span>',
  pierce: '<span style="color: #d4e143">Pierce</span>',
};

const unitsHotkeys: Record<string, string> = {
  melee: 'A',
  range: 'S',
  mage: 'D',
  siege: 'F',
  air: 'E',
  catapult: 'R',
};

const version = useVersion();

const icons = await useRaceIcons();
const { raceData, iconProps } = await useRaceData();

const routes = {
  details: 'Details',
  buildings: 'Buildings',
  researches: 'Researches',
  spells: 'Spells',
  auras: 'Auras',
  heroes: 'Heroes',
  units: 'Units',
  bonuses: 'Bonuses',
  upgrades: 'Upgrades',
} as const;

const raceComputed = computed(() => {
  const description = raceData.description.replace(
    new RegExp(
      String.raw`<span[^>]*?>${raceData.name}<\/span>(?:\n|(?:<br\s?\/>))?`
    ),
    ''
  );
  const [color] = raceData.description.match(
    new RegExp(String.raw`#[a-zA-Z0-9]{6,8}(?=[^<]*?(?:${raceData.name}))`)
  ) ?? ['white'];
  return { description, color };
});

const researches = computed<Array<IUpgradeObject | IMagicObject>>(() => {
  return (
    raceData.magic
      .map((magic, idx) => ({
        ...magic,
        hotkey: hotkeys[idx],
      }))
      // @ts-expect-error
      .concat(...Object.values(raceData.baseUpgrades))
  );
});

const heroes = computed(() =>
  raceData.heroes
    .map((slotHeroes, idx) => {
      const hotkey = hotkeys[idx];
      return slotHeroes.map((hero) => ({
        ...hero,
        hotkey,
      }));
    })
    .flat()
);

const units = computed(() =>
  Object.entries(raceData.units).map(([key, value]) => ({
    ...value,
    hotkey: unitsHotkeys[key],
  }))
);

useSeoMeta({
  title: `${raceData.name} ${version.value}`,
});

definePageMeta({
  name: 'RaceIndex',
});
</script>
<style lang="css" scoped>
.title {
  text-shadow: #000000 0px 0px 5px, #000000 0px 0px 5px;
}
.race-container {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-template-rows: fit-content(50%);
}
.row-span-2 {
  grid-row: span 2;
}
</style>
