<template>
  <VChart
    style="height: 300px; width: 100%"
    :option="options"
    autoresize
    :loading="false"
  ></VChart>
</template>

<script setup lang="ts">
import { BarChart, type BarSeriesOption } from 'echarts/charts';
import type { StatisticPatchRaces } from '~/types/statistic';
import { use, type ComposeOption } from 'echarts/core';
import {
  TooltipComponent,
  type TooltipComponentOption,
  type GraphicComponentOption,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { CanvasRenderer } from 'echarts/renderers';

use([TooltipComponent, BarChart, CanvasRenderer]);
provide(THEME_KEY, 'dark');

type EChartsOption = ComposeOption<
  TooltipComponentOption | GraphicComponentOption | BarSeriesOption
>;

const { data } = defineProps<{
  data: StatisticPatchRaces['playerPlaces'];
}>();

const placesColors = ['#81c784', '#dce775', '#ffb74d', '#e57373'];

const options = computed(() => {
  const filteredData = data.filter(({ matchesCount }) => !!matchesCount);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        return `${params[0].value}%`;
      },
    },
    xAxis: {
      type: 'category',
      data: filteredData.map((item) => item.place),
    },
    yAxis: {
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        type: 'bar',
        data: filteredData.map((item) => ({
          name: item.place,
          value: item.pct,
          label: { formatter: '{value}%' },
          itemStyle: {
            color: placesColors[item.place - 1],
          },
        })),
      },
    ],
  } satisfies EChartsOption;
});
</script>
