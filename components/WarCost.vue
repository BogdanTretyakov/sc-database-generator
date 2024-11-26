<template>
  <div class="container">
    <template v-if="Array.isArray(cost)">
      <div class="d-flex align-center w-100 pr-1">
        <GameIcon
          :src="icons"
          :coords="gold"
          width="24"
          :padding="[4, 4, 4, 4]"
          class="mr-2"
        />
        <div class="flex-grow-1 w-100">
          <span
            v-for="(value, idx) in cost"
            :key="idx"
            class="text-no-wrap mr-1"
          >
            Lv{{ idx + 1 }}: <span class="cost">{{ value }}</span>
          </span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="d-flex align-center">
        <GameIcon
          :src="icons"
          :coords="gold"
          width="16"
          :padding="[4, 4, 4, 4]"
          class="mr-1"
        />
        <span class="cost">{{ cost }}</span>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
interface Props {
  cost: number | number[];
}

const [icons, { gold }] = useAssets();

const { cost } = defineProps<Props>();
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
