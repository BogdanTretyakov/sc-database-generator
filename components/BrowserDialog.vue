<template>
  <v-dialog :model-value="show" max-width="80vw" width="600px" persistent>
    <v-card>
      <v-card-title> Your browser is not supported </v-card-title>
      <v-card-text>
        <p>
          We are support only last version of Chrome browser (or same engine,
          like Opera/Brave/Yandex/e.t.c.). There will be picture view issues in
          your browser.
        </p>
        <p>
          We are don't care about non-Chrome users, but you may
          <v-btn
            href="https://github.com/BogdanTretyakov/sc-database-generator/blob/master/components/GameIcon.vue"
            target="_blank"
            variant="text"
            density="comfortable"
            size="small"
            color="blue"
          >
            help with PR </v-btn
          >, cause we won't do that.
        </p>
      </v-card-text>
      <v-card-actions class="text-center">
        <v-btn color="primary" variant="tonal" @click="() => (show = false)"
          >Got it</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
const show = ref(
  !globalThis?.CSS?.supports('object-view-box: xywh(1px 1px 1px 1px)')
);
</script>
