<template>
  <VChart
    style="height: 500px; width: 100%"
    :option="options"
    autoresize
    :loading="false"
  >
  </VChart>
</template>

<script setup lang="ts">
import type { StatisticPatchRaces } from '~/types/statistic';
import type { IRaceIcons, IRacePickerObject } from '~/data/types';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  LegendPlainComponent,
  DatasetComponent,
  TransformComponent,
  GridComponent,
  DataZoomSliderComponent,
  DataZoomInsideComponent,
  MarkLineComponent,
  TimelineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  DatasetComponentOption,
  GraphicComponentOption,
  DataZoomComponentOption,
  MarkLineComponentOption,
} from 'echarts/components';
import zipWith from 'lodash/zipWith';

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  LegendPlainComponent,
  TransformComponent,
  LineChart,
  MarkLineComponent,
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
  DataZoomSliderComponent,
  DataZoomInsideComponent,
  TimelineComponent,
]);
provide(THEME_KEY, 'dark');

type EChartsOption = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | DatasetComponentOption
  | GraphicComponentOption
  | DataZoomComponentOption
  | MarkLineComponentOption
  | LineSeriesOption
>;

const referenceLine = useStorageValue('referenceLine', 25, Number);

const { data, racesData } = defineProps<{
  racesData: Record<string, IRacePickerObject[]>;
  data: StatisticPatchRaces['groupedRacesWinrate'];
}>();

const raceNames = computed(() =>
  Object.fromEntries(
    Object.values(racesData)
      .flat()
      .map(({ id, name }) => [id, name])
  )
);

const itemsData = computed(() => {
  const raceKeys = Object.keys(raceNames.value);

  return data
    .sort(({ race: r1 }, { race: r2 }) => {
      return raceKeys.indexOf(r1) - raceKeys.indexOf(r2);
    })
    .flatMap(({ race, quantile, totalMatches, winrate }) => {
      return zipWith(
        winrate,
        quantile,
        totalMatches,
        (winrate, quantile, totalMatches) => ({
          race: raceNames.value[race],
          winrate,
          quantile,
          totalMatches,
        })
      );
    });
});

const options = computed(() => {
  const races = [...new Set(itemsData.value.map((d) => d.race))];

  const markLine: MarkLineComponentOption = {
    symbol: ['none', 'none'],
    data: [
      {
        yAxis: referenceLine.value,
        lineStyle: {
          type: 'dashed',
          color: 'pink',
          width: 1,
        },

        emphasis: {
          disabled: true,
          blurScope: 'series',
        },
      },
    ],
  };

  return {
    title: {
      text: 'Races winrate by avg match percentile',
    },
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: 10,
      right: 10,
    },
    legend: {
      type: 'plain',
      left: 0,
      bottom: 0,
      orient: 'horizontal',
      selected: Object.fromEntries(
        Object.values(raceNames.value).map((race, idx) => [race, !idx])
      ),
    },
    dataset: [
      {
        dimensions: ['race', 'quantile', 'winrate'],
        source: itemsData.value,
        sourceHeader: false,
      },
      ...races.map((race) => ({
        transform: {
          type: 'filter',
          config: { dimension: 'race', '=': race },
        },
      })),
    ],
    xAxis: {
      type: 'category',
      name: 'Percentile',
      axisLabel: {
        interval: 0,
        formatter: '{value}%',
      },
    },
    yAxis: {
      name: 'Winrate',
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { formatter: '{value}%' },
    },
    series: races.map((race, idx) => ({
      type: 'line',
      name: race,
      datasetIndex: idx + 1,
      smooth: true,
      encode: {
        x: 'quantile',
        y: 'winrate',
      },
      connectNulls: true,
      markLine: idx === 0 ? markLine : undefined,
    })),
  } satisfies EChartsOption;
});
</script>
