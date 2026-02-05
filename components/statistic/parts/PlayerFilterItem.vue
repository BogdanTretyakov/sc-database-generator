<template>
  <div class="d-flex flex-column gap-4">
    <div >
      <PlayerSearch
        v-model="modelValue.playerId"
        label="Player Name"
        @update:model-value="update"
      />
    </div>
    <div >
      <v-select
        v-model="modelValue.race"
        label="Race"
        :items="races"
        density="compact"
        clearable
        hide-details
        variant="outlined"
        item-title="name"
        item-value="id"
        @update:model-value="update"
      >
        <template #item="{ item, props }">
          <v-list-item
            v-bind="props"
          >
            <template #prepend>
              <GameIcon
                :src="racesData.iconsSrc"
                :coords="racesData.iconProps(item.raw.id)"
                width="32"
                class="mr-2"
              />
            </template>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <GameIcon
            :src="racesData.iconsSrc"
            :coords="racesData.iconProps(item.raw.id)"
            width="24"
            class="mr-2"
          />
          <v-list-item-title v-html="item.raw.name"/>

        </template>
      </v-select>
    </div>
    <div >
      <v-select
        v-model="modelValue.bonus"
        label="Bonus"
        :disabled="!modelValue.race"
        :items="bonuses"
        clearable
        density="compact"
        hide-details
        variant="outlined"
        item-title="name"
        item-value="id"
        @update:model-value="update"
      >
      <template #item="{ item, props }">
          <v-list-item
            v-bind="props"
            title=""
          >
            <v-list-item-title v-html="item.raw.name"/>
            <template #prepend>
              <GameIcon
                :src="selectedRaceData?.iconsSrc ?? ''"
                :coords="selectedRaceData?.iconProps(item.raw.id) ?? racesData.iconProps(item.raw.id)"
                width="32"
                class="mr-2"
              />
            </template>
          </v-list-item>
        </template>
        <template #selection="{ item }">
          <GameIcon
            :src="selectedRaceData?.iconsSrc ?? ''"
            :coords="selectedRaceData?.iconProps(item.raw.id) ?? racesData.iconProps(item.raw.id)"
            width="24"
            class="mr-2"
          />
          <v-list-item-title v-html="item.raw.name"/>

        </template>
      </v-select>
    </div>
    <div >
      <v-select
        v-model="modelValue.place"
        label="Place"
        :items="places"
        density="compact"
        hide-details
        variant="outlined"
        clearable
        @update:model-value="update"
      ></v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IBonusObject, IRaceData, IRacePickerObject } from '~/data/types';
import PlayerSearch from './PlayerSearch.vue';
import type { PlayerFilter } from '~/types/statistic';

const props = defineProps<{
  modelValue: PlayerFilter;
  type: string;
  version: string;
}>();

const racesData = await useRaceData<Record<string, IRacePickerObject[]>>('races', props.type, props.version);


const emit = defineEmits<{
  (e: 'update:modelValue', value: PlayerFilter): void;
}>();

const update = () => {
  emit('update:modelValue', props.modelValue);
};

const races = computed(() =>
  Object.values(racesData.raceData).flat()
)

const selectedRaceData = ref<null|IRaceDataReturn<IRaceData>>(null)

const bonuses = computed(() => selectedRaceData.value?.raceData.bonuses ?? [])

watch(() => props.modelValue.race, async (value) => {
  props.modelValue.bonus = undefined
  const selectedRaceKey = races.value.find(r => r.id === value)?.key
  if (!selectedRaceKey) {
    selectedRaceData.value = null
    return
  }
  selectedRaceData.value = await useRaceData(selectedRaceKey, props.type, props.version)

})

const places = [1, 2, 3, 4];
</script>
