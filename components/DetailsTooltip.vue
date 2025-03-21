<template>
  <WarTooltip :src="src" :coords="coords" :description="item.description">
    <template #tooltip>
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

      <WarArrayInfo
        v-if="isUnitObject(item) || isHeroObject(item) || isUpgradeObject(item)"
        :data="item.cost"
        icon="gold"
      />

      <template v-if="isUnitObject(item)">
        <div class="d-flex flex-no-wrap my-1">
          <AttackDefend
            :type="item.atkType"
            :value="item.atk"
            :size="24"
            class="flex-grow-1"
          />
          <AttackDefend
            :type="item.defType"
            :value="item.def"
            is-defend
            :size="24"
            class="flex-grow-1"
          />
        </div>
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
  </WarTooltip>
</template>

<script setup lang="ts">
import type { IBaseObject } from '~/data/types';
import type { IconBoundaries } from './GameIcon.vue';

interface Props {
  item: IBaseObject;
  src: string;
  coords: IconBoundaries | IconBoundaries[];
}

const { item, src, coords } = defineProps<Props>();
</script>
