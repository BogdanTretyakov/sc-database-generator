<template>
  <v-autocomplete
    :label="label"
    v-model:search="search"
    :loading="loading"
    :items="items"
    autocomplete="off"
    hide-details
    density="compact"
    clearable
    variant="outlined"
    @update:model-value="(value) => emit('model-value', value?.id)"
    item-title="name"
    item-value="id"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item
        density="comfortable"
        v-bind="props"
        :subtitle="item.raw.platform"
        :title="item.raw.name"
      ></v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
type ServerPlayer = {
  id: number;
  name: string;
  platform: string;
};

const { label = 'Player name' } = defineProps<{
  label?: string;
}>();

const emit = defineEmits<{
  (e: 'model-value', value: number | undefined): void;
}>();

const runtimeConfig = useRuntimeConfig();

const search = ref<string | undefined>(void 0);
const items = ref<ServerPlayer[]>([]);
const loading = ref(false);

watchEffect(
  (onCleanup) => {
    if (!search.value) return;
    const abort = new AbortController();
    onCleanup(() => abort.abort());
    const url = new URL('/match/players', runtimeConfig.public.backendUrl);
    url.searchParams.set('name', search.value ?? '');
    loading.value = true;
    fetch(url, { signal: abort.signal })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          items.value = data;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  },
  {
    flush: 'post',
  }
);
</script>
