<template>
  <div class="container" v-if="isShow">
    <template v-if="arrayData.length > 1">
      <div class="d-flex align-center w-100 pr-1">
        <GameIcon
          :src="icons"
          :coords="iconTypes[icon]"
          width="24"
          :padding="[4, 4, 4, 4]"
          class="mr-2"
        />
        <div class="flex-grow-1 w-100 d-flex flex-wrap">
          <span
            v-for="(value, idx) in arrayData"
            :key="idx"
            class="text-no-wrap mr-2 mb-1"
          >
            Lv{{ idx + 1 }}: <span :class="itemClass">{{ value }}</span>
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-center">
        <GameIcon
          :src="icons"
          :coords="iconTypes[icon]"
          width="16"
          :padding="[4, 4, 4, 4]"
          class="mr-1"
        />
        <span :class="itemClass">{{ arrayData[0] }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: unknown | unknown[];
  icon: AssetsIconKey;
}

const [icons, iconTypes] = useAssets();

const { data, icon } = defineProps<Props>();

const arrayData = computed(() => [data].flat());

const isShow = computed(() => arrayData.value.some(Boolean));

const itemClass = computed(() => {
  switch (icon) {
    case 'gold':
    case 'bounty':
      return 'cost';
    case 'health':
    case 'attackSpeed':
      return 'text-white';

    default:
      return '';
  }
});
</script>

<style lang="css" scoped>
.container {
  display: flex;
  flex-flow: row wrap;
}
.container {
  color: #6a6666;
  margin: 0px 4px;
  font-size: 0.8em;
}
.container span.cost {
  font-size: 1.1em;
  color: #d8d347;
}
</style>
