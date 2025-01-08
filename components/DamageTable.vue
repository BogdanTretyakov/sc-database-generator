<template>
  <v-data-table
    :headers="headers"
    :items="items"
    hide-default-footer
    disable-sort
    class="damage-table"
  >
    <template
      v-for="header in headers"
      v-slot:[`header.${header.key}`]="{ column }"
    >
      <template v-if="'icon' in column">
        <div style="width: 32px">
          <WarTooltip
            :description="column.title ?? ''"
            :src="icons"
            :coords="column.icon"
            :padding="[0, 8, 8, 0]"
          />
        </div>
      </template>
    </template>
    <template #item.type="{ value }">
      <div style="width: 32px">
        <WarTooltip
          :description="capitalize(value ?? '')"
          :src="icons"
          :coords="iconsCoords[value] ?? iconsCoords[`a${value}`]"
          :padding="[0, 8, 8, 0]"
        />
      </div>
    </template>
    <template
      v-for="header in headers.slice(1)"
      v-slot:[`item.${header.key}`]="{ value }"
    >
      <span
        :class="{
          'text-red': value < 100,
          'text-green': value > 100,
          'text-yellow': value == 100,
        }"
      >
        {{ value }}
      </span>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import type { IPatchDamage, IDamageTuple } from '~/data/types';

const [icons, iconsCoords] = useAssets();

interface Props {
  damage: IPatchDamage;
}

const { damage } = defineProps<Props>();

const headers = computed(() => [
  {
    title: 'Type',
    key: 'type',
  },
  {
    title: 'Light',
    key: 'light',
    icon: iconsCoords.light,
  },
  {
    title: 'Medium',
    key: 'medium',
    icon: iconsCoords.medium,
  },
  {
    title: 'Heavy',
    key: 'heavy',
    icon: iconsCoords.heavy,
  },
  {
    title: 'Fortified',
    key: 'fortified',
    icon: iconsCoords.fortified,
  },
  {
    title: 'Hero',
    key: 'hero',
    icon: iconsCoords.dhero,
  },
  {
    title: 'Divine',
    key: 'divine',
    icon: iconsCoords.divine,
  },
]);

const items = computed(() =>
  Object.entries(damage).map(
    ([
      type,
      [light, medium, heavy, fortified, normal, hero, divine, unarmored],
    ]) => ({
      type,
      light,
      medium,
      heavy,
      fortified,
      hero,
      divine,
    })
  )
);
</script>

<style lang="css" scoped>
.damage-table {
  background-color: transparent;
}
</style>
