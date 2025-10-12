<template>
  <CCard title="All races data">
    <template #appendHead>
      <div class="d-flex align-center mr-6">
        <span class="text-caption">Metrics</span>
        <v-switch v-model="showPlaces" hide-details class="mx-1" />
        <span class="text-caption">Places</span>
      </div>
    </template>
    <div class="d-flex flex-column px-6">
      <div class="d-flex align-center">
        <div class="flex-grow-1"></div>
        <div class="flex-grow-0 mr-2" style="flex-basis: 100px">
          <v-number-input
            v-model="referenceLine"
            variant="outlined"
            density="compact"
            label="Reference"
            :min="0"
            :max="40"
            :step="1"
            hide-details
            control-variant="stacked"
          />
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
        style="height: 500px; width: 100%"
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
              <img
                width="38"
                :src="racesIcons[params[0].name]"
                class="ml-auto"
              />
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
              Tracked matches: {{ params[0].value?.totalMatches }}
            </div>
          </template>
        </template>
      </VChart>
    </div>
    <slot />
  </CCard>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { StatisticPatchRaces } from '~/types/statistic';
import type { IRaceIcons, IRacePickerObject } from '~/data/types';
import capitalize from 'lodash/capitalize';
import VChart, { THEME_KEY } from 'vue-echarts';
import { use } from 'echarts/core';
import {
  TooltipComponent,
  LegendComponent,
  LegendPlainComponent,
  DatasetComponent,
  GridComponent,
  MarkLineComponent,
  TimelineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { ComposeOption } from 'echarts/core';
import { BarChart, type BarSeriesOption } from 'echarts/charts';
import type {
  TitleComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  DatasetComponentOption,
  GraphicComponentOption,
  DataZoomComponentOption,
  MarkLineComponentOption,
} from 'echarts/components';

use([
  TooltipComponent,
  LegendComponent,
  LegendPlainComponent,
  BarChart,
  MarkLineComponent,
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
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
  | BarSeriesOption
>;

const referenceLine = useStorageValue('referenceLine', 25, Number);

const { data, racesData, iconsCoords, iconsSrc } = defineProps<{
  racesData: Record<string, IRacePickerObject[]>;
  data: StatisticPatchRaces['racesData'];
  iconsCoords: IRaceIcons;
  iconsSrc: string;
}>();

const raceNames = computed(() =>
  Object.fromEntries(
    Object.values(racesData)
      .flat()
      .map(({ id, name }) => [id, name])
  )
);
const racesIcons = useIconsDataUri(
  iconsSrc,
  iconsCoords,
  Object.keys(raceNames.value)
);

const theme = useTheme();
const showPlaces = useStorageValue('showPlaces', false, Boolean);

const hasRepicksBans = computed(() => data.some((d) => d.banrate));

const sortVariants = computed(
  () =>
    [
      'default',
      'pickrate',
      'winrate',
      ...(hasRepicksBans.value
        ? (['repickrate', 'banrate'] as const)
        : ([] as const)),
    ] as const
);
const sortVariantsPlaces = ['default', 1, 2, 3, 4] as const;
const sortBy =
  ref<((typeof sortVariants)['value'] | typeof sortVariantsPlaces)[number]>(
    'default'
  );
const sortSelectItems = computed(() =>
  (showPlaces.value ? sortVariantsPlaces : sortVariants.value).map((value) => ({
    title: capitalize(String(value)),
    value,
  }))
);
watch(showPlaces, () => {
  sortBy.value = 'default';
});

const itemsData = computed(() => {
  const raceOrder = Object.keys(raceNames.value);
  const sortValue = sortBy.value;
  return data.slice().sort((a, b) => {
    if (sortValue === 'default') {
      return raceOrder.indexOf(a.race) - raceOrder.indexOf(b.race);
    }
    if (typeof sortValue === 'number') {
      return b.places[sortValue] - a.places[sortValue];
    }
    return b[sortValue] - a[sortValue];
  });
});

const placesSeries: BarSeriesOption[] = [
  '#81c784',
  '#dce775',
  '#ffb74d',
  '#e57373',
].map((color, idx) => ({
  name: `${idx + 1}`,
  type: 'bar',
  itemStyle: {
    color,
  },
}));

const metricSeries = computed(
  () =>
    [
      {
        name: 'Pickrate',
        type: 'bar',

        itemStyle: {
          color: theme.current.value.colors.primary,
        },
      },
      {
        name: 'Winrate',
        type: 'bar',
        itemStyle: {
          color: theme.current.value.colors.success,
        },
      },
      ...(hasRepicksBans.value
        ? ([
            {
              name: 'Repickrate',
              type: 'bar',
              itemStyle: {
                color: theme.current.value.colors.warning,
              },
            },
            {
              name: 'Banrate',
              type: 'bar',
              itemStyle: {
                color: theme.current.value.colors.error,
              },
            },
          ] satisfies BarSeriesOption[])
        : []),
    ] satisfies BarSeriesOption[]
);

const options = computed(() => {
  const dimensions = showPlaces.value
    ? ['race', '1', '2', '3', '4']
    : ['race', 'pickrate', 'winrate', 'repickrate', 'banrate'];

  const markLine: MarkLineComponentOption = {
    symbol: ['none', 'none'],
    data: [
      {
        yAxis: referenceLine.value,
        lineStyle: {
          type: 'dashed',
          color: theme.current.value.colors.success,
          width: 1,
        },
        emphasis: {
          disabled: true,
        },
      },
    ],
  };

  const series = showPlaces.value ? placesSeries : metricSeries.value;
  series[0] = {
    ...series[0],
    markLine,
  };

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
    legend: {
      type: 'plain',
      left: 0,
      top: 0,
      orient: 'horizontal',
    },
    dataset: {
      dimensions,
      source: itemsData.value.map(({ places, ...item }) => ({
        ...item,
        ...places,
      })),
      sourceHeader: false,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        interval: 0,
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
            ])
          ),
        },
      },
    },
    yAxis: {
      splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { formatter: '{value}%' },
    },
    dataZoom: [
      {
        type: 'slider',
        show: true,
        handleSize: 24,
        start: 0,
        end: 35,
        bottom: 10,
        height: 12,
        showDetail: false,
        handleLabel: {
          show: false,
        },
        labelFormatter: (idx) => raceNames.value[itemsData.value[idx].race],
        dataBackground: {
          areaStyle: {
            color: 'transparent',
          },
          lineStyle: {
            color: 'transparent',
          },
        },
        selectedDataBackground: {
          areaStyle: {
            color: 'transparent',
          },
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      {
        type: 'inside',
        zoomOnMouseWheel: false,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
    ],
    series,
  } satisfies EChartsOption;
});
</script>
