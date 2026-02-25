<template>
  <v-autocomplete
    :label="label"
    v-model="modelValue"
    v-model:search="search"
    :loading="loading"
    :items="items"
    autocomplete="off"
    hide-details
    density="compact"
    clearable
    variant="outlined"
    item-title="name"
    item-value="id"
    hide-no-data
    placeholder="Start type nickname"
  >
    <template v-slot:item="{ props, item }">
      <v-list-item density="comfortable" v-bind="props">
        <v-list-item-subtitle
          v-if="item.raw.name in playerNicknames"
          class="text-white"
        >
          {{ playerNicknames[item.raw.name] }}
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          {{ item.raw.platform }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
type ServerPlayer = {
  id: number;
  name: string;
  platform: string;
};

const playerNicknames: Record<string, string> = {
  'FODD#11256': 'Wiki developer',
  'CrazyFly#2731': 'Тупой хуесосик',
  'ПышныйБосс#2287': 'Cool player',
  'theMOA#2185': 'World best player',
  'snupi#21238': 'Hope of the barracks',
  'opaca#1428': 'Brazilian pawn shop',
  'Krabster#2533': 'Главный по кастрюлькам',
  'OUTSDORF#2608': 'True skill',
};

const { label = 'Player name' } = defineProps<{
  label?: string;
}>();

const modelValue = defineModel<number>();

const runtimeConfig = useRuntimeConfig();

const search = ref<string | undefined>(void 0);
const items = ref<ServerPlayer[]>([]);
const loading = ref(false);

watch(modelValue, (newId: number | undefined | null) => {
  if (newId === undefined || newId === null) return;

  const found = items.value.some((item) => item.id === newId);
  if (found) return;

  loading.value = true;
  const url = new URL(`/match/player/${newId}`, runtimeConfig.public.backendUrl)
  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Player fetch failed: ${res.status}`);
      return res.json();
    })
    .then((data: ServerPlayer) => {
      if (data && data.id) {
        items.value.push(data);
      }
    })
    .catch((err) => console.error(err))
    .finally(() => {
      loading.value = false;
    });
}, { immediate: true });

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
  },
);
</script>
