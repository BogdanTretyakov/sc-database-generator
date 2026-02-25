<template>
  <div class="d-flex gap-2">
    <v-text-field
      v-model="searchId"
      label="Match url or ID"
      variant="outlined"
      density="compact"
      hide-details
      width="200"
      clearable
      autocomplete="off"
    >
    </v-text-field>
    <v-btn
      :disabled="!matchData.platform || !matchData.platformId"
      color="primary"
      :variant="!matchData.platform || !matchData.platformId ? 'outlined' : 'flat'"
      @click="searchMatch"
    >
      Go
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import noop from 'lodash/noop';

const router = useRouter();

const searchId = ref('');
const timeout = ref<ReturnType<typeof setTimeout>>(setTimeout(noop, 0));
const matchData = ref({ platform: '', platformId: '' });

const searchMatch = () => {
  router.push({ name: 'MatchDetails', params: { platform: matchData.value.platform, id: matchData.value.platformId } });
}

watch(() => searchId.value, (value) => {
  matchData.value = { platform: '', platformId: '' };
  clearTimeout(timeout.value);
  timeout.value = setTimeout(() => {
    const [w3cId] = value.match(/[0-9a-f]{24}/) ?? [];
    if (w3cId) {
      matchData.value = { platform: 'W3Champions', platformId: w3cId };
    }
    const [internalId] = value.match(/^\d+$/) ?? [];
    if (internalId) {
      matchData.value = { platform: 'internal', platformId: internalId };
    }
  }, 200);
})
</script>