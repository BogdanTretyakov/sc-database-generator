<template>
  <div class="text-subtitle-1" v-html="item.name" />

  <template v-if="isArtifactObject(item)">
    <div class="text-caption">
      Obtain at
      <span class="text-yellow">{{ item.level }}</span> level
    </div>
  </template>

  <div
    v-if="isHeroObject(item)"
    class="text-subtitle-1"
    v-html="item.fullName"
  />

  <template
    v-if="
      (isUnitObject(item) || isHeroObject(item)) && (item.cost || item.bounty)
    "
  >
    <v-row no-gutters>
      <v-col v-if="item.cost" cols="&">
        <WarArrayInfo :data="item.cost" icon="gold" />
      </v-col>
      <v-col v-if="item.bounty" cols="&">
        <WarArrayInfo :data="item.bounty" icon="bounty" />
      </v-col>
    </v-row>
  </template>

  <template v-if="isUpgradeObject(item)">
    <WarArrayInfo v-if="item.cost?.length" :data="item.cost" icon="gold" />
    <WarArrayInfo v-if="item.timers?.length" :data="item.timers" icon="time" />
  </template>

  <template v-if="isUnitObject(item) || isHeroObject(item)">
    <v-row no-gutters>
      <v-col cols="6" v-if="item.atk || item.atkType">
        <AttackDefend :type="item.atkType" :value="item.atk" :size="24" />
      </v-col>
      <v-col cols="6" v-if="item.def || item.defType">
        <AttackDefend
          :type="item.defType"
          :value="item.def"
          is-defend
          :size="24"
        />
      </v-col>
      <v-col class="d-flex align-center" cols="6" v-if="item.atkSpeed">
        <WarArrayInfo
          :data="`${item.atkSpeed.toFixed(2)} BCD`"
          icon="attackSpeed"
        />
      </v-col>
      <v-col class="d-flex align-center" cols="6" v-if="item.hp">
        <WarArrayInfo :data="item.hp" icon="health" />
      </v-col>
    </v-row>
  </template>

  <template v-if="isSpellObject(item)">
    <WarArrayInfo
      v-if="item.cooldown?.length"
      :data="item.cooldown"
      icon="cooldown"
      class="my-1"
    />
    <WarArrayInfo
      v-if="item.cost?.length"
      :data="item.cost"
      icon="mana"
      class="my-1"
    />
    <WarArrayInfo
      v-if="item.area?.length"
      :data="item.area"
      icon="range"
      class="my-1"
    />
    <div v-if="item.targets?.length" class="d-flex flex-wrap">
      <div class="text-subtitle-2">Targets:</div>
      <v-chip
        v-for="target in item.targets"
        density="compact"
        size="small"
        class="mx-1 mb-1"
      >
        {{ target }}
      </v-chip>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { IBaseObject } from '~/data/types';
import {
  isUnitObject,
  isHeroObject,
  isSpellObject,
  isUpgradeObject,
  isArtifactObject,
} from '~/utils/guards';

interface Props {
  item: IBaseObject;
}

const { item } = defineProps<Props>();
</script>
