<template>
  <v-badge
    dot
    color="primary"
    location="left top"
    class="details-badge"
    :model-value="hasDetails"
    @click="clickHandler"
    :class="{ 'cursor-pointer': hasDetails }"
  >
    <slot />
  </v-badge>
</template>

<script setup lang="ts" generic="T extends IBaseObject">
import { IS_TOUCH } from '~/consts';
import type { IBaseObject, IBonusObject, ISpellObject } from '~/data/types';

interface Props<T extends IBaseObject> {
  item: MaybeRef<T>;
}

const { item } = defineProps<Props<T>>();
defineSlots<{
  default(): any;
}>();
const setItem = inject<(val: IBaseObject | null) => void>('detailsSet');

const hasDetails = computed(() => {
  if (!setItem) return false;
  if (IS_TOUCH) return true;
  const itemVal = toValue(item);
  if (isBonusObject(itemVal)) {
    return Array<keyof IBonusObject>('units', 'upgrades', 'spells').some(
      (key) => key in itemVal && !!itemVal[key]?.length
    );
  }

  if (isUnitObject(itemVal) || isHeroObject(itemVal)) return true;

  // if (isSpellObject(itemVal)) {
  //   return Array<keyof ISpellObject>(
  //     'area',
  //     'cooldown',
  //     'cost',
  //     'duration',
  //     'summonUnit'
  //   ).some((key) => key in itemVal && !!itemVal[key]?.length);
  // }

  if (isUpgradeObject(itemVal)) {
    return !!itemVal.spells?.length;
  }

  return false;
});

const clickHandler = () => {
  if (!hasDetails.value) return;
  setItem?.(toValue(item));
};
</script>

<style lang="css" scoped>
.details-badge {
  width: 100%;
  height: 100%;
}
.details-badge::v-deep(.v-badge__wrapper) {
  width: 100%;
  height: 100%;
}
</style>
