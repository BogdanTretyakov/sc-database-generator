<template>
  <!-- @vue-expect-error ['type'] doesn't matter in this case -->
  <DetailsUnit :item="item">
    <template #fullname>
      <div v-html="item.fullName" class="text-center text-subtitle-1" />
    </template>
    <template #attributes>
      <v-col cols="4" class="text-center pb-0">
        <GameIcon
          width="32"
          :src="assetsPath"
          :coords="str"
          :padding="[0, 8, 8, 0]"
        />
        <div
          :class="{
            'text-yellow': item.stat === 'str',
            'font-bold': item.stat === 'str',
          }"
        >
          {{ item.str }}+{{ item.strLvl }}
        </div>
      </v-col>
      <v-col cols="4" class="text-center pb-0">
        <GameIcon
          width="32"
          :src="assetsPath"
          :coords="agi"
          :padding="[0, 8, 8, 0]"
        />
        <div
          :class="{
            'text-yellow': item.stat === 'agi',
            'font-bold': item.stat === 'agi',
          }"
        >
          {{ item.agi }}+{{ item.agiLvl }}
        </div>
      </v-col>
      <v-col cols="4" class="text-center pb-0">
        <GameIcon
          width="32"
          :src="assetsPath"
          :coords="int"
          :padding="[0, 8, 8, 0]"
        />
        <div
          :class="{
            'text-yellow': item.stat === 'int',
            'font-bold': item.stat === 'int',
          }"
        >
          {{ item.int }}+{{ item.intLvl }}
        </div>
      </v-col>
    </template>
    <template #heroItems>
      <v-expansion-panel
        v-if="!!item.items?.length"
        title="Hero items"
        value="items"
      >
        <v-expansion-panel-text>
          <div class="hero-items-wrapper">
            <WarTooltip
              v-for="arti in item.items"
              :src="raceIcons"
              :coords="iconProps(arti.id)"
              :description="arti.description ?? ''"
            >
              <template #tooltip>
                <div class="text-subtitle-1" v-html="arti.name" />
                <div class="text-caption">
                  Obtain at
                  <span class="text-yellow">{{ arti.level }}</span> level
                </div>
              </template>
            </WarTooltip>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </template>
  </DetailsUnit>
</template>

<script setup lang="ts">
import type { IHeroObject } from '~/data/types';

interface Props {
  item: IHeroObject;
}

const raceIcons = await useRaceIcons();
const { iconProps } = await useRaceData();
const [assetsPath, { str, int, agi }] = useAssets();

const { item } = defineProps<Props>();
</script>

<style lang="css" scoped>
.hero-items-wrapper {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
</style>
