<template>
  <slot name="fullname" />
  <div class="d-flex row-warp align-center my-1" v-if="tags.length">
    <div class="text-subtitle-2">Tags:</div>
    <v-chip
      v-for="tag in tags"
      class="ma-1 mr-0"
      density="compact"
      size="small"
    >
      {{ tag }}
    </v-chip>
  </div>
  <v-row class="my-1">
    <v-col cols="6" class="d-flex align-center py-0">
      <WarTooltip :src="icons" :coords="gold" width="32" description="Cost">
      </WarTooltip>
      <span class="ml-2 mt-n1">{{ item.cost }}</span>
    </v-col>
    <v-col cols="6" class="d-flex align-center py-0">
      <WarTooltip
        :src="icons"
        :coords="bounty"
        width="32"
        description="Kill bounty"
      >
      </WarTooltip>
      <span class="ml-2 mt-n1">{{ item.bounty }}</span>
    </v-col>
  </v-row>
  <v-expansion-panels elevation="0" static tile multiple v-model="panels">
    <v-expansion-panel
      v-if="item.description"
      title="Description"
      value="description"
    >
      <v-expansion-panel-text>
        <div class="text-body-2" v-html="item.description" />
      </v-expansion-panel-text>
    </v-expansion-panel>
    <slot name="heroItems" />
    <v-expansion-panel title="Characteristics" value="characteristics">
      <v-expansion-panel-text>
        <v-row class="my-1">
          <v-col cols="6" class="text-center pt-0">
            <div class="text-white bg-red mx-2 rounded-lg">
              <b>{{ item.hp }}</b
              ><template v-if="hasHpReg">&nbsp;+{{ item.hpReg }}/sec</template>
            </div>
          </v-col>
          <v-col cols="6" class="text-center pt-0">
            <div class="text-white bg-blue mx-2 rounded-lg">
              <b>{{ item.mp }}</b
              ><template v-if="hasMpReg">&nbsp;+{{ item.mpReg }}/sec</template>
            </div>
          </v-col>
          <v-col cols="6" class="py-0">
            <AttackDefend :type="item.atkType" :value="item.atk" />
            <div class="d-flex align-center">
              <WarTooltip
                :src="icons"
                :coords="range"
                width="32"
                description="Attack range"
              >
              </WarTooltip>
              <span class="ml-2 mt-n1"
                >{{ item.atkRange
                }}{{ item.weaponType === 'normal' ? ' (melee)' : '' }}</span
              >
            </div>
            <div class="d-flex align-center" v-if="item.atkSpeed">
              <WarTooltip
                :src="icons"
                :coords="attackSpeed"
                width="32"
                description="Attack speed"
              >
              </WarTooltip>
              <span class="ml-2 mt-n1">{{ item.atkSpeed.toFixed(2) }} BCD</span>
            </div>
          </v-col>
          <v-col cols="6" class="py-0">
            <AttackDefend :type="item.defType" :value="item.def" is-defend />
          </v-col>
          <slot name="attributes" />
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>
    <v-expansion-panel
      v-if="!!requires?.length"
      title="Upgrades used"
      value="upgrades"
    >
      <v-expansion-panel-text>
        <div class="upgrades-wrapper">
          <DetailsTooltip
            v-for="upgrade in requires"
            :item="upgrade"
            :src="iconsSrc"
            :coords="iconProps(upgrade.id, upgrade.iconsCount)"
          >
          </DetailsTooltip>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import capitalize from 'lodash/capitalize';
import type { GetObjectFunction, IUnitObject } from '~/data/types';
import { tagsReplaces } from '~/types/app';

interface Props {
  item: IUnitObject;
}

const panels = ref(['characteristics', 'upgrades', 'items']);

const [icons, { gold, bounty, range, attackSpeed }] = useAssets();
const raceName = inject<string>('raceName')!;
const { iconProps, iconsSrc } = await useRaceData(raceName);
const { item } = defineProps<Props>();
const objFinder = inject<GetObjectFunction>('objFinder')!;

const hasHpReg = computed(() => !isNaN(Number(item.hpReg)));
const hasMpReg = computed(() => !isNaN(Number(item.mpReg)));

const requires = computed(() =>
  item.upgrades?.map((id) => objFinder('upgrade', id)).filter(isNotNil)
);

const tags = computed(() =>
  (item.tags ?? []).map((tag) => tagsReplaces[tag] ?? tag).map(capitalize)
);
</script>

<style scoped>
.upgrades-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, 48px);
  gap: 8px;
}
</style>
