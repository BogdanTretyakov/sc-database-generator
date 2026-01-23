<template>
  <div class="d-flex flex-column px-6">
    <div class="d-flex align-center">
      <div class="flex-grow-1 d-flex align-center justify-center">
        <span class="text-h5">Effectiveness vs races</span>
        <v-tooltip>
          <template #activator="{ props }">
            <v-icon class="ml-1" v-bind="props" :icon="mdiInformation"></v-icon>
          </template>
          Shows how often the opponent has been encountered in matches won
        </v-tooltip>
      </div>

      <div class="flex-grow-0">
        <v-select
          v-model="sortBy"
          :items="sortSelectItems"
          variant="outlined"
          density="compact"
          label="Sort by"
          hide-details
        />
      </div>
    </div>
    <VChart
      style="height: 350px; width: 100%"
      :option="options"
      autoresize
      :loading="false"
    >
      <template #tooltip="params">
        <template v-if="Array.isArray(params)">
          <div class="d-flex align-center mb-2">
            <span class="mr-4 text-subtitle-1">{{
              raceNames[params[0].name]
            }}</span>
            <img width="38" :src="racesIcons[params[0].name]" class="ml-auto" />
          </div>

          <div v-for="(param, i) in params" :key="i" class="d-flex">
            <span v-html="param.marker" />
            <span class="mr-4">{{ param.seriesName }}</span>
            <b class="ml-auto">
              {{
                param.value?.[
                  param.dimensionNames?.[(param.seriesIndex ?? 0) + 1]
                ]
              }}%
            </b>
          </div>
          <div class="text-caption">
            Tracked matches: {{ params[0].value?.matchesCount }}
          </div>
        </template>
      </template>
    </VChart>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { StatisticRace } from '~/types/statistic';
import type { IRaceIcons, IRacePickerObject } from '~/data/types';
import capitalize from 'lodash/capitalize';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import {
  TooltipComponent,
  DatasetComponent,
  GridComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { BarChart, type BarSeriesOption } from 'echarts/charts';
import type {
  TooltipComponentOption,
  DatasetComponentOption,
  GraphicComponentOption,
  DataZoomComponentOption,
  MarkLineComponentOption,
} from 'echarts/components';
import { mdiInformation } from '@mdi/js';

use([
  TooltipComponent,
  BarChart,
  MarkLineComponent,
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
]);
provide(THEME_KEY, 'dark');

type EChartsOption = ComposeOption<
  | TooltipComponentOption
  | DatasetComponentOption
  | GraphicComponentOption
  | DataZoomComponentOption
  | MarkLineComponentOption
  | BarSeriesOption
>;

const { data, racesData, iconsCoords, iconsSrc } = defineProps<{
  racesData: Record<string, IRacePickerObject[]>;
  data: StatisticRace['winrateVsRaces'];
  iconsCoords: IRaceIcons;
  iconsSrc: string;
}>();

const raceNames = computed(() =>
  Object.fromEntries(
    Object.values(racesData)
      .flat()
      .map(({ id, name }) => [id, name]),
  ),
);
const racesIcons = useIconsDataUri(
  iconsSrc,
  iconsCoords,
  Object.keys(raceNames.value),
);

const theme = useTheme();

const sortVariants = ['default', 'effectiveness'] as const;

const sortSelectItems = sortVariants.map((variant) => ({
  value: variant,
  title: capitalize(variant),
}));
const sortBy = ref<(typeof sortVariants)[number]>('effectiveness');

const itemsData = computed(() => {
  const raceOrder = Object.keys(raceNames.value);
  const sortValue = sortBy.value;
  return data.slice().sort((a, b) => {
    if (sortValue === 'effectiveness') {
      return b.winrate - a.winrate;
    }
    return raceOrder.indexOf(a.race) - raceOrder.indexOf(b.race);
  });
});

const options = computed(() => {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: 10,
      right: 10,
    },
    dataset: {
      dimensions: ['race', 'winrate'],
      source: itemsData.value.map(({ ...item }) => ({
        ...item,
      })),
      sourceHeader: false,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        interval: 0,
        rotate: -25,
        margin: 35,
        align: 'center',
        formatter: (value: string) =>
          [`{${value}|}`, raceNames.value[value]].join('\n'),
        rich: {
          ...Object.fromEntries(
            Object.entries(racesIcons.value).map(([raceId, image]) => [
              raceId,
              {
                width: 32,
                height: 32,
                backgroundColor: {
                  image,
                },
              },
            ]),
          ),
        },
      },
    },
    yAxis: {
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: 'Effectiveness',
        type: 'bar',
        itemStyle: {
          color: theme.current.value.colors.secondary,
        },
      },
    ],
  } satisfies EChartsOption;
});
</script>
