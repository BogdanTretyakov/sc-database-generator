<template>
  <VChart
    style="height: 300px; width: 100%"
    :option="options"
    autoresize
    :loading="false"
  >
  </VChart>
</template>

<script setup lang="ts">
import type { StatisticPatchRaces } from '~/types/statistic';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { LineChart, type LineSeriesOption } from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components';

use([
  TitleComponent,
  TooltipComponent,
  LineChart,
  CanvasRenderer,
  GridComponent,
]);
provide(THEME_KEY, 'dark');

type EChartsOption = ComposeOption<
  TitleComponentOption | TooltipComponentOption | LineSeriesOption
>;

const { data } = defineProps<{
  data: StatisticPatchRaces['matchesByQuantile'];
}>();

const options = computed(() => {
  return {
    title: {
      text: 'Matches count by avg match percentile',
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
    xAxis: {
      type: 'category',
      name: 'Percentile',
      axisLabel: {
        formatter: '{value}%',
      },
    },
    yAxis: {
      name: 'Count',
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    series: [
      {
        type: 'line',
        name: 'Total matches',
        smooth: true,
        data: data.slice(1),
        connectNulls: true,
        emphasis: {
          focus: 'self',
        },
      },
    ],
  } satisfies EChartsOption;
});
</script>
