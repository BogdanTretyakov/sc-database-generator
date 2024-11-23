<template>
  <div class="container">
    <template v-if="Array.isArray(cost)">
      <span v-for="(value, idx) in cost" :key="idx"
        >Lv{{ idx + 1 }}: <span>{{ value }}</span></span
      >
    </template>
    <template v-else>
      <span
        ><span>{{ cost }}</span></span
      >
    </template>
  </div>
</template>
<script setup lang="ts">
interface Props {
  cost: number | number[];
}

const { cost } = defineProps<Props>();
</script>

<style lang="css" scoped>
.container {
  display: flex;
  flex-flow: row wrap;
}
.container > span {
  color: #6a6666;
  margin: 0px 4px;
  font-size: 0.7rem;
}
.container > span > span {
  color: #d8d347;
}
</style>
