<template>
  <div>
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
        style="height: 390px; width: 100%"
        :option="options"
        autoresize
        :loading="false"
      >
        <template #tooltip="params">
          <template v-if="Array.isArray(params)">
            <div class="d-flex align-center mb-2">
              <span class="mr-4 text-subtitle-1">{{
                bonusNames[params[0].name]
              }}</span>
              <img
                width="38"
                :src="bonusIcons[params[0].name]"
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
              Tracked matches: {{ params[0].value?.matchesCount }}
            </div>
          </template>
        </template>
      </VChart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import type { RaceBonusStatistic } from '~/types/statistic';
import type { IRaceData, IRaceIcons } from '~/data/types';
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

function extractName(s: string) {
  var span = document.createElement('span');
  span.innerHTML = s;
  const output = span.textContent || span.innerText;
  return output.replace(/\[.+?\]/, '').trim();
}

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
  racesData: IRaceData;
  data: RaceBonusStatistic[];
  iconsCoords: IRaceIcons;
  iconsSrc: string;
}>();

const bonusNames = computed(() =>
  Object.fromEntries(
    racesData.bonuses
      .slice()
      .sort(({ hotkey: h1 }, { hotkey: h2 }) => {
        return hotkeys.indexOf(h1) - hotkeys.indexOf(h2);
      })
      .map(({ id, name }) => [id, extractName(name)]),
  ),
);
const bonusIcons = useIconsDataUri(
  iconsSrc,
  iconsCoords,
  racesData.bonuses.map(({ id }) => id),
);

const theme = useTheme();
const showPlaces = useStorageValue('showPlaces', false, Boolean);

const sortVariants = computed(
  () => ['default', 'pickrate', 'winrate'] as const,
);
const sortVariantsPlaces = ['default', 1, 2, 3, 4] as const;
const sortBy =
  ref<((typeof sortVariants)['value'] | typeof sortVariantsPlaces)[number]>(
    'winrate',
  );
const sortSelectItems = computed(() =>
  (showPlaces.value ? sortVariantsPlaces : sortVariants.value).map((value) => ({
    title: capitalize(String(value)),
    value,
  })),
);
watch(showPlaces, (val) => {
  sortBy.value = val ? 1 : 'winrate';
});

const itemsData = computed(() => {
  const bonusOrder = Object.keys(bonusNames.value);
  const sortValue = sortBy.value;
  return data
    .slice()
    .filter(({ bonus }) => bonusOrder.includes(bonus))
    .sort((a, b) => {
      if (sortValue === 'default') {
        return bonusOrder.indexOf(a.bonus) - bonusOrder.indexOf(b.bonus);
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
    ] satisfies BarSeriesOption[],
);

const options = computed(() => {
  const dimensions = showPlaces.value
    ? ['bonus', '1', '2', '3', '4']
    : ['bonus', 'pickrate', 'winrate'];

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
      {
        yAxis: 100 / 12,
        emphasis: { disabled: true },
        lineStyle: {
          type: 'dashed',
          color: theme.current.value.colors.info,
          width: 1,
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
        rotate: -25,
        margin: 35,
        align: 'center',
        formatter: (value: string) =>
          [`{${value}|}`, bonusNames.value[value]].join('\n'),
        rich: {
          ...Object.fromEntries(
            Object.entries(bonusIcons.value).map(([raceId, image]) => [
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
    series,
  } satisfies EChartsOption;
});
</script>
