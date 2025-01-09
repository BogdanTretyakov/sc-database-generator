<template>
  <div class="race-container">
    <RaceSelectRibbon style="grid-column: 1 / -1" />
    <CCard title="" id="details" style="grid-row: span 3">
      <template #title>
        <h1
          class="text-wrap text-h2"
          :style="{ color: raceComputed.color }"
          v-html="raceData.name"
        />
      </template>
      <div v-html="raceComputed.description" />
    </CCard>

    <CCard
      title="Fortress"
      class="d-flex flex-column justify-start"
      style="grid-row: span 2"
      :full-height="false"
      id="fortress"
    >
      <template #prependHead>
        <AttackDefend
          key="fort-attack"
          class="ml-1"
          :type="raceData.buildings.fort.attackType"
        />
      </template>
      <template #appendHead>
        <CombineCost key="fort-cost" class="mr-1" :items="researches" />
      </template>
      <WarGrid class="mx-auto" :items="raceData.auras" v-slot="{ item }">
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
      <WarGrid class="mx-auto" :items="researches" v-slot="{ item }">
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

      <v-divider class="my-3 w-100" />

      <WarGrid class="mx-auto" :items="spells" v-slot="{ item }">
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
      title="Towers"
      :full-height="false"
      class="d-flex flex-column"
      style="grid-row: span 2"
      id="upgrades"
    >
      <template #prependHead>
        <AttackDefend
          key="tower-attack"
          class="ml-1"
          :type="raceData.buildings.tower.attackType"
        />
      </template>
      <template #appendHead>
        <CombineCost
          key="tower-cost"
          :items="raceData.towerUpgrades"
          :count="3"
        >
          Total cost (Lv3)
        </CombineCost>
      </template>
      <WarGrid
        class="mx-auto"
        :items="raceData.towerUpgrades"
        v-slot="{ item }"
      >
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
      title="Bonuses"
      :full-height="false"
      class="d-flex flex-column align-center justify-start"
      :style="{ gridRow: `span ${2 + Math.floor(bonusBuildings.length / 4)}` }"
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
      title="Barracks"
      :full-height="false"
      class="d-flex flex-column"
      style="grid-row: span 2"
      id="units"
    >
      <template #prependHead>
        <AttackDefend
          key="barrack-attack"
          class="ml-1"
          :type="raceData.buildings.barrack.attackType"
        />
      </template>
      <WarGrid class="mx-auto" :items="units" v-slot="{ item }">
        <WarTooltip
          :description="item.description"
          :src="icons"
          :coords="iconProps(item.id)"
        >
          <template #tooltip>
            <div class="text-subtitle-1" v-html="item.name" />
            <WarCost :cost="item.cost" />
            <div class="d-flex flex-no-wrap my-1">
              <AttackDefend
                :type="item.atkType"
                :value="item.atk"
                :size="24"
                class="flex-grow-1"
              />
              <AttackDefend
                :type="item.defType"
                :value="item.def"
                is-defend
                :size="24"
                class="flex-grow-1"
              />
            </div>
          </template>
        </WarTooltip>
      </WarGrid>

      <v-divider class="my-3 w-100" />

      <WarGrid class="mx-auto" :items="heroes" v-slot="{ item }">
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

    <template v-for="hero in raceData.bonusHeroes">
      <CCard
        :title="hero.name"
        :id="`hero-${hero.id}`"
        v-if="!!hero.items.length"
      >
        <HeroReplace :hero="hero" />
      </CCard>
    </template>

    <template v-for="(items, id) in raceData.bonusUpgrades">
      <CCard
        :title="bonuses[id].name"
        :full-height="false"
        class="d-flex flex-column align-center justify-center"
        :id="`additional-${id}`"
      >
        <template #appendHead>
          <CombineCost :items="items" />
        </template>
        <WarGrid :items="items" v-slot="{ item }">
          <WarTooltip
            :description="item.description"
            :src="icons"
            :coords="iconProps(item.id, item.iconsCount)"
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
import { defaultVersionType, versionIndexes } from '~/data';
import type { IMagicObject, IUpgradeObject } from '~/data/types';
import HeroReplace from '~/components/racePage/HeroReplace.vue';

const collator = new Intl.Collator('en').compare;

const hoverBonus = ref();
const selectedBonus = useHashValue();

const unitsHotkeys: Record<string, string> = {
  melee: 'A',
  range: 'S',
  mage: 'D',
  siege: 'F',
  air: 'E',
  catapult: 'R',
};

const icons = await useRaceIcons();
const { raceData, iconProps } = await useRaceData();

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
    .map((hero, idx) => {
      const hotkey = hotkeys[idx];
      return {
        ...hero,
        hotkey,
      };
    })
    .concat(
      raceData.bonusHeroes.filter(({ hotkey }) =>
        ['Q', 'W', 'E', 'R'].includes(hotkey.toLocaleUpperCase())
      )
    )
);

const units = computed(() =>
  Object.entries(raceData.units).map(([key, value]) => ({
    ...value,
    hotkey: unitsHotkeys[key],
  }))
);

const spells = computed(() => {
  const spells = [raceData.t1spell, raceData.t2spell];
  if (raceData.ultimateId) {
    spells.push({
      hotkey: 'V',
      id: raceData.ultimateId,
      name: 'Precision UW Icon',
      description: '',
    });
  }
  return spells;
});

const bonusBuildings = computed(() =>
  Object.values(raceData.bonusBuildings).sort(({ name: n1 }, { name: n2 }) =>
    collator(n1, n2)
  )
);

const bonuses = computed(() =>
  Object.fromEntries(raceData.bonuses.map((item) => [item.id, item]))
);

useSeoMeta({
  title: `${raceData.name}`,
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
  middleware(to) {
    const [versionType] = [to.params.versionType].flat();
    const versionIndex = versionIndexes[versionType || defaultVersionType];
    const [race] = [to.params.race].flat();
    if (!(race in versionIndex.racesData)) {
      return navigateTo({ name: 'RaceSelection' });
    }
  },
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
