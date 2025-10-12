declare module 'nuxt' {
  interface NuxtApp {
    $fetchStats: typeof $fetch;
  }
}

declare global {
  var $fetchStats: typeof $fetch;
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  globalThis.$fetchStats = $fetch.create({
    baseURL: config.public.backendUrl,
  });

  nuxtApp.provide('$fetchStats', globalThis.$fetchStats);
});
