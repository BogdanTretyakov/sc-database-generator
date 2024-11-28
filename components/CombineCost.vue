<template>
  <ClientOnly>
    <v-tooltip location="top">
      <template #activator="{ props }">
        <div class="d-flex align-center" v-bind="props">
          <GameIcon :src="icons" :coords="gold" width="16" />
          <span class="cost">{{ totalCost }}</span>
        </div>
      </template>
      <slot name="default">Total cost</slot>
    </v-tooltip>
  </ClientOnly>
</template>

<script setup lang="ts">
interface Props {
  items: MaybeRef<Array<{ cost?: number[] }>>;
  count?: number;
}

const [icons, { gold }] = useAssets();

const { count, items } = defineProps<Props>();

const totalCost = computed(() =>
  toValue(items).reduce((total, { cost }) => {
    return (
      total +
      (cost ?? [])?.slice(0, count).reduce((acc, i) => acc + (i ?? 0), 0)
    );
  }, 0)
);
</script>

<style lang="css" scoped>
.cost {
  font-size: 0.7em;
  color: #d8d347;
}
</style>
