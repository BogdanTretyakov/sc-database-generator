<template>
  <div class="d-flex flex-column">
    <!-- <v-checkbox
      :model-value="combinedBounty"
      label="Show estimate"
      class="ml-auto"
    /> -->
    <v-data-table
      :headers="tableData.headers"
      :items="tableData.items"
      disable-sort
      hide-default-footer
      class="bounty-table"
      density="compact"
    >
      <template #item.type="{ value }">
        {{ value in tableTitles ? tableTitles[value] : capitalize(value) }}
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import type { IBounty } from '~/data/types';

interface Props {
  bounty: Record<string, IBounty>;
}

const { bounty } = defineProps<Props>();

const tableTitles = {
  su: 'SU',
  siege: 'T2 melee',
};

const keysOrder = [
  'su',
  'hero',
  'catapult',
  'air',
  'siege',
  'mage',
  'range',
  'melee',
];

const keysSort = (a: string, b: string): number => {
  return keysOrder.indexOf(b) - keysOrder.indexOf(a);
};

const combinedBounty = ref(true);

const tableData = computed(() => {
  if (combinedBounty.value) {
    const bountyValues = Object.values(bounty);
    const barracksValues = bountyValues
      .reduce((acc, { barracks }) => {
        barracks.map(Number).forEach((val, i) => {
          acc[i] = [...(acc[i] ?? []), val];
        });
        return acc;
      }, Array<number[]>())
      .map((values) =>
        Math.floor(values.reduce((acc, val) => acc + val, 0) / values.length)
      )
      .join('/');
    const rawValues = bountyValues.reduce((acc, record) => {
      Object.entries(record).forEach(([key, value]) => {
        if (key === 'barracks') return;
        if (!(key in acc)) {
          acc[key] = [];
        }
        if (Array.isArray(value)) {
          value.forEach((i) => {
            acc[key].push(Number(i));
          });
        } else {
          acc[key].push(Number(value));
        }
      });
      return acc;
    }, {} as Record<string, number[]>);
    const computedValues: Record<string, string> = {
      barracks: barracksValues,
      ...mapObject(
        rawValues,
        (value) =>
          '~' + Math.floor(value.reduce((acc, i) => acc + i, 0) / value.length)
      ),
    };
    const headers = [
      {
        title: '',
        key: 'type',
      },
      {
        title: 'All races',
        key: 'allRaces',
      },
    ];
    return {
      headers,
      items: Object.keys(computedValues)
        .sort(keysSort)
        .map((key) => ({
          type: key,
          allRaces: computedValues[key],
        })),
    };
  } else {
    return {
      headers: [],
      items: [],
    };
  }
});
</script>

<style lang="css" scoped>
.bounty-table {
  background-color: transparent;
}
</style>
