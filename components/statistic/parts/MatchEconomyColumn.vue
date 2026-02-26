<template>
  <v-card variant="outlined" class="h-100 economy-column-card">
    <v-card-text>
      <!-- Total Worth Summary -->
      <div class="economy-summary mb-4">
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Total Gold:</span>
          <span class="font-weight-bold text-yellow">{{ totalCost }} </span>
        </div>
        <v-divider class="my-1"></v-divider>
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Units Cost:</span>
          <span>{{ economy.unitsCost }}</span>
        </div>
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Heroes Cost:</span>
          <span>{{ economy.heroesCost }}</span>
        </div>
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Upgrades Cost:</span>
          <span>{{
            economy.baseUpgradesCost + economy.towerUpgradesCost
          }}</span>
        </div>
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Buildings Cost:</span>
          <span>{{ economy.buildingsCost }}</span>
        </div>
        <v-divider class="my-1"></v-divider>
        <div class="d-flex justify-space-between align-center py-1">
          <span class="text-caption text-medium-emphasis">Research count:</span>
          <span>{{ economy.totalUpgradeLevels }}</span>
        </div>
      </div>
      <!-- Base Upgrades -->
      <template v-if="allBaseUpgrades.length">
        <DividerLabel class="mb-2 mt-4">
          <span class="mx-2 text-caption text-grey text-no-wrap"
            >Base Upgrades</span
          >
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="allBaseUpgrades"
          v-slot="{ item }"
          disable-details
        >
          <div
            class="position-relative d-inline-block"
            :class="{ unresearched: !economy.baseUpgradeLevels[item.id] }"
          >
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="
                !('level' in item) || (item.iconsCount ?? 0) <= 1
                  ? iconProps(item.id, item.iconsCount)
                  : iconProps(
                      `${item.id}-${economy.baseUpgradeLevels[item.id] || 1}`,
                    )
              "
            />
            <span
              v-if="economy.baseUpgradeLevels[item.id]"
              class="count-badge text-caption"
              >{{ economy.baseUpgradeLevels[item.id] }}</span
            >
          </div>
        </WarGrid>
      </template>

      <!-- Tower Upgrades -->
      <template v-if="allTowerUpgrades.length">
        <DividerLabel class="mb-2 mt-4">
          <span class="mx-2 text-caption text-grey text-no-wrap"
            >Tower Upgrades</span
          >
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="allTowerUpgrades"
          v-slot="{ item }"
          :restrictedSlots="['Q', 'W']"
          disable-details
        >
          <div
            class="position-relative d-inline-block"
            :class="{ unresearched: !economy.towerUpgradeLevels[item.id] }"
          >
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="
                !('level' in item) || (item.iconsCount ?? 0) <= 1
                  ? iconProps(item.id, item.iconsCount)
                  : iconProps(
                      `${item.id}-${economy.towerUpgradeLevels[item.id] || 1}`,
                    )
              "
            />
            <span
              v-if="economy.towerUpgradeLevels[item.id]"
              class="count-badge text-caption"
              >{{ economy.towerUpgradeLevels[item.id] }}</span
            >
          </div>
        </WarGrid>
      </template>

      <!-- Buildings -->
      <template v-if="fortAndBarracks.length">
        <DividerLabel class="mb-2">
          <span class="mx-2 text-caption text-grey text-no-wrap"
            >Buildings</span
          >
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="fortAndBarracks"
          skip-hotkey
          v-slot="{ item }"
          disable-details
        >
          <div class="position-relative d-inline-block">
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="iconProps(item.id)"
            />
            <span v-if="item.level > 1" class="count-badge text-caption">{{
              item.level
            }}</span>
          </div>
        </WarGrid>
      </template>

      <!-- Heroes -->
      <template v-if="purchasedHeroes.length">
        <DividerLabel class="mb-2">
          <span class="mx-2 text-caption text-grey">Heroes</span>
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="purchasedHeroes"
          v-slot="{ item }"
          disable-details
        >
          <div class="position-relative d-inline-block">
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="iconProps(item.id)"
            />
            <span class="count-badge text-caption">{{
              economy.heroesCount[item.id]
            }}</span>
          </div>
        </WarGrid>
      </template>

      <!-- Units -->
      <template v-if="purchasedUnits.length">
        <DividerLabel class="mb-2 mt-4">
          <span class="mx-2 text-caption text-grey">Units</span>
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="purchasedUnits"
          v-slot="{ item }"
          disable-details
        >
          <div class="position-relative d-inline-block">
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="iconProps(item.id)"
            />
            <span class="count-badge text-caption">{{
              economy.unitsCount[item.id]
            }}</span>
          </div>
        </WarGrid>
      </template>
      <!-- Bonus Upgrades -->
      <template v-if="purchasedBonusUpgrades.length">
        <DividerLabel class="mb-2 mt-4">
          <span class="mx-2 text-caption text-grey text-no-wrap"
            >Bonus Upgrades</span
          >
        </DividerLabel>
        <WarGrid
          class="mx-auto"
          :items="purchasedBonusUpgrades"
          v-slot="{ item }"
          disable-details
        >
          <div class="position-relative d-inline-block">
            <DetailsTooltip
              :item="item"
              :src="raceIconsSrc"
              :coords="
                !('level' in item) || (item.iconsCount ?? 0) <= 1
                  ? iconProps(item.id, item.iconsCount)
                  : iconProps(
                      `${item.id}-${economy.bonusUpgradeLevels[item.id]}`,
                    )
              "
            />
            <span class="count-badge text-caption">{{
              economy.bonusUpgradeLevels[item.id]
            }}</span>
          </div>
        </WarGrid>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IRaceData } from '~/data/types';
import type { MatchPlayerInfo } from '~/types/statistic';
import type { PlayerEconomyData } from '~/utils/timelineHelpers';
import type { IconBoundaries } from '~/components/GameIcon.vue';
import { DetailsTooltip } from '#components';

const props = defineProps<{
  player: MatchPlayerInfo;
  raceData: IRaceData;
  raceIconsSrc: string;
  iconProps: (id: string, count?: number) => IconBoundaries | IconBoundaries[];
  economy: PlayerEconomyData;
}>();

const totalCost = computed(
  () =>
    props.economy.unitsCost +
    props.economy.heroesCost +
    props.economy.baseUpgradesCost +
    props.economy.towerUpgradesCost +
    props.economy.buildingsCost,
);

const purchasedHeroes = computed(() => {
  return props.raceData.heroes.filter(
    (h) => props.economy.heroesCount[h.id] > 0,
  );
});

const purchasedUnits = computed(() => {
  const unitsObj = props.raceData.units;
  const arr = Object.values(unitsObj);
  // Also add any bonus units the race might have
  props.raceData.bonuses.forEach((b) => {
    if (b.units) {
      arr.push(...b.units);
    }
  });
  return arr.filter((u) => props.economy.unitsCount[u.id] > 0);
});

const allBaseUpgrades = computed(() => {
  const upgradesObj = props.raceData.baseUpgrades;
  const arr = Object.values(upgradesObj);
  if (props.raceData.magic) {
    arr.push(props.raceData.magic[0]);
  }
  return arr;
});

const allTowerUpgrades = computed(() => {
  return props.raceData.towerUpgrades || [];
});

const purchasedBonusUpgrades = computed(() => {
  const arr: any[] = [];
  props.raceData.bonuses.forEach((b) => {
    if (b.upgrades) {
      arr.push(...b.upgrades);
    }
  });
  return arr.filter((u) => props.economy.bonusUpgradeLevels[u.id] > 0);
});

const fortAndBarracks = computed(() => {
  const arr: any[] = [];

  if (props.economy.fortLevel) {
    const fortLvl = props.economy.fortLevel;
    const fortItem =
      props.raceData.buildings.fort[fortLvl - 1] ||
      props.raceData.buildings.fort[0];
    if (fortItem) {
      arr.push({ ...fortItem, level: fortLvl, uid: `${fortItem.id}_fort` });
    }
  }

  if (props.economy.barracksLevels) {
    props.economy.barracksLevels.forEach((bLvl, i) => {
      const bItem =
        props.raceData.buildings.barrack[bLvl - 1] ||
        props.raceData.buildings.barrack[0];
      if (bItem) {
        arr.push({ ...bItem, level: bLvl, uid: `${bItem.id}_barrack_${i}` });
      }
    });
  }

  return arr;
});
</script>

<style scoped>
.economy-column-card {
  transition: box-shadow 0.2s;
}
.economy-summary .v-icon {
  vertical-align: sub;
}
.count-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: rgba(var(--v-theme-surface), 0.95);
  color: rgb(var(--v-theme-on-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.8);
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  z-index: 2;
  padding: 0 4px;
}
.unresearched {
  opacity: 0.4;
}

:deep(.container) {
  justify-content: center;
}
</style>
