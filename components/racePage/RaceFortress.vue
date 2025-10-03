<template>
  <CCard
    title="Fortress"
    class="d-flex flex-column justify-start"
    :full-height="false"
    id="fortress"
  >
    <template #title>
      <DetailsWrapper hide-dot :item="race.buildings.fort[0]">
        <v-btn size="large" class="mx-auto" variant="text" color="yellow">
          <b>Fortress</b>
        </v-btn>
      </DetailsWrapper>
    </template>
    <template #prependHead>
      <AttackDefend
        key="fort-attack"
        class="ml-1"
        :type="race.buildings.fort[0].atkType"
      />
    </template>
    <template #appendHead>
      <CombineCost key="fort-cost" class="mr-1" :items="researches" />
    </template>
    <DividerLabel class="mb-2 mt-n6">
      <span class="mx-2 text-caption text-grey">Auras</span>
    </DividerLabel>
    <WarGrid class="mx-auto" :items="race.auras" v-slot="{ item }">
      <DetailsTooltip
        :item="item"
        :src="icons"
        :coords="iconProps(item.id)"
        :class="[
          'selectable-item',
          {
            depressed: hover && !hover.includes(item.id),
          },
        ]"
      />
    </WarGrid>

    <DividerLabel class="mb-1">
      <span class="mx-2 text-caption text-grey">Upgrades</span>
    </DividerLabel>
    <WarGrid class="mx-auto" :items="researches" v-slot="{ item }">
      <DetailsTooltip
        :item="item"
        :src="icons"
        :coords="
          !('level' in item) || (item.iconsCount ?? 0) <= 1
            ? iconProps(item.id, item.iconsCount)
            : iconProps(`${item.id}-${item.level}`)
        "
        :class="[
          'selectable-item',
          {
            depressed: hover && !hover.includes(item.id),
          },
        ]"
        @mouseenter="() => setHover(item)"
        @mouseout="() => (hover = undefined)"
      />
    </WarGrid>

    <DividerLabel class="mb-1">
      <span class="mx-2 text-caption text-grey">Skills</span>
    </DividerLabel>

    <WarGrid class="mx-auto" :items="spells" v-slot="{ item }">
      <DetailsTooltip
        v-if="isSpellObject(item)"
        :item="item"
        :src="icons"
        :coords="iconProps(item.id)"
        :class="[
          'selectable-item',
          {
            depressed: hover && !hover.includes(item.id),
          },
        ]"
      />
      <WarTooltip v-else :src="icons" :coords="iconProps(item.id)">
        <template #tooltip>
          <div class="text-h6">
            Precision UW: <span v-html="item.name.replace(/\[.+\]/g, '')" />
          </div>
          <br />
          <template v-if="'damageTime' in item">
            <div class="text-subtitle-1">
              Time to full damage:
              <span class="text-yellow">{{
                item.damageTime == 0 ? 'Instant' : item.damageTime + 's'
              }}</span>
            </div>
          </template>
          <template v-if="'stealInterrupt' in item">
            <div class="text-subtitle-1">
              Interrupts mana steal:
              <span :class="item.stealInterrupt ? 'text-green' : 'text-red'">
                {{ item.stealInterrupt ? 'Yes' : 'No' }}
              </span>
              <span v-if="item.fakeStealInterrupt" class="text-green">
                (+ Decoy UW)
              </span>
            </div>
          </template>
        </template>
      </WarTooltip>
    </WarGrid>
  </CCard>
</template>

<script setup lang="ts">
import type {
  IRaceData,
  IRaceUltimateData,
  IUpgradeObject,
} from '~/data/types';
import type { IconBoundaries } from '../GameIcon.vue';
import { DetailsTooltip } from '#components';

interface Props {
  race: IRaceData;
  icons: string;
  iconProps(id: string, count?: number): IconBoundaries | IconBoundaries[];
}
const { race, icons, iconProps } = defineProps<Props>();

const hover = inject<Ref<undefined | string[]>>('hover', ref());

const spells = computed(() => {
  const ultimate =
    race.ultiData ??
    (isNotNil(race.ultimateId)
      ? ({
          type: 'ultimate',
          id: race.ultimateId,
          hotkey: 'V',
          name: '',
        } satisfies IRaceUltimateData)
      : undefined);
  return [race.t1spell, race.t2spell, ultimate].filter(isNotNil);
});

const researches = computed<Array<IUpgradeObject>>(() => {
  return race.magic
    .map((magic, idx) => ({
      ...magic,
      hotkey: hotkeys[idx],
    }))
    .concat(...Object.values(race.baseUpgrades));
});

const setHover = (item: IUpgradeObject) => {
  const units = Object.values(race.units)
    .filter(({ upgrades }) => upgrades?.includes(item.id))
    .map(({ id }) => id);
  hover.value = [item.id, ...units];
};
</script>
