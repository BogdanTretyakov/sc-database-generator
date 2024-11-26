<template>
  <div class="race-container">
    <CCard :title="routes.details" id="details" class="row-span-2">
      <template #title>
        <h1 :style="{ color: raceComputed.color }">{{ raceData.name }}</h1>
      </template>
      <div v-html="raceComputed.description" />
    </CCard>

    <CCard :title="routes.buildings" id="buildings">
      <v-row>
        <v-col
          cols="4"
          v-for="{ name, icon, text } in buildings"
          :key="name"
          class="text-center"
        >
          <div class="text-h6">{{ name }}</div>
          <v-tooltip>
            <template #activator="{ props }">
              <GameIcon
                :src="assets"
                width="48"
                :coords="icon"
                v-bind="props"
                :padding="[0, 8, 8, 0]"
                class="my-4"
              />
            </template>
            <span v-html="text" />
          </v-tooltip>
        </v-col>
      </v-row>
    </CCard>

    <CCard
      :title="routes.researches"
      class="d-flex flex-column align-center justify-center"
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

      <v-divider class="my-3 w-100" />

      <WarGrid :items="spells" v-slot="{ item }">
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
            <div class="d-flex flex-no-wrap my-1">
              <div class="d-flex align-center flex-grow-1">
                <GameIcon
                  :src="assets"
                  class="mr-2"
                  :coords="attackIcons[item.atkType]"
                  width="24"
                  :padding="[0, 8, 8, 0]"
                />
                {{ item.atk }}
              </div>
              <div class="d-flex align-center flex-grow-1">
                <GameIcon
                  :src="assets"
                  class="mr-2"
                  :coords="defendIcons[item.defType]"
                  width="24"
                  :padding="[0, 8, 8, 0]"
                />
                {{ item.def }}
              </div>
            </div>
          </template>
        </WarTooltip>
      </WarGrid>

      <v-divider class="my-3 w-100" />

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
      :title="routes.bonuses"
      :full-height="false"
      class="d-flex flex-column align-center justify-start row-span-2"
      id="bonuses"
    >
      <WarGrid :items="raceData.bonuses" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
          :class="[
            'cursor-pointer',
            'selectable-item',
            {
              depressed: hoverBonus
                ? !(hoverBonus in bonuses) && item.buildingId !== hoverBonus
                : !!selectedBonus &&
                  !(selectedBonus in bonuses) &&
                  item.buildingId !== selectedBonus,
              selected: selectedBonus === item.id,
            },
          ]"
          @click="
            () =>
              (selectedBonus = selectedBonus === item.id ? undefined : item.id)
          "
          @mouseover="() => (hoverBonus = item.id)"
          @mouseout="() => (hoverBonus = undefined)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
          </template>
        </WarTooltip>
      </WarGrid>
      <div class="my-2 text-h6">Buildings</div>
      <div class="d-flex flex-wrap">
        <v-btn
          v-for="item in bonusBuildings"
          class="my-1 mx-2"
          variant="text"
          size="x-small"
          :active="
            selectedBonus === item.id ||
            [selectedBonus, hoverBonus].some(
              (sId) =>
                sId in bonuses &&
                raceData.bonuses.find((i) => i.id === sId)?.buildingId ===
                  item.id
            )
          "
          @click="
            () =>
              (selectedBonus = selectedBonus === item.id ? undefined : item.id)
          "
          @mouseover="() => (hoverBonus = item.id)"
          @mouseout="() => (hoverBonus = undefined)"
        >
          {{ item.name }}
        </v-btn>
      </div>
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
    <template v-for="(items, id) in raceData.bonusUpgrades">
      <CCard
        :title="bonuses[id].name"
        :full-height="false"
        class="d-flex flex-column align-center justify-center"
        :id="`additional-${id}`"
      >
        <WarGrid :items="items" v-slot="{ item }">
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
    </template>
  </div>
</template>

<script setup lang="ts">
import type { IconBoundaries } from '~/components/GameIcon.vue';
import type { IMagicObject, IUpgradeObject } from '~/data/types';

const collator = new Intl.Collator('en').compare;

const hoverBonus = ref();
const selectedBonus = useHashValue();

const [assets, assetsCoords] = useAssets();

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
  auras: 'Auras & Spells',
  units: 'Units & Heroes',
  bonuses: 'Bonuses',
  upgrades: 'Upgrades',
} as const;

const buildNames: Record<string, string> = {
  fort: 'Fortress',
  barrack: 'Barracks',
  tower: 'Tower',
};

const attackTypes: Record<string, string> = {
  siege: '<span style="color: #ffbfbf">Siege</span>',
  chaos: '<span style="color: #2fd43c">Chaos</span>',
  magic: '<span style="color: #2c67dc">Magic</span>',
  pierce: '<span style="color: #d4e143">Pierce</span>',
  normal: '<span style="color: #51ded8">Normal</span>',
};

const attackIcons: Record<string, IconBoundaries> = {
  siege: assetsCoords.siege,
  chaos: assetsCoords.chaos,
  magic: assetsCoords.magic,
  pierce: assetsCoords.pierce,
  normal: assetsCoords.normal,
  hero: assetsCoords.ahero,
};

const defendIcons: Record<string, IconBoundaries> = {
  divine: assetsCoords.divine,
  none: assetsCoords.unarmored,
  small: assetsCoords.light,
  hero: assetsCoords.dhero,
  large: assetsCoords.heavy,
  medium: assetsCoords.medium,
  flesh: assetsCoords.unarmored,
};

const buildings = computed(() =>
  Object.entries(raceData.buildings)
    .map(([key, { attackType }]) => {
      if (!attackType) return;
      return {
        name: buildNames[key],
        icon: attackIcons[attackType],
        text: attackTypes[attackType],
      };
    })
    .filter(isNotNil)
);

const raceComputed = computed(() => {
  const description = raceData.description
    .replace(
      new RegExp(
        String.raw`^\s*?<span[^>]*?>.*?${raceData.name}.*?<\/span>`,
        'si'
      ),
      ''
    )
    .replace(/\s+?(?:<br\s?\/?>)*/, '');
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

const spells = computed(() =>
  [raceData.t1spell, raceData.t2spell].concat({
    hotkey: 'V',
    id: raceData.ultimateId,
    name: 'Precision UW Icon',
    description: '',
  })
);

const bonusBuildings = computed(() =>
  Object.values(raceData.bonusBuildings).sort(({ name: n1 }, { name: n2 }) =>
    collator(n1, n2)
  )
);

const bonuses = computed(() =>
  Object.fromEntries(raceData.bonuses.map((item) => [item.id, item]))
);

useSeoMeta({
  title: `${raceData.name} ${version.value}`,
});

useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: icons,
    },
  ],
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
.selected {
  outline: 4px solid #ffd428;
}
.depressed {
  opacity: 0.2;
}
.selectable-item {
  transition: 150ms opacity linear;
}
</style>
